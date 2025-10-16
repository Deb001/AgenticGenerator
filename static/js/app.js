/**
 * @fileoverview Client‑side logic for the web calculator.
 * Captures user input, validates it, sends calculation requests to the backend,
 * and updates the UI with results or error messages.
 */

/**
 * Keys that are permitted in the calculator expression.
 * @type {string[]}
 */
const allowedKeys = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '+', '-', '*', '/', '.', '(', ')'
];

/**
 * Holds the current arithmetic expression entered by the user.
 * @type {string}
 */
let currentExpression = '';

/**
 * Updates the expression display element.
 * @private
 */
function _renderExpression() {
  const exprEl = document.getElementById('expression');
  if (exprEl) {
    exprEl.textContent = currentExpression || '0';
  }
}

/**
 * Shows a result or error message in the UI.
 * @param {string} message - Text to display.
 * @param {boolean} isError - Whether the message is an error.
 * @private
 */
function _renderMessage(message, isError = false) {
  const resultEl = document.getElementById('result');
  const errorEl = document.getElementById('error');

  if (isError) {
    if (errorEl) errorEl.textContent = message;
    if (resultEl) resultEl.textContent = '';
  } else {
    if (resultEl) resultEl.textContent = message;
    if (errorEl) errorEl.textContent = '';
  }
}

/**
 * Sends the arithmetic expression to the backend for evaluation.
 *
 * @param {string} expr - The arithmetic expression to evaluate.
 * @returns {Promise<void>} Resolves when UI has been updated.
 */
async function sendCalculation(expr) {
  try {
    const response = await fetch('/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expression: expr })
    });

    if (!response.ok) {
      // Non‑2xx HTTP status
      const errorText = await response.text();
      console.error(`Server responded with status ${response.status}: ${errorText}`);
      _renderMessage('Server error. Please try again later.', true);
      return;
    }

    const data = await response.json();

    if (data && typeof data.result !== 'undefined') {
      _renderMessage(String(data.result), false);
    } else if (data && data.error) {
      _renderMessage(data.error, true);
    } else {
      console.warn('Unexpected response format:', data);
      _renderMessage('Unexpected server response.', true);
    }
  } catch (err) {
    console.error('Network or parsing error:', err);
    _renderMessage('Network error. Please check your connection.', true);
  }
}

/**
 * Handles button clicks for calculator keys.
 *
 * @param {MouseEvent} event - The click event.
 * @private
 */
function _handleButtonClick(event) {
  const target = /** @type {HTMLElement} */ (event.currentTarget);
  const value = target.getAttribute('data-value');

  if (!value) return;

  switch (value) {
    case 'C':
      currentExpression = '';
      _renderExpression();
      _renderMessage('', false);
      break;
    case '=':
      if (currentExpression.trim() === '') {
        _renderMessage('Enter an expression first.', true);
        return;
      }
      sendCalculation(currentExpression);
      break;
    default:
      // Append only allowed characters
      if (allowedKeys.includes(value)) {
        currentExpression += value;
        _renderExpression();
      }
      break;
  }
}

/**
 * Handles keyboard input for calculator operations.
 *
 * @param {KeyboardEvent} event - The keydown event.
 * @private
 */
function _handleKeyDown(event) {
  const { key } = event;

  if (key === 'Enter') {
    event.preventDefault();
    if (currentExpression.trim() !== '') {
      sendCalculation(currentExpression);
    }
    return;
  }

  if (key === 'Escape') {
    event.preventDefault();
    currentExpression = '';
    _renderExpression();
    _renderMessage('', false);
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    currentExpression = currentExpression.slice(0, -1);
    _renderExpression();
    return;
  }

  if (allowedKeys.includes(key)) {
    event.preventDefault();
    currentExpression += key;
    _renderExpression();
  }
}

/**
 * Binds UI event listeners to calculator buttons and keyboard events.
 *
 * Expected HTML structure:
 * - Buttons with class `calc-btn` and a `data-value` attribute.
 * - An element with id `expression` to show the current expression.
 * - An element with id `result` to show the calculation result.
 * - An element with id `error` to show error messages.
 *
 * @returns {void}
 */
function attachEventListeners() {
  // Button listeners
  const buttons = document.querySelectorAll('.calc-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', _handleButtonClick);
  });

  // Keyboard listener
  document.addEventListener('keydown', _handleKeyDown);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachEventListeners);
} else {
  attachEventListeners();
}