# Simple Web Calculator

A lightweight, zero‑dependency calculator built with plain HTML, CSS, and JavaScript.  
Open `index.html` in any modern browser and start calculating.

---

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Setup & Run](#setup--run)
- [Usage](#usage)
- [Supported Operations](#supported-operations)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Manual Test Cases](#manual-test-cases)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- Responsive UI – works on desktop and mobile browsers.
- Full arithmetic support: addition, subtraction, multiplication, division, parentheses, and decimal numbers.
- Real‑time expression display.
- Safe evaluation with input sanitisation.
- Keyboard navigation (numbers, operators, `Enter`, `Backspace`, `Esc`/`C`).

---

## Folder Structure

/ (project root)
│
├─ index.html      # UI markup
├─ styles.css      # Responsive styling
├─ app.js          # Interaction & evaluation logic
└─ assets/         # (optional) place images or icons here

---

## Setup & Run

1. **Clone / download** the repository.
2. Open `index.html` in a web browser (no server required).

# Example on macOS / Linux
open index.html

# Example on Windows
start index.html

The calculator loads instantly; no build step or package manager is needed.

---

## Usage

- **Click** the on‑screen buttons or use the **keyboard** (see shortcuts below).
- The expression you build appears in the display area.
- Press **`=`** (or `Enter`) to evaluate.
- Press **`C`** (or `Esc`) to clear the entire expression.
- Press **←** (or `Backspace`) to delete the last character.

---

## Supported Operations

| Symbol | Meaning                | Example                |
|--------|------------------------|------------------------|
| `+`    | Addition               | `2 + 3`                |
| `−`    | Subtraction            | `5 − 2`                |
| `×`    | Multiplication (`*`)   | `4 × 6`                |
| `÷`    | Division (`/`)         | `8 ÷ 2`                |
| `(` `)`| Grouping / precedence  | `(1+2)×3`              |
| `.`    | Decimal point          | `3.14 + 2.0`           |

The calculator automatically converts the UI symbols (`×`, `÷`, `−`) to their JavaScript equivalents (`*`, `/`, `-`) before evaluation.

---

## Keyboard Shortcuts

| Key               | Action                     |
|-------------------|----------------------------|
| `0` – `9`         | Append digit               |
| `.`               | Append decimal point       |
| `+` `-` `*` `/`   | Append operator            |
| `(` `)`           | Append parentheses         |
| `Enter` / `=`     | Evaluate expression        |
| `Backspace`       | Delete last character      |
| `Esc` / `C`       | Clear entire expression    |
| Arrow keys        | No effect (focus stays on calculator) |

---

## Manual Test Cases

| Test # | Input Sequence (buttons/keys) | Expected Result |
|--------|------------------------------|-----------------|
| 1      | `2` `+` `3` `=`              | `5` |
| 2      | `7` `×` `8` `=`              | `56` |
| 3      | `9` `÷` `0` `=`              | `Error` (division by zero) |
| 4      | `(` `5` `+` `2` `)` `×` `3` `=` | `21` |
| 5      | `1` `.` `5` `+` `2` `.` `5` `=` | `4` |
| 6      | `C` (clear)                  | Display empty |
| 7      | `1` `+` `+` `2` `=`          | `Error` (malformed) |
| 8      | `9` `9` `9` `9` `9` `9` `9` `9` `9` `9` `+` `1` `=` | `10000000000` (length limit enforced) |
| 9      | `Backspace` after `5` `+` `3` → removes `3` → `5` `+` `=` | `Error` (incomplete expression) |
| 10     | Keyboard: `5` `*` `(` `2` `+` `3` `)` `Enter` | `25` |

> **Note:** Errors are displayed as the word **`Error`** in the read‑out area.

---

## Troubleshooting

- **Calculator shows “Error” after a valid expression**  
  Ensure the expression contains only digits, decimal points, parentheses, and the four basic operators. Any stray characters (e.g., letters) will trigger the safety filter.

- **Buttons are not responding on mobile**  
  Verify that the browser allows JavaScript execution and that you are not in a restrictive “read‑only” mode.

- **Keyboard shortcuts don’t work**  
  Click anywhere inside the calculator area once to give it focus, then try again.

---

## License

This project is released under the **MIT License** – feel free to use, modify, and distribute it.

--- 

*Happy calculating!*