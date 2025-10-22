/* calculator.js - Core arithmetic and expression evaluation module */

/**
 * Returns the sum of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}

/**
 * Returns the difference of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function subtract(a, b) {
  return a - b;
}

/**
 * Returns the product of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Returns the quotient of two numbers, or the string 'Error' on division by zero.
 * @param {number} a
 * @param {number} b
 * @returns {number|string}
 */
function divide(a, b) {
  if (b === 0) {
    return 'Error';
  }
  return a / b;
}

/**
 * Evaluates a simple arithmetic expression containing numbers and the operators
 * +, -, *, /. Operator precedence is respected (* and / before + and -).
 * Returns the numeric result as a string, or 'Error' on divide‑by‑zero or malformed input.
 *
 * @param {string} expression
 * @returns {string}
 */
function evaluate(expression) {
  if (typeof expression !== 'string') {
    return 'Error';
  }

  // Remove whitespace
  const cleaned = expression.replace(/\s+/g, '');
  if (cleaned === '') {
    return 'Error';
  }

  // Tokenize numbers (including decimals) and operators
  const tokenRegex = /(\d+\.?\d*|\.\d+|[+\-*/])/g;
  const rawTokens = cleaned.match(tokenRegex);
  if (!rawTokens) {
    return 'Error';
  }

  // Basic validation: expression must start with a number and alternate operator/number
  const numberPattern = /^\d+\.?\d*$|^\.\d+$/;
  if (!numberPattern.test(rawTokens[0])) {
    return 'Error';
  }
  for (let i = 1; i < rawTokens.length; i++) {
    const expectNumber = i % 2 === 0;
    const token = rawTokens[i];
    if (expectNumber) {
      if (!numberPattern.test(token)) {
        return 'Error';
      }
    } else {
      if (!/^[+\-*/]$/.test(token)) {
        return 'Error';
      }
    }
  }

  // First pass: resolve * and /
  let tokens = rawTokens.slice();
  let i = 0;
  while (i < tokens.length) {
    const op = tokens[i];
    if (op === '*' || op === '/') {
      const left = parseFloat(tokens[i - 1]);
      const right = parseFloat(tokens[i + 1]);
      let interim;
      if (op === '*') {
        interim = multiply(left, right);
      } else {
        const divResult = divide(left, right);
        if (divResult === 'Error') {
          return 'Error';
        }
        interim = divResult;
      }
      // Replace the three tokens (left op right) with the computed result
      tokens.splice(i - 1, 3, interim.toString());
      // Step back to re‑evaluate in case of consecutive */ operators
      i = i - 1;
    } else {
      i++;
    }
  }

  // Second pass: resolve + and -
  let result = parseFloat(tokens[0]);
  i = 1;
  while (i < tokens.length) {
    const op = tokens[i];
    const num = parseFloat(tokens[i + 1]);
    if (op === '+') {
      result = add(result, num);
    } else if (op === '-') {
      result = subtract(result, num);
    } else {
      // Unexpected operator (should not happen after first pass)
      return 'Error';
    }
    i += 2;
  }

  // Round to a reasonable precision (12 decimal places) to avoid floating‑point artifacts
  const rounded = Number.isInteger(result) ? result : parseFloat(result.toFixed(12));
  return rounded.toString();
}

// Expose the API globally as required by the project
window.Calculator = {
  add,
  subtract,
  multiply,
  divide,
  evaluate,
};