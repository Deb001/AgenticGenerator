import { evaluateExpression } from './calculator.js';

/**
 * Holds the current arithmetic expression as a string.
 * @type {string}
 */
let expressionBuffer = '';

/**
 * Initializes the UI: attaches click listeners to all buttons and a keydown listener to the document.
 */
function initUI() {
  const display = document.getElementById('display');
  if (!display) {
    console.error('Display element not found');
    return;
  }

  const buttons = document.querySelectorAll('.buttons button[data-action]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', handleButtonClick);
  });

  document.addEventListener('keydown', handleKeyPress);

  // Ensure the display is focusable for screen readers.
  display.setAttribute('tabindex', '0');
  updateDisplay('');
}

/**
 * Handles a button click event.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const target = /** @type {HTMLButtonElement} */ (event.currentTarget);
  const action = target.getAttribute('data-action');
  if (!action) return;

  switch (action) {
    case 'C':
      clearBuffer();
      break;
    case '←':
      backspace();
      break;
    case '=':
      evaluateCurrentExpression();
      break;
    default:
      // Append numbers, operators, parentheses, or decimal point.
      expressionBuffer += action;
      updateDisplay(expressionBuffer);
  }
}

/**
 * Handles keyboard input and maps keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const key = event.key;
  const keyMap = {
    'Enter': '=',
    '=': '=',
    'Backspace': '←',
    'Delete': 'C',
    'Escape': 'C',
    '+': '+',
    '-': '-',
    '*': '*',
    'x': '*',
    'X': '*',
    '/': '/',
    '÷': '/',
    '(': '(',
    ')': ')',
    '.': '.',
    ',': '.',
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

  if (key in keyMap) {
    event.preventDefault();
    const action = keyMap[key];
    // Simulate a button click for uniform handling.
    const fakeButton = document.createElement('button');
    fakeButton.setAttribute('data-action', action);
    handleButtonClick({ currentTarget: fakeButton });
  }
}

/**
 * Updates the calculator display.
 * @param {string} value
 */
function updateDisplay(value) {
  const display = document.getElementById('display');
  if (!display) return;
  display.textContent = value || '0';
}

/**
 * Clears the expression buffer and resets the display.
 */
function clearBuffer() {
  expressionBuffer = '';
  updateDisplay('');
}

/**
 * Removes the last character from the buffer and updates the display.
 */
function backspace() {
  expressionBuffer = expressionBuffer.slice(0, -1);
  updateDisplay(expressionBuffer);
}

/**
 * Evaluates the current expression buffer using the calculator engine.
 */
function evaluateCurrentExpression() {
  if (!expressionBuffer.trim()) {
    updateDisplay('Error');
    return;
  }
  try {
    const result = evaluateExpression(expressionBuffer);
    // Use toString to avoid scientific notation for large integers.
    expressionBuffer = String(result);
    updateDisplay(expressionBuffer);
  } catch (e) {
    if (e instanceof SyntaxError) {
      updateDisplay('Error');
    } else {
      console.error('Unexpected error during evaluation:', e);
      updateDisplay('Error');
    }
  }
}

// Initialize UI when the DOM is ready.
window.addEventListener('DOMContentLoaded', initUI);

export { initUI, handleButtonClick, handleKeyPress, updateDisplay, clearBuffer, backspace, evaluateCurrentExpression };