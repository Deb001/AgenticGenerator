# Simple Web Calculator

A lightweight, client‑side calculator built with plain HTML, CSS, and JavaScript.  
Open `index.html` in any modern browser and start calculating.

## Files Overview

| File | Purpose |
|------|---------|
| `index.html` | Calculator UI – display and buttons. |
| `app.js` | Expression sanitization, safe evaluation, UI wiring, keyboard support, and error handling. |
| `style.css` | Responsive grid layout and basic styling for the calculator. |
| `README.md` | This documentation. |

## Getting Started

1. **Open the calculator**  
   Double‑click `index.html` or open it via `File → Open` in your browser.

2. **Use the UI**  
   - Click the buttons to build an expression.  
   - `=` evaluates the expression.  
   - `C` clears the entire display.  
   - `DEL` removes the last character (backspace).

3. **Keyboard shortcuts**  

| Key | Action |
|-----|--------|
| `0‑9`, `.`, `+`, `-`, `*`, `/`, `(`, `)` | Append the character to the display |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete last character |
| `Esc` | Clear display |

## Supported Operations

- Addition `+`
- Subtraction `-`
- Multiplication `*`
- Division `/` (division by zero is caught and reported as an error)
- Decimal numbers
- Parentheses for grouping (e.g., `(2+3)*4`)

## Safety & Error Handling

- **Input sanitization** – before evaluation the expression is checked to contain only digits, whitespace, decimal points, parentheses, and the four basic operators.
- **Safe evaluation** – the sanitized string is evaluated using `Function('return ' + expr)()`. No `eval` is used on raw user input.
- **Error feedback** – any syntax error, illegal characters, or division by zero results in the display showing `Error` (or `Error: Division by zero`). The next key press clears the error state.

## Customisation

- **Styling** – modify `style.css` to change colors, fonts, or layout. The CSS uses a simple CSS Grid, so you can adjust `grid-template-columns` or button sizes as needed.
- **Logic** – `app.js` is modular; the `evaluateExpression` function can be replaced with a more sophisticated parser if desired.

## License

This project is released into the public domain. Feel free to copy, modify, and distribute it without restriction.

--- 

Enjoy your calculator! 🚀