document.addEventListener('DOMContentLoaded', () => {
  const num1Input = document.getElementById('num1');
  const num2Input = document.getElementById('num2');
  const operationSelect = document.getElementById('operation');
  const resultDiv = document.getElementById('result');
  const calcBtn = document.getElementById('calcBtn');

  const calculate = () => {
    const a = parseFloat(num1Input.value) || 0;
    const b = parseFloat(num2Input.value) || 0;
    const op = operationSelect.value;
    let res;
    switch (op) {
      case '+':
        res = a + b;
        break;
      case '-':
        res = a - b;
        break;
      case '*':
        res = a * b;
        break;
      case '/':
        if (b === 0) {
          resultDiv.textContent = 'Result: Error (division by zero)';
          return;
        }
        res = a / b;
        break;
      default:
        res = NaN;
    }
    resultDiv.textContent = `Result: ${res}`;
  };

  calcBtn.addEventListener('click', calculate);
});