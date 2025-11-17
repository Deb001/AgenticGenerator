(() => {
  const display = document.getElementById('display');
  const liveRegion = document.getElementById('live-region');
  const buttons = document.querySelectorAll('.calc-btn');

  let operand1 = null;
  let operand2 = null;
  let operator = null;
  let shouldResetDisplay = false;

  const updateLiveRegion = (message) => {
    liveRegion.textContent = '';
    // Force a reflow to ensure screen readers announce the change
    void liveRegion.offsetWidth;
    liveRegion.textContent = message;
  };

  const clearAll = () => {
    display.value = '';
    operand1 = operand2 = operator = null;
    shouldResetDisplay = false;
    updateLiveRegion('Calculator cleared');
  };

  const appendNumber = (num) => {
    if (shouldResetDisplay) {
      display.value = '';
      shouldResetDisplay = false;
    }
    if (num === '.' && display.value.includes('.')) return;
    display.value += num;
  };

  const chooseOperator = (op) => {
    if (display.value === '' && operand1 === null) return;
    if (operand1 === null) {
      operand1 = parseFloat(display.value);
    } else if (!shouldResetDisplay) {
      operand2 = parseFloat(display.value);
      const result = compute();
      display.value = result;
      operand1 = result;
    }
    operator = op;
    shouldResetDisplay = true;
    updateLiveRegion(`Operator ${op} selected`);
  };

  const compute = () => {
    if (operator === null || operand1 === null) return parseFloat(display.value);
    operand2 = parseFloat(display.value);
    let result;
    switch (operator) {
      case 'add':
        result = operand1 + operand2;
        break;
      case 'subtract':
        result = operand1 - operand2;
        break;
      case 'multiply':
        result = operand1 * operand2;
        break;
      case 'divide':
        result = operand2 === 0 ? 'Error' : operand1 / operand2;
        break;
      default:
        result = operand2;
    }
    updateLiveRegion(`Result is ${result}`);
    return result;
  };

  const handleEquals = () => {
    if (operator === null) return;
    const result = compute();
    display.value = result;
    operand1 = result;
    operator = null;
    shouldResetDisplay = true;
  };

  const handleButtonClick = (e) => {
    const { value, action } = e.target.dataset;
    if (value !== undefined) {
      appendNumber(value);
    } else if (action) {
      switch (action) {
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
          chooseOperator(action);
          break;
        case 'decimal':
          appendNumber('.');
          break;
        case 'equals':
          handleEquals();
          break;
        case 'clear':
          clearAll();
          break;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      appendNumber(e.key);
    } else if (e.key === '.') {
      appendNumber('.');
    } else if (['+', '-', '*', '/'].includes(e.key)) {
      const map = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
      chooseOperator(map[e.key]);
    } else if (e.key === 'Enter' || e.key === '=') {
      handleEquals();
    } else if (e.key === 'Escape') {
      clearAll();
    }
  };

  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));
  document.addEventListener('keydown', handleKeyDown);
})();