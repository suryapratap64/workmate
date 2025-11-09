# 🚀 WorkMate - Dual Dashboard Freelancing Platform

![WorkMate Banner](https://via.placeholder.com/1200x300/3b82f6/ffffff?text=WorkMate+-+Zero+Commission+Freelancing)

WorkMate is a **zero-commission**, task-based freelancing marketplace designed to connect clients and workers directly — with **no platform taxes or fees**. It offers dual dashboards (Client & Worker), real-time messaging & video calls, job posting and discovery, secure payments, and powerful search tools.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-latest-green)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Elevator Pitch](#-elevator-pitch)
- [Target Users](#-target-users)
- [Key Value Propositions](#-key-value-propositions)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#%EF%B8%8F-architecture)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Real-Time Features](#-real-time-features)
- [Security & Compliance](#-security--compliance)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Elevator Pitch

WorkMate is a **zero-commission freelancing platform** where clients post tasks and hire skilled workers (freelancers). It provides separate, optimized dashboards for clients and workers, powerful search and filtering, real-time chat and video calls, secure payments and escrow, job management, and rating systems — all built to keep transactions **transparent and people-first**.

---

## 👥 Target Users

### **Clients**
Small businesses, startups, households, or individuals who need short/long tasks done:
- Design & Creative Work
-  Development & Coding
-  Repairs & Maintenance
-  Tutoring & Education
-  Deliveries & Logistics

### **Workers (Freelancers)**
Tradespeople, developers, designers, delivery folks, tutors, and gig workers who want task-based work **without platform fees**:
-  Instant task discovery
-  Keep 100% of earnings
-  Mobile-friendly dashboard
-  Build reputation & portfolio

---

## ✨ Key Value Propositions

| Feature | Benefit |
|---------|---------|
| 🆓 **Zero Platform Fees** | Clients pay workers directly (or via escrow), maximizing workers' earnings |
| 📋 **Task-First Design** | Quick posting, clear scope, and fast matching for one-time or small gigs |
| 🎛️ **Dual Dashboards** | Tailored workflows for clients & workers for faster task lifecycle handling |
| 💬 **Real-Time Communication** | Chat + video to reduce coordination friction |
| 🔍 **Robust Discovery** | Find local or remote workers by skill, rating, availability, or price |


---

## 🌟 Features

### 🎯 **Dual User System**

#### **Client Dashboard**
- ✅ Post and manage tasks (title, description, budget, deadline, attachments)
- 👀 View applications/quotes from workers
- ✔️ Accept proposals, start escrow, and track job status
- 💬 Message and video call with applicants and hired workers
- ⭐ Rate workers and add private notes

#### **Worker Dashboard**
- 🔎 Discover tasks via feed and saved searches
- 📝 Apply or send custom quotes for tasks
- 📊 Manage active jobs, submit deliverables, request milestones
- 💵 Track earnings
- 🔔 Notifications for messages, new tasks matching skills, and application status

---

### 📋 Job Lifecycle

```mermaid
graph LR
    A[Post Task] --> B[Workers Discover]
    B --> C[Apply/Quote]
    C --> D[Client Hires]
    D --> E[Work & Communicate]
    E --> F[Deliver & Approve]
    F --> G[Payment Release]
    G --> H[Rating & Feedback]
```

1. **Post (Client)**: Quick form + optional attachments, priority tags
2. **Discover (Worker)**: Filter by location, skill tags, pay range, distance
3. **Apply/Quote**: Workers submit proposals or "apply instantly"
4. **Hire**: Client accepts and optionally places funds in escrow
5. **Work & Communicate**: Chat & video call; share files; progress updates
6. **Deliver & Approve**: Worker submits deliverable; client approves or requests revisions
7. **Payment Release**: Platform releases escrow or processes payment
8. **Rating & Feedback**: Both sides rate and review each other

---

### 💬 Real-Time Messaging & Video Calls

- **WebSocket (Socket.IO)** for real-time text messaging
-  Read receipts, typing indicators, message history
-  Image/file attachments
-  **One-click WebRTC video calls** initiated from chat
-  In-chat job references (link messages to specific task)

---



### 🔍 Discoverability & Search

- 🔎 **Full-text search** + filters: location radius, skills, rating, hourly rate
-  Geolocation-based job discovery
-  Saved searches and alerts
-  Sort by relevance, distance, rating, or recent activity

---

### 👤 Profiles & Reputation

#### **Worker Profiles**
- ✅ Verified badges
- 📂 Portfolio showcase
- 🎓 Certifications
- 💼 Work history
- ⭐ Reviews & ratings
- ⚡ Response time metrics

#### **Client Profiles**
- 📋 Job history
- 💳 Payment reliability score
- ⭐ Client ratings

---

### 🔔 Notifications & Activity

- 📱 Push notifications (web & mobile)
- 📧 Email digests
- ⚡ Real-time updates for:
  - Messages
  - Bids & proposals
  - Hires & contracts
  - Payments
  - Job milestones

---

### 🛡️ Admin Panel

- 🔨 Moderation for disputes, content, payments
- 📊 Analytics dashboards (jobs posted, active users, disputes, payouts)
- 🎚️ Feature toggles
- 🚫 Content moderation controls & user bans

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|------------|---------|
| ⚛️ React (Vite) | UI Framework |
| 📘 TypeScript | Type Safety |
| 🎨 Tailwind CSS | Styling |
| 🔄 Redux/Zustand | State Management |
| 🔌 Socket.IO Client | Real-time Messaging |
| 📹 WebRTC | Video Calls |

### **Backend**
| Technology | Purpose |
|------------|---------|
| 🟢 Node.js + Express | Server Framework |
| 🍃 MongoDB (Atlas) | Database |
| 🔴 Redis | Caching & Pub/Sub |
| 🔌 Socket.IO | WebSocket Server |
| 🔐 JWT | Authentication |
| 💳 Razorpay | Payment Processing |
| 🔥 Firebase Admin | Auth Verification |

### **DevOps**
| Technology | Purpose |
|------------|---------|
| 🐳 Docker | Containerization |
| ☸️ Kubernetes | Orchestration |
| 🔄 GitHub Actions | CI/CD |
| ☁️ AWS/DigitalOcean | Cloud Hosting |
| 📊 Prometheus/Grafana | Monitoring |

---

## 🏗️ Architecture

```
workmate/
├── backend/
│   ├── config/                     # Configuration files (DB, Firebase, etc.)
│   ├── lib/                        # Helper libraries or services
│   ├── middlewares/                # Express middlewares (auth, error handling)
│   ├── models/                     # Mongoose schemas & database models
│   ├── routes/                     # Express route definitions (API endpoints)
│   ├── scripts/                    # Utility or migration scripts
│   ├── types/                      # Type definitions (if using TypeScript)
│   ├── uploads/                    # Uploaded files or user content
│   ├── utils/                      # Utility/helper functions
│   ├── .env                        # Environment variables for backend
│   ├── index.js                    # Backend entry point (Express server)
│   └── package.json                # Backend dependencies & scripts
│
├── frontend/
│   ├── public/                     # Static assets (index.html, icons, etc.)
│   ├── src/
│   │   ├── assets/                 # Images, fonts, static resources
│   │   ├── components/             # Reusable UI components
│   │   │   ├── LandingPage.jsx     # Landing page (role selection)
│   │   │   ├── ClientDashboard.jsx # Dashboard for clients
│   │   │   ├── WorkerDashboard.jsx # Dashboard for workers
│   │   │   ├── WSignup.jsx         # Worker signup
│   │   │   ├── CSignup.jsx         # Client signup
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── MessagePage.jsx     # Chat interface
│   │   │   └── NavBar.jsx          # Navigation bar
│   │   ├── context/                # React context providers
│   │   │   └── SocketContext.jsx   # Socket.IO global provider
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Firebase or API setup
│   │   │   └── firebase.js         # Firebase configuration
│   │   ├── redux/                  # Redux store & slices
│   │   │   ├── store.js            # Redux store config
│   │   │   └── workerSlice.js      # Worker-specific state
│   │   ├── styles/                 # Global stylesheets
│   │   ├── utils/                  # Helper functions
│   │   ├── App.jsx                 # Main app component
│   │   ├── config.js               # Frontend environment constants
│   │   └── main.jsx                # App entry point
│   ├── .env                        # Environment variables
│   ├── package.json                # Dependencies & scripts
│   └── vite.config.js              # Vite configuration
│
└── README.md                       # Project documentation
```

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js v16+ (v18+ recommended)
- MongoDB (local or Atlas)
- Firebase project (for Google Sign-In)
- Payment provider account (Razorpay/Stripe) — optional for testing
- Twilio account (optional) for OTP SMS

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/suryapratap64/workmate.git
cd workmate
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### **Environment Configuration**

#### **Backend (.env)**
Create `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/workmate

# JWT Secret
SECRET_KEY=your_jwt_secret_key_here_make_it_long_and_random

# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Twilio (OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=your_stripe_secret_key

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

#### **Frontend (.env)**
Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### **Running the Application**

#### **Development Mode**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

---

## 🔌 API Endpoints

### **Authentication & Accounts**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/user/register` | Register new user | ❌ |
| POST | `/api/v1/user/login` | Login with credentials | ❌ |
| POST | `/api/v1/user/logout` | Logout user | ✅ |
| POST | `/api/v1/user/send-otp` | Send mobile OTP | ❌ |
| POST | `/api/v1/user/verify-otp` | Verify OTP | ❌ |
| POST | `/api/v1/user/google-register` | Google Sign-In | ❌ |
| GET | `/api/v1/user/me` | Get authenticated profile | ✅ |

### **Jobs**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/job` | List all jobs (with filters) | ❌ |
| POST | `/api/v1/job` | Create new job | ✅ (Client) |
| GET | `/api/v1/job/:id` | Get job details | ❌ |
| PUT | `/api/v1/job/:id` | Update job | ✅ (Client) |
| DELETE | `/api/v1/job/:id` | Delete job | ✅ (Client) |
| POST | `/api/v1/job/:id/apply` | Apply to job | ✅ (Worker) |

### **Messaging**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/message/conversations` | List user conversations | ✅ |
| GET | `/api/v1/message/:conversationId` | Get conversation messages | ✅ |
| POST | `/api/v1/message/conversation` | Create new conversation | ✅ |
| POST | `/api/v1/message/send` | Send message | ✅ |

### **Payments & Escrow**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/payment/create-checkout` | Create payment/escrow | ✅ |
| POST | `/api/v1/payment/webhook` | Payment webhook handler | ❌ |
| POST | `/api/v1/payment/release` | Release escrow to worker | ✅ (Client) |
| GET | `/api/v1/payment/history` | Payment history | ✅ |

### **Admin**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/users` | List all users | ✅ (Admin) |
| PUT | `/api/v1/admin/user/:id/ban` | Ban user | ✅ (Admin) |
| POST | `/api/v1/admin/dispute` | Resolve dispute | ✅ (Admin) |

---

## 🔄 Real-Time Features

### **Socket.IO Events**

#### **Client → Server**

```javascript
// Connection
socket.connect()
socket.disconnect()

// Messaging
socket.emit('join_conversation', { conversationId })
socket.emit('send_message', { conversationId, message, attachments })
socket.emit('typing_start', { conversationId })
socket.emit('typing_stop', { conversationId })
socket.emit('mark_as_read', { messageId })

// Video Calls
socket.emit('call:initiate', { calleeId, conversationId })
socket.emit('signal', { to, signal, type }) // offer/answer/ice
```

#### **Server → Client**

```javascript
// Messaging
socket.on('new_message', (data) => { /* handle new message */ })
socket.on('user_typing', (data) => { /* show typing indicator */ })
socket.on('message_read', (data) => { /* update read status */ })

// Notifications
socket.on('message_notification', (data) => { /* show notification */ })
socket.on('job_update', (data) => { /* job status changed */ })

// Video Calls
socket.on('incoming_call', (data) => { /* show incoming call UI */ })
socket.on('signal', (data) => { /* handle WebRTC signal */ })
```

### **WebRTC Video Call Flow**

```mermaid
sequenceDiagram
    participant Caller
    participant Server
    participant Callee
    
    Caller->>Server: call:initiate
    Server->>Callee: incoming_call
    Caller->>Server: signal (offer)
    Server->>Callee: signal (offer)
    Callee->>Server: signal (answer)
    Server->>Caller: signal (answer)
    Caller->>Server: signal (ice)
    Server->>Callee: signal (ice)
    Note over Caller,Callee: P2P connection established
```

---

## 🔐 Security & Compliance

### **Authentication**
- ✅ JWT tokens with HttpOnly cookies
- ✅ Short-lived access tokens + refresh tokens
- ✅ Firebase ID token verification for Google Sign-In
- ✅ Secure password hashing (bcrypt)

### **Data Protection**
- 🔒 HTTPS enforcement with HSTS
- 🔒 Encrypted sensitive data at rest
- 🔒 Input validation & sanitization
- 🔒 Rate limiting on all endpoints
- 🔒 CORS configuration

### **Compliance**
- ✅ GDPR compliant (data export & deletion)
- ✅ KYC & AML checks for payments
- ✅ Privacy policy & terms of service
- ✅ Cookie consent management

### **Best Practices**
```javascript
// Middleware example
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error('Unauthorized');
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

---

## 📦 Deployment

### **Frontend Deployment (Vercel/Netlify)**

```bash
cd frontend
npm run build

# Deploy dist/ folder to:
# - Vercel: vercel deploy
# - Netlify: netlify deploy --prod
# - S3 + CloudFront for AWS
```

### **Backend Deployment (Docker)**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]
```

```bash
docker build -t workmate-backend .
docker run -p 8000:8000 --env-file .env workmate-backend
```

### **Production Checklist**

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB (Atlas)
- [ ] Set up Redis for caching
- [ ] Configure TURN servers for WebRTC
- [ ] Enable SSL/TLS certificates
- [ ] Set up monitoring (Sentry, Prometheus)
- [ ] Configure CDN for static assets
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Enable logging (Winston, Morgan)

---

## 🔮 Future Enhancements

### **Planned Features**
- [ ] 📱 Native mobile apps (React Native)
- [ ] 🤖 AI-powered job matching
- [ ] 🌍 Multi-language support
- [ ] 📊 Advanced analytics dashboard
- [ ] 🎓 Skills verification & certification
- [ ] 💼 Team collaboration features
- [ ] 📅 Calendar integration
- [ ] 🔔 Advanced notification preferences

### **Technical Improvements**
- [ ] GraphQL API option
- [ ] Microservices architecture
- [ ] Elasticsearch for advanced search
- [ ] Machine learning recommendations
- [ ] Automated testing (Jest, Cypress)
- [ ] Performance optimization
- [ ] CDN integration
- [ ] Advanced caching strategies

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Code Style**
- Use ESLint & Prettier (configs provided)
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### **Pull Request Guidelines**
- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update README if needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- 📧 Email: support@workmate.com
- 🐛 Issues: [GitHub Issues](https://github.com/suryapratap64/workmate/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/suryapratap64/workmate/discussions)
- 📖 Documentation: [Wiki](https://github.com/suryapratap64/workmate/wiki)

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- Socket.IO for real-time capabilities
- MongoDB for flexible data storage
- All contributors and supporters

---

<div align="center">

**Made by surya Pratap**

⭐ Star us on GitHub — it helps!

[Website](https://workmate.com) • [Documentation](https://docs.workmate.com) • [Blog](https://blog.workmate.com)

</div>