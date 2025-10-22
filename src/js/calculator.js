/**
 * Arithmetic expression evaluator.
 * Exposes a single pure function `evaluate(expression)` that returns
 * { result: number | null, error: string | null }.
 *
 * The implementation uses:
 *  - tokenize()   – split the raw string into tokens.
 *  - toRPN()      – shunting‑yard algorithm (handles unary minus).
 *  - computeRPN() – stack evaluation of Reverse Polish Notation.
 */

const OP_PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  'u-': 3, // unary minus
};

const LEFT_ASSOC = new Set(['+', '-', '*', '/']);
const RIGHT_ASSOC = new Set(['u-']);

/**
 * Split the expression into tokens.
 * @param {string} expr
 * @returns {Array<{type:string,value:string}>}
 * @throws {SyntaxError}
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  const len = expr.length;

  while (i < len) {
    const ch = expr[i];

    // whitespace – ignore
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // number (integer or decimal)
    if (/\d/.test(ch) || ch === '.') {
      let num = '';
      let dotCount = 0;
      while (i < len && (/\d/.test(expr[i]) || expr[i] === '.')) {
        if (expr[i] === '.') {
          dotCount++;
          if (dotCount > 1) {
            throw new SyntaxError('Invalid number format: multiple decimal points');
          }
        }
        num += expr[i];
        i++;
      }
      if (num === '.' || num === '') {
        throw new SyntaxError('Invalid number format');
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // operators
    if (/[+\-*/]/.test(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // parentheses
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }

    // unknown character
    throw new SyntaxError(`Unexpected character '${ch}'`);
  }

  return tokens;
}

/**
 * Convert token list to Reverse Polish Notation using the shunting‑yard algorithm.
 * Handles unary minus by converting it to a distinct operator 'u-'.
 * @param {Array<{type:string,value:string}>} tokens
 * @returns {Array<{type:string,value:string}>}
 * @throws {SyntaxError}
 */
function toRPN(tokens) {
  const output = [];
  const opStack = [];

  const isUnaryMinus = (token, prevToken) => {
    if (token.type !== 'operator' || token.value !== '-') return false;
    // unary if at start or after another operator or left parenthesis
    return (
      !prevToken ||
      (prevToken.type === 'operator' && prevToken.value !== ')') ||
      (prevToken.type === 'paren' && prevToken.value === '(')
    );
  };

  let prev = null;
  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'operator') {
      const opToken = { ...token };
      if (isUnaryMinus(token, prev)) {
        opToken.value = 'u-';
      }

      const prec = OP_PRECEDENCE[opToken.value];
      const assoc = RIGHT_ASSOC.has(opToken.value) ? 'right' : 'left';

      while (opStack.length) {
        const top = opStack[opStack.length - 1];
        if (top.type !== 'operator') break;
        const topPrec = OP_PRECEDENCE[top.value];
        if (
          (assoc === 'left' && prec <= topPrec) ||
          (assoc === 'right' && prec < topPrec)
        ) {
          output.push(opStack.pop());
        } else {
          break;
        }
      }
      opStack.push(opToken);
    } else if (token.type === 'paren') {
      if (token.value === '(') {
        opStack.push(token);
      } else {
        // token is ')'
        let foundLeft = false;
        while (opStack.length) {
          const top = opStack.pop();
          if (top.type === 'paren' && top.value === '(') {
            foundLeft = true;
            break;
          }
          output.push(top);
        }
        if (!foundLeft) {
          throw new SyntaxError('Mismatched parentheses');
        }
      }
    } else {
      throw new SyntaxError('Unknown token type');
    }
    prev = token;
  }

  // Drain remaining operators
  while (opStack.length) {
    const top = opStack.pop();
    if (top.type === 'paren') {
      throw new SyntaxError('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

/**
 * Evaluate an RPN token list.
 * @param {Array<{type:string,value:string}>} rpnTokens
 * @returns {number}
 * @throws {Error} Runtime errors (e.g., division by zero, malformed expression)
 */
function computeRPN(rpnTokens) {
  const stack = [];

  for (const token of rpnTokens) {
    if (token.type === 'number') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'operator') {
      if (token.value === 'u-') {
        if (stack.length < 1) {
          throw new Error('Malformed expression');
        }
        const a = stack.pop();
        stack.push(-a);
      } else {
        if (stack.length < 2) {
          throw new Error('Malformed expression');
        }
        const b = stack.pop();
        const a = stack.pop();
        let res;
        switch (token.value) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (b === 0) {
              throw new Error('Division by zero');
            }
            res = a / b;
            break;
          default:
            throw new Error(`Unsupported operator '${token.value}'`);
        }
        stack.push(res);
      }
    } else {
      throw new Error('Invalid token in RPN');
    }
  }

  if (stack.length !== 1) {
    throw new Error('Malformed expression');
  }
  return stack[0];
}

/**
 * Public API – evaluate an infix arithmetic expression.
 * @param {string} expression
 * @returns {{result:number|null,error:string|null}}
 */
function evaluate(expression) {
  try {
    const tokens = tokenize(expression);
    const rpn = toRPN(tokens);
    const result = computeRPN(rpn);
    return { result, error: null };
  } catch (e) {
    // Distinguish syntax from runtime errors by message content
    const errMsg = e instanceof SyntaxError ? `Syntax error: ${e.message}` : `Runtime error: ${e.message}`;
    return { result: null, error: errMsg };
  }
}

// Export for environments that support modules (e.g., tests, UI)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { evaluate, tokenize, toRPN, computeRPN };
}