'use strict';

/**
 * Validate that a value is a finite number.
 * @param {*} value - The value to validate.
 * @param {string} name - Parameter name for error messages.
 * @throws {TypeError} If the value is not a finite number.
 */
function _assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

/**
 * Returns the sum of a and b after validating both are finite numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {TypeError}
 */
export function add(a, b) {
  _assertFiniteNumber(a, 'a');
  _assertFiniteNumber(b, 'b');
  return a + b;
}

/**
 * Returns the difference a - b with validation.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {TypeError}
 */
export function subtract(a, b) {
  _assertFiniteNumber(a, 'a');
  _assertFiniteNumber(b, 'b');
  return a - b;
}

/**
 * Returns the product of a and b with validation.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {TypeError}
 */
export function multiply(a, b) {
  _assertFiniteNumber(a, 'a');
  _assertFiniteNumber(b, 'b');
  return a * b;
}

/**
 * Returns a / b; throws an Error if b is zero or inputs are invalid.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {TypeError}
 * @throws {RangeError}
 */
export function divide(a, b) {
  _assertFiniteNumber(a, 'a');
  _assertFiniteNumber(b, 'b');
  if (b === 0) {
    throw new RangeError('Division by zero');
  }
  return a / b;
}

/**
 * Parses a simple infix expression containing two operands and one operator (+, -, *, /).
 * Uses the above functions and returns the result or throws descriptive errors.
 * @param {string} expr - Expression string, e.g., "3 + 4".
 * @returns {number}
 * @throws {SyntaxError} If the expression format is invalid.
 * @throws {TypeError|RangeError} Propagated from arithmetic functions.
 */
export function evaluateExpression(expr) {
  if (typeof expr !== 'string') {
    throw new TypeError('Expression must be a string');
  }

  const trimmed = expr.trim();

  // Regex captures: operand1, operator, operand2
  const regex = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)[\s]*([\+\-\*\/])[\s]*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)$/;
  const match = trimmed.match(regex);

  if (!match) {
    throw new SyntaxError('Malformed expression. Expected format: "<number> <operator> <number>"');
  }

  const [, leftStr, operator, rightStr] = match;
  const left = Number(leftStr);
  const right = Number(rightStr);

  // The arithmetic functions will perform their own validation.
  switch (operator) {
    case '+':
      return add(left, right);
    case '-':
      return subtract(left, right);
    case '*':
      return multiply(left, right);
    case '/':
      return divide(left, right);
    default:
      // This should never happen due to the regex, but guard anyway.
      throw new SyntaxError(`Unsupported operator "${operator}"`);
  }
}