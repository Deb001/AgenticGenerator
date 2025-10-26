'use strict';

// Calculator state
const calculatorState = {
    operand1: '',
    operator: '',
    operand2: '',
    resultShown: false
};

let displayElement = null;
let buttonElements = [];

// Initialize on DOMContentLoaded
function init() {
    displayElement = document.getElementById('display');
    buttonElements = document.querySelectorAll('.calc-button');

    buttonElements.forEach(btn => {
        btn.addEventListener('click', handleButtonClick);
    });

    document.addEventListener('keydown', handleKeydown);
}

// Click handler for calculator buttons
function handleButtonClick(event) {
    const key = event.currentTarget.dataset.key;
    if (!key) return;

    if (key.startsWith('digit-')) {
        const digit = key.split('-')[1];
        inputDigit(digit);
    } else if (key === 'decimal') {
        inputDecimal();
    } else if (key.startsWith('operator-')) {
        const op = key.split('-')[1];
        setOperator(op);
    } else if (key === 'equals') {
        calculateResult();
    } else if (key === 'clear') {
        clearAll();
    } else if (key === 'delete') {
        deleteLastChar();
    }
}

// Keyboard handler
function handleKeydown(event) {
    const { key } = event;

    if (key >= '0' && key <= '9') {
        inputDigit(key);
        event.preventDefault();
    } else if (key === '.' || key === ',') {
        inputDecimal();
        event.preventDefault();
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === 'x' || key === 'X') {
        const opMap = { '*': '*', 'x': '*', 'X': '*', '/': '/', '+': '+', '-': '-' };
        setOperator(opMap[key]);
        event.preventDefault();
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
        event.preventDefault();
    } else if (key === 'Backspace') {
        deleteLastChar();
        event.preventDefault();
    } else if (key === 'Escape') {
        clearAll();
        event.preventDefault();
    }
}

// Append a digit to the active operand
function inputDigit(digit) {
    if (calculatorState.resultShown && calculatorState.operator === '') {
        clearAll();
    }

    if (calculatorState.operator === '') {
        calculatorState.operand1 += digit;
        updateDisplay(calculatorState.operand1);
    } else {
        calculatorState.operand2 += digit;
        updateDisplay(calculatorState.operand2);
    }
}

// Add a decimal point to the active operand
function inputDecimal() {
    if (calculatorState.resultShown && calculatorState.operator === '') {
        clearAll();
    }

    if (calculatorState.operator === '') {
        if (!calculatorState.operand1.includes('.')) {
            calculatorState.operand1 = calculatorState.operand1 || '0';
            calculatorState.operand1 += '.';
            updateDisplay(calculatorState.operand1);
        }
    } else {
        if (!calculatorState.operand2.includes('.')) {
            calculatorState.operand2 = calculatorState.operand2 || '0';
            calculatorState.operand2 += '.';
            updateDisplay(calculatorState.operand2);
        }
    }
}

// Store the selected operator
function setOperator(op) {
    if (calculatorState.resultShown) {
        calculatorState.resultShown = false;
    }

    if (calculatorState.operator && calculatorState.operand2) {
        // Chain calculation: compute intermediate result first
        calculateResult();
    }

    if (!calculatorState.operand1) {
        calculatorState.operand1 = displayElement.value || '0';
    }

    calculatorState.operator = op;
}

// Perform the calculation
function calculateResult() {
    const a = parseFloat(calculatorState.operand1) || 0;
    const b = parseFloat(calculatorState.operand2) || 0;
    let result;

    switch (calculatorState.operator) {
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
                updateDisplay('Error');
                setTimeout(clearAll, 1500);
                return;
            }
            result = a / b;
            break;
        default:
            // No operator; just show the current operand
            result = a;
    }

    // Trim unnecessary trailing zeros
    const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?0+$/, '');

    updateDisplay(resultStr);
    calculatorState.operand1 = resultStr;
    calculatorState.operator = '';
    calculatorState.operand2 = '';
    calculatorState.resultShown = true;
}

// Reset calculator
function clearAll() {
    calculatorState.operand1 = '';
    calculatorState.operator = '';
    calculatorState.operand2 = '';
    calculatorState.resultShown = false;
    updateDisplay('');
}

// Delete last character from active operand
function deleteLastChar() {
    if (calculatorState.operator === '') {
        calculatorState.operand1 = calculatorState.operand1.slice(0, -1);
        updateDisplay(calculatorState.operand1);
    } else {
        calculatorState.operand2 = calculatorState.operand2.slice(0, -1);
        updateDisplay(calculatorState.operand2);
    }
}

// Update the calculator display
function updateDisplay(value) {
    if (displayElement) {
        displayElement.value = value;
    }
}

// Register init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);