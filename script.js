// Regular expression that allows digits, operators, decimal point, parentheses and whitespace
const allowedChars = /^[0-9+\-*/().\s]+$/;

/**
 * Sanitizes the input expression by ensuring only allowed characters are present.
 * @param {string} input - Raw expression string.
 * @returns {string} - Sanitized expression (whitespace trimmed).
 */
function sanitizeInput(input) {
  const trimmed = input.trim();
  if (!allowedChars.test(trimmed)) {
    throw new Error('Invalid characters in expression');
  }
  return trimmed;
}

/**
 * Calculator class encapsulating expression handling and evaluation.
 */
class Calculator {
  /**
   * Creates a new Calculator with an empty expression.
   */
  constructor() {
    /** @type {string} */
    this.expression = '';
  }

  /**
   * Appends a value (digit, operator, etc.) to the current expression.
   * @param {string} value
   */
  append(value) {
    this.expression += value;
  }

  /**
   * Clears the entire expression.
   */
  clear() {
    this.expression = '';
  }

  /**
   * Deletes the last character from the expression.
   */
  deleteLast() {
    this.expression = this.expression.slice(0, -1);
  }

  /**
   * Formats a numeric result to a maximum of 12 decimal places and removes trailing zeros.
   * @param {number} value
   * @returns {string}
   */
  formatResult(value) {
    // Use toFixed then trim unnecessary zeros and possible trailing decimal point
    const fixed = value.toFixed(12);
    const trimmed = fixed.replace(/\.?(0+)$|\.(?=.*\.)/g, (match) => {
      // If the match is only zeros after a decimal point, remove the decimal point as well
      return match.includes('.') ? '' : match;
    });
    return trimmed;
  }

  /**
   * Safely evaluates the current arithmetic expression.
   * @returns {string} - Result string or 'Error' on failure.
   */
  evaluate() {
    let sanitized;
    try {
      sanitized = sanitizeInput(this.expression);
    } catch (e) {
      return 'Error';
    }
    // Use Function constructor for evaluation in a safe sandboxed way
    let result;
    try {
      // eslint-disable-next-line no-new-func
      result = new Function('return ' + sanitized)();
    } catch (e) {
      return 'Error';
    }
    if (typeof result !== 'number' || !isFinite(result) || isNaN(result)) {
      return 'Error';
    }
    return this.formatResult(result);
  }
}

/**
 * Updates the calculator display with the provided value.
 * @param {string} value
 */
function updateDisplay(value) {
  const display = document.getElementById('display');
  if (display) {
    // Using textContent ensures any HTML is escaped automatically.
    display.textContent = value;
  }
}

/**
 * Handles click events on calculator buttons.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const target = event.target;
  if (!target.classList.contains('calc-button')) {
    return;
  }
  const value = target.getAttribute('data-value');
  if (!value) {
    return;
  }
  switch (value) {
    case '=':
      const result = calculator.evaluate();
      updateDisplay(result);
      calculator.expression = result === 'Error' ? '' : result;
      break;
    case 'C':
      calculator.clear();
      updateDisplay('');
      break;
    case '\u232b': // backspace symbol
      calculator.deleteLast();
      updateDisplay(calculator.expression);
      break;
    default:
      calculator.append(value);
      updateDisplay(calculator.expression);
      break;
  }
}

/**
 * Initializes the calculator: creates an instance, caches DOM references, and registers listeners.
 */
function initCalculator() {
  // Expose calculator instance for debugging (optional)
  window.calculator = new Calculator();
  const buttonsContainer = document.getElementById('buttons');
  if (buttonsContainer) {
    buttonsContainer.addEventListener('click', handleButtonClick);
  }
  // Ensure display is cleared on start
  updateDisplay('');
}

document.addEventListener('DOMContentLoaded', initCalculator);
