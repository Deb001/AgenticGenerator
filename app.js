/* app.js - Calculator core logic */

(() => {
  'use strict';

  /** State */
  let expression = '';
  /** @type {HTMLInputElement} */
  let displayElement = null;

  /** Utility: check if character is an operator */
  function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
  }

  /** Utility: ensure current numeric token has no decimal yet */
  function hasValidDecimal(expr) {
    const match = expr.match(/([0-9]*\.?[0-9]*)$/);
    return !(match && match[0].includes('.'));
  }

  /** Update the read‑only display */
  function updateDisplay(value) {
    if (displayElement) {
      displayElement.value = value;
    }
  }

  /** Append a character to the expression after validation */
  function appendToExpression(char) {
    const lastChar = expression.slice(-1);

    // Digits
    if (/[0-9]/.test(char)) {
      expression += char;
    }
    // Decimal point
    else if (char === '.') {
      if (hasValidDecimal(expression)) {
        // Prevent leading '.' without a zero (optional)
        if (!/[0-9]$/.test(lastChar)) {
          expression += '0';
        }
        expression += '.';
      }
    }
    // Parentheses
    else if (char === '(') {
      // Allow '(' after operator or at start
      if (expression === '' || isOperator(lastChar) || lastChar === '(') {
        expression += '(';
      }
    } else if (char === ')') {
      // Simple check: allow ')' if there is a matching '(' before
      const openCount = (expression.match(/\(/g) || []).length;
      const closeCount = (expression.match(/\)/g) || []).length;
      if (openCount > closeCount && /[0-9)]$/.test(lastChar)) {
        expression += ')';
      }
    }
    // Operators
    else if (isOperator(char)) {
      if (expression === '' && char !== '-') {
        // Disallow starting with +, *, /
        return;
      }
      if (isOperator(lastChar)) {
        // Allow unary minus after another operator
        if (char === '-' && lastChar !== '-') {
          expression += char;
        }
        // Disallow other consecutive operators
        return;
      }
      // Prevent operator right after '('
      if (lastChar === '(' && char !== '-') {
        return;
      }
      expression += char;
    }

    updateDisplay(expression);
  }

  /** Delete the last character */
  function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay(expression);
  }

  /** Clear the entire expression */
  function clearExpression() {
    expression = '';
    updateDisplay('');
  }

  /** Remove any characters not in the whitelist */
  function sanitizeExpression(expr) {
    return expr.replace(/[^0-9.+\-*/()]/g, '');
  }

  /** Evaluate the current expression safely */
  function evaluateExpression() {
    const sanitized = sanitizeExpression(expression);
    if (sanitized !== expression) {
      updateDisplay('Error');
      expression = '';
      return;
    }

    try {
      // eslint-disable-next-line no-new-func
      const result = Function('return ' + sanitized)();
      if (result === Infinity || result === -Infinity) {
        throw new Error('Division by zero');
      }
      const resultStr = Number.isFinite(result) ? String(result) : 'Error';
      updateDisplay(resultStr);
      expression = resultStr === 'Error' ? '' : resultStr;
    } catch (e) {
      updateDisplay('Error');
      expression = '';
    }
  }

  /** Handle button clicks */
  function handleButtonClick(event) {
    const btn = event.target;
    if (!btn.id) return;

    const id = btn.id;

    // Digits and decimal
    if (/^btn-[0-9]$/.test(id)) {
      appendToExpression(id.slice(-1));
    } else if (id === 'btn-dot') {
      appendToExpression('.');
    } else if (id === 'btn-open-paren') {
      appendToExpression('(');
    } else if (id === 'btn-close-paren') {
      appendToExpression(')');
    }
    // Operators
    else if (id === 'btn-plus') {
      appendToExpression('+');
    } else if (id === 'btn-minus') {
      appendToExpression('-');
    } else if (id === 'btn-multiply') {
      appendToExpression('*');
    } else if (id === 'btn-divide') {
      appendToExpression('/');
    }
    // Control buttons
    else if (id === 'btn-equals') {
      evaluateExpression();
    } else if (id === 'btn-clear') {
      clearExpression();
    } else if (id === 'btn-del') {
      deleteLast();
    }
  }

  /** Map keyboard input to calculator actions */
  function handleKeyboardInput(event) {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
      appendToExpression(key);
      event.preventDefault();
    } else if (key === '.' || key === '(' || key === ')') {
      appendToExpression(key);
      event.preventDefault();
    } else if (['+', '-', '*', '/'].includes(key)) {
      appendToExpression(key);
      event.preventDefault();
    } else if (key === 'Enter') {
      evaluateExpression();
      event.preventDefault();
    } else if (key === 'Backspace') {
      deleteLast();
      event.preventDefault();
    } else if (key === 'Escape') {
      clearExpression();
      event.preventDefault();
    }
  }

  /** Initialize calculator: cache elements and register listeners */
  function initCalculator() {
    displayElement = document.getElementById('display');

    const buttons = document.querySelectorAll('.calc-button');
    buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

    document.addEventListener('keydown', handleKeyboardInput);
  }

  document.addEventListener('DOMContentLoaded', initCalculator);
})();