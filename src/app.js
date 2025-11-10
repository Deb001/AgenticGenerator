// src/app.js
/**
 * Front‑end controller for the calculator UI.
 * Handles button clicks, keyboard input, display updates, and history persistence.
 */

import { evaluate } from "./calculator.js";

/**
 * Key mapping for keyboard support.
 */
const KEY_MAP = {
  "Enter": "=",
  "Backspace": "⌫",
  "Delete": "C",
  "Escape": "C",
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
  "=": "=",
  "c": "C",
  "C": "C",
  "%": "%"
};

/**
 * Initializes the calculator UI once the DOM is ready.
 */
function initCalculator() {
  const display = document.getElementById("calc-display");
  const buttons = document.querySelectorAll(".calc-button");
  const historyContainer = document.getElementById("calc-history");

  if (!display || !buttons.length) {
    console.error("Calculator UI elements missing");
    return;
  }

  // Load persisted history
  const persisted = localStorage.getItem("calc_history");
  const history = persisted ? JSON.parse(persisted) : [];
  renderHistory(history, historyContainer);

  // Attach click listeners
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => handleButton(btn.dataset.value, display, history, historyContainer));
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (KEY_MAP[key] !== undefined) {
      e.preventDefault();
      handleButton(KEY_MAP[key], display, history, historyContainer);
    } else if (/[0-9.]/.test(key)) {
      e.preventDefault();
      handleButton(key, display, history, historyContainer);
    }
  });
}

/**
 * Handles a button press.
 * @param {string} value The button's logical value (e.g., "1", "+", "C").
 * @param {HTMLElement} display The display element.
 * @param {Array} history The in‑memory history array.
 * @param {HTMLElement} historyContainer The DOM container for history.
 */
function handleButton(value, display, history, historyContainer) {
  switch (value) {
    case "C":
      clearDisplay(display);
      break;
    case "⌫":
      backspace(display);
      break;
    case "=":
      calculate(display, history, historyContainer);
      break;
    default:
      appendToDisplay(display, value);
  }
}

/**
 * Appends a character to the display safely.
 */
function appendToDisplay(display, char) {
  // Prevent multiple consecutive operators (except minus for negative numbers)
  const lastChar = display.value.slice(-1);
  const operators = "+-*/";
  if (operators.includes(char) && operators.includes(lastChar) && !(char === "-" && lastChar !== "-")) {
    // Replace the previous operator with the new one
    display.value = display.value.slice(0, -1) + char;
    return;
  }
  display.value += char;
}

/**
 * Clears the calculator display.
 */
function clearDisplay(display) {
  display.value = "";
}

/**
 * Removes the last character from the display.
 */
function backspace(display) {
  display.value = display.value.slice(0, -1);
}

/**
 * Evaluates the expression shown in the display.
 */
function calculate(display, history, historyContainer) {
  const expr = display.value;
  try {
    const result = evaluate(expr);
    const entry = `${expr} = ${result}`;
    history.unshift(entry);
    if (history.length > 20) history.pop(); // keep recent 20 entries
    localStorage.setItem("calc_history", JSON.stringify(history));
    renderHistory(history, historyContainer);
    display.value = result.toString();
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  }
}

/**
 * Renders the calculation history.
 */
function renderHistory(history, container) {
  if (!container) return;
  container.innerHTML = "";
  history.forEach((entry) => {
    const div = document.createElement("div");
    div.textContent = entry;
    div.className = "calc-history-item";
    container.appendChild(div);
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCalculator);
} else {
  initCalculator();
}
