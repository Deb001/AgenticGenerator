/**
 * src/static/js/app.js
 *
 * Handles the calculator form submission, sends a request to the backend
 * `/api/calculate` endpoint and updates the UI with the result or an error.
 *
 * Responsibilities:
 *  - Prevent default form submission.
 *  - Validate input fields (non‑empty, numeric operands).
 *  - Build the JSON payload `{ operand1, operand2, operator }`.
 *  - Perform a POST request using the Fetch API.
 *  - Parse the JSON response and display the calculation result.
 *  - Gracefully handle network or server errors and show a user‑friendly message.
 *
 * This module is self‑contained and runs in the browser environment.
 * No external imports are required.
 */

(() => {
  'use strict';

  /** CSS selector constants */
  const SELECTORS = {
    form: '#calc-form',
    operand1: '#operand1',
    operand2: '#operand2',
    operator: '#operator',
    result: '#result',
    message: '#message' // generic container for success/error messages
  };

  /**
   * Utility: display a message in the UI.
   *
   * @param {string} text   Message text.
   * @param {string} type   Either 'error' or 'success'.
   */
  function showMessage(text, type = 'error') {
    const msgEl = document.querySelector(SELECTORS.message);
    if (!msgEl) return;

    msgEl.textContent = text;
    msgEl.className = type; // simple class switch; CSS can style .error/.success
    msgEl.style.display = 'block';
  }

  /**
   * Utility: clear any previously shown messages.
   */
  function clearMessage() {
    const msgEl = document.querySelector(SELECTORS.message);
    if (msgEl) {
      msgEl.textContent = '';
      msgEl.className = '';
      msgEl.style.display = 'none';
    }
  }

  /**
   * Validate form inputs.
   *
   * @returns {{valid: boolean, payload?: object, error?: string}}
   */
  function validateAndBuildPayload() {
    const op1El = document.querySelector(SELECTORS.operand1);
    const op2El = document.querySelector(SELECTORS.operand2);
    const operatorEl = document.querySelector(SELECTORS.operator);

    if (!op1El || !op2El || !operatorEl) {
      return { valid: false, error: 'Form elements missing in DOM.' };
    }

    const operand1 = op1El.value.trim();
    const operand2 = op2El.value.trim();
    const operator = operatorEl.value.trim();

    if (!operand1 || !operand2 || !operator) {
      return { valid: false, error: 'All fields are required.' };
    }

    // Ensure operands are valid numbers
    const num1 = Number(operand1);
    const num2 = Number(operand2);
    if (Number.isNaN(num1) || Number.isNaN(num2)) {
      return { valid: false, error: 'Operands must be numeric.' };
    }

    // Basic operator validation (allow +, -, *, /)
    const allowedOps = ['+', '-', '*', '/'];
    if (!allowedOps.includes(operator)) {
      return { valid: false, error: `Operator must be one of ${allowedOps.join(', ')}` };
    }

    return {
      valid: true,
      payload: {
        operand1: num1,
        operand2: num2,
        operator: operator
      }
    };
  }

  /**
   * Handles the form submission.
   *
   * @param {Event} event - The submit event.
   */
  async function handleSubmit(event) {
    event.preventDefault(); // Prevent native form submission
    clearMessage();

    const validation = validateAndBuildPayload();
    if (!validation.valid) {
      showMessage(validation.error, 'error');
      return;
    }

    const payload = validation.payload;

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Server responded with an error status
        const errorInfo = await response.json().catch(() => ({}));
        const serverMsg = errorInfo.message || 'Server returned an error.';
        throw new Error(serverMsg);
      }

      const data = await response.json();

      // Expected shape: { result: <number> }
      if (typeof data.result === 'undefined') {
        throw new Error('Malformed response from server.');
      }

      const resultEl = document.querySelector(SELECTORS.result);
      if (resultEl) {
        resultEl.textContent = `Result: ${data.result}`;
      }
      showMessage('Calculation successful.', 'success');
    } catch (err) {
      console.error('Calculation request failed:', err);
      showMessage(err.message || 'An unexpected error occurred.', 'error');
    }
  }

  /**
   * Initialise event listeners once the DOM is ready.
   */
  function init() {
    const form = document.querySelector(SELECTORS.form);
    if (!form) {
      console.error('Calculator form not found. Ensure the HTML contains an element matching', SELECTORS.form);
      return;
    }
    form.addEventListener('submit', handleSubmit);
  }

  // Wait for the DOM to be fully parsed before attaching listeners.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();