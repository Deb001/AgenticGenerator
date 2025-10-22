Sure, here is the complete implementation of `app.js` based on the provided specifications:

document.addEventListener('DOMContentLoaded', () => {
  init();
});

let currentInput = ""; // string buffer for the number being entered
let previousValue = null; // numeric value stored after an operator is pressed
let pendingOperator = null; // '+', '-', '*', '/'
let errorState = false; // true when a fatal error (e.g., divide by zero) occurs

function init() {
  bindEvents();
  updateDisplay();
}

function bindEvents() {
  const buttons = document.querySelectorAll('[data-action]');
  buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
  });

  document.addEventListener('keydown', handleKeyPress);
}

function handleButtonClick(event) {
  const action = event.target.dataset.action;
  switch (action) {
    case 'digit':
      appendDigit(event.target.textContent);
      break;
    case 'decimal':
      appendDecimal();
      break;
    case 'operator':
      setOperator(event.target.textContent);
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
  }
  updateDisplay();
}

function handleKeyPress(event) {
  const key = event.key;
  if (/\d/.test(key)) {
    appendDigit(key);
  } else if (key === '.') {
    appendDecimal();
  } else if (/[+\-*/]/.test(key)) {
    setOperator(key);
  } else if (key === 'Enter' || key === '=') {
    computeResult();
  } else if (key === 'Escape' || key === 'C') {
    clearAll();
  } else if (key === 'Backspace') {
    deleteLast();
  }
  updateDisplay();
}

function appendDigit(digit) {
  if (errorState) return;
  currentInput += digit;
  if (currentInput.length > 10) { // Limit input length to prevent overflow
    currentInput = currentInput.slice(0, 10);
  }
}

function appendDecimal() {
  if (errorState || currentInput.includes('.')) return;
  currentInput += '.';
}

function setOperator(operator) {
  if (errorState) return;
  if (previousValue !== null && pendingOperator !== null) {
    computeResult();
  }
  previousValue = parseFloat(currentInput);
  pendingOperator = operator;
  currentInput = '';
}

function computeResult() {
  if (errorState || previousValue === null || pendingOperator === null) return;
  let result;
  try {
    const tokens = tokenize(previousValue + pendingOperator + currentInput);
    result = evaluateTokens(tokens);
  } catch (e) {
    if (e.message === 'Division by zero') {
      errorState = true;
      result = NaN;
    } else {
      throw e;
    }
  }
  currentInput = formatNumber(result);
  previousValue = null;
  pendingOperator = null;
}

function clearAll() {
  currentInput = '';
  previousValue = null;
  pendingOperator = null;
  errorState = false;
}

function deleteLast() {
  if (errorState) return;
  currentInput = currentInput.slice(0, -1);
}

function updateDisplay() {
  const display = document.querySelector('#calc-display');
  const history = document.querySelector('#calc-history');
  display.textContent = formatNumber(currentInput || '0');
  if (previousValue !== null && pendingOperator !== null) {
    history.textContent = `${formatNumber(previousValue)} ${pendingOperator} ${currentInput}`;
  } else {
    history.textContent = '';
  }
}

function tokenize(exprString) {
  return exprString.match(/(\d+|\.\d+|\d+\.\d+|[+\-*/])/g);
}

function evaluateTokens(tokens) {
  let stack = [];
  let operators = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

  for (let token of tokens) {
    if (/^\d+$/.test(token)) {
      stack.push(parseFloat(token));
    } else if ('+-*/'.includes(token)) {
      while (operators.length > 0 && precedence[operators[operators.length - 1]] >= precedence[token]) {
        const b = stack.pop();
        const a = stack.pop();
        const operator = operators.pop();
        switch (operator) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            if (b === 0) throw new Error('Division by zero');
            stack.push(a / b);
            break;
        }
      }
      operators.push(token);
    } else {
      throw new Error(`Invalid token: ${token}`);
    }
  }

  while (operators.length > 0) {
    const b = stack.pop();
    const a = stack.pop();
    const operator = operators.pop();
    switch (operator) {
      case '+':
        stack.push(a + b);
        break;
      case '-':
        stack.push(a - b);
        break;
      case '*':
        stack.push(a * b);
        break;
      case '/':
        if (b === 0) throw new Error('Division by zero');
        stack.push(a / b);
        break;
    }
  }

  return stack[0];
}

function formatNumber(num) {
  const str = num.toString();
  if (str.includes('.')) {
    return str.replace(/\.?0+$/, ''); // Remove trailing zeros and decimal point if not needed
  }
  return str;
}

window.evaluate = evaluateTokens; // Expose evaluate function for testing

This code provides a complete implementation of the calculator app as specified in the task. It includes all necessary functions to handle button clicks, key presses, and state management, along with error handling and display updates.