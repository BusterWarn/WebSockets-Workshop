// config.js - Configuration settings for the chat application

// Fill in username and server address here to not get prompted!
const CONFIG = {
    username: '',
    backend_server_address: 'http://localhost:5000',
    ws_server_address: 'ws://localhost:5000/ws',
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

// Export config for use in other files
window.chatConfig = getConfig();
