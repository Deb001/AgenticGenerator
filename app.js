'use strict';

// -------------------- State --------------------
const state = {
  currentValue: '0',          // string shown on display
  previousValue: null,        // number | null
  operator: null,             // '+', '-', '*', '/' | null
  waitingForSecondValue: false
};

// -------------------- Core Functions --------------------
function inputDigit(digit) {
  if (state.waitingForSecondValue) {
    state.currentValue = digit;
    state.waitingForSecondValue = false;
    return;
  }

  if (state.currentValue === '0') {
    // Replace leading zero unless digit is also zero
    state.currentValue = digit;
  } else {
    state.currentValue += digit;
  }
}

function inputDecimal() {
  if (state.waitingForSecondValue) {
    state.currentValue = '0.';
    state.waitingForSecondValue = false;
    return;
  }

  if (!state.currentValue.includes('.')) {
    state.currentValue += '.';
  }
}

function calculate(firstOperand, secondOperand, operator) {
  switch (operator) {
    case '+':
      return firstOperand + secondOperand;
    case '-':
      return firstOperand - secondOperand;
    case '*':
      return firstOperand * secondOperand;
    case '/':
      return secondOperand === 0 ? 'Error' : firstOperand / secondOperand;
    default:
      return secondOperand;
  }
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(state.currentValue);

  if (state.operator && !state.waitingForSecondValue) {
    const result = calculate(state.previousValue, inputValue, state.operator);
    state.currentValue = typeof result === 'number' ? String(result) : result;
    state.previousValue = typeof result === 'number' ? result : null;
  } else {
    state.previousValue = inputValue;
  }

  state.operator = nextOperator;
  state.waitingForSecondValue = true;
  updateDisplay();
}

function handleEquals() {
  if (!state.operator || state.previousValue === null) {
    return;
  }

  const secondOperand = parseFloat(state.currentValue);
  const result = calculate(state.previousValue, secondOperand, state.operator);
  state.currentValue = typeof result === 'number' ? String(result) : result;
  state.previousValue = null;
  state.operator = null;
  state.waitingForSecondValue = false;
  updateDisplay();
}

function resetCalculator() {
  state.currentValue = '0';
  state.previousValue = null;
  state.operator = null;
  state.waitingForSecondValue = false;
  updateDisplay();
}

function updateDisplay() {
  const display = document.getElementById('calculator-display');
  if (display) {
    display.value = state.currentValue;
  }
}

// -------------------- Keyboard Handling --------------------
function handleKeyboard(event) {
  const { key } = event;

  if (key >= '0' && key <= '9') {
    inputDigit(key);
    updateDisplay();
    event.preventDefault();
    return;
  }

  if (key === '.' || key === ',') {
    inputDecimal();
    updateDisplay();
    event.preventDefault();
    return;
  }

  if (key === '+' || key === '-' || key === '*' || key === '/' || key === '÷' || key === '×') {
    const opMap = {
      '+': '+',
      '-': '-',
      '*': '*',
      '/': '/',
      '÷': '/',
      '×': '*'
    };
    handleOperator(opMap[key]);
    event.preventDefault();
    return;
  }

  if (key === 'Enter' || key === '=') {
    handleEquals();
    event.preventDefault();
    return;
  }

  if (key === 'Backspace') {
    // Delete last digit (simple implementation)
    if (!state.waitingForSecondValue) {
      if (state.currentValue.length > 1) {
        state.currentValue = state.currentValue.slice(0, -1);
      } else {
        state.currentValue = '0';
      }
      updateDisplay();
    }
    event.preventDefault();
    return;
  }

  if (key === 'Escape') {
    resetCalculator();
    event.preventDefault();
    return;
  }
}

// -------------------- Event Wiring --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Digits
  document.querySelectorAll('[data-digit]').forEach(btn => {
    btn.addEventListener('click', () => {
      inputDigit(btn.dataset.digit);
      updateDisplay();
    });
  });

  // Decimal
  document.querySelectorAll('[data-decimal]').forEach(btn => {
    btn.addEventListener('click', () => {
      inputDecimal();
      updateDisplay();
    });
  });

  // Operators
  document.querySelectorAll('[data-operator]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleOperator(btn.dataset.operator);
    });
  });

  // Equals
  document.querySelectorAll('[data-equals]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleEquals();
    });
  });

  // Clear
  document.querySelectorAll('[data-clear]').forEach(btn => {
    btn.addEventListener('click', () => {
      resetCalculator();
    });
  });

  // Initial display
  updateDisplay();

  // Keyboard
  document.addEventListener('keydown', handleKeyboard);
});