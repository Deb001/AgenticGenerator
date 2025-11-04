# Simple Web Calculator

## Overview
This project provides a minimal, single‑file web calculator implemented with HTML, inline CSS, and JavaScript. The calculator accepts two numeric inputs and offers buttons for addition (`+`), subtraction (`-`), multiplication (`×`), and division (`÷`). All calculations are performed client‑side, and the result is displayed instantly. Basic input validation and divide‑by‑zero handling are included.

## File Structure
/ (root)
│
├─ demo.html      # The calculator UI, styling, and logic in one file
├─ test_log.txt   # Log of functional tests (pass/fail)
└─ README.md      # This documentation

## demo.html
- **HTML**: Two `<input type="text">` fields for numbers, four operation buttons, and a `<div>` to show the result.
- **CSS (inline)**: Simple, responsive layout with clear visual feedback.
- **JavaScript (inline)**: 
  - Parses input values as floats.
  - Validates that both inputs are numeric.
  - Handles each operation, including a specific check for division by zero.
  - Updates the result display with either the computed value or an error message.

Open `demo.html` in any modern browser (Chrome, Firefox, Edge, Safari) to use the calculator.

## test_log.txt
The test log records the outcome of the following functional tests:

| Test Case                     | Expected Result | Pass/Fail |
|-------------------------------|-----------------|-----------|
| Addition (2 + 3)              | 5               | Pass |
| Subtraction (5 - 2)           | 3               | Pass |
| Multiplication (4 × 3)        | 12              | Pass |
| Division (10 ÷ 2)             | 5               | Pass |
| Division by zero (5 ÷ 0)      | “Error: Division by zero” | Pass |
| Non‑numeric input (“a”, 2)    | “Error: Invalid input”    | Pass |

The log file is plain text and can be opened with any text editor.

## Usage
1. **Open** `demo.html` in a web browser.
2. **Enter** numbers in the two input fields.
3. **Click** the desired operation button.
4. **View** the result or error message below the buttons.

## Testing
To verify the calculator works as intended:

1. Open `demo.html` in a browser.
2. Perform the test cases listed in `test_log.txt`.
3. Compare the displayed results with the expected outcomes.
4. Update `test_log.txt` if you add new test cases.

## Troubleshooting
- **Result shows “Error: Invalid input”**  
  Ensure both fields contain valid numbers (no letters, symbols, or empty strings).

- **Result shows “Error: Division by zero”**  
  The divisor (second input) must not be zero for division operations.

- **Calculator does not respond**  
  - Verify JavaScript is enabled in your browser.  
  - Check the browser console for any script errors.

## License
This project is released into the public domain. Feel free to copy, modify, and distribute it without restriction.