/*
 * CalculatorUI – Front‑end controller for the calculator.
 * Handles UI updates, keyboard & mouse interaction, client‑side validation,
 * and communication with the backend evaluation API.
 */

class CalculatorUI {
  /**
   * Create a new CalculatorUI instance and bind all required events.
   */
  constructor() {
    /** @type {HTMLInputElement} */
    this.displayElement = document.getElementById('display');
    /** @type {string} */
    this.expression = '';
    /** @type {HTMLElement} */
    this.keypad = document.getElementById('keypad');

    this._bindButtonClicks();
    this._bindKeyboard();
  }

  /**
   * Attach click delegation to the keypad container.
   * @private
   */
  _bindButtonClicks() {
    this.keypad.addEventListener('click', (event) => {
      const target = event.target;
      if (target.matches('button[data-key]')) {
        const key = target.getAttribute('data-key');
        this.handleButtonPress(key);
      }
    });
  }

  /**
   * Attach a global keyboard listener that maps physical keys to calculator actions.
   * @private
   */
  _bindKeyboard() {
    document.addEventListener('keydown', (event) => {
      const keyMap = {
        'Enter': '=',
        '=': '=',
        'Escape': 'C',
        'c': 'C',
        'C': 'C',
        'Backspace': 'Backspace',
        'Delete': 'Backspace',
        '+': '+',
        '-': '-',
        '*': '*',
        '/': '/',
        '(': '(',
        ')': ')',
        '.': '.',
        '0': '0',
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9'
      };
      const mappedKey = keyMap[event.key];
      if (mappedKey) {
        event.preventDefault();
        this.handleButtonPress(mappedKey);
      }
    });
  }

  /**
   * Process a button or keyboard press.
   * @param {string} key The logical key identifier (e.g., "1", "+", "C", "=").
   */
  handleButtonPress(key) {
    switch (key) {
      case 'C':
        this.expression = '';
        this._updateDisplay('');
        break;
      case '=':
        this.evaluateExpression();
        break;
      case 'Backspace':
        this.expression = this.expression.slice(0, -1);
        this._updateDisplay(this.expression);
        break;
      default:
        this.expression += key;
        this._updateDisplay(this.expression);
    }
  }

  /**
   * Update the read‑only display element.
   * @param {string} value The text to show.
   * @private
   */
  _updateDisplay(value) {
    this.displayElement.value = value;
  }

  /**
   * Validate that the expression contains only allowed characters.
   * @param {string} expression The raw expression string.
   * @returns {boolean} True if the expression is safe to send to the server.
   */
  validateInput(expression) {
    const allowedPattern = /^[0-9+\-*/().\s]+$/;
    return allowedPattern.test(expression);
  }

  /**
   * Send the current expression to the backend for evaluation.
   * Handles network errors, server‑side validation errors, and updates the UI.
   */
  async evaluateExpression() {
    const expr = this.expression.trim();
    if (!this.validateInput(expr)) {
      this._updateDisplay('Invalid input');
      return;
    }
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expression: expr })
      });

      if (!response.ok) {
        this._updateDisplay('Error');
        return;
      }

      const data = await response.json();
      if (data.error) {
        this._updateDisplay(this._sanitize(data.error));
      } else if (data.result !== undefined) {
        const resultStr = String(data.result);
        this._updateDisplay(resultStr);
        this.expression = resultStr;
      } else {
        this._updateDisplay('Error');
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
      this._updateDisplay('Unable to reach server');
    }
  }

  /**
   * Simple sanitisation to prevent XSS when displaying server‑provided messages.
   * @param {string} str The raw string.
   * @returns {string} A safe string.
   * @private
   */
  _sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Expose the class for potential downstream usage (e.g., testing).
window.CalculatorUI = CalculatorUI;

document.addEventListener('DOMContentLoaded', () => {
  new CalculatorUI();
});