// test.js
// Automated test suite for calculator.js functions.

/**
 * Helper that throws an error if actual !== expected.
 * @param {*} actual
 * @param {*} expected
 * @param {string} description
 */
function assertEqual(actual, expected, description) {
  if (actual !== expected) {
    throw new Error(`${description} - Expected ${expected}, but got ${actual}`);
  }
}

/**
 * Runs all defined test cases and writes results to the DOM.
 */
function runTests() {
  const resultsContainer = document.getElementById('test-results');
  if (!resultsContainer) {
    console.error('No element with id "test-results" found.');
    return;
  }

  const tests = [
    // Normal operations
    {
      description: 'add(2, 3) should return 5',
      fn: () => add(2, 3),
      expected: 5,
      expectError: false
    },
    {
      description: 'add(0.1, 0.2) should handle decimals',
      fn: () => add(0.1, 0.2),
      expected: 0.30000000000000004, // JavaScript floating point
      expectError: false
    },
    {
      description: 'subtract(10, 4) should return 6',
      fn: () => subtract(10, 4),
      expected: 6,
      expectError: false
    },
    {
      description: 'multiply(3, 5) should return 15',
      fn: () => multiply(3, 5),
      expected: 15,
      expectError: false
    },
    {
      description: 'divide(20, 4) should return 5',
      fn: () => divide(20, 4),
      expected: 5,
      expectError: false
    },
    // Division by zero
    {
      description: 'divide(10, 0) should throw division by zero error',
      fn: () => divide(10, 0),
      expected: 'Error: Division by zero',
      expectError: true
    },
    // Non‑numeric inputs
    {
      description: 'add("a", 2) should throw non‑numeric error',
      fn: () => add('a', 2),
      expected: 'Error: Non-numeric input',
      expectError: true
    },
    {
      description: 'subtract(5, null) should throw non‑numeric error',
      fn: () => subtract(5, null),
      expected: 'Error: Non-numeric input',
      expectError: true
    },
    {
      description: 'multiply(undefined, 3) should throw non‑numeric error',
      fn: () => multiply(undefined, 3),
      expected: 'Error: Non-numeric input',
      expectError: true
    },
    {
      description: 'divide("10", "2") should return 5',
      fn: () => divide('10', '2'),
      expected: 5,
      expectError: false
    }
  ];

  tests.forEach(test => {
    const line = document.createElement('p');
    try {
      const result = test.fn();
      if (test.expectError) {
        line.textContent = `FAIL: ${test.description} - Expected error but got result ${result}`;
        line.style.color = 'red';
      } else {
        assertEqual(result, test.expected, test.description);
        line.textContent = `PASS: ${test.description}`;
        line.style.color = 'green';
      }
    } catch (e) {
      if (test.expectError && e.message === test.expected) {
        line.textContent = `PASS: ${test.description}`;
        line.style.color = 'green';
      } else {
        line.textContent = `FAIL: ${test.description} - ${e.message}`;
        line.style.color = 'red';
      }
    }
    resultsContainer.appendChild(line);
  });
}

// Execute tests automatically when the script loads.
try {
  runTests();
} catch (globalError) {
  const resultsContainer = document.getElementById('test-results');
  if (resultsContainer) {
    const line = document.createElement('p');
    line.textContent = `UNEXPECTED FAILURE: ${globalError.message}`;
    line.style.color = 'red';
    resultsContainer.appendChild(line);
  } else {
    console.error('Test execution failed:', globalError);
  }
}
