from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict
from datetime import datetime
import uvicorn

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

# In-memory storage
chat_messages: List[Dict] = []
manager = WebSocketManager(chat_messages, UserDatabase())

@app.get("/")
async def root():
    return {"message": "Chat Backend API", "endpoints": ["/connect", "/send-message"]}

@app.post("/send-message")
async def send_message(chat_msg: ChatMessage):
    """Send a message to the chat"""
    username = chat_msg.username.strip()
    message = chat_msg.message.strip()

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    await manager.server_broadcast(WsMessage(username=username, message=message))

    return {"status": "success", "message": "Message sent"}

@app.get("/chat-data/{username}")
async def get_chat_data(username: str):
    """Alternative endpoint to get chat data with username in URL"""
    username = username.strip()

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    # Update user's last seen time
    connected_users[username] = datetime.now()

    # Format connected users for response
    users_list = [
        {
            "username": user,
            "connected_at": timestamp.isoformat()
        }
        for user, timestamp in connected_users.items()
    ]

    return ChatData(
        messages=chat_messages,
        connected_users=users_list
    )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        await manager.connect(websocket)
    except Exception as e:
        print(f"Connection error {e}")

@app.get("/messages")
async def get_all_messages():
    """Get all chat messages"""
    return {"messages": chat_messages}

@app.delete("/clear-chat")
async def clear_chat():
    """Clear all messages and users (useful for testing)"""
    global chat_messages, connected_users
    chat_messages = []
    connected_users = {}
    return {"status": "success", "message": "Chat cleared"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
