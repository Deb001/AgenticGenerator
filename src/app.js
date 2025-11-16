"use strict";

/**
 * Custom error thrown when input validation fails.
 * @extends Error
 */
class ValidationError extends Error {
    /**
     * @param {string} message Human‑readable error message.
     */
    constructor(message = "Invalid input") {
        super(message);
        this.name = "ValidationError";
    }
}

/**
 * Custom error thrown when a division by zero is attempted.
 * @extends Error
 */
class DivideByZeroError extends Error {
    /**
     * @param {string} message Human‑readable error message.
     */
    constructor(message = "Division by zero") {
        super(message);
        this.name = "DivideByZeroError";
    }
}

/**
 * Reads numeric values from the two input fields.
 * @returns {{a: number, b: number}} Parsed numbers.
 * @throws {ValidationError} If either input is not a valid number.
 */
function getInputValues() {
    const aRaw = document.getElementById("num1").value.trim();
    const bRaw = document.getElementById("num2").value.trim();
    const a = parseFloat(aRaw);
    const b = parseFloat(bRaw);
    if (aRaw === "" || bRaw === "" || Number.isNaN(a) || Number.isNaN(b)) {
        throw new ValidationError("Please enter valid numbers.");
    }
    return { a, b };
}

/**
 * Performs an arithmetic operation.
 * @param {number} a First operand.
 * @param {number} b Second operand.
 * @param {string} operator One of 'add', 'sub', 'mul', 'div'.
 * @returns {number} Result of the operation.
 * @throws {DivideByZeroError} When dividing by zero.
 */
function calculate(a, b, operator) {
    switch (operator) {
        case "add":
            return a + b;
        case "sub":
            return a - b;
        case "mul":
            return a * b;
        case "div":
            if (b === 0) {
                throw new DivideByZeroError("Cannot divide by zero.");
            }
            return a / b;
        default:
            // This should never happen because UI restricts operators.
            throw new Error(`Unsupported operator: ${operator}`);
    }
}

/**
 * Displays a numeric result in the result container.
 * @param {number} value Result to display.
 */
function displayResult(value) {
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = `Result: ${value}`;
    resultDiv.classList.remove("error");
}

/**
 * Shows an error message in the result container.
 * @param {string} message Message to display.
 */
function displayError(message) {
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = message;
    resultDiv.classList.add("error");
}

/**
 * Handles click events from operation buttons.
 * @param {Event} event Click event.
 */
function handleOperation(event) {
    const button = /** @type {HTMLButtonElement} */ (event.currentTarget);
    const operator = button.dataset.operator;
    try {
        const { a, b } = getInputValues();
        const result = calculate(a, b, operator);
        displayResult(result);
    } catch (err) {
        if (err instanceof ValidationError) {
            displayError(err.message);
        } else if (err instanceof DivideByZeroError) {
            displayError(err.message);
        } else {
            console.error(err);
            displayError("An unexpected error occurred.");
        }
    }
}

/**
 * Initializes the calculator: registers event listeners.
 */
function init() {
    const buttons = document.querySelectorAll("button.button[data-operator]");
    buttons.forEach((btn) => {
        btn.addEventListener("click", handleOperation);
    });
    // Clear any stale result on load.
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = "";
    resultDiv.classList.remove("error");
}

// Ensure init runs after the DOM is ready.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// Export symbols for potential downstream usage (e.g., testing frameworks).
window.Calculator = {
    ValidationError,
    DivideByZeroError,
    getInputValues,
    calculate,
    displayResult,
    displayError,
    handleOperation,
    init
};