# 🛡️ SafeSphere - Personal Safety & Emergency Assistance Platform

SafeSphere is a full-stack personal safety, emergency assistance, and community alert platform designed for everyone. It empowers users with real-time emergency SOS signaling, live location tracking, safe journey watchdog timing, crowd-sourced incident reporting, nearby emergency services mapping, community safety alerts, and an administrative command console.

---

## 🚀 Key Features

- 🚨 **Emergency SOS Signal**: Hold-for-2.5s radial panic button with emergency category selection (Panic, Medical, Fire, Crime). Triggers live position broadcasting and SMS alert notifications to trusted contacts.
- 🗺️ **Interactive Safety Map**: OpenStreetMap Leaflet integration rendering user position, active SOS events, police stations, ER hospitals, fire departments, and crowd incident reports with point-and-click pin reporting.
- 🚗 **Safe Journey Mode**: Automated watchdog timer with periodic check-ins. Auto-escalates to an emergency SOS alert if expected arrival time passes without user check-in.
- 📢 **Crowd-Sourced Incident Feed**: Community hazard reporting with category/severity tags, upvoting confirmations, and admin verification status.
- 📚 **Emergency Directory**: 24/7 verified national toll-free emergency hotlines (112, 100, 102, 101, 1078, 15100) with click-to-call links (`tel:`) and nearby service points.
- 🤖 **AI Safety Assistant**: Interactive safety guard offering guidance for self-defense, travel safety, and medical emergency first aid (supports OpenAI API with a built-in safety engine fallback).
- 👤 **User & Medical Profile**: Trusted emergency contacts CRUD manager and medical profile editor (blood group, allergies, pre-existing conditions).
- 🛡️ **Admin Command Console**: Live emergency metrics, real-time community alert broadcasts, incident moderation queue, and user role management.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Dark Glassmorphism UI)
- **Routing**: React Router v6 (Protected & Admin route guards)
- **Mapping**: Leaflet.js (`react-leaflet` + OpenStreetMap tiles)
- **Real-Time**: Socket.IO Client (`socket.io-client`)
- **HTTP Client**: Axios with Bearer token interceptor

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM (2DSphere spatial indexes)
- **Authentication**: JSON Web Tokens (JWT) + Password Hashing (`bcryptjs`)
- **Real-Time**: Socket.IO WebSockets Server
- **Background Tasks**: Safe Journey Watchdog interval scheduler
- **Integrations**: Twilio SMS fallback service & OpenAI API wrapper

---

## 📁 Directory Structure

```
SafeSphere/
├── backend/
│   ├── config/             # DB & Socket.IO initialization
│   ├── controllers/        # Express API controllers (Auth, SOS, Incidents, Admin, etc.)
│   ├── middlewares/        # JWT Protect, Admin Role Guard, Centralized Error Handler
│   ├── models/             # Mongoose Schemas (User, SOSAlert, IncidentReport, SafeJourney, etc.)
│   ├── routes/             # Express API Routes
│   ├── services/           # Socket service, Twilio SMS mock, AI engine, Watchdog scheduler
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   └── server.js           # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI, SafeMap, PanicButton, SOSActiveModal, Navbar
│   │   ├── context/        # AuthContext, LocationContext, SocketContext
│   │   ├── pages/          # HomePage, MapPage, JourneyPage, IncidentsPage, ProfilePage, AdminPage, etc.
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         # App router & providers
│   │   ├── main.jsx
│   │   └── index.css       # Tailwind CSS & custom animations
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 📦 Getting Started & Local Setup

### Prerequisites
- Node.js (v18 or higher) & npm
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/safesphere` or MongoDB Atlas URI)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create local environment configuration file
cp .env.example .env

# Start backend server in development mode
npm run dev
```

*Backend server will start listening on `http://localhost:5000`.*

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create local environment configuration file
cp .env.example .env

# Start frontend Vite development server
npm run dev
```

*Frontend app will open at `http://localhost:3000`.*

---

## ⚙️ Environment Variables Placeholder Reference

### Backend (`backend/.env.example`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/safesphere
JWT_SECRET=your_jwt_secret_key_here_change_in_production
TWILIO_ACCOUNT_SID=your_twilio_account_sid_placeholder
TWILIO_AUTH_TOKEN=your_twilio_auth_token_placeholder
TWILIO_PHONE_NUMBER=+1234567890
OPENAI_API_KEY=your_openai_api_key_placeholder
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🧪 Testing & Verification

- **Backend Health Check**: Open `http://localhost:5000/api/v1/health` in browser or curl.
- **Frontend Production Build Check**: Run `npm run build` in the `frontend` folder.
- **Automated API Verification Script**: Run `node test_api.js` in the `backend` folder.

---

## 🎓 Academic Project Context
SafeSphere was designed and built as a major college computer science project emphasizing modern full-stack web architecture, real-time WebSocket communication, geospatial spatial database querying, automated watchdog background scheduling, and personal safety technology.
