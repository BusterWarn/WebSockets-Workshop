# Chat Backend API Documentation

## Installation (Without Virtual Environment)

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Save the code to a file** (e.g., `chat_app.py`)

3. **Run the server:**
   ```bash
   python chat_app.py
   ```

   The server will start at `http://localhost:8000`

4. **View interactive docs** (optional):
   Visit `http://localhost:8000/docs` in your browser

## Running Inside a Virtual Environment
1. **Create a virtual environment**:
```bash
python3 -m venv environment
```

If 1. does not create a `environment/bin/activate` file run the command again.

2. **Activate the virtual environment**:
On Linux, this is done with:
```bash
source environment/bin/activate
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

## API Endpoints

### 1. Connect User and Get All Data
**POST** `/connect`

Connect a user and retrieve all chat messages and connected users.

**Request Body:**
```json
{
  "username": "alice"
}
```

**Response:**
```json
{
  "messages": [
    {
      "username": "bob",
      "message": "Hello!",
      "timestamp": "2025-09-26T10:30:00.123456"
    }
  ],
  "connected_users": [
    {
      "username": "alice",
      "connected_at": "2025-09-26T10:31:00.123456"
    },
    {
      "username": "bob",
      "connected_at": "2025-09-26T10:30:00.123456"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/connect" \
     -H "Content-Type: application/json" \
     -d '{"username": "alice"}'
```

### 2. Send Message
**POST** `/send-message`

Send a message to the chat.

**Request Body:**
```json
{
  "username": "alice",
  "message": "Hello everyone!"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Message sent"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/send-message" \
     -H "Content-Type: application/json" \
     -d '{"username": "alice", "message": "Hello everyone!"}'
```

### 3. Get All Messages
**GET** `/messages`

Get all chat messages only.

**Response:**
```json
{
  "messages": [
    {
      "username": "alice",
      "message": "Hello everyone!",
      "timestamp": "2025-09-26T10:30:00.123456"
    },
    {
      "username": "bob",
      "message": "Hi Alice!",
      "timestamp": "2025-09-26T10:31:00.123456"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/messages"
```

### 4. Get Chat Data (Alternative)
**GET** `/chat-data/{username}`

Alternative way to get all data with username in the URL.

**Response:** Same as `/connect` endpoint

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/chat-data/alice"
```

### 5. Clear Chat (Testing)
**DELETE** `/clear-chat`

Clear all messages and users.

**Response:**
```json
{
  "status": "success",
  "message": "Chat cleared"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:8000/clear-chat"
```

## Usage Flow

1. **Connect a user:** POST to `/connect` with username
2. **Send messages:** POST to `/send-message` with username and message
3. **Get updates:** GET `/messages` or GET `/chat-data/{username}` to refresh
4. **Clear for testing:** DELETE `/clear-chat` to start fresh

## Notes

- All data is stored in memory (lost when server restarts)
- No authentication or security features
- Timestamps are in ISO format
- Empty usernames or messages will return 400 error
