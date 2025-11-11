import { evaluate } from './calculator.js';

/**
 * Simple assertion helper.
 * @param {boolean} condition
 * @param {string} message
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

/**
 * Runs a suite of unit tests for the evaluate function.
 */
function runTests() {
    const testCases = [
        // [a, b, operator, expectedResult]
        [1, 2, 'add', 3],
        [5, 3, 'sub', 2],
        [4, 6, 'mul', 24],
        [8, 2, 'div', 4],
        // Edge cases
        [0, 0, 'add', 0],
        [-5, -5, 'sub', 0],
        [1.5, 2.5, 'mul', 3.75],
        [10, 3, 'div', 10 / 3]
    ];

    const errorCases = [
        // [a, b, operator, expectedErrorMessageSubstring]
        ['a', 2, 'add', 'valid number'],
        [1, 'b', 'sub', 'valid number'],
        [1, 0, 'div', 'Division by zero'],
        [1, 2, 'mod', 'Unsupported operator']
    ];

    const outputLines = [];
    let passed = 0;
    let failed = 0;

    // Successful cases
    testCases.forEach(([a, b, op, expected]) => {
        try {
            const result = evaluate(a, b, op);
            // Use a tolerance for floating point comparisons
            const equal = Math.abs(result - expected) < 1e-12;
            assert(equal, `Expected ${expected} but got ${result} for ${a} ${op} ${b}`);
            outputLines.push(`PASS: ${a} ${op} ${b} = ${result}`);
            passed++;
        } catch (e) {
            outputLines.push(`FAIL: ${a} ${op} ${b} threw ${e.message}`);
            failed++;
        }
    });

    // Error cases
    errorCases.forEach(([a, b, op, msgPart]) => {
        try {
            evaluate(a, b, op);
            outputLines.push(`FAIL: ${a} ${op} ${b} did not throw`);
            failed++;
        } catch (e) {
            const contains = e.message.includes(msgPart);
            if (contains) {
                outputLines.push(`PASS: ${a} ${op} ${b} threw expected error`);
                passed++;
            } else {
                outputLines.push(`FAIL: ${a} ${op} ${b} threw unexpected error "${e.message}"`);
                failed++;
            }
        }
    });

    const summary = `\nTest Summary: ${passed} passed, ${failed} failed.`;
    outputLines.push(summary);

    const pre = document.getElementById('test-output');
    if (pre) {
        pre.textContent = outputLines.join('\n');
    } else {
        console.log(outputLines.join('\n'));
    }
}

// Run tests automatically when the module loads
runTests();