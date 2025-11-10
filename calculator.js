// calculator.js – Pure arithmetic evaluator (ES module)

/**
 * Custom error type for calculator evaluation problems.
 */
export class CalculatorError extends Error {
  /**
   * @param {string} message Human‑readable error description.
   */
  constructor(message) {
    super(message);
    this.name = 'CalculatorError';
  }
}

/** Operator precedence map */
const OperatorPrecedence = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2
};

/**
 * Tokenizes an arithmetic expression into numbers and operators.
 * @param {string} expr Sanitized expression string.
 * @returns {Array<string|number>} Token array.
 * @throws {CalculatorError} If an unknown character is encountered.
 */
function _tokenize(expr) {
  const tokens = [];
  let numberBuffer = '';
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (/[0-9.]/.test(ch)) {
      numberBuffer += ch;
    } else if (/[+\-*/]/.test(ch)) {
      if (numberBuffer.length > 0) {
        tokens.push(parseFloat(numberBuffer));
        numberBuffer = '';
      }
      tokens.push(ch);
    } else {
      throw new CalculatorError(`Invalid character '${ch}' in expression.`);
    }
  }
  if (numberBuffer.length > 0) {
    tokens.push(parseFloat(numberBuffer));
  }
  return tokens;
}

/**
 * Converts an infix token array to Reverse Polish Notation using the Shunting‑Yard algorithm.
 * @param {Array<string|number>} tokens Infix tokens.
 * @returns {Array<string|number>} RPN token array.
 */
function _shuntingYard(tokens) {
  const outputQueue = [];
  const operatorStack = [];
  for (const token of tokens) {
    if (typeof token === 'number') {
      outputQueue.push(token);
    } else if (/[+\-*/]/.test(token)) {
      while (
        operatorStack.length > 0 &&
        /[+\-*/]/.test(operatorStack[operatorStack.length - 1]) &&
        OperatorPrecedence[operatorStack[operatorStack.length - 1]] >= OperatorPrecedence[token]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    }
  }
  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }
  return outputQueue;
}

/**
 * Evaluates a RPN token array.
 * @param {Array<string|number>} rpnTokens Tokens in RPN order.
 * @returns {number} Computed result.
 * @throws {CalculatorError} On division by zero or malformed expression.
 */
function _evaluateRPN(rpnTokens) {
  const stack = [];
  for (const token of rpnTokens) {
    if (typeof token === 'number') {
      stack.push(token);
    } else {
      if (stack.length < 2) {
        throw new CalculatorError('Malformed expression.');
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
            throw new CalculatorError('Cannot divide by zero');
          }
          result = a / b;
          break;
        default:
          throw new CalculatorError(`Unsupported operator '${token}'.`);
      }
      stack.push(result);
    }
  }
  if (stack.length !== 1) {
    throw new CalculatorError('Malformed expression after evaluation.');
  }
  return stack[0];
}

/**
 * Public API – evaluates a sanitized arithmetic expression.
 * @param {string} expression Arithmetic expression (e.g., "12.5+3*2").
 * @returns {number|string} Result of evaluation or error message string.
 */
export function evaluate(expression) {
  if (typeof expression !== 'string') {
    return 'Expression must be a string.';
  }
  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    return 'Empty expression.';
  }
  // Allow only digits, decimal point, and basic operators.
  const validPattern = /^[0-9.+\-*/]+$/;
  if (!validPattern.test(trimmed)) {
    return 'Invalid characters in expression.';
  }
  try {
    const tokens = _tokenize(trimmed);
    const rpn = _shuntingYard(tokens);
    const result = _evaluateRPN(rpn);
    // Round to 12 decimal places to avoid floating‑point noise.
    return parseFloat(result.toFixed(12));
  } catch (e) {
    if (e instanceof CalculatorError) {
      return e.message;
    }
    // Unexpected error – rethrow for visibility in development.
    throw e;
  }
}
