This document contains the JSON messages that will be used in this workshop.

# Example WebSocket Messages

## Base Structures

### WsUserStatus
```json
{
  "username": "alice",
  "connected_at": "2025-11-03T00:45:12Z"
}
```

---

## Chat – WebSocket Protocol Messages

### WsConnectionRequest
```json
{
  "event_type": "connection_request",
  "username": "alice"
}
```

### WsConnectionResponse
```json
{
  "event_type": "connection_response",
  "username": "alice",
  "user_id": "b8c1d7e9-3a22-4c12-8221-ffe72e8e8b2c"
}
```

### WsConnectionReject
```json
{
  "event_type": "connection_reject",
  "response": "Username already in use."
}
```

### WsSystemMessage
```json
{
  "event_type": "system",
  "severity": "info",
  "message": "Server maintenance scheduled in 10 minutes."
}
```

---

## Messaging

### WsMessageHistory
```json
{
  "event_type": "message_history",
  "messages": [
    {
      "username": "alice",
      "message": "Hi everyone!",
      "timestamp": "2025-11-03T00:45:12Z"
    },
    {
      "username": "bob",
      "message": "Hey Alice!",
      "timestamp": "2025-11-03T00:46:01Z"
    }
  ]
}
```

### WsMessage
```json
{
  "event_type": "message",
  "username": "alice",
  "message": "How's everyone doing today?"
}
```

---

## User Events

### WsTypingEvent
```json
{
  "event_type": "typing",
  "username": "bob",
  "is_typing": true
}
```

### WsUsersOnline
```json
{
  "event_type": "users_online",
  "users": [
    {
      "username": "alice",
      "connected_at": "2025-11-03T00:45:12Z"
    },
    {
      "username": "bob",
      "connected_at": "2025-11-03T00:46:01Z"
    }
  ]
}
```

### WsUserJoinEvent
```json
{
  "event_type": "user_join",
  "username": "charlie"
}
```

### WsUserLeaveEvent
```json
{
  "event_type": "user_leave",
  "username": "bob"
}
```

---

## Room Info and Management

### RoomInfo
```json
{
  "room_name": "General",
  "room_creator": "alice",
  "connected_users": ["alice", "bob", "charlie"]
}
```

### WsAllRooms
```json
{
  "event_type": "all_rooms",
  "rooms": [
    {
      "room_name": "General",
      "room_creator": "alice",
      "connected_users": ["alice", "bob"]
    },
    {
      "room_name": "Developers",
      "room_creator": "charlie",
      "connected_users": ["charlie"]
    }
  ]
}
```

### WsRoomChatClear
```json
{
  "event_type": "room_chat_clear",
  "username": "moderator01",
  "room_name": "General"
}
```

### WsRoomCreate
```json
{
  "event_type": "room_create",
  "room": {
    "room_name": "Support",
    "room_creator": "alice",
    "connected_users": []
  }
}
```

### WsRoomCreateReject
```json
{
  "event_type": "room_create_reject",
  "response": "Room name already exists."
}
```

---

## Room Switching

### WsRoomSwitchRequest
```json
{
  "event_type": "room_switch_request",
  "room_name": "Developers"
}
```

### WsRoomSwitchResponse
```json
{
  "event_type": "room_switch_response",
  "room_name": "Developers"
}
```

### WsRoomSwitchReject
```json
{
  "event_type": "room_switch_reject",
  "response": "Room not found"
}
```

Also, if you're wondering why the names 'alice', 'bob', and 'charlie', keep showing up in examples like this, see [Alice and Bob](https://en.wikipedia.org/wiki/Alice_and_Bob).
