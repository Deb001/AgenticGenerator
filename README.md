# Simple Web Calculator

A lightweight, responsive calculator built with plain HTML, CSS, and JavaScript.  
No build tools or server‑side code are required – just open `index.html` in a browser.

---

## 📂 Project Structure

/ (root)
├─ index.html   # UI markup, links to style.css & app.js
├─ style.css    # Responsive grid layout and basic styling
├─ app.js       # Interaction logic, keyboard support, safe evaluation
└─ README.md    # This documentation

---

## 🚀 Running the Calculator Locally

1. **Clone / copy** the repository folder to your machine.  
2. Open `index.html` directly in a modern browser (Chrome, Firefox, Edge, Safari).  
   *If you encounter CORS restrictions when loading the file locally, start a simple HTTP server:*  

      # Python 3
   python -m http.server 8000
   # Then open http://localhost:8000 in your browser
   
No additional dependencies are required.

---

## ⌨️ Keyboard Shortcuts

| Key                | Action                     |
|--------------------|----------------------------|
| `0` – `9`          | Insert digit               |
| `.`                | Decimal point              |
| `+`                | Addition operator          |
| `-`                | Subtraction operator       |
| `*` or `x` or `X`  | Multiplication operator    |
| `/` or `÷`         | Division operator          |
| `Enter` or `=`     | Evaluate (`=`)             |
| `Backspace`        | Delete last character (←) |
| `Escape` or `C`    | Clear all (`C`)            |

The calculator also responds to the on‑screen buttons; clicking them produces the same effect as the corresponding key press.

---

## ✅ Manual Test Cases

> Use the UI or keyboard shortcuts to verify each scenario.  
> Expected results are shown in **bold**.

1. **Basic addition**  
   `2 + 3 =` → **5**

2. **Subtraction with negative result**  
   `5 - 9 =` → **-4**

3. **Multiplication**  
   `7 * 8 =` → **56**

4. **Division**  
   `20 / 4 =` → **5**

5. **Decimal arithmetic**  
   `3.5 + 2.1 =` → **5.6**

6. **Chained operations (left‑to‑right)**  
   `2 + 3 * 4 =` → **20** *(the evaluator follows JavaScript’s precedence)*

7. **Division by zero**  
   `9 / 0 =` → **Error: Division by zero**

8. **Invalid sequence prevention**  
   - Press `+` twice → second `+` is ignored.  
   - Enter multiple decimals in one number (`3..5`) → extra `.` ignored.

9. **Clear (`C`)**  
   After typing `12+7`, press `C` → display resets to `0`.

10. **Backspace (`←`)**  
    After typing `123`, press backspace → display shows `12`.  
    Press backspace on a single digit → display resets to `0`.

11. **Keyboard mapping verification**  
    - Press `5`, `*`, `6`, `Enter` → **30**  
    - Press `Escape` → clears display.  
    - Press `Backspace` after `9+` → removes `+`.

---

## 🛠️ Development Notes (for contributors)

- **Expression handling** – `app.js` builds a string representation of the expression, validates each new token, and evaluates it with a safe `Function` constructor limited to `+ - * /` operators.
- **Error handling** – Any evaluation error or division by zero displays a user‑friendly message without breaking the UI.
- **Responsive design** – `style.css` uses CSS Grid; the calculator fits comfortably on screens as narrow as 320 px.

Feel free to fork, improve styling, or extend functionality (e.g., adding `%` or scientific operations). Happy calculating!