let expression = "";
let errorState = false;
let displayEl = null;

/**
 * Updates the calculator display with the current expression or result.
 */
function updateDisplay(content) {
  if (displayEl) {
    displayEl.textContent = content;
  }
}

/**
 * Resets the calculator after an error when the next input is a digit.
 */
function resetOnNextInput() {
  if (errorState) {
    clearAll();
    errorState = false;
  }
}

/**
 * Shows an error message and blocks further input until cleared.
 * @param {string} message
 */
function showError(message) {
  updateDisplay(message);
  errorState = true;
}

/**
 * Clears the current expression and updates the display.
 */
function clearAll() {
  expression = "";
  updateDisplay("");
}

/**
 * Removes the last character from the expression and updates the display.
 */
function backspace() {
  if (errorState) return;
  expression = expression.slice(0, -1);
  updateDisplay(expression);
}

/**
 * Appends a digit to the expression, handling error reset.
 * @param {string} digit
 */
function appendDigit(digit) {
  if (errorState) {
    resetOnNextInput();
  }
  expression += digit;
  updateDisplay(expression);
}

/**
 * Appends an operator (+, -, *, /) if the previous character permits it.
 * @param {string} operator
 */
function appendOperator(operator) {
  if (errorState) return;
  const lastChar = expression.slice(-1);
  if (/[0-9.)]/.test(lastChar)) {
    expression += operator;
    updateDisplay(expression);
  }
}

/**
 * Adds a decimal point if the current number segment doesn't already contain one.
 */
function addDecimal() {
  if (errorState) return;
  // Find the last number segment
  const match = expression.match(/([0-9]+(?:\.[0-9]*)?)$/);
  if (match && match[0].includes(".")) {
    return; // already has a decimal
  }
  // If expression is empty or last char is an operator, prepend a zero
  const lastChar = expression.slice(-1);
  if (!/[0-9]/.test(lastChar)) {
    expression += "0";
  }
  expression += ".";
  updateDisplay(expression);
}

/**
 * Tokenizes the expression string into numbers and operators.
 * Supports parentheses for completeness.
 * @param {string} expr
 * @returns {Array<string>}
 */
function tokenize(expr) {
  const tokens = [];
  let numberBuffer = "";
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (/\d|\./.test(ch)) {
      numberBuffer += ch;
    } else if (/[+\-*/()]/.test(ch)) {
      if (numberBuffer) {
        tokens.push(numberBuffer);
        numberBuffer = "";
      }
      tokens.push(ch);
    } else if (/\s/.test(ch)) {
      continue;
    } else {
      throw new Error("Invalid character");
    }
  }
  if (numberBuffer) tokens.push(numberBuffer);
  return tokens;
}

/**
 * Converts an infix token list to Reverse Polish Notation using the shunting‑yard algorithm.
 * @param {Array<string>} tokens
 * @returns {Array<string>}
 */
function toRPN(tokens) {
  const output = [];
  const stack = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const associativity = { "+": "L", "-": "L", "*": "L", "/": "L" };

  for (const token of tokens) {
    if (!isNaN(token)) {
      output.push(token);
    } else if (/[+\-*/]/.test(token)) {
      while (
        stack.length &&
        /[+\-*/]/.test(stack[stack.length - 1]) &&
        ((associativity[token] === "L" &&
          precedence[token] <= precedence[stack[stack.length - 1]]) ||
          (associativity[token] === "R" &&
            precedence[token] < precedence[stack[stack.length - 1]]))
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      if (!stack.length) {
        throw new Error("Mismatched parentheses");
      }
      stack.pop(); // remove '('
    } else {
      throw new Error("Unknown token");
    }
  }

  while (stack.length) {
    const op = stack.pop();
    if (op === "(" || op === ")") {
      throw new Error("Mismatched parentheses");
    }
    output.push(op);
  }

  return output;
}

/**
 * Evaluates an RPN token list and returns the numeric result.
 * @param {Array<string>} rpn
 * @returns {number}
 */
function evaluateRPN(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (!isNaN(token)) {
      stack.push(parseFloat(token));
    } else {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) {
        throw new Error("Invalid expression");
      }
      let result;
      switch (token) {
        case "+":
          result = a + b;
          break;
        case "-":
          result = a - b;
          break;
        case "*":
          result = a * b;
          break;
        case "/":
          if (b === 0) {
            throw new Error("DIV0");
          }
          result = a / b;
          break;
        default:
          throw new Error("Unknown operator");
      }
      stack.push(result);
    }
  }
  if (stack.length !== 1) {
    throw new Error("Invalid expression");
  }
  return stack[0];
}

/**
 * Safely parses and evaluates the current expression, handling errors.
 */
function evaluateExpression() {
  if (errorState) return;
  try {
    if (!expression) {
      return;
    }
    const tokens = tokenize(expression);
    const rpn = toRPN(tokens);
    const result = evaluateRPN(rpn);
    expression = String(result);
    updateDisplay(expression);
  } catch (e) {
    if (e.message === "DIV0") {
      showError("Error: Division by zero");
    } else if (e.message === "Invalid expression" || e.message === "Mismatched parentheses") {
      showError("Error: Invalid expression");
    } else {
      showError("Error");
    }
  }
}

/**
 * Handles click events on calculator buttons using data-action attributes.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const btn = event.target.closest(".calc-btn");
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case "digit":
      appendDigit(value);
      break;
    case "operator":
      appendOperator(value);
      break;
    case "decimal":
      addDecimal();
      break;
    case "equals":
      evaluateExpression();
      break;
    case "clear":
      clearAll();
      break;
    case "backspace":
      backspace();
      break;
    default:
      // No action
      break;
  }
}

/**
 * Maps keyboard events to calculator functions.
 * @param {KeyboardEvent} event
 */
function handleKeyboard(event) {
  const key = event.key;

  if (/\d/.test(key)) {
    event.preventDefault();
    appendDigit(key);
    return;
  }

  switch (key) {
    case ".":
    case ",":
      event.preventDefault();
      addDecimal();
      break;
    case "+":
    case "-":
    case "*":
    case "/":
      event.preventDefault();
      appendOperator(key);
      break;
    case "Enter":
    case "=":
      event.preventDefault();
      evaluateExpression();
      break;
    case "Backspace":
      event.preventDefault();
      backspace();
      break;
    case "Escape":
      event.preventDefault();
      clearAll();
      break;
    default:
      // ignore other keys
      break;
  }
}

/**
 * Initializes the calculator: caches DOM references and registers listeners.
 */
function initCalculator() {
  displayEl = document.getElementById("display");
  if (!displayEl) {
    console.error("Display element not found");
    return;
  }

  document.addEventListener("click", handleButtonClick);
  window.addEventListener("keydown", handleKeyboard);
  updateDisplay("");
}

document.addEventListener("DOMContentLoaded", initCalculator);