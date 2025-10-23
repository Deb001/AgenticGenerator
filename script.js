'use strict';

// Removes whitespace and validates allowed characters.
// Throws Error('Invalid characters detected') if any disallowed character is found.
function sanitizeExpression(expr) {
    const sanitized = expr.replace(/\s+/g, '');
    if (!/^[0-9.+\-*/%()]+$/.test(sanitized)) {
        throw new Error('Invalid characters detected');
    }
    return sanitized;
}

// Evaluates a sanitized expression safely.
// Throws Error('Malformed expression') for runtime or syntax errors.
function evaluateExpression(expr) {
    const safeExpr = sanitizeExpression(expr);
    try {
        // Using Function constructor for evaluation after strict validation.
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + safeExpr)();
        if (typeof result !== 'number' || Number.isNaN(result)) {
            throw new Error();
        }
        return result;
    } catch (_) {
        throw new Error('Malformed expression');
    }
}

// Appends a value to the expression display.
function updateExpressionDisplay(value) {
    const display = document.getElementById('expressionDisplay');
    if (display) {
        display.textContent += value;
    }
}

// Shows a result or error message.
function showResult(value) {
    const resultEl = document.getElementById('resultDisplay');
    if (resultEl) {
        resultEl.textContent = value;
    }
}

// Clears both displays.
function clearAll() {
    const expr = document.getElementById('expressionDisplay');
    const res = document.getElementById('resultDisplay');
    if (expr) expr.textContent = '';
    if (res) res.textContent = '';
}

// Handles button clicks based on data attributes.
function handleButtonClick(event) {
    const button = event.target.closest('.calc-button');
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === 'clear') {
        clearAll();
    } else if (action === 'equals') {
        const expr = document.getElementById('expressionDisplay').textContent;
        try {
            const result = evaluateExpression(expr);
            showResult(String(result));
        } catch (err) {
            showResult('Error: ' + err.message);
        }
    } else if (value !== undefined) {
        updateExpressionDisplay(value);
    }
}

// Handles keyboard input, mapping keys to calculator actions.
function handleKeyPress(event) {
    const key = event.key;

    // Map Backspace to clear, Enter to evaluate.
    if (key === 'Backspace') {
        clearAll();
        event.preventDefault();
        return;
    }
    if (key === 'Enter') {
        const expr = document.getElementById('expressionDisplay').textContent;
        try {
            const result = evaluateExpression(expr);
            showResult(String(result));
        } catch (err) {
            showResult('Error: ' + err.message);
        }
        event.preventDefault();
        return;
    }

    // Allowed characters for direct insertion.
    const allowed = '0123456789.+-*/%()';
    if (allowed.includes(key)) {
        updateExpressionDisplay(key);
        event.preventDefault();
    }
}

// Initializes event listeners and clears displays on load.
function init() {
    document.querySelectorAll('.calc-button').forEach(btn => {
        btn.addEventListener('click', handleButtonClick);
    });
    document.addEventListener('keydown', handleKeyPress);
    clearAll();
}

// Execute init when DOM is ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}