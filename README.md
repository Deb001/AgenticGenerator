# Simple Web Calculator

A minimal, accessible, and responsive calculator built with plain HTML, CSS, and JavaScript.  
It supports basic arithmetic (`+`, `-`, `×`, `÷`) with decimal numbers, proper operator precedence, and keyboard interaction.

## 📂 Project Structure

/ (root)
├─ index.html   # UI markup, ARIA‑enhanced buttons, display area
├─ styles.css   # Responsive grid layout, high‑contrast styling
├─ app.js       # Tokenizer, shunting‑yard parser, RPN evaluator, UI & keyboard wiring
└─ README.md    # This documentation

## 🚀 How to Run

1. **Clone / download** the repository.  
2. Open **`index.html`** in any modern browser (Chrome, Firefox, Edge, Safari).  
   No build step, server, or package manager is required.

## 🖥️ Usage

- **Click** the on‑screen buttons or use the **keyboard**:
  - Digits `0‑9` and decimal point `.` → input numbers.
  - Operators `+`, `-`, `*` (or `×`), `/` (or `÷`) → arithmetic operations.
  - `Enter` → evaluate (`=` button).
  - `Backspace` → delete the last character.
  - `C` (or `Escape`) → clear the display.

- The display is **read‑only**; it updates automatically as you type or click.

- Errors (e.g., division by zero, malformed expression) are shown as **`Error`** and the calculator can be cleared with `C`.

## ✅ Manual Test Checklist

| Test | Steps | Expected Result |
|------|-------|-----------------|
| **Basic addition** | `2 + 3 =` | `5` |
| **Subtraction** | `7 - 4 =` | `3` |
| **Multiplication** | `6 × 5 =` (or `6 * 5 =`) | `30` |
| **Division** | `8 ÷ 2 =` (or `8 / 2 =`) | `4` |
| **Operator precedence** | `2 + 3 × 4 =` | `14` |
| **Decimal arithmetic** | `3.5 + 2.1 =` | `5.6` |
| **Multiple decimals** | `1.2 . 3` (attempt) | Input prevented – only one decimal per number |
| **Consecutive operators** | `5 ++ 2 =` (attempt) | Input prevented – no two operators in a row |
| **Divide‑by‑zero** | `9 ÷ 0 =` | `Error` displayed |
| **Keyboard entry** | Type `7`, `*`, `8`, `Enter` | `56` |
| **Clear** | Press `C` or `Escape` at any time | Display resets to `0` |
| **Backspace** | Type `12`, press `Backspace` | Display shows `1` |

## 📌 Future Enhancements (Deferred)

- **History panel** – scrollable list of previous calculations.  
- **Scientific functions** – trigonometry, exponentiation, parentheses, etc.  
- **Theming** – dark mode and user‑selectable color schemes.  
- **Persisted state** – store the last expression in `localStorage`.  

These features are intentionally omitted to keep the core implementation lightweight and focused on reliable basic arithmetic.

---

*Happy calculating!* 🎉