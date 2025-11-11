# Arithmetic Web Calculator

## Overview
A static, accessible single‑page calculator built with HTML, CSS, and vanilla ES6 JavaScript. It supports addition, subtraction, multiplication, and division with full client‑side validation.

## File Structure
- `index.html` – entry point with markup and CSP.
- `css/styles.css` – responsive styling.
- `js/calculator.js` – pure calculation engine.
- `js/app.js` – UI controller and validation.
- `test.html` & `js/test.js` – simple automated test harness.

## Running the Application
1. Open `index.html` in a modern browser **or** serve the `root` folder with any static server (e.g., `python -m http.server`).
2. No build step or environment variables are required.

## Testing
Open `test.html` in a browser. The page will automatically run the test suite and display pass/fail results.

## Accessibility
- Keyboard navigation with Tab/Enter.
- ARIA `role="alert"` for error messages.
- High‑contrast focus styles.

## Security Considerations
- Content‑Security‑Policy restricts scripts to `self`.
- No external resources or secrets are used.
- All inputs are sanitized and parsed as numbers before evaluation.
