from fastapi import  WebSocket, WebSocketDisconnect
from pydantic import ValidationError, TypeAdapter
from typing import Callable, Any, Tuple
from datetime import datetime
import uuid
import asyncio

from message_types import *
from user_database import *
from validation import *

QUEUE_MAX_SIZE = 50
GLOBAL_ROOM_NAME = "Global"

class Storage:
    def __init__(self):
         # In-memory storage, maps room_name to the rooms' chat messages
        self.chat_messages: Dict[str, List[Dict]] = { GLOBAL_ROOM_NAME: [] }
        # Maps room_name to the rooms' WebSocketManager
        self.managers: Dict[str, WebSocketManager] = {}
        self.all_users: Dict[str, Any] = {}

    def is_username_taken(self, username: str) -> bool:
        return username in self.all_users
    def add_user(self, user: Any):
        self.all_users[user.username] = user
        return user
    def remove_user(self, username: str):
        if username in self.all_users:
            self.all_users.pop(username)

    def get_chat_messages(self, room_name: str):
        if room_name not in self.chat_messages:
            self.chat_messages[room_name] = []
        return self.chat_messages[room_name]
    def add_to_chat(self, room_name: str, message: Dict):
        if room_name not in self.chat_messages:
            self.chat_messages[room_name] = []
        self.chat_messages[room_name].append(message)
    def clear_chat(self, room_name: str):
        self.chat_messages[room_name] = []

    def get_manager(self, room_name: str):
        room_is_new = False
        if room_name not in self.managers:
            self.managers[room_name] = WebSocketManager(room_name, UserDatabase())
            room_is_new = True
            print(f"Created new room: {room_name}")
        return (self.managers[room_name], room_is_new)

storage = Storage()

class WebSocketConnection:
    def __init__(self, websocket: WebSocket, uuid: str, username: str, broadcast_func: Callable):
        self.websocket = websocket
        self.user_uuid = uuid
        self.username = username
        self.broadcast_func = broadcast_func

        self.delivery_queue = asyncio.Queue(maxsize=QUEUE_MAX_SIZE)
        self.sender_task = asyncio.create_task(self.sender_loop())
        self.closed = False
        self.join_time = datetime.now()

    def id(self) -> str:
        return f"'{self.username}' ({self.user_uuid})"

    async def sender_loop(self):
        try:
            while True:
                message_json = await self.delivery_queue.get()
                try:
                    await self.websocket.send_text(message_json)
                finally:
                    self.delivery_queue.task_done()
        except asyncio.CancelledError:
            print("Sender loop cancelled")
        except Exception as e:
            print(f"Error sending message: {e}")
        finally:
            print(f"Sender loop finished for {self.id()}")

    async def receive_loop(self) -> None | WsRoomSwitchRequest:
        try:
            while True:
                user_msg = await self.websocket.receive_text()
                if not user_msg:
                    print(f"Received empty message from {self.id()}, ignoring")
                    continue

                try:
                    user_msg = TypeAdapter(WsEvent).validate_json(user_msg)
                except ValidationError as e:
                    print(f"Invalid message {e}")
                    await self.websocket.send_text(
                        WsSystemMessage(
                            message="Invalid message format",
                            severity="error"
                        ).model_dump_json()
                    )
                    continue

                if isinstance(user_msg, WsMessage):
                    await self.send_message(user_msg)
                elif isinstance(user_msg, WsTypingEvent):
                    await self.broadcast_func(self, user_msg)
                elif isinstance(user_msg, WsRoomSwitchRequest):
                    return user_msg
                elif isinstance(user_msg, WsRoomCreate):
                    room_validation = validate_room_name(user_msg.room.room_name)
                    if room_validation  != "":
                        await self.websocket.send_text(WsSystemMessage(message=f"{self.username} tried creating a room with an invalid name: {room_validation}", severity="error").model_dump_json())
                        continue
                    (_, room_is_new) = await create_and_broadcast_new_room(user_msg.room.room_name, self.username)
                    if not room_is_new:
                        await self.websocket.send_text(WsSystemMessage(message=f"{self.username} tried creating a room that already exists!", severity="error").model_dump_json())
                elif isinstance(user_msg, WsRoomChatClear):
                    if user_msg.room_name == GLOBAL_ROOM_NAME:
                        await self.broadcast_func(self, WsSystemMessage(message=f"{self.username} tried clearing the global room!", severity="error"))
                        continue
                    storage.clear_chat(user_msg.room_name)
                    await self.broadcast_func(self, WsRoomChatClear(room_name=user_msg.room_name, username=self.username))
                    if self.username != user_msg.username:
                        await self.broadcast_func(self, WsSystemMessage(message=f"{self.username} tried clearing the chat as {user_msg.username}", severity="warning"))
                else:
                    print(f"Got unhandled event: {user_msg}")
        except WebSocketDisconnect:
            print(f"User {self.id()} disconnected, exiting receive_loop")

    async def queue_message(self, message_json: str):
        try:
            self.delivery_queue.put_nowait(message_json)
        except asyncio.QueueFull:
            print(f"Message queue is full, closing connection for {self.id()}")
            if not self.closed:
                asyncio.create_task(self.close())

    async def send_message(self, user_msg: WsMessage):
        if len(user_msg.message) > MAX_MESSAGE_LENGTH:
            await self.websocket.send_text(WsSystemMessage(message="Message too long, I refuse to broadcast this", severity="error").model_dump_json())
            return

        print(f"Received message from {self.id()}: {user_msg}")
        await self.broadcast_func(self, user_msg)

    async def close(self):
        if self.closed:
            print(f"Connection for {self.id()} already closed, skipping")
            return
        self.closed = True
        try:
            # Broadcast that the user has left before closing anything
            print(f"Closing connection for {self.id()} ")
            await self.broadcast_func(self, WsUserLeaveEvent(username=self.username))

            if not self.sender_task.done():
                self.sender_task.cancel()
                await self.sender_task
        except Exception as e:
            print(f"Error closing websocket: {e}")

class WebSocketManager:
    def __init__(self, room_name: str, user_database: UserDatabase):
        self.websockets = {}
        self.database = user_database
        self.creator = "<IN PROGRESS>"
        self.room_name = room_name

    async def setup_user(self, websocket: WebSocket):
        # 1. A connection request must be sent from client client
        # 1.1 The server will send a confirmation/rejection
        # 2. The client may now send messages
        # 2.1 The server will broadcast messages to all users

        userConnectionReq = await websocket.receive_text()
        if not userConnectionReq:
            return None
        try:
            userConnectionReq = WsConnectionRequest.model_validate_json(userConnectionReq)
        except ValidationError as e:
            print(f"userConnectionReq {e}")
            await websocket.send_text(UserConnectionResponse(response=f"Invalid request {e}").model_dump_json())
            return None
        if not await self.validate_username(websocket, userConnectionReq.username):
            return None

        username = userConnectionReq.username.strip()

        broadcast_func = lambda user, message : self.broadcast(user, message)
        # Give this user a UUID
        user = WebSocketConnection(websocket, str(uuid.uuid4()), username, broadcast_func)
        self.websockets[user.user_uuid] = user
        storage.add_user(user)

        return user

    async def send_startup_data(self, user: WebSocketConnection, managers: Dict[str, Any]):
        print(f"User '{user.username}' connected, sending startup data")
        await self.send_connection_response(user)
        await self.send_rooms(user, managers)

    async def join_chat(self, user: WebSocketConnection) -> None | WsRoomSwitchRequest:
        print(f"User '{user.username}' connected, starting the WebSocket handler")
        # Send past chats and notify other users that a new user has joined
        await self.send_past_chats(user)
        await self.send_online_users(user)
        await self.broadcast(user, WsUserJoinEvent(username=user.username))
        return await user.receive_loop()

    async def validate_username(self, user_websocket, username: str) -> bool:
        if username_too_long(username):
            print(f"Username is too long: '{username[0:MAX_USERNAME_LENGTH]}'...")
            await user_websocket.send_text(WsConnectionReject(response="Username is too long").model_dump_json())
            return False
        # Checks that the username only contains valid characters
        if contains_invalid_characters(username):
            print(f"Username contains invalid characters: '{username[0:MAX_USERNAME_LENGTH]}'...")
            await user_websocket.send_text(WsConnectionReject(response="Username contains invalid characters").model_dump_json())
            return False
        if storage.is_username_taken(username):
            print(f"Username '{username[0:MAX_USERNAME_LENGTH]}' is already taken")
            await user_websocket.send_text(WsConnectionReject(response="Username is already taken").model_dump_json())
            return False

        return True

    async def send_connection_response(self, user: WebSocketConnection):
        await user.queue_message(WsConnectionResponse(username=user.username, user_id=user.user_uuid).model_dump_json())
    async def send_past_chats(self, sender: WebSocketConnection):
        chats = storage.get_chat_messages(self.room_name).copy()
        await sender.queue_message(WsMessageHistory(messages=chats).model_dump_json())
    async def send_online_users(self, sender: WebSocketConnection):
        users = self.get_users_online()
        users = [user for user in users if user.username != sender.username]
        await sender.queue_message(WsUsersOnline(users=users).model_dump_json())
    async def send_rooms(self, sender: WebSocketConnection, managers: Dict[str, Any]):
        rooms = gather_rooms(managers)
        await sender.queue_message(WsAllRooms(rooms=rooms).model_dump_json())

    async def broadcast(self, sender: WebSocketConnection, message: WsEvent):
        print(f"Broadcasting event {message} from: {sender.username} ({sender.user_uuid})")
        await self.server_broadcast(message)

    async def server_broadcast(self, message: WsEvent):
        self.add_to_history(message=message)

        users = list(self.websockets.keys())
        print(f"Broadcasting event {message} from: SERVER, to: {users}")
        for user in users:
            if user not in self.websockets:
                continue
            user = self.websockets[user]
            print(f"Broadcasting message {message} to: {user.username} ({user.user_uuid})" )
            await user.queue_message(message.model_dump_json())

    def add_to_history(self, message: WsEvent):
        if isinstance(message, WsMessage):
            new_message = {
                "username": message.username,
                "message": message.message,
                "timestamp": datetime.now().isoformat()
            }
            storage.add_to_chat(self.room_name, new_message)

    def get_users_online(self) -> List[WsUserStatus]:
        users: List[WsUserStatus] = []
        for user in self.websockets:
            user = self.websockets[user]
            users.append(WsUserStatus(username=user.username,
                connected_at=user.join_time.isoformat()
            ))
        return users


async def ws_connect_user(websocket: WebSocket, room_name: str):
    user = None
    manager = None
    try:
        await websocket.accept()
        if validate_room_name(room_name) != "":
            await websocket.send_text(WsConnectionReject(response=validate_room_name(room_name)).model_dump_json())
            return
        (manager, room_is_new) = storage.get_manager(room_name)
        user = await manager.setup_user(websocket)
        if not user:
            return
        if room_is_new:
            manager.creator = user.username
            await broadcast_new_room_all(storage.managers, room_name, user.username)

        await manager.send_startup_data(user, storage.managers)

        while True:
            exit_reason = await manager.join_chat(user)
            if isinstance(exit_reason, WsRoomSwitchRequest):
                manager = await switch_room_for_user(user, manager.room_name, exit_reason.room_name)
            else:
                print(f"User '{user.username}' disconnected, exiting ws_connect_user")
                return
    except Exception as e:
        print(f"ws_connect_user: Connection error {e}")
    finally:
        if user:
            await user.close()
            storage.remove_user(user.username)
            if manager:
                manager.websockets.pop(user.user_uuid)


def gather_rooms(managers: Dict[str, WebSocketManager]) -> List[RoomInfo]:
    rooms: List[RoomInfo] = []
    for room_name, manager in managers.items():
        users = [user.username for user in manager.get_users_online()]
        rooms.append(RoomInfo(room_name=room_name, room_creator=manager.creator, connected_users=users))
    return rooms

async def create_and_broadcast_new_room(room_name: str, username: str) -> Tuple[WebSocketManager, bool]:
    (manager, room_is_new) = storage.get_manager(room_name)
    if room_is_new:
        manager.creator = username
        await broadcast_new_room_all(storage.managers, room_name, username)
    else:
        print(f"Room {room_name} already exists")
    return (manager, room_is_new)

async def broadcast_new_room_all(managers: Dict[str, WebSocketManager], room_name: str, username: str):
    await broadcast_all_rooms(managers, WsRoomCreate(room=RoomInfo(room_name=room_name, room_creator=username, connected_users=[username])))

async def broadcast_all_rooms(managers: Dict[str, WebSocketManager], message: WsEvent):
    for room_name in managers:
        await managers[room_name].server_broadcast(message)

async def switch_room_for_user(user: WebSocketConnection, old_room_name: str, new_room_name: str) -> WebSocketManager:
    print(f"Attempting to switch user {user.username} from room {old_room_name} to {new_room_name}")
    if new_room_name not in storage.managers:
        print(f"Room {new_room_name} not found, failing room switch for user ")
        return storage.managers[old_room_name]

    storage.managers[old_room_name].websockets.pop(user.user_uuid)

    broadcast_func = lambda user, message : storage.managers[new_room_name].broadcast(user, message)
    user.broadcast_func = broadcast_func
    storage.managers[new_room_name].websockets[user.user_uuid] = user
    # Notify the user that the room has changed
    await user.queue_message(WsRoomSwitchResponse(room_name=new_room_name).model_dump_json())

    return storage.managers[new_room_name]
