class Calculator {
  constructor() {
    this.display = document.getElementById('display');
    this.init();
  }

  init() {
    // Add event listeners to all buttons
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
      button.addEventListener('click', () => this.handleInput(button.textContent));
    });
  }

  handleInput(input) {
    if (isNaN(input)) {
      // Handle non-numeric inputs like operators
      switch (input) {
        case 'C':
          this.display.value = '';
          break;
        case '+':
        case '-':
        case '*':
        case '/':
          this.display.value += ` ${input} `;
          break;
        case '=':
          try {
            this.display.value = this.performOperation(this.display.value);
          } catch (error) {
            this.display.value = 'Error';
          }
          break;
        default:
          // Handle other cases if necessary
          break;
      }
    } else {
      // Append numeric input to the display
      this.display.value += input;
    }
  }

  performOperation(expression) {
    const values = expression.split(' ');
    const value1 = parseFloat(values[0]);
    const operator = values[1];
    const value2 = parseFloat(values[2]);

    if (operator === '+') {
      return value1 + value2;
    } else if (operator === '-') {
      return value1 - value2;
    } else if (operator === '*') {
      return value1 * value2;
    } else if (operator === '/') {
      if (value2 === 0) {
        throw new Error('Division by zero');
      }
      return value1 / value2;
    } else {
      throw new Error('Invalid operator');
    }
  }
}

// Initialize the calculator
const calculator = new Calculator();