# Portfolio Manager Frontend

## Prerequisites
- **Node.js** (v20 or later) and **npm** (v10 or later) installed on your machine.
- The backend API should be running locally on `http://localhost:8000` (or the URL you configure via the `VITE_API_BASE_URL` environment variable).

## Setup
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables** (optional)
   - Create a `.env` file in the `frontend` directory if you need to override the default API base URL.
   - Example:
     ```env
     VITE_API_BASE_URL=http://localhost:8000
     ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

4. **Build for production**
   ```bash
   npm run build
   ```
   The compiled assets will be placed in the `dist` folder.

5. **Preview the production build**
   ```bash
   npm run preview
   ```

## Security Notes
- JWT tokens are kept in memory only (React state) to reduce XSS risk.
- All redirects after login are validated to prevent open‑redirect attacks.
- Content Security Policy (CSP) is enforced via meta tags in `index.html`.
- Input validation is performed client‑side using simple regex patterns.

## Scripts Overview
- `dev` – Starts Vite in development mode with hot‑module replacement.
- `build` – Generates an optimized production build.
- `preview` – Serves the production build locally for testing.
