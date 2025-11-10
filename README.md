# Calculator Web App

A lightweight, accessible, and responsive web calculator built with vanilla JavaScript (ES modules), HTML5, and CSS3. The project follows a clean separation of concerns:

* **`src/calculator.js`** – Pure calculation logic with validation.
* **`src/app.js`** – UI integration, event handling, keyboard support, and accessibility wiring.
* **`index.html`** – Semantic markup for the calculator UI.
* **`styles.css`** – Responsive layout and visual styling.
* **Jest** – Browser‑based unit tests for the calculation module.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Accessible UI** – Semantic HTML, ARIA attributes, focus management, and full keyboard support.
- **Responsive Design** – Works on mobile, tablet, and desktop screens.
- **Pure Calculation Engine** – No DOM manipulation inside `calculator.js`; pure functions are fully unit‑tested.
- **Robust Validation** – Handles division by zero, overflow, and invalid input gracefully.
- **Zero‑dependency Build** – No bundlers required; runs directly in modern browsers.
- **Automated Tests** – Jest runs in a headless browser environment (`jsdom`).

---

## Tech Stack

| Layer                | Technology                     |
|----------------------|--------------------------------|
| UI Markup            | HTML5 (semantic)                |
| Styling              | CSS3 (Flexbox, media queries)   |
| Logic                | JavaScript (ES2022 modules)     |
| Testing              | Jest + jsdom                    |
| Package Management   | npm                             |
| Linting/Formatting   | ESLint, Prettier (optional)     |

---

## Prerequisites

- **Node.js** ≥ 18 (includes npm)
- A modern browser (Chrome, Firefox, Edge, Safari) for manual testing

---

## Installation

# Clone the repository
git clone https://github.com/your-username/calculator-web-app.git
cd calculator-web-app

# Install development dependencies
npm install

---

## Available Scripts

| Script          | Description                                          |
|-----------------|------------------------------------------------------|
| `npm start`     | Starts a lightweight development server (`http-server`) on `http://localhost:8080`. |
| `npm test`      | Runs Jest unit tests in watch mode.                  |
| `npm run lint`  | Executes ESLint against the source files.            |
| `npm run format`| Formats code with Prettier.                          |

**Note:** The `start` script uses the `http-server` package (installed as a dev dependency) to serve static files without a build step.

---

## Development Workflow

1. **Start the dev server**

      npm start
   
   The app will be available at `http://localhost:8080`. Any changes to HTML, CSS, or JS files are reflected instantly (no hot‑reload required).

2. **Edit source files**

   - **Calculator logic** – `src/calculator.js`
   - **UI integration** – `src/app.js`
   - **Markup** – `index.html`
   - **Styling** – `styles.css`

3. **Run tests continuously**

      npm test
   
   Jest watches for changes and re‑runs affected test suites.

4. **Lint & format before committing**

      npm run lint
   npm run format
   
---

## Testing

The test suite lives in `src/calculator.test.js` and validates all public functions exported by `src/calculator.js`.

npm test

The configuration uses Jest’s default `jsdom` environment, so no additional setup is required. Tests cover:

- Basic arithmetic (add, subtract, multiply, divide)
- Edge cases (division by zero, large numbers, non‑numeric input)
- Input validation errors (throws `TypeError` for invalid arguments)

---

## Folder Structure

/
├─ .gitignore          # Excludes node_modules, coverage, etc.
├─ README.md           # ← This file
├─ index.html          # Semantic UI markup
├─ styles.css          # Responsive styling
├─ package.json        # npm metadata & scripts
├─ package-lock.json
├─ src/
│   ├─ calculator.js   # Pure calculation functions
│   ├─ app.js          # UI glue code
│   └─ calculator.test.js # Jest unit tests
└─ tests/              # (optional) additional integration tests

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Ensure code passes linting and all tests (`npm run lint && npm test`).
4. Open a Pull Request with a clear description of changes.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

## Quick Start (One‑Liner)

git clone https://github.com/your-username/calculator-web-app.git && cd calculator-web-app && npm install && npm start

Open `http://localhost:8080` in your browser to see the calculator in action. Happy coding!