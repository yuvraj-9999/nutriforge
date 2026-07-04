# NutriForge

**Precision Nutrition & Performance Intelligence**

NutriForge is an AI-powered fitness and nutrition platform designed to help users build sustainable performance systems through personalized nutrition planning, intelligent workout guidance, recovery optimization, and long-term consistency tracking.

Built using a modern full-stack architecture, NutriForge combines AI-generated performance plans, contextual AI coaching, secure authentication, and a premium user experience to help athletes and fitness enthusiasts achieve measurable results.

---

## Features

### Authentication & User Management

- JWT-based authentication
- Secure registration and login
- Protected routes
- Persistent authenticated sessions
- User profile management
- Password reset via secure email
- Production-ready session expiration handling

### AI Performance Plans

- AI-generated nutrition and workout plans
- Personalized calorie and protein targets
- Structured meal recommendations
- Goal-based plan generation
- Vegetarian and vegan diet support
- Multiple saved plans per user
- Active plan management
- AI-powered plan regeneration

### AI Coach

- Context-aware fitness and nutrition assistant
- Personalized recommendations using:
  - User profile
  - Active performance plan
  - Conversation history
- Nutrition guidance
- Workout support
- Recovery recommendations
- Habit & consistency coaching
- Powered by Google Gemini AI

### Dashboard Experience

- Active performance plan dashboard
- Daily calorie targets
- Daily protein targets
- Hydration tracking
- Weight tracking
- Daily streak system
- Skeleton loading states
- Fully responsive experience

### Profile & Performance Metrics

- Age, height, and weight tracking
- Activity level management
- Goal-oriented planning
- Workout experience tracking
- Diet preference configuration
- Dynamic profile synchronization

### User Experience

- Premium dark-themed UI
- Mobile-first responsive design
- Framer Motion animations
- React Hot Toast notifications
- Persistent local state
- Elegant onboarding experience
- Reusable component architecture

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- React Hot Toast

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Resend Email API

### AI

- Google Gemini API
- AI Nutrition Plan Generation
- AI Workout Planning
- AI Coaching Assistant

### DevOps

- Docker
- Docker Compose

### Deployment

- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas
- Resend (Transactional Emails)

---

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

RESEND_API_KEY=your_resend_api_key

APP_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yuvraj-9999/nutriforge.git
cd nutriforge
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Running Locally

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## Running With Docker

### Prerequisites

- Docker Desktop installed
- Backend `.env` configured
- Frontend `.env` configured

### Build & Start Containers

```bash
docker compose up --build
```

### Start Existing Containers

```bash
docker compose up
```

### Stop Containers

```bash
docker compose down
```

### View Running Containers

```bash
docker compose ps
```

### View Logs

```bash
docker compose logs -f
```

After startup:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:5000
```

---

## Project Structure

```text
NutriForge/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   └── .dockerignore
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
│
└── README.md
```

---

## API Features

### Authentication

- User Registration
- User Login
- JWT Authentication
- Profile Management
- Forgot Password
- Password Reset
- Secure Session Expiration Handling

### Performance Plans

- Generate AI Performance Plan
- Regenerate Existing Plan
- Activate Plan
- Delete Plan
- Fetch User Plans

### AI Coach

- Context-Aware Conversations
- Conversation History
- Personalized Guidance
- Profile-Aware Responses
- Active Plan Integration

---

## Security

- Passwords hashed with Bcrypt
- JWT Authentication
- Protected API routes
- Secure password reset tokens
- SHA-256 hashed reset tokens
- One-time password reset links
- Password reset expiration
- Session expiration handling
- Environment variable configuration
- Transactional emails through Resend

---

## Future Roadmap

### Version 2

- Email Verification
- Grocery List Generation
- Meal Completion Tracking
- Workout Completion Tracking
- Advanced Analytics Dashboard
- Progress Charts & Insights
- Coach Memory Optimization
- Social Accountability Features
- Voice-Enabled AI Coach
- Progressive Web App (PWA)
- Wearable Device Integrations

### Version 3

- AI Check-ins
- Smart Habit Tracking
- Multiple Coach Personalities
- Community Challenges
- Team Coaching
- Subscription System

---

## Live Demo

**Frontend**

https://nutriforge.goslings.online

---

## License

This project is licensed under the MIT License.

---

## Author

**Yuvraj Sabale**

Built using React, Node.js, Express.js, MongoDB Atlas, Docker, Google Gemini AI, and Resend.