# NutriForge

**Precision nutrition and performance intelligence.**

NutriForge is a premium AI-powered fitness and nutrition platform designed to help users build sustainable performance systems through personalized meal planning, workout structuring, recovery optimization, and long-term consistency tracking.

Built with a modern noir-inspired interface and backend-driven architecture, NutriForge combines intelligent AI plan generation, AI coaching, and clean product-focused UX.

---

## Features

### Authentication & User Management

* JWT-based authentication
* Secure registration and login flows
* Persistent authenticated sessions
* Protected routes

### AI Performance Plans

* AI-generated nutrition and workout plans
* Structured meal suggestions with measurable quantities
* Dynamic macros and calorie targets
* Dietary preference validation
* Vegetarian and vegan compliance checks
* Multiple saved plans per user
* Manual active plan switching

### AI Coach

* AI-powered fitness and nutrition assistant
* Personalized guidance based on user goals
* Nutrition and meal-related recommendations
* Workout and recovery suggestions
* Context-aware conversational support
* Powered by Google Gemini AI

### Dashboard Experience

* Active performance plan dashboard
* Daily calorie and macro targets
* Hydration tracking
* Daily streak system
* Weight tracking
* Skeleton shimmer loading states
* Responsive mobile-first layout

### Profile & Performance Metrics

* Age, weight, height, and activity configuration
* Goal-oriented metabolic calculations
* Diet preference management
* Workout experience tracking
* Dynamic profile syncing

### UX & Design

* Noir luxury UI system
* Responsive mobile navigation
* Reusable layout architecture
* Framer Motion interactions
* Persistent local state
* Elegant empty states and onboarding flows

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### AI

* Google Gemini API
* AI Plan Generation
* AI Coaching Assistant

### Deployment

* Vercel (Frontend)
* Render/Railway (Backend)
* MongoDB Atlas

---

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yuvraj-9999/nutriforge.git
cd nutriforge
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## Running Locally

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

---

## Project Structure

```txt
NutriForge/
├── Frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── ...
│
└── README.md
```

---

## Future Roadmap

### V2 Ideas

* Password reset flow
* Email verification
* Grocery list generation
* Meal completion tracking
* Advanced analytics dashboard
* Progress charts and visual insights
* Social accountability systems
* Voice-enabled AI coach
* PWA/mobile app support
* Wearable device integrations

---

## License

This project is licensed under the MIT License.

---

## Author

Built by Yuvraj Sabale.
