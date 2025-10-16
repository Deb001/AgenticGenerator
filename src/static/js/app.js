/**
 * @fileoverview Handles user interactions for the calculator UI,
 * sends calculation requests to the backend, and updates the DOM
 * with results or error messages.
 *
 * Expected HTML structure:
 * <form id="calc-form">
 *   <input id="operand1" name="operand1" type="text" />
 *   <input id="operand2" name="operand2" type="text" />
 *   <select id="operation" name="operation">
 *     <option value="add">+</option>
 *     <option value="subtract">-</option>
 *     <option value="multiply">*</option>
 *     <option value="divide">/</option>
 *   </select>
 *   <button type="submit">Calculate</button>
 * </form>
 * <div id="loading" hidden>Loading...</div>
 * <div id="result" role="status"></div>
 * <div id="error" role="alert"></div>
 */

'use strict';

/**
 * Displays a message in the given element.
 *
 * @param {HTMLElement} element - The element where the message will be shown.
 * @param {string} message - The message text.
 * @param {boolean} [isError=false] - Whether the message is an error.
 */
function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.hidden = false;
  element.style.color = isError ? '#d9534f' : '#5cb85c';
}

/**
 * Clears the content of the given element and hides it.
 *
 * @param {HTMLElement} element - The element to clear.
 */
function clearMessage(element) {
  element.textContent = '';
  element.hidden = true;
}

/**
 * Toggles the loading state UI.
 *
 * @param {boolean} isLoading - True to show loading, false to hide.
 * @param {HTMLFormElement} form - The calculator form to enable/disable.
 */
function setLoading(isLoading, form) {
  const loadingEl = document.getElementById('loading');
  if (isLoading) {
    loadingEl.hidden = false;
    form.querySelectorAll('input, select, button').forEach((el) => {
      el.disabled = true;
    });
  } else {
    loadingEl.hidden = true;
    form.querySelectorAll('input, select, button').forEach((el) => {
      el.disabled = false;
    });
  }
}

/**
 * Handles the calculator form submission.
 *
 * @param {Event} event - The submit event.
 * @returns {Promise<void>}
 */
async function handleCalculate(event) {
  event.preventDefault();

  const form = /** @type {HTMLFormElement} */ (event.target);
  const operand1El = /** @type {HTMLInputElement} */ (document.getElementById('operand1'));
  const operand2El = /** @type {HTMLInputElement} */ (document.getElementById('operand2'));
  const operationEl = /** @type {HTMLSelectElement} */ (document.getElementById('operation'));
  const resultEl = document.getElementById('result');
  const errorEl = document.getElementById('error');

  clearMessage(resultEl);
  clearMessage(errorEl);

  const rawOperand1 = operand1El.value.trim();
  const rawOperand2 = operand2El.value.trim();
  const operation = operationEl.value;

  const operand1 = parseFloat(rawOperand1);
  const operand2 = parseFloat(rawOperand2);

  // Client‑side validation
  if (!Number.isFinite(operand1) || !Number.isFinite(operand2)) {
    showMessage(errorEl, 'Both operands must be valid numbers.', true);
    return;
  }

  if (!operation) {
    showMessage(errorEl, 'Please select an operation.', true);
    return;
  }

  const payload = {
    operand1,
    operand2,
    operation,
  };

  setLoading(true, form);

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include CSRF token header if your backend requires it.
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const serverMessage = data.error || `Server responded with status ${response.status}`;
      throw new Error(serverMessage);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (typeof data.result === 'undefined') {
      throw new Error('Unexpected response format: missing result.');
    }

    showMessage(resultEl, `Result: ${data.result}`);
  } catch (err) {
    console.error('Calculation request failed:', err);
    const userMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    showMessage(errorEl, userMessage, true);
  } finally {
    setLoading(false, form);
  }
}

/**
 * Initializes event listeners once the DOM is fully loaded.
 */
function initCalculator() {
  const form = document.getElementById('calc-form');
  if (!form) {
    console.error('Calculator form element with id "calc-form" not found.');
    return;
  }
  form.addEventListener('submit', handleCalculate);
}

// Ensure initialization runs after the document is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculator);
} else {
  initCalculator();
}