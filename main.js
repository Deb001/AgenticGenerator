// main.js - Calculator logic

let currentExpression = "";
let displayElement = null;

/**
 * Initialize calculator: cache DOM elements and register listeners.
 */
function initCalculator() {
  document.addEventListener("DOMContentLoaded", () => {
    displayElement = document.getElementById("display");
    const buttonContainer = document.querySelector(".button-grid");
    if (buttonContainer) {
      buttonContainer.addEventListener("click", handleButtonClick);
    }
    document.addEventListener("keydown", handleKeyPress);
  });
}

/**
 * Handle click events from calculator buttons using event delegation.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const btn = event.target.closest("button");
  if (!btn) return;

  const value = btn.dataset.value;
  const action = btn.dataset.action;

  if (value !== undefined) {
    appendToExpression(value);
  } else if (action) {
    if (action === "clear") {
      clearDisplay();
    } else if (action === "evaluate") {
      evaluateExpression();
    }
  }
}

/**
 * Append a token (digit, operator, parenthesis, or decimal) to the expression.
 * Performs basic validation to avoid malformed input.
 * @param {string} token
 */
function appendToExpression(token) {
  if (!displayElement) return;

  const operators = /[+\-*/]/;
  const lastChar = currentExpression.slice(-1);

  // Operator handling
  if (operators.test(token)) {
    if (currentExpression === "" || operators.test(lastChar) || lastChar === "(") {
      return; // prevent consecutive operators or starting with operator
    }
    currentExpression += token;
    updateDisplay();
    return;
  }

  // Decimal point handling
  if (token === ".") {
    const lastNumber = currentExpression.split(/[+\-*/()]/).pop() || "";
    if (lastNumber.includes(".")) return; // only one decimal per number
    // Prevent leading decimal without a preceding digit (optional, allow)
    currentExpression += token;
    updateDisplay();
    return;
  }

  // Parentheses handling
  if (token === "(") {
    // Allow '(' after operator or at start
    if (currentExpression && !operators.test(lastChar) && lastChar !== "(") {
      // Implicit multiplication (e.g., 2(3) -> 2*(3))
      currentExpression += "*";
    }
    currentExpression += token;
    updateDisplay();
    return;
  }

  if (token === ")") {
    const openCount = (currentExpression.match(/\(/g) || []).length;
    const closeCount = (currentExpression.match(/\)/g) || []).length;
    if (closeCount >= openCount) return; // unbalanced
    if (operators.test(lastChar) || lastChar === "(") return; // cannot close after operator or '('
    currentExpression += token;
    updateDisplay();
    return;
  }

  // Digits (0-9)
  if (/[0-9]/.test(token)) {
    currentExpression += token;
    updateDisplay();
    return;
  }
}

/**
 * Clear the calculator display and reset the current expression.
 */
function clearDisplay() {
  currentExpression = "";
  if (displayElement) displayElement.value = "";
}

/**
 * Evaluate the current arithmetic expression safely.
 */
function evaluateExpression() {
  if (!displayElement) return;

  const sanitized = sanitizeExpression(currentExpression);
  if (!isValidExpression(sanitized)) {
    displayError();
    return;
  }

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (!isFinite(result)) {
      displayError("Error: Division by zero");
      return;
    }
    displayElement.value = result;
    currentExpression = result.toString();
  } catch {
    displayError();
  }
}

/**
 * Handle keyboard input, mapping keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    appendToExpression(key);
    event.preventDefault();
  } else if (["+", "-", "*", "/"].includes(key)) {
    appendToExpression(key);
    event.preventDefault();
  } else if (key === ".") {
    appendToExpression(".");
    event.preventDefault();
  } else if (key === "(") {
    appendToExpression("(");
    event.preventDefault();
  } else if (key === ")") {
    appendToExpression(")");
    event.preventDefault();
  } else if (key === "Enter" || key === "=") {
    evaluateExpression();
    event.preventDefault();
  } else if (key === "Escape" || key === "c" || key === "C") {
    clearDisplay();
    event.preventDefault();
  }
}

/**
 * Remove any characters not allowed in the arithmetic expression.
 * @param {string} expr
 * @returns {string}
 */
function sanitizeExpression(expr) {
  return expr.replace(/[^0-9.+\-*/()]/g, "").replace(/\s+/g, "");
}

/**
 * Validate the expression against a whitelist regex and balanced parentheses.
 * @param {string} expr
 * @returns {boolean}
 */
function isValidExpression(expr) {
  const whitelist = /^[0-9.+\-*/()]+$/;
  if (!whitelist.test(expr)) return false;

  // Parentheses balance check
  let balance = 0;
  for (const ch of expr) {
    if (ch === "(") balance++;
    else if (ch === ")") {
      balance--;
      if (balance < 0) return false;
    }
  }
  return balance === 0;
}

/**
 * Display an error message and reset the expression.
 * @param {string} [msg="Error"]
 */
function displayError(msg = "Error") {
  if (displayElement) displayElement.value = msg;
  currentExpression = "";
}

/**
 * Update the calculator display with the current expression.
 */
function updateDisplay() {
  if (displayElement) displayElement.value = currentExpression;
}

// Kick off the initialization
initCalculator();