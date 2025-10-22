// tests/test_calculator.js

// Import the evaluate function from the calculator module.
import { evaluate } from '../src/js/calculator.js';

/**
 * List of test cases.
 * Each case contains:
 *   - expr: the expression string to evaluate
 *   - expected: the numeric result (or null if an error is expected)
 *   - error: the expected error message (or null if a result is expected)
 */
const testCases = [
  // Basic operations
  { expr: '2+3', expected: 5, error: null },
  { expr: '4-7', expected: -3, error: null },
  { expr: '6*7', expected: 42, error: null },
  { expr: '8/2', expected: 4, error: null },

  // Operator precedence
  { expr: '2+3*4', expected: 14, error: null },
  { expr: '(2+3)*4', expected: 20, error: null },

  // Unary minus and decimals
  { expr: '-5+2', expected: -3, error: null },
  { expr: '3.5*2', expected: 7, error: null },
  { expr: '-(1.2+0.8)', expected: -2, error: null },

  // Division by zero
  { expr: '10/0', expected: null, error: 'Division by zero' },

  // Syntax errors
  { expr: '5++2', expected: null, error: 'Syntax error' },
  { expr: '7*', expected: null, error: 'Syntax error' },
  { expr: '(3+2', expected: null, error: 'Mismatched parentheses' },
  { expr: '3+2)', expected: null, error: 'Mismatched parentheses' },

  // Complex expression
  { expr: '-3 + (2.5 * (4 - 1)) / 2', expected: 0.75, error: null },
];

/**
 * Helper to compare two floating‑point numbers with a tolerance.
 */
function numbersClose(a, b, epsilon = 1e-9) {
  return Math.abs(a - b) < epsilon;
}

/**
 * Runs all test cases, printing a concise report to the console.
 * The function never throws; unexpected exceptions are caught and reported as failures.
 */
export function runTests() {
  let passed = 0;

  testCases.forEach(({ expr, expected, error }, index) => {
    let result, errMsg;
    try {
      ({ result, error: errMsg } = evaluate(expr));
    } catch (ex) {
      console.error(`Test ${index + 1} – "${expr}": Unexpected exception`, ex);
      return;
    }

    const hasResult = expected !== null;
    const hasError = error !== null;

    let ok = false;

    if (hasResult && result !== null && error === null) {
      ok = numbersClose(result, expected);
    } else if (hasError && errMsg !== null) {
      ok = errMsg === error;
    }

    if (ok) {
      passed++;
      console.log(`✅ Test ${index + 1} – "${expr}" passed`);
    } else {
      console.log(`❌ Test ${index + 1} – "${expr}" failed`);
      console.log('   Expected:', hasResult ? expected : `Error "${error}"`);
      console.log('   Received:', result !== null ? result : `Error "${errMsg}"`);
    }
  });

  console.log(`\n${passed} of ${testCases.length} tests passed.`);
}

// If the file is executed directly (node tests/test_calculator.js), run the tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}