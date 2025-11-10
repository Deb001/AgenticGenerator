// src/calculator.js
/**
 * Simple arithmetic expression evaluator.
 * Supports +, -, *, /, parentheses and decimal numbers.
 * Implements the Shunting‑Yard algorithm to avoid using eval().
 */

/**
 * Token types used by the parser.
 * @enum {string}
 */
const TokenType = Object.freeze({
  NUMBER: "NUMBER",
  OPERATOR: "OPERATOR",
  LEFT_PAREN: "LEFT_PAREN",
  RIGHT_PAREN: "RIGHT_PAREN"
});

/**
 * Operator precedence and associativity.
 */
const OPERATORS = Object.freeze({
  "+": { precedence: 1, associativity: "Left", func: (a, b) => a + b },
  "-": { precedence: 1, associativity: "Left", func: (a, b) => a - b },
  "*": { precedence: 2, associativity: "Left", func: (a, b) => a * b },
  "/": { precedence: 2, associativity: "Left", func: (a, b) => {
    if (b === 0) {
      throw new Error("Division by zero");
    }
    return a / b;
  } }
});

/**
 * Tokenizes an arithmetic expression string.
 * @param {string} expr The raw expression.
 * @returns {{type:string, value:string}[]} Array of token objects.
 * @throws {Error} If an unknown character is encountered.
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const char = expr[i];
    if (char === " " || char === "\t" || char === "\n") {
      i++; // skip whitespace
      continue;
    }
    if (/[0-9.]/.test(char)) {
      let num = char;
      i++;
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        if (expr[i] === "." && num.includes(".")) {
          throw new Error("Invalid number format with multiple decimals");
        }
        num += expr[i];
        i++;
      }
      if (num === ".") {
        throw new Error("Invalid solitary decimal point");
      }
      tokens.push({ type: TokenType.NUMBER, value: num });
      continue;
    }
    if (char === "+" || char === "-" || char === "*" || char === "/") {
      tokens.push({ type: TokenType.OPERATOR, value: char });
      i++;
      continue;
    }
    if (char === "(") {
      tokens.push({ type: TokenType.LEFT_PAREN, value: char });
      i++;
      continue;
    }
    if (char === ")") {
      tokens.push({ type: TokenType.RIGHT_PAREN, value: char });
      i++;
      continue;
    }
    throw new Error(`Unexpected character '${char}' at position ${i}`);
  }
  return tokens;
}

/**
 * Converts an array of tokens from infix to Reverse Polish Notation using the Shunting‑Yard algorithm.
 * @param {{type:string, value:string}[]} tokens
 * @returns {{type:string, value:string}[]} RPN token array.
 * @throws {Error} If parentheses are mismatched.
 */
function toRPN(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    switch (token.type) {
      case TokenType.NUMBER:
        outputQueue.push(token);
        break;
      case TokenType.OPERATOR:
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type === TokenType.OPERATOR &&
          (
            (OPERATORS[token.value].associativity === "Left" && OPERATORS[token.value].precedence <= OPERATORS[operatorStack[operatorStack.length - 1].value].precedence) ||
            (OPERATORS[token.value].associativity === "Right" && OPERATORS[token.value].precedence < OPERATORS[operatorStack[operatorStack.length - 1].value].precedence)
          )
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
        break;
      case TokenType.LEFT_PAREN:
        operatorStack.push(token);
        break;
      case TokenType.RIGHT_PAREN:
        let foundLeft = false;
        while (operatorStack.length > 0) {
          const op = operatorStack.pop();
          if (op.type === TokenType.LEFT_PAREN) {
            foundLeft = true;
            break;
          } else {
            outputQueue.push(op);
          }
        }
        if (!foundLeft) {
          throw new Error("Mismatched parentheses");
        }
        break;
      default:
        throw new Error(`Unknown token type: ${token.type}`);
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op.type === TokenType.LEFT_PAREN || op.type === TokenType.RIGHT_PAREN) {
      throw new Error("Mismatched parentheses");
    }
    outputQueue.push(op);
  }

  return outputQueue;
}

/**
 * Evaluates an RPN token array.
 * @param {{type:string, value:string}[]} rpnTokens
 * @returns {number}
 * @throws {Error} If the expression is malformed.
 */
function evaluateRPN(rpnTokens) {
  const stack = [];
  for (const token of rpnTokens) {
    if (token.type === TokenType.NUMBER) {
      stack.push(parseFloat(token.value));
    } else if (token.type === TokenType.OPERATOR) {
      if (stack.length < 2) {
        throw new Error("Malformed expression");
      }
      const b = stack.pop();
      const a = stack.pop();
      const result = OPERATORS[token.value].func(a, b);
      stack.push(result);
    } else {
      throw new Error(`Invalid token in RPN evaluation: ${token.type}`);
    }
  }
  if (stack.length !== 1) {
    throw new Error("Malformed expression after evaluation");
  }
  return stack[0];
}

/**
 * Public API: evaluates a mathematical expression string.
 * @param {string} expression The arithmetic expression to evaluate.
 * @returns {number} The computed result.
 * @throws {Error} If the expression is invalid or cannot be evaluated.
 */
export function evaluate(expression) {
  if (typeof expression !== "string") {
    throw new TypeError("Expression must be a string");
  }
  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    throw new Error("Empty expression");
  }
  const tokens = tokenize(trimmed);
  const rpn = toRPN(tokens);
  const result = evaluateRPN(rpn);
  // Round to avoid floating point artifacts (e.g., 0.1+0.2)
  return Math.round((result + Number.EPSILON) * 1e12) / 1e12;
}
