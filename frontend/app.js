// app.js – Client‑side logic for the calculator UI.
// This script is loaded with `defer` in index.html, ensuring the DOM is ready.

'use strict';

/**
 * Sends an arithmetic expression to the backend evaluator API.
 * @param {string} expression The raw arithmetic expression (e.g., "2+3*4").
 * @returns {Promise<{result: string, error: string|null}>} Resolves with the evaluation result or error.
 */
async function evaluateExpression(expression) {
  try {
    const response = await fetch('/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expression })
    });
    if (!response.ok) {
      // Backend returned an HTTP error status.
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    // Expected shape: { result: "...", error: null } or { result: null, error: "..." }
    if (data.error) {
      throw new Error(data.error);
    }
    return { result: String(data.result), error: null };
  } catch (err) {
    // Network failure or JSON parsing error.
    return { result: null, error: err.message };
  }
}

/**
 * Calculator controller handling UI interactions, state, and communication.
 */
const Calculator = (function () {
  // Private state
  let expression = '';
  const displayEl = document.getElementById('calc-display');
  const keypadEl = document.querySelector('.keypad');

  /**
   * Updates the visual display with the current expression or result.
   * @param {string} value The string to show in the display.
   */
  function updateDisplay(value) {
    displayEl.value = value;
  }

  /**
   * Clears the current expression.
   */
  function clearExpression() {
    expression = '';
    updateDisplay('0');
  }

  /**
   * Removes the last character from the expression.
   */
  function backspace() {
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
  }

  /**
   * Appends a character (digit, operator, or decimal) to the expression.
   * @param {string} char The character to append.
   */
  function appendChar(char) {
    // Simple validation: prevent two consecutive operators (except minus for negative numbers).
    const operators = '+-*/';
    const lastChar = expression.slice(-1);
    if (operators.includes(char) && operators.includes(lastChar) && !(char === '-' && lastChar !== '-')) {
      // Replace the previous operator with the new one.
      expression = expression.slice(0, -1) + char;
    } else {
      expression += char;
    }
    updateDisplay(expression);
  }

  /**
   * Handles the evaluation request when the user presses '=' or Enter.
   */
  async function evaluate() {
    if (!expression) {
      return;
    }
    const { result, error } = await evaluateExpression(expression);
    if (error) {
      updateDisplay('Error');
      console.error('Evaluation error:', error);
    } else {
      updateDisplay(result);
      // After a successful evaluation, start a new expression with the result.
      expression = result;
    }
  }

  /**
   * Maps keyboard keys to calculator actions.
   * @param {KeyboardEvent} e The keyboard event.
   */
  function handleKeydown(e) {
    const key = e.key;
    if (key >= '0' && key <= '9') {
      e.preventDefault();
      appendChar(key);
    } else if (key === '.' || key === ',') {
      e.preventDefault();
      appendChar('.');
    } else if (['+', '-', '*', '/', 'x', 'X'].includes(key)) {
      e.preventDefault();
      const op = key === 'x' || key === 'X' ? '*' : key;
      appendChar(op);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      evaluate();
    } else if (key === 'Backspace') {
      e.preventDefault();
      backspace();
    } else if (key === 'Escape') {
      e.preventDefault();
      clearExpression();
    }
  }

  /**
   * Handles click events on keypad buttons.
   * @param {MouseEvent} e The click event.
   */
  function handleButtonClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    switch (action) {
      case 'digit':
        appendChar(value);
        break;
      case 'decimal':
        appendChar('.');
        break;
      case 'operator':
        appendChar(value);
        break;
      case 'clear':
        clearExpression();
        break;
      case 'backspace':
        backspace();
        break;
      case 'equals':
        evaluate();
        break;
      default:
        // No action needed.
        break;
    }
  }

  /**
   * Initializes event listeners and sets the default display.
   */
  function init() {
    clearExpression();
    // Click handling for all buttons via event delegation.
    keypadEl.addEventListener('click', handleButtonClick);
    // Keyboard handling for the whole document.
    document.addEventListener('keydown', handleKeydown);
  }

  // Public API (currently only init is needed externally).
  return {
    init
  };
})();

// Initialise the calculator once the DOM is fully loaded.
window.addEventListener('DOMContentLoaded', () => {
  Calculator.init();
});
