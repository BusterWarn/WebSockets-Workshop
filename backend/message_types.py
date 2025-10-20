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

## Base structures
class WsUserStatus(BaseModel):
    username: str
    connected_at: str

## Chat
# WebSockets protocol messages
class WsConnectionRequest(BaseModel):
    event_type: Literal["connection_request"] = "connection_request"
    username: str
class WsConnectionResponse(BaseModel):
    event_type: Literal["connection_response"] = "connection_response"
    username: str
    user_id: str
class WsConnectionReject(BaseModel):
    event_type: Literal["connection_reject"] = "connection_reject"
    response: str
class WsMessage(BaseModel):
    event_type: Literal["message"] = "message"
    username: str
    message: str
class WsMessageHistory(BaseModel):
    event_type: Literal["message_history"] = "message_history"
    messages: List[Dict]
class WsTypingEvent(BaseModel):
    event_type: Literal["typing"] = "typing"
    username: str
    is_typing: bool
class WsSystemMessage(BaseModel):
    event_type: Literal["system"] = "system"
    severity: Literal["success", "info", "warning", "error"]
    message: str
class WsUsersOnline(BaseModel):
    event_type: Literal["users_online"] = "users_online"
    users: List[WsUserStatus]
class WsUserJoinEvent(BaseModel):
    event_type: Literal["user_join"] = "user_join"
    username: str
class WsUserLeaveEvent(BaseModel):
    event_type: Literal["user_leave"] = "user_leave"
    username: str

WsEvent = Annotated[
    Union[
        WsConnectionRequest,
        WsConnectionResponse,
        WsConnectionReject,
        WsMessage,
        WsMessageHistory,
        WsTypingEvent,
        WsSystemMessage,
        WsUsersOnline,
        WsUserJoinEvent,
        WsUserLeaveEvent,
    ],
    Field(discriminator="event_type"),
]
