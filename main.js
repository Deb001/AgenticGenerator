// main.js – UI controller for the calculator

let currentExpression = ''; // holds the raw expression string as the user types
let displayElement = null;

/**
 * Initializes the calculator UI: caches DOM elements, registers listeners,
 * and sets the initial display.
 */
function init() {
  displayElement = document.getElementById('display');
  const buttons = document.querySelectorAll('.button');

  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));
  document.addEventListener('keydown', handleKeyPress);

  updateDisplay('0');
}

/**
 * Handles click events on calculator buttons.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const value = event.currentTarget.dataset.value;
  if (value !== undefined) {
    processInput(value);
  }
}

/**
 * Handles keyboard input and maps keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const key = event.key;
  let mapped = null;

  if (key >= '0' && key <= '9') {
    mapped = key;
  } else if (key === '.') {
    mapped = '.';
  } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '×' || key === '÷') {
    mapped = key === '×' || key === '*' ? '*' : key === '÷' ? '/' : key;
  } else if (key === 'Enter' || key === '=') {
    mapped = '=';
  } else if (key === 'Backspace') {
    mapped = 'Backspace';
  } else if (key === 'Escape') {
    mapped = 'C';
  }

  if (mapped !== null) {
    event.preventDefault(); // stop default actions like navigation on Backspace
    processInput(mapped);
  }
}

/**
 * Central dispatcher for all calculator inputs.
 * @param {string} value
 */
function processInput(value) {
  if (value >= '0' && value <= '9') {
    appendDigit(value);
  } else if (value === '.') {
    appendDecimal();
  } else if (['+', '-', '*', '/'].includes(value)) {
    appendOperator(value);
  } else if (value === '=') {
    computeResult();
  } else if (value === 'C') {
    clearDisplay();
  } else if (value === 'Backspace') {
    handleBackspace();
  }
}

/**
 * Adds a digit to the current expression respecting length and leading zero rules.
 * @param {string} digit
 */
function appendDigit(digit) {
  if (currentExpression.length >= 12) return;

  const displayValue = currentExpression || '0';

  if (displayValue === '0') {
    if (digit === '0') return; // keep single leading zero
    currentExpression = digit;
  } else {
    currentExpression += digit;
  }

  updateDisplay(currentExpression);
}

/**
 * Adds an operator to the expression after validation.
 * @param {string} operator
 */
function appendOperator(operator) {
  if (!validateOperatorSequence(operator)) return;
  if (currentExpression === '') return; // cannot start with an operator

  currentExpression += operator;
  updateDisplay(currentExpression);
}

/**
 * Adds a decimal point if the current number segment does not already contain one.
 */
function appendDecimal() {
  if (currentExpression.length >= 12) return;

  // Determine the current numeric token
  const lastOpIdx = Math.max(
    currentExpression.lastIndexOf('+'),
    currentExpression.lastIndexOf('-'),
    currentExpression.lastIndexOf('*'),
    currentExpression.lastIndexOf('/')
  );
  const token = currentExpression.slice(lastOpIdx + 1);

  if (token.includes('.')) return; // already has a decimal

  if (token === '' || token === undefined) {
    // Starting a new number with a decimal
    currentExpression += '0.';
  } else {
    currentExpression += '.';
  }

  updateDisplay(currentExpression);
}

/**
 * Resets the expression and display to the initial state.
 */
function clearDisplay() {
  currentExpression = '';
  updateDisplay('0');
}

/**
 * Evaluates the current expression using Calculator.evaluate.
 * Handles errors and display length constraints.
 */
function computeResult() {
  if (currentExpression === '') return;

  const result = window.Calculator.evaluate(currentExpression);

  if (result === 'Error' || String(result).length > 12) {
    updateDisplay('Error');
    currentExpression = '';
  } else {
    const resultStr = String(result);
    updateDisplay(resultStr);
    currentExpression = resultStr;
  }
}

/**
 * Updates the calculator display element.
 * @param {string} value
 */
function updateDisplay(value) {
  if (displayElement) {
    displayElement.innerText = value;
  }
}

/**
 * Validates that adding the next operator does not create an invalid sequence.
 * @param {string} nextChar
 * @returns {boolean}
 */
function validateOperatorSequence(nextChar) {
  if (currentExpression === '') return false;
  const operators = '+-*/';
  const lastChar = currentExpression.slice(-1);
  return !(operators.includes(lastChar) && operators.includes(nextChar));
}

/**
 * Handles backspace: removes the last character from the expression.
 */
function handleBackspace() {
  if (currentExpression.length === 0) return;

  currentExpression = currentExpression.slice(0, -1);
  updateDisplay(currentExpression || '0');
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', init);