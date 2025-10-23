# Simple Web Calculator

## Overview
A lightweight, client‑side calculator built with vanilla HTML, CSS, and JavaScript.  
The UI is accessible and responsive, while the calculation engine (`js/calc.js`) uses a safe tokeniser and the Shunting‑Yard algorithm to evaluate arithmetic expressions without invoking `eval()`.

## Features
- **Basic arithmetic**: addition, subtraction, multiplication, division.
- **Decimal support** with validation to prevent multiple decimal points in a single number.
- **Parentheses** (optional) for grouping expressions.
- **Keyboard shortcuts**: digits, `.` `+` `-` `*` `/`, `Enter` (=), `Backspace` (delete), `Esc`/`C` (clear).
- **Error handling**: division by zero, malformed expressions, and invalid input display an `Error` state that can be cleared.
- **Responsive layout**: works on desktop, tablet, and mobile browsers.
- **No external dependencies** – runs entirely offline.

## File Structure
/ (project root)
├─ index.html          # Main page – loads CSS & JS, defines UI markup
├─ css/
│   └─ style.css       # Layout, grid, and focus/hover styling
├─ js/
│   ├─ calc.js         # Pure calculation engine (tokeniser + shunting‑yard)
│   └─ app.js          # UI controller – DOM events, keyboard handling, state
└─ README.md           # Documentation (this file)

## Running the Calculator
1. **Open** `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).  
   No server or build step is required; the app runs completely client‑side.
2. **Interact** using the on‑screen buttons or the keyboard shortcuts listed above.
3. **Clear** the display with the `C` button or `Esc` key if an error occurs or you wish to start a new calculation.

## Notes on Safety
- The calculator **does not use `eval()`** or any other dynamic code execution; all parsing and evaluation are performed manually, eliminating injection risks.
- Input is strictly limited to numeric characters, decimal points, arithmetic operators, and parentheses. Any other characters are ignored.
- Division by zero is caught and reported as `Error` rather than returning `Infinity` or throwing an exception.
- The application runs locally; no network requests are made, ensuring privacy of user input.

---  

*Happy calculating!*