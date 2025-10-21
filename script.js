// script.js – Calculator logic

// State variables
let currentInput = "";          // string representing the number being entered
let previousValue = null;       // numeric value stored before an operator
let pendingOperator = null;     // '+', '-', '*', '/' or null
let errorTimeoutId = null;      // timeout ID for clearing error display

/**
 * Initializes the calculator: attaches click listeners to buttons
 * and a keydown listener to the document.
 */
function initCalculator() {
    // Attach click listeners to all calculator buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', handleButtonClick);
    });

    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
}

/**
 * Handles button click events, routing the input to the appropriate handler.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
    const btn = event.currentTarget;
    const value = btn.dataset.value ?? btn.textContent.trim();

    if (!value) return;

    if (isDigit(value) || value === ".") {
        appendDigit(value);
    } else if (isOperator(value)) {
        processOperator(value);
    } else if (value === "=") {
        processEquals();
    } else if (value.toUpperCase() === "C") {
        resetCalculator();
    } else if (value.toUpperCase() === "CE") {
        clearEntry();
    }
}

/**
 * Handles keyboard input, mapping keys to calculator actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
    const { key } = event;

    if (isDigit(key) || key === ".") {
        event.preventDefault();
        appendDigit(key);
    } else if (isOperator(key)) {
        event.preventDefault();
        processOperator(key);
    } else if (key === "Enter") {
        event.preventDefault();
        processEquals();
    } else if (key === "Backspace") {
        event.preventDefault();
        clearEntry();
    } else if (key === "Escape") {
        event.preventDefault();
        resetCalculator();
    }
}

/**
 * Executes the arithmetic operation.
 * @param {string} operator One of '+', '-', '*', '/'
 * @param {number} operand1
 * @param {number} operand2
 * @returns {number|string} Result or error message.
 */
function performOperation(operator, operand1, operand2) {
    switch (operator) {
        case '+':
            return operand1 + operand2;
        case '-':
            return operand1 - operand2;
        case '*':
            return operand1 * operand2;
        case '/':
            if (operand2 === 0) return "Error: Division by zero";
            return operand1 / operand2;
        default:
            return "Error: Unknown operator";
    }
}

/**
 * Updates the calculator display.
 * @param {string|number} value
 */
function updateDisplay(value) {
    const display = document.getElementById('display');
    if (!display) return;

    // Format numbers: avoid scientific notation for typical values
    if (typeof value === "number" && isFinite(value)) {
        // Trim unnecessary trailing zeros
        const formatted = Number.isInteger(value) ? value.toString() : value.toString();
        display.textContent = formatted;
    } else {
        display.textContent = value;
    }
}

/**
 * Shows an error message, flashes the display, and resets after a timeout.
 * @param {string} message
 */
function showError(message) {
    const display = document.getElementById('display');
    if (!display) return;

    updateDisplay(message);
    display.classList.add('error');

    clearTimeout(errorTimeoutId);
    errorTimeoutId = setTimeout(() => {
        display.classList.remove('error');
        resetCalculator();
    }, 1500);
}

/* -------------------- Helper Functions -------------------- */

/**
 * Determines if a character is a digit (0‑9).
 * @param {string} ch
 * @returns {boolean}
 */
function isDigit(ch) {
    return /^[0-9]$/.test(ch);
}

/**
 * Determines if a character is a supported operator.
 * @param {string} ch
 * @returns {boolean}
 */
function isOperator(ch) {
    return /^[+\-*/]$/.test(ch);
}

/**
 * Appends a digit or decimal point to the current input.
 * @param {string} char
 */
function appendDigit(char) {
    // Prevent multiple leading zeros
    if (char === "0" && currentInput === "0") return;

    // Prevent multiple decimal points
    if (char === "." && currentInput.includes(".")) return;

    // If starting a new number after an operator, allow leading zero
    if (currentInput === "0" && char !== ".") {
        currentInput = char;
    } else {
        currentInput += char;
    }

    updateDisplay(currentInput);
}

/**
 * Processes an operator button/key.
 * @param {string} op
 */
function processOperator(op) {
    // If there is no current input but we already have a previous value,
    // allow changing the pending operator.
    if (currentInput === "" && previousValue !== null) {
        pendingOperator = op;
        return;
    }

    const inputNumber = parseFloat(currentInput);
    if (isNaN(inputNumber)) {
        // No valid number entered yet
        return;
    }

    if (previousValue === null) {
        previousValue = inputNumber;
    } else if (pendingOperator) {
        const result = performOperation(pendingOperator, previousValue, inputNumber);
        if (typeof result === "string") {
            showError(result);
            return;
        }
        previousValue = result;
        updateDisplay(previousValue);
    }

    pendingOperator = op;
    currentInput = "";
}

/**
 * Handles the equals operation.
 */
function processEquals() {
    if (pendingOperator === null || currentInput === "" || previousValue === null) {
        return;
    }

    const operand2 = parseFloat(currentInput);
    const result = performOperation(pendingOperator, previousValue, operand2);

    if (typeof result === "string") {
        showError(result);
        return;
    }

    updateDisplay(result);
    // Reset state for a new calculation
    previousValue = result;
    currentInput = "";
    pendingOperator = null;
}

/**
 * Clears the current entry (the number being typed).
 */
function clearEntry() {
    currentInput = "";
    updateDisplay("0");
}

/**
 * Resets the entire calculator state.
 */
function resetCalculator() {
    currentInput = "";
    previousValue = null;
    pendingOperator = null;
    updateDisplay("0");
}

/* -------------------- Initialization -------------------- */
document.addEventListener('DOMContentLoaded', initCalculator);