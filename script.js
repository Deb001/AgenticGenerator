/**
 * @file script.js
 * @description Contains the core logic for calculator operations, user interaction, and display updates.
 * @issue AI-1
 */

/**
 * Represents a calculator that performs basic arithmetic operations.
 * Encapsulates the state and operations of the calculator.
 */
class Calculator {
    /**
     * Initializes a new Calculator instance.
     * @param {HTMLElement} previousOperandTextElement - The DOM element to display the previous operand and operation.
     * @param {HTMLElement} currentOperandTextElement - The DOM element to display the current operand or result.
     */
    constructor(previousOperandTextElement, currentOperandTextElement) {
        if (!(previousOperandTextElement instanceof HTMLElement) || !(currentOperandTextElement instanceof HTMLElement)) {
            console.error("Calculator constructor received invalid DOM elements.");
            throw new Error("Invalid DOM elements provided to Calculator constructor.");
        }
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear(); // Initialize calculator state
    }

    /**
     * Resets all operands and the current operation, effectively clearing the calculator.
     */
    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        console.log("Calculator cleared.");
    }

    /**
     * Removes the last digit from the current operand.
     */
    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        console.log("Last digit deleted from current operand.");
    }

    /**
     * Appends a digit or decimal point to the current operand.
     * Prevents multiple decimal points.
     * @param {string} number - The digit or decimal point to append.
     */
    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) {
            console.warn("Attempted to add multiple decimal points.");
            return; // Prevent multiple decimal points
        }
        this.currentOperand = this.currentOperand.toString() + number.toString();
        console.log(`Appended number: ${number}. Current operand: ${this.currentOperand}`);
    }

    /**
     * Stores the selected operation and moves the current operand to the previous operand.
     * If an operation is already pending and a current operand exists, it computes the result first.
     * @param {string} operation - The arithmetic operation (+, -, *, /) selected.
     */
    chooseOperation(operation) {
        if (this.currentOperand === '') {
            if (this.previousOperand !== '' && this.operation !== undefined) {
                // Allow changing operation if only previous operand and operation exist
                this.operation = operation;
                console.log(`Operation changed to: ${operation}`);
                return;
            }
            console.warn("No current operand to choose an operation for.");
            return; // Cannot choose operation without a current number
        }

        if (this.previousOperand !== '') {
            this.compute(); // Compute if there's a pending operation
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        console.log(`Operation chosen: ${operation}. Previous operand set to: ${this.previousOperand}`);
    }

    /**
     * Performs the calculation based on the stored operation and operands.
     * Handles division by zero and invalid number inputs.
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) {
            console.warn("Invalid operands for computation. Previous:", this.previousOperand, "Current:", this.currentOperand);
            return; // Cannot compute if operands are not valid numbers
        }

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    console.error("Error: Division by zero attempted.");
                    this.currentOperand = 'Error: Div by zero';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.updateDisplay();
                    // Optionally, clear the calculator completely after displaying error
                    // setTimeout(() => this.clear(), 2000); // Clear after 2 seconds
                    return;
                }
                computation = prev / current;
                break;
            default:
                console.warn("No valid operation selected for computation.");
                return;
        }

        // Handle potential floating point inaccuracies for display
        if (Number.isFinite(computation) && Math.abs(computation) > 1e-9) {
            // Limit decimal places for display if it's a long float
            computation = parseFloat(computation.toFixed(10));
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        console.log(`Computation performed. Result: ${this.currentOperand}`);
    }

    /**
     * Formats a number for display, adding commas for thousands and handling decimals.
     * @param {string | number} number - The number to format.
     * @returns {string} The formatted number string.
     */
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    /**
     * Renders the current and previous operands to the UI display elements.
     */
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
        console.log("Display updated. Current:", this.currentOperand, "Previous:", this.previousOperand, "Operation:", this.operation);
    }
}

// --- DOM Element Selection and Event Listeners ---

// Select all necessary DOM elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

// Validate that all required DOM elements are found
if (!previousOperandTextElement || !currentOperandTextElement) {
    console.error("Error: Calculator display elements not found in the DOM.");
    alert("Calculator display elements are missing. Please check index.html.");
}

// Instantiate the Calculator object
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Initialize display
calculator.updateDisplay();

/**
 * Attaches click event listeners to number buttons.
 */
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

/**
 * Attaches click event listeners to operation buttons.
 */
operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

/**
 * Attaches click event listener to the equals button.
 */
if (equalsButton) {
    equalsButton.addEventListener('click', button => {
        calculator.compute();
        calculator.updateDisplay();
    });
} else {
    console.error("Error: Equals button not found in the DOM.");
}

/**
 * Attaches click event listener to the all-clear button.
 */
if (allClearButton) {
    allClearButton.addEventListener('click', button => {
        calculator.clear();
        calculator.updateDisplay();
    });
} else {
    console.error("Error: All Clear button not found in the DOM.");
}

/**
 * Attaches click event listener to the delete button.
 */
if (deleteButton) {
    deleteButton.addEventListener('click', button => {
        calculator.delete();
        calculator.updateDisplay();
    });
} else {
    console.error("Error: Delete button not found in the DOM.");
}

// Optional: Add keyboard support for a better user experience
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
        calculator.compute();
        calculator.updateDisplay();
    } else if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    } else if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
});

console.log("script.js loaded and initialized.");