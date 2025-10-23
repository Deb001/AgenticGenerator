/**
 * @typedef {'number'|'operator'|'paren'} TokenType
 * @typedef {{type: TokenType, value: string}} Token
 */

const OP_PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
};

/**
 * Scans the input string and returns an ordered list of tokens
 * (numbers, operators, parentheses). Throws SyntaxError on invalid characters.
 *
 * @param {string} expression
 * @returns {Token[]}
 */
function tokenize(expression) {
  const tokens = [];
  let i = 0;
  const len = expression.length;

  while (i < len) {
    const ch = expression[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including decimal)
    if (/\d/.test(ch) || ch === '.') {
      let numStr = '';
      let dotCount = 0;

      while (i < len && (/\d/.test(expression[i]) || expression[i] === '.')) {
        if (expression[i] === '.') {
          dotCount++;
          if (dotCount > 1) {
            throw new SyntaxError('Invalid number format');
          }
        }
        numStr += expression[i];
        i++;
      }

      // Edge case: just a dot without digits
      if (numStr === '.' || numStr === '') {
        throw new SyntaxError('Invalid number format');
      }

      tokens.push({ type: 'number', value: numStr });
      continue;
    }

    // Operators
    if (/[+\-*/]/.test(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }

    // Anything else is invalid
    throw new SyntaxError(`Invalid character '${ch}'`);
  }

  return tokens;
}

/**
 * Converts infix token list to Reverse Polish Notation using the shunting‑yard algorithm.
 * Handles operator precedence and left‑associativity. Throws SyntaxError for mismatched parentheses.
 *
 * @param {Token[]} tokens
 * @returns {Token[]}
 */
function shuntingYard(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      outputQueue.push(token);
    } else if (token.type === 'operator') {
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1].type === 'operator' &&
        ((OP_PRECEDENCE[operatorStack[operatorStack.length - 1].value] >
          OP_PRECEDENCE[token.value]) ||
          (OP_PRECEDENCE[operatorStack[operatorStack.length - 1].value] ===
            OP_PRECEDENCE[token.value] &&
            true)) // left‑associative
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token.type === 'paren') {
      if (token.value === '(') {
        operatorStack.push(token);
      } else {
        // token.value === ')'
        let foundLeftParen = false;
        while (operatorStack.length) {
          const top = operatorStack.pop();
          if (top.type === 'paren' && top.value === '(') {
            foundLeftParen = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!foundLeftParen) {
          throw new SyntaxError('Mismatched parentheses');
        }
      }
    }
  }

  while (operatorStack.length) {
    const top = operatorStack.pop();
    if (top.type === 'paren') {
      throw new SyntaxError('Mismatched parentheses');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Evaluates the RPN token queue using a stack.
 * Performs safe arithmetic; throws Error on division by zero.
 *
 * @param {Token[]} rpnQueue
 * @returns {number}
 */
function evaluateRPN(rpnQueue) {
  const stack = [];

  for (const token of rpnQueue) {
    if (token.type === 'number') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'operator') {
      if (stack.length < 2) {
        throw new SyntaxError('Malformed expression');
      }
      const b = stack.pop();
      const a = stack.pop();
      let result;

      switch (token.value) {
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
          throw new SyntaxError(`Unknown operator '${token.value}'`);
      }
      stack.push(result);
    }
  }

  if (stack.length !== 1) {
    throw new SyntaxError('Malformed expression');
  }

  return stack[0];
}

/**
 * Public API: tokenizes the expression, converts to RPN, evaluates,
 * and returns the numeric result. Catches internal errors and re‑throws
 * as generic Error with message "Error" for UI consumption.
 *
 * @param {string} expression
 * @returns {number}
 */
export function calculate(expression) {
  try {
    const tokens = tokenize(expression);
    const rpn = shuntingYard(tokens);
    return evaluateRPN(rpn);
  } catch (e) {
    if (e instanceof Error && e.message === 'Division by zero') {
      throw e;
    }
    throw new Error('Error');
  }
}