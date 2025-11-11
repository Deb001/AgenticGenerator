/**
 * Performs the arithmetic operation.
 * @param {number} a - First operand.
 * @param {number} b - Second operand.
 * @param {string} operator - One of 'add', 'sub', 'mul', 'div'.
 * @returns {number} Result of the operation.
 * @throws {TypeError} If a or b is not a finite number.
 * @throws {Error} If operator is unsupported or division by zero occurs.
 */
export function evaluate(a, b, operator) {
    if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(a) || !Number.isFinite(b)) {
        throw new TypeError('Both operands must be finite numbers.');
    }
    switch (operator) {
        case 'add':
            return a + b;
        case 'sub':
            return a - b;
        case 'mul':
            return a * b;
        case 'div':
            if (b === 0) {
                throw new Error('Division by zero is not allowed.');
            }
            return a / b;
        default:
            throw new Error(`Unsupported operator '${operator}'.`);
    }
}