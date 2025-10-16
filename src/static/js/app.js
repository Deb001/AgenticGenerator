/**
 * Handles the submission of the calculator expression form.
 *
 * @param {Event} event - The submit event triggered by the form.
 * @returns {Promise<void>} Resolves when the UI has been updated with the result or an error.
 */
async function submitExpression(event) {
  event.preventDefault();

  // Clear previous messages
  clearMessages();

  const expressionInput = document.getElementById('expression');
  const resultContainer = document.getElementById('result');
  const errorContainer = document.getElementById('error');

  if (!expressionInput) {
    console.error('Expression input element with id "expression" not found.');
    return;
  }

  const userExpression = expressionInput.value.trim();

  if (!userExpression) {
    displayError('Please enter an expression to calculate.');
    return;
  }

  const payload = { expression: userExpression };

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      displayError('Unexpected server response. Please try again later.');
      return;
    }

    if (response.ok && data.hasOwnProperty('result')) {
      displayResult(data.result);
    } else if (data.error) {
      displayError(data.error);
    } else {
      displayError('An unknown error occurred.');
    }
  } catch (networkError) {
    console.error('Network error while contacting /api/calculate:', networkError);
    displayError('Unable to reach the server. Please check your connection.');
  }
}

/**
 * Displays the calculation result in the UI.
 *
 * @param {string|number} result - The result to display.
 */
function displayResult(result) {
  const resultContainer = document.getElementById('result');
  if (resultContainer) {
    resultContainer.textContent = `Result: ${result}`;
    resultContainer.style.display = 'block';
  }
}

/**
 * Displays an error message in the UI.
 *
 * @param {string} message - The error message to display.
 */
function displayError(message) {
  const errorContainer = document.getElementById('error');
  if (errorContainer) {
    errorContainer.textContent = `Error: ${message}`;
    errorContainer.style.display = 'block';
  }
}

/**
 * Clears any existing result or error messages from the UI.
 */
function clearMessages() {
  const resultContainer = document.getElementById('result');
  const errorContainer = document.getElementById('error');

  if (resultContainer) {
    resultContainer.textContent = '';
    resultContainer.style.display = 'none';
  }
  if (errorContainer) {
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
  }
}

/**
 * Initializes event listeners once the DOM is fully loaded.
 */
function initCalculator() {
  const form = document.getElementById('calc-form');
  if (!form) {
    console.error('Form element with id "calc-form" not found.');
    return;
  }
  form.addEventListener('submit', submitExpression);
}

// Ensure the script runs after the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculator);
} else {
  initCalculator();
}