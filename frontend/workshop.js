/**
 * WebSockets Workshop - Student Implementation File
 *
 * This file contains the WebSocket client implementation that you'll complete
 * through 5 progressive assignments.
 *
 * Server code reference: server.py, websocket_handlers.py, message_types.py
 *      Only if you're interested, reading the server code is not mandatory!
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

// Fill in username and server address here to not get prompted!
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
    use_https: true,
    // Set to true if you want to use the REST API instead of the WebSocket API
    // Note that the REST API is not the main focus, but it is provided for
    // the sake of comparison.
    use_rest: false,
};


// =============================================================================
// GLOBAL STATE
// =============================================================================

// Global WebSocket connection - will be initialized when connecting
globalThis.websocket = null;

// Typing indicator state
globalThis.lastActivity = performance.now();
globalThis.isTyping = false;

// Room name constant
globalThis.GLOBAL_ROOM_NAME = "Global";

/**
 * WebSocket event types - These match the message_types.py on the server
 * Refer to the WsEvent union type in message_types.py to see all possible events
 */
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
    room_create_reject: 'room_create_reject',
    room_chat_clear: 'room_chat_clear',
    room_switch_request: 'room_switch_request',
    room_switch_response: 'room_switch_response',
    room_switch_reject: 'room_switch_reject',
};


// =============================================================================
// ASSIGNMENT 1: ESTABLISH WEBSOCKET CONNECTION
// =============================================================================

/**
 * ASSIGNMENT 1 - Create Websocket and assign to globalThis.websocket.
 *                Add event listeners: 'open', 'error', 'close', 'message'
 * This function is invoked by the UI on page load.
 *
 * @param {string} serverUrl - The WebSocket server URL (e.g., "ws://localhost:5000/ws")
 * @param {string} username - Your username from config
 */
function wsConnectUser(serverUrl, username) {
    try {
        // TODO: Create a new WebSocket connection to serverUrl
        // Hint: globalThis.websocket = new WebSocket(serverUrl);

        // NOTE: use documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications

        // TODO: Add 'open' event listener
        // When the connection opens, send a connection request to the server
        // The message should be: { event_type: WS_EVENT_TYPES.connection_request, username: username }
        // Hint: JSON.stringify({ /* json data */ })

        // TODO: Add 'error' event listener
        // Log the error to console and toast it

        // TODO: Add 'close' event listener
        // When connection closes, clean up by setting globalThis.websocket = null

        // TODO: Add 'message' event listener
        // Parse the incoming message and pass it to wsReceiveMessage()
        // Hint: const message = JSON.parse(msg.data);

    } catch (error) {
        console.error('Error connecting user:', error);
        Toast.error(`Error connecting user: ${error}`);
        throw error;
    }
}


// =============================================================================
// ASSIGNMENT 2: SEND AND RECEIVE MESSAGES
// =============================================================================

/**
 * ASSIGNMENT 2a: Send a chat message through WebSocket
 * This function is invoked by the UI when you send a message (i.e. press enter or click send)
 * via the text input field.
 *
 * Server reference:
 * - websocket_handlers.py: WebSocketConnection.send_message()
 * - message_types.py: WsMessage
 *
 * @param {WebSocket} websocket - The active WebSocket connection
 * @param {string} message - The message text to send
 */
function wsSendMessage(websocket, message) {
    if (!websocket || websocket.CLOSED) {
        Toast.error('WebSocket connection not established');
        return;
    }


    // TODO 2.2: Send a message to the server
    // Look at WsMessage structure in message_types.py
    // Required fields: event_type, username, message
    // Hint: websocket.send(JSON.stringify({ ... }))
    // Should look like this: { event_type: WS_EVENT_TYPES.message, username: string, message: string }

    // What happens if you use another username? 🤔

}

/**
 * ASSIGNMENT 2b: Handle incoming WebSocket messages
 * Should be invoked by your message handler whenever a message is received from the server.
 *
 * @param {Object} message - The parsed message object from the server
 */
function wsReceiveMessage(message) {
    console.log(`Received message of type ${message.event_type}`, message);

    switch (message.event_type) {
        // ASSIGNMENT 2
        // GUI functions to call:
        //  - window.addMessageToUI(message: <string>, username: <string>)
        case WS_EVENT_TYPES.message:
            break;
        case WS_EVENT_TYPES.message_history:
            break;

        case WS_EVENT_TYPES.connection_reject:
            Toast.error(message.response);
            break;

        // ASSIGNMENT 3: User presence notifications
        // GUI functions to call:
        // - window.addSelfAsOnline(),
        // - window.addMemberToList(username: <string>, status: <string>),
        // - window.updateOnlineCount()
        case WS_EVENT_TYPES.users_online:
            break;
        case WS_EVENT_TYPES.user_join:
            Toast.info(`User ${undefined} joined the chat`);
            break;
        case WS_EVENT_TYPES.user_leave:
            Toast.info(`User ${undefined} left the chat`);
            break;
        case WS_EVENT_TYPES.system:
            createToastForSeverity(message.message, message.severity);
            break;

        // ASSIGNMENT 4: Typing indicators
        // GUI functions to call:
        // - updateMemberStatus(username: <string>, status: <string>)
        case WS_EVENT_TYPES.typing:
            break;

        // ASSIGNMENT 5: Room management
        // GUI functions to call:
        // - addRoomToList(roomName: <string>, isActive: <boolean>)
        // - window.switchToRoom(roomName: <string>)
        // - window.clearChat(roomName: <string>)
        case WS_EVENT_TYPES.all_rooms:
            break;
        case WS_EVENT_TYPES.room_create:
            Toast.info(`Room ${undefined} created by ${undefined}`);
            break;
        case WS_EVENT_TYPES.room_create_reject:
            Toast.error(message.response);
            break;
        case WS_EVENT_TYPES.room_switch_response:
            break;
        case WS_EVENT_TYPES.room_switch_reject:
            Toast.error(message.response);
            break;
        case WS_EVENT_TYPES.room_chat_clear:
            break;

        default:
            console.error('Received unknown message:' + JSON.stringify(message));
    }
}


// =============================================================================
// ASSIGNMENT 3: USER NOTIFICATIONS (JOIN/LEAVE EVENTS)
// =============================================================================

/**
 * ASSIGNMENT 3: Handle user presence notifications
 *
 * TODO 3.1: Add to the switch statement in wsReceiveMessage():
 *
 * CASE: 'users_online'
 * - First add self as online: window.addSelfAsOnline()
 * - Loop through message.users and add each to the members list
 * - Skip self (check username !== window.chatConfig.username)
 * - Call: window.addMemberToList(user.username, 'online')
 * - Finally update count: window.updateOnlineCount()
 *
 * CASE: 'user_join'
 * - Ignore if it's yourself (return early)
 * - Show info toast: Toast.info(`User ${message.username} joined the chat`)
 * - Add to members list: window.addMemberToList(message.username, 'online')
 * - Update online count
 *
 * CASE: 'user_leave'
 * - Ignore if it's yourself (return early)
 * - Show info toast: Toast.info(`User ${message.username} left the chat`)
 * - Remove from members list: window.removeMemberFromList(message.username)
 * - Update online count
 */


// =============================================================================
// ASSIGNMENT 4: TYPING INDICATORS
// =============================================================================

/**
 * ASSIGNMENT 4: Implement typing indicators
 *
 * The typing indicator works with a simple timeout mechanism:
 * - When user types, send is_typing: true
 * - After 2.5 seconds of inactivity, send is_typing: false
 */

// TODO 4.1: Add keydown event listener
// This detects when user starts typing
window.addEventListener('keydown', (_event) => {
    // Check if websocket exists
    if (!globalThis.websocket) {
        return;
    }

    // TODO 4.1a: If not currently typing, set state and send typing event
    // Set: globalThis.isTyping = true
    // Set: globalThis.lastActivity = performance.now()
    // Send typing event: { event_type: 'typing', username: ..., is_typing: true }

});

// TODO 4.2: Add interval to check for typing timeout
// This runs every 500ms to check if user stopped typing
window.setInterval(() => {
    if (!globalThis.websocket) { return }

    if (!globalThis.isTyping) {
        return;
    }

    // TODO 4.2a: If more than 2500ms since last activity, stop typing
    // Check: (performance.now() - globalThis.lastActivity) > 2500
    // Set: globalThis.isTyping = false
    // Send typing event with is_typing: false

}, 500);

/**
 * TODO 4.3: Handle incoming typing events in wsReceiveMessage()
 *
 * Add to switch statement:
 * CASE: 'typing'
 * - Update member status to show typing/online
 * - Call: updateMemberStatus(message.username, message.is_typing ? 'typing' : 'online')
 */


// =============================================================================
// ASSIGNMENT 5: ROOM MANAGEMENT
// =============================================================================

/**
 * ASSIGNMENT 5: Implement room switching and management
 */

/**
 * TODO 5.1: Send room create request
 * The room_create message is used to create a new room on the server.
 * This is invoked by the UI after submitting a room name in the room creation prompt.
 *
 * @param {WebSocket} websocket - The active WebSocket connection
 * @param {string} roomName - The name of the room to create
 */
function wsSendRoomCreate(websocket, roomName) {
    // Note that there is no special confirmation for room_create messages.
    // Instead, the same room_create will be sent back to the client on success.
    // The WS_EVENT_TYPES.room_create_reject will be sent back to the client on failure, e.g. due to invalid room name
}


/**
 * TODO 5.2: Send room switch request
 * This is invoked by the UI code when a room from the room list is clicked.
 *
 * @param {WebSocket} websocket - The active WebSocket connection
 * @param {string} roomName - The name of the room to switch to
 */
function wsSendRoomSwitchReq(websocket, roomName) {
    // TODO: Send room_switch_request event
    // Structure: { event_type: 'room_switch_request', room_name: roomName }

}

/**
 * TODO 5.3: Send room chat clear request
 *
 * @param {WebSocket} websocket - The active WebSocket connection
 * @param {string} roomName - The name of the room to clear
 */
function wsSendRoomChatClear(websocket, roomName) {
    // TODO: Send room_chat_clear event
    // Structure: { event_type: 'room_chat_clear', room_name: roomName, username: ... }

}

/**
 * TODO 5.4: Handle room-related events in wsReceiveMessage()
 *
 * Add these cases to the switch statement:
 *
 * CASE: 'all_rooms'
 * - Loop through message.rooms
 * - Skip the Global room (if room.room_name == "Global")
 * - Add each room: window.addRoomToList(room.room_name, false)
 *
 * CASE: 'room_create'
 * - Skip if Global room
 * - Add room to list: window.addRoomToList(message.room.room_name, false)
 * - Show success toast
 *
 * CASE: 'room_switch_response'
 * - Skip if already in that room (message.room_name === window.chatConfig.room_name)
 * - Switch UI to new room: window.switchToRoom(message.room_name)
 *
 * CASE: 'room_chat_clear'
 * - Clear the chat for that room: window.clearChat(message.room_name)
 */


// =============================================================================
// HELPER FUNCTIONS (PROVIDED)
// =============================================================================

/**
 * Helper function to create toasts based on severity level
 * This is provided for you - no need to implement
 */
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
// EXPORTS (PROVIDED)
// =============================================================================
// Make functions available globally for the HTML file to use
// These are all invoked by the UI code for you
window.wsSendRoomSwitchReq = wsSendRoomSwitchReq;
window.wsSendRoomChatClear = wsSendRoomChatClear;
window.wsSendRoomCreate = wsSendRoomCreate;
