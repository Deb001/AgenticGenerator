/**
 * script.js
 *
 * Handles frontend logic, user interactions, updates the display, and
 * communicates with the backend API via AJAX for calculator operations.
 *
 * Issue Key: AI-1
 */

// --- DOM Element References ---
const displayElement = document.querySelector('.calculator-display');
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.querySelector('.equals');
const clearButton = document.querySelector('.clear');
const deleteButton = document.querySelector('.delete');
const decimalButton = document.querySelector('.decimal');

// --- Calculator State Variables ---
let currentInput = '0'; // The number currently being entered or the result
let previousInput = ''; // The first operand in an operation
let operator = null;    // The selected arithmetic operator (+, -, *, /)
let waitingForNewNumber = true; // True if the next digit should start a new number (after operator or equals)
let errorState = false; // True if an error occurred and is displayed

// --- Constants ---
const BACKEND_API_URL = '/calculate'; // Endpoint for arithmetic operations

/**
 * Updates the calculator display with the current input or an error message.
 * Limits display length to prevent overflow.
 * @param {string} value The string to display.
 */
function updateDisplay(value = currentInput) {
    const MAX_DISPLAY_LENGTH = 12; // Maximum characters to display
    if (errorState) {
        displayElement.textContent = value; // Display error message as is
    } else {
        // Format numbers for display (e.g., remove trailing .0, handle scientific notation for large numbers)
        let formattedValue = value;
        if (value.includes('.') && value.endsWith('0')) {
            formattedValue = value.replace(/\.0+$/, ''); // Remove trailing .0s
        }
        if (formattedValue.length > MAX_DISPLAY_LENGTH) {
            // Attempt to parse to number and format to scientific notation if too long
            const num = parseFloat(formattedValue);
            if (!isNaN(num) && isFinite(num)) {
                formattedValue = num.toPrecision(MAX_DISPLAY_LENGTH - 3); // -3 for 'e+X'
                if (formattedValue.length > MAX_DISPLAY_LENGTH) {
                    formattedValue = num.toExponential(MAX_DISPLAY_LENGTH - 5); // Even shorter for very large/small
                }
            } else {
                formattedValue = formattedValue.substring(0, MAX_DISPLAY_LENGTH); // Truncate if not a number
            }
        }
        displayElement.textContent = formattedValue;
    }
}

/**
 * Resets all calculator state variables to their initial values.
 * Clears the display and any error states.
 */
function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    waitingForNewNumber = true;
    errorState = false;
    updateDisplay();
}

/**
 * Deletes the last character from the current input.
 * If current input becomes empty, sets it to '0'.
 * Does nothing if in an error state.
 */
function deleteLastChar() {
    if (errorState) return; // Cannot delete from an error message
    if (currentInput === '0' && previousInput === '') return; // Don't delete initial '0'

    currentInput = currentInput.slice(0, -1);
    if (currentInput === '' || currentInput === '-') { // If only '-' remains or empty
        currentInput = '0';
        waitingForNewNumber = true; // Allow starting a new number
    }
    updateDisplay();
}

/**
 * Appends a digit or a decimal point to the current input.
 * Handles starting new numbers, preventing multiple decimal points, and leading zeros.
 * @param {string} number The digit or decimal point to append.
 */
function appendNumber(number) {
    if (errorState) {
        clearAll(); // Clear error state before starting new input
    }

    if (waitingForNewNumber) {
        // If starting a new number, replace '0' or previous result
        if (number === '.') {
            currentInput = '0.';
        } else {
            currentInput = number;
        }
        waitingForNewNumber = false;
    } else {
        // Prevent multiple decimal points
        if (number === '.' && currentInput.includes('.')) {
            return;
        }
        // Prevent multiple leading zeros unless it's '0.'
        if (currentInput === '0' && number !== '.') {
            currentInput = number; // Replace '0' with the new digit
        } else {
            currentInput += number;
        }
    }
    updateDisplay();
}

/**
 * Handles operator button clicks.
 * If a previous operation is pending, it performs the calculation first.
 * Stores the current input as the first operand and sets the new operator.
 * @param {string} nextOperator The operator symbol (+, -, *, /).
 */
function chooseOperator(nextOperator) {
    if (errorState) {
        // If an error occurred, allow starting a new calculation with the current error result
        // or clear if the error is not a number. For now, let's clear.
        clearAll();
    }

    if (previousInput && operator && currentInput !== '0' && !waitingForNewNumber) {
        // If there's a pending operation and a new number has been entered, calculate first
        performCalculation();
    } else if (currentInput === '0' && previousInput === '' && nextOperator === '-') {
        // Allow entering a negative number as the first input
        currentInput = '-';
        waitingForNewNumber = false;
        updateDisplay();
        return;
    }

    // If previousInput is empty, set currentInput as previousInput
    if (!previousInput || waitingForNewNumber) {
        previousInput = currentInput;
    }
    operator = nextOperator;
    waitingForNewNumber = true; // Next digit will start a new number
    updateDisplay(previousInput + ' ' + operator); // Show pending operation
}

/**
 * Performs the actual calculation by sending a request to the backend API.
 * Updates the display with the result or an error message.
 */
async function performCalculation() {
    if (!previousInput || !operator || waitingForNewNumber) {
        // Not enough operands or operator to perform a calculation
        return;
    }

    const num1 = parseFloat(previousInput);
    const num2 = parseFloat(currentInput);

    // Basic frontend validation for division by zero before sending to backend
    if (operator === '/' && num2 === 0) {
        currentInput = 'Error: Div by 0';
        errorState = true;
        updateDisplay();
        previousInput = '';
        operator = null;
        waitingForNewNumber = true;
        return;
    }

    // Construct the request payload
    const requestBody = {
        num1: num1,
        num2: num2,
        operation: operator
    };

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            // Handle HTTP errors (e.g., 400 Bad Request, 500 Internal Server Error)
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.result !== undefined && data.result !== null) {
            currentInput = String(data.result);
            errorState = false;
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Unknown API response format');
        }

    } catch (error) {
        console.error('Calculation error:', error);
        currentInput = `Error: ${error.message.substring(0, 15)}`; // Truncate long error messages
        errorState = true;
    } finally {
        previousInput = '';
        operator = null;
        waitingForNewNumber = true;
        updateDisplay();
    }
}

// --- Event Listeners Setup ---

// Number buttons (0-9) and decimal point
numberButtons.forEach(button => {
    button.addEventListener('click', () => appendNumber(button.textContent));
});
decimalButton.addEventListener('click', () => appendNumber(decimalButton.textContent));


// Operator buttons (+, -, *, /)
operatorButtons.forEach(button => {
    button.addEventListener('click', () => chooseOperator(button.textContent));
});

// Equals button
equalsButton.addEventListener('click', () => {
    if (errorState) {
        clearAll(); // Clear error before attempting new calculation
        return;
    }
    if (previousInput && operator && !waitingForNewNumber) {
        performCalculation();
    } else if (previousInput && !operator && !waitingForNewNumber) {
        // If a number is displayed and equals is pressed without an operator,
        // just display the current number as the result.
        updateDisplay(currentInput);
    }
});

// Clear (AC) button
clearButton.addEventListener('click', clearAll);

// Delete (DEL) button
deleteButton.addEventListener('click', deleteLastChar);

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        appendNumber(key);
    } else if (key === '.') {
        appendNumber(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        chooseOperator(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault(); // Prevent default form submission if any
        if (previousInput && operator && !waitingForNewNumber) {
            performCalculation();
        }
    } else if (key === 'Backspace') {
        deleteLastChar();
    } else if (key === 'Escape') { // 'Escape' for 'AC'
        clearAll();
    }
});


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    clearAll(); // Initialize the display when the DOM is fully loaded
});