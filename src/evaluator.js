/**
 * Evaluates a simple arithmetic expression.
 *
 * Supported tokens:
 *   - Numbers (integer or decimal)
 *   - Binary operators: + - * /
 *   - Parentheses: ( )
 *
 * The implementation uses the shunting‑yard algorithm to convert the
 * infix expression to Reverse Polish Notation (RPN) and then evaluates
 * the RPN stack.
 *
 * @param {string} expression - The arithmetic expression to evaluate.
 * @returns {number} The numeric result of the expression.
 * @throws {Error} If the expression is empty, contains invalid tokens,
 *                 has mismatched parentheses, or attempts division by zero.
 */
export function evaluate(expression) {
  // ---------- 1. Basic validation ----------
  if (typeof expression !== 'string') {
    throw new Error('Expression must be a string');
  }
  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    throw new Error('Empty expression');
  }

  // ---------- 2. Tokenization ----------
  const tokens = [];
  const len = trimmed.length;
  let i = 0;

  const isDigit = (ch) => ch >= '0' && ch <= '9';
  const isWhitespace = (ch) => /\s/.test(ch);

  while (i < len) {
    const ch = trimmed[i];

    if (isWhitespace(ch)) {
      i++;
      continue;
    }

    // Number (integer or decimal)
    if (isDigit(ch) || ch === '.') {
      let numStr = '';
      let dotCount = 0;
      while (i < len && (isDigit(trimmed[i]) || trimmed[i] === '.')) {
        if (trimmed[i] === '.') {
          dotCount++;
          if (dotCount > 1) break; // stop at second dot – will be caught later as invalid token
        }
        numStr += trimmed[i];
        i++;
      }
      if (numStr === '.' || numStr === '' || numStr === '-') {
        throw new Error('Invalid token');
      }
      tokens.push(numStr);
      continue;
    }

    // Operators and parentheses
    if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    // Anything else is invalid
    throw new Error('Invalid token');
  }

  // ---------- 3. Shunting‑yard to RPN ----------
  const outputQueue = [];
  const operatorStack = [];

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };

  const isOperator = (t) => '+-*/'.includes(t);
  const leftAssociative = {
    '+': true,
    '-': true,
    '*': true,
    '/': true,
  };

  for (const token of tokens) {
    if (!isNaN(token)) {
      // Number
      outputQueue.push(token);
    } else if (isOperator(token)) {
      while (
        operatorStack.length &&
        isOperator(operatorStack[operatorStack.length - 1]) &&
        ((precedence[operatorStack[operatorStack.length - 1]] > precedence[token]) ||
          (precedence[operatorStack[operatorStack.length - 1]] === precedence[token] &&
            leftAssociative[token]))
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      let foundLeftParen = false;
      while (operatorStack.length) {
        const op = operatorStack.pop();
        if (op === '(') {
          foundLeftParen = true;
          break;
        }
        outputQueue.push(op);
      }
      if (!foundLeftParen) {
        throw new Error('Mismatched parentheses');
      }
    } else {
      // Should never happen because of tokenization guard
      throw new Error('Invalid token');
    }
  }

  while (operatorStack.length) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      throw new Error('Mismatched parentheses');
    }
    outputQueue.push(op);
  }

  // ---------- 4. Evaluate RPN ----------
  const rpnStack = [];

  for (const token of outputQueue) {
    if (!isNaN(token)) {
      rpnStack.push(parseFloat(token));
    } else if (isOperator(token)) {
      if (rpnStack.length < 2) {
        throw new Error('Invalid expression');
      }
      const b = rpnStack.pop();
      const a = rpnStack.pop();
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
            throw new Error('Division by zero');
          }
          result = a / b;
          break;
        default:
          throw new Error('Invalid token');
      }
      rpnStack.push(result);
    } else {
      throw new Error('Invalid token');
    }
  }

  if (rpnStack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return rpnStack[0];
}