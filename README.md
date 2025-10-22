# Simple Web Calculator

A lightweight, zero‑dependency web calculator built with vanilla JavaScript, HTML, and CSS.  
It parses arithmetic expressions using the shunting‑yard algorithm and evaluates them in Reverse Polish Notation (RPN). The UI is fully accessible and works on desktop and mobile browsers.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Tests](#running-the-tests)
- [Development](#development)
- [Extending the Calculator](#extending-the-calculator)
- [License](#license)

---

## Features

- **Basic arithmetic**: `+`, `-`, `*`, `/`
- **Parentheses** for grouping
- **Unary minus** (e.g., `-5 + 3`)
- **Decimal numbers**
- **Robust error handling**: division by zero, syntax errors, mismatched parentheses, invalid token sequences
- **Responsive UI**: works on desktop and mobile
- **Keyboard support**: type expressions directly
- **Accessible markup**: proper ARIA labels and button semantics
- **Zero‑build**: open `index.html` in a browser, no bundler required
- **Unit‑tested core engine** (Jest‑compatible or plain Node)

---

## Demo

Open `index.html` in any modern browser:

# From the project root
open index.html   # macOS
# or
start index.html  # Windows
# or simply double‑click the file in your file explorer

---

## Project Structure

root
├─ .gitignore          # Excludes node_modules, OS files, etc.
├─ README.md           # 📖 This documentation
├─ index.html          # Root view – display + button grid
├─ package.json        # Optional npm scripts (test, lint)
├─ src
│  ├─ css
│  │   └─ styles.css   # Responsive layout & button styling
│  └─ js
│      ├─ calculator.js # Core expression parser/evaluator
│      └─ ui.js         # UI controller – event handling & DOM updates
└─ tests
    └─ test_calculator.js # Unit tests for the arithmetic engine

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- (Optional) Node.js ≥ 14 if you want to run the test suite or use npm scripts

### Running the Application

1. Clone or download the repository.
2. Open `index.html` directly in your browser – no server or build step is required.

### Installing Development Dependencies (optional)

If you plan to run the test suite or use the provided npm scripts:

npm install

This will install the minimal dev dependencies defined in `package.json` (e.g., Jest).

---

## Running the Tests

### Using npm (recommended)

npm test

The script runs the test file `tests/test_calculator.js` with Jest (or the built‑in Node runner if Jest is not installed).

### Using Node directly (no npm)

node tests/test_calculator.js

The test file prints a concise summary of passed/failed cases to the console.

---

## Development

### Core Engine (`src/js/calculator.js`)

- Exposes a single function:  

    const { result, error } = evaluate(expression);
  
- Returns an object where `result` is a `number` (or `null` on error) and `error` is a human‑readable string (or `null` on success).

### UI Controller (`src/js/ui.js`)

- Binds click events for all calculator buttons.
- Listens to keyboard input (`keydown`) for digits, operators, `Enter`, `Backspace`, and `Escape`.
- Maintains an expression string, validates user input, and forwards it to `evaluate`.
- Updates the display area with the current expression, the computed result, or error messages.

### Styles (`src/css/styles.css`)

- CSS variables for colors, spacing, and font sizes.
- Flexbox layout for the button grid.
- Media queries for a mobile‑friendly layout.
- Focus/hover states for accessibility.

### Testing (`tests/test_calculator.js`)

- Covers:
  - Simple binary operations
  - Operator precedence
  - Parentheses nesting
  - Unary minus handling
  - Decimal arithmetic
  - Division by zero
  - Syntax errors (e.g., `5++2`, `(.5)`, mismatched parentheses)

---

## Extending the Calculator

### Adding New Operators

1. **Update the operator table** in `calculator.js`:
      const OPERATORS = {
     '+': { precedence: 2, associativity: 'Left', fn: (a, b) => a + b },
     '-': { precedence: 2, associativity: 'Left', fn: (a, b) => a - b },
     '*': { precedence: 3, associativity: 'Left', fn: (a, b) => a * b },
     '/': { precedence: 3, associativity: 'Left', fn: (a, b) => {
       if (b === 0) throw new Error('Division by zero');
       return a / b;
     } },
     // Example: exponentiation
     '^': { precedence: 4, associativity: 'Right', fn: (a, b) => Math.pow(a, b) }
   };
   2. **Add a button** in `index.html` with the appropriate label and `data-key` attribute.
3. **Update UI validation** in `ui.js` if the new operator has special rules (e.g., unary vs binary).

### Custom Functions (e.g., `sqrt`, `log`)

- Extend the tokeniser in `calculator.js` to recognise identifiers.
- Add a `FUNCTIONS` map with implementation callbacks.
- Adjust the RPN evaluator to handle function tokens (pop required arguments, push result).

### Styling Adjustments

- Modify `src/css/styles.css` – all layout values are driven by CSS variables (`--spacing`, `--primary-color`, etc.).
- Add new classes for custom button types (e.g., `.operator`, `.function`).

---

## License

This project is released under the **MIT License** – feel free to use, modify, and distribute it as you see fit.

--- 

*Happy calculating!*