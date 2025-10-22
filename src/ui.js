// src/ui.js
import { evaluate } from './calculator.js';

const MAX_LENGTH = 30;

let expression = '';
let displayEl = null;
let calculatorEl = null;

/**
 * Writes the provided string to the #display element.
 * @param {string} content
 */
function updateDisplay(content) {
  if (displayEl) {
    displayEl.textContent = content;
  }
}

/**
 * Adds a character to the internal expression buffer respecting a maximum length.
 * @param {string} char
 */
function appendToExpression(char) {
  if (expression.length >= MAX_LENGTH) return;
  expression += char;
  updateDisplay(expression);
}

/**
 * Resets the expression buffer and clears the display.
 */
function clearExpression() {
  expression = '';
  updateDisplay('');
}

/**
 * Removes the last character from the expression buffer and updates the display.
 */
function backspaceExpression() {
  expression = expression.slice(0, -1);
  updateDisplay(expression);
}

/**
 * Calls evaluate(expression) inside a try/catch, shows the numeric result or error message.
 */
function evaluateExpression() {
  try {
    const result = evaluate(expression);
    const resultStr = String(result);
    updateDisplay(resultStr);
    expression = resultStr;
  } catch (e) {
    updateDisplay(e instanceof Error ? e.message : String(e));
  }
}

/**
 * Determines the button's data-action/value, updates the expression string,
 * updates the display, or triggers evaluation/clear/backspace.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const btn = event.target.closest('button');
  if (!btn || !calculatorEl.contains(btn)) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'digit':
    case 'operator':
    case 'decimal':
    case 'parenthesis':
      appendToExpression(value);
      break;
    case 'clear':
      clearExpression();
      break;
    case 'backspace':
      backspaceExpression();
      break;
    case 'equals':
      evaluateExpression();
      break;
    default:
      // Unknown action – ignore.
      break;
  }
}

/**
 * Maps keyboard keys to the same actions as button clicks.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const { key } = event;
  // Normalise key for easier handling
  const isDigit = /^[0-9]$/.test(key);
  const isOperator = /^[+\-*/]$/.test(key);
  const isDecimal = key === '.';
  const isParenthesis = key === '(' || key === ')';
  const isEnter = key === 'Enter';
  const isEscape = key === 'Escape';
  const isBackspace = key === 'Backspace';

  if (isDigit) {
    event.preventDefault();
    appendToExpression(key);
  } else if (isOperator) {
    event.preventDefault();
    // Map '*' and '/' to the symbols used in the UI if needed
    const op = key === '*' ? '*' : key === '/' ? '/' : key;
    appendToExpression(op);
  } else if (isDecimal) {
    event.preventDefault();
    appendToExpression('.');
  } else if (isParenthesis) {
    event.preventDefault();
    appendToExpression(key);
  } else if (isEnter) {
    event.preventDefault();
    evaluateExpression();
  } else if (isEscape) {
    event.preventDefault();
    clearExpression();
  } else if (isBackspace) {
    event.preventDefault();
    backspaceExpression();
  }
}

/**
 * Sets up DOM references, registers click and keyboard listeners,
 * and initializes the expression state.
 */
export function initCalculator() {
  displayEl = document.getElementById('display');
  calculatorEl = document.getElementById('calculator');

  if (!displayEl || !calculatorEl) {
    console.error('Calculator UI elements not found.');
    return;
  }

  calculatorEl.addEventListener('click', handleButtonClick);
  document.addEventListener('keydown', handleKeyPress);

  clearExpression();
}

// Auto‑initialize when the module is loaded in a browser environment.
if (document.readyState !== 'loading') {
  initCalculator();
} else {
  document.addEventListener('DOMContentLoaded', initCalculator);
}