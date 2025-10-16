/**
 * app/static/js/app.js
 *
 * Client‑side logic for the calculator UI.
 * Handles button clicks, keyboard input, builds the arithmetic expression,
 * sends it to the Flask backend via AJAX and updates the display.
 *
 * Expected HTML structure (simplified):
 *   <div id="display"></div>
 *   <button class="calc-button" data-value="7">7</button>
 *   ...
 *   <button id="clear">C</button>
 *   <button id="equals">=</button>
 *
 * The backend should expose a POST endpoint at `/api/calculate`
 * that accepts JSON `{ "expression": "2+3*4" }` and returns
 * `{ "result": 14 }` or `{ "error": "message" }`.
 */

(() => {
    'use strict';

    /** DOM element references */
    const displayEl = document.getElementById('display');
    const buttons = document.querySelectorAll('.calc-button');
    const clearBtn = document.getElementById('clear');
    const equalsBtn = document.getElementById('equals');

    /** Current expression typed by the user */
    let expression = '';

    /**
     * Update the calculator display.
     * @param {string} text - Text to show.
     */
    function updateDisplay(text) {
        displayEl.textContent = text;
    }

    /**
     * Append a character (digit/operator) to the current expression.
     * @param {string} char
     */
    function appendToExpression(char) {
        // Basic validation: prevent two consecutive operators (except minus for negative numbers)
        const operators = '+-*/';
        const lastChar = expression.slice(-1);
        if (operators.includes(char) && operators.includes(lastChar) && !(char === '-' && lastChar !== '-')) {
            // Replace the last operator with the new one
            expression = expression.slice(0, -1) + char;
        } else {
            expression += char;
        }
        updateDisplay(expression);
    }

    /**
     * Clear the current expression and reset the display.
     */
    function clearExpression() {
        expression = '';
        updateDisplay('0');
    }

    /**
     * Send the current expression to the server for evaluation.
     */
    async function evaluateExpression() {
        if (!expression) {
            return;
        }

        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // CSRF token header can be added here if needed
                },
                body: JSON.stringify({ expression })
            });

            if (!response.ok) {
                // Server returned an HTTP error status
                const errorText = await response.text();
                throw new Error(`Server error ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (data.error) {
                // Backend reported a calculation error (e.g., division by zero)
                updateDisplay(`Error: ${data.error}`);
                console.error('Calculation error:', data.error);
            } else if (typeof data.result !== 'undefined') {
                // Successful calculation
                expression = String(data.result);
                updateDisplay(expression);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (err) {
            // Network or parsing error
            updateDisplay('Error');
            console.error('Failed to evaluate expression:', err);
        }
    }

    /**
     * Handle button click events.
     * @param {Event} e
     */
    function onButtonClick(e) {
        const btn = e.currentTarget;
        const value = btn.dataset.value;
        if (value) {
            appendToExpression(value);
        }
    }

    /**
     * Map keyboard keys to calculator actions.
     * @param {KeyboardEvent} e
     */
    function onKeyDown(e) {
        const key = e.key;

        // Allow digits and decimal point
        if (/[0-9.]/.test(key)) {
            appendToExpression(key);
            e.preventDefault();
            return;
        }

        // Operators
        if (/[+\-*/]/.test(key)) {
            appendToExpression(key);
            e.preventDefault();
            return;
        }

        // Enter or = for evaluation
        if (key === 'Enter' || key === '=') {
            evaluateExpression();
            e.preventDefault();
            return;
        }

        // Escape or C for clear
        if (key === 'Escape' || key.toLowerCase() === 'c') {
            clearExpression();
            e.preventDefault();
            return;
        }
    }

    /** Attach event listeners after DOM is ready */
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize display
        updateDisplay('0');

        // Button listeners
        buttons.forEach(btn => btn.addEventListener('click', onButtonClick));

        if (clearBtn) {
            clearBtn.addEventListener('click', clearExpression);
        }

        if (equalsBtn) {
            equalsBtn.addEventListener('click', evaluateExpression);
        }

        // Keyboard support
        document.addEventListener('keydown', onKeyDown);
    });
})();