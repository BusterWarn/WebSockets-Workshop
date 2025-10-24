// config.js - Configuration settings for the chat application

// Fill in username and server address here to not get prompted!
const CONFIG = {
    username: '',
    room_name: '',
    // Just input server:port, omit http:// or ws://
    backend_server_address: 'localhost:5000',
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
    let suffix = `/${window.chatConfig.room_name}`;
    if (!window.chatConfig.room_name) {
        suffix = '';
    }

    if (window.chatConfig.use_https) {
        return `https://${window.chatConfig.backend_server_address}${suffix}`;
    }
    return `http://${window.chatConfig.backend_server_address}${suffix}`;
}

function getWsAddress() {
    let suffix = `/${window.chatConfig.room_name}`;
    if (!window.chatConfig.room_name) {
        suffix = '';
    }

    if (window.chatConfig.use_https) {
        return `wss://${window.chatConfig.backend_server_address}/ws${suffix}`;
    }
    return `ws://${window.chatConfig.backend_server_address}/ws${suffix}`;
}

// Export config for use in other files
window.chatConfig = getConfig();
window.getRestAddress = getRestAddress;
window.getWsAddress = getWsAddress;
