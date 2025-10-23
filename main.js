// main.js - Calculator logic

(() => {
    'use strict';

    /** @type {HTMLInputElement} */
    let displayElement;
    /** @type {NodeListOf<HTMLButtonElement>} */
    let buttonElements;

    const MAX_DISPLAY_LENGTH = 30;

    /** Initialize the calculator once DOM is ready */
    function init() {
        displayElement = /** @type {HTMLInputElement} */ (document.getElementById('display'));
        buttonElements = /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('button[data-value]'));

        buttonElements.forEach(btn => btn.addEventListener('click', handleButtonClick));
        document.addEventListener('keydown', handleKeyboard);
    }

    /** Click handler for calculator buttons */
    function handleButtonClick(event) {
        const btn = /** @type {HTMLButtonElement} */ (event.currentTarget);
        const value = btn.dataset.value;

        if (value === 'C') {
            clearDisplay();
        } else if (value === '=') {
            evaluateExpression();
        } else {
            appendToDisplay(value);
        }
    }

    /** Append a character/value to the display, respecting length limit */
    function appendToDisplay(value) {
        if (displayElement.value.length + value.length > MAX_DISPLAY_LENGTH) return;
        displayElement.value += value;
    }

    /** Reset the display to an empty string */
    function clearDisplay() {
        displayElement.value = '';
    }

    /** Evaluate the arithmetic expression shown in the display */
    function evaluateExpression() {
        const expr = displayElement.value.trim();

        if (!isValidExpression(expr)) {
            showError();
            return;
        }

        try {
            const result = safeEval(expr);
            if (typeof result === 'number' && isFinite(result)) {
                displayElement.value = String(result);
            } else {
                showError();
            }
        } catch (_) {
            showError();
        }
    }

    /** Validate that the expression contains only allowed characters and balanced parentheses */
    function isValidExpression(expr) {
        const allowedPattern = /^[0-9+\-*/().\s]+$/;
        if (!allowedPattern.test(expr)) return false;

        let balance = 0;
        for (const ch of expr) {
            if (ch === '(') balance++;
            else if (ch === ')') {
                balance--;
                if (balance < 0) return false;
            }
        }
        return balance === 0;
    }

    /** Safely evaluate a validated arithmetic expression */
    function safeEval(expr) {
        // The expression has already passed validation
        // Using Function constructor to avoid eval's scope leakage
        return (new Function('return ' + expr))();
    }

    /** Show an error message on the display */
    function showError(message = 'Error') {
        displayElement.value = message;
    }

    /** Keyboard event handler mapping keys to calculator actions */
    function handleKeyboard(event) {
        const key = event.key;

        // Digits, decimal point, parentheses, and operators
        if (/^[0-9]$/.test(key) || ['.', '+', '-', '*', '/', '(', ')'].includes(key)) {
            appendToDisplay(key);
            event.preventDefault();
            return;
        }

        // Enter or '=' triggers evaluation
        if (key === 'Enter' || key === '=') {
            evaluateExpression();
            event.preventDefault();
            return;
        }

        // Escape or 'c'/'C' clears the display
        if (key === 'Escape' || key.toLowerCase() === 'c') {
            clearDisplay();
            event.preventDefault();
            return;
        }

        // Backspace deletes the last character
        if (key === 'Backspace') {
            displayElement.value = displayElement.value.slice(0, -1);
            event.preventDefault();
            return;
        }

        // Ignore all other keys
    }

    // Attach init to DOMContentLoaded
    document.addEventListener('DOMContentLoaded', init);
})();