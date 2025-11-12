/*
 * Safe arithmetic expression evaluator
 * Implements tokenization, conversion to Reverse Polish Notation (RPN) using the
 * Shunting‑Yard algorithm, and evaluation of the RPN expression.
 * All errors are thrown as EvaluationError with specific numeric codes.
 */

/**
 * Custom error class for evaluation problems.
 * @extends Error
 */
export class EvaluationError extends Error {
  /**
   * Creates a new EvaluationError.
   * @param {string} message - Human readable description.
   * @param {number} code - Numeric identifier for the error type.
   */
  constructor(message, code) {
    super(message);
    this.name = 'EvaluationError';
    this.code = code;
    // Maintains proper stack trace (only on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EvaluationError);
    }
  }
}

/**
 * Tokenizes a raw arithmetic expression string.
 * Supports numbers (integers and decimals), parentheses, and the operators + - * /.
 * Handles whitespace and distinguishes unary minus.
 * @param {string} expr - The raw expression.
 * @returns {string[]} Array of token strings.
 * @throws {EvaluationError} If an invalid character is encountered.
 */
export function tokenize(expr) {
  const tokens = [];
  const length = expr.length;
  let i = 0;

  const isOperator = (ch) => '+-*/'.includes(ch);
  const isDigitOrDot = (ch) => /[0-9.]/.test(ch);

  while (i < length) {
    const ch = expr[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including leading dot)
    if (isDigitOrDot(ch)) {
      let start = i;
      let dotCount = 0;
      while (i < length && isDigitOrDot(expr[i])) {
        if (expr[i] === '.') dotCount++;
        i++;
      }
      if (dotCount > 1) {
        throw new EvaluationError('Invalid numeric format', 1004);
      }
      tokens.push(expr.slice(start, i));
      continue;
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      tokens.push(ch);
      i++;
      continue;
    }

    // Operators
    if (isOperator(ch)) {
      // Determine if this is a unary minus
      if (ch === '-') {
        const prevToken = tokens[tokens.length - 1];
        const isUnary =
          !prevToken ||
          prevToken === '(' ||
          isOperator(prevToken);
        if (isUnary) {
          // Look ahead to the next non‑whitespace character
          let j = i + 1;
          while (j < length && /\s/.test(expr[j])) j++;
          const nextChar = expr[j];
          if (nextChar === '(') {
            // Transform "-(" into "-1 * ("
            tokens.push('-1');
            tokens.push('*');
            i = j; // will push '(' in next iteration
            continue;
          }
          if (nextChar && isDigitOrDot(nextChar)) {
            // Parse the number after the unary minus
            let numStart = j;
            let dotCount = 0;
            while (j < length && isDigitOrDot(expr[j])) {
              if (expr[j] === '.') dotCount++;
              j++;
            }
            if (dotCount > 1) {
              throw new EvaluationError('Invalid numeric format', 1004);
            }
            const number = '-' + expr.slice(numStart, j);
            tokens.push(number);
            i = j;
            continue;
          }
          // Unary minus not followed by a number or '(' – treat as binary minus
        }
      }
      // Regular binary operator
      tokens.push(ch);
      i++;
      continue;
    }

    // If we reach here, character is invalid
    throw new EvaluationError(`Invalid character '${ch}'`, 1001);
  }

  return tokens;
}

/**
 * Converts an array of tokens from infix notation to Reverse Polish Notation.
 * Implements the Shunting‑Yard algorithm.
 * @param {string[]} tokens - Token list produced by {@link tokenize}.
 * @returns {string[]} RPN token list.
 * @throws {EvaluationError} If parentheses are mismatched.
 */
export function toRPN(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const associativity = { '+': 'L', '-': 'L', '*': 'L', '/': 'L' };

  const isOperator = (t) => Object.prototype.hasOwnProperty.call(precedence, t);

  for (const token of tokens) {
    if (/^-?\d*\.?\d+$/.test(token)) {
      // Number
      outputQueue.push(token);
    } else if (isOperator(token)) {
      while (
        operatorStack.length > 0 &&
        isOperator(operatorStack[operatorStack.length - 1]) &&
        ((associativity[token] === 'L' && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
          (associativity[token] === 'R' && precedence[token] < precedence[operatorStack[operatorStack.length - 1]]))
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      let foundLeftParen = false;
      while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op === '(') {
          foundLeftParen = true;
          break;
        }
        outputQueue.push(op);
      }
      if (!foundLeftParen) {
        throw new EvaluationError('Mismatched parentheses', 1002);
      }
    } else {
      // Should never happen because tokenizer validates tokens
      throw new EvaluationError(`Unexpected token '${token}'`, 1004);
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      throw new EvaluationError('Mismatched parentheses', 1002);
    }
    outputQueue.push(op);
  }

  return outputQueue;
}

/**
 * Evaluates a token list in Reverse Polish Notation.
 * @param {string[]} rpn - RPN token list.
 * @returns {number} Computed result.
 * @throws {EvaluationError} For division by zero or malformed expressions.
 */
export function evaluateRPN(rpn) {
  const stack = [];

  for (const token of rpn) {
    if (/^-?\d*\.?\d+$/.test(token)) {
      stack.push(parseFloat(token));
    } else {
      // Operator – need two operands
      if (stack.length < 2) {
        throw new EvaluationError('Syntax error: insufficient values', 1004);
      }
      const b = stack.pop();
      const a = stack.pop();
      let result;
      switch (token) {
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
            throw new EvaluationError('Division by zero', 1003);
          }
          result = a / b;
          break;
        default:
          throw new EvaluationError(`Unknown operator '${token}'`, 1004);
      }
      stack.push(result);
    }
  }

  if (stack.length !== 1) {
    throw new EvaluationError('Syntax error: too many values', 1004);
  }

  return stack[0];
}

/**
 * Public API – evaluates an arithmetic expression safely.
 * @param {string} expr - Raw expression string.
 * @returns {number} Result of the evaluation.
 * @throws {EvaluationError} With specific codes for different failure modes.
 */
export function evaluateExpression(expr) {
  try {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    const result = evaluateRPN(rpn);
    return result;
  } catch (err) {
    if (err instanceof EvaluationError) {
      // Propagate known evaluation errors unchanged
      throw err;
    }
    // Wrap any unexpected error as a generic syntax error
    throw new EvaluationError(err.message || 'Syntax error', 1004);
  }
}
