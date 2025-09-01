# 🚀 WorkMate - Dual Dashboard Platform

A comprehensive freelancing platform similar to Upwork with separate dashboards for clients and workers, featuring real-time messaging, job management, and secure payments.

## ✨ Features

### 🎯 **Dual User System**

- **Client Dashboard**: Job posting, worker management, payment tracking
- **Worker Dashboard**: Job browsing, applications, earnings tracking
- **Role-based Registration**: Separate signup flows for clients and workers

### 💬 **Real-time Messaging**

- Socket.IO powered chat system
- Message notifications
- Typing indicators
- Read receipts
- Conversation management

### 📊 **Dashboard Analytics**

- **Client Dashboard**: Job statistics, spending analytics, worker overview
- **Worker Dashboard**: Earnings tracking, application status, rating system

### 🔐 **Security & Authentication**

- JWT-based authentication
- OTP verification for registration
- Secure cookie management
- Role-based access control

## 🏗️ Architecture

### **Frontend (React + Vite)**

```
frontend/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx          # Role selection landing page
│   │   ├── ClientDashboard.jsx       # Client dashboard with tabs
│   │   ├── WorkerDashboard.jsx       # Worker dashboard with tabs
│   │   ├── WSignup.jsx              # Worker registration with OTP
│   │   ├── CSignup.jsx              # Client registration with OTP
│   │   ├── Login.jsx                # Authentication
│   │   ├── MessagePage.jsx          # Chat interface
│   │   ├── NavBar.jsx               # Navigation with logout
│   │   └── Layout.jsx               # App layout wrapper
│   ├── context/
│   │   └── SocketContext.jsx        # Socket.IO context
│   ├── redux/
│   │   ├── store.js                 # Redux store configuration
│   │   └── workerSlice.js           # State management
│   └── main.jsx                     # App entry point
```

### **Backend (Node.js + Express)**

```
backend/
├── controllers/
│   ├── user.controller.js           # Authentication & user management
│   ├── job.controller.js            # Job CRUD operations
│   └── message.controller.js        # Messaging API
├── models/
│   ├── worker.model.js              # Worker schema
│   ├── client.model.js              # Client schema
│   ├── job.model.js                 # Job schema
│   ├── message.model.js             # Message schema
│   └── conversation.model.js        # Conversation schema
├── routes/
│   ├── user.route.js                # Auth routes
│   ├── job.route.js                 # Job routes
│   └── message.route.js             # Message routes
├── utils/
│   ├── socket.js                    # Socket.IO server
│   └── db.js                       # Database connection
└── index.js                        # Server entry point
```

## 🚀 Quick Start

### **Prerequisites**

- Node.js (v16+)
- MongoDB
- Twilio Account (for OTP)

### **1. Clone & Install**

```bash
git clone <repository-url>
cd workmate

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **2. Environment Setup**

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env)**

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/workmate
SECRET_KEY=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
FRONTEND_URL=http://localhost:5173
```

### **3. Start Servers**

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

### **4. Access Application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

## 📱 User Flow

### **Registration Process**

1. **Landing Page**: Choose role (Worker/Client)
2. **Role-specific Signup**: Complete registration with OTP verification
3. **Dashboard Redirect**: Automatic redirect to appropriate dashboard

### **Client Journey**

1. **Register as Client** → `/csignup`
2. **Client Dashboard** → `/client-dashboard`
3. **Post Jobs** → `/postjob`
4. **Manage Workers** → Dashboard tabs
5. **Real-time Chat** → `/message`

### **Worker Journey**

1. **Register as Worker** → `/wsignup`
2. **Worker Dashboard** → `/worker-dashboard`
3. **Browse Jobs** → Dashboard tabs
4. **Apply to Jobs** → Job application system
5. **Track Earnings** → Earnings analytics

## 🎨 Dashboard Features

### **Client Dashboard**

- **Overview Tab**: Recent jobs, worker statistics
- **My Jobs Tab**: Job management, applications tracking
- **Workers Tab**: Hired workers, ratings, communication
- **Messages Tab**: Real-time chat with workers

### **Worker Dashboard**

- **Overview Tab**: Recent applications, recommended jobs
- **Find Jobs Tab**: Job browsing, filtering, applications
- **My Applications Tab**: Application status tracking
- **Earnings Tab**: Revenue analytics, payment history
- **Messages Tab**: Chat with clients

## 💬 Messaging System

### **Socket.IO Events**

- `join_conversation`: Join chat room
- `send_message`: Send real-time message
- `typing_start/stop`: Typing indicators
- `mark_as_read`: Read receipts
- `message_notification`: Push notifications

### **API Endpoints**

- `GET /api/v1/message/conversations` - Get user conversations
- `GET /api/v1/message/:conversationId` - Get conversation messages
- `POST /api/v1/message/conversation` - Create new conversation
- `POST /api/v1/message/send` - Send message
- `PUT /api/v1/message/:conversationId/read` - Mark as read

## 🔧 API Endpoints

### **Authentication**

- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/logout` - User logout
- `POST /api/v1/user/send-otp` - Send OTP
- `POST /api/v1/user/verify-otp` - Verify OTP

### **Jobs**

- `GET /api/v1/job` - Get all jobs
- `POST /api/v1/job` - Create job
- `PUT /api/v1/job/:id` - Update job
- `DELETE /api/v1/job/:id` - Delete job

### **Messaging**

- `GET /api/v1/message/conversations` - Get conversations
- `GET /api/v1/message/:conversationId` - Get messages
- `POST /api/v1/message/conversation` - Create conversation
- `POST /api/v1/message/send` - Send message

## 🛠️ Technology Stack

### **Frontend**

- **React 18** - UI framework
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation

### **Backend**

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time server
- **JWT** - Authentication
- **Twilio** - SMS OTP
- **bcrypt** - Password hashing

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **OTP Verification**: SMS-based registration verification
- **Password Hashing**: bcrypt encryption
- **CORS Protection**: Cross-origin security
- **Input Validation**: Request sanitization
- **Role-based Access**: User permission system

## 📊 Database Schema

### **User Models**

- **Worker**: Skills, hourly rate, portfolio
- **Client**: Company info, payment history

### **Job Model**

- Title, description, budget, skills required
- Client reference, status, applications

### **Message System**

- **Conversation**: Links job, client, worker
- **Message**: Content, sender, receiver, timestamps

## 🚀 Deployment

### **Environment Variables**

Set up production environment variables:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
SECRET_KEY=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### **Build Commands**

```bash
# Frontend build
cd frontend
npm run build

# Backend start
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@workmate.com or create an issue in the repository.

---

**Built with ❤️ for the freelancing community**
