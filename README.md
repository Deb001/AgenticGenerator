# Simple Web Calculator

## Overview
A minimal web‑based calculator that performs basic arithmetic operations (addition, subtraction, multiplication, division). It runs entirely in the browser, requiring no server or additional dependencies.

## Files
- **index.html** – The entry point containing the UI, minimal styling, and JavaScript logic.
- **test_report.txt** – A one‑page summary of test cases, expected results, actual results, and pass/fail status.
- **README.md** – This documentation.

## Installation
1. Clone or download the repository.
2. No build steps are required. All files are static.

## Running the Calculator
1. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
2. Enter two numbers and select an operator (`+`, `-`, `*`, `/`) or type a simple expression (e.g., `3+4`).
3. Click **Calculate**.
4. The result appears below the button. If division by zero is attempted, an error message is shown.

## Test Report
The file `test_report.txt` contains the results of the following validation cases:

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| 1 | 2 + 2 | 4 | 4 | Pass |
| 2 | 5 - 3 | 2 | 2 | Pass |
| 3 | 4 * 6 | 24 | 24 | Pass |
| 4 | 8 / 2 | 4 | 4 | Pass |
| 5 | 7 / 0 | Error (division by zero) | Error (division by zero) | Pass |

Review `test_report.txt` for the full details.

## Troubleshooting
- **Result shows “Error”** – This occurs when dividing by zero or when the input cannot be parsed as a valid arithmetic expression.
- **Calculator does not respond** – Ensure JavaScript is enabled in your browser.
- **Unexpected output** – Verify that only numbers and the supported operators are used; spaces are ignored.

## License
This project is released into the public domain. Feel free to use, modify, and distribute it without restriction.