# Scientific Calculator

A responsive, modern scientific calculator built with **plain HTML**, **Tailwind CSS**, and **vanilla JavaScript**. It supports basic arithmetic, parentheses, exponentiation, and common scientific functions (sin, cos, tan, ln, log, sqrt, π, e).

---

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features
- Gradient background with glass‑morphism card.
- Fully responsive button grid that works on mobile and desktop.
- Accessible focus states and ARIA‑friendly markup.
- Expression evaluator using the **shunting‑yard algorithm** (no `eval`).
- Support for:
  - Numbers (floats)
  - Operators `+ - * / ^`
  - Parentheses
  - Unary minus
  - Functions: `sin, cos, tan, ln, log, sqrt`
  - Constants: `π, e`
- Robust error handling (mismatched parentheses, divide‑by‑zero, domain errors, overflow).

---

## Demo
Open `index.html` in any modern browser.

---

## Installation
No build step is required because Tailwind is loaded via CDN.

```bash
# Clone the repository
git clone <repo-url>
cd <repo-directory>
```

If you wish to customize Tailwind, install the dev dependencies:

```bash
npm install
# Then run the Tailwind CLI to generate a custom build (optional)
 npx tailwindcss -i ./style.css -o ./dist/tailwind.css --watch
```

---

## Running the App
Simply open `index.html` in a browser:

```bash
open index.html   # macOS
start index.html   # Windows
xdg-open index.html   # Linux
```

---

## Usage
- Click buttons or use the keyboard.
- `C` clears the display, `←` deletes the last character.
- Press `=` or **Enter** to evaluate.
- Errors are shown directly in the display.

---

## Testing
Manual test cases are listed in **TESTS.md** (or the section below). Verify each case produces the expected result.

### Sample Test Cases
| # | Expression | Expected Result |
|---|------------|-----------------|
| 1 | `2+2` | `4` |
| 2 | `5*6-3` | `27` |
| 3 | `(1+2)*3` | `9` |
| 4 | `3.5+2.1` | `5.6` |
| 5 | `2^3` | `8` |
| 6 | `sin(π/2)` | `1` |
| 7 | `log(100)` | `2` |
| 8 | `sqrt(16)` | `4` |
| 9 | `ln(e)` | `1` |
|10| `1/0` | `Division by zero` |

---

## Deployment
The app is static and can be hosted on any static file server (GitHub Pages, Netlify, Vercel, AWS S3, etc.).

Example for GitHub Pages:
1. Push the repository to GitHub.
2. In repository settings enable **GitHub Pages** from the `main` branch root.
3. The site will be available at `https://<username>.github.io/<repo>`.

---

## Project Structure
```
project-root/
├─ index.html          # Main UI
├─ style.css           # Custom CSS utilities & focus styles
├─ app.js              # Expression evaluator & UI logic
├─ README.md           # Documentation (this file)
├─ .gitignore          # Git ignore rules
└─ .env.example        # Placeholder for future env vars
```

---

## License
MIT License. Feel free to use, modify, and distribute.
