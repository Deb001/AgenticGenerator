// script.js
class Calculator {
  constructor() {
    this.display = document.getElementById('display');
  }

  handleButtonClick(event) {
    const buttonValue = event.target.value;
    if (buttonValue === 'C') {
      this.clearDisplay();
    } else {
      this.updateDisplay(buttonValue);
    }
  }

  updateDisplay(value) {
    this.display.value += value;
  }

  clearDisplay() {
    this.display.value = '';
  }

  performOperation() {
    try {
      const expression = this.display.value;
      if (expression === '') return;
      const result = eval(expression);
      this.display.value = result;
    } catch (error) {
      this.display.value = 'Error';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const calculator = new Calculator();
  const buttons = document.querySelectorAll('.button');
  buttons.forEach(button => {
    button.addEventListener('click', event => calculator.handleButtonClick(event));
  });

  document.getElementById('equal').addEventListener('click', () => calculator.performOperation());
});