/**
 * Validates raw input strings for the calculator.
 * @param {string} a - Raw value from the first number input.
 * @param {string} b - Raw value from the second number input.
 * @returns {{valid: boolean, errors: string[]}} Validation result.
 */
export function validateInputs(a, b) {
  const errors = [];

  if (a.trim() === '') {
    errors.push('First operand is required.');
  }
  if (b.trim() === '') {
    errors.push('Second operand is required.');
  }

  const numA = Number(a);
  const numB = Number(b);

  if (a.trim() !== '' && (isNaN(numA) || !Number.isFinite(numA))) {
    errors.push('First operand must be a valid number.');
  }
  if (b.trim() !== '' && (isNaN(numB) || !Number.isFinite(numB))) {
    errors.push('Second operand must be a valid number.');
  }

  // Optional: enforce safe integer range
  const MAX_SAFE = Number.MAX_SAFE_INTEGER;
  const MIN_SAFE = Number.MIN_SAFE_INTEGER;
  if (a.trim() !== '' && (numA > MAX_SAFE || numA < MIN_SAFE)) {
    errors.push('First operand is out of safe integer range.');
  }
  if (b.trim() !== '' && (numB > MAX_SAFE || numB < MIN_SAFE)) {
    errors.push('Second operand is out of safe integer range.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Performs the selected arithmetic operation.
 * @param {number} a - First operand.
 * @param {number} b - Second operand.
 * @param {string} op - Operator: '+', '-', '*', '/'.
 * @returns {{result: number|null, error: string|null}} Operation outcome.
 */
export function performOperation(a, b, op) {
  try {
    switch (op) {
      case '+':
        return { result: a + b, error: null };
      case '-':
        return { result: a - b, error: null };
      case '*':
        return { result: a * b, error: null };
      case '/':
        if (b === 0) {
          return { result: null, error: 'Division by zero is not allowed.' };
        }
        return { result: a / b, error: null };
      default:
        return { result: null, error: `Unsupported operator "${op}".` };
    }
  } catch (e) {
    return { result: null, error: 'An unexpected error occurred during calculation.' };
  }
}

/**
 * Displays the numeric result in the UI.
 * @param {number} value - Computed result.
 */
export function displayResult(value) {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  if (resultDiv) {
    resultDiv.textContent = `Result: ${value}`;
  }
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.classList.remove('error');
  }
}

/**
 * Displays an error message in the UI.
 * @param {string} message - Human‑readable error description.
 */
export function displayError(message) {
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('error');
  }
  if (resultDiv) {
    resultDiv.textContent = '';
  }
}

/**
 * Main entry point invoked when the user clicks the Calculate button.
 * Orchestrates validation, computation, and UI updates.
 */
export function calculateResult() {
  try {
    const operand1El = document.getElementById('operand1');
    const operand2El = document.getElementById('operand2');
    const operatorEl = document.getElementById('operator');

    if (!operand1El || !operand2El || !operatorEl) {
      throw new Error('Required input elements are missing from the DOM.');
    }

    const rawA = operand1El.value;
    const rawB = operand2El.value;
    const op = operatorEl.value;

    // Validation
    const validation = validateInputs(rawA, rawB);
    if (!validation.valid) {
      displayError(validation.errors.join(' '));
      return;
    }

    // Convert to numbers
    const a = Number(rawA);
    const b = Number(rawB);

    // Perform operation
    const operation = performOperation(a, b, op);
    if (operation.error) {
      displayError(operation.error);
    } else {
      displayResult(operation.result);
    }
  } catch (e) {
    console.error('Unexpected error in calculateResult:', e);
    displayError('An unexpected error occurred. Please try again.');
  }
}

// Attach event listener after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const calcBtn = document.getElementById('calculateBtn');
  if (calcBtn) {
    calcBtn.addEventListener('click', calculateResult);
  } else {
    console.error('Calculate button not found in DOM.');
  }
});