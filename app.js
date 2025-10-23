// ---------- Calculator Core ----------
let displayElement = null;

/**
 * Removes any characters not in the whitelist.
 * Whitelist: digits, whitespace, parentheses, decimal point, +, -, *, /
 * @param {string} expr
 * @returns {string} sanitized expression (whitespace removed)
 * @throws {Error} if disallowed characters are present
 */
function sanitizeExpression(expr) {
    const whitelist = /^[0-9\s\+\-\*\/\.\(\)]+$/;
    if (!whitelist.test(expr)) {
        throw new Error('Invalid characters');
    }
    // Remove whitespace for evaluation convenience
    return expr.replace(/\s+/g, '');
}

/**
 * Safely evaluates a mathematical expression.
 * Detects division by zero and throws a specific error.
 * @param {string} expr
 * @returns {number}
 * @throws {Error} on invalid characters, division by zero, or evaluation failure
 */
function evaluateExpression(expr) {
    const sanitized = sanitizeExpression(expr);

    // Detect division by zero (e.g., /0, /0., /0 )
    if (/\/\s*0(?!\d)/.test(sanitized)) {
        throw new Error('Division by zero');
    }

    try {
        // Using Function constructor after strict sanitization
        const fn = new Function('return ' + sanitized);
        const result = fn();
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid expression');
        }
        return result;
    } catch (e) {
        throw new Error('Invalid expression');
    }
}

/**
 * Updates the calculator display.
 * @param {string} value
 */
function updateDisplay(value) {
    if (displayElement) {
        displayElement.value = value;
        displayElement.classList.remove('error');
    }
}

/**
 * Clears the display.
 */
function clearDisplay() {
    updateDisplay('');
}

/**
 * Deletes the last character from the display.
 */
function deleteLastChar() {
    if (!displayElement) return;
    if (displayElement.classList.contains('error')) {
        clearDisplay();
        return;
    }
    const current = displayElement.value;
    updateDisplay(current.slice(0, -1));
}

/**
 * Shows an error message in the display and adds visual cue.
 * @param {string} message
 */
function showError(message) {
    if (displayElement) {
        displayElement.value = message;
        displayElement.classList.add('error');
    }
}

/**
 * Handles evaluation flow, updating display or showing errors.
 */
function evaluateAndDisplay() {
    if (!displayElement) return;
    try {
        const expr = displayElement.value;
        const result = evaluateExpression(expr);
        updateDisplay(String(result));
    } catch (e) {
        showError(e.message);
    }
}

/**
 * Handles button click events.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
    const btn = event.currentTarget;
    if (!btn) return;

    // Special button IDs
    if (btn.id === 'clear') {
        clearDisplay();
        return;
    }
    if (btn.id === 'delete') {
        deleteLastChar();
        return;
    }
    if (btn.id === 'equals') {
        evaluateAndDisplay();
        return;
    }

    // Regular calculator button
    const key = btn.dataset.key;
    if (typeof key !== 'string') return;

    if (displayElement.classList.contains('error')) {
        clearDisplay();
    }
    updateDisplay(displayElement.value + key);
}

/**
 * Handles keyboard input, mapping keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
    const key = event.key;

    // Map special keys
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        evaluateAndDisplay();
        return;
    }
    if (key === 'Backspace') {
        event.preventDefault();
        deleteLastChar();
        return;
    }
    if (key === 'Escape') {
        event.preventDefault();
        clearDisplay();
        return;
    }

    // Allow digits, operators, parentheses, decimal point, and whitespace
    if (/^[0-9\+\-\*\/\(\)\.\s]$/.test(key)) {
        event.preventDefault();
        if (displayElement.classList.contains('error')) {
            clearDisplay();
        }
        updateDisplay(displayElement.value + key);
    }
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
    displayElement = document.getElementById('display');
    const buttons = document.querySelectorAll('.calc-button');

    buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));
    document.addEventListener('keydown', handleKeyPress);
});