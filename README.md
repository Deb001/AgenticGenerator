# Simple Calculator

## Overview
A lightweight web‑based calculator built with HTML, CSS, and vanilla JavaScript. Open `index.html` in any modern browser. The UI works with mouse/touch and supports keyboard input.

## Usage
- **Display** – shows the current entry or result (read‑only).  
- **Buttons** – click or tap digits `0‑9`, decimal `.`, operators `+ – × ÷`, `=` to compute, `AC` to clear.  
- **Keyboard shortcuts**  
  - Numbers `0‑9` and `.` → same as button press  
  - `+`, `-`, `*`, `/` → operators  
  - `Enter` or `=` → evaluate  
  - `Backspace` → delete last digit (if implemented) – otherwise ignored  
  - `Escape` → clear (`AC`)

## Manual Test Checklist
- [ ] **Digit entry** – pressing any digit button (or key) updates the display correctly.  
- [ ] **Decimal handling** – a single decimal point can be entered per number; additional decimals are ignored.  
- [ ] **Basic operations** – each operator (`+`, `−`, `×`, `÷`) produces the correct result for simple two‑operand calculations.  
- [ ] **Operator chaining** – entering a sequence like `2 + 3 × 4 =` computes intermediate results correctly (e.g., `2 + 3 = 5`, then `5 × 4 = 20`).  
- [ ] **Equals (`=`) behavior** – pressing `=` after an operator yields the expected result; repeated `=` repeats the last operation.  
- [ ] **Division by zero** – `÷ 0` displays `Error` and blocks further calculations until `AC` is pressed.  
- [ ] **Clear (`AC`)** – resets all state and clears the display.  
- [ ] **Keyboard input** – all mapped keys perform the same actions as their button counterparts.  
- [ ] **Responsive layout** – buttons are large enough to tap comfortably on both desktop and mobile viewports.  
- [ ] **Stability** – entering unsupported sequences (e.g., multiple operators in a row) does not cause crashes or inconsistent state.

## Development Notes
- Core calculator logic is in `app.js`.  
- Styling resides in `style.css`.  
- No external libraries; the project works offline.