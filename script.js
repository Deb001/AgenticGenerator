'use strict';

// Calculator class encapsulating all state and operations
class Calculator {
  constructor() {
    this.currentOperand = '';
    this.previousOperand = '';
    this.operator = null;
    this.error = null;
  }

  // Append a digit or decimal point
  appendNumber(digit) {
    if (this.error) return; // ignore input when in error state
    if (digit === '.' && this.currentOperand.includes('.')) return;
    this.currentOperand = `${this.currentOperand}${digit}`;
  }

  // Choose an operator (+, -, *, /)
  chooseOperator(op) {
    if (this.error) return;
    if (this.currentOperand === '' && this.previousOperand === '') {
      // No operand to operate on
      return;
    }
    if (this.currentOperand === '' && this.previousOperand !== '') {
      // Change operator before entering next number
      this.operator = op;
      return;
    }
    if (this.previousOperand !== '') {
      // Compute intermediate result
      const result = this.compute();
      if (typeof result === 'string') {
        // Error occurred
        return;
      }
      this.previousOperand = result.toString();
    } else {
      this.previousOperand = this.currentOperand;
    }
    this.operator = op;
    this.currentOperand = '';
  }

  // Perform computation based on stored operator
  compute() {
    if (this.error) return this.error;
    if (this.operator === null || this.currentOperand === '' || this.previousOperand === '') {
      return this.currentOperand || this.previousOperand;
    }

    const prev = parseFloat(this.previousOperand);
    const curr = parseFloat(this.currentOperand);
    let computation;

    switch (this.operator) {
      case '+':
        computation = prev + curr;
        break;
      case '-':
        computation = prev - curr;
        break;
      case '*':
        computation = prev * curr;
        break;
      case '/':
        if (curr === 0) {
          this.error = 'Error: Division by zero';
          this.clearOperands();
          return this.error;
        }
        computation = prev / curr;
        break;
      default:
        return;
    }

    // Reset state with result
    this.previousOperand = computation.toString();
    this.currentOperand = '';
    this.operator = null;
    this.error = null;
    return computation;
  }

  // Clear all state
  clear() {
    this.currentOperand = '';
    this.previousOperand = '';
    this.operator = null;
    this.error = null;
  }

  // Remove last character from current operand
  backspace() {
    if (this.error) return;
    this.currentOperand = this.currentOperand.slice(0, -1);
  }

  // Get value to display
  getDisplayValue() {
    if (this.currentOperand !== '') return this.currentOperand;
    if (this.previousOperand !== '') return this.previousOperand;
    return '0';
  }

  // Helper to clear operands after an error
  clearOperands() {
    this.currentOperand = '';
    this.previousOperand = '';
    this.operator = null;
  }
}

// Singleton calculator instance
let calculator = null;

// Update the calculator display
function updateDisplay() {
  const display = document.getElementById('display');
  if (!display) return;
  if (calculator.error) {
    display.textContent = calculator.error;
  } else {
    display.textContent = calculator.getDisplayValue();
  }
}

// Handle button clicks
function handleButtonClick(event) {
  const button = event.target.closest('.calc-btn');
  if (!button) return;
  const key = button.dataset.key;

  if (!key) return;

  if (/[0-9]/.test(key) || key === '.') {
    calculator.appendNumber(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    calculator.chooseOperator(key);
  } else if (key === '=') {
    calculator.compute();
  } else if (key === 'C') {
    calculator.clear();
  } else if (key === '←') {
    calculator.backspace();
  }

  updateDisplay();
}

// Handle keyboard input
function handleKeyboard(event) {
  const { key } = event;

  if (/[0-9]/.test(key) || key === '.') {
    calculator.appendNumber(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    calculator.chooseOperator(key);
  } else if (key === 'Enter') {
    calculator.compute();
  } else if (key === 'Backspace') {
    calculator.backspace();
  } else if (key === 'Escape') {
    calculator.clear();
  } else {
    // Unmapped key; ignore
    return;
  }

  updateDisplay();
}

// Initialize the calculator application
function init() {
  calculator = new Calculator();

  const buttons = document.querySelectorAll('.calc-btn');
  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

  document.addEventListener('keydown', handleKeyboard);

  updateDisplay();
}

// Run init when DOM is ready
window.addEventListener('DOMContentLoaded', init);