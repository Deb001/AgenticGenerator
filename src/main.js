// src/main.js
import { evaluate } from './evaluator.js';

let currentExpression = ''; // holds the string the user is building

/**
 * Initialize the calculator UI once the DOM is ready.
 */
function init() {
  createButtons();

  // Attach listeners
  const buttonsContainer = document.getElementById('buttons');
  buttonsContainer.addEventListener('click', handleButtonClick);

  document.addEventListener('keydown', handleKeyPress);
}

/**
 * Generate calculator buttons and insert them into the #buttons container.
 * Each button receives a data-action attribute that mirrors its label
 * (e.g., "1", "+", "C", "⌫", "=").
 */
function createButtons() {
  const buttonDefs = [
    { label: 'C', action: 'C' },
    { label: '⌫', action: '⌫' },
    { label: '(', action: '(' },
    { label: ')', action: ')' },
    { label: '7', action: '7' },
    { label: '8', action: '8' },
    { label: '9', action: '9' },
    { label: '/', action: '/' },
    { label: '4', action: '4' },
    { label: '5', action: '5' },
    { label: '6', action: '6' },
    { label: '*', action: '*' },
    { label: '1', action: '1' },
    { label: '2', action: '2' },
    { label: '3', action: '3' },
    { label: '-', action: '-' },
    { label: '0', action: '0' },
    { label: '.', action: '.' },
    { label: '=', action: '=' },
    { label: '+', action: '+' }
  ];

  const container = document.getElementById('buttons');
  buttonDefs.forEach(({ label, action }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.dataset.action = action;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('role', 'button');
    container.appendChild(btn);
  });
}

/**
 * Click handler for calculator buttons.
 * @param {MouseEvent} event
 */
function handleButtonClick(event) {
  const target = event.target;
  if (!target.matches('button[data-action]')) return;

  const action = target.dataset.action;

  switch (action) {
    case 'C':
      clearDisplay();
      break;
    case '⌫':
      deleteLast();
      break;
    case '=':
      try {
        const result = evaluate(currentExpression);
        updateDisplay(result);
        currentExpression = result.toString();
      } catch (e) {
        updateDisplay(e.message);
      }
      break;
    default:
      // Append digits, operators, parentheses, decimal point
      currentExpression += action;
      updateDisplay(currentExpression);
  }
}

/**
 * Keyboard handler that mirrors button actions.
 * @param {KeyboardEvent} event
 */
function handleKeyPress(event) {
  const key = event.key;

  // Map keys to actions
  const digitOrOperator = /^[0-9\.\+\-\*\/\(\)]$/.test(key);
  if (digitOrOperator) {
    currentExpression += key;
    updateDisplay(currentExpression);
    return;
  }

  switch (key) {
    case 'Enter':
      // Simulate '=' button
      event.preventDefault();
      try {
        const result = evaluate(currentExpression);
        updateDisplay(result);
        currentExpression = result.toString();
      } catch (e) {
        updateDisplay(e.message);
      }
      break;
    case 'Backspace':
      event.preventDefault();
      deleteLast();
      break;
    case 'Escape':
      event.preventDefault();
      clearDisplay();
      break;
    case 'c':
    case 'C':
      clearDisplay();
      break;
    default:
      // Unsupported key – ignore
      break;
  }
}

/**
 * Write the provided content into the display element.
 * @param {string|number} content
 */
function updateDisplay(content) {
  const display = document.getElementById('display');
  display.textContent = content;
}

/**
 * Reset the calculator state and clear the display.
 */
function clearDisplay() {
  currentExpression = '';
  updateDisplay('');
}

/**
 * Remove the last character from the current expression and update the display.
 */
function deleteLast() {
  currentExpression = currentExpression.slice(0, -1);
  updateDisplay(currentExpression);
}

// Kick off the app when the DOM is ready
document.addEventListener('DOMContentLoaded', init);