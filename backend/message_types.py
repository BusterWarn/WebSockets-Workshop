from pydantic import BaseModel, Field
from typing import List, Dict, Literal, Union, Annotated


# Pydantic models for request/response
class ChatMessage(BaseModel):
    username: str
    message: str

class UserConnection(BaseModel):
    username: str

class UserConnectionResponse(BaseModel):
    response: str

class ChatData(BaseModel):
    messages: List[Dict]
    connected_users: List[Dict]

# WebSockets protocol messages
class WsConnectionRequest(BaseModel):
    username: str
    # past_chats, typing, user_event
    subscribe_for_events: List[str]
class WsConnectionResponse(BaseModel):
    response: str

## Login/Register
class WsRegisterRequest(BaseModel):
    username: str
    password: str
class WsRegisterResponse(BaseModel):
    response: str

class WsLoginRequest(BaseModel):
    username: str
    password: str
class WsLoginResponse(BaseModel):
    response: str

class WsCreateGroupRequest(BaseModel):
    group_name: str
class WsCreateGroupResponse(BaseModel):
    response: str
class WsAddUserToGroupRequest(BaseModel):
    group_name: str
    username: str

## Chat
### The server will send one of these messages to the client
class WsMessage(BaseModel):
    event_type: Literal["message"] = "message"
    username: str
    message: str
class WsMessageHistory(BaseModel):
    event_type: Literal["message_history"] = "message_history"
    messages: List[Dict]
class WsTypingEvent(BaseModel):
    event_type: Literal["typing"] = "typing"
    message: str
class WsSystemMessage(BaseModel):
    event_type: Literal["system"] = "system"
    message: str
class WsUserJoinEvent(BaseModel):
    event_type: Literal["user_join"] = "user_join"
    username: str
class WsUserLeaveEvent(BaseModel):
    event_type: Literal["user_leave"] = "user_leave"
    username: str

WsEvent = Annotated[Union[WsMessage, WsTypingEvent, WsUserJoinEvent, WsUserLeaveEvent], Field(discriminator="event_type")]
