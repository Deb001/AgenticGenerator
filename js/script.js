"use strict";

/**
 * Global state
 */
let currentInput = "";
let displayElement = null;

/**
 * Returns a + b
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}

/**
 * Returns a - b
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function subtract(a, b) {
  return a - b;
}

/**
 * Returns a * b
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Returns a / b (handles division by zero)
 * If divisor is zero, returns NaN
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function divide(a, b) {
  if (b === 0) return NaN;
  return a / b;
}

/**
 * Processes button clicks, updates the display, and triggers calculations
 * @param {Event} event
 * @returns {void}
 */
function handleButtonClick(event) {
  try {
    const btn = event.currentTarget || event.target;
    const value = btn && btn.dataset ? btn.dataset.value : undefined;

    if (typeof value === "undefined") {
      return;
    }

    const updateDisplay = () => {
      if (!displayElement) return;
      displayElement.textContent = currentInput === "" ? "0" : currentInput;
    };

    const operatorSet = new Set(["+", "-", "*", "/", "×", "x", "X", "÷"]);
    const isOperator = (ch) => operatorSet.has(ch);

    const findOperatorIndex = (expr) => {
      for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (ch === "+" || ch === "*" || ch === "/") return i;
        if (ch === "-") {
          if (i !== 0) return i; // treat '-' as operator only if not the first char
        }
        if (ch === "×" || ch === "x" || ch === "X" || ch === "÷") return i;
      }
      return -1;
    };

    if (value === "=") {
      const normalized = currentInput
        .replace(/\s+/g, "")
        .replace(/[×xX]/g, "*")
        .replace(/÷/g, "/");

      const opIndex = findOperatorIndex(normalized);
      if (opIndex === -1) {
        // nothing to evaluate
        updateDisplay();
        return;
      }

      const leftStr = normalized.slice(0, opIndex);
      const op = normalized[opIndex];
      const rightStr = normalized.slice(opIndex + 1);

      if (leftStr === "" || rightStr === "") {
        // incomplete expression
        if (displayElement) displayElement.textContent = "Error";
        currentInput = "";
        return;
      }

      const left = Number(leftStr);
      const right = Number(rightStr);

      if (Number.isNaN(left) || Number.isNaN(right)) {
        if (displayElement) displayElement.textContent = "Error";
        currentInput = "";
        return;
      }

      let result;
      switch (op) {
        case "+":
          result = add(left, right);
          break;
        case "-":
          result = subtract(left, right);
          break;
        case "*":
          result = multiply(left, right);
          break;
        case "/":
          result = divide(left, right);
          break;
        default:
          if (displayElement) displayElement.textContent = "Error";
          currentInput = "";
          return;
      }

      if (!Number.isFinite(result) || Number.isNaN(result)) {
        if (displayElement) displayElement.textContent = "Error";
        currentInput = "";
        return;
      }

      // Normalize result to string; avoid trailing ".0" complexities
      currentInput = String(result);
      updateDisplay();
      return;
    }

    // Handle operators (+, -, *, / and common symbols)
    if (isOperator(value)) {
      // Disallow starting with +, *, / (but allow '-' for negative number)
      const normalizedValue = value.replace(/[×xX]/g, "*").replace(/÷/g, "/");

      if (currentInput === "") {
        if (normalizedValue === "-") {
          currentInput = "-";
          updateDisplay();
        }
        // ignore other operators at start
        return;
      }

      // If last char is operator, replace it
      const lastChar = currentInput[currentInput.length - 1];
      if (isOperator(lastChar)) {
        currentInput =
          currentInput.slice(0, -1) +
          (normalizedValue === "*" || normalizedValue === "/" || normalizedValue === "+" || normalizedValue === "-"
            ? normalizedValue
            : value);
        updateDisplay();
        return;
      }

      // If an operator already exists (not counting a leading negative), do not append another
      const opIndexExisting = findOperatorIndex(currentInput);
      if (opIndexExisting !== -1) {
        // ignore extra operator presses to keep expression simple a op b
        updateDisplay();
        return;
      }

      // Append operator (prefer normalized standard operators)
      currentInput += normalizedValue;
      updateDisplay();
      return;
    }

    // Handle numeric and decimal input
    if (/^\d$/.test(value) || value === ".") {
      // Prevent multiple decimals in the current operand
      if (value === ".") {
        const opIndex = findOperatorIndex(currentInput);
        const segment =
          opIndex === -1 ? currentInput : currentInput.slice(opIndex + 1);
        if (segment.includes(".")) {
          // ignore extra decimals in the same operand
          updateDisplay();
          return;
        }
        if (segment === "") {
          // If decimal is the first char of an operand, prefix with 0
          currentInput += "0";
        }
      }
      currentInput += value;
      updateDisplay();
      return;
    }

    // Unrecognized value: ignore silently
  } catch (err) {
    if (displayElement) displayElement.textContent = "Error";
    currentInput = "";
  }
}

/**
 * Attaches click listeners to all calculator buttons on DOMContentLoaded
 * @returns {void}
 */
function initializeCalculator() {
  displayElement = document.getElementById("display");
  if (displayElement) {
    displayElement.textContent = "0";
  }

  const buttons = document.querySelectorAll(".button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", handleButtonClick, false);
  });
}

document.addEventListener("DOMContentLoaded", initializeCalculator, false);