from fastapi import  WebSocket, WebSocketDisconnect
from pydantic import ValidationError, TypeAdapter
from typing import Callable
from datetime import datetime
import uuid
import asyncio

from message_types import *
from user_database import *

MAX_MESSAGE_LENGTH = 80
QUEUE_MAX_SIZE = 50

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

    async def receive_loop(self):
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
    def __init__(self, chat_messages: List, user_database: UserDatabase):
        self.websockets = {}
        self.database = user_database
        self.chat_messages = chat_messages

    async def connect(self, websocket: WebSocket):
        # 1. A connection request must be sent from client client
        # 1.1 The server will send a confirmation/rejection
        # 2. The client may now send messages
        # 2.1 The server will broadcast to all users

        userConnectionReq = await websocket.receive_text()
        if not userConnectionReq:
            return
        try:
            userConnectionReq = WsConnectionRequest.model_validate_json(userConnectionReq)
        except ValidationError as e:
            print(f"userConnectionReq {e}")
            await websocket.send_text(UserConnectionResponse(response=f"Invalid request {e}").model_dump_json())
            return
        if len(userConnectionReq.username) > MAX_MESSAGE_LENGTH:
            print(f"Username too long: '{userConnectionReq.username[0:MAX_MESSAGE_LENGTH]}'...")
            await websocket.send_text(UserConnectionResponse(response="Username too long").model_dump_json())
            return

        # TODO: Check that the username is not already in use or is a registered user
        username = userConnectionReq.username.strip()

        broadcast_func = lambda user, message : self.broadcast(user, message)
        # Give this user a UUID
        user = WebSocketConnection(websocket, str(uuid.uuid4()), username, broadcast_func)
        self.websockets[user.user_uuid] = user

        print(f"User '{username}' connected, starting the WebSocket handler")

        await self.send_past_chats(user)
        await self.send_online_users(user)

        # Notify other users that a new user has joined
        await self.broadcast(user, WsUserJoinEvent(username=username))

        try:
            await user.receive_loop()
        finally:
            # Remove the websocket from our lists
            print(f"User {user.id()} disconnected, cleaning up")
            await user.close()
            self.websockets.pop(user.user_uuid)


    async def send_past_chats(self, sender: WebSocketConnection):
        chats = self.chat_messages.copy()
        await sender.queue_message(WsMessageHistory(messages=chats).model_dump_json())

    async def send_online_users(self, sender: WebSocketConnection):
        users = self.get_users_online()
        await sender.queue_message(WsUsersOnline(users=users).model_dump_json())

    async def broadcast(self, sender: WebSocketConnection, message: WsEvent):
        self.add_to_history(username=sender.username, message=message)

        users = list(self.websockets.keys())
        print(f"Broadcasting event {message} from: {sender.username} ({sender.user_uuid}), to: {users}")
        for user in users:
            if user not in self.websockets:
                continue
            user = self.websockets[user]
            if user.user_uuid != sender.user_uuid:
                print(f"Broadcasting message {message} to: {user.username} ({user.user_uuid})" )
                await user.queue_message(message.model_dump_json())

    async def server_broadcast(self, message: WsEvent):
        self.add_to_history(username="SERVER", message=message)

        users = list(self.websockets.keys())
        print(f"Broadcasting event {message} from: SERVER, to: {users}")
        for user in users:
            if user not in self.websockets:
                continue
            await self.websockets[user].queue_message(message.model_dump_json())

    def add_to_history(self, username: str, message: WsEvent):
        if isinstance(message, WsMessage):
            new_message = {
                "username": username,
                "message": message.message,
                "timestamp": datetime.now().isoformat()
            }
            self.chat_messages.append(new_message)


    def get_users_online(self) -> List[WsUserStatus]:
        users: List[WsUserStatus] = []
        for user in self.websockets:
            user = self.websockets[user]
            users.append(WsUserStatus(username=user.username,
                connected_at=user.join_time.isoformat()
            ))
        return users

