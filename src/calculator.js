/**
 * Arithmetic expression evaluator using tokenization,
 * the shunting‑yard algorithm and RPN evaluation.
 *
 * Supported:
 *   - Numbers (integers & decimals, optional leading sign)
 *   - Operators: + - * /
 *   - Parentheses: ( )
 *
 * Errors are thrown as `Error` instances with clear messages.
 */

const OP_PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2 };
const LEFT_ASSOC = { '+': true, '-': true, '*': true, '/': true };

/**
 * Convert a raw expression string into an ordered list of tokens.
 * @param {string} expr
 * @returns {Array<{type:string,value:string}>}
 * @throws {Error} Syntax error for illegal characters or malformed numbers.
 */
function _tokenize(expr) {
    const tokens = [];
    let i = 0;
    const len = expr.length;
    let lastToken = null;

    while (i < len) {
        const ch = expr[i];

        // Skip whitespace
        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        // Number (including optional leading sign)
        if (/[0-9.]/.test(ch) || (ch === '-' && (
                // unary minus detection
                !lastToken ||
                (lastToken.type === 'operator' && lastToken.value !== ')') ||
                lastToken.type === 'leftParen'
            ))) {
            let numStr = '';
            let hasDecimal = false;
            // Capture leading sign if present
            if (ch === '-') {
                numStr += '-';
                i++;
            }
            while (i < len) {
                const c = expr[i];
                if (c >= '0' && c <= '9') {
                    numStr += c;
                } else if (c === '.') {
                    if (hasDecimal) {
                        throw new Error('Syntax error: multiple decimal points in number');
                    }
                    hasDecimal = true;
                    numStr += c;
                } else {
                    break;
                }
                i++;
            }
            if (numStr === '-' || numStr === '' || numStr === '.') {
                throw new Error('Syntax error: malformed number');
            }
            tokens.push({ type: 'number', value: numStr });
            lastToken = tokens[tokens.length - 1];
            continue;
        }

        // Operators
        if (/[+\-*/]/.test(ch)) {
            tokens.push({ type: 'operator', value: ch });
            lastToken = tokens[tokens.length - 1];
            i++;
            continue;
        }

        // Parentheses
        if (ch === '(') {
            tokens.push({ type: 'leftParen', value: ch });
            lastToken = tokens[tokens.length - 1];
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ type: 'rightParen', value: ch });
            lastToken = tokens[tokens.length - 1];
            i++;
            continue;
        }

        // Anything else is invalid
        throw new Error(`Invalid token: '${ch}'`);
    }

    if (tokens.length === 0) {
        throw new Error('Syntax error: empty expression');
    }

    return tokens;
}

/**
 * Convert token list to Reverse Polish Notation using the shunting‑yard algorithm.
 * @param {Array<{type:string,value:string}>} tokens
 * @returns {Array<{type:string,value:string}>}
 * @throws {Error} Syntax error for mismatched parentheses.
 */
function _toRPN(tokens) {
    const output = [];
    const opStack = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            output.push(token);
        } else if (token.type === 'operator') {
            while (opStack.length) {
                const top = opStack[opStack.length - 1];
                if (top.type !== 'operator') break;
                const pTop = OP_PRECEDENCE[top.value];
                const pCur = OP_PRECEDENCE[token.value];
                if (
                    pTop > pCur ||
                    (pTop === pCur && LEFT_ASSOC[token.value])
                ) {
                    output.push(opStack.pop());
                } else {
                    break;
                }
            }
            opStack.push(token);
        } else if (token.type === 'leftParen') {
            opStack.push(token);
        } else if (token.type === 'rightParen') {
            let foundLeft = false;
            while (opStack.length) {
                const top = opStack.pop();
                if (top.type === 'leftParen') {
                    foundLeft = true;
                    break;
                }
                output.push(top);
            }
            if (!foundLeft) {
                throw new Error('Syntax error: mismatched parentheses');
            }
        }
    }

    while (opStack.length) {
        const top = opStack.pop();
        if (top.type === 'leftParen' || top.type === 'rightParen') {
            throw new Error('Syntax error: mismatched parentheses');
        }
        output.push(top);
    }

    return output;
}

/**
 * Evaluate an RPN token list.
 * @param {Array<{type:string,value:string}>} rpnTokens
 * @returns {number}
 * @throws {Error} Division by zero or malformed RPN.
 */
function _evaluateRPN(rpnTokens) {
    const stack = [];

    for (const token of rpnTokens) {
        if (token.type === 'number') {
            stack.push(parseFloat(token.value));
        } else if (token.type === 'operator') {
            if (stack.length < 2) {
                throw new Error('Syntax error: insufficient values for operation');
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
                    throw new Error(`Invalid operator: ${token.value}`);
            }
            stack.push(result);
        } else {
            throw new Error(`Invalid token in RPN: ${token.type}`);
        }
    }

    if (stack.length !== 1) {
        throw new Error('Syntax error: malformed expression');
    }

    return stack[0];
}

/**
 * Public API – evaluate an arithmetic expression string.
 * @param {string} expression
 * @returns {number}
 * @throws {Error} Syntax errors, division by zero, or invalid tokens.
 */
export function evaluate(expression) {
    if (typeof expression !== 'string') {
        throw new Error('Expression must be a string');
    }
    const trimmed = expression.trim();
    const tokens = _tokenize(trimmed);
    const rpn = _toRPN(tokens);
    const result = _evaluateRPN(rpn);
    return result;
}