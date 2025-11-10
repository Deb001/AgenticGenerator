import * as Calculator from './calculator.js';

let currentExpression = '';
let displayElement = null;

/**
 * Initializes the calculator UI: caches the display element,
 * attaches click listeners to all buttons, and adds a global
 * keydown listener for keyboard support.
 */
function initCalculator() {
  document.addEventListener('DOMContentLoaded', () => {
    displayElement = document.getElementById('display');
    if (!displayElement) {
      console.error('Calculator: #display element not found.');
      return;
    }

    const buttons = document.querySelectorAll('.calc-button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', handleButtonClick);
    });

    document.addEventListener('keydown', handleKeyPress);
    updateDisplay('0');
  });
}

/**
 * Handles click events from calculator buttons.
 * Determines the button's purpose via its data-action attribute
 * and updates the expression or display accordingly.
 *
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const value = button.dataset.value ?? button.textContent.trim();

  switch (action) {
    case 'digit':
    case 'operator':
      // Prevent leading zeros like "00"
      if (currentExpression === '' && value === '0') {
        // allow a single zero
        currentExpression = '0';
      } else {
        currentExpression += value;
      }
      updateDisplay(currentExpression);
      break;

    case 'clear':
      currentExpression = '';
      updateDisplay('0');
      break;

    case 'equals':
      evaluateAndShow();
      break;

    default:
      // Unknown action – ignore but log for debugging
      console.warn(`Calculator: Unhandled button action "${action}"`);
  }
}

/**
 * Handles keyboard input and maps supported keys to the same
 * logic used by button clicks.
 *
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const { key } = event;

  // Digits
  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    currentExpression += key;
    updateDisplay(currentExpression);
    return;
  }

  // Operators
  if (['+', '-', '*', '/'].includes(key)) {
    event.preventDefault();
    currentExpression += key;
    updateDisplay(currentExpression);
    return;
  }

  // Enter or '=' triggers evaluation
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateAndShow();
    return;
  }

  // Escape or Backspace clears the calculator
  if (key === 'Escape' || key === 'Backspace') {
    event.preventDefault();
    currentExpression = '';
    updateDisplay('0');
    return;
  }

  // Decimal point
  if (key === '.' || key === ',') {
    event.preventDefault();
    currentExpression += '.';
    updateDisplay(currentExpression);
    return;
  }
}

/**
 * Updates the calculator's visual display.
 *
 * @param {string} value - Text to show in the display area.
 */
function updateDisplay(value) {
  if (!displayElement) return;
  displayElement.textContent = value;
  // Ensure ARIA live region updates for assistive tech
  if (displayElement.getAttribute('aria-live') === null) {
    displayElement.setAttribute('aria-live', 'polite');
  }
}

/**
 * Evaluates the current expression using the Calculator module,
 * handling any errors and showing the result or a friendly message.
 */
function evaluateAndShow() {
  try {
    const result = Calculator.evaluateExpression(currentExpression);
    const resultStr = typeof result === 'number' ? result.toString() : String(result);
    updateDisplay(resultStr);
    currentExpression = resultStr;
  } catch (err) {
    console.error('Calculator evaluation error:', err);
    updateDisplay('Invalid input');
    currentExpression = '';
  }
}

// Export functions for potential external use (e.g., testing)
export {
  initCalculator,
  handleButtonClick,
  handleKeyPress,
  updateDisplay,
  evaluateAndShow,
};

// Auto‑initialize when the script is loaded
initCalculator();