'use strict';

// Calculator state
let inputBuffer = '';
let currentValue = 0;
let pendingOperator = null; // '+', '-', '*', '/' or null
let errorState = false;

// Cached DOM elements
let displayEl = null;
let buttonNodes = null;

/**
 * Initialize calculator after DOM is ready.
 */
function initCalculator() {
  displayEl = document.getElementById('display');
  buttonNodes = document.querySelectorAll('.calc-button');

  buttonNodes.forEach(btn => {
    btn.addEventListener('click', handleButtonClick);
  });

  document.addEventListener('keydown', handleKeyPress);

  updateDisplay();
}

/**
 * Click handler for calculator buttons.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const btn = event.currentTarget;
  const key = btn.getAttribute('data-key');
  if (key) {
    processInput(key);
  }
}

/**
 * Keyboard handler mapping physical keys to calculator keys.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const keyMap = {
    'Enter': '=',
    'Escape': 'C',
    'Backspace': '⌫',
    '/': '/',
    '*': '*',
    '+': '+',
    '-': '-',
    '.': '.',
    ',': '.', // allow comma as decimal
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9'
  };

  const mapped = keyMap[event.key];
  if (mapped) {
    event.preventDefault();
    processInput(mapped);
  }
}

/**
 * Central dispatcher for all input keys.
 * @param {string} key
 */
function processInput(key) {
  if (errorState && key !== 'C') {
    return; // ignore everything except clear
  }

  if (/[0-9.]/.test(key)) {
    appendToBuffer(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    setOperator(key);
  } else if (key === '=') {
    computeResult();
  } else if (key === 'C') {
    clearAll();
  } else if (key === '⌫') {
    backspace();
  }

  updateDisplay();
}

/**
 * Append a digit or decimal point to the input buffer.
 * @param {string} char
 */
function appendToBuffer(char) {
  if (char === '.') {
    if (inputBuffer.includes('.')) return;
    if (inputBuffer === '' || inputBuffer === '-') {
      inputBuffer += '0.';
    } else {
      inputBuffer += '.';
    }
    return;
  }

  // char is a digit
  if (inputBuffer === '0') {
    // Replace leading zero unless it's after a decimal point
    inputBuffer = char;
  } else if (inputBuffer === '-0') {
    // Preserve negative sign
    inputBuffer = '-' + char;
  } else {
    inputBuffer += char;
  }
}

/**
 * Store operator and prepare for next operand.
 * @param {string} op
 */
function setOperator(op) {
  if (pendingOperator) {
    computeResult();
  }

  // Determine left operand
  if (inputBuffer !== '' && inputBuffer !== '-') {
    currentValue = parseFloat(inputBuffer);
  }

  pendingOperator = op;
  inputBuffer = '';
}

/**
 * Compute the result using the pending operator.
 */
function computeResult() {
  if (!pendingOperator) return;

  const rightOperand = inputBuffer !== '' && inputBuffer !== '-' ? parseFloat(inputBuffer) : currentValue;
  const leftOperand = currentValue;

  let result;

  switch (pendingOperator) {
    case '+':
      result = leftOperand + rightOperand;
      break;
    case '-':
      result = leftOperand - rightOperand;
      break;
    case '*':
      result = leftOperand * rightOperand;
      break;
    case '/':
      if (rightOperand === 0) {
        errorState = true;
        updateDisplay();
        return;
      }
      result = leftOperand / rightOperand;
      break;
    default:
      return;
  }

  currentValue = result;
  pendingOperator = null;
  inputBuffer = '';
}

/**
 * Reset calculator to its initial state.
 */
function clearAll() {
  inputBuffer = '';
  currentValue = 0;
  pendingOperator = null;
  errorState = false;
}

/**
 * Remove the last character from the input buffer.
 */
function backspace() {
  if (inputBuffer.length > 0) {
    inputBuffer = inputBuffer.slice(0, -1);
  }
}

/**
 * Refresh the calculator display.
 */
function updateDisplay() {
  if (!displayEl) return;

  if (errorState) {
    displayEl.textContent = 'Error';
    return;
  }

  if (inputBuffer !== '') {
    displayEl.textContent = inputBuffer;
  } else {
    displayEl.textContent = currentValue.toString();
  }
}

// Kick off initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', initCalculator);