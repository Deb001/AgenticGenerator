'use strict';

// Cache DOM elements
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

// Internal state
let expression = '';
let errorState = false;

// Utility helpers
const isOperator = ch => '+-*/'.includes(ch);
const isDigit = ch => /\d/.test(ch);

// Update the calculator display
function updateDisplay(value) {
    display.value = value;
}

// Enable or disable all buttons except Clear when in error state
function setErrorState(flag) {
    errorState = flag;
    buttons.forEach(btn => {
        if (flag && btn.dataset.action !== 'clear') {
            btn.classList.add('disabled');
            btn.disabled = true;
        } else {
            btn.classList.remove('disabled');
            btn.disabled = false;
        }
    });
}

// Clear the display and reset internal state
function clearDisplay() {
    expression = '';
    updateDisplay('');
    setErrorState(false);
}

// Remove the last character from the expression
function backspace() {
    if (errorState) return;
    expression = expression.slice(0, -1);
    updateDisplay(expression);
}

// Validate character before appending to the expression
function validateAppend(char) {
    const last = expression.slice(-1);

    // Decimal point
    if (char === '.') {
        // Disallow multiple decimals in the current number segment
        const rev = expression.split('').reverse();
        for (let i = 0; i < rev.length; i++) {
            const c = rev[i];
            if (isOperator(c) || c === '(') break;
            if (c === '.') return false;
        }
        return true;
    }

    // Digits are always allowed
    if (isDigit(char)) return true;

    // Operators
    if (isOperator(char)) {
        // Expression may start with '-' (unary minus) only
        if (expression === '' && char !== '-') return false;
        // Prevent two operators in a row
        if (isOperator(last)) return false;
        return true;
    }

    // Opening parenthesis
    if (char === '(') {
        // Disallow '(' directly after a digit or ')'
        if (isDigit(last) || last === ')') return false;
        return true;
    }

    // Closing parenthesis
    if (char === ')') {
        const openCount = (expression.match(/\(/g) || []).length;
        const closeCount = (expression.match(/\)/g) || []).length;
        // Must have a matching '('
        if (openCount <= closeCount) return false;
        // Disallow ')' after an operator or another '('
        if (isOperator(last) || last === '(') return false;
        return true;
    }

    // Anything else is rejected
    return false;
}

// Append a validated character to the expression
function appendCharacter(char) {
    if (errorState) return;
    if (!validateAppend(char)) return;
    expression += char;
    updateDisplay(expression);
}

// Evaluate the current expression safely
function evaluateExpression() {
    if (errorState) return;

    // Replace Unicode multiplication/division symbols
    let sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');

    // Whitelist validation
    const whitelist = /^[0-9+\-*/().\s]+$/;
    if (!whitelist.test(sanitized)) {
        updateDisplay('Error');
        setErrorState(true);
        return;
    }

    // Attempt evaluation
    let result;
    try {
        // Using Function constructor for isolated evaluation
        result = new Function('return ' + sanitized)();
    } catch (e) {
        updateDisplay('Error');
        setErrorState(true);
        return;
    }

    // Handle non-finite results
    if (typeof result !== 'number' || !isFinite(result) || isNaN(result)) {
        updateDisplay('Error');
        setErrorState(true);
        return;
    }

    // Display result and allow chaining
    expression = result.toString();
    updateDisplay(expression);
    setErrorState(false);
}

// Click handler for calculator buttons
function handleButtonClick(event) {
    const btn = event.currentTarget;
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
        case 'digit':
        case 'operator':
        case 'decimal':
        case 'parenthesis':
            appendCharacter(value);
            break;
        case 'clear':
            clearDisplay();
            break;
        case 'backspace':
            backspace();
            break;
        case 'evaluate':
            evaluateExpression();
            break;
        default:
            break;
    }
}

// Keyboard handler for calculator shortcuts
function handleKeyPress(event) {
    const key = event.key;

    // Map common keys to actions
    if (key >= '0' && key <= '9') {
        appendCharacter(key);
        return;
    }

    if (key === '.' ) {
        appendCharacter('.');
        return;
    }

    if (key === '+' || key === '-' || key === '*' || key === '/' ) {
        appendCharacter(key);
        return;
    }

    if (key === '(' || key === ')') {
        appendCharacter(key);
        return;
    }

    if (key === 'Enter') {
        event.preventDefault();
        evaluateExpression();
        return;
    }

    if (key === 'Backspace') {
        event.preventDefault();
        backspace();
        return;
    }

    if (key === 'Escape') {
        clearDisplay();
        return;
    }
}

// Attach event listeners
buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));
document.addEventListener('keydown', handleKeyPress);