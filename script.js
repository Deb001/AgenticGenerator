class Calculator {
  constructor() {
    this.result = 0;
  }

  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return a / b;
  }

  clear() {
    this.result = 0;
  }
}

const calculator = new Calculator();

function handleInput(event) {
  const display = document.getElementById('display');
  const inputValue = event.target.value;

  try {
    if (inputValue === 'C') {
      calculator.clear();
      display.value = '';
    } else {
      const result = eval(`${calculator.result}${inputValue}`);
      calculator.result = result;
      display.value = result;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      alert('Invalid input');
    } else if (error.message === "Cannot divide by zero") {
      alert(error.message);
    } else {
      throw error;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('.button');

  buttons.forEach(button => {
    button.addEventListener('click', handleInput);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      try {
        display.value = eval(display.value);
        calculator.result = parseFloat(display.value);
      } catch (error) {
        alert('Invalid input');
      }
    } else if (event.key === 'Escape') {
      display.value = '';
      calculator.clear();
    } else {
      handleInput(event);
    }
  });
});