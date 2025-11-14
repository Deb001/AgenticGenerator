/**
 * Arithmetic expression evaluator using the Shunting‑Yard algorithm.
 * Supports +, -, *, /, parentheses and whitespace.
 * Returns a JavaScript number (integer or float).
 */

/**
 * Custom error type for runtime evaluation problems such as division by zero.
 */
class EvaluationError extends Error {
  /**
   * @param {string} message Human‑readable error description.
   */
  constructor(message) {
    super(message);
    this.name = 'EvaluationError';
    // Remove stack trace exposure for client safety.
    delete this.stack;
  }
}

/**
 * Operator precedence map.
 * Higher number means higher precedence.
 */
const PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2
};

/**
 * Determines if a token is an operator.
 * @param {string} token
 * @returns {boolean}
 */
function isOperator(token) {
  return Object.prototype.hasOwnProperty.call(PRECEDENCE, token);
}

/**
 * Applies an operator to two numeric operands.
 * @param {string} op
 * @param {number} a Left operand.
 * @param {number} b Right operand.
 * @returns {number}
 * @throws {EvaluationError} When division by zero occurs.
 */
function applyOperator(op, a, b) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) {
        throw new EvaluationError('Division by zero');
      }
      return a / b;
    default:
      // This should never happen because of prior validation.
      throw new EvaluationError(`Unsupported operator: ${op}`);
  }
}

/**
 * Converts an infix expression string to Reverse Polish Notation (RPN).
 * @param {string} expr Trimmed expression containing only valid characters.
 * @returns {Array<string>} Token array in RPN order.
 * @throws {SyntaxError} For malformed expressions.
 */
function infixToRPN(expr) {
  const outputQueue = [];
  const operatorStack = [];
  // Tokenize numbers (including decimals) and operators/parentheses.
  const tokenRegex = /\d+(?:\.\d+)?|[+\-*/()]|\s+/g;
  const tokens = expr.match(tokenRegex);
  if (!tokens) {
    throw new SyntaxError('Empty expression');
  }

  for (let rawToken of tokens) {
    const token = rawToken.trim();
    if (token === '') {
      continue; // skip whitespace
    }
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      // Number token
      outputQueue.push(token);
    } else if (isOperator(token)) {
      while (
        operatorStack.length > 0 &&
        isOperator(operatorStack[operatorStack.length - 1]) &&
        PRECEDENCE[operatorStack[operatorStack.length - 1]] >= PRECEDENCE[token]
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
        throw new SyntaxError('Mismatched parentheses');
      }
    } else {
      // Invalid token (should never happen due to validation).
      throw new SyntaxError(`Invalid token: ${token}`);
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      throw new SyntaxError('Mismatched parentheses');
    }
    outputQueue.push(op);
  }

  return outputQueue;
}

/**
 * Evaluates an RPN token array.
 * @param {Array<string>} rpnTokens
 * @returns {number}
 * @throws {EvaluationError|SyntaxError}
 */
function evaluateRPN(rpnTokens) {
  const stack = [];
  for (const token of rpnTokens) {
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      stack.push(parseFloat(token));
    } else if (isOperator(token)) {
      if (stack.length < 2) {
        throw new SyntaxError('Insufficient values in expression');
      }
      const b = stack.pop();
      const a = stack.pop();
      const result = applyOperator(token, a, b);
      stack.push(result);
    } else {
      throw new SyntaxError(`Invalid token in RPN: ${token}`);
    }
  }
  if (stack.length !== 1) {
    throw new SyntaxError('The user input has too many values');
  }
  return stack[0];
}

/**
 * Main exported function.
 * Validates, parses, and evaluates an arithmetic expression.
 * @param {string} expression The raw expression supplied by the client.
 * @returns {number} The computed numeric result.
 * @throws {SyntaxError} If the expression contains illegal characters or is malformed.
 * @throws {EvaluationError} For runtime errors such as division by zero.
 */
function evaluateExpression(expression) {
  if (typeof expression !== 'string') {
    throw new SyntaxError('Expression must be a string');
  }
  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    throw new SyntaxError('Expression cannot be empty');
  }
  // Allowed characters: digits, whitespace, parentheses, + - * /
  const validPattern = /^[0-9+\-*/().\s]+$/;
  if (!validPattern.test(trimmed)) {
    throw new SyntaxError('Expression contains invalid characters');
  }

  const rpn = infixToRPN(trimmed);
  const result = evaluateRPN(rpn);
  return result;
}

module.exports = {
  evaluateExpression,
  EvaluationError
};