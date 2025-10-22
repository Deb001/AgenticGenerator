// src/ui.js
import { evaluateExpression } from './calculator.js';

let currentInput = ''; // stores the expression as the user types
const MAX_LENGTH = 30;
const OPERATORS = '+-*/';

function initUI() {
  // Attach click listeners to all calculator buttons
  document.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', handleButtonClick);
  });

  // Keyboard support
  document.addEventListener('keydown', handleKeyPress);
}

/**
 * Click handler for calculator buttons.
 * Buttons use data-action to indicate special functions (clear, backspace, equals)
 * and data-value for characters to be appended to the expression.
 */
function handleButtonClick(event) {
  const btn = event.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'clear':
      clearAll();
      break;
    case 'backspace':
      backspace();
      break;
    case 'equals':
      evaluateCurrent();
      break;
    default:
      // digit, operator, decimal etc.
      if (value && validateAndAppend(value)) {
        updateDisplay(currentInput);
      } else {
        showError('Error');
      }
  }
}

/**
 * Keyboard handler – maps keys to the same actions as the UI buttons.
 */
function handleKeyPress(event) {
  const { key } = event;

  if (key >= '0' && key <= '9') {
    if (validateAndAppend(key)) updateDisplay(currentInput);
    event.preventDefault();
  } else if (key === '.' || key === ',') {
    if (validateAndAppend('.')) updateDisplay(currentInput);
    event.preventDefault();
  } else if (OPERATORS.includes(key)) {
    if (validateAndAppend(key)) updateDisplay(currentInput);
    event.preventDefault();
  } else if (key === 'Enter') {
    evaluateCurrent();
    event.preventDefault();
  } else if (key === 'Backspace') {
    backspace();
    event.preventDefault();
  } else if (key === 'Escape') {
    clearAll();
    event.preventDefault();
  }
}

/**
 * Append a character to the current input after validation.
 * Returns true if the character was accepted.
 */
function validateAndAppend(char) {
  if (currentInput.length >= MAX_LENGTH) return false;

  const lastChar = currentInput.slice(-1);

  // Operator handling
  if (OPERATORS.includes(char)) {
    // allow leading minus for negative numbers
    if (currentInput === '' && char === '-') return true;
    // prevent two operators in a row
    if (OPERATORS.includes(lastChar)) return false;
    currentInput += char;
    return true;
  }

  // Decimal point handling
  if (char === '.') {
    const parts = currentInput.split(/[+\-*/]/);
    const lastNumber = parts[parts.length - 1];
    if (lastNumber.includes('.')) return false;
    // prevent starting a number with just a dot (e.g., ".5" is allowed)
    if (lastNumber === '' && (lastChar && OPERATORS.includes(lastChar))) {
      // allow ".5" after an operator
      currentInput += '0';
    }
    currentInput += '.';
    return true;
  }

  // Digits
  if (/\d/.test(char)) {
    currentInput += char;
    return true;
  }

  return false;
}

/**
 * Evaluate the current expression and display the result.
 */
function evaluateCurrent() {
  if (!currentInput) return;
  try {
    const rawResult = evaluateExpression(currentInput);
    let formatted = Number(rawResult).toFixed(8);
    // Trim trailing zeros and possible trailing decimal point
    formatted = formatted.replace(/\.?0+$/, '');
    updateDisplay(formatted);
    currentInput = formatted;
  } catch (e) {
    showError('Error');
  }
}

/**
 * Write the provided string into the .display element.
 */
function updateDisplay(value) {
  const displayEl = document.querySelector('.display');
  if (displayEl) {
    displayEl.textContent = value;
    displayEl.classList.remove('error');
  }
}

/**
 * Show a user‑friendly error message and log details.
 */
function showError(message) {
  const displayEl = document.querySelector('.display');
  if (displayEl) {
    displayEl.textContent = 'Error';
    displayEl.classList.add('error');
  }
  console.error(message);
}

/**
 * Reset the input buffer and clear the display.
 */
function clearAll() {
  currentInput = '';
  updateDisplay('');
}

/**
 * Remove the last character from the input buffer and update the display.
 */
function backspace() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay(currentInput);
}

// Bootstrap UI when the document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}