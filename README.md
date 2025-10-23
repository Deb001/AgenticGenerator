# Simple Web Calculator

A lightweight, responsive calculator built with HTML, CSS, and vanilla JavaScript.  
It runs entirely in the browser—no build tools, servers, or external dependencies required.

## Project Structure

/ (project root)
│
├─ index.html   # UI markup, loads styles.css and app.js
├─ styles.css   # Responsive layout and visual styling
├─ app.js       # Calculator logic, input handling, evaluation, error handling
└─ README.md    # This documentation

## Getting Started

1. **Clone or download** the repository.
2. Open `index.html` in any modern web browser (desktop or mobile).
3. The calculator UI will load automatically—no additional setup needed.

## Usage

- **Click** the on‑screen buttons or use the keyboard:
  - Digits `0–9` and decimal point `.` – enter numbers.
  - Operators `+`, `-`, `×` (or `*`), `÷` (or `/`) – perform addition, subtraction, multiplication, division.
  - `Enter` or `=` – evaluate the current expression.
  - `Backspace` – delete the last character.
  - `C` – clear the entire expression.
- The display is read‑only; results and error messages appear here.
- Division by zero shows **“Error: Division by zero”** and locks further input until cleared.

## Keyboard Shortcuts

| Key          | Action                     |
|--------------|----------------------------|
| `0–9`        | Input digit                |
| `.`          | Decimal point              |
| `+` `-` `*` `/` | Operators (`×` and `÷` map to `*` and `/`) |
| `Enter` `=`  | Evaluate expression        |
| `Backspace`  | Delete last character      |
| `c` / `C`    | Clear display              |

## Accessibility

- All buttons have `role="button"` and appropriate `aria-label` attributes.
- The calculator can be fully operated via keyboard.
- The display uses `aria-live="polite"` to announce results and errors to screen readers.

## Manual Test Checklist

- [ ] **Basic arithmetic**: `2 + 3 =` → displays `5`.
- [ ] **Subtraction**: `9 - 4 =` → displays `5`.
- [ ] **Multiplication**: `6 × 7 =` → displays `42`.
- [ ] **Division**: `8 ÷ 2 =` → displays `4`.
- [ ] **Decimal handling**: `3.5 + 2.1 =` → displays `5.6`.
- [ ] **Operator chaining**: `5 + 6 × 2 =` → respects precedence → displays `17`.
- [ ] **Consecutive operators**: Prevent entry of `++` or `*‑` etc.
- [ ] **Leading decimal**: `.5 + .5 =` → displays `1`.
- [ ] **Divide‑by‑zero**: `7 ÷ 0 =` → displays error message and locks input.
- [ ] **Clear function**: Press `C` after any operation → display resets.
- [ ] **Backspace**: Delete last character and continue editing.
- [ ] **Keyboard input**: All keys above work as described.
- [ ] **Responsive layout**: UI adapts to mobile screen widths.
- [ ] **Screen‑reader announcement**: Results and errors are announced.

## License

This project is released into the public domain. Use it freely for any purpose.