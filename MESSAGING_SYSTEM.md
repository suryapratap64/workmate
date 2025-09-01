# WorkMate Messaging System

A real-time messaging system built with Socket.IO for employer-worker communication in the WorkMate platform.

## Features

### Backend Features

- **Real-time messaging** using Socket.IO
- **Conversation management** between employers and workers
- **Message persistence** in MongoDB
- **Read receipts** and unread message counts
- **Typing indicators**
- **Authentication** with JWT tokens
- **Message notifications**

### Frontend Features

- **Chat list** showing all conversations
- **Real-time chat window** with message history
- **Typing indicators** showing when users are typing
- **Message notifications** for new messages
- **Responsive design** for mobile and desktop
- **Unread message badges**
- **Message timestamps**

## Backend Structure

### Models

- `Message` - Stores individual messages
- `Conversation` - Manages conversation metadata and unread counts

### Controllers

- `message.controller.js` - Handles all message-related operations

### Routes

- `message.route.js` - API endpoints for messaging

### Socket.IO

- `socket.js` - Real-time communication handling

## API Endpoints

### Conversations

- `GET /api/v1/message/conversations` - Get all conversations for user
- `POST /api/v1/message/conversations` - Create new conversation
- `PUT /api/v1/message/conversations/:id/read` - Mark messages as read

### Messages

- `GET /api/v1/message/conversations/:id/messages` - Get messages for conversation
- `POST /api/v1/message/messages` - Send a new message

## Socket.IO Events

### Client to Server

- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a new message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_as_read` - Mark messages as read

### Server to Client

- `new_message` - New message received
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `messages_read` - Messages marked as read
- `message_notification` - New message notification

## Frontend Components

### Core Components

- `SocketContext` - Manages Socket.IO connection
- `ChatList` - Displays conversation list
- `ChatWindow` - Main chat interface
- `MessagePage` - Main messaging page
- `StartConversation` - Button to start new conversations
- `MessageNotification` - Toast notifications for new messages

## Setup Instructions

### Backend Setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Add Socket.IO dependency:

   ```bash
   npm install socket.io
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Add Socket.IO client:

   ```bash
   npm install socket.io-client
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Starting a Conversation

1. Navigate to a job listing
2. Click "Message Worker" button (for clients)
3. Automatically redirected to messages page

### Sending Messages

1. Select a conversation from the chat list
2. Type your message in the input field
3. Press Enter or click Send button
4. Message appears in real-time

### Real-time Features

- Messages appear instantly for all participants
- Typing indicators show when someone is typing
- Read receipts update automatically
- Notifications appear for new messages

## Security Features

- **JWT Authentication** for all API endpoints
- **Socket.IO authentication** using JWT tokens
- **User verification** for conversation access
- **Input validation** and sanitization
- **CORS configuration** for secure cross-origin requests

## Database Schema

### Message Schema

```javascript
{
  sender: ObjectId,        // Reference to sender (Client/Worker)
  senderModel: String,     // 'Client' or 'Worker'
  receiver: ObjectId,      // Reference to receiver
  receiverModel: String,   // 'Client' or 'Worker'
  content: String,         // Message content
  messageType: String,     // 'text', 'image', 'file'
  isRead: Boolean,         // Read status
  jobId: ObjectId,        // Associated job
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Schema

```javascript
{
  jobId: ObjectId,         // Associated job
  client: ObjectId,        // Client reference
  worker: ObjectId,        // Worker reference
  lastMessage: ObjectId,   // Last message reference
  unreadCount: {
    client: Number,
    worker: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

### Backend (.env)

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

## Troubleshooting

### Common Issues

1. **Socket connection failed**

   - Check if backend server is running
   - Verify JWT token is valid
   - Check CORS configuration

2. **Messages not appearing**

   - Verify user is authenticated
   - Check conversation permissions
   - Ensure Socket.IO events are properly handled

3. **Real-time features not working**
   - Check Socket.IO connection status
   - Verify event listeners are properly set up
   - Check browser console for errors

## Future Enhancements

- File and image sharing
- Voice messages
- Video calls
- Message reactions
- Message search functionality
- Conversation archiving
- Message encryption
- Push notifications
- Message editing and deletion
- Group conversations
