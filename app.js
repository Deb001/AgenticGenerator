/* app.js
 * Vanilla JavaScript calculator engine and UI binding.
 * No external dependencies.
 *
 * Exposes:
 * - Pure arithmetic utilities: add, subtract, multiply, divide
 * - safeRound, formatForDisplay
 * - createCalculator(): returns a calculator instance (DOM-agnostic)
 * - bindUI(root): binds UI buttons with data-action/data-value to a calculator instance
 *
 * The calculator instance methods are all no-throw. Errors are recorded in state.error.
 */

/* =========================
 * Pure arithmetic functions
 * ========================= */

/**
 * Pure addition.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}

/**
 * Pure subtraction.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function subtract(a, b) {
  return a - b;
}

/**
 * Pure multiplication.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Pure division. Throws Error on divide-by-zero.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {Error} when b === 0
 */
function divide(a, b) {
  if (b === 0) {
    throw new Error('Divide by zero');
  }
  return a / b;
}

/* ===============================================
 * Numeric stability and display formatting helpers
 * =============================================== */

/**
 * Rounds a number to mitigate floating point artifacts.
 * Uses rounding to the given precision (decimal places).
 * @param {number} n
 * @param {number} [precision=12]
 * @returns {number}
 */
function safeRound(n, precision = 12) {
  if (!isFinite(n)) return n;
  const factor = Math.pow(10, precision);
  // Add a tiny epsilon scaled by n to mitigate binary floating point noise
  const epsilon = Math.abs(n) * Number.EPSILON * 10;
  const rounded = Math.round((n + epsilon) * factor) / factor;
  // Normalize -0 to 0
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Converts internal numeric or string state to a user-friendly string.
 * - Trims trailing zeros for numbers.
 * - Avoids scientific notation for typical ranges (~1e-9 to 1e12).
 * - Caps to maxDigits characters where reasonable.
 *
 * Note: If input is a raw string (in-progress user input), it is returned
 * largely as-is (sanitized) to preserve what the user typed.
 *
 * @param {number|string} value
 * @param {number} [maxDigits=12]
 * @returns {string}
 */
function formatForDisplay(value, maxDigits = 12) {
  try {
    if (value === null || value === undefined) return '0';
    if (typeof value === 'string') {
      const s = value.trim();
      if (s === '') return '0';
      if (s.toLowerCase() === 'error') return 'Error';
      // Preserve user input shape, but clamp extreme length for safety.
      // Allow slightly more than maxDigits to handle decimal point and minus.
      const MAX_LEN = Math.max(3, maxDigits + 3);
      return s.length > MAX_LEN ? s.slice(0, MAX_LEN) : s;
    }

    let n = Number(value);
    if (!isFinite(n)) {
      if (isNaN(n)) return 'Error';
      // Infinity or -Infinity
      return n > 0 ? '∞' : '-∞';
    }

    // Safe rounding to mitigate binary artifacts
    n = safeRound(n, maxDigits);

    const abs = Math.abs(n);
    let s;
    // For typical ranges, prefer non-exponential
    if ((abs !== 0 && abs < 1e-9) || abs >= 1e12) {
      // Use exponential with trimmed zeros
      // Reserve at least few significant digits
      const digits = Math.max(6, maxDigits);
      s = n.toExponential(digits - 1);
      // Trim trailing zeros in mantissa
      const parts = s.split('e');
      let mant = parts[0].replace(/(\.\d*?[1-9])0+$/u, '$1').replace(/\.$/, '');
      s = mant + 'e' + parts[1];
    } else {
      // Format with fixed decimal, then trim trailing zeros
      // Try a high precision, then trim.
      s = n.toFixed(Math.max(0, maxDigits));
      // Trim trailing zeros and possible trailing decimal point
      s = s.replace(/(\.\d*?[1-9])0+$/u, '$1').replace(/\.0+$/u, '').replace(/\.$/u, '');
    }

    // Finally, cap to maxDigits where sensible.
    // We allow extended length for negative sign and decimal point.
    if (s.length > maxDigits + 3) {
      // If decimal, reduce precision; else slice
      if (s.includes('.')) {
        // Reduce to maxDigits characters without breaking minus or dot at the end
        s = s.slice(0, maxDigits + 3).replace(/\.$/, '');
      } else {
        s = s.slice(0, maxDigits + 1);
      }
    }

    // Normalize -0 to 0 for display
    if (s === '-0') s = '0';

    return s;
  } catch (err) {
    // As a last resort, return a safe string
    return 'Error';
  }
}

/* ============================
 * Calculator engine (no DOM)
 * ============================ */

/**
 * Factory for a calculator instance with encapsulated state and pure operations.
 * The public API methods never throw; errors are stored in state.error.
 *
 * State:
 * - currentValue: string
 * - previousValue: string|null
 * - operator: '+'|'-'|'*'|'/'|null
 * - overwrite: boolean
 * - error: string|null
 *
 * @returns {object} CalculatorAPI
 */
function createCalculator() {
  const MAX_INPUT_DIGITS = 15; // guard input length
  const DISPLAY_MAX_DIGITS = 12;

  /** @type {{'+': Function, '-': Function, '*': Function, '/': Function}} */
  const OP_MAP = {
    '+': add,
    '-': subtract,
    '*': multiply,
    '/': divide,
  };

  /** @type {{ currentValue: string, previousValue: string|null, operator: '+'|'-'|'*'|'/'|null, overwrite: boolean, error: string|null }} */
  const state = {
    currentValue: '0',
    previousValue: null,
    operator: null,
    overwrite: false,
    error: null,
  };

  // Helpers

  function resetState() {
    state.currentValue = '0';
    state.previousValue = null;
    state.operator = null;
    state.overwrite = false;
    state.error = null;
  }

  function setError(message) {
    state.error = message || 'Error';
    state.currentValue = 'Error';
    state.previousValue = null;
    state.operator = null;
    state.overwrite = true;
  }

  function isDigit(str) {
    return typeof str === 'string' && /^[0-9]$/.test(str);
  }

  function sanitizedNumberFromString(str) {
    // Convert to number safely; handle leading dot ".5"
    if (typeof str !== 'string') return NaN;
    if (str === '' || str === '.') return NaN;
    const s = str.replace(/^\./, '0.');
    const n = Number(s);
    return n;
  }

  function countNumericDigits(str) {
    // Count digits ignoring minus and decimal
    if (typeof str !== 'string') return 0;
    const m = str.match(/[0-9]/g);
    return m ? m.length : 0;
  }

  function performPendingOperation() {
    // Execute the pending operation using previousValue and currentValue.
    // Handles divide-by-zero and NaN; sets state appropriately.
    const op = state.operator;
    if (!op || state.previousValue == null) return;

    const prev = sanitizedNumberFromString(state.previousValue);
    const curr = sanitizedNumberFromString(state.currentValue);
    if (!isFinite(prev) || !isFinite(curr) || isNaN(prev) || isNaN(curr)) {
      setError('Invalid input');
      return;
    }

    try {
      const fn = OP_MAP[op];
      let result = fn(prev, curr);
      if (!isFinite(result)) {
        setError('Math error');
        return;
      }
      result = safeRound(result, DISPLAY_MAX_DIGITS);
      state.currentValue = formatForDisplay(result, DISPLAY_MAX_DIGITS);
      state.previousValue = null;
      state.operator = null;
      state.overwrite = true;
    } catch (e) {
      // Divide by zero or other operation error
      setError(e && e.message ? e.message : 'Error');
    }
  }

  // Public API methods

  function inputDigit(d) {
    try {
      if (!isDigit(d)) return; // ignore invalid input
      if (state.error) resetState();

      if (state.overwrite) {
        state.currentValue = d;
        state.overwrite = false;
        return;
      }

      // Avoid exceeding a safe number of digits
      const digitCount = countNumericDigits(state.currentValue);
      if (digitCount >= MAX_INPUT_DIGITS) {
        // ignore overflows silently
        return;
      }

      if (state.currentValue === '0') {
        // Replace leading zero unless there's a decimal point "0."
        if (state.currentValue.includes('.')) {
          state.currentValue += d;
        } else {
          state.currentValue = d;
        }
      } else {
        state.currentValue += d;
      }
    } catch (err) {
      console.error('inputDigit error:', err);
      setError('Error');
    }
  }

  function inputDecimal() {
    try {
      if (state.error) resetState();

      if (state.overwrite) {
        state.currentValue = '0.';
        state.overwrite = false;
        return;
      }

      if (!state.currentValue || state.currentValue === 'Error') {
        state.currentValue = '0.';
        state.overwrite = false;
        return;
      }

      if (state.currentValue.includes('.')) {
        // idempotent: do nothing if decimal already present
        return;
      }

      // If currentValue is like '-', '': normalize to '0.'
      if (!/[0-9]/.test(state.currentValue)) {
        state.currentValue = '0.';
      } else {
        state.currentValue += '.';
      }
    } catch (err) {
      console.error('inputDecimal error:', err);
      setError('Error');
    }
  }

  function chooseOperator(op) {
    try {
      if (!['+', '-', '*', '/'].includes(op)) return;
      if (state.error) resetState();

      // If there is an existing operator and previousValue is set and we are not overwriting,
      // evaluate pending operation before setting the new operator (chaining).
      if (state.operator && state.previousValue != null && !state.overwrite) {
        performPendingOperation();
        if (state.error) return; // If an error occurred during evaluation
      }

      // Set up for next operand
      state.previousValue = state.currentValue;
      state.operator = op;
      state.overwrite = true;
    } catch (err) {
      console.error('chooseOperator error:', err);
      setError('Error');
    }
  }

  function evaluate() {
    try {
      if (state.error) {
        // If there is an error, clear on next equals press
        resetState();
        return;
      }
      // No-op if there is nothing to compute
      if (!state.operator || state.previousValue == null) return;

      performPendingOperation();
    } catch (err) {
      console.error('evaluate error:', err);
      setError('Error');
    }
  }

  function clear() {
    resetState();
  }

  function getDisplay() {
    if (state.error) return 'Error';
    return formatForDisplay(state.currentValue, DISPLAY_MAX_DIGITS);
  }

  function getError() {
    return state.error;
  }

  function getState() {
    return {
      currentValue: state.currentValue,
      previousValue: state.previousValue,
      operator: state.operator,
      overwrite: state.overwrite,
      error: state.error,
    };
  }

  return {
    inputDigit,
    inputDecimal,
    chooseOperator,
    evaluate,
    clear,
    getDisplay,
    getError,
    getState,
  };
}

/* ======================
 * UI binding (imperative)
 * ====================== */

/**
 * Bind UI elements to a calculator instance using event delegation.
 * Expects:
 * - A display element with id="display" (input or any element)
 * - A button container with data-keypad, #keypad, or .keypad
 * - Buttons with data-action and optional data-value:
 *    - data-action="digit" data-value="0".."9"
 *    - data-action="decimal"
 *    - data-action="operator" data-value="+"|"-"|"×"|"÷"|"*"|"/"
 *    - data-action="equals"
 *    - data-action="clear"
 *
 * @param {Document|HTMLElement} root
 */
function bindUI(root) {
  const scope = root || document;
  const displayEl = scope.querySelector('#display');

  if (!displayEl) {
    console.warn('bindUI: #display element not found. UI binding skipped.');
    return;
  }

  // Find keypad container or fallback to root
  let keypad = scope.querySelector('[data-keypad]') ||
               scope.querySelector('#keypad') ||
               scope.querySelector('.keypad') ||
               scope;

  const calc = createCalculator();

  // Initialize display
  updateDisplay();

  // Event delegation for clicks
  keypad.addEventListener('click', function onClick(e) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // Button may be the child of a button; find nearest with data-action
    const btn = target.closest('[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const rawValue = btn.getAttribute('data-value');

    try {
      switch (action) {
        case 'digit': {
          if (rawValue && /^[0-9]$/.test(rawValue)) {
            calc.inputDigit(rawValue);
          }
          break;
        }
        case 'decimal': {
          calc.inputDecimal();
          break;
        }
        case 'operator': {
          if (!rawValue) break;
          const op = normalizeOperatorSymbol(rawValue);
          if (op) calc.chooseOperator(op);
          break;
        }
        case 'equals': {
          calc.evaluate();
          break;
        }
        case 'clear': {
          calc.clear();
          break;
        }
        default:
          // Unknown action; do nothing
          break;
      }
    } catch (err) {
      console.error('UI handler error:', err);
      // Ensure calculator doesn't remain in an inconsistent state
      calc.clear();
    } finally {
      updateDisplay();
    }
  });

  // Prevent text selection/focus issues for buttons
  keypad.addEventListener('mousedown', function (e) {
    const t = e.target;
    if (t && t.closest && t.closest('[data-action]')) {
      e.preventDefault();
    }
  });

  // Utility to map symbols to operators
  function normalizeOperatorSymbol(symbol) {
    const map = { '×': '*', '÷': '/', '*': '*', '/': '/', '+': '+', '-': '-' };
    return map[symbol] || null;
  }

  // Update the display element, supporting input or generic elements
  function updateDisplay() {
    const err = calc.getError();
    const value = calc.getDisplay();
    if ('value' in displayEl) {
      displayEl.value = err ? 'Error' : value;
    } else {
      displayEl.textContent = err ? 'Error' : value;
    }
    // Optional: aria-live for screen readers
    displayEl.setAttribute('aria-live', 'polite');
  }

  // Return a tiny control API for debugging or external use
  return {
    calculator: calc,
    updateDisplay,
  };
}

/* ===================
 * Auto-bind on load
 * =================== */

(function autoBind() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      // Auto-bind only if #display exists to avoid double bindings in tests
      if (document.querySelector('#display')) {
        bindUI(document);
      }
    });
  } else {
    if (document.querySelector('#display')) {
      bindUI(document);
    }
  }
})();

/* ===================
 * Global exposure
 * =================== */
(function exposeGlobal() {
  if (typeof window !== 'undefined') {
    // Expose a namespaced API for tests and manual invocation
    window.Calculator = {
      add,
      subtract,
      multiply,
      divide,
      safeRound,
      formatForDisplay,
      createCalculator,
      bindUI,
    };
  }
})();