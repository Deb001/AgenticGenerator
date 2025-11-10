// app.js – UI controller for the web calculator (ES module)
import { evaluate } from './calculator.js';

/**
 * Holds the current user input before evaluation.
 * @type {string}
 */
let inputBuffer = '';

/** DOM elements */
const displayEl = document.getElementById('display');
const keysContainer = document.querySelector('.calculator__keys');

/** Initialize calculator: attach listeners and set initial state. */
function initCalculator() {
  // Click handling via event delegation.
  keysContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.matches('button.key')) return;
    handleButtonClick(target);
  });

  // Keyboard support.
  document.addEventListener('keydown', handleKeyPress);

  updateDisplay();
}

/** Process a button click based on its data-action attribute. */
function handleButtonClick(button) {
  const action = button.dataset.action;
  const value = button.dataset.value;

  switch (action) {
    case 'digit':
      appendToBuffer(value);
      break;
    case 'decimal':
      handleDecimal();
      break;
    case 'operator':
      handleOperator(value);
      break;
    case 'clear':
      clearAll();
      break;
    case 'backspace':
      backspace();
      break;
    case 'equals':
      computeResult();
      break;
    default:
      // No other actions defined.
      break;
  }
}

/** Append a digit or operator to the buffer after validation. */
function appendToBuffer(char) {
  inputBuffer += char;
  updateDisplay();
}

/** Ensure only one decimal point per numeric segment. */
function handleDecimal() {
  const segment = getCurrentNumberSegment();
  if (!segment.includes('.')) {
    inputBuffer += '.';
    updateDisplay();
  }
}

/** Prevent consecutive operators and handle leading minus. */
function handleOperator(op) {
  if (inputBuffer === '' && op === '-') {
    // Allow negative number at start.
    inputBuffer = '-';
    updateDisplay();
    return;
  }
  const lastChar = inputBuffer.slice(-1);
  if (/[+\-*/]/.test(lastChar)) {
    // Replace the previous operator with the new one.
    inputBuffer = inputBuffer.slice(0, -1) + op;
  } else {
    inputBuffer += op;
  }
  updateDisplay();
}

/** Return the numeric segment currently being entered (after the last operator). */
function getCurrentNumberSegment() {
  const parts = inputBuffer.split(/[+\-*/]/);
  return parts[parts.length - 1] || '';
}

/** Clear the entire input and reset display. */
function clearAll() {
  inputBuffer = '';
  updateDisplay();
}

/** Remove the last character from the buffer. */
function backspace() {
  inputBuffer = inputBuffer.slice(0, -1);
  updateDisplay();
}

/** Compute the result using the calculator engine and handle errors. */
function computeResult() {
  if (inputBuffer === '') {
    return;
  }
  const result = evaluate(inputBuffer);
  if (typeof result === 'string') {
    // An error message was returned.
    displayEl.textContent = result;
    // Keep the buffer unchanged so the user can edit.
  } else {
    // Successful evaluation.
    inputBuffer = String(result);
    updateDisplay();
  }
}

/** Update the calculator display with the current buffer or a default value. */
function updateDisplay() {
  displayEl.textContent = inputBuffer === '' ? '0' : inputBuffer;
}

/** Map keyboard events to calculator actions. */
function handleKeyPress(event) {
  const { key } = event;
  if (/[0-9]/.test(key)) {
    appendToBuffer(key);
    event.preventDefault();
  } else if (key === '.' || key === ',') {
    handleDecimal();
    event.preventDefault();
  } else if (['+', '-', '*', '/'].includes(key)) {
    handleOperator(key);
    event.preventDefault();
  } else if (key === 'Enter' || key === '=') {
    computeResult();
    event.preventDefault();
  } else if (key === 'Backspace') {
    backspace();
    event.preventDefault();
  } else if (key === 'Escape') {
    clearAll();
    event.preventDefault();
  }
}

// Initialize when DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculator);
} else {
  initCalculator();
}
