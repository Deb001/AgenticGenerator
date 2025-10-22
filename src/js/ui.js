// src/js/ui.js
import { evaluate } from './calculator.js';

let currentExpression = '';

/**
 * Updates the calculator display.
 * @param {string} value - Text to show in the display.
 */
function updateDisplay(value) {
  const display = document.getElementById('display');
  if (!display) return;
  display.textContent = value;
  // Remove previous error styling
  display.classList.remove('error');
}

/**
 * Clears the whole expression and the display.
 */
function clearAll() {
  currentExpression = '';
  updateDisplay('');
}

/**
 * Removes the last character from the expression.
 */
function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateDisplay(currentExpression);
}

/**
 * Calls the calculator engine and shows the result or an error.
 */
function evaluateExpression() {
  const { result, error } = evaluate(currentExpression);
  const display = document.getElementById('display');
  if (!display) return;

  if (error) {
    display.textContent = error;
    display.classList.add('error');
    // keep the faulty expression so the user can edit it
  } else {
    display.textContent = result;
    currentExpression = String(result);
  }
}

/**
 * Determines whether a character is an operator.
 * @param {string} ch
 */
function isOperator(ch) {
  return /[+\-*/]/.test(ch);
}

/**
 * Validates and appends a character to the current expression.
 * @param {string} ch
 */
function appendToExpression(ch) {
  const lastChar = currentExpression.slice(-1);

  // Prevent two operators in a row (except leading '-')
  if (isOperator(ch)) {
    if (currentExpression === '' && ch !== '-') return; // allow leading minus
    if (isOperator(lastChar) && !(ch === '-' && lastChar !== '-')) return;
  }

  // Prevent multiple decimals in the same number
  if (ch === '.') {
    const numberMatch = currentExpression.match(/[0-9.]+$/);
    if (numberMatch && numberMatch[0].includes('.')) return;
    // also avoid starting a number with just '.' (prepend 0)
    if (!lastChar || isOperator(lastChar) || lastChar === '(') {
      ch = '0.';
    }
  }

  // Simple parenthesis validation: avoid ')'' without matching '('
  if (ch === ')') {
    const open = (currentExpression.match(/\(/g) || []).length;
    const close = (currentExpression.match(/\)/g) || []).length;
    if (close >= open) return;
  }

  currentExpression += ch;
  updateDisplay(currentExpression);
}

/**
 * Handles click events from calculator buttons.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const btn = event.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action; // e.g., 'clear', 'backspace', 'equals'
  const value = btn.dataset.value;   // e.g., '1', '+', '('

  if (action) {
    switch (action) {
      case 'clear':
        clearAll();
        break;
      case 'backspace':
        backspace();
        break;
      case 'equals':
        evaluateExpression();
        break;
      default:
        break;
    }
  } else if (value) {
    appendToExpression(value);
  }
}

/**
 * Handles keyboard input and maps it to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  const key = event.key;

  if (key >= '0' && key <= '9') {
    appendToExpression(key);
  } else if (key === '.' || key === '+' || key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
    appendToExpression(key);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateExpression();
  } else if (key === 'Backspace') {
    event.preventDefault();
    backspace();
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    event.preventDefault();
    clearAll();
  }
}

/**
 * Initializes UI: registers button click and keyboard listeners.
 */
function init() {
  // Register button listeners
  const buttons = document.querySelectorAll('.calc-button');
  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

  // Keyboard support
  document.addEventListener('keydown', handleKeyDown);

  // Ensure display is cleared on start
  clearAll();
}

// Auto‑run when the script is loaded in a browser environment
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for module users (optional)
export { init };