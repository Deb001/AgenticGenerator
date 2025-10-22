/* app.js - Core calculator logic */
'use strict';

let expressionString = '';
const operatorPrecedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
let displayElement = null;

/* UI Update helpers */
function updateDisplay(content) {
    if (displayElement) displayElement.textContent = content;
}

function showError(message) {
    updateDisplay(message);
    expressionString = '';
}

/* Input manipulation */
function appendDigit(digit) {
    expressionString += digit;
    updateDisplay(expressionString);
}

function appendOperator(operator) {
    if (!expressionString && operator !== '-') return; // prevent leading operators except minus
    if (/[+\-*/]$/.test(expressionString)) return; // avoid consecutive operators
    expressionString += operator;
    updateDisplay(expressionString);
}

function addDecimal() {
    const parts = expressionString.split(/[+\-*/]/);
    const last = parts[parts.length - 1];
    if (last.includes('.')) return;
    // If starting a new number with a decimal, prepend a zero
    if (last === '' && (expressionString === '' || /[+\-*/]$/.test(expressionString))) {
        expressionString += '0';
    }
    expressionString += '.';
    updateDisplay(expressionString);
}

function clearAll() {
    expressionString = '';
    updateDisplay('');
}

function deleteLast() {
    expressionString = expressionString.slice(0, -1);
    updateDisplay(expressionString);
}

/* Evaluation pipeline */
function computeResult() {
    try {
        const result = evaluateExpression(expressionString);
        const resultStr = String(result);
        expressionString = resultStr;
        updateDisplay(resultStr);
    } catch (e) {
        showError('Error');
    }
}

function evaluateExpression(expr) {
    const tokens = tokenize(expr);
    const rpn = shuntingYard(tokens);
    return computeRPN(rpn);
}

/* Tokenizer */
function tokenize(expr) {
    const tokens = [];
    let numberBuffer = '';
    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (/\d/.test(ch) || ch === '.') {
            numberBuffer += ch;
        } else if (/[+\-*/]/.test(ch)) {
            if (numberBuffer) {
                tokens.push(numberBuffer);
                numberBuffer = '';
            }
            tokens.push(ch);
        } else if (/\s/.test(ch)) {
            continue;
        } else {
            throw new Error(`Invalid character: ${ch}`);
        }
    }
    if (numberBuffer) tokens.push(numberBuffer);
    return tokens;
}

/* Shunting‑Yard algorithm */
function shuntingYard(tokens) {
    const output = [];
    const stack = [];
    tokens.forEach(token => {
        if (/[+\-*/]/.test(token)) {
            while (
                stack.length &&
                /[+\-*/]/.test(stack[stack.length - 1]) &&
                operatorPrecedence[stack[stack.length - 1]] >= operatorPrecedence[token]
            ) {
                output.push(stack.pop());
            }
            stack.push(token);
        } else {
            output.push(token);
        }
    });
    while (stack.length) {
        const op = stack.pop();
        if (!/[+\-*/]/.test(op)) {
            throw new Error('Mismatched operators');
        }
        output.push(op);
    }
    return output;
}

/* RPN evaluator */
function computeRPN(rpnTokens) {
    const stack = [];
    rpnTokens.forEach(token => {
        if (/[+\-*/]/.test(token)) {
            if (stack.length < 2) throw new Error('Insufficient operands');
            const b = stack.pop();
            const a = stack.pop();
            let res;
            switch (token) {
                case '+': res = a + b; break;
                case '-': res = a - b; break;
                case '*': res = a * b; break;
                case '/':
                    if (b === 0) throw new Error('Division by zero');
                    res = a / b;
                    break;
                default: throw new Error(`Unknown operator: ${token}`);
            }
            stack.push(res);
        } else {
            const num = parseFloat(token);
            if (isNaN(num)) throw new Error(`Invalid number: ${token}`);
            stack.push(num);
        }
    });
    if (stack.length !== 1) throw new Error('Malformed expression');
    return stack[0];
}

/* Event handlers */
function handleButtonClick(event) {
    const btn = event.target.closest('.btn');
    if (!btn) return;
    const action = btn.dataset.action;
    const label = btn.innerText.trim();

    switch (action) {
        case 'digit':
            appendDigit(label);
            break;
        case 'operator':
            const op = label === '×' ? '*' : label === '÷' ? '/' : label;
            appendOperator(op);
            break;
        case 'decimal':
            addDecimal();
            break;
        case 'clear':
            clearAll();
            break;
        case 'delete':
            deleteLast();
            break;
        case 'equals':
            computeResult();
            break;
        default:
            break;
    }
}

function handleKeyPress(event) {
    const { key } = event;
    if (/\d/.test(key)) {
        appendDigit(key);
        event.preventDefault();
    } else if (key === '.' ) {
        addDecimal();
        event.preventDefault();
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
        event.preventDefault();
    } else if (key === 'Enter') {
        computeResult();
        event.preventDefault();
    } else if (key === 'Backspace') {
        deleteLast();
        event.preventDefault();
    } else if (key === 'Escape') {
        clearAll();
        event.preventDefault();
    }
}

/* Initialization */
function initCalculator() {
    displayElement = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));
    document.addEventListener('keydown', handleKeyPress);
    clearAll();
}

document.addEventListener('DOMContentLoaded', initCalculator);