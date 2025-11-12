# Simple Browser‑Only Calculator

## Project Overview
A static, browser‑only arithmetic calculator supporting addition (`+`), subtraction (`-`), multiplication (`*`), division (`/`) with proper operator precedence and parentheses.

## Setup & Execution
1. Clone or download the repository.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. No server or build step is required.

## Usage
- Click the numeric and operator buttons to build an expression.
- Press `=` to compute.
- `C` clears the display.
- `⌫` (backspace) deletes the last character.

## Testing Checklist
- **Addition:** `2 + 3 = 5`
- **Subtraction:** `9 - 4 = 5`
- **Multiplication:** `6 × 7 = 42`
- **Division:** `8 ÷ 2 = 4`
- **Operator precedence:** `2 + 3 × 4 = 14`
- **Parentheses:** `(2 + 3) × 4 = 20`
- **Divide‑by‑zero:** `5 ÷ 0 → displays 'Error'`
- **Invalid input (e.g., letters) → displays 'Error'`

## Security Considerations
The page uses a strict Content‑Security‑Policy meta tag (`default-src 'self'`) and does not load any external scripts or styles, mitigating XSS risks.
