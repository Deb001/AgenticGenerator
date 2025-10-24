document.addEventListener('DOMContentLoaded', init);

let displayBuffer = '';
const VALID_CHAR_REGEX = /^[0-9+\\-*/().\\s]+$/;
const OPERATOR_PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2 };

function init() {
    const displayEl = document.getElementById('display');
    const buttonsEl = document.getElementById('buttons');
    const equalsEl = document.getElementById('equals');
    const clearEl = document.getElementById('clear');

    if (!displayEl || !buttonsEl || !equalsEl || !clearEl) {
        showError('Initialization error: missing DOM element');
        console.error('Initialization error: missing DOM element', displayEl, buttonsEl, equalsEl, clearEl);
        return;
    }

    document.querySelectorAll('.calc-button').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    window.addEventListener('keydown', handleKeydown);

    displayBuffer = '';
    renderDisplay();
}

function appendToDisplay(char) {
    if (validateAppendChar(char)) {
        displayBuffer += char;
        renderDisplay();
    }
}

function validateAppendChar(char) {
    return VALID_CHAR_REGEX.test(char);
}

function validateExpression(expression) {
    if (!expression) {
        return { valid: false, error: 'Empty expression' };
    }

    const charWhitelistCheck = VALID_CHAR_REGEX.test(expression);
    if (!charWhitelistCheck) {
        return { valid: false, error: 'Invalid characters detected' };
    }

    let parenthesesCount = 0;
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === '(') {
            parenthesesCount++;
        } else if (char === ')') {
            parenthesesCount--;
        }

        if (parenthesesCount < 0) {
            return { valid: false, error: 'Mismatched parentheses' };
        }
    }

    if (parenthesesCount !== 0) {
        return { valid: false, error: 'Mismatched parentheses' };
    }

    const operatorPattern = /[+\-*/]/;
    for (let i = 1; i < expression.length; i++) {
        if (operatorPattern.test(expression[i]) && operatorPattern.test(expression[i - 1])) {
            return { valid: false, error: 'Invalid operator sequence' };
        }
    }

    const endsWithOperator = /[+\-*/]$/;
    if (endsWithOperator.test(expression)) {
        return { valid: false, error: 'Expression ends with operator' };
    }

    return { valid: true };
}

function evaluateExpression(expression) {
    const validation = validateExpression(expression);
    if (!validation.valid) {
        return validation.error;
    }

    try {
        const result = safeEvaluate(expression);
        return formatResult(result);
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function safeEvaluate(expression) {
    const tokens = tokenize(expression);
    const rpn = shuntingYard(tokens);
    return evaluateRPN(rpn);
}

function tokenize(expression) {
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
        if (/[0-9.]/.test(expression[i])) {
            let numberStr = '';
            while (/[0-9.]/.test(expression[i])) {
                numberStr += expression[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseFloat(numberStr) });
        } else if (/\+|-|\*|\//.test(expression[i])) {
            tokens.push({ type: 'op', value: expression[i] });
            i++;
        } else if (/[\(\)]/.test(expression[i])) {
            tokens.push({ type: 'paren', value: expression[i] });
            i++;
        } else {
            i++;
        }
    }
    return tokens;
}

function shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            outputQueue.push(token);
        } else if (token.type === 'op') {
            while (operatorStack.length > 0 && isOperator(operatorStack[operatorStack.length - 1]) && precedence(operatorStack[operatorStack.length - 1].value) >= precedence(token.value)) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        } else if (token.type === 'paren') {
            if (token.value === '(') {
                operatorStack.push(token);
            } else {
                while (operatorStack[operatorStack.length - 1].value !== '(') {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.pop();
            }
        }
    }

    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
}

function evaluateRPN(tokens) {
    const stack = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        } else if (token.type === 'op') {
            const right = stack.pop();
            const left = stack.pop();
            let result;
            switch (token.value) {
                case '+':
                    result = left + right;
                    break;
                case '-':
                    result = left - right;
                    break;
                case '*':
                    result = left * right;
                    break;
                case '/':
                    if (right === 0) {
                        throw new Error('Division by zero');
                    }
                    result = left / right;
                    break;
            }
            stack.push(result);
        }
    }

    return stack.pop();
}

function formatResult(number) {
    const formattedNumber = Number(number).toFixed(10);
    if (formattedNumber.endsWith('0')) {
        return formattedNumber.slice(0, -2);
    }
    return formattedNumber;
}

function clearDisplay() {
    displayBuffer = '';
    renderDisplay();
}

function deleteLastChar() {
    if (displayBuffer.length > 0) {
        displayBuffer = displayBuffer.slice(0, -1);
        renderDisplay();
    }
}

function handleButtonClick(event) {
    event.preventDefault();
    const buttonValue = event.currentTarget.dataset.value;
    if (buttonValue === '=') {
        handleEquals();
    } else if (buttonValue === 'C') {
        clearDisplay();
    } else {
        appendToDisplay(buttonValue);
    }
}

function handleEquals() {
    const trimmedExpression = displayBuffer.trim();
    const result = evaluateExpression(trimmedExpression);
    if (result.startsWith('Error')) {
        displayBuffer = `Error: ${result}`;
    } else {
        displayBuffer = result;
    }
    renderDisplay();
}

function handleKeydown(event) {
    event.preventDefault();
    const key = event.key;
    if (/\d|\.|+|-|\*|\/|\(|\)|Space/.test(key)) {
        appendToDisplay(key);
    } else if (key === 'Enter') {
        handleEquals();
    } else if (key === 'Backspace') {
        deleteLastChar();
    } else if (key === 'Escape') {
        clearDisplay();
    }
}

function renderDisplay() {
    const displayEl = document.getElementById('display');
    displayEl.textContent = displayBuffer;
    if (displayBuffer.startsWith('Error')) {
        displayEl.classList.add('error');
    } else {
        displayEl.classList.remove('error');
    }
}

function showError(message) {
    displayBuffer = `Error: ${message}`;
    renderDisplay();
    console.error(message);
}