// app.js

// Holds the current arithmetic expression
let expression = "";

/**
 * Initializes the calculator:
 * - Finds all buttons with a data-value attribute.
 * - Attaches click listeners.
 * - Clears the display.
 */
function init() {
  const buttons = document.querySelectorAll("[data-value]");
  buttons.forEach((btn) => btn.addEventListener("click", handleButtonClick));
  clearDisplay();
}

/**
 * Handles a button click event.
 * Routes the button's data-value to the appropriate handler.
 *
 * @param {Event} e - The click event.
 */
function handleButtonClick(e) {
  const value = e.target.dataset.value;
  if (!value) return;

  if (value === "C") {
    clearDisplay();
  } else if (value === "=") {
    const result = calculateExpression(expression);
    expression = result;
    updateDisplay(result);
  } else {
    // Digit or operator
    appendToExpression(value);
  }
}

/**
 * Appends a token (digit/operator) to the current expression
 * and updates the display.
 *
 * @param {string} token - The character to append.
 */
function appendToExpression(token) {
  expression += token;
  updateDisplay(expression);
}

/**
 * Safely evaluates an arithmetic expression.
 * Returns the result as a string or "Error" on failure.
 *
 * @param {string} expr - The arithmetic expression.
 * @returns {string}
 */
function calculateExpression(expr) {
  // Allow only numbers, operators, parentheses, decimal points, and whitespace
  const safePattern = /^[0-9+\-*/().\s]+$/;
  if (!safePattern.test(expr)) {
    return "Error";
  }

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr});`)();

    // Detect division by zero or other invalid results
    if (typeof result !== "number" || !isFinite(result) || isNaN(result)) {
      return "Error";
    }

    // Trim unnecessary decimal zeros
    return Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?0+$/, "");
  } catch {
    return "Error";
  }
}

/**
 * Clears the current expression and the display.
 */
function clearDisplay() {
  expression = "";
  updateDisplay("");
}

/**
 * Updates the calculator's display element.
 *
 * @param {string} value - The value to show.
 */
function updateDisplay(value) {
  const display = document.getElementById("display");
  if (display) {
    display.value = value;
  }
}

// Initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", init);