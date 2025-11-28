# Scientific Web Calculator

A lightweight, client‑side scientific calculator built with plain HTML, CSS and JavaScript. It safely evaluates expressions using a custom parser (shunting‑yard algorithm) and supports common scientific functions.

## Features

- Basic arithmetic: `+ – * / ^`
- Parentheses for grouping
- Scientific functions: `sin, cos, tan, asin, acos, atan, log (base‑10), ln, sqrt, exp, pow`
- Constants: `π` and `e`
- Clear, backspace, and keyboard shortcuts
- Responsive layout with visual feedback
- Robust error handling (mismatched parentheses, division by zero, domain errors)

## Project Structure

```
.
├─ index.html      # UI markup
├─ style.css       # Styling and responsive grid
├─ app.js          # Evaluation engine + UI logic
├─ README.md       # Documentation (this file)
└─ .gitignore      # Git ignore rules
```

## Getting Started

1. **Clone or download** the repository.
2. Open `index.html` in any modern web browser (no server required).

The calculator will load and be ready for use.

## Keyboard Shortcuts

- Digits `0‑9`, decimal `.`, and operators `+ - * / ^ ( )` work directly.
- Press **Enter** to evaluate.
- Press **Backspace** to delete the last character.
- Press **c** (or **C**) to clear the display.
- Function names can be typed (e.g., `sin(`).

## Manual Test List

| Expression | Expected Result | Notes |
|------------|----------------|-------|
| `2+2` | `4` | Simple addition |
| `sin(pi/2)` | `1` | Trigonometric function |
| `log(100)` | `2` | Base‑10 logarithm |
| `ln(e)` | `1` | Natural logarithm |
| `2^3^2` | `512` | Right‑associative exponentiation |
| `sqrt(4)` | `2` | Square root |
| `1/0` | `Error: Division by zero` | Division error handling |
| `sqrt(-1)` | `Error: Sqrt domain error` | Domain error handling |

## Contributing

Feel free to fork the repo and submit pull requests. Improvements such as additional functions, theming, or accessibility enhancements are welcome.

## License

This project is released under the MIT License.
