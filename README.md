# Portfolio Advisory Dashboard (Frontend)

## Overview

This repository contains the **React** frontend for the Portfolio Advisory Dashboard. It provides a secure login flow, displays client portfolios, advisory signals, and performance charts. The UI is built with **Tailwind CSS** for a modern, responsive design and **Chart.js** for data visualisation.

## Prerequisites

- **Node.js** (v18 or later)
- **npm** (v9 or later) or **yarn**
- The backend API must be running (default: `http://localhost:5000`). See the backend repository for setup instructions.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/portfolio-advisory-frontend.git
   cd portfolio-advisory-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or using yarn
   # yarn install
   ```

3. **Configure environment variables**
   - Copy the example file and adjust if needed:
   ```bash
   cp .env.example .env
   ```
   - The default points to the backend API at `http://localhost:5000/api`.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

5. **Build for production**
   ```bash
   npm run build
   ```
   The compiled assets will be placed in the `dist` folder.

6. **Preview the production build**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/
├─ public/                 # (optional) static assets
├─ src/
│  ├─ components/          # Re‑usable UI components
│  │   ├─ Chart.tsx
│  │   ├─ PortfolioTable.tsx
│  │   └─ SignalBadge.tsx
│  ├─ context/             # React context for authentication
│  │   └─ AuthContext.tsx
│  ├─ hooks/               # Custom React hooks
│  │   └─ useAuth.tsx
│  ├─ pages/               # Page‑level components (routes)
│  │   ├─ Dashboard.tsx
│  │   └─ Login.tsx
│  ├─ services/            # API client (Axios instance)
│  │   └─ api.ts
│  ├─ mock/                # Mock data used when backend is unavailable
│  │   └─ mockPortfolios.ts
│  ├─ App.tsx              # Root component with routing & auth guard
│  ├─ main.tsx             # React entry point
│  └─ index.css            # Tailwind imports
├─ .env.example
├─ .gitignore
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ tsconfig.json
└─ vite.config.ts
```

## Security & Best Practices

- **Authentication** is handled via JWT stored in `localStorage`. The token is attached to every API request in the `Authorization` header.
- **Input validation** is performed on the login form (HTML5 `required` attributes) and on the backend (not shown here).
- **Content Security Policy (CSP)** should be configured on the server serving the built assets to mitigate XSS attacks.
- **HTTPS** is recommended for production deployments.

## Testing the UI without a Backend

If the backend API is not reachable, the application gracefully falls back to static mock data defined in `src/mock/mockPortfolios.ts`. This allows you to explore the UI and chart components without a running server.

## Scripts Reference

| Script | Description |
|--------|-------------|
| `dev`   | Starts Vite development server with hot‑module replacement |
| `build` | Generates an optimized production build |
| `preview` | Serves the production build locally for verification |

## License

MIT License. See `LICENSE` file for details.
