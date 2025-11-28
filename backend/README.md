# Portfolio Advisory Backend

## Overview
A lightweight Express API written in **TypeScript** that provides:
- JWT‑based authentication (`/auth/login`).
- Protected portfolio endpoints (`/portfolios`, `/portfolios/{id}`).
- In‑memory mock data (replace with PostgreSQL for production).
- OpenAPI 3.0 documentation available at `/api/docs`.

## Prerequisites
- **Node.js** >= 18
- **npm** (or **yarn**)
- (Optional) PostgreSQL if you decide to replace the mock layer.

## Setup
```bash
# Clone the repository (if not already)
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Create an environment file
cp .env.example .env
# Edit .env to set a strong JWT_SECRET and optionally DATABASE_URL
```

## Development
```bash
npm run dev
```
The server will start on `http://localhost:4000`. Swagger UI is accessible at `http://localhost:4000/api/docs`.

## Build & Production
```bash
npm run build   # Compiles TypeScript to ./dist
npm start       # Runs the compiled code
```

## Security Considerations
- **JWT_SECRET** must be a strong, unpredictable string in production.
- All protected routes use the `verifyToken` middleware which validates the token's signature and expiration.
- CORS is enabled for all origins in this demo; restrict it in production (`app.use(cors({ origin: 'https://yourdomain.com' }))`).
- Input validation is performed on the login endpoint; further validation should be added for any future write operations.

## Extending the Data Layer
The current implementation uses static in‑memory arrays (`User` and `Portfolio`). To integrate a real PostgreSQL database:
1. Install `pg` and a query builder/ORM (e.g., `knex` or `typeorm`).
2. Replace the static methods in `src/models/*` with actual DB queries.
3. Update the `.env` file with `DATABASE_URL`.

## License
MIT
