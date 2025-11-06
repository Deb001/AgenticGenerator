class Calculator {
  static add(a, b) {
    return a + b;
  }

  static subtract(a, b) {
    return a - b;
  }

  static multiply(a, b) {
    return a * b;
  }

  static divide(a, b) {
    if (b === 0) {
      return 'Error: Division by zero';
    }
    return a / b;
  }

  static handleCalculate() {
    const val1 = parseFloat(document.getElementById('value1').value);
    const val2 = parseFloat(document.getElementById('value2').value);
    const operation = document.getElementById('operation').value;
    const resultElem = document.getElementById('result');

    if (isNaN(val1) || isNaN(val2)) {
      resultElem.textContent = 'Error: Invalid input';
      return;
    }

    let result;
    switch (operation) {
      case 'add':
        result = Calculator.add(val1, val2);
        break;
      case 'subtract':
        result = Calculator.subtract(val1, val2);
        break;
      case 'multiply':
        result = Calculator.multiply(val1, val2);
        break;
      case 'divide':
        result = Calculator.divide(val1, val2);
        break;
      default:
        result = 'Error: Unknown operation';
    }

    resultElem.textContent = result;
  }
}

window.Calculator = Calculator;