# Portfolio Advisory Application

## Overview
A full‑stack web app for advisors to manage Indian equity client portfolios and receive automated Buy/Hold/Sell signals.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, TypeScript, TypeORM, PostgreSQL
- **Auth**: JWT with role‑based access (advisor)

## Prerequisites
- Node.js >= 18
- PostgreSQL database
- Git

## Setup (Development)
```bash
# Clone repo
git clone <repo-url>
cd portfolio-advisory

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Edit .env with your DB credentials

# Run database migrations (TypeORM will sync automatically on start)

# Start both frontend and backend (concurrently)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:4000/api`.

## Build (Production)
```bash
# Build frontend
npm run build
# Start backend
npm start
```

## Testing
```bash
# Backend tests
npm run test:backend
# Frontend tests
npm run test:frontend
```

## Deployment
1. Build the frontend (`npm run build`).
2. Copy the `dist` folder to a static file server (NGINX, Vercel, Netlify).
3. Deploy the backend to a Node.js host (Heroku, Render, AWS EC2). Ensure environment variables are set.

## API Documentation
- `POST /api/auth/login` – returns JWT
- `GET /api/portfolios` – list portfolios (advisor only)
- `POST /api/portfolios` – create portfolio
- `GET /api/portfolios/:id` – portfolio detail
- `GET /api/portfolios/:id/signals` – latest advisory signals

## License
MIT