# Simple Web Calculator

A minimal single‑page web calculator built with plain HTML, CSS, and JavaScript.  
It validates and safely evaluates arithmetic expressions entered via the UI buttons
or the keyboard.

## Project Structure

/ (project root)
│
├─ index.html   # UI layout and element definitions
├─ script.js    # Expression sanitization, safe evaluation, UI wiring
├─ style.css    # Responsive grid layout and styling
└─ README.md    # This documentation

## Getting Started

1. **Open the application**  
   Open `index.html` in any modern web browser (desktop or mobile). No server or build step is required.

2. **Using the calculator**  
   - Click the numeric (`0‑9`) and operator (`+ - * / % .`) buttons, or type on the keyboard.  
   - The current expression appears in the **Expression** display (read‑only).  
   - Press **=** (or the `Enter` key) to evaluate. The result is shown in the **Result** display.  
   - Press **C** to clear both displays.

## Features

- **Input validation** – only digits, whitespace, `+ - * / % . ( )` are allowed.  
- **Safe evaluation** – the expression is evaluated via a sandboxed `Function` after strict sanitisation.  
- **Responsive UI** – button grid adapts to different screen sizes and is touch‑friendly.  
- **Friendly error handling** – malformed expressions or disallowed characters produce clear error messages.

## Manual Test Cases

| Test # | Input Expression | Action | Expected Result |
|--------|------------------|--------|-----------------|
| 1 | `2+2` | Press `=` or `Enter` | `4` |
| 2 | `3*(4+5)` | Press `=` or `Enter` | `27` |
| 3 | `10/3` | Press `=` or `Enter` | `3.3333333333333335` (JavaScript floating‑point result) |
| 4 | `5%2` | Press `=` or `Enter` | `1` |
| 5 | `7.5-2.3` | Press `=` or `Enter` | `5.2` |
| 6 | `((2+3)*4)/5` | Press `=` or `Enter` | `4` |
| 7 | `2++2` | Press `=` or `Enter` | **Error:** Invalid expression |
| 8 | `abc+1` | Press `=` or `Enter` | **Error:** Invalid characters detected |
| 9 | `12 / (2 - 2)` | Press `=` or `Enter` | **Error:** Division by zero (JavaScript throws `Infinity` – displayed as `Infinity`) |
| 10 | `C` (clear) after any input | Press `C` | Both displays are empty |

> **Note:** JavaScript’s native floating‑point arithmetic is used; results may contain rounding artifacts (e.g., `0.1+0.2` yields `0.30000000000000004`).

## Development Notes

- The evaluator in `script.js` uses a regular expression to whitelist allowed characters before constructing a `new Function('return ' + expr)()` call. This prevents code injection while keeping the implementation lightweight.
- All UI elements are referenced by `id` attributes (`expression-display`, `result-display`, etc.) for straightforward DOM manipulation.
- Keyboard support maps digits, operators, `Enter` (evaluate), and `Escape` (clear) to the same logic as button clicks.

## License

This project is released into the public domain. Feel free to copy, modify, and distribute it without restriction.