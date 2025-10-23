# Simple Web Calculator

A lightweight, responsive calculator built with plain HTML, CSS, and JavaScript.  
It supports basic arithmetic, decimal numbers, clear, backspace, and keyboard input.

## Project Structure

/ (project root)
├─ index.html   # UI markup, entry point
├─ style.css    # Layout, styling, responsive design
├─ script.js    # Calculator logic, state management, event handling
└─ README.md    # This documentation

## Getting Started

1. **Open the application**  
   Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).

2. **No build steps required** – the app runs entirely client‑side.

## Usage

- **Mouse / Touch**: Click the on‑screen buttons to enter numbers, operators, and commands.  
- **Keyboard**:  
  - Digits `0–9` and `.` (decimal) input numbers.  
  - `+`, `-`, `*`, `/` (or `×`, `÷`) select operators.  
  - `Enter` or `=` computes the result.  
  - `Backspace` deletes the last digit (same as the ⟵ button).  
  - `Escape` or `C` clears the calculator.

The display shows the current operand and, after pressing `=`, the computed result. Errors (e.g., division by zero) are shown as clear messages.

## Features

- **Basic arithmetic**: addition, subtraction, multiplication, division.  
- **Decimal support** – unlimited precision within JavaScript’s number limits.  
- **Clear (C)** – resets the entire calculation state.  
- **Backspace (⟵)** – removes the last entered character.  
- **Responsive layout** – grid adapts to narrow screens.  
- **Accessible focus & hover states** for keyboard navigation.  
- **Graceful error handling** – displays `"Error"` for invalid operations (e.g., divide by zero).

## Manual QA Checklist

| # | Test Description | Expected Result |
|---|------------------|-----------------|
| 1 | Open `index.html` in a browser. | Calculator UI loads without errors. |
| 2 | Click digits `1`, `2`, `3` sequentially. | Display shows `123`. |
| 3 | Press `.` then `4`, `5`. | Display shows `123.45`. |
| 4 | Click `+`, then digits `6`, `7`. | Display shows `67` and the previous operand `123.45` is stored. |
| 5 | Click `=`. | Display shows `190.45` (123.45 + 67). |
| 6 | Perform subtraction: `9`, `-`, `4`, `=`. | Display shows `5`. |
| 7 | Perform multiplication: `5`, `×`, `6`, `=`. | Display shows `30`. |
| 8 | Perform division: `8`, `÷`, `2`, `=`. | Display shows `4`. |
| 9 | Chain operations without clearing: `5`, `+`, `5`, `=`, `×`, `2`, `=`. | Display shows `20` ( (5 + 5) × 2 ). |
|10| Click `C` (clear). | All displays reset to `0` and internal state is cleared. |
|11| Enter `123`, click backspace (`⟵`) twice. | Display shows `1`. |
|12| Attempt divide‑by‑zero: `7`, `÷`, `0`, `=`. | Display shows `Error`. |
|13| Use keyboard: type `4`, `*`, `5`, `Enter`. | Display shows `20`. |
|14| Use keyboard backspace to delete a digit. | Digit is removed from the display. |
|15| Resize the browser window to a narrow width (< 400 px). | Buttons reflow into a compact layout, still fully usable. |
|16| Tab through buttons and activate with `Space`/`Enter`. | Each button responds, and focus styles are visible. |

All tests should pass without console errors. If any step fails, review `script.js` for logic errors or `style.css` for layout issues.

---

**Enjoy calculating!** 🚀