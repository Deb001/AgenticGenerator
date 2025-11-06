// calculator.js
// Pure arithmetic functions with validation and error handling.

/**
 * Validates that the provided value is a finite number.
 * @param {*} value - The value to validate.
 * @throws {Error} Throws if the value is not a finite number.
 */
function validateNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error('Error: Non-numeric input');
  }
}

/**
 * Returns the sum of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  validateNumber(a);
  validateNumber(b);
  return a + b;
}

/**
 * Returns the difference of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function subtract(a, b) {
  validateNumber(a);
  validateNumber(b);
  return a - b;
}

/**
 * Returns the product of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function multiply(a, b) {
  validateNumber(a);
  validateNumber(b);
  return a * b;
}

/**
 * Returns the quotient of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {Error} If b is zero.
 */
function divide(a, b) {
  validateNumber(a);
  validateNumber(b);
  if (b === 0) {
    throw new Error('Error: Division by zero');
  }
  return a / b;
}

// Export functions to the global scope for use by HTML pages.
window.add = add;
window.subtract = subtract;
window.multiply = multiply;
window.divide = divide;
