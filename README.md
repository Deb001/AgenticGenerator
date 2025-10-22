# Calculator Module Documentation

## Overview
`src/calculator.js` provides a **pure, side‑effect‑free** arithmetic engine that can be used by any JavaScript front‑end (e.g., the UI module in `src/ui.js`).  
It parses a simple infix expression consisting of numbers, the four basic operators (`+`, `-`, `*`, `/`), and decimal points.  
All validation, error handling, and numeric limits are performed inside the module, making it safe to import in any environment (browser, Node, test runners).

---

## Exported API

### `evaluate(expression: string): number`

Evaluates a mathematical expression and returns the computed result.

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `expression` | `string` | A **non‑empty** string containing a valid arithmetic expression. Tokens may be separated by optional whitespace. Supported characters are digits (`0‑9`), a single decimal point per number, and the operators `+`, `-`, `*`, `/`. |

#### Return Value
- Returns a JavaScript `Number` representing the evaluated result.
- The result is rounded to **8 decimal places** to avoid floating‑point noise.
- If the absolute value of the result exceeds `Number.MAX_SAFE_INTEGER` (or is smaller than `Number.MIN_SAFE_INTEGER`), a `CalculatorError` with the message `"Number out of range"` is thrown.

#### Errors
The function throws a **`CalculatorError`** (a subclass of `Error`) for any of the following conditions:

| Error Message | When |
|---------------|------|
| `"Invalid expression"` | The input contains illegal characters, mismatched operators, multiple consecutive operators, or an empty string. |
| `"Division by zero"` | An attempt is made to divide any number by `0`. |
| `"Number out of range"` | The computed result cannot be represented safely as an integer (`> Number.MAX_SAFE_INTEGER` or `< Number.MIN_SAFE_INTEGER`). |
| `"Too many digits"` | The expression contains a numeric token longer than **15** characters (prevents overflow and UI overflow). |

#### Example Usage
import { evaluate, CalculatorError } from './src/calculator.js';

try {
  const result = evaluate('12.5 * 3 - 4 / 2');
  console.log(result); // 34.5
} catch (e) {
  if (e instanceof CalculatorError) {
    console.error('Calculator error:', e.message);
  } else {
    console.error('Unexpected error:', e);
  }
}

---

## Integration Notes for `src/ui.js`

- **Input Normalisation**: UI code should replace the UI symbols `×` and `÷` with `*` and `/` before calling `evaluate`.
- **Display**: The UI expects `evaluate` to either return a finite number or throw a `CalculatorError`. In the latter case the UI should show the error message (e.g., `"Error"`).
- **Keyboard Support**: The UI forwards keyboard characters directly to the same validation pipeline used for button clicks, then passes the final expression string to `evaluate`.

---

## Manual Test Checklist

> Use the live calculator UI (served from `index.html`) and verify each item. Record any failures and note the error message shown.

### 1. Basic Arithmetic
| Test | Input | Expected |
|------|-------|----------|
| Add two integers | `2+3` | `5` |
| Subtract integers | `9-4` | `5` |
| Multiply integers | `6*7` | `42` |
| Divide integers | `20/5` | `4` |

### 2. Decimal Handling
| Test | Input | Expected |
|------|-------|----------|
| Decimal addition | `0.1+0.2` | `0.3` (rounded to 8 dp) |
| Mixed decimal & integer | `5.5*2` | `11` |
| Multiple decimals in one number (invalid) | `1.2.3+4` | **Error** (`Invalid expression`) |

### 3. Operator Edge Cases
| Test | Input | Expected |
|------|-------|----------|
| Consecutive operators (invalid) | `5++2` | **Error** (`Invalid expression`) |
| Leading operator (negative number) | `-5+3` | `-2` |
| Trailing operator (invalid) | `7*` | **Error** (`Invalid expression`) |

### 4. Division by Zero
| Test | Input | Expected |
|------|-------|----------|
| Simple divide‑by‑zero | `8/0` | **Error** (`Division by zero`) |
| Zero numerator | `0/5` | `0` |
| Complex expression with zero divisor | `5+3/(2-2)` | **Error** (`Division by zero`) |

### 5. Numeric Limits
| Test | Input | Expected |
|------|-------|----------|
| Very large result | `9007199254740991+1` | **Error** (`Number out of range`) |
| Very small (negative) result | `-9007199254740991-1` | **Error** (`Number out of range`) |
| Long numeric token ( >15 digits ) | `1234567890123456+1` | **Error** (`Too many digits`) |

### 6. Input Length & UI Behaviour
| Test | Action | Expected |
|------|--------|----------|
| Input longer than display width (e.g., 30 characters) | Type or click continuously | UI truncates display but still passes full expression to `evaluate`. |
| Clear (`C`) button | Press `C` at any time | Display resets to `0`. |
| Backspace (`←`) button | Delete last character | Expression updates correctly; empty expression after backspace shows `0`. |

### 7. Keyboard Support
| Test | Key(s) | Expected |
|------|--------|----------|
| Digits & operators | `1 2 + 3 =` (Enter as `=`) | Result `15` |
| Decimal point | `.` | Decimal accepted in current number |
| Backspace | `Backspace` | Deletes last character |
| Escape | `Esc` | Clears the calculator (`C` behaviour) |
| Invalid key (e.g., `a`) | `a` | Ignored; no change to expression |

### 8. Rounding & Precision
| Test | Input | Expected |
|------|-------|----------|
| Long floating result | `1/3` | `0.33333333` (8 dp) |
| Result with more than 8 dp | `2/7` | `0.28571429` (rounded) |

---

## License
This module is released under the MIT License. Feel free to copy, modify, and distribute as needed.

--- 

*End of README*