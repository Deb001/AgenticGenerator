"use strict";

// ==================== Expression Evaluator ====================
const OPERATORS = {
  '+': { precedence: 2, assoc: 'L', func: (a, b) => a + b },
  '-': { precedence: 2, assoc: 'L', func: (a, b) => a - b },
  '*': { precedence: 3, assoc: 'L', func: (a, b) => a * b },
  '/': {
    precedence: 3,
    assoc: 'L',
    func: (a, b) => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    }
  },
  '^': { precedence: 4, assoc: 'R', func: (a, b) => Math.pow(a, b) }
};

const FUNCTIONS = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  ln: (x) => {
    if (x <= 0) throw new Error('ln domain error');
    return Math.log(x);
  },
  log: (x) => {
    if (x <= 0) throw new Error('log domain error');
    return Math.log10(x);
  },
  sqrt: (x) => {
    if (x < 0) throw new Error('sqrt domain error');
    return Math.sqrt(x);
  },
  π: () => Math.PI,
  e: () => Math.E
};

/**
 * Split the expression string into an array of tokens.
 * Supports numbers, constants, functions, operators and parentheses.
 * @param {string} expr
 * @returns {string[]}
 */
function tokenize(expr) {
  const tokens = [];
  const regex = /\s*([0-9]*\.?[0-9]+|π|e|[A-Za-z]+|\S)\s*/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

/**
 * Convert token array from infix to Reverse Polish Notation using the shunting‑yard algorithm.
 * @param {string[]} tokens
 * @returns {string[]}
 */
function shuntingYard(tokens) {
  const output = [];
  const stack = [];
  const isFunction = (t) => Object.prototype.hasOwnProperty.call(FUNCTIONS, t);
  const isOperator = (t) => Object.prototype.hasOwnProperty.call(OPERATORS, t);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!isNaN(token) || token === 'π' || token === 'e') {
      output.push(token);
    } else if (isFunction(token)) {
      stack.push(token);
    } else if (token === ',') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      if (!stack.length) throw new Error('Misplaced comma or parentheses');
    } else if (isOperator(token)) {
      while (
        stack.length &&
        isOperator(stack[stack.length - 1]) &&
        ((OPERATORS[token].assoc === 'L' && OPERATORS[token].precedence <= OPERATORS[stack[stack.length - 1]].precedence) ||
          (OPERATORS[token].assoc === 'R' && OPERATORS[token].precedence < OPERATORS[stack[stack.length - 1]].precedence))
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
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop(); // Remove '('
      if (stack.length && isFunction(stack[stack.length - 1])) {
        output.push(stack.pop());
      }
    } else {
      throw new Error(`Unknown token: ${token}`);
    }
  }

  while (stack.length) {
    const op = stack.pop();
    if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
    output.push(op);
  }
  return output;
}

/**
 * Evaluate an expression in Reverse Polish Notation.
 * @param {string[]} rpn
 * @returns {number}
 */
function evaluateRPN(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (!isNaN(token)) {
      stack.push(parseFloat(token));
    } else if (token === 'π') {
      stack.push(Math.PI);
    } else if (token === 'e') {
      stack.push(Math.E);
    } else if (Object.prototype.hasOwnProperty.call(FUNCTIONS, token)) {
      const fn = FUNCTIONS[token];
      const argCount = fn.length;
      if (stack.length < argCount) throw new Error('Insufficient arguments for function');
      const args = stack.splice(-argCount);
      const result = fn(...args);
      if (!Number.isFinite(result)) throw new Error('Math overflow');
      stack.push(result);
    } else if (Object.prototype.hasOwnProperty.call(OPERATORS, token)) {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Insufficient values for operator');
      const result = OPERATORS[token].func(a, b);
      if (!Number.isFinite(result)) throw new Error('Math overflow');
      stack.push(result);
    } else {
      throw new Error(`Invalid token in RPN: ${token}`);
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

/**
 * Public API – evaluate a mathematical expression string.
 * @param {string} expr
 * @returns {number}
 * @throws Will throw an error if the expression is invalid.
 */
function evaluateExpression(expr) {
  if (!expr) throw new Error('Empty expression');
  const tokens = tokenize(expr);
  const rpn = shuntingYard(tokens);
  return evaluateRPN(rpn);
}

// ==================== UI Interaction ====================
const display = document.getElementById('display');
let errorState = false;

function appendToDisplay(value) {
  if (errorState) {
    display.value = '';
    errorState = false;
    display.classList.remove('error');
  }
  display.value += value;
}

function clearDisplay() {
  display.value = '';
  errorState = false;
  display.classList.remove('error');
}

function backspace() {
  if (errorState) return clearDisplay();
  display.value = display.value.slice(0, -1);
}

function computeResult() {
  try {
    const result = evaluateExpression(display.value);
    display.value = Number.isFinite(result) ? result : 'Error';
  } catch (e) {
    display.value = e.message;
    errorState = true;
    display.classList.add('error');
  }
}

// Button click handling
document.querySelectorAll('button[data-key], button[data-func]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-key');
    const func = btn.getAttribute('data-func');
    if (key) {
      if (key === 'C') return clearDisplay();
      if (key === '\u2190') return backspace();
      if (key === '=') return computeResult();
      appendToDisplay(key);
    } else if (func) {
      if (func === '^') return appendToDisplay('^');
      if (func === 'π') return appendToDisplay('π');
      if (func === 'e') return appendToDisplay('e');
      // Functions are added with opening parenthesis
      appendToDisplay(`${func}(`);
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const allowed = '0123456789.+-*/^()';
  if (allowed.includes(e.key)) {
    appendToDisplay(e.key);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    computeResult();
    e.preventDefault();
  } else if (e.key === 'Backspace') {
    backspace();
    e.preventDefault();
  } else if (e.key === 'Escape') {
    clearDisplay();
    e.preventDefault();
  }
});

export { evaluateExpression };
