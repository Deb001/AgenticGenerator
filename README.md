# Arithmetic Web Calculator

A minimalistic, responsive web calculator built with plain HTML, JavaScript, and Tailwind CSS. It performs addition, subtraction, multiplication, and division on two numbers.

## Features
- Instant client‑side calculation
- Responsive design with Tailwind CSS
- Graceful handling of division by zero
- No build step required (open `index.html` directly)

## Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Optional: a static file server for production (e.g., `serve`, `http-server`, Netlify, Vercel)

## Development Setup
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```
2. Open `index.html` in your browser or run a simple static server:
   ```bash
   npx serve .
   ```
   Then navigate to `http://localhost:3000`.

## Build & Run
- **Dev:** No build required – edit `index.html` or `script.js` and refresh the browser.
- **Build:** Not applicable (static assets only).
- **Start (production):** Deploy the files to any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

## Testing
1. Open the page.
2. Enter numbers in the two fields.
3. Choose an operation (+, -, ×, ÷).
4. Click **Calculate**.
5. Verify the displayed result matches the expected calculation.
6. Test division by zero – the UI should show an error message.

## Deployment
1. Push the repository to a remote Git host.
2. Connect the repo to a static hosting provider (e.g., Netlify) and configure the build command as `none` and the publish directory as the repository root.
3. The site will be served automatically.

## License
MIT © 2025
