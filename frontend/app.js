/**
 * Frontend logic for the arithmetic web calculator.
 * Handles UI interactions, keyboard input, and communication with the backend API.
 */

const API_ENDPOINT = '/api/evaluate';

/**
 * Sends the arithmetic expression to the backend for evaluation.
 * @param {string} expression - The arithmetic expression to evaluate.
 * @returns {Promise<string>} - Resolves with the result string or throws an error.
 */
async function evaluateExpression(expression) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expression })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `Server responded with ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return String(data.result);
}

/**
 * Updates the calculator display element.
 * @param {string} value - The value to show.
 */
function updateDisplay(value) {
  const display = document.getElementById('display');
  display.value = value;
}

/**
 * Appends a character to the current expression shown on the display.
 * @param {string} char - Character to append.
 */
function appendToExpression(char) {
  const display = document.getElementById('display');
  display.value = display.value + char;
}

/**
 * Clears the display.
 */
function clearDisplay() {
  updateDisplay('');
}

/**
 * Handles button click events.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const target = event.target;
  if (!target.matches('button.key')) return;

  const action = target.dataset.action;
  const value = target.dataset.value;

  switch (action) {
    case 'clear':
      clearDisplay();
      break;
    case 'delete':
      const display = document.getElementById('display');
      display.value = display.value.slice(0, -1);
      break;
    case 'equals':
      submitExpression();
      break;
    case 'input':
      appendToExpression(value);
      break;
    default:
      break;
  }
}

/**
 * Submits the current expression to the backend and displays the result.
 */
async function submitExpression() {
  const display = document.getElementById('display');
  const expression = display.value.trim();
  if (!expression) return;
  try {
    const result = await evaluateExpression(expression);
    updateDisplay(result);
  } catch (err) {
    updateDisplay(`Error: ${err.message}`);
  }
}

/**
 * Handles keyboard input for calculator operations.
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  const key = event.key;
  const allowedKeys = '0123456789.+-*/()';
  if (allowedKeys.includes(key)) {
    appendToExpression(key);
    event.preventDefault();
  } else if (key === 'Enter') {
    submitExpression();
    event.preventDefault();
  } else if (key === 'Backspace') {
    const display = document.getElementById('display');
    display.value = display.value.slice(0, -1);
    event.preventDefault();
  } else if (key === 'Escape') {
    clearDisplay();
    event.preventDefault();
  }
}

/**
 * Initializes the calculator UI and event listeners.
 */
function initCalculator() {
  const keypad = document.getElementById('keypad');
  keypad.addEventListener('click', handleButtonClick);
  document.addEventListener('keydown', handleKeyDown);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCalculator);

// Export functions for potential downstream use (e.g., testing)
export { evaluateExpression, appendToExpression, clearDisplay, submitExpression };