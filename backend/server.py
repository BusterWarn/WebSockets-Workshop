from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
import uvicorn

app = FastAPI(title="Chat Backend", version="1.0.0")

# In-memory storage
chat_messages: List[Dict] = []
connected_users: Dict[str, datetime] = {}

# Pydantic models for request/response
class ChatMessage(BaseModel):
    username: str
    message: str

class UserConnection(BaseModel):
    username: str

class ChatData(BaseModel):
    messages: List[Dict]
    connected_users: List[Dict]

@app.get("/")
async def root():
    return {"message": "Chat Backend API", "endpoints": ["/connect", "/send-message"]}

@app.post("/connect")
async def connect_user(user: UserConnection):
    """Connect a user and get all chat data (messages + connected users)"""
    username = user.username.strip()

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    # Add user to connected users (or update their last seen time)
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

@app.post("/send-message")
async def send_message(chat_msg: ChatMessage):
    """Send a message to the chat"""
    username = chat_msg.username.strip()
    message = chat_msg.message.strip()

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Create message object
    new_message = {
        "username": username,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }

    # Add to chat messages
    chat_messages.append(new_message)

    # Update user's last seen time
    connected_users[username] = datetime.now()

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

@app.delete("/clear-chat")
async def clear_chat():
    """Clear all messages and users (useful for testing)"""
    global chat_messages, connected_users
    chat_messages = []
    connected_users = {}
    return {"status": "success", "message": "Chat cleared"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
