// script.js
// Calculator logic – production ready

'use strict';

/**
 * Retrieves numeric input from an element.
 * @param {string} id - The element's ID.
 * @returns {number|null} Parsed number or null if invalid.
 */
function getNumber(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const value = el.value.trim();
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}

/**
 * Displays a message in the result area.
 * @param {string} msg - Message to display.
 */
function showResult(msg) {
    const resultEl = document.getElementById('result');
    if (resultEl) {
        resultEl.textContent = msg;
    }
}

/**
 * Performs the selected arithmetic operation on the two inputs.
 * Called from the UI (e.g., button click).
 */
function calculateResult() {
    const a = getNumber('num1');
    const b = getNumber('num2');

    if (a === null || b === null) {
        alert('Please enter valid numbers in both fields.');
        return;
    }

    const opSelect = document.getElementById('operation');
    if (!opSelect) {
        alert('Operation selector not found.');
        return;
    }

    const operation = opSelect.value;
    let result;

    switch (operation) {
        case 'add':
            result = a + b;
            break;
        case 'subtract':
            result = a - b;
            break;
        case 'multiply':
            result = a * b;
            break;
        case 'divide':
            if (b === 0) {
                alert('Cannot divide by zero.');
                return;
            }
            result = a / b;
            break;
        default:
            alert('Unsupported operation selected.');
            return;
    }

    showResult(`Result: ${result}`);
}

/**
 * Clears all inputs and the result display.
 * Called from the UI (e.g., clear button).
 */
function resetCalculator() {
    const inputs = ['num1', 'num2'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const opSelect = document.getElementById('operation');
    if (opSelect) opSelect.selectedIndex = 0;

    showResult('');
}

// Expose functions for inline HTML event handlers
window.calculateResult = calculateResult;
window.resetCalculator = resetCalculator;