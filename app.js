// ====================
//  Evaluation Engine  
// ====================

"use strict";

/**
 * Operator definitions with precedence, associativity, and implementation.
 */
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

/**
 * Supported scientific functions. Each function receives numeric arguments.
 */
const FUNCTIONS = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  asin: (x) => Math.asin(x),
  acos: (x) => Math.acos(x),
  atan: (x) => Math.atan(x),
  log: (x) => {
    if (x <= 0) throw new Error('Log domain error');
    return Math.log10(x);
  },
  ln: (x) => {
    if (x <= 0) throw new Error('Ln domain error');
    return Math.log(x);
  },
  sqrt: (x) => {
    if (x < 0) throw new Error('Sqrt domain error');
    return Math.sqrt(x);
  },
  exp: (x) => Math.exp(x),
  pow: (x, y) => Math.pow(x, y)
};

/**
 * Constant values that can be used in expressions.
 */
const CONSTANTS = {
  pi: Math.PI,
  e: Math.E
};

/** Utility helpers */
function isLetter(ch) {
  return /[a-zA-Z]/.test(ch);
}
function isDigit(ch) {
  return /[0-9]/.test(ch);
}

/**
 * Convert a raw expression string into an array of token objects.
 * @param {string} expr
 * @returns {Array<{type:string, value:any}>}
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ' || ch === '\t') { i++; continue; }
    // Number (including decimal)
    if (isDigit(ch) || ch === '.') {
      let num = ch;
      i++;
      while (i < expr.length && (isDigit(expr[i]) || expr[i] === '.')) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }
    // Identifier (function name or constant)
    if (isLetter(ch)) {
      let name = ch;
      i++;
      while (i < expr.length && isLetter(expr[i])) {
        name += expr[i];
        i++;
      }
      if (name in FUNCTIONS) {
        tokens.push({ type: 'func', value: name });
      } else if (name in CONSTANTS) {
        tokens.push({ type: 'number', value: CONSTANTS[name] });
      } else {
        throw new Error('Unknown identifier: ' + name);
      }
      continue;
    }
    // Parentheses
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }
    // Operators
    if (ch in OPERATORS) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }
    throw new Error('Invalid character: ' + ch);
  }
  return tokens;
}

/**
 * Convert token list to Reverse Polish Notation using the shunting‑yard algorithm.
 * @param {Array} tokens
 * @returns {Array}
 */
function toRPN(tokens) {
  const output = [];
  const stack = [];
  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'func') {
      stack.push(token);
    } else if (token.type === 'operator') {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === 'operator' && (
          (OPERATORS[top.value].assoc === 'L' && OPERATORS[top.value].precedence >= OPERATORS[token.value].precedence) ||
          (OPERATORS[top.value].assoc === 'R' && OPERATORS[top.value].precedence > OPERATORS[token.value].precedence)
        )) {
          output.push(stack.pop());
        } else {
          break;
        }
      }
      stack.push(token);
    } else if (token.type === 'paren') {
      if (token.value === '(') {
        stack.push(token);
      } else {
        // token.value === ')'
        while (stack.length && stack[stack.length - 1].value !== '(') {
          output.push(stack.pop());
        }
        if (!stack.length) throw new Error('Mismatched parentheses');
        stack.pop(); // Remove '('
        if (stack.length && stack[stack.length - 1].type === 'func') {
          output.push(stack.pop());
        }
      }
    }
  }
  while (stack.length) {
    const top = stack.pop();
    if (top.type === 'paren') throw new Error('Mismatched parentheses');
    output.push(top);
  }
  return output;
}

/**
 * Evaluate an RPN token list and return the numeric result.
 * @param {Array} rpn
 * @returns {number}
 */
function evaluateRPN(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(token.value);
    } else if (token.type === 'operator') {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Insufficient values');
      const result = OPERATORS[token.value].func(a, b);
      stack.push(result);
    } else if (token.type === 'func') {
      const fn = FUNCTIONS[token.value];
      const argCount = fn.length; // Number of expected arguments
      const args = [];
      for (let i = 0; i < argCount; i++) {
        const val = stack.pop();
        if (val === undefined) throw new Error('Insufficient arguments for function');
        args.unshift(val);
      }
      const result = fn(...args);
      stack.push(result);
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

/**
 * High‑level helper that evaluates a raw expression string.
 * Returns either a numeric result or an error message string.
 * @param {string} expr
 * @returns {number|string}
 */
function evaluateExpression(expr) {
  try {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    const result = evaluateRPN(rpn);
    return result;
  } catch (e) {
    return 'Error: ' + e.message;
  }
}

// ====================
//  UI Interaction    
// ====================

const display = document.getElementById('display');
const buttons = document.querySelectorAll('button[data-token]');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    display.value += btn.getAttribute('data-token');
  });
});

document.getElementById('clear').addEventListener('click', () => {
  display.value = '';
});

document.getElementById('backspace').addEventListener('click', () => {
  display.value = display.value.slice(0, -1);
});

document.getElementById('equals').addEventListener('click', () => {
  const expr = display.value;
  const result = evaluateExpression(expr);
  display.value = result;
});

// Keyboard support

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (key === 'Enter') {
    e.preventDefault();
    document.getElementById('equals').click();
    return;
  }
  if (key === 'Backspace') {
    e.preventDefault();
    document.getElementById('backspace').click();
    return;
  }
  if (key.toLowerCase() === 'c') {
    e.preventDefault();
    document.getElementById('clear').click();
    return;
  }
  const allowed = '0123456789.+-*/^()';
  if (allowed.includes(key)) {
    display.value += key;
    return;
  }
  // Allow typing of function names (letters)
  if (/[a-zA-Z]/.test(key)) {
    display.value += key;
  }
});
