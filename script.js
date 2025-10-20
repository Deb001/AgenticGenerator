// script.js

class Calculator {
  constructor() {
    this.currentInput = '';
    this.previousInput = '';
    this.operator = null;
    this.initialize();
  }

  initialize() {
    document.querySelectorAll('.number').forEach(button => button.addEventListener('click', () => this.handleNumberClick(button.textContent)));
    document.querySelectorAll('.operator').forEach(button => button.addEventListener('click', () => this.handleOperatorClick(button.textContent)));
    document.querySelector('.equals').addEventListener('click', () => this.performCalculation());
    document.querySelector('.clear').addEventListener('click', () => this.resetCalculator());
    document.addEventListener('keydown', event => this.handleKeyboardInput(event));
  }

  handleNumberClick(number) {
    if (this.currentInput === 'Error') return;
    this.currentInput += number;
    this.updateDisplay();
  }

  handleOperatorClick(operator) {
    if (this.currentInput === '' && operator !== '-') {
      // Allow negative numbers
      this.currentInput = '-';
    } else if (this.currentInput !== '') {
      this.performCalculation();
      this.previousInput = this.currentInput;
      this.operator = operator;
      this.currentInput = '';
    }
  }

  handleKeyboardInput(event) {
    const keyMap = {
      '0': '.number-0',
      '1': '.number-1',
      '2': '.number-2',
      '3': '.number-3',
      '4': '.number-4',
      '5': '.number-5',
      '6': '.number-6',
      '7': '.number-7',
      '8': '.number-8',
      '9': '.number-9',
      '+': '.operator-add',
      '-': '.operator-subtract',
      '*': '.operator-multiply',
      '/': '.operator-divide',
      'Enter': '.equals',
      'Escape': '.clear'
    };

    const key = event.key;
    if (keyMap[key]) {
      document.querySelector(keyMap[key]).click();
    }
  }

  performCalculation() {
    if (this.currentInput === '' || this.previousInput === '') return;
    let result;
    const prev = parseFloat(this.previousInput);
    const current = parseFloat(this.currentInput);

    switch (this.operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          this.currentInput = 'Error';
          return this.updateDisplay();
        }
        result = prev / current;
        break;
      default:
        return;
    }

    this.currentInput = result.toString();
    this.previousInput = '';
    this.operator = null;
    this.updateDisplay();
  }

  resetCalculator() {
    this.currentInput = '';
    this.previousInput = '';
    this.operator = null;
    this.updateDisplay();
  }

  updateDisplay() {
    document.querySelector('.display').textContent = this.currentInput;
  }
}

new Calculator();