'use strict';

/* ==================== Calculator Class ==================== */
class Calculator {
  constructor() {
    this.expression = '';
  }

  /**
   * Append a character to the expression after validation.
   * @param {string} char
   */
  append(char) {
    if (!char || typeof char !== 'string') return;

    const operators = '+-*/';
    const lastChar = this.expression.slice(-1);

    // Operator validation: no consecutive operators
    if (operators.includes(char)) {
      if (this.expression === '' && char !== '-') {
        // Allow leading minus for negative numbers
        return;
      }
      if (operators.includes(lastChar)) {
        return;
      }
    }

    // Decimal validation: only one per numeric token
    if (char === '.') {
      const tokens = this.expression.split(/[+\-*/]/);
      const currentToken = tokens[tokens.length - 1];
      if (currentToken.includes('.')) {
        return;
      }
      // Prevent starting a token with a decimal without a leading zero
      if (currentToken === '' && (lastChar === '' || operators.includes(lastChar))) {
        this.expression += '0';
      }
    }

    this.expression += char;
  }

  /** Remove the last character from the expression. */
  backspace() {
    this.expression = this.expression.slice(0, -1);
  }

  /** Clear the entire expression. */
  clear() {
    this.expression = '';
  }

  /**
   * Safely evaluate the current expression.
   * @returns {string} Result of evaluation.
   * @throws {Error} If evaluation fails or division by zero occurs.
   */
  evaluate() {
    const sanitized = sanitizeExpression(this.expression);
    if (sanitized.length === 0) {
      throw new Error('Empty expression');
    }

    let result;
    try {
      // Using Function constructor for safe evaluation of arithmetic only
      result = new Function(`return ${sanitized}`)();
    } catch (e) {
      throw new Error('Invalid expression');
    }

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Division by zero');
    }

    // Trim unnecessary decimal zeros
    return Number.isInteger(result) ? result.toString() : result.toString();
  }
}

/* ==================== DOM & Global Variables ==================== */
let calculator = null;
let displayElement = null;

/* ==================== Utility Functions ==================== */

/**
 * Update the calculator display.
 * @param {string} value
 */
function updateDisplay(value) {
  if (displayElement) {
    displayElement.value = value;
  }
}

/**
 * Sanitize expression: replace Unicode operators and strip invalid chars.
 * @param {string} expr
 * @returns {string}
 * @throws {Error} If disallowed characters are present.
 */
function sanitizeExpression(expr) {
  const replaced = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  const allowedPattern = /^[0-9.+\-*/]*$/;
  if (!allowedPattern.test(replaced)) {
    throw new Error('Invalid characters in expression');
  }
  return replaced;
}

/* ==================== Event Handlers ==================== */

/**
 * Handle button clicks.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const button = event.target.closest('.calc-button');
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  try {
    switch (action) {
      case 'digit':
      case 'decimal':
      case 'operator':
        calculator.append(value);
        updateDisplay(calculator.expression);
        break;
      case 'equals':
        const result = calculator.evaluate();
        calculator.expression = result;
        updateDisplay(result);
        break;
      case 'clear':
        calculator.clear();
        updateDisplay('');
        break;
      case 'backspace':
        calculator.backspace();
        updateDisplay(calculator.expression);
        break;
      default:
        // No action needed for unknown actions
        break;
    }
  } catch (err) {
    updateDisplay(`Error: ${err.message}`);
    calculator.clear();
  }
}

/**
 * Handle keyboard input.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const key = event.key;
  const operators = {
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    '×': '*',
    '÷': '/'
  };

  // Map keys to actions
  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    calculator.append(key);
    updateDisplay(calculator.expression);
  } else if (key === '.' || key === ',') {
    event.preventDefault();
    calculator.append('.');
    updateDisplay(calculator.expression);
  } else if (operators[key]) {
    event.preventDefault();
    calculator.append(operators[key]);
    updateDisplay(calculator.expression);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    try {
      const result = calculator.evaluate();
      calculator.expression = result;
      updateDisplay(result);
    } catch (err) {
      updateDisplay(`Error: ${err.message}`);
      calculator.clear();
    }
  } else if (key === 'Backspace') {
    event.preventDefault();
    calculator.backspace();
    updateDisplay(calculator.expression);
  } else if (key === 'Escape') {
    event.preventDefault();
    calculator.clear();
    updateDisplay('');
  }
}

/* ==================== Initialization ==================== */

/**
 * Initialize the calculator app.
 */
function init() {
  displayElement = document.getElementById('display');
  calculator = new Calculator();

  document.addEventListener('click', handleButtonClick);
  document.addEventListener('keydown', handleKeyPress);
}

/* ==================== Start ==================== */
document.addEventListener('DOMContentLoaded', init);