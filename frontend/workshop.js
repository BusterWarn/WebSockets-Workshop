/**
 * WebSockets Workshop - Student Implementation File
 *
 * This file contains the WebSocket client implementation that you'll complete
 * through 5 progressive assignments. Read the Python server code to understand
 * the WebSocket protocol and message structures.
 *
 * Server code reference: server.py, websocket_handlers.py, message_types.py
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
    use_rest: true,
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
    room_chat_clear: 'room_chat_clear',
    room_switch_request: 'room_switch_request',
    room_switch_response: 'room_switch_response',
};


// =============================================================================
// ASSIGNMENT 1: ESTABLISH WEBSOCKET CONNECTION
// =============================================================================

/**
 * ASSIGNMENT 1: Connect to the WebSocket server and handle the connection handshake
 *
 * Server reference:
 * - websocket_handlers.py: ws_connect_user(), WebSocketManager.setup_user()
 * - message_types.py: WsConnectionRequest, WsConnectionResponse, WsConnectionReject
 *
 * Protocol flow:
 * 1. Client opens WebSocket connection
 * 2. Client sends WsConnectionRequest with username
 * 3. Server validates username and responds with:
 *    - WsConnectionResponse (accepted) with username and user_id, OR
 *    - WsConnectionReject (rejected) with error message
 *
 * @param {string} serverUrl - The WebSocket server URL (e.g., "ws://localhost:5000/ws")
 * @param {string} username - The username to connect with
 */
function wsConnectUser(serverUrl, username) {
    try {
        // TODO 1.1: Create a new WebSocket connection to serverUrl
        // Hint: globalThis.websocket = new WebSocket(serverUrl);


        // TODO 1.2: Add 'error' event listener
        // Hint: Log the error to console


        // TODO 1.3: Add 'open' event listener
        // When the connection opens, send a connection request to the server
        // Hint: Look at WsConnectionRequest in message_types.py
        // The message should be: { event_type: 'connection_request', username: username }


        // TODO 1.4: Add 'close' event listener
        // When connection closes, clean up by setting globalThis.websocket = null


        // TODO 1.5: Add 'message' event listener
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
 *
 * Server reference:
 * - websocket_handlers.py: WebSocketConnection.send_message()
 * - message_types.py: WsMessage
 *
 * @param {WebSocket} websocket - The active WebSocket connection
 * @param {string} message - The message text to send
 */
function wsSendMessage(websocket, message) {
    // TODO 2.1: Check if websocket exists, throw error if not


    // TODO 2.2: Send a message to the server
    // Look at WsMessage structure in message_types.py
    // Required fields: event_type, username, message
    // Hint: websocket.send(JSON.stringify({ ... }))

}

/**
 * ASSIGNMENT 2b: Handle incoming WebSocket messages
 *
 * Server reference: Look at all Ws* classes in message_types.py to understand
 * the different event types and their structure
 *
 * @param {Object} message - The parsed message object from the server
 */
function wsReceiveMessage(message) {
    console.log('Received message:' + JSON.stringify(message));

    // TODO 2.3: Use a switch statement on message.event_type
    // Handle the following cases (start with just these, add more later):

    // CASE: 'message'
    // - Check if message is from self or other user
    // - If from others, call: window.addMessageToUI(message.message, "other", message.username)
    // Hint: Compare message.username === window.chatConfig.username


    // CASE: 'message_history'
    // - Loop through message.messages array
    // - For each msg, determine if it's "own" or "other"
    // - Call window.addMessageToUI for each message


    // CASE: 'connection_reject'
    // - Show error toast with message.response
    // Hint: Toast.error(message.response)


    // For now, log any unhandled message types


}


// =============================================================================
// ASSIGNMENT 3: USER NOTIFICATIONS (JOIN/LEAVE EVENTS)
// =============================================================================

/**
 * ASSIGNMENT 3: Handle user presence notifications
 *
 * Server reference:
 * - websocket_handlers.py: WebSocketManager.join_chat() broadcasts user_join
 * - websocket_handlers.py: WebSocketConnection.close() broadcasts user_leave
 * - message_types.py: WsUserJoinEvent, WsUserLeaveEvent, WsUsersOnline
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
 *
 * CASE: 'system'
 * - Call: createToastForSeverity(message.message, message.severity)
 */


// =============================================================================
// ASSIGNMENT 4: TYPING INDICATORS
// =============================================================================

/**
 * ASSIGNMENT 4: Implement typing indicators
 *
 * Server reference:
 * - websocket_handlers.py: WebSocketConnection.receive_loop() handles typing events
 * - message_types.py: WsTypingEvent
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
 *
 * Server reference:
 * - websocket_handlers.py: switch_room_for_user()
 * - message_types.py: WsRoomSwitchRequest, WsRoomSwitchResponse, WsAllRooms, WsRoomCreate
 */

/**
 * TODO 5.1: Send room switch request
 *
 * @param {WebSocket} websocket - The active WebSocket connection
 * @param {string} roomName - The name of the room to switch to
 */
function wsSendRoomSwitchReq(websocket, roomName) {
    // TODO: Send room_switch_request event
    // Structure: { event_type: 'room_switch_request', room_name: roomName }

}

/**
 * TODO 5.2: Send room chat clear request
 *
 * @param {WebSocket} websocket - The active WebSocket connection
 * @param {string} roomName - The name of the room to clear
 */
function wsSendRoomChatClear(websocket, roomName) {
    // TODO: Send room_chat_clear event
    // Structure: { event_type: 'room_chat_clear', room_name: roomName, username: ... }

}

/**
 * TODO 5.3: Handle room-related events in wsReceiveMessage()
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
window.wsSendRoomSwitchReq = wsSendRoomSwitchReq;
window.wsSendRoomChatClear = wsSendRoomChatClear;
