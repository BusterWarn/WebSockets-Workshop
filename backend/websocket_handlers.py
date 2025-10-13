from fastapi import  WebSocket, WebSocketDisconnect
from pydantic import ValidationError, TypeAdapter
from datetime import datetime
import uuid

from message_types import *
from user_database import *

class WebSocketConnection:
    def __init__(self, websocket: WebSocket, uuid: str, username: str, broadcast_func):
        self.websocket = websocket
        self.user_uuid = uuid
        self.username = username
        self.broadcast_func = broadcast_func

    async def websocket_handler(self):
        try:
            while True:
                user_msg = await self.websocket.receive_text()
                if not user_msg:
                    print("User sent us trash")
                    break

                try:
                    user_msg = TypeAdapter(WsEvent).validate_json(user_msg)
                except ValidationError as e:
                    print(f"Invalid message {e}")
                    break

                if isinstance(user_msg, WsMessage):
                    await self.ws_message_handler(user_msg)
                else:
                    print(f"Got unhandled event: {user_msg}")

        except WebSocketDisconnect:
            print("User disconnected")
            return

    async def ws_message_handler(self, user_msg: WsMessage):
        if len(user_msg.message) > 80:
            await self.websocket.send_text(WsSystemMessage(message="Message too long, I refuse to broadcast this").model_dump_json())
            return

        print(f"Received message from '{self.username}' ({self.user_uuid}): {user_msg}")
        await self.broadcast_func(self, user_msg)

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
        if len(userConnectionReq.username) > 80:
            print(f"Username too long: '{userConnectionReq.username[0:80]}'...")
            await websocket.send_text(UserConnectionResponse(response="Username too long").model_dump_json())
            return

        # TODO: Check that the username is not already in use or is a registered user
        username = userConnectionReq.username.strip()

        broadcast_func = lambda user, message : self.broadcast(user, message)
        # Give this user a UUID
        user = WebSocketConnection(websocket, str(uuid.uuid4()), username, broadcast_func)
        self.websockets[user.user_uuid] = user

        print(f"User '{username}' connected, starting the WebSocket handler")

        if "past_chats" in userConnectionReq.subscribe_for_events:
            await self.send_past_chats(user)

        await user.websocket_handler()

        # Remove the websocket from our lists
        print(f"User '{username}' disconnected, cleaning up")
        del self.websockets[user.user_uuid]

    async def send_past_chats(self, sender: WebSocketConnection):
        chats = self.chat_messages.copy()
        await sender.websocket.send_text(WsMessageHistory(messages=chats).model_dump_json())

    async def broadcast(self, sender: WebSocketConnection, message: WsMessage):
        new_message = {
            "username": sender.username,
            "message": message.message,
            "timestamp": datetime.now().isoformat()
        }
        self.chat_messages.append(new_message)

        # It's not safe to iterate the websockets dict as the send functions
        # are async, so we 'freeze' the list of receivers before broadcasting the message
        receivers = list(self.websockets.keys())
        for user in receivers:
            if user not in self.websockets:
                continue
            user = self.websockets[user]
            if user.user_uuid != sender.user_uuid:
                print(f"Broadcasting message {message} to: {user}" )
                await user.websocket.send_text(message.model_dump_json())

