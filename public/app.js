// Frontend logic for the Accessible Calculator
// Exported for potential downstream use

/**
 * Utility function to safely set text content (prevents XSS).
 * @param {HTMLElement} element
 * @param {string} value
 */
function setSafeText(element, value) {
  element.textContent = value;
}

/**
 * Class representing the Calculator UI and its interactions.
 */
export class CalculatorUI {
  /**
   * Create a CalculatorUI instance.
   */
  constructor() {
    /** @type {HTMLElement} */
    this.displayEl = document.getElementById('display');
    /** @type {HTMLElement} */
    this.keypadEl = document.getElementById('keypad');
    /** @type {{ expression: string }} */
    this.state = { expression: '' };

    // Bind methods for event listeners
    this.handleButtonPress = this.handleButtonPress.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Initialise event listeners and set initial display.
   */
  init() {
    // Click handling for keypad buttons
    this.keypadEl.addEventListener('click', (event) => {
      const target = event.target;
      if (target.matches('button[data-key]')) {
        const key = target.getAttribute('data-key');
        this.handleButtonPress(key);
      }
    });

    // Keyboard handling
    document.addEventListener('keydown', this.handleKeyDown);

    // Initialise display
    this.updateDisplay('0');
  }

  /**
   * Process a button press or equivalent keyboard key.
   * @param {string} key
   */
  handleButtonPress(key) {
    if (key === 'C') {
      // Clear the current expression
      this.state.expression = '';
      this.updateDisplay('0');
      return;
    }

    if (key === '=') {
      // Evaluate the current expression via the backend API
      const expr = this.state.expression.trim();
      if (expr === '') {
        this.updateDisplay('0');
        return;
      }
      this.sendExpression(expr)
        .then((result) => {
          this.updateDisplay(String(result));
          // After a successful evaluation, start a new expression with the result
          this.state.expression = String(result);
        })
        .catch((err) => {
          this.updateDisplay(err.message || 'Error');
          console.error('Evaluation error:', err);
        });
      return;
    }

    // Append allowed characters (digits, operators, decimal point)
    const allowedPattern = /^[0-9+\-*/.]+$/;
    if (allowedPattern.test(key)) {
      this.state.expression += key;
      this.updateDisplay(this.state.expression);
    } else {
      // Ignore any unexpected keys
    }
  }

  /**
   * Keyboard event handler – maps physical keys to calculator actions.
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    const keyMap = {
      'Enter': '=',
      '=': '=',
      'Escape': 'C',
      'Backspace': 'C',
      '*': '*',
      '/': '/',
      '+': '+',
      '-': '-',
      '.': '.',
    };

    if (e.key in keyMap) {
      e.preventDefault();
      this.handleButtonPress(keyMap[e.key]);
      return;
    }

    // Numeric keys 0-9
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      this.handleButtonPress(e.key);
    }
  }

  /**
   * Send the arithmetic expression to the server for evaluation.
   * @param {string} expr
   * @returns {Promise<number>} Resolves with the numeric result.
   */
  async sendExpression(expr) {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression: expr }),
      });

      if (!response.ok) {
        // Attempt to extract a JSON error message from the server
        let errorMessage = 'Server error';
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMessage = errData.message;
          }
        } catch (_) {
          // ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (typeof data.result !== 'number') {
        throw new Error('Invalid response from server');
      }
      return data.result;
    } catch (networkError) {
      // Distinguish network failures from other errors
      if (networkError instanceof TypeError) {
        // Fetch throws TypeError on network failure
        throw new Error('Unable to reach server');
      }
      throw networkError;
    }
  }

  /**
   * Update the calculator display safely.
   * @param {string} value
   */
  updateDisplay(value) {
    setSafeText(this.displayEl, value);
  }
}

/**
 * Initialise the calculator UI once the DOM is ready.
 */
export function init() {
  const ui = new CalculatorUI();
  ui.init();
}

// Automatically start the calculator when the module is loaded.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
