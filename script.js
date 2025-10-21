/* script.js - Calculator core logic */
'use strict';

/* -------------------- Key Mapping -------------------- */
// Maps keyboard keys to the corresponding button IDs in the HTML.
const keyMap = {
  '0': 'btn-0',
  '1': 'btn-1',
  '2': 'btn-2',
  '3': 'btn-3',
  '4': 'btn-4',
  '5': 'btn-5',
  '6': 'btn-6',
  '7': 'btn-7',
  '8': 'btn-8',
  '9': 'btn-9',
  '.': 'btn-dot',
  '+': 'btn-add',
  '-': 'btn-subtract',
  '*': 'btn-multiply',
  '/': 'btn-divide',
  'Enter': 'btn-equals',
  '=': 'btn-equals',
  'Backspace': 'btn-backspace',
  'Escape': 'btn-clear'
};

/* -------------------- Arithmetic Functions -------------------- */
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

/* -------------------- Expression Evaluation -------------------- */
/**
 * Parses a simple binary arithmetic expression (e.g., "12+34")
 * and returns the computed result as a string.
 * If an error occurs, returns the error message.
 *
 * @param {string} expression
 * @returns {string}
 */
function evaluateExpression(expression) {
  // Remove whitespace
  const expr = expression.replace(/\s+/g, '');

  // Regex to capture operand1, operator, operand2
  const match = expr.match(/^([-+]?\d*\.?\d+)([+\-*/])([-+]?\d*\.?\d+)$/);
  if (!match) {
    return 'Invalid expression';
  }

  const [, left, operator, right] = match;
  const a = parseFloat(left);
  const b = parseFloat(right);

  try {
    let result;
    switch (operator) {
      case '+':
        result = add(a, b);
        break;
      case '-':
        result = subtract(a, b);
        break;
      case '*':
        result = multiply(a, b);
        break;
      case '/':
        result = divide(a, b);
        break;
      default:
        return 'Unsupported operator';
    }
    // Trim unnecessary decimal zeros
    return Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?0+$/, '');
  } catch (err) {
    return err.message;
  }
}

/* -------------------- UI Handlers -------------------- */
function handleButtonClick(event) {
  const btn = event.currentTarget;
  const display = document.getElementById('display');
  const value = btn.dataset.value || btn.innerText.trim();

  switch (btn.id) {
    case 'btn-clear':
      display.value = '';
      break;
    case 'btn-backspace':
      display.value = display.value.slice(0, -1);
      break;
    case 'btn-equals':
      display.value = evaluateExpression(display.value);
      break;
    default:
      // Append the button's value to the display
      display.value += value;
  }
}

/**
 * Translates a keyboard event into a button click.
 *
 * @param {KeyboardEvent} event
 */
function handleKeyboardInput(event) {
  const key = event.key;
  const btnId = keyMap[key];
  if (!btnId) return; // Unmapped key

  const btn = document.getElementById(btnId);
  if (!btn) return;

  // Prevent default actions for keys we handle (e.g., Backspace)
  event.preventDefault();

  // Simulate a click on the corresponding button
  btn.click();
}

/* -------------------- Initialization -------------------- */
function initCalculator() {
  // Attach click listeners to all calculator buttons
  const buttons = document.querySelectorAll('button[data-value], button[id]');
  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

  // Global keyboard handling
  document.addEventListener('keydown', handleKeyboardInput);
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCalculator);