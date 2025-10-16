/**
 * app.js
 *
 * Handles the client‑side logic for the Primitive Calculator.
 * - Captures form submission
 * - Validates input values
 * - Sends a POST request to the Flask API (`/api/calculate`)
 * - Updates the UI with the calculation result or an error message
 *
 * This script is written in vanilla JavaScript and follows modern best practices
 * (ES6+, async/await, strict mode). It is deliberately self‑contained so it can
 * be included directly in `src/templates/index.html` via a <script> tag.
 */

'use strict';

/**
 * Utility: Retrieve an element by ID and assert its existence.
 * @param {string} id - The element's ID.
 * @returns {HTMLElement} The requested element.
 * @throws {Error} If the element cannot be found.
 */
function getElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element with id="${id}" not found in DOM.`);
  }
  return el;
}

/**
 * Show a loading spinner / message.
 */
function showLoading() {
  const loadingEl = getElement('loading');
  loadingEl.style.display = 'inline-block';
}

/**
 * Hide the loading spinner / message.
 */
function hideLoading() {
  const loadingEl = getElement('loading');
  loadingEl.style.display = 'none';
}

/**
 * Clear any previous result or error messages.
 */
function clearMessages() {
  getElement('result').textContent = '';
  getElement('error').textContent = '';
}

/**
 * Render the successful calculation result.
 * @param {number|string} value - The result returned by the API.
 */
function displayResult(value) {
  const resultEl = getElement('result');
  resultEl.textContent = `Result: ${value}`;
}

/**
 * Render an error message.
 * @param {string} message - Human‑readable error description.
 */
function displayError(message) {
  const errorEl = getElement('error');
  errorEl.textContent = `Error: ${message}`;
}

/**
 * Validate that a string represents a finite number.
 * @param {string} value - Raw input value.
 * @returns {number|null} Parsed number or null if invalid.
 */
function parseNumber(value) {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Form submit handler.
 * @param {Event} event - The submit event.
 */
async function handleSubmit(event) {
  event.preventDefault(); // Prevent default form navigation
  clearMessages();

  // Extract form fields
  const num1Input = getElement('num1');
  const num2Input = getElement('num2');
  const operationSelect = getElement('operation');

  const num1 = parseNumber(num1Input.value.trim());
  const num2 = parseNumber(num2Input.value.trim());
  const operation = operationSelect.value;

  // Client‑side validation
  if (num1 === null) {
    displayError('First number is not a valid numeric value.');
    return;
  }
  if (num2 === null) {
    displayError('Second number is not a valid numeric value.');
    return;
  }
  if (!operation) {
    displayError('Please select an operation.');
    return;
  }

  const payload = {
    num1,
    num2,
    operation,
  };

  showLoading();

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include CSRF token header if your Flask app uses one (optional)
      },
      body: JSON.stringify(payload),
    });

    // HTTP error handling
    if (!response.ok) {
      // Attempt to read a JSON error body; fallback to generic message
      let errorMsg = `Server responded with status ${response.status}`;
      try {
        const errData = await response.json();
        if (errData && errData.error) {
          errorMsg = errData.error;
        }
      } catch (_) {
        // ignore JSON parsing errors
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    // Expected shape: { result: <number> } or { error: <string> }
    if (data.error) {
      displayError(data.error);
    } else if (typeof data.result !== 'undefined') {
      displayResult(data.result);
    } else {
      displayError('Unexpected response format from server.');
    }
  } catch (err) {
    // Network errors, JSON parsing errors, or thrown above
    console.error('Calculation request failed:', err);
    displayError(err.message || 'An unexpected error occurred.');
  } finally {
    hideLoading();
  }
}

/**
 * Initialise event listeners once the DOM is ready.
 */
function init() {
  const form = getElement('calc-form');
  form.addEventListener('submit', handleSubmit);
}

// Ensure the script runs after the DOM is fully parsed.
document.addEventListener('DOMContentLoaded', init);