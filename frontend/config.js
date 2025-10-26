// config.js - Configuration settings for the chat application

// Fill in username and server address here to not get prompted!
const CONFIG = {
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
};

// Function to get configuration values, prompting user if needed
function getConfig() {
    const config = { ...CONFIG };

    // Check if username is set
    if (!config.username || config.username.trim() === '') {
        const promptedUsername = prompt('Please enter your username:');
        if (promptedUsername && promptedUsername.trim() !== '') {
            config.username = promptedUsername.trim();
        } else {
            alert('Username is required to use the chat application.');
            return null;
        }
    }

    // Check if backend server address is set
    if (!config.backend_server_address || config.backend_server_address.trim() === '') {
        const promptedAddress = prompt('Please enter the backend server address (e.g., ws://localhost:3000):');
        if (promptedAddress && promptedAddress.trim() !== '') {
            config.backend_server_address = promptedAddress.trim();
        } else {
            alert('Backend server address is required to use the chat application.');
            return null;
        }
    }

    return config;
}

function getRestAddress() {
    const suffix = getRoomSuffix();
    if (window.chatConfig.use_https) {
        return `https://${window.chatConfig.backend_server_address}${suffix}`;
    }
    return `http://${window.chatConfig.backend_server_address}${suffix}`;
}

function getWsAddress() {
    const suffix = getRoomSuffix();

    if (window.chatConfig.use_https) {
        return `wss://${window.chatConfig.backend_server_address}/ws${suffix}`;
    }
    return `ws://${window.chatConfig.backend_server_address}/ws${suffix}`;
}

// The backend server has two endpoints for http and websockets,
// one general endpoint that is used for the global room, and another
// endpoint for each specific room.
function getRoomSuffix() {
    if (!window.chatConfig.room_name) {
        return '';
    }
    return `/${window.chatConfig.room_name}`;
}

// Export config for use in other files
window.chatConfig = getConfig();
window.getRestAddress = getRestAddress;
window.getWsAddress = getWsAddress;
