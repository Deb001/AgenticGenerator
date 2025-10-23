/* script.js - Calculator core logic */
(() => {
  'use strict';

  /** Module-level state */
  let expressionString = '';
  /** @type {HTMLElement|null} */
  let displayElement = null;

  /** Allowed characters for building the expression */
  const VALID_CHAR_REGEX = /^[0-9.+\-*/()\s]$/;
  /** Sanitization regex for full expression before evaluation */
  const SANITIZE_REGEX = /^[0-9.+\-*/()\s]+$/;
  /** Division‑by‑zero detection regex */
  const DIV_ZERO_REGEX = /\/\s*0+(\.0+)?/;

  /** Initialize calculator once DOM is ready */
  function initCalculator() {
    displayElement = document.getElementById('display');
    if (!displayElement) {
      console.error('Calculator display element not found.');
      return;
    }

    const buttons = document.querySelectorAll('.calc-button');
    buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

    document.addEventListener('keydown', handleKeyPress);
    clearDisplay();
  }

  /** Click handler for calculator buttons */
  function handleButtonClick(event) {
    const target = /** @type {HTMLElement} */ (event.currentTarget);
    const value = target.dataset.value;
    if (typeof value === 'string') {
      processInput(value);
    }
  }

  /** Keyboard handler for allowed keys */
  function handleKeyPress(event) {
    const key = event.key;
    let mapped = null;

    if (key >= '0' && key <= '9') mapped = key;
    else if (key === '.' || key === '+' || key === '-' || key === '*' || key === '/' ||
             key === '(' || key === ')') mapped = key;
    else if (key === 'Enter') mapped = '=';
    else if (key === 'Escape') mapped = 'C';
    else return; // unsupported key

    event.preventDefault();
    processInput(mapped);
  }

  /** Routes raw input to appropriate action */
  function processInput(value) {
    switch (value) {
      case 'C':
        clearDisplay();
        break;
      case '=':
        evaluateExpression();
        break;
      default:
        appendToExpression(value);
        break;
    }
  }

  /** Append a validated character to the expression */
  function appendToExpression(char) {
    if (!VALID_CHAR_REGEX.test(char)) {
      // ignore invalid characters silently
      return;
    }
    expressionString += char;
    updateDisplay(expressionString);
  }

  /** Evaluate the current expression safely */
  function evaluateExpression() {
    const raw = expressionString.trim();

    if (!SANITIZE_REGEX.test(raw)) {
      showError('Error');
      return;
    }

    if (DIV_ZERO_REGEX.test(raw)) {
      showError('÷ by 0');
      return;
    }

    try {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict";return (' + raw + ')')();
      const formatted = Number.isFinite(result) ? String(result) : 'Error';
      if (formatted === 'Error') {
        showError('Error');
        return;
      }
      expressionString = formatted;
      updateDisplay(formatted);
    } catch (e) {
      showError('Error');
    }
  }

  /** Reset calculator state */
  function clearDisplay() {
    expressionString = '';
    updateDisplay('0');
  }

  /** Show an error message with temporary styling */
  function showError(message) {
    updateDisplay(message);
    if (displayElement) {
      displayElement.classList.add('error');
      setTimeout(() => {
        displayElement.classList.remove('error');
      }, 800);
    }
    // Reset expression to allow fresh start
    expressionString = '';
  }

  /** Update the calculator display */
  function updateDisplay(content) {
    if (displayElement) {
      displayElement.innerText = content;
    }
  }

  // Register init on DOM ready
  document.addEventListener('DOMContentLoaded', initCalculator);
})();