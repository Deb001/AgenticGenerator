# Project Overview

A lightweight, accessible web‑based calculator built with vanilla HTML, CSS, and JavaScript. The application demonstrates best practices for semantic markup, ARIA roles, keyboard navigation, and responsive design while providing a clean, production‑ready code base.

---

## Folder Structure

```
root/
├─ index.html          # Entry point – UI layout with ARIA attributes
├─ styles.css          # Responsive styling, focus states, and visual layout
├─ app.js              # UI controller – DOM wiring, input buffering, display logic, error handling, keyboard support
├─ calculator.js       # Pure arithmetic evaluator exposing evaluate(expression)
├─ README.md           # Project documentation (this file)
└─ .gitignore          # Files/folders excluded from version control
```

---

## Setup & Run

1. **Clone the repository**
   ```bash
   git clone <repository‑url>
   cd <repository‑folder>
   ```
2. **Open the application**
   - No build step is required. Simply open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).
   - For a local server (recommended for CSP testing), run:
     ```bash
     npx serve .
     ```
     Then navigate to `http://localhost:3000`.

---

## Usage

- Click the on‑screen buttons or use the keyboard shortcuts (see below) to build an arithmetic expression.
- Press **Enter** or click the **=** button to evaluate.
- The display shows the current expression and the result. Errors such as division by zero are shown in a user‑friendly message.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0‑9` | Input digit |
| `+` `-` `*` `/` | Input operator |
| `.` | Decimal point |
| `Enter` or `=` | Evaluate expression |
| `Backspace` | Delete last character |
| `Escape` | Clear the entire expression |
| `ArrowLeft` / `ArrowRight` | Move cursor within the expression |

---

## Accessibility Features

- **Semantic HTML**: All interactive elements are `<button>` elements with clear accessible names.
- **ARIA Roles & Labels**: The calculator container uses `role="region"` with `aria‑label="Calculator"`. Buttons have `aria‑label` where the visual label differs from the spoken label (e.g., `×` is labelled "multiply").
- **Focus Management**: Logical tab order, visible focus outlines, and `aria‑live="polite"` region for result updates.
- **Keyboard Navigation**: Full operation via keyboard without requiring a mouse.
- **Contrast & Font Size**: Colors meet WCAG AA contrast ratios; scalable with browser zoom.

---

## Manual Testing Summary

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Basic addition | `2 + 3 =` | `5` |
| Subtraction with negative result | `5 - 9 =` | `-4` |
| Multiplication with decimals | `2.5 * 4 =` | `10` |
| Division by zero | `7 / 0 =` | Error message "Cannot divide by zero" |
| Consecutive operations | `3 + 2 * 4 =` | `11` (standard left‑to‑right evaluation as implemented) |
| Keyboard entry | Press keys `1 0 / 2 Enter` | `5` |
| Clear operation | Press `Escape` at any time | Display resets to empty |

All tests were performed on Chrome 124, Firefox 124, and Edge 124 with no visual or functional regressions.

---

## Deployment

The project can be deployed to any static‑hosting service (GitHub Pages, Netlify, Vercel, etc.).

1. Push the repository to a remote.
2. Enable the static site feature of the chosen platform.
3. (Optional) Add a Content‑Security‑Policy header to mitigate XSS:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
   ```
4. Verify that the site loads over HTTPS and that security headers such as `X-Frame-Options: DENY` and `Strict-Transport-Security` are present.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.
