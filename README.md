# Simple Web Calculator

A lightweight, zero‑dependency calculator built with vanilla HTML, CSS, and JavaScript.  
The core of the application lives in **`src/evaluator.js`**, which safely parses and evaluates arithmetic
expressions using the shunting‑yard algorithm and a Reverse Polish Notation (RPN) evaluator.

---

## Table of Contents

- [Demo](#demo)
- [Project Structure](#project-structure)
- [Setup & Run](#setup--run)
- [Evaluator API](#evaluator-api)
- [Keyboard & Accessibility](#keyboard--accessibility)
- [Extending the Calculator](#extending-the-calculator)
- [License](#license)

---

## Demo

Open `index.html` in a modern browser (or serve the folder with any static HTTP server) and you’ll see a responsive calculator UI.

---

## Project Structure

/ (root)
├─ index.html          # Main view – layout, display, button container
├─ styles.css          # Responsive grid, button styling, focus states
└─ src
   ├─ main.js          # UI controller – renders UI, handles events, updates display
   └─ evaluator.js     # Expression parser & evaluator – export evaluate(expression)

---

## Setup & Run

1. **Clone / download** the repository.
2. **Serve** the folder (optional but recommended for proper module loading):
      # Using Python 3
   python -m http.server 8000
   # Then open http://localhost:8000 in your browser
      *You can also open `index.html` directly, but some browsers block ES modules when opened via `file://`.*

3. **Interact** with the calculator using mouse clicks or the keyboard (see below).

No build step, package manager, or external dependencies are required.

---

## Evaluator API

The module `src/evaluator.js` exports a single function:

import { evaluate } from './evaluator.js';

/**
 * Evaluates a mathematical expression.
 *
 * @param {string} expression - A string containing a valid arithmetic expression.
 *   Supported tokens:
 *     - Numbers (integers or decimals, e.g., 3, 4.56)
 *     - Binary operators: +, -, *, /
 *     - Parentheses: ( )
 *
 * @returns {number} The numeric result of the expression.
 *
 * @throws {SyntaxError}   If the expression contains invalid characters,
 *                         mismatched parentheses, or malformed token order.
 * @throws {Error}         If a runtime error occurs (e.g., division by zero).
 *
 * @example
 * evaluate('3 + 4 * (2 - 1) / 5'); // → 3.8
 */

### How It Works

1. **Tokenisation** – The input string is split into numbers, operators, and parentheses while ignoring whitespace.
2. **Shunting‑yard** – Tokens are converted to Reverse Polish Notation (RPN) respecting operator precedence and associativity.
3. **RPN Evaluation** – A stack processes the RPN tokens to produce the final numeric result.
4. **Error handling** – The function validates the expression at each stage and throws descriptive errors for:
   - Unknown characters
   - Unbalanced parentheses
   - Invalid token sequences
   - Division by zero

### Integration Example

import { evaluate } from './src/evaluator.js';

try {
  const result = evaluate('12 / (2 + 4)');
  console.log(result); // 2
} catch (err) {
  console.error('Evaluation error:', err.message);
}

---

## Keyboard & Accessibility

- **Digits & operators** (`0‑9`, `+`, `-`, `*`, `/`, `(`, `)`) insert the corresponding character.
- **Enter** → evaluates the current expression (same as `=` button).
- **Backspace** → deletes the last character (same as `C` button).
- **Escape** → clears the entire display.
- All interactive elements have appropriate `role="button"` and `aria-label` attributes.
- Focus order follows the visual layout, and focus styles are clearly visible.

---

## Extending the Calculator

- **Additional operators** – Add entries to the `OPERATORS` map in `evaluator.js` (define precedence, associativity, and implementation).
- **Functions** (e.g., `sqrt`, `pow`) – Extend the tokenizer to recognise identifiers, push them onto the operator stack, and handle them during RPN evaluation.
- **Theming** – Override variables in `styles.css` or add a new stylesheet and load it after the default one.

When extending, keep the public API (`evaluate`) stable to avoid breaking `src/main.js`.

---

## License

This project is released under the **MIT License**. Feel free to use, modify, and distribute it in personal or commercial projects.

--- 

*Happy calculating!*