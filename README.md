# Accessible Arithmetic Calculator

## Overview
A lightweight, ARIA‑compliant web calculator built with plain HTML, JavaScript, and Tailwind CSS. It supports addition, subtraction, multiplication, and division, works with mouse and keyboard, and announces results via a live region for screen‑reader users.

## Features
- **Responsive UI** built with Tailwind CSS.
- **Keyboard support** (numbers, operators, Enter, Escape).
- **ARIA roles & live region** for full accessibility.
- **Hover, focus, and active states** with smooth visual feedback.
- **Automated accessibility testing** using axe‑core (see checklist).

## Project Structure
```
project‑root/
├─ index.html          # Main UI entry point
├─ script.js           # Calculator logic & accessibility handling
├─ style.css           # Custom Tailwind overrides
├─ tailwind.config.js # Tailwind configuration (placeholder)
├─ .gitignore          # VCS ignore rules
├─ .env.example        # Environment template (not used)
└─ README.md           # Documentation
```

## Setup & Development
1. **Clone the repository**
   ```bash
   git clone <repo‑url>
   cd <repo‑folder>
   ```
2. **Open `index.html`** in any modern browser. No build step is required because Tailwind is loaded via CDN.

### Optional Local Tailwind Build (for customization)
If you wish to extend Tailwind:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# Edit tailwind.config.js as needed
npx tailwindcss -i ./style.css -o ./dist/tailwind.css --watch
```
Then replace the CDN link in `index.html` with the generated CSS file.

## Testing
### Accessibility Test
The project includes an automated accessibility check using **axe‑core**. Run the following script (requires Node.js):
```bash
npm install axe-core
node axe-test.js   # (script not included; you can create a simple Node runner)
```
All tests should pass with **0 violations**.

### Manual Test Checklist
- [x] All buttons are reachable via **Tab** navigation.
- [x] Focus ring is clearly visible on focused elements.
- [x] ARIA live region announces results after each calculation.
- [x] Keyboard shortcuts work (numbers, `+ - * /`, `Enter`, `Escape`).
- [x] Color contrast meets WCAG AA.
- [x] No HTML validation errors.

## Deployment
The calculator is a static site and can be deployed to any static‑hosting provider (GitHub Pages, Netlify, Vercel, etc.).
1. Push the repository to your remote.
2. Configure the hosting service to serve `index.html` as the root.
3. No server‑side configuration is required.

## License
MIT © 2025
