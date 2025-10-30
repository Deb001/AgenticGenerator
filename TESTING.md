# Manual Test Cases for Calculator UI

These test cases are designed to verify the functionality of the calculator implemented with **index.html**, **style.css**, and **main.js**.  
Execute each case using the on‑screen buttons **or** the corresponding keyboard keys.

---

## 1. Basic Arithmetic

| Test ID | Input (Buttons / Keys) | Expected Display | Notes |
|--------|------------------------|------------------|-------|
| 1.1 | `2` `+` `3` `=` | `5` | Simple addition |
| 1.2 | `7` `-` `4` `=` | `3` | Simple subtraction |
| 1.3 | `6` `×` `5` `=` | `30` | Multiplication (`×` button or `*` key) |
| 1.4 | `9` `÷` `3` `=` | `3` | Division (`÷` button or `/` key) |
| 1.5 | `0` `+` `0` `=` | `0` | Zero handling |

---

## 2. Operator Precedence

| Test ID | Input | Expected Display | Explanation |
|--------|-------|------------------|-------------|
| 2.1 | `2` `+` `3` `×` `4` `=` | `14` | Multiplication before addition |
| 2.2 | `8` `÷` `2` `-` `1` `=` | `3` | Division before subtraction |
| 2.3 | `5` `+` `6` `÷` `3` `×` `2` `=` | `9` | `6 ÷ 3 × 2 = 4`, then `5 + 4 = 9` |
| 2.4 | `(` `2` `+` `3` `)` `×` `4` `=` | `20` | Parentheses force addition first |
| 2.5 | `(` `8` `÷` `(` `2` `+` `2` `)` `)` `=` | `2` | Nested parentheses |

---

## 3. Decimal Arithmetic

| Test ID | Input | Expected Display | Notes |
|--------|-------|------------------|-------|
| 3.1 | `1` `.` `5` `+` `2` `.` `3` `=` | `3.8` | Simple decimal addition |
| 3.2 | `5` `.` `0` `÷` `2` `=` | `2.5` | Division resulting in decimal |
| 3.3 | `0` `.` `1` `×` `0` `.` `2` `=` | `0.02` | Small decimal multiplication |
| 3.4 | `9` `.` `9` `9` `-` `0` `.` `9` `=` | `9.09` | Subtraction with trailing zeros |
| 3.5 | `.` `5` `+` `.` `5` `=` | `1` | Leading decimal point (allowed) |

---

## 4. Edge Cases & Error Handling

| Test ID | Input | Expected Display | Reason |
|--------|-------|------------------|--------|
| 4.1 | `5` `÷` `0` `=` | `Error` (or `Infinity`) | Division by zero |
| 4.2 | `=` (press without expression) | `` (empty) | No change / clear |
| 4.3 | `(` `5` `+` `3` `=` | `Error` | Unmatched opening parenthesis |
| 4.4 | `5` `+` `)` `=` | `Error` | Unmatched closing parenthesis |
| 4.5 | `2` `+` `*` `3` `=` | `Error` | Invalid operator sequence |
| 4.6 | `C` (Clear) after any input | `` (empty) | Display cleared |
| 4.7 | `←` (Backspace) after `123` | `12` | Removes last character |
| 4.8 | Rapid sequence `1` `+` `2` `+` `3` `+` `4` `=` | `10` | Continuous addition without intermediate `=` |
| 4.9 | `Escape` key at any time | `` (empty) | Keyboard clear |
| 4.10 | `Backspace` key after `7` `8` `9` | `78` | Keyboard backspace works |

---

## 5. Keyboard Shortcut Verification

| Test ID | Keyboard Input | Expected Display |
|--------|----------------|------------------|
| 5.1 | `1` `2` `+` `3` `Enter` | `15` |
| 5.2 | `4` `*` `5` `Enter` | `20` |
| 5.3 | `6` `/` `2` `Enter` | `3` |
| 5.4 | `7` `.` `5` `-` `2` `.` `5` `Enter` | `5` |
| 5.5 | `(` `9` `+` `1` `)` `*` `2` `Enter` | `20` |
| 5.6 | `Backspace` after typing `123` | `12` |
| 5.7 | `Escape` after typing any expression | `` (empty) |

---

## 6. Responsive Layout Checks (Manual Visual)

1. **Desktop Width ≥ 600 px** – Buttons should appear in a 4‑column grid, display occupies full width.
2. **Mobile Width < 600 px** – Buttons should shrink proportionally, still maintain a grid, and be easily tappable.
3. **Active State** – Pressed button shows a visual feedback (e.g., darker background).
4. **Disabled/Error State** – When an error occurs, the display background turns red (or another distinct style) and the text reads `Error`.

---

## 7. Test Execution Checklist

- [ ] All HTML elements load correctly (display, buttons, grid).
- [ ] CSS styles are applied (fonts, spacing, responsive behavior).
- [ ] JavaScript correctly binds click events and keyboard events.
- [ ] No console errors appear during any test case.
- [ ] Error messages are cleared automatically after the next valid input or after pressing **C** / **Escape**.

---

**End of Test Cases**  
*If any test fails, review `main.js` for logic errors, `style.css` for missing selectors, or `index.html` for incorrect data attributes.*