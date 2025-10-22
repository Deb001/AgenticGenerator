/* app.js - Calculator logic (no external dependencies) */
'use strict';

let expression = ''; // holds the current arithmetic expression as a plain string.

/* Utility helpers */
const isOperator = (ch) => ['+', '-', '*', '/'].includes(ch);
const mapToken = (t) => {
  if (t === '×') return '*';
  if (t === '÷') return '/';
  return t;
};

/* UI update */
function updateDisplay(value) {
  const display = document.getElementById('display');
  if (display) display.textContent = value;
}

/* Reset state */
function clearDisplay() {
  expression = '';
  updateDisplay('');
}

/* Append a token after validation */
function appendToken(rawToken) {
  const token = mapToken(rawToken);

  // Digits and decimal point
  if (/\d/.test(token) || token === '.') {
    if (token === '.') {
      // Prevent multiple decimals in the current number segment
      const parts = expression.split(/[\+\-\*\/]/);
      const lastNumber = parts[parts.length - 1];
      if (lastNumber.includes('.')) return; // ignore invalid decimal
      if (lastNumber === '') return; // prevent leading decimal without a digit (optional)
    }
    expression += token;
    updateDisplay(expression);
    return;
  }

  // Operators
  if (isOperator(token)) {
    if (expression === '') return; // cannot start with an operator
    const lastChar = expression[expression.length - 1];
    if (isOperator(lastChar)) return; // prevent consecutive operators
    expression += token;
    updateDisplay(expression);
    return;
  }

  // Any other token is ignored
}

/* Evaluate the current expression using Shunting‑Yard + RPN */
function evaluateExpression() {
  if (expression === '') return;

  // Disallow trailing operator
  if (isOperator(expression[expression.length - 1])) {
    updateDisplay('Error');
    expression = '';
    return;
  }

  // Tokenize (numbers may contain a decimal point)
  const tokens = [];
  let numberBuffer = '';
  for (let i = 0; i < expression.length; i++) {
    const ch = expression[i];
    if (/\d/.test(ch) || ch === '.') {
      numberBuffer += ch;
    } else if (isOperator(ch)) {
      if (numberBuffer !== '') {
        tokens.push(numberBuffer);
        numberBuffer = '';
      }
      tokens.push(ch);
    } else {
      // Invalid character – abort
      updateDisplay('Error');
      expression = '';
      return;
    }
  }
  if (numberBuffer !== '') tokens.push(numberBuffer);

  // Shunting‑Yard to produce RPN
  const outputQueue = [];
  const operatorStack = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const associativity = { '+': 'L', '-': 'L', '*': 'L', '/': 'L' };

  for (const tok of tokens) {
    if (!isOperator(tok)) {
      outputQueue.push(tok);
    } else {
      while (
        operatorStack.length &&
        isOperator(operatorStack[operatorStack.length - 1]) &&
        ((associativity[tok] === 'L' && precedence[tok] <= precedence[operatorStack[operatorStack.length - 1]]) ||
          (associativity[tok] === 'R' && precedence[tok] < precedence[operatorStack[operatorStack.length - 1]]))
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(tok);
    }
  }
  while (operatorStack.length) {
    const op = operatorStack.pop();
    if (!isOperator(op)) {
      updateDisplay('Error');
      expression = '';
      return;
    }
    outputQueue.push(op);
  }

  // Evaluate RPN
  const evalStack = [];
  for (const tok of outputQueue) {
    if (!isOperator(tok)) {
      evalStack.push(parseFloat(tok));
    } else {
      if (evalStack.length < 2) {
        updateDisplay('Error');
        expression = '';
        return;
      }
      const b = evalStack.pop();
      const a = evalStack.pop();
      let result;
      switch (tok) {
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
            expression = '';
            return;
          }
          result = a / b;
          break;
        default:
          updateDisplay('Error');
          expression = '';
          return;
      }
      evalStack.push(result);
    }
  }

  if (evalStack.length !== 1) {
    updateDisplay('Error');
    expression = '';
    return;
  }

  const finalResult = evalStack[0];
  const displayValue = Number.isFinite(finalResult) ? String(finalResult) : 'Error';
  expression = displayValue === 'Error' ? '' : displayValue;
  updateDisplay(displayValue);
}

/* Central event dispatcher */
function handleButtonPress(event) {
  const token = event.target.dataset?.token;
  if (!token) return;

  if (token === 'C') {
    clearDisplay();
  } else if (token === '=') {
    evaluateExpression();
  } else {
    appendToken(token);
  }
}

/* Initial wiring */
function initCalculator() {
  const buttons = document.querySelectorAll('.calc-button');
  buttons.forEach((btn) => btn.addEventListener('click', handleButtonPress));
  updateDisplay('');
}

/* Run after DOM is ready */
document.addEventListener('DOMContentLoaded', initCalculator);