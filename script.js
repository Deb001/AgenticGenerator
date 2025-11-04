function calculateResult(a, b, operator) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) {
        return 'Error: Division by zero';
      }
      return a / b;
    default:
      return 'Error: Unknown operator';
  }
}

function displayResult(value) {
  const resultEl = document.getElementById('result');
  if (resultEl) {
    resultEl.textContent = value;
  }
}

function handleButtonClick(event) {
  const button = event.currentTarget;
  const operator = button.dataset.operator;
  const aInput = document.getElementById('inputA');
  const bInput = document.getElementById('inputB');

  if (!aInput || !bInput) {
    displayResult('Error: Missing input fields');
    return;
  }

  const a = parseFloat(aInput.value);
  const b = parseFloat(bInput.value);

  if (isNaN(a) || isNaN(b)) {
    displayResult('Error: Invalid input');
    return;
  }

  const result = calculateResult(a, b, operator);
  displayResult(result);
}

function initCalculator() {
  const buttons = document.querySelectorAll('.op-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', handleButtonClick);
  });
}

document.addEventListener('DOMContentLoaded', initCalculator);

window.calculateResult = calculateResult;
window.displayResult = displayResult;
window.handleButtonClick = handleButtonClick;
window.initCalculator = initCalculator;