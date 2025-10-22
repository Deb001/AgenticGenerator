/* js/app.js - Calculator UI logic */
'use strict';

let currentExpression = '';

/**
 * Writes content to the #display element and ensures aria-live updates.
 * @param {string} content - Text to show in the display.
 */
function updateDisplay(content) {
    const display = document.getElementById('display');
    if (!display) return;
    display.textContent = content;
    display.setAttribute('aria-live', 'polite');
}

/**
 * Resets the calculator state and clears the display.
 */
function clearAll() {
    currentExpression = '';
    updateDisplay('0');
    const display = document.getElementById('display');
    if (display) display.classList.remove('error');
}

/**
 * Removes the last character from the current expression and updates the display.
 */
function backspace() {
    if (currentExpression.length === 0) return;
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay(currentExpression || '0');
}

/**
 * Calls the evaluator module, handles errors, and shows the result.
 */
function evaluateExpression() {
    const display = document.getElementById('display');
    try {
        const result = window.evaluator.evaluate(currentExpression);
        currentExpression = String(result);
        updateDisplay(currentExpression);
        if (display) display.classList.remove('error');
    } catch (err) {
        updateDisplay(err.message || 'Error');
        if (display) display.classList.add('error');
    }
}

/**
 * Handles clicks on calculator buttons.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
    const btn = event.currentTarget;
    const raw = btn.dataset.value;
    if (!raw) return;

    // Map visual symbols to evaluator-friendly tokens
    const map = { '×': '*', '÷': '/', '←': 'BACK', 'C': 'CLEAR', '=': 'EVAL' };
    const value = map[raw] !== undefined ? map[raw] : raw;

    switch (value) {
        case 'EVAL':
            evaluateExpression();
            break;
        case 'CLEAR':
            clearAll();
            break;
        case 'BACK':
            backspace();
            break;
        default:
            currentExpression += value;
            updateDisplay(currentExpression);
    }
}

/**
 * Handles keyboard input, mirroring button behaviour.
 * @param {KeyboardEvent} e
 */
function handleKeyPress(e) {
    const key = e.key;

    // Digits, decimal point, parentheses
    if (/^[0-9.]$/.test(key) || key === '(' || key === ')') {
        currentExpression += key;
        updateDisplay(currentExpression);
        e.preventDefault();
        return;
    }

    // Operators
    if (key === '+' || key === '-') {
        currentExpression += key;
        updateDisplay(currentExpression);
        e.preventDefault();
        return;
    }
    if (key === '*' || key.toLowerCase() === 'x') {
        currentExpression += '*';
        updateDisplay(currentExpression);
        e.preventDefault();
        return;
    }
    if (key === '/' || key === '÷') {
        currentExpression += '/';
        updateDisplay(currentExpression);
        e.preventDefault();
        return;
    }

    // Evaluation
    if (key === 'Enter' || key === '=') {
        evaluateExpression();
        e.preventDefault();
        return;
    }

    // Backspace / Clear
    if (key === 'Backspace') {
        if (e.ctrlKey) {
            clearAll();
        } else {
            backspace();
        }
        e.preventDefault();
        return;
    }

    // Clear via Escape or 'c'/'C'
    if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearAll();
        e.preventDefault();
    }
}

/**
 * Sets up event listeners and initial UI state.
 */
function initCalculator() {
    document.querySelectorAll('.calc-button')
        .forEach(btn => btn.addEventListener('click', handleButtonClick));

    document.addEventListener('keydown', handleKeyPress);
    updateDisplay('0');
}

// Initialise when the DOM is ready
document.addEventListener('DOMContentLoaded', initCalculator);