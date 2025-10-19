Here's the complete implementation of the `script.js` file for the calculator project, adhering to the specifications provided:

// Calculator class to handle all operations
class Calculator {
  constructor() {
    this.displayValue = '';
    this.operator = null;
    this.previousValue = null;
  }

  // Method to handle number inputs and operations
  handleInput(value) {
    if (isNaN(value)) {
      this.handleOperator(value);
    } else {
      this.displayValue += value;
    }
    this.updateDisplay();
  }

  // Method to handle operators
  handleOperator(nextOperator) {
    const inputValue = parseFloat(this.displayValue);

    if (this.operator && this.previousValue !== null) {
      this.performOperation();
    } else {
      this.previousValue = inputValue;
    }

    this.operator = nextOperator;
    this.displayValue = '';
  }

  // Method to perform the actual operation
  performOperation() {
    if (this.operator === '+') {
      this.previousValue += parseFloat(this.displayValue);
    } else if (this.operator === '-') {
      this.previousValue -= parseFloat(this.displayValue);
    } else if (this.operator === '*') {
      this.previousValue *= parseFloat(this.displayValue);
    } else if (this.operator === '/') {
      if (parseFloat(this.displayValue) === 0) {
        alert('Error: Division by zero');
        this.clear();
        return;
      }
      this.previousValue /= parseFloat(this.displayValue);
    }
    this.displayValue = `${this.previousValue}`;
    this.operator = null;
    this.previousValue = null;
  }

  // Method to update the display
  updateDisplay() {
    const display = document.querySelector('.calculator-screen');
    display.value = this.displayValue;
  }

  // Method to clear the display
  clear() {
    this.displayValue = '';
    this.operator = null;
    this.previousValue = null;
    this.updateDisplay();
  }
}

// Initialize calculator instance
const calculator = new Calculator();

// Add event listeners for buttons
document.querySelector('.calculator-buttons').addEventListener('click', function(event) {
  const target = event.target;
  if (!target.matches('button')) {
    return;
  }

  if (target.classList.contains('operator')) {
    calculator.handleOperator(target.value);
  } else if (target.classList.contains('number')) {
    calculator.handleInput(target.value);
  } else if (target.classList.contains('clear')) {
    calculator.clear();
  }
});

This code sets up a basic calculator with the ability to handle numbers, operations (+, -, *, /), and clearing the display. It includes error handling for division by zero as specified. The HTML and CSS files should be set up to connect with this script correctly for full functionality.