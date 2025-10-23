// js/app.js
import { calculate } from './calc.js';

'use strict';

let expression = ''; // current infix expression built from user input

/**
 * Writes the provided string to the #display element.
 * @param {string} value
 */
function updateDisplay(value) {
  const display = document.getElementById('display');
  if (display) {
    display.textContent = value;
  }
}

/**
 * Resets the internal expression string and updates the display to '0'.
 */
function clearAll() {
  expression = '';
  updateDisplay('0');
}

/**
 * Evaluates the current expression using the imported calculate function.
 * On success, shows the result and stores it as the new expression.
 * On error, shows 'Error' and clears the expression.
 */
function evaluateExpression() {
  try {
    const result = calculate(expression);
    // Ensure result is a finite number
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    expression = String(result);
    updateDisplay(expression);
  } catch (e) {
    expression = '';
    updateDisplay('Error');
  }
}

/**
 * Handles a button click event.
 * Reads the data-key attribute and performs the appropriate action.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const btn = event.target.closest('.calc-key');
  if (!btn) return;

  const key = btn.dataset.key;
  processKey(key);
}

/**
 * Handles a keyboard keydown event.
 * Maps supported keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const { key } = event;
  let mappedKey = null;

  if (/^[0-9]$/.test(key)) {
    mappedKey = key;
  } else if (key === '.' || key === '+' || key === '-' || key === '*' || key === '/') {
    mappedKey = key;
  } else if (key === 'Enter') {
    mappedKey = '=';
  } else if (key === 'Backspace') {
    mappedKey = 'Backspace';
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    mappedKey = 'C';
  }

  if (mappedKey !== null) {
    event.preventDefault();
    processKey(mappedKey);
  }
}

/**
 * Core logic to process a calculator key (from button or keyboard).
 * @param {string} key
 */
function processKey(key) {
  switch (key) {
    case 'C':
    case 'Escape':
      clearAll();
      break;
    case '=':
      evaluateExpression();
      break;
    case 'Backspace':
      if (expression.length > 0) {
        expression = expression.slice(0, -1);
        updateDisplay(expression || '0');
      }
      break;
    default:
      // Append digits, operators, or decimal point
      if (isValidAppend(key)) {
        expression += key;
        updateDisplay(expression);
      }
      break;
  }
}

/**
 * Determines whether appending the given key to the current expression is valid.
 * Prevents multiple '.' in the same numeric token.
 * @param {string} key
 * @returns {boolean}
 */
function isValidAppend(key) {
  // Allow digits and operators unconditionally
  if (/^[0-9+\-*/]$/.test(key)) return true;

  // Handle decimal point
  if (key === '.') {
    // Find the last numeric token (characters after the most recent operator)
    const lastToken = expression.split(/[+\-*/]/).pop() || '';
    // Disallow if token already contains a decimal point
    return !lastToken.includes('.');
  }

  return false;
}

/**
 * Sets up event listeners and initializes the display.
 */
function init() {
  // Attach click listeners to calculator keys
  const buttons = document.querySelectorAll('.calc-key');
  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

  // Attach keyboard listener
  document.addEventListener('keydown', handleKeyPress);

  // Initial display
  updateDisplay('0');
}

// Start the application
init();