// src/static/js/app.js

/**
 * Displays the calculation result in the UI.
 * @param {string|number} result - The result to display.
 */
function displayResult(result) {
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');

    if (resultDiv) {
        resultDiv.textContent = `Result: ${result}`;
    }

    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

/**
 * Shows an error message in the UI.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');

    if (errorDiv) {
        errorDiv.textContent = `Error: ${message}`;
    }

    if (resultDiv) {
        resultDiv.textContent = '';
    }
}

/**
 * Handles form submission, sends calculation request to the backend,
 * and updates the UI based on the response.
 * @param {Event} event - The submit event.
 */
async function submitCalculation(event) {
    event.preventDefault();

    const operand1Input = document.getElementById('operand1');
    const operand2Input = document.getElementById('operand2');
    const operatorSelect = document.getElementById('operator');

    if (!operand1Input || !operand2Input || !operatorSelect) {
        displayError('Missing input fields.');
        return;
    }

    const operand1 = parseFloat(operand1Input.value);
    const operand2 = parseFloat(operand2Input.value);
    const operator = operatorSelect.value;

    if (isNaN(operand1) || isNaN(operand2)) {
        displayError('Please enter valid numbers.');
        return;
    }

    const payload = {
        operand1,
        operand2,
        operator
    };

    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Attempt to read error details from the response body
            let errorMsg = `Server responded with status ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMsg = errorData.error;
                }
            } catch (_) {
                // ignore JSON parse errors
            }
            displayError(errorMsg);
            return;
        }

        const data = await response.json();

        if (data && typeof data.result !== 'undefined') {
            displayResult(data.result);
        } else if (data && data.error) {
            displayError(data.error);
        } else {
            displayError('Unexpected response format.');
        }
    } catch (err) {
        console.error('Network or parsing error:', err);
        displayError('Unable to reach the server. Please try again later.');
    }
}

// Attach the submit handler once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calc-form');
    if (form) {
        form.addEventListener('submit', submitCalculation);
    } else {
        console.warn('Calculation form not found. Ensure an element with id="calc-form" exists.');
    }
});