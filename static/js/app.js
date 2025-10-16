/**
 * @fileoverview Handles user interactions for the calculator UI.
 * Sends the arithmetic expression to the backend API and updates the DOM
 * with the computed result or displays error messages.
 */

/* eslint-disable no-console */

/**
 * Sends the arithmetic expression to the server and returns the parsed JSON response.
 *
 * @param {string} expression - The arithmetic expression entered by the user.
 * @returns {Promise<Object>} Resolves with the JSON payload from the server.
 * @throws {Error} If the network request fails or the server returns a non‑OK status.
 */
async function postExpression(expression) {
  console.debug('Posting expression to /api/calculate:', expression);
  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expression }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload.error || `Server responded with status ${response.status}`;
    console.error('API error:', message);
    throw new Error(message);
  }

  const data = await response.json();
  console.debug('Received response:', data);
  return data;
}

/**
 * Updates the result element in the DOM with the provided value.
 *
 * @param {string|number} value - The calculation result to display.
 */
function displayResult(value) {
  const resultEl = document.getElementById('result');
  if (resultEl) {
    resultEl.textContent = value;
  } else {
    console.warn('Result element with id "result" not found.');
  }
}

/**
 * Shows an error message to the user via an alert dialog.
 *
 * @param {string} message - The error message to display.
 */
function showError(message) {
  alert(message);
}

/**
 * Handles the form submission event: validates input, calls the API,
 * and updates the UI based on the response.
 *
 * @param {Event} event - The submit event object.
 */
async function handleSubmit(event) {
  event.preventDefault();

  const expressionInput = document.getElementById('expression');
  if (!expressionInput) {
    console.error('Expression input element with id "expression" not found.');
    showError('Unexpected error: input field missing.');
    return;
  }

  const rawExpression = expressionInput.value.trim();
  if (!rawExpression) {
    showError('Please enter an expression to calculate.');
    return;
  }

  try {
    const { result } = await postExpression(rawExpression);
    displayResult(result);
  } catch (err) {
    console.error('Submission failed:', err);
    showError(err.message || 'An unexpected error occurred while calculating.');
  }
}

/**
 * Initializes event listeners once the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  console.info('DOM fully loaded – initializing calculator form handler.');
  const form = document.getElementById('calc-form');
  if (!form) {
    console.error('Form element with id "calc-form" not found.');
    return;
  }
  form.addEventListener('submit', handleSubmit);
});