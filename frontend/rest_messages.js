/**
 * Chat Client JavaScript Functions
 * Pure JavaScript functions to interact with the FastAPI chat backend
 */

/**
 * Connect a user and get all chat data
 * @param {string} serverUrl - Base URL of the server (e.g., "http://localhost:8000")
 * @param {string} username - Username to connect with
 * @returns {Promise<Object>} - Promise resolving to chat data or error
 */
async function connectUser(serverUrl, username) {
    try {
        const response = await fetch(`${serverUrl}/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error connecting user:', error);
        throw error;
    }
}

/**
 * Send a message to the chat
 * @param {string} serverUrl - Base URL of the server
 * @param {string} username - Username sending the message
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Promise resolving to success response or error
 */
async function sendMessage(serverUrl, username, message) {
    try {
        const response = await fetch(`${serverUrl}/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        Toast.error(`Error sending message: ${error}`);
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Get all chat messages only
 * @param {string} serverUrl - Base URL of the server
 * @returns {Promise<Object>} - Promise resolving to messages array or error
 */
async function getAllMessages(serverUrl) {
    try {
        const response = await fetch(`${serverUrl}/messages`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        Toast.error(`Error getting messages: ${error}`);
        console.error('Error getting messages:', error);
        throw error;
    }
}

/**
 * Get chat data (messages + users) with username
 * @param {string} serverUrl - Base URL of the server
 * @param {string} username - Username to refresh with
 * @returns {Promise<Object>} - Promise resolving to full chat data or error
 */
async function getChatData(serverUrl, username) {
    try {
        const response = await fetch(`${serverUrl}/chat-data/${encodeURIComponent(username)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        Toast.error(`Error getting chat data: ${error}`);
        console.error(`Error getting chat data: ${error}`);
        throw error;
    }
}

/**
 * Clear all chat messages and users (for testing)
 * @param {string} serverUrl - Base URL of the server
 * @returns {Promise<Object>} - Promise resolving to success response or error
 */
async function clearChat(serverUrl) {
    try {
        const response = await fetch(`${serverUrl}/clear-chat`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error clearing chat:', error);
        throw error;
    }
}

