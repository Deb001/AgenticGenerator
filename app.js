"use strict";

/**
 * Scientific Calculator Front‑end Logic
 * -----------------------------------
 * This script wires UI interactions to a safe expression parser based on the
 * shunting‑yard algorithm. It supports numbers, decimals, parentheses, the
 * operators +, -, *, /, ^, unary minus, constants (π, e) and scientific
 * functions (sin, cos, tan, log, ln, sqrt, exp).
 */

// -------------------- UI HANDLING --------------------
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');

/**
 * Append a value to the calculator display.
 * @param {string} value - The character(s) to append.
 */
function appendToDisplay(value) {
  // If the display currently shows only "0" and the new value is a digit or decimal,
  // replace the zero; otherwise concatenate.
  if (display.value === '' && value === '-') {
    // Allow starting a negative number.
    display.value = value;
    return;
  }
  if (display.value === '' && value === '.') {
    // Prepend a leading zero for a decimal start.
    display.value = '0.';
    return;
  }
  display.value += value;
}

/** Reset the display to an empty string. */
function clearDisplay() {
  display.value = '';
}

/** Remove the last character from the display. */
function backspace() {
  display.value = display.value.slice(0, -1);
}

/** Evaluate the expression currently shown in the display. */
function evaluateExpression() {
  const expr = display.value;
  try {
    const result = calculate(expr);
    display.value = String(result);
  } catch (e) {
    console.error(e);
    display.value = 'Error';
  }
}

// Attach click listeners to all calculator buttons.
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    switch (action) {
      case 'number':
      case 'decimal':
      case 'operator':
      case 'parenthesis':
      case 'function':
      case 'constant':
        appendToDisplay(value);
        break;
      case 'clear':
        clearDisplay();
        break;
      case 'backspace':
        backspace();
        break;
      case 'equals':
        evaluateExpression();
        break;
      default:
        // No action needed for unknown data-action values.
        break;
    }
  });
});

// -------------------- PARSER & EVALUATOR --------------------
const OPERATORS = {
  '+': { precedence: 2, assoc: 'L', func: (a, b) => a + b },
  '-': { precedence: 2, assoc: 'L', func: (a, b) => a - b },
  '*': { precedence: 3, assoc: 'L', func: (a, b) => a * b },
  '/': { precedence: 3, assoc: 'L', func: (a, b) => a / b },
  '^': { precedence: 4, assoc: 'R', func: (a, b) => Math.pow(a, b) },
  'u-': { precedence: 5, assoc: 'R', func: a => -a } // unary minus
};

const FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: x => Math.log10(x),
  ln: Math.log,
  sqrt: Math.sqrt,
  exp: Math.exp
};

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E
};

/**
 * Split an expression string into tokens.
 * @param {string} str - Raw expression.
 * @returns {string[]} Token array.
 */
function tokenize(str) {
  const tokens = [];
  const regex = /\s*([0-9]*\.?[0-9]+|pi|e|[a-zA-Z]+|\S)\s*/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

/**
 * Convert token list to Reverse Polish Notation using the shunting‑yard algorithm.
 * @param {string[]} tokens
 * @returns {string[]} RPN token list.
 */
function toRPN(tokens) {
  const output = [];
  const stack = [];
  let prevToken = null;

  tokens.forEach(tok => {
    if (isNumber(tok) || isConstant(tok)) {
      output.push(tok);
    } else if (isFunction(tok)) {
      stack.push(tok);
    } else if (tok === ',') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      if (!stack.length) throw new Error('Misplaced comma');
    } else if (tok === '(') {
      stack.push(tok);
    } else if (tok === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop(); // Remove '('
      if (stack.length && isFunction(stack[stack.length - 1])) {
        output.push(stack.pop());
      }
    } else if (isOperator(tok)) {
      // Detect unary minus
      if (tok === '-' && (prevToken === null || (isOperator(prevToken) && prevToken !== ')') || prevToken === '(')) {
        tok = 'u-';
      }
      while (stack.length && isOperator(stack[stack.length - 1])) {
        const o1 = OPERATORS[tok];
        const o2 = OPERATORS[stack[stack.length - 1]];
        if ((o1.assoc === 'L' && o1.precedence <= o2.precedence) || (o1.assoc === 'R' && o1.precedence < o2.precedence)) {
          output.push(stack.pop());
          continue;
        }
        break;
      }
      stack.push(tok);
    } else {
      throw new Error('Unknown token: ' + tok);
    }
    prevToken = tok;
  });

  while (stack.length) {
    const op = stack.pop();
    if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
    output.push(op);
  }

  return output;
}

/**
 * Evaluate an RPN token array.
 * @param {string[]} rpn
 * @returns {number}
 */
function evaluateRPN(rpn) {
  const stack = [];
  rpn.forEach(tok => {
    if (isNumber(tok)) {
      stack.push(parseFloat(tok));
    } else if (isConstant(tok)) {
      stack.push(CONSTANTS[tok]);
    } else if (isFunction(tok)) {
      const a = stack.pop();
      if (a === undefined) throw new Error('Insufficient parameters for function');
      stack.push(FUNCTIONS[tok](a));
    } else if (isOperator(tok)) {
      if (tok === 'u-') {
        const a = stack.pop();
        if (a === undefined) throw new Error('Insufficient parameters for unary minus');
        stack.push(OPERATORS[tok].func(a));
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) throw new Error('Insufficient parameters for operator');
        stack.push(OPERATORS[tok].func(a, b));
      }
    } else {
      throw new Error('Invalid token in RPN');
    }
  });
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

/**
 * High‑level helper that tokenizes, converts to RPN, and evaluates.
 * @param {string} expr
 * @returns {number}
 */
function calculate(expr) {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evaluateRPN(rpn);
}

/** Helper to test if a token is a numeric literal. */
function isNumber(tok) {
  return /^[0-9]*\.?[0-9]+$/.test(tok);
}

/** Helper to test if a token is a defined operator. */
function isOperator(tok) {
  return Object.prototype.hasOwnProperty.call(OPERATORS, tok);
}

/** Helper to test if a token is a supported function name. */
function isFunction(tok) {
  return Object.prototype.hasOwnProperty.call(FUNCTIONS, tok);
}

/** Helper to test if a token is a supported constant. */
function isConstant(tok) {
  return Object.prototype.hasOwnProperty.call(CONSTANTS, tok);
}

// Initialise the calculator with an empty display.
clearDisplay();