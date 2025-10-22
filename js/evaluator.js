/* js/evaluator.js
 *
 * A self‑contained arithmetic expression evaluator.
 * Exposes: window.evaluator.evaluate(expression)
 *
 * Supported:
 *   - Operators: + - * /
 *   - Parentheses
 *   - Floating point numbers
 *   - Unary minus (handled as binary minus with an implicit 0)
 *
 * Errors are returned as descriptive strings.
 */

(() => {
  // Operator precedence (higher number = higher precedence)
  const PRECEDENCE = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };

  // ---------- Tokenizer ----------
  function tokenize(expr) {
    const tokens = [];
    const length = expr.length;
    let i = 0;

    const isDigit = ch => /[0-9]/.test(ch);
    const isOperator = ch => '+-*/'.includes(ch);

    while (i < length) {
      const ch = expr[i];

      // Skip whitespace
      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // Number (integer or decimal)
      if (isDigit(ch) || ch === '.') {
        let numStr = '';
        let dotCount = 0;

        while (i < length && (isDigit(expr[i]) || expr[i] === '.')) {
          if (expr[i] === '.') {
            dotCount++;
            if (dotCount > 1) {
              throw new Error('Invalid number format');
            }
          }
          numStr += expr[i];
          i++;
        }

        if (numStr === '.' || numStr === '') {
          throw new Error('Invalid number format');
        }

        tokens.push({ type: 'number', value: numStr });
        continue;
      }

      // Parentheses
      if (ch === '(' || ch === ')') {
        tokens.push({ type: 'paren', value: ch });
        i++;
        continue;
      }

      // Operators
      if (isOperator(ch)) {
        // Handle unary minus by inserting an implicit 0 operand
        if (ch === '-') {
          const prev = tokens[tokens.length - 1];
          const unaryContext =
            !prev ||
            (prev.type === 'operator') ||
            (prev.type === 'paren' && prev.value === '(');
          if (unaryContext) {
            tokens.push({ type: 'number', value: '0' });
          }
        }

        tokens.push({ type: 'operator', value: ch });
        i++;
        continue;
      }

      // Unknown character
      throw new Error(`Invalid character: ${ch}`);
    }

    return tokens;
  }

  // ---------- Shunting‑Yard (to RPN) ----------
  function toRPN(tokens) {
    const output = [];
    const opStack = [];

    for (const token of tokens) {
      if (token.type === 'number') {
        output.push(token);
      } else if (token.type === 'operator') {
        while (
          opStack.length &&
          opStack[opStack.length - 1].type === 'operator' &&
          PRECEDENCE[opStack[opStack.length - 1].value] >= PRECEDENCE[token.value]
        ) {
          output.push(opStack.pop());
        }
        opStack.push(token);
      } else if (token.type === 'paren') {
        if (token.value === '(') {
          opStack.push(token);
        } else {
          // token.value === ')'
          let foundLeftParen = false;
          while (opStack.length) {
            const top = opStack.pop();
            if (top.type === 'paren' && top.value === '(') {
              foundLeftParen = true;
              break;
            }
            output.push(top);
          }
          if (!foundLeftParen) {
            throw new Error('Unmatched parentheses');
          }
        }
      }
    }

    // Drain remaining operators
    while (opStack.length) {
      const top = opStack.pop();
      if (top.type === 'paren') {
        throw new Error('Unmatched parentheses');
      }
      output.push(top);
    }

    return output;
  }

  // ---------- RPN Evaluator ----------
  function evaluateRPN(rpnTokens) {
    const stack = [];

    for (const token of rpnTokens) {
      if (token.type === 'number') {
        stack.push(parseFloat(token.value));
      } else if (token.type === 'operator') {
        if (stack.length < 2) {
          throw new Error('Malformed expression');
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
            throw new Error(`Unsupported operator: ${token.value}`);
        }

        stack.push(result);
      }
    }

    if (stack.length !== 1) {
      throw new Error('Malformed expression');
    }

    return stack[0];
  }

  // ---------- Public API ----------
  function evaluate(expression) {
    try {
      const expr = (expression || '').trim();
      if (!expr) {
        throw new Error('Expression is empty');
      }

      const tokens = tokenize(expr);
      if (tokens.length === 0) {
        throw new Error('Expression is empty');
      }

      const rpn = toRPN(tokens);
      const result = evaluateRPN(rpn);
      return result;
    } catch (e) {
      // Return error message as string
      return e instanceof Error ? e.message : String(e);
    }
  }

  // Export to global namespace for app.js consumption
  window.evaluator = { evaluate };
})();