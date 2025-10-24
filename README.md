# Simple Calculator Project

This is a simple calculator project that allows basic arithmetic operations and supports keyboard input for convenience. The calculator ensures safe evaluation of expressions and prevents common vulnerabilities like injection attacks.

## Features
- **Non-editable Display:** Displays the current input and result.
- **Button Grid:** Includes digits (0-9), decimal point, operators (+, -, *, /), equals (=) to compute results, and a clear (C) button to reset the display.
- **Keyboard Support:** Allows numeric keys, operator keys (+, -, *, /, .), Enter (evaluate), Backspace (delete last character), and Escape (clear).
- **Safe Evaluation:** Uses a safe approach to evaluate expressions, preventing injection attacks.

## Installation & Usage
1. Clone the repository or download the files: `index.html`, `script.js`, `style.css`, and `README.md`.
2. Open `index.html` in any modern web browser.
3. Use the calculator by clicking the buttons or using your keyboard as per the instructions above.

## Manual Tests
To ensure the calculator works correctly, perform the following tests:
1. **Simple Arithmetic:** Enter expressions like "2+2" and "3*4-1". The result should be displayed accurately.
2. **Division by Zero:** Try dividing a number by zero (e.g., 5/0). The calculator should handle this gracefully, displaying an error message or preventing the operation.
3. **Decimal Calculations:** Perform calculations involving decimals (e.g., 1.1 + 2.2). Ensure the result is accurate and displayed correctly.
4. **Invalid Character Rejection:** Attempt to enter invalid characters like special symbols or alphabetic letters. The calculator should reject these inputs without breaking.
5. **Clear/Backspace Behavior:** Use the clear (C) button to reset the display and the backspace key to remove the last character. Verify that both actions work as expected.
6. **Keyboard Operation Verification:** Test if all keyboard shortcuts for digits, operators, Enter, Backspace, and Escape are functional and correctly update the display according to the input validation rules.

## Dependencies
- `index.html` links to `style.css` and `script.js`.
- `script.js` depends on DOM elements with specific ids/classes defined in `index.html`.

## File Structure
The project consists of four files:
- **index.html:** The main HTML file containing the calculator interface.
- **script.js:** The JavaScript file handling user interactions and calculations.
- **style.css:** CSS for styling the calculator buttons and display.
- **README.md:** This documentation providing instructions on usage, testing, and dependencies.

This project is designed to be simple, functional, and secure, suitable for basic arithmetic operations without compromising safety.