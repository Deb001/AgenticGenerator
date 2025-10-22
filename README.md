# Simple Web Calculator

## Overview
A lightweight, client‑side calculator built with vanilla HTML, CSS, and JavaScript.  
It supports:

- Basic arithmetic: `+`, `-`, `*`, `/`
- Parentheses for grouping
- Floating‑point numbers
- Unary minus (e.g., `-5 + 3`)
- Full keyboard navigation and accessibility features

The core evaluation logic lives in **`js/evaluator.js`**, which safely parses an expression using the shunting‑yard algorithm and evaluates the resulting Reverse Polish Notation (RPN). The UI is defined in **`index.html`**, styled by **`css/styles.css`**, and driven by **`js/app.js`**.

---

## Run Instructions
1. Clone or download the repository.
2. Open **`index.html`** in any modern web browser (no server required).
3. Use the on‑screen buttons or your keyboard to enter expressions.
4. Press **`=`** (or `Enter`) to evaluate. Results or error messages appear in the display area.

> **Tip:** The calculator works offline – all logic runs locally in the browser.

---

## API

### `evaluator.evaluate(expression)`

import { evaluate } from './js/evaluator.js';

const result = evaluate('3 + (2 * 4) - 5 / 2');

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `expression` | `string` | A mathematical expression consisting of numbers, `+ - * /`, parentheses, and optional whitespace. Unary minus is supported. |

**Returns:**  
- `number` – the computed result of the expression.  
- Throws an `Error` with a clear message for malformed input, unmatched parentheses, division by zero, or any other evaluation failure.

**Error handling example**

try {
  const value = evaluate('10 / (5 - 5)');
} catch (e) {
  console.error(e.message); // "Division by zero"
}

---

## Example Expressions

| Expression | Expected Result |
|------------|-----------------|
| `2 + 3 * 4` | `14` |
| `(1 + 2) * (3 + 4)` | `21` |
| `-5 + 8` | `3` |
| `3.5 * 2 - 1.2` | `5.8` |
| `10 / (2 + 3)` | `2` |
| `((2.5))` | `2.5` |
| `- (4 + 1) * 2` | `-10` |

---

## Extensibility Notes

### Adding New Functions (e.g., `sin`, `cos`, `pow`)
1. **Extend the tokenizer** in `js/evaluator.js` to recognise identifiers (`sin`, `cos`, …).  
2. **Update the shunting‑yard implementation** to treat identifiers as functions and handle their argument count.  
3. **Add the actual implementations** to the `OPERATORS` map (or a separate `FUNCTIONS` map) with the desired JavaScript `Math` calls:

const FUNCTIONS = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  pow: (a, b) => Math.pow(a, b),
};

4. Adjust the RPN evaluator to pop the correct number of operands and invoke the function.

### Swapping the Parser/Evaluator
The evaluator is deliberately isolated:

- **Parser** (`tokenize` + `toRPN`) → returns an array of RPN tokens.  
- **Evaluator** (`evaluateRPN`) → consumes the RPN array.

To replace the algorithm (e.g., with a third‑party library), simply export a new `evaluate` function that follows the same signature and error‑throwing contract. `js/app.js` will continue to work unchanged because it only calls `evaluate(expression)`.

---

## License
This project is licensed under the **MIT License**.

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

... (full MIT text omitted for brevity) ...

--- 

*Happy calculating!* 🚀