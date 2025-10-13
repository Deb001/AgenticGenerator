/**
 * tests/calculator.test.js
 *
 * Unit tests for src/calculator.js evaluate(expression).
 *
 * - Provides a runTests() entrypoint for running tests directly with Node (node tests/calculator.test.js).
 * - Also defines Jest-style tests when executed in a test runner that provides `describe` / `test`.
 *
 * Tests use a small array of cases. Each case:
 *   { name: string, expression: string, expected: number | { errorCode: string } }
 *
 * Behavior:
 *   - For numeric expectations: assert exact equality for integers or within EPS for floating point results.
 *   - For error expectations: assert evaluate throws and that thrown error.code === expected.errorCode.
 *
 * Exports:
 *   - runTests(): runs all tests and exits non-zero on failure when executed directly.
 *
 * Notes:
 *   - This file expects ../src/calculator.js to export a synchronous function `evaluate(expression)`.
 *   - Error objects thrown by evaluate(...) should have a `code` property (string) for error assertions.
 */

'use strict';

const path = require('path');
const assert = require('assert').strict;

let evaluate;
try {
  // Import the calculator evaluate function from the project source
  /* eslint-disable global-require, import/no-dynamic-require */
  const calculator = require(path.join(__dirname, '..', 'src', 'calculator.js'));
  /* eslint-enable global-require, import/no-dynamic-require */
  if (calculator && typeof calculator.evaluate === 'function') {
    evaluate = calculator.evaluate;
  } else if (typeof calculator === 'function') {
    // support direct default export
    evaluate = calculator;
  } else {
    throw new Error('Could not find evaluate export in ../src/calculator.js');
  }
} catch (err) {
  // Make the failure explicit so test runners show a helpful message
  throw new Error(`Failed to load calculator.evaluate from ../src/calculator.js: ${err.message}`);
}

/**
 * Epsilon for floating point comparisons (reasonable for calculator-level arithmetic).
 * Use 1e-12 to allow common floating noise while still being strict.
 */
const EPS = 1e-12;

/**
 * Array of test cases to exercise the calculator engine.
 * Uses Unicode multiplication (× = \u00d7) and division (÷ = \u00f7) symbols where appropriate.
 *
 * Important: Expected error codes must match the codes thrown by the evaluate implementation.
 */
const TEST_CASES = [
  {
    name: 'Addition: simple',
    expression: '1+2',
    expected: 3,
  },
  {
    name: 'Subtraction: simple',
    expression: '5-3',
    expected: 2,
  },
  {
    name: 'Multiplication and precedence',
    expression: `2\u00d73+4`, // 2 × 3 + 4 => 10
    expected: 10,
  },
  {
    name: 'Division: simple',
    expression: `8\u00f72`, // 8 ÷ 2 => 4
    expected: 4,
  },
  {
    name: 'Decimals: addition',
    expression: '2.5+0.75',
    expected: 3.25,
  },
  {
    name: 'Mixed division and multiplication (left-to-right for same precedence)',
    expression: `10\u00f72\u00d73`, // 10 ÷ 2 × 3 => (10/2)*3 = 15
    expected: 15,
  },
  {
    name: 'Floating precision check (0.1 + 0.2)',
    expression: '0.1+0.2',
    expected: 0.3,
  },
  {
    name: 'Division by zero should throw structured error',
    expression: `5\u00f70`,
    expected: { errorCode: 'DIVIDE_BY_ZERO' },
  },
  {
    name: 'Invalid expression should throw structured error (consecutive operators)',
    expression: '2++2',
    expected: { errorCode: 'INVALID_EXPRESSION' },
  },
  {
    name: 'Invalid expression should throw structured error (non-numeric chars)',
    expression: 'abc',
    expected: { errorCode: 'INVALID_EXPRESSION' },
  },
];

/**
 * Helper: compare numbers with EPS tolerance.
 */
function numbersAlmostEqual(a, b, eps = EPS) {
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  return Math.abs(a - b) <= eps;
}

/**
 * runTests
 *
 * Entry point for running the test suite programmatically (Node).
 * Iterates through TEST_CASES and asserts expected outcomes.
 *
 * On failure:
 *  - Logs a descriptive error message including expression, expected vs actual, and case name.
 *  - Throws an AssertionError or exits process with non-zero status (when run directly).
 */
function runTests() {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const tc of TEST_CASES) {
    const { name, expression, expected } = tc;
    try {
      if (typeof expected === 'number') {
        // Expect numeric result
        let result;
        try {
          result = evaluate(expression);
        } catch (err) {
          throw new assert.AssertionError({
            message: `Expression threw unexpectedly: "${expression}" (${name}). Threw: ${err && err.message}`,
            expected,
            actual: err,
          });
        }

        if (typeof result !== 'number' || !Number.isFinite(result)) {
          throw new assert.AssertionError({
            message: `Expression did not return a finite number: "${expression}" (${name}). Actual: ${String(result)}`,
            expected,
            actual: result,
          });
        }

        if (!numbersAlmostEqual(result, expected)) {
          throw new assert.AssertionError({
            message: `Numeric mismatch for "${expression}" (${name}). Expected: ${expected}, Actual: ${result}`,
            expected,
            actual: result,
          });
        }

        passed += 1;
      } else if (expected && typeof expected === 'object' && expected.errorCode) {
        // Expect an error with a specific error code
        let threw = false;
        try {
          const result = evaluate(expression);
          // If evaluate returns, that's a failure
          throw new assert.AssertionError({
            message: `Expected expression to throw error with code "${expected.errorCode}" but it returned: ${String(result)} -- Expression: "${expression}" (${name})`,
            expected: expected.errorCode,
            actual: result,
          });
        } catch (err) {
          threw = true;
          // If the evaluate implementation throws built-in AssertionError from our own checks,
          // we should detect and propagate; but typically evaluate will throw its own error.
          if (err && err.code && err.code === expected.errorCode) {
            passed += 1;
          } else {
            // Provide a clear message including the thrown value
            const actualCode = err && err.code ? err.code : '(no code)';
            throw new assert.AssertionError({
              message: `Wrong error for "${expression}" (${name}). Expected error.code="${expected.errorCode}", Actual=${actualCode}. Full thrown: ${err && err.message ? err.message : String(err)}`,
              expected: expected.errorCode,
              actual: actualCode,
            });
          }
        }
        if (!threw) {
          // Should not reach here because above would have thrown; keep for safety
          throw new assert.AssertionError({
            message: `Expected expression to throw but it did not: "${expression}" (${name})`,
            expected: expected.errorCode,
            actual: undefined,
          });
        }
      } else {
        throw new Error(`Test case has invalid expected value: ${JSON.stringify(tc)}`);
      }
    } catch (err) {
      failed += 1;
      failures.push({
        name,
        expression,
        expected,
        error: err,
      });
      // Log concise failure for immediate feedback
      console.error(`FAIL: ${name} -- "${expression}"`);
      if (err instanceof assert.AssertionError) {
        console.error(`  Assertion failed: ${err.message}`);
      } else {
        console.error(`  Error: ${err && err.stack ? err.stack : String(err)}`);
      }
    }
  }

  // Summary
  console.log(`\nTest Summary: ${passed} passed, ${failed} failed, ${TEST_CASES.length} total.`);
  if (failed > 0) {
    console.log('Failures detail:');
    for (const f of failures) {
      console.log(`- ${f.name} -- "${f.expression}"`);
      if (f.error instanceof assert.AssertionError) {
        console.log(`    Assertion: ${f.error.message}`);
      } else {
        console.log(`    Error: ${f.error && f.error.stack ? f.error.stack : String(f.error)}`);
      }
    }
    // Fail fast when run directly
    if (require.main === module) {
      // Ensure non-zero exit code to indicate test failure to CI systems
      process.exitCode = 1;
    }
    // Also throw to allow programmatic detection if desired
    throw new Error(`${failed} test(s) failed.`);
  }
  return true;
}

/**
 * If running in a Jest/Mocha environment (presence of global.describe/test), register tests.
 * This allows `npm test` using Jest to pick up fine-grained tests with clear messages.
 */
if (typeof describe === 'function' && typeof test === 'function') {
  // Use Jest-style tests
  describe('calculator.evaluate - unit tests', () => {
    for (const tc of TEST_CASES) {
      const { name, expression, expected } = tc;
      test(`${name} -- "${expression}"`, () => {
        if (typeof expected === 'number') {
          const result = evaluate(expression);
          // Use Jest's toBeCloseTo for floats; choose precision based on EPS
          // Convert EPS to number of decimal places roughly: -log10(EPS)
          const decimalPlaces = Math.max(0, Math.ceil(-Math.log10(EPS)));
          // Use toBeCloseTo when not exact
          if (Number.isFinite(result)) {
            expect(result).toBeCloseTo(expected, decimalPlaces);
          } else {
            // If result is not finite, fail explicitly
            throw new Error(`Expected finite number for "${expression}", got: ${String(result)}`);
          }
        } else if (expected && typeof expected === 'object' && expected.errorCode) {
          // Expect evaluate to throw and include .code === expected.errorCode
          try {
            evaluate(expression);
            throw new Error(`Expected evaluate("${expression}") to throw an error with code "${expected.errorCode}" but it returned successfully.`);
          } catch (err) {
            // Ensure there is an error object
            expect(err).toBeDefined();
            // Check error.code
            expect(err && err.code).toBe(expected.errorCode);
          }
        } else {
          throw new Error(`Invalid test case expected value: ${JSON.stringify(tc)}`);
        }
      });
    }
  });
}

// Export runTests for programmatic invocation
module.exports = { runTests };

// If the script was executed directly, run tests (node tests/calculator.test.js)
if (require.main === module) {
  // Run and ensure proper exit code on failure
  try {
    runTests();
    console.log('All tests passed.');
    process.exitCode = 0;
  } catch (err) {
    // runTests already sets process.exitCode and logs failures; provide a final message
    console.error('One or more tests failed.');
    // Ensure the error is visible in output
    // Do not throw further to avoid double non-zero exit status in some environments
    process.exitCode = process.exitCode || 1;
  }
}