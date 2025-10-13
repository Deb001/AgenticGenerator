/**
 * src/calculator.js
 *
 * Pure calculator engine module.
 * Exports:
 *   - evaluate(expression): number
 *   - tokenize(expression): Array<Token>
 *   - toRPN(tokens): Array<Token>
 *   - evaluateRPN(rpnTokens): number
 *
 * Token schema:
 *   { type: 'number'|'operator'|'paren', value: number|string }
 *
 * Operator precedence map:
 *   { '+': 1, '-': 1, '×': 2, '*': 2, '÷': 2, '/': 2 }
 *
 * Errors thrown are instances of CalcError (extends Error) with:
 *   { name: 'CalcError', code: 'TOKENIZE_ERROR'|'INVALID_EXPRESSION'|'DIVIDE_BY_ZERO', message, details? }
 */

'use strict';

/**
 * Custom error type for calculator errors.
 */
class CalcError extends Error {
  /**
   * @param {string} code - one of 'TOKENIZE_ERROR'|'INVALID_EXPRESSION'|'DIVIDE_BY_ZERO'
   * @param {string} message
   * @param {any} [details]
   */
  constructor(code, message, details) {
    super(message);
    this.name = 'CalcError';
    this.code = code;
    if (details !== undefined) this.details = details;
    // Maintain proper stack (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CalcError);
    }
  }
}

/**
 * Operator precedence map and utilities.
 */
const OP_PRECEDENCE = {
  '+': 1,
  '-': 1,
  '×': 2,
  '*': 2,
  '÷': 2,
  '/': 2
};

const OPERATORS = new Set(Object.keys(OP_PRECEDENCE));
const LEFT_ASSOC = new Set(Object.keys(OP_PRECEDENCE)); // all listed are left-associative

/**
 * Public: evaluate(expression)
 * Tokenizes, parses (to RPN), and evaluates the arithmetic expression.
 *
 * Supported features:
 *  - binary operators: +, -, ×, *, ÷, /
 *  - parentheses: ( )
 *  - decimal numbers (supports ".5" and "0.5")
 *  - unary minus (e.g., "-5" or "-(3+2)")
 *
 * Throws CalcError on invalid inputs or runtime errors (e.g., division by zero).
 *
 * @param {string} expression
 * @returns {number}
 */
export function evaluate(expression) {
  if (typeof expression !== 'string') {
    throw new CalcError(
      'INVALID_EXPRESSION',
      'Expression must be a string',
      { receivedType: typeof expression }
    );
  }

  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    throw new CalcError(
      'INVALID_EXPRESSION',
      'Expression is empty'
    );
  }

  // Tokenize -> toRPN -> evaluateRPN
  const tokens = tokenize(trimmed);
  const rpn = toRPN(tokens);
  const result = evaluateRPN(rpn);

  return result;
}

/**
 * Public: tokenize(expression)
 *
 * Converts an input string into an array of tokens:
 *  - number tokens: { type: 'number', value: Number }
 *  - operator tokens: { type: 'operator', value: '+'|'-'|'×'|'*'|'÷'|'/' }
 *  - paren tokens: { type: 'paren', value: '('|')' }
 *
 * Recognizes decimal numbers and unary minus contexts:
 *  - Leading '-' or '-' after '(' or another operator is treated as unary.
 *    If followed by digits/decimal it becomes part of the number token (e.g., "-3.5").
 *    If followed by '(' it is transformed into [0] [operator '-'] ['(' ... ].
 *
 * Throws CalcError with code 'TOKENIZE_ERROR' on unknown characters or malformed numbers.
 *
 * @param {string} expression
 * @returns {Array<Object>}
 */
export function tokenize(expression) {
  const tokens = [];
  const len = expression.length;

  // Helper to push number token
  const pushNumberToken = (numStr, posStart) => {
    if (numStr === '' || numStr === '.' || numStr === '+.' || numStr === '-.') {
      throw new CalcError(
        'TOKENIZE_ERROR',
        `Invalid number at pos ${posStart}`,
        { pos: posStart, fragment: numStr }
      );
    }
    const value = Number(numStr);
    if (!Number.isFinite(value)) {
      throw new CalcError(
        'TOKENIZE_ERROR',
        `Invalid numeric value at pos ${posStart}`,
        { pos: posStart, fragment: numStr }
      );
    }
    tokens.push({ type: 'number', value });
  };

  let i = 0;
  while (i < len) {
    const ch = expression[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i += 1;
      continue;
    }

    // Operators (including * / × ÷ + -)
    if (OPERATORS.has(ch)) {
      const prevToken = tokens.length ? tokens[tokens.length - 1] : null;
      const isUnaryContext =
        !prevToken || prevToken.type === 'operator' || (prevToken.type === 'paren' && prevToken.value === '(');

      // Handle unary minus
      if ((ch === '-' || ch === '+') && isUnaryContext) {
        // Look ahead to decide behavior
        const nextChar = expression[i + 1];
        if (nextChar === '(') {
          // Convert unary +/- before '(' into "0 <op> ("
          if (ch === '-') {
            tokens.push({ type: 'number', value: 0 });
            tokens.push({ type: 'operator', value: '-' });
          } else {
            // unary + before '(' is a no-op: treat as "0 + ("
            tokens.push({ type: 'number', value: 0 });
            tokens.push({ type: 'operator', value: '+' });
          }
          i += 1; // move past unary sign, '(' will be processed in next loop
          continue;
        } else {
          // If followed by a number (digit or '.') parse signed number
          if (nextChar && (/\d/.test(nextChar) || nextChar === '.')) {
            const sign = ch; // '+' or '-'
            i += 1; // consume sign
            // parse numeric literal
            let numStr = sign;
            let dotCount = 0;
            let posStart = i - 1;
            while (i < len) {
              const c = expression[i];
              if (c === '.') {
                dotCount += 1;
                if (dotCount > 1) {
                  throw new CalcError(
                    'TOKENIZE_ERROR',
                    `Invalid number with multiple decimals at pos ${i}`,
                    { pos: i, char: c }
                  );
                }
                numStr += c;
                i += 1;
                continue;
              }
              if (/\d/.test(c)) {
                numStr += c;
                i += 1;
                continue;
              }
              break;
            }
            pushNumberToken(numStr, posStart);
            continue;
          } else {
            // Unary sign not followed by '(' or number => invalid
            throw new CalcError(
              'TOKENIZE_ERROR',
              `Unary '${ch}' not followed by a number or parenthesis at pos ${i}`,
              { pos: i, char: ch }
            );
          }
        }
      }

      // Normal binary operator
      tokens.push({ type: 'operator', value: ch });
      i += 1;
      continue;
    }

    // Digits or decimal point: parse number
    if (/\d/.test(ch) || ch === '.') {
      let numStr = '';
      let dotCount = 0;
      const posStart = i;

      while (i < len) {
        const c = expression[i];
        if (c === '.') {
          dotCount += 1;
          if (dotCount > 1) {
            throw new CalcError(
              'TOKENIZE_ERROR',
              `Invalid number with multiple decimals at pos ${i}`,
              { pos: i, char: c }
            );
          }
          numStr += c;
          i += 1;
          continue;
        }
        if (/\d/.test(c)) {
          numStr += c;
          i += 1;
          continue;
        }
        break;
      }

      // Allow numbers like ".5" -> treat as "0.5" naturally via Number()
      pushNumberToken(numStr, posStart);
      continue;
    }

    // Unknown character
    throw new CalcError(
      'TOKENIZE_ERROR',
      `Invalid character at pos ${i}: '${ch}'`,
      { pos: i, char: ch }
    );
  }

  return tokens;
}

/**
 * Public: toRPN(tokens)
 *
 * Convert token stream to Reverse Polish Notation (postfix) using the shunting-yard algorithm.
 * Honors operator precedence and left-associativity for supported operators.
 *
 * Throws CalcError with code 'INVALID_EXPRESSION' for mismatched parentheses.
 *
 * @param {Array<Object>} tokens
 * @returns {Array<Object>} rpn tokens
 */
export function toRPN(tokens) {
  const output = [];
  const opStack = [];

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];

    if (token.type === 'number') {
      output.push(token);
      continue;
    }

    if (token.type === 'operator') {
      const o1 = token.value;
      if (!OPERATORS.has(o1)) {
        throw new CalcError(
          'INVALID_EXPRESSION',
          `Unknown operator '${o1}' in expression`,
          { token, idx }
        );
      }
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'operator') {
          const o2 = top.value;
          const p1 = OP_PRECEDENCE[o1] || 0;
          const p2 = OP_PRECEDENCE[o2] || 0;
          const leftAssoc = LEFT_ASSOC.has(o1);

          if ((leftAssoc && p1 <= p2) || (!leftAssoc && p1 < p2)) {
            output.push(opStack.pop());
            continue;
          }
        }
        break;
      }
      opStack.push(token);
      continue;
    }

    if (token.type === 'paren') {
      if (token.value === '(') {
        opStack.push(token);
        continue;
      } else if (token.value === ')') {
        // Pop until '('
        let foundLeft = false;
        while (opStack.length > 0) {
          const top = opStack.pop();
          if (top.type === 'paren' && top.value === '(') {
            foundLeft = true;
            break;
          } else {
            output.push(top);
          }
        }
        if (!foundLeft) {
          throw new CalcError(
            'INVALID_EXPRESSION',
            `Mismatched parentheses: missing '(' for ')' at token index ${idx}`,
            { idx, token }
          );
        }
        continue;
      }
    }

    // Unknown token type
    throw new CalcError(
      'INVALID_EXPRESSION',
      `Unknown token during parsing at index ${idx}`,
      { token, idx }
    );
  }

  // Drain operator stack
  while (opStack.length > 0) {
    const top = opStack.pop();
    if (top.type === 'paren') {
      throw new CalcError(
        'INVALID_EXPRESSION',
        `Mismatched parentheses: missing ')'`,
        { token: top }
      );
    }
    output.push(top);
  }

  return output;
}

/**
 * Public: evaluateRPN(rpnTokens)
 *
 * Evaluate an RPN (postfix) token list. Uses a stack:
 *  - number tokens are pushed
 *  - operator tokens pop two operands (b then a) and push result of a op b
 *
 * Detects divide-by-zero and invalid stack states.
 *
 * Throws CalcError with:
 *  - code 'DIVIDE_BY_ZERO' when dividing by zero
 *  - code 'INVALID_EXPRESSION' on insufficient operands or final stack not singular
 *
 * Returns a floating point number. Normalizes -0 to 0. Rounds to 12 decimal places to reduce floating noise.
 *
 * @param {Array<Object>} rpnTokens
 * @returns {number}
 */
export function evaluateRPN(rpnTokens) {
  const stack = [];

  for (let idx = 0; idx < rpnTokens.length; idx++) {
    const token = rpnTokens[idx];

    if (token.type === 'number') {
      stack.push(token.value);
      continue;
    }

    if (token.type === 'operator') {
      const op = token.value;

      // All supported operators are binary
      if (stack.length < 2) {
        throw new CalcError(
          'INVALID_EXPRESSION',
          `Insufficient operands for operator '${op}' at RPN index ${idx}`,
          { idx, token, stackLength: stack.length }
        );
      }

      const b = stack.pop();
      const a = stack.pop();
      let res;

      switch (op) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
        case '×':
          res = a * b;
          break;
        case '/':
        case '÷':
          if (b === 0) {
            throw new CalcError(
              'DIVIDE_BY_ZERO',
              'Division by zero',
              { operator: op, operands: [a, b], idx }
            );
          }
          res = a / b;
          break;
        default:
          throw new CalcError(
            'INVALID_EXPRESSION',
            `Unsupported operator '${op}' encountered during evaluation`,
            { op, idx }
          );
      }

      // Push result
      stack.push(res);
      continue;
    }

    throw new CalcError(
      'INVALID_EXPRESSION',
      `Unknown token type in RPN at index ${idx}`,
      { token, idx }
    );
  }

  if (stack.length !== 1) {
    throw new CalcError(
      'INVALID_EXPRESSION',
      `Invalid RPN evaluation state: expected single result but stack has ${stack.length}`,
      { stackSnapshot: stack }
    );
  }

  let result = stack[0];

  // Normalize -0 to 0
  if (Object.is(result, -0)) result = 0;

  // Round to reasonable precision to avoid floating point noise in UI.
  // 12 decimal places is a reasonable default for calculator display.
  const PRECISION = 12;
  // Use toFixed -> parseFloat to remove trailing zeros in string form
  const rounded = parseFloat(result.toFixed(PRECISION));

  return rounded;
}

// Default export is not used; provide named exports only per project spec.