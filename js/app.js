import { evaluate } from './calculator.js';

let inputA, inputB, operatorSelect, calculateBtn, resultDiv;

/**
 * Initializes the calculator UI: caches DOM elements and registers event listeners.
 */
function init() {
    inputA = document.getElementById('input-a');
    inputB = document.getElementById('input-b');
    operatorSelect = document.getElementById('operator');
    calculateBtn = document.getElementById('calculate');
    resultDiv = document.getElementById('result');

    if (!inputA || !inputB || !operatorSelect || !calculateBtn || !resultDiv) {
        console.error('Calculator UI elements missing in DOM.');
        return;
    }

    // Ensure ARIA role for result
    resultDiv.setAttribute('role', 'alert');

    calculateBtn.addEventListener('click', handleCalculate);
    // Allow Enter key on any input to trigger calculation
    document.getElementById('calc-form').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCalculate(e);
        }
    });
}

/**
 * Handles the calculation request: validates inputs, calls evaluate, and displays result.
 * @param {Event} event
 */
function handleCalculate(event) {
    event.preventDefault();
    const aRaw = inputA.value.trim();
    const bRaw = inputB.value.trim();
    const operator = operatorSelect.value;

    const a = Number(aRaw);
    const b = Number(bRaw);

    try {
        if (!Number.isFinite(a)) {
            throw new TypeError('First input is not a valid number.');
        }
        if (!Number.isFinite(b)) {
            throw new TypeError('Second input is not a valid number.');
        }
        // Division by zero is already handled in evaluate, but we can pre‑check for clearer message
        if (operator === 'div' && b === 0) {
            throw new Error('Cannot divide by zero.');
        }

        const result = evaluate(a, b, operator);
        displayResult(`Result: ${result}`);
    } catch (err) {
        console.error(err);
        const userMessage = err instanceof TypeError || err instanceof Error
            ? err.message
            : 'An unexpected error occurred.';
        displayResult(userMessage, true);
    }
}

/**
 * Writes a message into the result container.
 * @param {string} message
 * @param {boolean} [isError=false]
 */
function displayResult(message, isError = false) {
    resultDiv.textContent = message;
    if (isError) {
        resultDiv.classList.add('error');
    } else {
        resultDiv.classList.remove('error');
    }
    // Ensure screen readers announce the change
    resultDiv.setAttribute('role', 'alert');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);