/* app.js – Calculator core logic (ES2023) */

(() => {
  /** Holds the arithmetic expression being built */
  let expression = '';

  /** Cached reference to the readonly display input */
  let displayEl = null;

  /** Utility: check if a character is an operator */
  const isOperator = (ch) => /[+\-*/]/.test(ch);

  /** Utility: get the current numeric segment (after the last operator) */
  const currentNumberSegment = (expr) => {
    const parts = expr.split(/[+\-*/]/);
    return parts[parts.length - 1];
  };

  /** Validate whether adding `newChar` to `currentExpr` keeps a legal expression */
  function isValidSequence(currentExpr, newChar) {
    // Disallow any characters outside the allowed set
    if (!/[0-9.+\-*/]/.test(newChar)) return false;

    // Length guard (prevent excessively long expressions)
    if (currentExpr.length >= 30) return false;

    const lastChar = currentExpr.slice(-1);

    // Leading operator: only allow '-' as the first character
    if (currentExpr === '' && isOperator(newChar) && newChar !== '-') {
      return false;
    }

    // Prevent two operators in a row
    if (isOperator(lastChar) && isOperator(newChar)) {
      return false;
    }

    // Decimal point rules
    if (newChar === '.') {
      // No multiple decimals in the same number segment
      const segment = currentNumberSegment(currentExpr);
      if (segment.includes('.')) return false;
      // Prevent a decimal as the very first character (e.g., ".5" → allow by prefixing 0)
      if (segment === '' && (lastChar === '' || isOperator(lastChar))) {
        // Allow, will become "0."
        return true;
      }
    }

    // Prevent a number segment starting with multiple zeros (e.g., "00")
    if (newChar === '0') {
      const segment = currentNumberSegment(currentExpr);
      if (segment === '0') return false; // already a leading zero without decimal
    }

    return true;
  }

  /** Update the readonly display element */
  function updateDisplay(value) {
    if (displayEl) displayEl.value = value;
  }

  /** Reset the calculator state */
  function clearDisplay() {
    expression = '';
    updateDisplay('');
  }

  /** Safely evaluate the current expression */
  function evaluateExpression() {
    try {
      // Using Function constructor for evaluation; expression is strictly built from allowed chars
      const result = Function(`'use strict'; return (${expression})`)();

      // Guard against non‑numeric results
      if (typeof result !== 'number' || !isFinite(result) || Number.isNaN(result)) {
        return 'Error';
      }
      // Trim unnecessary decimal zeros
      return Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?0+$/, '');
    } catch (e) {
      return 'Error';
    }
  }

  /** Core input processor */
  function processInput(inputChar) {
    if (inputChar === 'C') {
      clearDisplay();
      return;
    }

    if (inputChar === '=') {
      if (expression === '') {
        updateDisplay('');
        return;
      }
      const result = evaluateExpression();
      updateDisplay(result);
      // Preserve result as the new expression unless it's an error
      expression = result === 'Error' ? '' : result;
      return;
    }

    // Normal character (digit, operator, decimal)
    if (isValidSequence(expression, inputChar)) {
      // Auto‑prepend 0 for leading decimal point
      if (inputChar === '.' && (expression === '' || isOperator(expression.slice(-1)))) {
        expression += '0';
      }
      expression += inputChar;
      updateDisplay(expression);
    }
  }

  /** Click handler for calculator buttons */
  function handleButtonClick(event) {
    const btn = event.target.closest('.calc-button');
    if (!btn) return;

    const action = btn.dataset.action;
    if (!action) return;

    // Map data-action to the character understood by processInput
    let char = '';
    if (action.startsWith('digit-')) {
      char = action.split('-')[1];
    } else if (action.startsWith('operator-')) {
      char = action.split('-')[1];
    } else if (action === 'equals') {
      char = '=';
    } else if (action === 'clear') {
      char = 'C';
    }

    if (char) processInput(char);
  }

  /** Keyboard handler */
  function handleKeyPress(event) {
    // Ignore modifier keys (Ctrl, Alt, Meta, Shift for non‑character keys)
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    const key = event.key;

    // Map keys to calculator characters
    const keyMap = {
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
      '.': '.', '+': '+', '-': '-', '*': '*', '/': '/',
      'Enter': '=', '=': '=', // Enter or = key
      'Escape': 'C', 'c': 'C', 'C': 'C' // Clear
    };

    if (keyMap.hasOwnProperty(key)) {
      event.preventDefault(); // Prevent form submissions or unwanted scrolling
      processInput(keyMap[key]);
    }
  }

  /** Initialization – runs after DOM is ready */
  function initCalculator() {
    displayEl = document.getElementById('display');
    if (!displayEl) {
      console.error('Calculator error: #display element not found.');
      return;
    }

    // Delegate button clicks
    document.addEventListener('click', handleButtonClick);

    // Global keyboard support
    document.addEventListener('keydown', handleKeyPress);
  }

  // Public entry point
  document.addEventListener('DOMContentLoaded', initCalculator);
})();