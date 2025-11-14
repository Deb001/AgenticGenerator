// evaluator.js
// Pure‑JavaScript arithmetic engine that parses and safely evaluates simple infix expressions.
// Exported class: ExpressionEvaluator with a static evaluate method.

/**
 * Utility class for evaluating arithmetic expressions.
 * Supports numbers, +, -, *, / and parentheses.
 * The implementation validates input, tokenizes, converts to Reverse Polish Notation
 * using the Shunting‑Yard algorithm, then evaluates the RPN stack.
 */
class ExpressionEvaluator {
  /**
   * Evaluate an arithmetic expression safely.
   * @param {string} expression The infix arithmetic expression to evaluate.
   * @returns {number} The numeric result of the expression.
   * @throws {SyntaxError} If the expression contains invalid characters or mismatched parentheses.
   * @throws {Error} If a division by zero occurs.
   */
  static evaluate(expression) {
    if (typeof expression !== 'string') {
      throw new SyntaxError('Expression must be a string');
    }

    // 1. Trim and validate allowed characters.
    const trimmed = expression.trim();
    if (trimmed.length === 0) {
      throw new SyntaxError('Expression cannot be empty');
    }
    const allowedPattern = /^[0-9+\-*/().\s]+$/;
    if (!allowedPattern.test(trimmed)) {
      throw new SyntaxError('Expression contains invalid characters');
    }

    // 2. Tokenize numbers and operators.
    const tokens = [];
    let numberBuffer = '';
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (/[0-9.]/.test(ch)) {
        numberBuffer += ch;
      } else if (/\s/.test(ch)) {
        // ignore whitespace but flush number buffer if present
        if (numberBuffer) {
          tokens.push(numberBuffer);
          numberBuffer = '';
        }
      } else {
        // operator or parenthesis
        if (numberBuffer) {
          tokens.push(numberBuffer);
          numberBuffer = '';
        }
        tokens.push(ch);
      }
    }
    if (numberBuffer) {
      tokens.push(numberBuffer);
    }

    // 3. Shunting‑Yard to produce RPN.
    const outputQueue = [];
    const operatorStack = [];
    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2
    };
    const isOperator = (t) => ['+', '-', '*', '/'].includes(t);
    const isLeftAssociative = (t) => true; // all supported operators are left‑associative

    for (const token of tokens) {
      if (!isNaN(token)) {
        // token is a number
        outputQueue.push(parseFloat(token));
      } else if (isOperator(token)) {
        while (
          operatorStack.length > 0 &&
          isOperator(operatorStack[operatorStack.length - 1]) &&
          ((isLeftAssociative(token) && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
            (!isLeftAssociative(token) && precedence[token] < precedence[operatorStack[operatorStack.length - 1]]))
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
          } else {
            outputQueue.push(op);
          }
        }
        if (!foundLeftParen) {
          throw new SyntaxError('Mismatched parentheses');
        }
      } else {
        // Should never happen because of earlier validation
        throw new SyntaxError(`Unexpected token: ${token}`);
      }
    }
    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      if (op === '(' || op === ')') {
        throw new SyntaxError('Mismatched parentheses');
      }
      outputQueue.push(op);
    }

    // 4. Evaluate RPN.
    const evalStack = [];
    for (const token of outputQueue) {
      if (typeof token === 'number') {
        evalStack.push(token);
      } else if (isOperator(token)) {
        if (evalStack.length < 2) {
          throw new SyntaxError('Insufficient values in expression');
        }
        const b = evalStack.pop();
        const a = evalStack.pop();
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
            throw new SyntaxError(`Unsupported operator: ${token}`);
        }
        evalStack.push(result);
      } else {
        throw new SyntaxError('Invalid token in RPN expression');
      }
    }
    if (evalStack.length !== 1) {
      throw new SyntaxError('The expression could not be resolved to a single value');
    }
    return evalStack[0];
  }
}

module.exports = { ExpressionEvaluator };
