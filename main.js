// main.js - Calculator logic

(() => {
  'use strict';

  /** @type {string} Holds the current arithmetic expression */
  let expressionBuffer = '';

  /** @type {HTMLInputElement|null} Cached reference to the display */
  let displayEl = null;

  /** Initialize the calculator once DOM is ready */
  function init() {
    displayEl = document.querySelector('#display');
    if (!displayEl) return;

    // Attach click listeners to all calculator buttons
    const buttons = document.querySelectorAll('.calc-button');
    buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
  }

  /** Click handler for calculator buttons */
  function handleButtonClick(event) {
    const btn = /** @type {HTMLElement} */ (event.currentTarget);
    const value = btn.getAttribute('data-value');
    if (value !== null) {
      processInput(value);
    }
  }

  /** Keyboard handler */
  function handleKeyPress(event) {
    const key = event.key;

    // Map keys to calculator values
    const keyMap = {
      'Enter': '=',
      '=': '=',
      'Escape': 'C',
      'c': 'C',
      'C': 'C',
      'Backspace': '←',
      'Delete': '←',
      '*': '×',
      '/': '÷',
      '+': '+',
      '-': '-',
      '.': '.',
      ',': '.', // some keyboards
      '0': '0',
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9'
    };

    if (keyMap.hasOwnProperty(key)) {
      event.preventDefault();
      processInput(keyMap[key]);
    }
  }

  /** Core input processor */
  function processInput(value) {
    switch (value) {
      case 'C':
        clearDisplay();
        break;
      case '←':
        deleteLastChar();
        break;
      case '=':
        evaluateExpression();
        break;
      default:
        if (isDigit(value) || value === '.') {
          handleDigitOrDecimal(value);
        } else if (isOperator(value)) {
          handleOperator(value);
        }
        // ignore any other characters
    }
  }

  /** Append digit or decimal point with validation */
  function handleDigitOrDecimal(char) {
    if (char === '.') {
      const lastNumber = getCurrentNumber();
      if (lastNumber.includes('.')) return; // prevent multiple decimals
      // allow leading decimal (e.g., ".5")
    }
    expressionBuffer += char;
    updateDisplay(expressionBuffer);
  }

  /** Append operator with validation */
  function handleOperator(op) {
    if (expressionBuffer.length === 0) {
      // Disallow starting with an operator except minus for negative numbers
      if (op === '-') {
        expressionBuffer += op;
        updateDisplay(expressionBuffer);
      }
      return;
    }
    const lastChar = expressionBuffer[expressionBuffer.length - 1];
    if (isOperator(lastChar) || lastChar === '.') return; // prevent consecutive operators or operator after decimal
    expressionBuffer += op;
    updateDisplay(expressionBuffer);
  }

  /** Returns the substring after the last operator (or whole buffer) */
  function getCurrentNumber() {
    const operators = /[+\-*/×÷]/;
    const parts = expressionBuffer.split(operators);
    return parts[parts.length - 1] || '';
  }

  /** Update the read‑only display */
  function updateDisplay(content) {
    if (displayEl) {
      displayEl.value = content;
    }
  }

  /** Clear everything */
  function clearDisplay() {
    expressionBuffer = '';
    updateDisplay('');
  }

  /** Delete the last character */
  function deleteLastChar() {
    if (expressionBuffer.length === 0) return;
    expressionBuffer = expressionBuffer.slice(0, -1);
    updateDisplay(expressionBuffer);
  }

  /** Evaluate the current expression safely */
  function evaluateExpression() {
    if (expressionBuffer.length === 0) return;

    // Replace visual operators with JS equivalents
    let sanitized = expressionBuffer.replace(/×/g, '*').replace(/÷/g, '/');

    // Allow only digits, operators, decimal point
    if (!/^[0-9+\-*/.]+$/.test(sanitized)) {
      showError('Error');
      return;
    }

    try {
      const rpn = infixToRPN(sanitized);
      const result = evaluateRPN(rpn);
      if (!isFinite(result)) {
        showError('Error: Division by zero');
        return;
      }
      const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?0+$/, '');
      expressionBuffer = resultStr;
      updateDisplay(resultStr);
    } catch (e) {
      showError('Error');
    }
  }

  /** Display error and reset buffer */
  function showError(message) {
    updateDisplay(message);
    expressionBuffer = '';
  }

  /** Utility: check if character is an operator */
  function isOperator(char) {
    return ['+', '-', '*', '/', '×', '÷'].includes(char);
  }

  /** Utility: check if character is a digit */
  function isDigit(char) {
    return /^[0-9]$/.test(char);
  }

  /** Convert infix expression string to Reverse Polish Notation (Shunting‑Yard) */
  function infixToRPN(expr) {
    const outputQueue = [];
    const operatorStack = [];

    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2
    };

    const associativity = {
      '+': 'Left',
      '-': 'Left',
      '*': 'Left',
      '/': 'Left'
    };

    // Tokenize numbers and operators
    const tokens = expr.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g);
    if (!tokens) throw new Error('Tokenization failed');

    for (const token of tokens) {
      if (isNumeric(token)) {
        outputQueue.push(token);
      } else if (isOperator(token)) {
        while (
          operatorStack.length &&
          isOperator(operatorStack[operatorStack.length - 1]) &&
          ((associativity[token] === 'Left' && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
            (associativity[token] === 'Right' && precedence[token] < precedence[operatorStack[operatorStack.length - 1]]))
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else {
        throw new Error('Invalid token');
      }
    }

    while (operatorStack.length) {
      const op = operatorStack.pop();
      if (!isOperator(op)) throw new Error('Mismatched parentheses');
      outputQueue.push(op);
    }

    return outputQueue;
  }

  /** Evaluate RPN expression */
  function evaluateRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
      if (isNumeric(token)) {
        stack.push(parseFloat(token));
      } else if (isOperator(token)) {
        if (stack.length < 2) throw new Error('Insufficient values');
        const b = stack.pop();
        const a = stack.pop();
        let res;
        switch (token) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (b === 0) throw new Error('Division by zero');
            res = a / b;
            break;
          default:
            throw new Error('Unknown operator');
        }
        stack.push(res);
      } else {
        throw new Error('Invalid RPN token');
      }
    }

    if (stack.length !== 1) throw new Error('RPN evaluation error');
    return stack[0];
  }

  /** Helper to test numeric strings */
  function isNumeric(str) {
    return /^-?\d+(\.\d+)?$/.test(str);
  }

  // Register init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
})();