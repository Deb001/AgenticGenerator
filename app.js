'use strict';

// Calculator state object
const calculatorState = {
  currentValue: '',
  nextValue: '',
  pendingOperator: null,
  error: false,
};

// Reference to the display element (initialized in initCalculator)
let displayElement = null;

/**
 * Entry point executed on DOMContentLoaded.
 * Selects DOM elements, attaches listeners, and initializes state.
 */
function initCalculator() {
  displayElement = document.getElementById('calc-display');
  if (!displayElement) {
    console.error('Calculator display element not found.');
    return;
  }

  const buttons = document.querySelectorAll('.calc-button');
  buttons.forEach((btn) => {
    btn.addEventListener('click', handleButtonClick);
  });

  document.addEventListener('keydown', handleKeyPress);

  clearAll(); // Ensure display starts at 0
}

/**
 * Click handler for calculator buttons.
 * Extracts the data-token attribute and forwards it.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const token = event.currentTarget.dataset.token;
  if (typeof token === 'string') {
    processToken(token);
  }
}

/**
 * Keyboard handler that maps keys to calculator tokens.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const key = event.key;
  let token = null;

  if (/^[0-9]$/.test(key)) {
    token = key;
  } else if (key === '.' || key === ',') {
    token = '.';
  } else if (key === '+' || key === '-' || key === '/' || key === '*' || key === 'x' || key === 'X') {
    token = key === 'x' || key === 'X' ? '*' : key;
  } else if (key === 'Enter' || key === '=') {
    token = '=';
  } else if (key === 'Backspace') {
    token = 'C';
  }

  if (token) {
    event.preventDefault();
    processToken(token);
  }
}

/**
 * Central dispatcher that routes tokens to appropriate handlers.
 * @param {string} token
 */
function processToken(token) {
  if (calculatorState.error && token !== 'C') {
    return;
  }

  if (/^[0-9]$/.test(token)) {
    inputDigit(token);
  } else if (token === '.') {
    inputDecimal();
  } else if (['+', '-', '*', '/'].includes(token)) {
    inputOperator(token);
  } else if (token === '=') {
    computeResult();
  } else if (token === 'C') {
    clearAll();
  }
}

/**
 * Appends a digit to the nextValue and updates the display.
 * @param {string} digit
 */
function inputDigit(digit) {
  calculatorState.nextValue += digit;
  updateDisplay(calculatorState.nextValue);
}

/**
 * Adds a decimal point to nextValue if not already present.
 */
function inputDecimal() {
  if (!calculatorState.nextValue.includes('.')) {
    if (calculatorState.nextValue === '') {
      calculatorState.nextValue = '0.';
    } else {
      calculatorState.nextValue += '.';
    }
    updateDisplay(calculatorState.nextValue);
  }
}

/**
 * Handles operator input, performing any pending calculation.
 * @param {string} op
 */
function inputOperator(op) {
  const { currentValue, nextValue, pendingOperator } = calculatorState;

  if (pendingOperator && nextValue !== '') {
    const result = performOperation(currentValue, nextValue, pendingOperator);
    if (result === 'Error') {
      calculatorState.error = true;
      updateDisplay('Error');
      return;
    }
    calculatorState.currentValue = String(result);
  } else if (nextValue !== '') {
    calculatorState.currentValue = nextValue;
  }

  calculatorState.pendingOperator = op;
  calculatorState.nextValue = '';
  updateDisplay(calculatorState.currentValue);
}

/**
 * Computes the result of the pending operation.
 */
function computeResult() {
  const { currentValue, nextValue, pendingOperator } = calculatorState;

  if (pendingOperator && nextValue !== '') {
    const result = performOperation(currentValue, nextValue, pendingOperator);
    if (result === 'Error') {
      calculatorState.error = true;
      updateDisplay('Error');
      return;
    }
    calculatorState.currentValue = String(result);
    calculatorState.pendingOperator = null;
    calculatorState.nextValue = '';
    updateDisplay(calculatorState.currentValue);
  }
}

/**
 * Resets the calculator to its initial state.
 */
function clearAll() {
  calculatorState.currentValue = '';
  calculatorState.nextValue = '';
  calculatorState.pendingOperator = null;
  calculatorState.error = false;
  updateDisplay('0');
}

/**
 * Executes a basic arithmetic operation safely.
 * @param {string} a - numeric string
 * @param {string} b - numeric string
 * @param {string} op - '+', '-', '*', '/'
 * @returns {number|string} - numeric result or 'Error' on failure
 */
function performOperation(a, b, op) {
  const numA = Number(a);
  const numB = Number(b);
  if (Number.isNaN(numA) || Number.isNaN(numB)) {
    return 'Error';
  }

  switch (op) {
    case '+':
      return numA + numB;
    case '-':
      return numA - numB;
    case '*':
      return numA * numB;
    case '/':
      return numB === 0 ? 'Error' : numA / numB;
    default:
      return 'Error';
  }
}

/**
 * Updates the calculator display.
 * @param {string} value
 */
function updateDisplay(value) {
  if (displayElement) {
    displayElement.value = value;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCalculator);