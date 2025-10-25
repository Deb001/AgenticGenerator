'use strict';

/**
 * ExpressionEvaluator parses arithmetic expressions and evaluates them.
 * Supports +, -, *, /, parentheses, decimal numbers, and unary minus.
 */
class ExpressionEvaluator {
    constructor() {
        this.precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2
        };
        this.operators = new Set(['+', '-', '*', '/']);
    }

    /**
     * Splits the raw expression string into tokens.
     * @param {string} expr
     * @returns {string[]}
     */
    tokenize(expr) {
        const tokens = [];
        let i = 0;
        while (i < expr.length) {
            const ch = expr[i];

            // Skip whitespace (should not appear but be safe)
            if (ch === ' ') {
                i++;
                continue;
            }

            // Number (including possible leading unary minus)
            if (/\d/.test(ch) || ch === '.') {
                let num = ch;
                i++;
                while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
                    num += expr[i];
                    i++;
                }
                tokens.push(num);
                continue;
            }

            // Operator or parenthesis
            if (this.operators.has(ch) || ch === '(' || ch === ')') {
                // Handle unary minus: if '-' and (start or previous token is operator or '(')
                if (ch === '-') {
                    const prev = tokens[tokens.length - 1];
                    if (!prev || this.operators.has(prev) || prev === '(') {
                        // Unary minus attaches to the following number
                        let j = i + 1;
                        let num = '-';
                        while (j < expr.length && (/\d/.test(expr[j]) || expr[j] === '.')) {
                            num += expr[j];
                            j++;
                        }
                        if (num.length > 1) {
                            tokens.push(num);
                            i = j;
                            continue;
                        }
                    }
                }
                tokens.push(ch);
                i++;
                continue;
            }

            throw new Error(`Invalid token '${ch}'`);
        }
        return tokens;
    }

    /**
     * Converts token array to Reverse Polish Notation using the shunting‑yard algorithm.
     * @param {string[]} tokens
     * @returns {string[]}
     */
    toRPN(tokens) {
        const output = [];
        const stack = [];

        for (const token of tokens) {
            if (!isNaN(token)) {
                // Number
                output.push(token);
            } else if (this.operators.has(token)) {
                while (
                    stack.length &&
                    this.operators.has(stack[stack.length - 1]) &&
                    (
                        this.precedence[stack[stack.length - 1]] > this.precedence[token] ||
                        (this.precedence[stack[stack.length - 1]] === this.precedence[token])
                    )
                ) {
                    output.push(stack.pop());
                }
                stack.push(token);
            } else if (token === '(') {
                stack.push(token);
            } else if (token === ')') {
                while (stack.length && stack[stack.length - 1] !== '(') {
                    output.push(stack.pop());
                }
                if (!stack.length) {
                    throw new Error('Mismatched parentheses');
                }
                stack.pop(); // Remove '('
            } else {
                throw new Error(`Invalid token '${token}'`);
            }
        }

        while (stack.length) {
            const op = stack.pop();
            if (op === '(' || op === ')') {
                throw new Error('Mismatched parentheses');
            }
            output.push(op);
        }

        return output;
    }

    /**
     * Evaluates an RPN token list.
     * @param {string[]} rpnTokens
     * @returns {number}
     */
    evaluateRPN(rpnTokens) {
        const stack = [];

        for (const token of rpnTokens) {
            if (!isNaN(token)) {
                stack.push(parseFloat(token));
            } else if (this.operators.has(token)) {
                if (stack.length < 2) {
                    throw new Error('Malformed expression');
                }
                const b = stack.pop();
                const a = stack.pop();
                let result;
                switch (token) {
                    case '+':
                        result = a + b;
                        break;
                    case '-':
                        result = a - b;
                        break;
                    case '*':
                        result = a * b;
                        break;
                    case '/':
                        if (b === 0) {
                            throw new Error('Division by zero');
                        }
                        result = a / b;
                        break;
                    default:
                        throw new Error(`Unsupported operator '${token}'`);
                }
                stack.push(result);
            } else {
                throw new Error(`Invalid token '${token}'`);
            }
        }

        if (stack.length !== 1) {
            throw new Error('Malformed expression');
        }
        return stack[0];
    }

    /**
     * Public API: evaluates a raw expression string.
     * @param {string} expr
     * @returns {number}
     */
    evaluate(expr) {
        if (!expr) {
            throw new Error('Empty expression');
        }
        const tokens = this.tokenize(expr);
        const rpn = this.toRPN(tokens);
        return this.evaluateRPN(rpn);
    }
}

/* ---------- UI Logic ---------- */

let displayElem = null;
let expression = '';
const evaluator = new ExpressionEvaluator();

/**
 * Initializes calculator after DOM is ready.
 */
function initCalculator() {
    displayElem = document.getElementById('display');
    const grid = document.querySelector('.button-grid');
    if (!displayElem || !grid) {
        console.error('Calculator UI elements not found.');
        return;
    }
    grid.addEventListener('click', handleButtonClick);
    updateDisplay('0');
}

/**
 * Handles click events from the button grid.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
        case 'digit':
        case 'decimal':
        case 'operator':
            if (!value) return;
            const proposed = expression + value;
            if (validateInput(proposed, value, action)) {
                expression = proposed;
                updateDisplay(expression);
            }
            break;
        case 'clear':
            clearExpression();
            break;
        case 'backspace':
            backspace();
            break;
        case 'equals':
            computeResult();
            break;
        default:
            // No-op for unknown actions
            break;
    }
}

/**
 * Validates a prospective expression change.
 * @param {string} proposedExpr - Expression after adding newChar.
 * @param {string} newChar - The character being added.
 * @param {string} actionType - 'digit' | 'decimal' | 'operator'
 * @returns {boolean}
 */
function validateInput(proposedExpr, newChar, actionType) {
    const MAX_LENGTH = 30;
    if (proposedExpr.length > MAX_LENGTH) return false;

    const operators = new Set(['+', '-', '*', '/']);

    // Helper to get the current number segment (characters after last operator)
    const getCurrentNumber = (expr) => {
        const match = expr.match(/([0-9]*\.?[0-9]*)$/);
        return match ? match[1] : '';
    };

    if (actionType === 'decimal') {
        const currentNumber = getCurrentNumber(proposedExpr.slice(0, -1));
        if (currentNumber.includes('.')) return false;
        // Allow leading decimal (e.g., ".5")
        return true;
    }

    if (actionType === 'operator') {
        const lastChar = expression.slice(-1);
        // Disallow two operators in a row (except unary minus)
        if (operators.has(lastChar)) {
            // Allow unary minus after another operator
            if (newChar === '-' && (lastChar !== ')')) {
                return true;
            }
            return false;
        }
        // Expression cannot start with an operator other than '-'
        if (!expression && newChar !== '-') return false;
        return true;
    }

    if (actionType === 'digit') {
        const currentNumber = getCurrentNumber(proposedExpr.slice(0, -1));
        // Prevent leading zeros like "00" or "01"
        if (currentNumber === '0' && newChar !== '.' && !currentNumber.includes('.')) {
            return false;
        }
        return true;
    }

    return true;
}

/**
 * Clears the current expression and resets display.
 */
function clearExpression() {
    expression = '';
    updateDisplay('0');
}

/**
 * Removes the last character from the expression.
 */
function backspace() {
    if (expression.length > 0) {
        expression = expression.slice(0, -1);
        updateDisplay(expression || '0');
    }
}

/**
 * Evaluates the current expression and updates the display.
 */
function computeResult() {
    try {
        const result = evaluator.evaluate(expression);
        // Trim unnecessary decimal zeros
        const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?0+$/, '');
        expression = formatted;
        updateDisplay(formatted);
    } catch (e) {
        updateDisplay('Error');
        expression = '';
    }
}

/**
 * Writes a value to the read‑only display input.
 * @param {string} value
 */
function updateDisplay(value) {
    if (displayElem) {
        displayElem.value = value;
    }
}

// Attach initialization after DOM is ready
document.addEventListener('DOMContentLoaded', initCalculator);