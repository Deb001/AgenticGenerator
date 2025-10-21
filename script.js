// script.js

// Cache DOM elements and state
let displayElement = document.getElementById('display');
let currentExpression = ''; // stores the string shown on the display

/**
 * Initialize calculator: bind button clicks and keyboard events.
 */
function initializeCalculator() {
  // Cache all calculator buttons
  const buttons = document.querySelectorAll('.calc-button');
  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

  // Keyboard support
  document.addEventListener('keydown', handleKeyboardInput);
}

/**
 * Process a value as if it came from a button press.
 * @param {string} value - The button's data-value (e.g., '1', '+', '=', 'C')
 */
function processInput(value) {
  if (value === '=') {
    const result = evaluateExpression(currentExpression);
    displayElement.value = result;
    currentExpression = result === 'Error' ? '' : result;
  } else if (value === 'C') {
    clearDisplay();
  } else {
    // Append only allowed characters to avoid malformed expressions
    if (/^[0-9+\-*/().]$/.test(value)) {
      currentExpression += value;
      displayElement.value = currentExpression;
    }
  }
}

/**
 * Click handler for calculator buttons.
 * @param {Event} event
 */
function handleButtonClick(event) {
  const value = event.currentTarget.dataset.value;
  if (value) {
    processInput(value);
  }
}

/**
 * Keyboard handler mapping keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyboardInput(event) {
  const key = event.key;

  // Map keys to calculator values
  const keyMap = {
    'Enter': '=',
    '=': '=',
    'Escape': 'C',
    'c': 'C',
    'C': 'C',
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    '.': '.',
    '(': '(',
    ')': ')'
  };

  // Digits 0-9 map directly
  if (/^[0-9]$/.test(key)) {
    processInput(key);
    return;
  }

  if (keyMap[key] !== undefined) {
    processInput(keyMap[key]);
  }
}

/**
 * Safely evaluate a simple arithmetic expression.
 * Returns the result as a string, or 'Error' on failure.
 * @param {string} expression
 * @returns {string}
 */
function evaluateExpression(expression) {
  // Allow only numbers, operators, parentheses, decimal points, and whitespace
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    return 'Error';
  }

  try {
    // Use Function constructor for evaluation in a strict context
    const fn = new Function('"use strict";return (' + expression + ')');
    const result = fn();

    // Detect division by zero or other invalid results
    if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
      return 'Error';
    }

    return String(result);
  } catch (e) {
    return 'Error';
  }
}

/**
 * Reset the calculator display and internal buffer.
 */
function clearDisplay() {
  currentExpression = '';
  displayElement.value = '';
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCalculator);
} else {
  initializeCalculator();
}