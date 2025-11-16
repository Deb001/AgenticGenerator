# Simple Calculator

A lightweight, single‑page web application that performs basic arithmetic (addition, subtraction, multiplication, division) on two user‑provided numbers.

## Features

- **Real‑time validation** – non‑numeric input triggers a clear error message.
- **Division‑by‑zero protection** – attempts to divide by zero are caught and reported.
- **Responsive design** – works on desktop and mobile browsers.
- **Pure vanilla JavaScript** – no external libraries or build steps required.

## Project Structure

```
root/
├─ index.html          # Main HTML page
├─ src/
│  ├─ app.js          # Calculator logic and UI handling
│  └─ styles.css      # Styling for the calculator UI
├─ .env.example        # Placeholder for future environment variables
└─ README.md           # Documentation (this file)
```

## Setup & Run

1. **Clone the repository** (or copy the files into a directory).
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. No additional tooling, package managers, or servers are required.

## Usage

1. Enter numbers into the **First Number** and **Second Number** fields.
2. Click one of the operation buttons:
   - **Add (+)**
   - **Subtract (−)**
   - **Multiply (×)**
   - **Divide (÷)**
3. The result appears below the buttons. If the input is invalid or a division‑by‑zero occurs, an error message is shown in red.

## Test Summary

| Test Case                              | Input A | Input B | Operation | Expected Output                     |
|----------------------------------------|---------|---------|-----------|--------------------------------------|
| Valid addition                         | 5       | 3       | add       | `Result: 8`                         |
| Valid subtraction                      | 10      | 4       | sub       | `Result: 6`                         |
| Valid multiplication                   | 2.5     | 4       | mul       | `Result: 10`                        |
| Valid division                         | 9       | 3       | div       | `Result: 3`                         |
| Division by zero                        | 7       | 0       | div       | `Cannot divide by zero.` (red)      |
| Non‑numeric first operand               | abc     | 2       | add       | `Please enter valid numbers.` (red) |
| Non‑numeric second operand              | 5       | xyz     | mul       | `Please enter valid numbers.` (red) |
| Empty inputs                            | (empty) | (empty) | sub       | `Please enter valid numbers.` (red) |

All manual tests pass, confirming correct arithmetic, proper error handling, and UI updates.

## Extending the Project

- **Add more operations** (e.g., exponentiation) by extending the `calculate` function and adding a new button with the appropriate `data-operator`.
- **Unit testing** – expose the calculator functions (already attached to `window.Calculator`) and write tests using a framework like Jest or Mocha.
- **Styling enhancements** – replace the simple CSS with a CSS framework (Bootstrap, Tailwind) for a richer UI.

---

© 2025 Simple Calculator Demo. All rights reserved.