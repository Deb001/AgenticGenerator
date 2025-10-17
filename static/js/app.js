'use strict';

// Update the result display area with a message
function displayResult(message) {
    const resultEl = document.getElementById('result');
    if (resultEl) {
        resultEl.textContent = message;
    }
}

// Handle form submission: validate, send request, and show response
function submitExpression(event) {
    event.preventDefault();

    const inputEl = document.getElementById('expression');
    if (!inputEl) {
        displayResult('Input element not found.');
        return;
    }

    const expression = inputEl.value.trim();
    if (!expression) {
        displayResult('Please enter an expression.');
        return;
    }

    fetch('/api/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expression })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayResult(`Result: ${data.result}`);
        } else {
            const errorMsg = data.error || 'Invalid expression.';
            displayResult(`Error: ${errorMsg}`);
        }
    })
    .catch(() => {
        displayResult('Failed to evaluate expression. Please try again later.');
    });
}

// Attach the submit handler once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calc-form');
    if (form) {
        form.addEventListener('submit', submitExpression);
    }
});