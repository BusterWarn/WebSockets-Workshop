globalThis.websocket = null;
globalThis.lastActivity = performance.now();
globalThis.isTyping = false;

const WS_EVENT_TYPES = {
    connection_request: 'connection_request',
    connection_reject: 'connection_reject',
    message: 'message',
    message_history: 'message_history',
    typing: 'typing',
    system: 'system',
    users_online: 'users_online',
    user_join: 'user_join',
    user_leave: 'user_leave',
};

window.addEventListener('keydown', (_event) => {
    if (!globalThis.websocket) {
        return;
    }

    if (!globalThis.isTyping) {
        globalThis.isTyping = true;
        globalThis.lastActivity = performance.now();
        // Send a new typing event
        const isTypingMessage = {
            event_type: WS_EVENT_TYPES.typing,
            username: window.chatConfig.username,
            is_typing: true,
        };
        globalThis.websocket.send(JSON.stringify(isTypingMessage));
    }
})

// Interval for determining activity/typing status
window.setInterval(() => {
    if (!globalThis.websocket) { return }

    if (!globalThis.isTyping) {
        return;
    }

    if ((performance.now() - globalThis.lastActivity) > 2500) {
        globalThis.isTyping = false;
        const isTypingMessage = {
            event_type: WS_EVENT_TYPES.typing,
            username: window.chatConfig.username,
            is_typing: false,
        };
        globalThis.websocket.send(JSON.stringify(isTypingMessage));
    }

}, 500)

async function wsConnectUser(serverUrl, username) {
    try {
        globalThis.websocket = new WebSocket(`${serverUrl}/ws`);

        globalThis.websocket.addEventListener('error', (e) => {
            console.error('WebSocket error:', e);
        });

        globalThis.websocket.addEventListener('open', () => {
            console.log('WebSocket connection opened');
            globalThis.websocket.send(JSON.stringify({
                event_type: WS_EVENT_TYPES.connection_request,
                username: username,
            }));
        });

        globalThis.websocket.addEventListener('close', () => {
            console.log('WebSocket connection closed');
            globalThis.websocket = null;
        });

        globalThis.websocket.addEventListener('message', (msg) => {
            const message = JSON.parse(msg.data);
            wsReceiveMessage(message);
        });

    } catch (error) {
        console.error('Error connecting user:', error);
        throw error;
    }
}

async function wsSendMessage(websocket, message) {
    if (!websocket) {
        throw new Error('WebSocket is not connected');
    }

    websocket.send(JSON.stringify(
        {
            event_type: WS_EVENT_TYPES.message,
            username: window.chatConfig.username,
            message: message,
        }
    ))
}

function wsReceiveMessage(message) {
    console.log('Received message:' + JSON.stringify(message));
    switch (message.event_type) {
        case WS_EVENT_TYPES.message:
            const own = message.username === window.chatConfig.username;
            if (!own) {
                window.addMessageToUI(message.message, own, message.username);
            }
            break;
        case WS_EVENT_TYPES.users_online:
            window.addSelfAsOnline();
            message.users.forEach((user) => {
                if (user.username !== window.chatConfig.username) {
                    window.addMemberToList(user.username, user.status);
                }
            });
            window.updateOnlineCount();
            break;
        case WS_EVENT_TYPES.user_join:
            if (message.username === window.chatConfig.username) {
                return;
            }
            Toast.info(`User ${message.username} joined the chat`);
            window.addMemberToList(message.username, 'online');
            window.updateOnlineCount();
            break;
        case WS_EVENT_TYPES.user_leave:
            if (message.username === window.chatConfig.username) {
                return;
            }
            Toast.info(`User ${message.username} left the chat`);
            window.removeMemberFromList(message.username);
            window.updateOnlineCount();
            break;
        case WS_EVENT_TYPES.system:
            createToastForSeverity(message.message, message.severity);
            break;
        case WS_EVENT_TYPES.typing:
            updateMemberStatus(message.username, message.is_typing ? 'typing' : 'online');
            break;
        case WS_EVENT_TYPES.connection_reject:
            createToastForSeverity(message.response, 'error');
            break;
        default:
            console.log('Received unknown message:' + JSON.stringify(message));
    }
}

function createToastForSeverity(message, severity) {
    switch (severity) {
        case 'success':
            Toast.success(message);
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
