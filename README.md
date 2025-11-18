# Portfolio Advisory Dashboard

## Overview
A full‑stack SaaS product for financial advisors to manage Indian equity portfolios and receive automated Buy/Hold/Sell signals.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Sequelize, PostgreSQL
- **Auth**: JWT
- **Charts**: Recharts (or Chart.js)

## Prerequisites
- Node.js >= 18
- npm or yarn
- PostgreSQL database

## Development Setup
```bash
# Clone repo
git clone <repo-url>
cd <repo-dir>

# Install frontend deps
npm install

# Install backend deps
cd backend && npm install && cd ..

# Create .env file from template
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

# Run database migrations (using Sequelize CLI or custom script)
# Example placeholder command:
# npx sequelize-cli db:migrate

# Start development servers
# Frontend
npm run dev   # Vite dev server on http://localhost:3000
# Backend (in another terminal)
cd backend && npm run dev   # Express server on http://localhost:4000
```

## Build & Production
```bash
# Frontend build
npm run build   # Generates ./dist

# Backend production start
cd backend && npm start
```

## Testing
- Frontend: `npm run test`
- Backend: `cd backend && npm test`

## Deployment
Deploy the `dist` folder to any static host (Netlify, Vercel) and run the backend on a Node‑compatible server (AWS EC2, Render, Railway). Ensure environment variables are set in the hosting platform.

## License
MIT
