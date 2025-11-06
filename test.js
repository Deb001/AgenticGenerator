import { Calculator } from "./script.js";

function assertEqual(actual, expected, testName) {
  const areEqual =
    Number.isNaN(actual) && Number.isNaN(expected)
      ? true
      : actual === expected;
  if (!areEqual) {
    throw new Error(
      `${testName} – Expected: ${expected}, Received: ${actual}`
    );
  }
}

function runTests() {
  const testCases = [
    // add
    {
      method: "add",
      args: [1, 2],
      expected: 3,
      name: "add positive integers",
    },
    {
      method: "add",
      args: [-5, 5],
      expected: 0,
      name: "add negative and positive integer",
    },
    {
      method: "add",
      args: [0, 0],
      expected: 0,
      name: "add zeros",
    },
    // subtract
    {
      method: "subtract",
      args: [10, 4],
      expected: 6,
      name: "subtract positive integers",
    },
    {
      method: "subtract",
      args: [5, 10],
      expected: -5,
      name: "subtract resulting negative",
    },
    // multiply
    {
      method: "multiply",
      args: [3, 7],
      expected: 21,
      name: "multiply positive integers",
    },
    {
      method: "multiply",
      args: [-2, 4],
      expected: -8,
      name: "multiply negative and positive",
    },
    {
      method: "multiply",
      args: [0, 100],
      expected: 0,
      name: "multiply by zero",
    },
    // divide
    {
      method: "divide",
      args: [20, 4],
      expected: 5,
      name: "divide positive integers",
    },
    {
      method: "divide",
      args: [5, 2],
      expected: 2.5,
      name: "divide resulting float",
    },
    {
      method: "divide",
      args: [10, 0],
      expected: Infinity,
      name: "divide by zero returns Infinity",
    },
    // invalid input
    {
      method: "add",
      args: ["a", 2],
      expected: NaN,
      name: "add with non‑numeric input",
    },
    {
      method: "divide",
      args: [null, 5],
      expected: NaN,
      name: "divide with null input",
    },
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const tc of testCases) {
    try {
      const actual = Calculator[tc.method](...tc.args);
      assertEqual(actual, tc.expected, tc.name);
      passed++;
      results.push(`✅ ${tc.name}`);
    } catch (e) {
      failed++;
      results.push(`❌ ${tc.name} – ${e.message}`);
    }
  }

  const summary = `Passed: ${passed}, Failed: ${failed}`;
  const outputElement = document.getElementById("test-results");
  if (outputElement) {
    outputElement.innerHTML = `<pre>${summary}\n${results.join(
      "\n"
    )}</pre>`;
  } else {
    console.log(summary);
    console.log(results.join("\n"));
  }
}

export { assertEqual, runTests };

runTests();