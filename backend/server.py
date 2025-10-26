from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from typing import List, Dict
import uvicorn
import re

from message_types import *
from websocket_handlers import *

app = FastAPI(title="Chat Backend", version="1.0.0")
app.mount("/chat/", StaticFiles(directory="../frontend"), name="chat")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development only!)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

GLOBAL_ROOM_NAME = "ALL"

# In-memory storage
chat_messages: Dict[str, List[Dict]] = { GLOBAL_ROOM_NAME: [] }
managers: Dict[str, WebSocketManager] = {}

def get_chat_messages(room_name: str):
    if room_name not in chat_messages:
        chat_messages[room_name] = []
    return chat_messages[room_name]

def get_manager(room_name: str):
    if room_name not in managers:
        managers[room_name] = WebSocketManager(get_chat_messages(room_name), UserDatabase())
    return managers[room_name]

async def https_send_message(username: str, chat_msg: ChatMessage, room_name: str):
    """Send a message to the chat"""
    username = chat_msg.username.strip()
    message = chat_msg.message.strip()

    if not username or not re.match(r'^[a-zA-Z0-9_ -]+$', username):
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    manager = get_manager(room_name)
    await manager.server_broadcast(WsMessage(username=username, message=message))

    return {"status": "success", "message": "Message sent"}

@app.get("/")
async def root():
    return RedirectResponse(url="/chat/index.html")

@app.post("/send-message")
async def send_message(chat_msg: ChatMessage):
    return await https_send_message(chat_msg.username, chat_msg, GLOBAL_ROOM_NAME)

@app.post("/{room_name}/send-message")
async def send_message_room(chat_msg: ChatMessage, room_name: str):
    return await https_send_message(chat_msg.username, chat_msg, room_name)

@app.get("/messages")
async def get_all_messages():
    """Get all chat messages"""
    return {"messages": chat_messages[GLOBAL_ROOM_NAME]}

@app.get("/{room_name}/messages/")
async def get_all_messages_room(room_name: str):
    """Get all chat messages"""
    return {"messages": get_chat_messages(room_name)}

@app.delete("/clear-chat")
async def clear_chat():
    """Clear all messages and users (useful for testing)"""
    global chat_messages, connected_users
    chat_messages[GLOBAL_ROOM_NAME] = []
    connected_users = {}
    return {"status": "success", "message": "Chat cleared"}


async def ws_connect_user(websocket: WebSocket, room_name: str):
    try:
        await websocket.accept()
        manager = get_manager(room_name)
        await manager.connect(websocket)
    except Exception as e:
        print(f"ws_connect_user: Connection error {e}")

# Global room, this is just a shortcut for /ws/{GLOBAL_ROOM_NAME}
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print(f"New websocket connection with default room_name: {GLOBAL_ROOM_NAME}")
    await ws_connect_user(websocket, GLOBAL_ROOM_NAME)

@app.websocket("/ws/{room_name}")
async def websocket_endpoint_room(websocket: WebSocket, room_name: str):
    print(f"New websocket connection with room_name: {room_name}")
    await ws_connect_user(websocket, room_name)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
