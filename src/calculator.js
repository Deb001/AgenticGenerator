/**
 * Evaluates a simple arithmetic expression containing +, -, *, / and parentheses.
 * The implementation uses the Shunting‑Yard algorithm to convert the infix expression
 * to Reverse Polish Notation (RPN) and then evaluates the RPN.
 *
 * @param {string} expression The arithmetic expression to evaluate.
 * @returns {number} The numeric result of the expression.
 * @throws {SyntaxError} If the expression contains invalid characters, mismatched
 *   parentheses, division by zero, or cannot be parsed.
 */
export function evaluateExpression(expression) {
  if (typeof expression !== 'string') {
    throw new SyntaxError('Expression must be a string');
  }

  // Trim whitespace.
  const trimmed = expression.replace(/\s+/g, '');
  if (trimmed.length === 0) {
    throw new SyntaxError('Empty expression');
  }

  // Tokenize: numbers (including decimal), operators, parentheses.
  const tokenRegex = /([0-9]*\.?[0-9]+|[+\-*/()])/g;
  const tokens = [];
  let match;
  let lastIndex = 0;
  while ((match = tokenRegex.exec(trimmed)) !== null) {
    if (match.index !== lastIndex) {
      // There is an unexpected character between recognized tokens.
      throw new SyntaxError(`Invalid character at position ${lastIndex}`);
    }
    tokens.push(match[0]);
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex !== trimmed.length) {
    throw new SyntaxError(`Invalid character at position ${lastIndex}`);
  }

  // Operator precedence and associativity.
  const operatorInfo = new Map([
    ['+', { precedence: 2, associativity: 'left' }],
    ['-', { precedence: 2, associativity: 'left' }],
    ['*', { precedence: 3, associativity: 'left' }],
    ['/', { precedence: 3, associativity: 'left' }]
  ]);

  /** @type {string[]} */
  const outputQueue = [];
  /** @type {string[]} */
  const operatorStack = [];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      // Token is a number.
      outputQueue.push(token);
    } else if (operatorInfo.has(token)) {
      const o1 = token;
      while (operatorStack.length > 0) {
        const o2 = operatorStack[operatorStack.length - 1];
        if (!operatorInfo.has(o2)) break; // o2 is '('.
        const { precedence: p1, associativity: a1 } = operatorInfo.get(o1);
        const { precedence: p2 } = operatorInfo.get(o2);
        if ((a1 === 'left' && p1 <= p2) || (a1 === 'right' && p1 < p2)) {
          outputQueue.push(operatorStack.pop());
        } else {
          break;
        }
      }
      operatorStack.push(o1);
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
      throw new SyntaxError(`Unknown token: ${token}`);
    }
  }

  // Drain remaining operators.
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      throw new SyntaxError('Mismatched parentheses');
    }
    outputQueue.push(op);
  }

  // Evaluate RPN.
  /** @type {number[]} */
  const operandStack = [];
  for (const token of outputQueue) {
    if (!isNaN(Number(token))) {
      operandStack.push(Number(token));
    } else if (operatorInfo.has(token)) {
      if (operandStack.length < 2) {
        throw new SyntaxError('Insufficient values in expression');
      }
      const b = operandStack.pop();
      const a = operandStack.pop();
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
            throw new SyntaxError('Division by zero');
          }
          result = a / b;
          break;
        default:
          throw new SyntaxError(`Unsupported operator: ${token}`);
      }
      operandStack.push(result);
    } else {
      throw new SyntaxError(`Invalid token in RPN: ${token}`);
    }
  }

  if (operandStack.length !== 1) {
    throw new SyntaxError('The user input has too many values');
  }

  return operandStack[0];
}
