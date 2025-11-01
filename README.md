# Simple Web Calculator

A lightweight, pure‑HTML/JavaScript/CSS calculator that runs entirely in the browser. No build step, no dependencies—just open **`index.html`** and start calculating.

---

## Table of Contents

- [Features](#features)
- [Installation / Usage](#installation--usage)
- [File Overview](#file-overview)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Testing Guide](#testing-guide)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Features

- Basic arithmetic: addition, subtraction, multiplication, division
- Decimal numbers and chained operations
- Clear (`C`) button and error handling (`Error` display)
- Responsive layout – works on desktop and mobile browsers
- Full keyboard support (digits, operators, `Enter`, `Esc`/`C`)

---

## Installation / Usage

1. **Download / clone** the repository containing the four files:
   - `index.html`
   - `main.js`
   - `style.css`
   - `README.md`

2. **Open** `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).  
   No server or additional tooling is required.

3. **Interact** with the calculator using the on‑screen buttons or the keyboard shortcuts listed below.

---

## File Overview

| File | Purpose | Key Points |
|------|---------|------------|
| `index.html` | Defines the UI and loads the CSS/JS assets. | The display is a read‑only `<input>` with `id="display"`. Buttons use `data-value` attributes for easy wiring. |
| `main.js` | Handles button clicks, keyboard events, expression building, validation, and evaluation. | - Sanitizes input to allow only digits, `.` and the four operators.<br>- Prevents consecutive operators and multiple decimals in a single number.<br>- Uses a whitelist regex before calling `Function` for safe evaluation.<br>- Shows `"Error"` for invalid expressions or division‑by‑zero. |
| `style.css` | Provides a clean, responsive layout and visual feedback for button states. | Uses CSS Grid for the button matrix, ensures sufficient contrast, and adds a subtle hover/active effect. |
| `README.md` | This documentation. | Explains usage, testing, and known limitations. |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0` – `9` | Append digit |
| `.` | Append decimal point |
| `+` `-` `*` `/` | Append operator |
| `Enter` or `=` | Evaluate expression |
| `Esc` or `c` / `C` | Clear display |
| *All other keys* | Ignored |

---

## Testing Guide

Open the calculator in a browser and try the following cases. The **Display** column shows the expected result after pressing `=` (or `Enter`).

| Test # | Input Sequence | Expected Display |
|--------|----------------|------------------|
| 1 | `2` `+` `3` `=` | `5` |
| 2 | `7` `*` `8` `=` | `56` |
| 3 | `9` `/` `3` `=` | `3` |
| 4 | `5` `-` `2` `=` | `3` |
| 5 | `1` `+` `2` `*` `3` `=` | `7` (standard left‑to‑right evaluation via JavaScript `eval` rules) |
| 6 | `0` `.` `5` `+` `0` `.` `25` `=` | `0.75` |
| 7 | `5` `/` `0` `=` | `Error` (division by zero) |
| 8 | `+` `5` `=` | `Error` (invalid leading operator) |
| 9 | `3` `.` `.` `1` `=` | `Error` (multiple decimals) |
| 10 | `C` (or `Esc`) after any entry | Display cleared to empty |

**How to test:**

1. Click the buttons **or** use the keyboard shortcuts.
2. Verify that the display matches the **Expected Display** column.
3. For error cases, the display should show exactly the word `Error`.

---

## Known Limitations

- The evaluator uses JavaScript's `Function` constructor with a strict whitelist; it does **not** support parentheses or advanced functions (e.g., `Math.sin`).
- Operator precedence follows JavaScript's native rules (multiplication/division before addition/subtraction). Parentheses are intentionally omitted to keep the implementation simple.
- The calculator does not retain history; each evaluation replaces the current expression.

---

## License

This project is released under the **MIT License**. Feel free to copy, modify, and distribute it as you wish.

--- 

*Enjoy the calculator!*