# NeuroTrack – AI Cognitive Performance System

NeuroTrack is a professional cognitive performance analytics platform that tracks user focus behavior, calculates productivity metrics, predicts burnout risk, and generates AI-driven adaptive study plans using Google Gemini.

## 🚀 Features

- **JWT Authentication**: Secure login, registration, and session rotation.
- **Focus Session Tracking**: Deep work monitoring with energy and distraction logging.
- **Productivity Scoring Engine**: Multi-factor scoring (Focus, Tasks, Streaks, Distractions).
- **Burnout Mitigation**: Trend analysis using weighted risk scoring.
- **AI Insights**: Personalized cognitive coaching and adaptive plans via Gemini AI.
- **Dynamic Analytics**: Real-time weekly trends and activity history.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Chart.js.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **AI**: Google Generative AI (Gemini 1.5 Flash).
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize, XSS-Clean, HPP.

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Google Gemini API Key

### 2. Environment Configuration
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@neurotrack.ai
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=your_gemini_key
```

### 3. Running Locally

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## 🚢 Deployment Guide

### Deployment Checklist
- [ ] Set `NODE_ENV=production`.
- [ ] Update `FRONTEND_URL` in backend `.env` to your production domain.
- [ ] Ensure `GEMINI_API_KEY` is set in production environment variables.

### Building for Production
**Frontend Build:**
```bash
cd client
npm run build
```
This generates a `dist` folder. You can host this on Vercel, Netlify, or serve it via your Node.js backend.

**Backend Deployment:**
The backend can be deployed to Render, Heroku, or AWS. Ensure all environment variables are properly configured in the dashboard of your hosting provider.

## 📄 License
ISC
