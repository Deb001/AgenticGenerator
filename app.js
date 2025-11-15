// app.js – ES module implementing a simple calculator UI

/**
 * Custom error thrown when user input violates calculator rules.
 */
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Custom error thrown when evaluation of the expression fails.
 */
export class EvaluationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EvaluationError';
    }
}

/**
 * Calculator encapsulates arithmetic logic, sanitization and safe evaluation.
 */
export class Calculator {
    /**
     * Initializes an empty expression.
     */
    constructor() {
        /** @type {string} */
        this.expression = '';
    }

    /**
     * Returns the current expression.
     * @returns {string}
     */
    getExpression() {
        return this.expression;
    }

    /**
     * Clears the expression.
     */
    clear() {
        this.expression = '';
    }

    /**
     * Deletes the last character from the expression.
     */
    deleteLast() {
        this.expression = this.expression.slice(0, -1);
    }

    /**
     * Validates and appends a digit or operator.
     * @param {string} value
     * @throws {ValidationError}
     */
    append(value) {
        const allowed = /^[0-9+\-*/().]$/;
        if (!allowed.test(value)) {
            throw new ValidationError('Invalid character');
        }
        // Prevent two consecutive operators (except minus for negative numbers)
        const operators = '+-*/';
        const lastChar = this.expression.slice(-1);
        if (operators.includes(value) && operators.includes(lastChar) && !(value === '-' && lastChar !== '-')) {
            throw new ValidationError('Consecutive operators are not allowed');
        }
        this.expression += value;
    }

    /**
     * Safely evaluates the arithmetic expression.
     * @returns {string}
     * @throws {EvaluationError}
     */
    evaluate() {
        if (this.expression.trim() === '') {
            throw new EvaluationError('Expression is empty');
        }
        // Whitelist allowed characters only
        const whitelist = /^[0-9+\-*/().\s]+$/;
        if (!whitelist.test(this.expression)) {
            throw new EvaluationError('Expression contains illegal characters');
        }
        try {
            // Use Function constructor for evaluation in a safe sandboxed way
            // eslint-disable-next-line no-new-func
            const result = Function(`'use strict'; return (${this.expression})`)();
            if (typeof result !== 'number' || !isFinite(result)) {
                throw new EvaluationError('Result is not a finite number');
            }
            this.expression = String(result);
            return this.expression;
        } catch (e) {
            throw new EvaluationError('Failed to evaluate expression');
        }
    }
}

/**
 * Configuration for calculator buttons.
 * @type {Array<{label:string, type:'digit'|'operator'|'control'}>}
 */
const ButtonConfig = [
    { label: 'C', type: 'control' },
    { label: '←', type: 'control' },
    { label: '(', type: 'operator' },
    { label: ')', type: 'operator' },
    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '/', type: 'operator' },
    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '*', type: 'operator' },
    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '-', type: 'operator' },
    { label: '0', type: 'digit' },
    { label: '.', type: 'digit' },
    { label: '=', type: 'control' },
    { label: '+', type: 'operator' }
];

/**
 * Initializes the calculator UI inside #calculator-root.
 */
function initUI() {
    const root = document.getElementById('calculator-root');
    if (!root) {
        console.error('Root element #calculator-root not found');
        return;
    }

    const calculator = new Calculator();

    // Create display element
    const display = document.createElement('div');
    display.className = 'display';
    display.textContent = '0';
    root.appendChild(display);

    // Create button grid container
    const grid = document.createElement('div');
    grid.className = 'button-grid';
    root.appendChild(grid);

    // Helper to create a button element
    const createButton = (config) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `button ${config.type}`;
        btn.dataset.type = config.type;
        btn.dataset.value = config.label;
        btn.textContent = config.label;
        btn.addEventListener('click', (e) => handleButtonClick(e, calculator, display));
        return btn;
    };

    // Populate grid
    ButtonConfig.forEach(cfg => {
        const btn = createButton(cfg);
        grid.appendChild(btn);
    });
}

/**
 * Handles a button click, delegating to the Calculator instance.
 * @param {MouseEvent} event
 * @param {Calculator} calculator
 * @param {HTMLElement} display
 */
function handleButtonClick(event, calculator, display) {
    const target = /** @type {HTMLButtonElement} */ (event.currentTarget);
    const type = target.dataset.type;
    const value = target.dataset.value;

    try {
        if (type === 'digit' || type === 'operator') {
            calculator.append(value);
            display.textContent = calculator.getExpression();
        } else if (type === 'control') {
            switch (value) {
                case 'C':
                    calculator.clear();
                    display.textContent = '0';
                    break;
                case '←':
                    calculator.deleteLast();
                    const expr = calculator.getExpression();
                    display.textContent = expr || '0';
                    break;
                case '=':
                    const result = calculator.evaluate();
                    display.textContent = result;
                    break;
                default:
                    // No other control actions defined
                    break;
            }
        }
    } catch (err) {
        if (err instanceof ValidationError || err instanceof EvaluationError) {
            showError(err.message);
        } else {
            console.error('Unexpected error:', err);
        }
    }
}

/**
 * Shows a temporary error toast.
 * @param {string} message
 */
function showError(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Global error handling to avoid leaking stack traces to UI
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}
