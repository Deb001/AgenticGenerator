# Calculator Web App

## Overview
A lightweight, zero‑dependency web calculator that runs entirely in the browser.  
It provides a clean UI, full keyboard support, and an **evaluate(expression)** API that safely parses and computes arithmetic expressions without using `eval`. The core logic lives in `src/calculator.js`, while `src/ui.js` handles all user interactions and accessibility concerns.

## File Structure
/ (project root)
│
├─ index.html          # Main page – loads UI and core scripts, defines the calculator UI
├─ styles.css          # Responsive, high‑contrast styling and focus indicators
│
└─ src/
   ├─ calculator.js   # Pure‑logic module – tokenises, parses (shunting‑yard) and evaluates expressions
   └─ ui.js           # UI controller – DOM handling, keyboard shortcuts, ARIA attributes

## Setup & Run
1. **Clone / download** the repository.  
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari). No build step, server, or package manager is required.  
3. The calculator is ready to use immediately – click the buttons or use the keyboard.

### Keyboard shortcuts
| Key            | Action                     |
|----------------|----------------------------|
| `0‑9` `.`      | Append digit / decimal     |
| `+` `-` `*` `/`| Append operator            |
| `(` `)`        | Append parenthesis         |
| `Enter`        | Evaluate (`=`)             |
| `Escape`       | Clear (`C`)                |
| `Backspace`    | Delete last character (`⌫`) |

## Testing `evaluate()`
A minimal test harness is included in `test/test_evaluator.html`. Open that file in a browser console or run the script directly in the console:

import { evaluate } from '../src/calculator.js';

// Basic operations
console.assert(evaluate('2+3') === 5, '2+3 should be 5');
console.assert(evaluate('4-7') === -3, '4-7 should be -3');
console.assert(evaluate('6*7') === 42, '6*7 should be 42');
console.assert(evaluate('8/2') === 4, '8/2 should be 4');

// Decimals and precedence
console.assert(evaluate('3.5+2.1') === 5.6, 'Decimal addition');
console.assert(evaluate('2+3*4') === 14, 'Operator precedence');
console.assert(evaluate('(2+3)*4') === 20, 'Parentheses');

// Edge cases
try {
  evaluate('5/0');
  console.error('Division by zero should throw');
} catch (e) {
  console.assert(e.message.includes('divide by zero'), 'Correct error for divide by zero');
}

try {
  evaluate('2++2');
  console.error('Malformed expression should throw');
} catch (e) {
  console.assert(e.message.includes('syntax'), 'Correct error for malformed expression');
}

All assertions should pass without throwing. If any fail, open an issue with the failing expression and expected result.

## Accessibility Notes
- **Semantic markup** – every button is a native `<button>` element with an appropriate `aria-label` (e.g., `aria-label="Add"` for `+`).  
- **Focus management** – the display area is focusable (`tabindex="0"`), and a visible focus ring is applied via CSS.  
- **Screen‑reader friendly** – the calculator announces the current expression and results through `aria-live="polite"` on the display element.  
- **Keyboard‑first** – all functionality is reachable via the keyboard shortcuts listed above; mouse/touch is a convenience layer.  
- **Contrast** – colors meet WCAG AA contrast ratios (minimum 4.5:1).  
- **Touch targets** – buttons are at least 44 × 44 px, ensuring comfortable use on mobile devices.

---

*Happy calculating!* 🚀