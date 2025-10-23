'use strict';

// Cache DOM elements
const displayEl = document.getElementById('display');
const buttonEls = document.querySelectorAll('.calc-button');
const operatorSet = new Set(['+', '-', '*', '/']);

/**
 * Initialize calculator: bind click and keyboard events.
 */
function initCalculator() {
  buttonEls.forEach(btn => btn.addEventListener('click', handleButtonClick));
  document.addEventListener('keydown', handleKeyPress);
}

/**
 * Click handler for calculator buttons.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const btn = event.currentTarget;
  const value = btn.getAttribute('data-value');

  switch (value) {
    case 'C':
      clearDisplay();
      break;
    case '=':
      evaluateExpression();
      break;
    default:
      appendToDisplay(value);
  }
}

/**
 * Append a character to the display after validation.
 * @param {string} value
 */
function appendToDisplay(value) {
  const current = displayEl.value;
  const lastChar = current.slice(-1);

  // Disallow starting with an operator (except minus for negative numbers)
  if (!current && operatorSet.has(value) && value !== '-') {
    return;
  }

  // Prevent two operators in a row
  if (operatorSet.has(lastChar) && operatorSet.has(value)) {
    return;
  }

  // Decimal point handling
  if (value === '.') {
    // Find the current numeric segment (after the last operator)
    const segments = current.split(/[\+\-\*\/]/);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment.includes('.')) {
      return; // already has a decimal point
    }
    // Prevent leading decimal without a preceding digit (optional, allow ".5")
    if (!lastSegment) {
      // allow "."
    }
  }

  displayEl.value = current + value;
}

/**
 * Clear the calculator display.
 */
function clearDisplay() {
  displayEl.value = '';
}

/**
 * Evaluate the expression shown on the display.
 */
function evaluateExpression() {
  const rawExpr = displayEl.value;
  const sanitized = sanitizeExpression(rawExpr);

  try {
    // Using Function constructor for controlled evaluation
    const result = Function('return ' + sanitized)();

    if (typeof result !== 'number' || !isFinite(result) || isNaN(result)) {
      throw new Error('Invalid result');
    }

    displayEl.value = result;
  } catch (e) {
    displayEl.value = 'Error';
  }
}

/**
 * Remove any characters not allowed in a mathematical expression.
 * @param {string} expr
 * @returns {string}
 */
function sanitizeExpression(expr) {
  const whitelist = /^[0-9+\-*/().\s]+$/;
  const filtered = expr.split('').filter(ch => whitelist.test(ch)).join('');
  return filtered.trim();
}

/**
 * Keyboard support: map keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const key = event.key;

  const keyMap = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '.': '.',
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    'Enter': '=',
    '=': '=', // some keyboards send '=' on Enter
    'Escape': 'C',
    'c': 'C',
    'C': 'C'
  };

  if (key in keyMap) {
    event.preventDefault();
    const mapped = keyMap[key];
    switch (mapped) {
      case 'C':
        clearDisplay();
        break;
      case '=':
        evaluateExpression();
        break;
      default:
        appendToDisplay(mapped);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCalculator);