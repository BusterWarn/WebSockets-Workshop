/**
 * WebSockets Workshop - Student's Solution
 *
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

// Fill in username and server address here to not get prompted!
// You can also use query parameters to set username and room name, e.g.
// https://localhost:5000?username=some_username&room_name=some_room_name
// This will be automatically set for you in index.html, if you pass the URL params
globalThis.CONFIG = {
    // A non-empty username is required, the server may reject the connection,
    // if the username is invalid (too long, contains invalid characters, etc.)
    // If the username is empty, the client will prompt the user for a username.
    username: '',
    // Use an empty room_name to join the global/default room, otherwise
    // setting it to a non-empty string will create a new room for you.
    // No extra setup is required for joining/creating a new room.
    room_name: '',
    // Just input server:port, omit http:// or ws://
    backend_server_address: 'localhost:5000',
    // Set to true if you want to use https instead of http, will also use
    // wss instead of ws when true
    use_https: false,
    // Set to true if you want to use the REST API instead of the WebSocket API
    // Note that the REST API is not the main focus, but it is provided for
    // the sake of comparison.
    use_rest: false,
};


// =============================================================================
// GLOBAL STATE
// =============================================================================

globalThis.websocket = null;
globalThis.lastActivity = performance.now();
globalThis.isTyping = false;
globalThis.GLOBAL_ROOM_NAME = "Global";

const WS_EVENT_TYPES = {
    connection_request: 'connection_request',
    connection_response: 'connection_response',
    connection_reject: 'connection_reject',
    message: 'message',
    message_history: 'message_history',
    typing: 'typing',
    system: 'system',
    users_online: 'users_online',
    user_join: 'user_join',
    user_leave: 'user_leave',
    all_rooms: 'all_rooms',
    room_create: 'room_create',
    room_chat_clear: 'room_chat_clear',
    room_switch_request: 'room_switch_request',
    room_switch_response: 'room_switch_response',
};


// =============================================================================
// ASSIGNMENT 1 : WEBSOCKET CONNECTION
// =============================================================================

function wsConnectUser(serverUrl, username) { }


// =============================================================================
// ASSIGNMENT 2 : SEND AND RECEIVE MESSAGES
// =============================================================================

function wsSendMessage(websocket, message) { }
// TIP: use a switch statement to handle different message types
// Note that the event_type is a string that is unique per message type
function wsReceiveMessage(message) { }

// =============================================================================
// ASSIGNMENT 3 : USER PRESENCE NOTIFICATIONS
// =============================================================================
// Within the wsReceiveMessage function, handle users_online, user_join, and user_leave

// =============================================================================
// ASSIGNMENT 4 : TYPING INDICATORS
// =============================================================================


// TIP: use a combination of keydown events and setInterval to detect typing
// window.addEventListener('keydown', (_event) => {});
// window.setInterval(() => {}, NUMBER_OF_MILLISECONDS);


// =============================================================================
// ASSIGNMENT 5 : ROOM MANAGEMENT
// =============================================================================

function wsSendRoomCreate(websocket, roomName) { }

function wsSendRoomSwitchReq(websocket, roomName) { }

function wsSendRoomChatClear(websocket, roomName) { }


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createToastForSeverity(message, severity) {
    switch (severity) {
        case 'success':
            Toast.success(message);
            break;
        case 'info':
            Toast.info(message);
            break;
        case 'warning':
            Toast.warning(message);
            break;
        case 'error':
            Toast.error(message);
            break;
    }
}


// =============================================================================
// EXPORTS
// =============================================================================

window.wsSendRoomCreate = wsSendRoomCreate;
window.wsSendRoomSwitchReq = wsSendRoomSwitchReq;
window.wsSendRoomChatClear = wsSendRoomChatClear;
