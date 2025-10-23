# Simple Web Calculator

## Project Overview
This project implements a lightweight, responsive calculator using only vanilla HTML, CSS, and JavaScript.  
- **`index.html`** – Defines the calculator UI: a read‑only display and a grid of buttons (digits, operators, decimal point, Clear, and Equals).  
- **`styles.css`** – Provides a clean, mobile‑friendly layout with uniform button styling and visual feedback on press.  
- **`app.js`** – Handles all UI interactions: button clicks, keyboard input, expression building, validation, evaluation, and error handling.

The three files work together as follows:
1. The browser loads `index.html`, which links to `styles.css` for styling and `app.js` for behavior.  
2. `app.js` attaches event listeners to each button and to relevant keyboard events, updating the display element in real time.  
3. When the user presses **=** (or Enter), the script sanitizes the expression, safely evaluates it, and shows the result or an **Error** message (e.g., division by zero).  
4. The **C** (Clear) button resets the display to an empty state.

## Manual Test Cases
1. `2+2` → **4**  
2. `5/0` → **Error**  
3. `3.5*2` → **7**  
4. `7-3` → **4**  
5. `12..3` (invalid) → ignored, display unchanged  
6. `8++2` (consecutive operators) → ignored, display unchanged  
7. `.5+0.2` → **0.7**  
8. `Clear (C)` resets display to empty.

## Running the Calculator
1. Clone or download the repository.  
2. Open `index.html` in any modern web browser (desktop or mobile).  
3. Use the on‑screen buttons or the keyboard (digits, `+ - * / .`, **Enter** for `=`, **Esc** for Clear) to perform calculations.

## License
This project is released under the MIT License. Feel free to modify and reuse the code.