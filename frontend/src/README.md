# Portfolio Manager Frontend

## Prerequisites
- **Node.js** (>=18) and **npm** (or **yarn**) installed on your machine.
- The backend API must be running and reachable. By default the frontend expects the backend at `http://localhost:8000`. You can override this with the `VITE_BACKEND_URL` environment variable.

## Getting Started
```bash
# Clone the repository (if you haven't already)
git clone <repo-url>
cd frontend

# Install dependencies
npm install   # or `yarn install`

# Start the development server
npm run dev   # or `yarn dev`
```
The app will be available at `http://localhost:5173` and will proxy API calls to the backend.

## Building for Production
```bash
npm run build   # or `yarn build`
```
The compiled assets will be placed in the `dist/` directory. You can serve them with any static file server (e.g., **nginx**, **Vercel**, **Netlify**).

## Running the Test Suite
```bash
npm test   # or `yarn test`
```
The project uses **Vitest** together with **React Testing Library**. Tests are located under `src/__tests__`.

## Environment Variables
Create a `.env` file at the project root (or set environment variables in your CI/CD pipeline) with the following key:
```
VITE_BACKEND_URL=http://localhost:8000   # Change if your backend runs elsewhere
```

## Security Considerations
- All secrets (JWT keys, OAuth client secrets, etc.) are kept on the backend and never committed to the repository.
- The frontend stores the short‑lived access token in `localStorage` and relies on an HttpOnly, Secure, SameSite‑Strict refresh‑token cookie managed by the backend.
- OAuth `state` parameters are generated per request and validated to mitigate CSRF attacks.
- User‑provided data is rendered safely – React escapes output by default and we avoid `dangerouslySetInnerHTML`.

---

*Generated on 2026‑02‑03*
