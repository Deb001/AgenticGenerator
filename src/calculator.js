// src/calculator.js

/**
 * Normalizes the expression and splits it into numbers and operators.
 * Supports decimal numbers and the UI symbols × (multiply) and ÷ (divide).
 *
 * @param {string} expr - Raw arithmetic expression.
 * @returns {string[]} Array of tokens (numbers as strings, operators as single chars).
 * @throws {Error} 'Invalid token' for any unexpected character or malformed number.
 */
export function tokenize(expr) {
  // Remove whitespace and normalize UI operators
  const normalized = expr
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  const tokens = [];
  let numberBuffer = '';

  const isOperator = (c) => '+-*/'.includes(c);

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];

    if (/[0-9.]/.test(ch)) {
      numberBuffer += ch;
    } else if (isOperator(ch)) {
      // Flush any pending number
      if (numberBuffer) {
        tokens.push(numberBuffer);
        numberBuffer = '';
      }

      // Handle unary minus (e.g., "-5" or "3*-2")
      if (ch === '-' && (i === 0 || isOperator(normalized[i - 1]))) {
        numberBuffer = '-';
      } else {
        tokens.push(ch);
      }
    } else {
      throw new Error('Invalid token');
    }
  }

  if (numberBuffer) {
    tokens.push(numberBuffer);
  }

  // Validate numeric tokens
  for (const t of tokens) {
    if (!isOperator(t)) {
      if (!/^[-+]?\d*\.?\d+$/.test(t)) {
        throw new Error('Invalid token');
      }
    }
  }

  return tokens;
}

/**
 * Executes a single arithmetic operation.
 *
 * @param {number} a - Left operand.
 * @param {number} b - Right operand.
 * @param {string} op - Operator ('+', '-', '*', '/').
 * @returns {number} Result of the operation.
 * @throws {Error} 'Division by zero' when dividing by zero.
 * @throws {Error} 'Number out of range' when result exceeds allowed magnitude.
 */
export function applyOperator(a, b, op) {
  let result;
  switch (op) {
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
      if (b === 0) throw new Error('Division by zero');
      result = a / b;
      break;
    default:
      throw new Error('Invalid token');
  }

  if (Math.abs(result) > 1e12) {
    throw new Error('Number out of range');
  }
  return result;
}

/**
 * Evaluates a simple arithmetic expression containing numbers,
 * +, -, *, / and decimal points.
 *
 * @param {string} expression - The arithmetic expression to evaluate.
 * @returns {number} Rounded result (8 decimal places).
 * @throws {Error} 'Division by zero', 'Invalid token', or 'Number out of range'.
 */
export function evaluateExpression(expression) {
  const tokens = tokenize(expression);
  if (tokens.length === 0) {
    throw new Error('Invalid token');
  }

  // First pass: resolve * and /
  const firstPass = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '*' || token === '/') {
      const left = firstPass.pop();
      const right = parseFloat(tokens[++i]);
      const res = applyOperator(left, right, token);
      firstPass.push(res);
    } else if (token === '+' || token === '-') {
      firstPass.push(token);
    } else {
      // number token
      firstPass.push(parseFloat(token));
    }
  }

  // Second pass: resolve + and -
  let result = firstPass[0];
  for (let i = 1; i < firstPass.length; i += 2) {
    const op = firstPass[i];
    const next = firstPass[i + 1];
    result = applyOperator(result, next, op);
  }

  // Round to 8 decimal places
  const rounded = Math.round(result * 1e8) / 1e8;

  if (Math.abs(rounded) > 1e12) {
    throw new Error('Number out of range');
  }

  return rounded;
}