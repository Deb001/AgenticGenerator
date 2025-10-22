# Simple Calculator

## Overview
A lightweight, single‑page web calculator that supports the four basic arithmetic operations (`+`, `-`, `*`, `/`) with decimal numbers and proper operator precedence. The UI is built with **HTML**, styled with **CSS**, and the calculation engine lives in **app.js**.

## Project Structure
/ (project root)
│
├─ index.html   # Calculator UI, button layout, and ARIA attributes
├─ styles.css   # Responsive layout, typography, and visual styling
├─ app.js       # Safe expression parser/evaluator, UI wiring, error handling
└─ README.md    # This documentation

## Getting Started
1. **Clone / download** the repository.  
2. Open `index.html` in any modern browser (no server required).  
3. The calculator is ready to use – click the buttons or use the keyboard (digits, `+ - * /`, `Enter` for `=` and `Esc` for `C`).

## Implementation Notes
- **UI (`index.html`)**  
  - A read‑only `<input>` element (`id="display"`) shows the current expression and results.  
  - Buttons are grouped semantically and include `aria-label` attributes for screen‑reader accessibility.  
  - All interactive elements have the class `calc-btn` for easy event delegation.

- **Styling (`styles.css`)**  
  - Uses CSS Grid to create a responsive calculator layout that adapts to small screens.  
  - High‑contrast colors and a minimum touch target size (44 px) meet basic accessibility guidelines.  

- **Logic (`app.js`)**  
  - **Expression parsing:** The engine tokenises the input string and evaluates it using the **shunting‑yard algorithm**, guaranteeing correct precedence without resorting to `eval()`.  
  - **Input validation:** Prevents malformed sequences (e.g., two operators in a row) and limits the display length to avoid overflow.  
  - **Error handling:** Division by zero or any parsing error results in the display showing `Error`. Pressing `C` clears the state.  
  - **Event wiring:** Button clicks and relevant keyboard events are delegated to a single handler that updates the display, triggers evaluation, or clears the calculator.

## Manual Test Checklist
| # | Expression | Expected Result |
|---|------------|-----------------|
| 1 | `3+5*2`    | `13` |
| 2 | `10/2-3`   | `2` |
| 3 | `7.5*2`    | `15` |
| 4 | `8/0`      | `Error` |
| 5 | `5+5`      | `10` |
| 6 | `0.1+0.2`  | `0.3` (rounded to the display precision) |
| 7 | `12-4/2`   | `10` |
| 8 | `9*9/3`    | `27` |
| 9 | `6+`       | `Error` (incomplete expression) |
|10 | `C` (clear) after any result | Display resets to empty |

Run through each row manually; the calculator should display the **Expected Result** after pressing `=` (or `Enter`). Any deviation indicates a regression.

## Known Limitations
- The engine does not support parentheses or advanced functions (e.g., `sqrt`).  
- Results are rounded to a maximum of 12 decimal places to avoid floating‑point noise.

## License
This project is released under the MIT License. Feel free to copy, modify, and distribute it.

---  

*Happy calculating!*