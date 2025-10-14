globalThis.websocket = null;

const WS_EVENT_TYPES = {
    message: 'message',
    typing: 'typing',
    system: 'system',
    user_join: 'user_join',
    user_leave: 'user_leave',
};

async function wsConnectUser(serverUrl, username) {
    try {
        globalThis.websocket = new WebSocket(`${serverUrl}/ws`);

        globalThis.websocket.addEventListener('error', (e) => {
            console.error('WebSocket error:', e);
        });

        globalThis.websocket.addEventListener('open', () => {
            console.log('WebSocket connection opened');
            globalThis.websocket.send(JSON.stringify({
                username: username,
                subscribe_for_events: []
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
    switch (message.event_type) {
        case WS_EVENT_TYPES.message:
            const own = message.username === window.chatConfig.username;
            window.addMessageToUI(message.message, own, message.username);
            break;
        default:
            console.log('Unknown event type:', message.event_type);
    }
}
