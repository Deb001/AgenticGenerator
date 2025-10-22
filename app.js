/* app.js – Calculator core logic */

(() => {
  // Internal state
  let expression = '';

  // Cached DOM nodes
  let displayEl = null;
  let buttonNodes = [];

  /** Initialize the calculator once the DOM is ready */
  function init() {
    displayEl = document.getElementById('calc-display');
    buttonNodes = Array.from(document.querySelectorAll('.keypad button'));

    buttonNodes.forEach(btn => btn.addEventListener('click', handleButtonClick));
    document.addEventListener('keydown', handleKeyboard);
  }

  /** Click handler for all calculator buttons */
  function handleButtonClick(event) {
    const btn = event.currentTarget;
    const action = btn.dataset.action;

    switch (action) {
      case 'digit':
      case 'operator':
      case 'decimal':
        const char = btn.dataset.value ?? btn.textContent.trim();
        appendToExpression(char);
        break;
      case 'clear':
        clearExpression();
        break;
      case 'backspace':
        backspace();
        break;
      case 'evaluate':
        evaluateExpression();
        break;
      default:
        // No-op for unknown actions
        break;
    }
  }

  /** Append a character to the current expression */
  function appendToExpression(char) {
    if (expression.length >= 100) return;
    expression += char;
    updateDisplay(expression);
  }

  /** Reset the expression and clear the display */
  function clearExpression() {
    expression = '';
    updateDisplay('');
  }

  /** Remove the last character from the expression */
  function backspace() {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  }

  /** Evaluate the current expression safely */
  function evaluateExpression() {
    const sanitized = sanitizeExpression(expression);
    if (!sanitized) {
      updateDisplay('Error: Invalid input');
      return;
    }

    try {
      const result = safeEval(sanitized);
      if (!isFinite(result)) {
        throw new Error('Division by zero');
      }
      const resultStr = String(result);
      expression = resultStr; // allow chaining
      updateDisplay(resultStr);
    } catch (e) {
      const msg = e.message.toLowerCase().includes('division')
        ? 'Error: Division by zero'
        : 'Error';
      updateDisplay(msg);
    }
  }

  /** Allow only safe characters and enforce length limit */
  function sanitizeExpression(expr) {
    const allowed = /^[0-9+\-*/().\s]+$/;
    if (!allowed.test(expr)) return '';
    return expr.slice(0, 100);
  }

  /** Evaluate an expression using a Function constructor (after sanitisation) */
  function safeEval(expr) {
    // eslint-disable-next-line no-new-func
    return Function('"use strict";return (' + expr + ')')();
  }

  /** Update the calculator display */
  function updateDisplay(value) {
    if (!displayEl) return;
    displayEl.textContent = value;
    if (value.startsWith('Error')) {
      displayEl.classList.add('error');
    } else {
      displayEl.classList.remove('error');
    }
  }

  /** Map physical keyboard keys to calculator actions */
  function handleKeyboard(event) {
    const { key } = event;

    // Digits
    if (/^[0-9]$/.test(key)) {
      appendToExpression(key);
      event.preventDefault();
      return;
    }

    // Decimal point
    if (key === '.' || key === ',') {
      appendToExpression('.');
      event.preventDefault();
      return;
    }

    // Operators
    if (['+', '-', '*', '/'].includes(key)) {
      appendToExpression(key);
      event.preventDefault();
      return;
    }

    // Parentheses
    if (key === '(' || key === ')') {
      appendToExpression(key);
      event.preventDefault();
      return;
    }

    // Evaluate
    if (key === 'Enter' || key === '=') {
      evaluateExpression();
      event.preventDefault();
      return;
    }

    // Clear
    if (key === 'Escape' || key.toLowerCase() === 'c') {
      clearExpression();
      event.preventDefault();
      return;
    }

    // Backspace
    if (key === 'Backspace') {
      backspace();
      event.preventDefault();
      return;
    }
  }

  // Kick off when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();