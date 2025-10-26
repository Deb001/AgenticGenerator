# Simple Web Calculator

## Overview
This project is a lightweight, static‑file calculator. Opening **`index.html`** in any modern web browser (desktop or mobile) launches the calculator—no server, build step, or installation required.

## Project Files
- **`index.html`** – HTML markup for the calculator UI.  
- **`style.css`** – CSS that defines the layout, sizing, and responsive styling.  
- **`app.js`** – JavaScript handling button clicks, keyboard input, state management, and computation.  
- **`README.md`** – Documentation (the file you are reading).

## How to Run
1. Clone or download the repository.  
2. Open **`index.html`** in a web browser.  
3. The calculator UI appears and is ready for use.

## Supported Operations
- **Addition** `+`  
- **Subtraction** `‑` (minus)  
- **Multiplication** `×` or `*`  
- **Division** `÷` or `/`  
- **Decimal numbers** (e.g., `3.14`)  

The **C** button clears the current entry and resets the calculator.

## Manual Test Cases
| # | Input Sequence | Expected Display |
|---|----------------|------------------|
| 1 | `2 + 2 =`      | `4`              |
| 2 | `3.5 * 2 =`    | `7`              |
| 3 | `5 / 0 =`      | `Error`          |
| 4 | `C` (after any entry) | *(display cleared)* |

You can also use the keyboard:
- Digits `0–9` and `.` for numbers  
- `+`, `-`, `*`, `/` for operators  
- `Enter` for `=` (equals)  
- `Escape` for `C` (clear)  
- `Backspace` to delete the last character  

## Accessibility
All buttons include appropriate ARIA labels and are fully operable via keyboard navigation, ensuring the calculator is usable by assistive technologies.

## License
This project is released under the **MIT License**.