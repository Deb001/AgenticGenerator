# Simple Web Calculator

A lightweight, responsive web calculator built with vanilla HTML, CSS, and JavaScript.  
It supports basic arithmetic operations, clear, and equals functionality, and works on both desktop and mobile browsers.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Development](#development)
- [Extending the Calculator](#extending-the-calculator)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

---

## Features

- **Basic arithmetic**: addition, subtraction, multiplication, division
- **Clear (C)** and **equals (=)** buttons
- **Responsive UI**: adapts to mobile, tablet, and desktop screens
- No external dependencies – pure HTML, CSS, and JavaScript
- Easy to extend (e.g., scientific functions, keyboard support)

---

## Demo

Open `index.html` in any modern browser to see the calculator in action.

---

## Project Structure

root/
├─ index.html      # Calculator UI markup
├─ style.css       # Styling, grid layout, responsive design
├─ app.js          # Core calculation logic & event handling
└─ README.md       # Documentation (this file)

---

## Setup & Installation

1. **Clone or download** the repository.

      git clone https://github.com/your-username/simple-web-calculator.git
   cd simple-web-calculator
   
2. **Open** `index.html` in a browser. No build step, server, or package manager is required.

   - For a quick preview, you can use the built‑in Python HTTP server:

          python -m http.server 8000
     # Then navigate to http://localhost:8000 in your browser
     
---

## Usage

- **Click** the numeric buttons (0‑9) to build a number.
- **Press** an operator (`+`, `-`, `*`, `/`) to set the operation.
- **Continue** entering the next number.
- **Hit** `=` to evaluate the expression. The result appears in the display.
- **Press** `C` to clear the current input and start a new calculation.

---

## Development

### Editing the UI

- The calculator layout is defined in `index.html`. Buttons are identified by their `data-key` attribute (e.g., `data-key="7"` for the digit 7).  
- To modify the UI, edit the HTML markup and adjust the CSS grid in `style.css` accordingly.

### Updating Logic

- Core logic resides in `app.js`. The main functions are:
  - `appendNumber(num)` – adds a digit to the current operand.
  - `chooseOperation(op)` – stores the selected operator and prepares for the next operand.
  - `compute()` – performs the calculation based on the stored operator.
  - `clear()` – resets all state.
- Event listeners bind each button to these functions using the `data-key` attribute.

### Styling

- `style.css` uses CSS Grid to arrange buttons.  
- Media queries (`@media (max-width: 600px)`) shrink the calculator for mobile devices while preserving usability.

---

## Extending the Calculator

### Adding New Operations

1. **HTML** – Add a button with a unique `data-key` (e.g., `data-key="%"` for modulus).
2. **JavaScript** – Extend `chooseOperation` and `compute` to handle the new operator:

      case '%':
       result = prevOperand % currentOperand;
       break;
   
3. **CSS** – Adjust the grid layout if necessary.

### Keyboard Support

- Listen for `keydown` events in `app.js` and map key codes to the existing button actions.
- Example snippet:

    document.addEventListener('keydown', (e) => {
      const key = e.key;
      if (/[0-9]/.test(key)) appendNumber(key);
      else if (['+', '-', '*', '/'].includes(key)) chooseOperation(key);
      else if (key === 'Enter') compute();
      else if (key === 'Escape') clear();
  });
  
### Scientific Functions

- Add buttons for functions like `sin`, `cos`, `log`, etc.
- Implement corresponding handlers in `app.js` that operate on the current operand.

---

## Browser Compatibility

The calculator works in all evergreen browsers:

- Chrome ≥ 60
- Firefox ≥ 55
- Edge ≥ 79
- Safari ≥ 12
- Mobile browsers (iOS Safari, Chrome Android)

No polyfills are required.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

--- 

*Happy calculating!*