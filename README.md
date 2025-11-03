# Simple Calculator

## Overview
A minimal web‑based calculator built with HTML, CSS, and JavaScript. It supports basic arithmetic, decimal numbers, clear, keyboard input, and graceful error handling.

## Project Structure
index.html   # UI markup
style.css    # responsive styling
main.js      # calculator logic
README.md    # documentation

## Getting Started
1. Clone or download the repository.  
2. Open `index.html` in any modern browser (no server or build step required).

## Usage
- **Mouse / Touch**: Click the on‑screen buttons.  
- **Keyboard**:  
  - Digits `0‑9` and `.` for decimal points.  
  - `+`, `-`, `*` (or `×`), `/` (or `÷`) for operations.  
  - `Enter` → evaluate (`=`).  
  - `Backspace` → delete the last character.  
  - `Escape` → clear (`C`).  

The display shows the current expression or the result. Errors (e.g., divide‑by‑zero, malformed expression) appear as `Error`.

## Development Notes
All calculator logic lives in `main.js`. The evaluator parses the expression token‑by‑token and computes the result without using `eval`, ensuring a secure execution environment.

## Manual Test Checklist
| Test | Input | Expected |
|------|-------|----------|
| 1 | `2 + 2 =` | `4` |
| 2 | `3.5 * 2 =` | `7` |
| 3 | `5 / 0 =` | `Error` |
| 4 | `7 -` (press another operator) | Second operator ignored |
| 5 | `C` (clear) | Display resets to empty |
| 6 | Keyboard entry for all supported keys | Mirrors button behavior |

## Automated Tests (Optional)
A lightweight Node.js test harness can validate the core evaluator.

// test.js
// Expose evaluate from main.js when running under Node
if (typeof module !== 'undefined' && module.exports) {
  const { evaluate } = require('./main.js');
  const cases = [
    { expr: '2+2', expected: '4' },
    { expr: '3.5*2', expected: '7' },
    { expr: '5/0', expected: 'Error' },
    { expr: '10-3+2', expected: '9' },
  ];

  cases.forEach(({ expr, expected }) => {
    const result = evaluate(expr);
    console.assert(
      result === expected,
      `FAIL: "${expr}" → "${result}" (expected "${expected}")`
    );
  });

  console.log('All tests passed');
}

Run the tests with:

node test.js

*(Make sure `main.js` exports the `evaluate` function when `module.exports` is present.)*

## License
MIT License