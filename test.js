function assertEquals(actual, expected, testName) {
    const output = document.getElementById('test-output');
    if (!output) return;
    const result = Object.is(actual, expected);
    const div = document.createElement('div');
    div.textContent = `${testName}: ${result ? 'PASS' : 'FAIL'} (expected ${expected}, got ${actual})`;
    div.style.color = result ? 'green' : 'red';
    output.appendChild(div);
}

function runTests() {
    const tests = [
        { name: 'Addition', fn: () => calculateResult(2, 3, '+'), expected: 5 },
        { name: 'Subtraction', fn: () => calculateResult(5, 2, '-'), expected: 3 },
        { name: 'Multiplication', fn: () => calculateResult(4, 3, '*'), expected: 12 },
        { name: 'Division', fn: () => calculateResult(10, 2, '/'), expected: 5 },
        { name: 'Division by Zero', fn: () => calculateResult(10, 0, '/'), expected: 'Error: Division by zero' },
        { name: 'Invalid Input', fn: () => calculateResult('a', 2, '+'), expected: 'Error: Invalid input' }
    ];

    tests.forEach(test => {
        try {
            const actual = test.fn();
            assertEquals(actual, test.expected, test.name);
        } catch (e) {
            const output = document.getElementById('test-output');
            if (!output) return;
            const div = document.createElement('div');
            div.textContent = `${test.name}: FAIL (exception thrown: ${e.message})`;
            div.style.color = 'red';
            output.appendChild(div);
        }
    });
}

runTests();