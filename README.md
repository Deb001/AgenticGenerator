Web Calculator - MVP

## Usage

1. Open `index.html` in any modern web browser.
2. Click the calculator buttons with the mouse **or** use the keyboard shortcuts listed below.
3. The display updates automatically after each interaction.

## Keyboard Shortcuts

| Key          | Action |
|--------------|--------|
| `0`‑`9`      | Enter digit |
| `.`          | Decimal point |
| `+`          | Addition |
| `-`          | Subtraction |
| `*`          | Multiplication |
| `/`          | Division |
| `Enter`      | Equals (`=`) |
| `Backspace`  | Delete last character (⌫) |
| `Escape`     | Clear all (`C`) |

## Manual Test Checklist

- [ ] All digits (0‑9) appear correctly in the display.
- [ ] Decimal point works and prevents multiple dots in a single number.
- [ ] Each operator (`+`, `−`, `×`, `÷`) performs the correct calculation.
- [ ] Chaining operations (e.g., `2 + 3 × 4 =`) yields immediate‑execution results.
- [ ] Division by zero shows an error state (e.g., `Error`).
- [ ] `C` clears the current input and resets the calculator.
- [ ] Backspace (`⌫`) removes the last entered character.
- [ ] All keyboard shortcuts function identically to mouse clicks.
- [ ] Responsive layout adapts on narrow viewports (mobile devices).

## Notes

- This MVP is a **single‑page static site**; no build tools, servers, or dependencies are required.
- Simply open `index.html` to start using the calculator.