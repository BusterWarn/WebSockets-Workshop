# WebSockets Workshop
WebSockets Workshop hos Tietoevry Umeå 6e November 2025

Mer information kommer när eventet närmar sig.

# Overview
The focus of this workshop is to implement a client for a chat application. The backend server has already been implemented for you, along with the UI.
Your goal is to connect the frontend to the provided chat backend using WebSocket communication. You will handle connection setup, message sending, and event handling within the `frontend/workshop.js` file.

- You will only have to update `frontend/workshop.js`.
- As noted above, the GUI is already provided. While developing, open the `frontend/index.html` in a web browser, and edit the `workshop.js` file. Work in small increments, and refresh the page to see your updates.
- You will be given an IP address to our hosted backend that you will be able to communicate with, set the ip address in `globalThis.backend_server_address`
- There is a multitude of different events that the server will send, for instance when a user joins or leaves, when a message is sent, when a new room is created, etc.

## Miscellaneous Tips
The JavaScript WebSocket API is largely event-driven, have a look at the MDN documentation for the various events that are available:
[Writing WebSocket client applications](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)


The messages that you will send and receive are defined in the backend directory, `backend/message_types.py`.
In particular, the messages that are defined in the `WsEvent` union:

```python
WsEvent = Annotated[
    Union[
        WsConnectionRequest,
        WsConnectionResponse,
        WsMessage,
        # and many more ...
    ],
    Field(discriminator="event_type"),
]
```

The server expects to receive these messages as JSON strings, use `JSON.stringify(obj)` to convert an object to a JSON string that you can send via the WebSocket's `send()` function.
```javascript
websocket.send(JSON.stringify({
    event_type: WS_EVENT_TYPES.message,
    username: "MyUserName",
    message: "Hello, world!",
}));
```

### Rooms
The backend server also supports rooms to prevent everyone from spamming the same chat while testing the implementations.
You do not have to do anything special to create a room, just provide a room name and one will be created for you if it does not already exist.
To set the room name you can do **one** of the following:
- Change `globalThis.CONFIG.room_name` to whichever room name that you want.
- Provide a query parameter, in your browser, add `<some_path>/frontend/index.html?room_name=some_room_name` to the end of the url
    - You may also set the username in this manner: `<some_path>/frontend/index.html?room_name=some_room_name&username=some_username`

Using different query parameters in multiple browser tabs allows you to simulate several users and verify that your chat logic behaves correctly.

## Available Helper Functions
You may use these helper functions:

### UI Functions
```javascript
window.addMessageToUI(message, type, username)
window.addMemberToList(username, status)
window.removeMemberFromList(username)
window.updateOnlineCount()
window.addRoomToList(roomName, isActive)
window.switchToRoom(roomName)
window.clearChat(roomName)
window.addSelfAsOnline()
```

### Toast Functions
```javascript
Toast.success(message)
Toast.error(message)
Toast.warning(message)
Toast.info(message)
```

### Config Access
```javascript
window.chatConfig.username
window.chatConfig.room_name
window.getWsAddress()  // Returns ws:// or wss:// URL
```
