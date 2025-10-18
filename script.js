let currentInput = ""; // string representation of the number being entered
let previousValue = null; // numeric value stored before an operator is pressed
let operator = null; // one of '+', '-', '*', '/'
const displayElement = document.getElementById('display');

function initCalculator() {
    const buttons = document.querySelectorAll('.calculator-button');
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    document.addEventListener('keydown', handleKeyPress);
}

function handleButtonClick(event) {
    const action = event.target.dataset.action;
    switch (action) {
        case 'number':
            currentInput += event.target.textContent;
            displayElement.value = currentInput;
            break;
        case 'operator':
            if (previousValue === null) {
                previousValue = parseFloat(currentInput);
            } else {
                performOperation(operator);
            }
            operator = event.target.textContent;
            currentInput = "";
            displayElement.value = "0"; // Reset display to 0 after operation
            break;
        case 'equal':
            if (previousValue !== null) {
                performOperation(operator);
                operator = null;
            }
            break;
        case 'clear':
            clearDisplay();
            break;
    }
}

function handleKeyPress(event) {
    const key = event.key;
    if (/\d/.test(key)) {
        currentInput += key;
        displayElement.value = currentInput;
    } else if (['+', '-', '*', '/'].includes(key)) {
        if (previousValue === null) {
            previousValue = parseFloat(currentInput);
        } else {
            performOperation(operator);
        }
        operator = key;
        currentInput = "";
        displayElement.value = "0"; // Reset display to 0 after operation
    } else if (key === 'Enter') {
        if (previousValue !== null) {
            performOperation(operator);
            operator = null;
        }
    } else if (key === 'Escape') {
        clearDisplay();
    }
}

function performOperation(op) {
    let result;
    const current = parseFloat(currentInput);
    switch (op) {
        case '+':
            result = previousValue + current;
            break;
        case '-':
            result = previousValue - current;
            break;
        case '*':
            result = previousValue * current;
            break;
        case '/':
            if (current === 0) {
                displayElement.value = 'Error';
                clearDisplay();
                return;
            }
            result = previousValue / current;
            break;
        default:
            return;
    }
    previousValue = result;
    currentInput = result.toString();
    displayElement.value = currentInput;
}

function clearDisplay() {
    currentInput = "";
    previousValue = null;
    operator = null;
    displayElement.value = "0";
}

document.addEventListener('DOMContentLoaded', initCalculator);