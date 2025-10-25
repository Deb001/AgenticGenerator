// main.js - Calculator logic

let expression = ""; // holds the raw user input string
let displayElement = null;

/**
 * Initializes the calculator after DOM is ready.
 * Caches DOM references, attaches click listeners, and sets initial display.
 */
function initCalculator() {
    displayElement = document.getElementById('display');
    if (!displayElement) {
        console.error('Display element not found');
        return;
    }

    const buttons = document.querySelectorAll('button.calc-btn');
    buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

    updateDisplay('0');
}

/**
 * Handles click events from calculator buttons.
 * Routes the action based on the button's data-value attribute.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
    const btn = event.currentTarget;
    const value = btn.dataset.value;

    switch (value) {
        case 'C':
            clearExpression();
            break;
        case '←':
            backspaceExpression();
            break;
        case '=':
            evaluateExpression();
            break;
        default:
            appendToExpression(value);
            break;
    }
}

/**
 * Appends a character to the current expression after validation.
 * Prevents invalid consecutive operators and leading operators.
 * @param {string} char
 */
function appendToExpression(char) {
    const operators = '+-*/';
    const isOperator = operators.includes(char);

    if (expression.length === 0 && isOperator) {
        // ignore leading operator
        return;
    }

    const lastChar = expression.slice(-1);
    const lastIsOperator = operators.includes(lastChar);

    if (lastIsOperator && isOperator) {
        // replace the last operator with the new one
        expression = expression.slice(0, -1) + char;
    } else {
        expression += char;
    }

    updateDisplay(expression);
}

/**
 * Clears the current expression and resets the display.
 */
function clearExpression() {
    expression = "";
    updateDisplay('0');
}

/**
 * Removes the last character from the expression and updates the display.
 */
function backspaceExpression() {
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
}

/**
 * Evaluates the current expression safely.
 * Handles sanitization, division‑by‑zero detection, and runtime errors.
 */
function evaluateExpression() {
    const sanitized = sanitizeExpression(expression);

    // Detect direct division by zero (e.g., /0, /0+)
    if (/\/0(?![\.0-9])/.test(sanitized)) {
        updateDisplay('Error: Division by zero');
        return;
    }

    try {
        // Use Function constructor with strict mode to evaluate
        const result = Function('"use strict";return (' + sanitized + ')')();

        if (typeof result === 'number' && isFinite(result)) {
            expression = result.toString();
            updateDisplay(expression);
        } else {
            updateDisplay('Error');
        }
    } catch (e) {
        updateDisplay('Error');
    }
}

/**
 * Sanitizes the expression:
 * - Replaces visual operators (×, ÷) with JavaScript equivalents.
 * - Removes any characters outside the whitelist.
 * - Collapses consecutive operators into the last one.
 * @param {string} expr
 * @returns {string}
 */
function sanitizeExpression(expr) {
    // Replace visual multiplication/division symbols
    let sanitized = expr.replace(/[×÷]/g, m => (m === '×' ? '*' : '/'));

    // Keep only allowed characters
    sanitized = sanitized.replace(/[^0-9.+\-*/()]/g, '');

    // Collapse multiple consecutive operators into the last one
    sanitized = sanitized.replace(/([+\-*/]){2,}/g, match => match[match.length - 1]);

    return sanitized;
}

/**
 * Updates the calculator display.
 * @param {string} value
 */
function updateDisplay(value) {
    if (displayElement) {
        displayElement.value = value;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCalculator);