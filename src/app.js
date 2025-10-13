import { evaluate } from './calculator.js';

/**
 * Application state for calculator UI and interactions.
 * @type {{ inputString: string, lastResult: number|null, lastAction: 'input'|'result'|'error', cursorPosition?: number, errorMessage?: string|null }}
 */
const state = {
  inputString: '',
  lastResult: null,
  lastAction: 'input',
  cursorPosition: null,
  errorMessage: null
};

/** DOM elements (populated in init) */
let displayEl = null;
let allButtons = [];
/** Map from logical key/operator/action string -> button element for focus/feedback */
const keyButtonMap = new Map();

/** Time (ms) to show transient keyboard feedback on a button */
const KEY_FEEDBACK_MS = 150;

/**
 * Initialize event listeners, ARIA attributes, button maps and initial UI state.
 * Called on module load or DOMContentLoaded.
 */
export function init() {
  // Wait for DOM to be ready if necessary
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  // Query useful DOM elements
  displayEl = document.getElementById('display');
  if (!displayEl) {
    console.error('Calculator init: Unable to find #display element in DOM.');
    // create a minimal fallback to avoid crashes
    displayEl = document.createElement('div');
    displayEl.id = 'display';
    document.body.prepend(displayEl);
  }

  // Ensure display has appropriate ARIA attributes for live updates
  displayEl.setAttribute('role', 'status');
  // polite for normal messages; will switch to assertive for errors when needed
  displayEl.setAttribute('aria-live', 'polite');
  displayEl.classList.remove('error');

  // Find all calculator buttons (expected in UI)
  allButtons = Array.from(document.querySelectorAll('button'));

  // Attach click handlers and populate keyButtonMap for keyboard feedback
  allButtons.forEach((btn, idx) => {
    // Ensure focusable in natural order
    if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');

    // Attach click handler
    btn.addEventListener('click', handleButtonClick);

    // Use data-key, data-operator or data-action to map keyboard keys to buttons
    const { key, operator, action } = btn.dataset;

    if (typeof key === 'string' && key.length > 0) {
      keyButtonMap.set(key, btn);
    }
    if (typeof operator === 'string' && operator.length > 0) {
      keyButtonMap.set(operator, btn);
      // Also map common visual operator glyphs to the same button for keyboard feedback
      if (operator === '*') keyButtonMap.set('×', btn);
      if (operator === '/') keyButtonMap.set('÷', btn);
    }
    if (typeof action === 'string' && action.length > 0) {
      keyButtonMap.set(action, btn);
    }

    // Provide accessible label if missing
    if (!btn.hasAttribute('aria-label')) {
      const text = btn.textContent && btn.textContent.trim();
      if (text) btn.setAttribute('aria-label', text);
      else if (key) btn.setAttribute('aria-label', key);
      else if (operator) btn.setAttribute('aria-label', operator);
      else if (action) btn.setAttribute('aria-label', action);
    }
  });

  // Global keyboard handler for calculator keys
  window.addEventListener('keydown', handleKeyDown, { passive: false });

  // Initial render
  clearAll();
  render();
}

// If module loaded after DOM ready, initialize immediately
if (document.readyState !== 'loading') {
  // call asynchronously so other modules can set up if needed
  setTimeout(init, 0);
}

/**
 * Generic click handler for buttons. Dispatches by data attributes.
 * Buttons should provide one of data-key, data-operator or data-action.
 * @param {Event} event
 */
function handleButtonClick(event) {
  const btn = /** @type {HTMLButtonElement} */ (event.currentTarget);
  if (!btn) return;

  const { key, operator, action } = btn.dataset;

  // Normalize action handling
  if (action) {
    switch (action) {
      case 'equals':
        compute();
        break;
      case 'clear':
        clearAll();
        break;
      case 'backspace':
        backspace();
        break;
      default:
        // unknown action - ignore
        break;
    }
    // Provide immediate visual feedback
    btn.focus();
    flashButton(btn);
    return;
  }

  if (operator) {
    appendOperator(operator);
    btn.focus();
    flashButton(btn);
    return;
  }

  if (key) {
    // keys might be digits, '.', '=' etc.
    if (/^[0-9]$/.test(key) || key === '.') {
      appendDigit(key);
    } else if (key === '=' || key === 'Enter') {
      compute();
    } else if (key === 'Backspace') {
      backspace();
    } else if (key === 'Clear' || key.toLowerCase() === 'c') {
      clearAll();
    } else {
      // Fallback: try to interpret as operator
      if (['+', '-', '*', '/', '×', '÷', 'x'].includes(key)) {
        const op = normalizeOperatorKey(key);
        appendOperator(op);
      }
    }
    btn.focus();
    flashButton(btn);
    return;
  }

  // If no dataset, try to infer from textContent
  const text = btn.textContent && btn.textContent.trim();
  if (text) {
    if (/^[0-9]$/.test(text) || text === '.') {
      appendDigit(text);
    } else if (text === '=') {
      compute();
    } else if (/^[+\-×÷*\/x]$/.test(text)) {
      appendOperator(normalizeOperatorKey(text));
    } else if (/^C$/i.test(text)) {
      clearAll();
    } else if (/^⌫|←|Backspace$/i.test(text)) {
      backspace();
    }
    btn.focus();
    flashButton(btn);
  }
}

/**
 * Keyboard handler to map keys to calculator actions.
 * Prevents default for keys that may cause page-level side effects (Enter, Backspace, etc).
 * Gives accessibility feedback by focusing/highlighting mapped button when available.
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  const k = event.key;

  // Determine action for key
  // digits
  if (/^[0-9]$/.test(k)) {
    // allow typing into calculator without interfering with forms: prevent default when not typing into text input
    if (!isTypingInInput(event)) event.preventDefault();
    appendDigit(k);
    focusAndFlashKey(k);
    return;
  }

  if (k === '.') {
    if (!isTypingInInput(event)) event.preventDefault();
    appendDigit('.');
    focusAndFlashKey('.');
    return;
  }

  // Operators: + - * x × / ÷ 
  if (k === '+' || k === '-') {
    event.preventDefault();
    appendOperator(k);
    focusAndFlashKey(k);
    return;
  }

  if (k === '*' || k.toLowerCase() === 'x' || k === '×') {
    event.preventDefault();
    appendOperator('*');
    focusAndFlashKey('*');
    return;
  }

  if (k === '/' || k === '÷') {
    event.preventDefault();
    appendOperator('/');
    focusAndFlashKey('/');
    return;
  }

  // Enter or '=' for equals
  if (k === 'Enter' || k === '=') {
    event.preventDefault();
    compute();
    focusAndFlashKey('=');
    return;
  }

  // Backspace
  if (k === 'Backspace') {
    event.preventDefault();
    backspace();
    focusAndFlashKey('Backspace');
    return;
  }

  // Escape or 'c' for clear
  if (k === 'Escape' || k.toLowerCase() === 'c') {
    event.preventDefault();
    clearAll();
    focusAndFlashKey('Clear');
    return;
  }

  // ignore other keys
}

/**
 * Append a digit or decimal point to the current input.
 * Enforces single decimal point per current number token.
 * If previous action was a result, typing a digit starts a new input (unless desired to chain).
 * @param {string} digit single char like '0'..'9' or '.'
 */
function appendDigit(digit) {
  if (!/^[0-9.]$/.test(digit)) return;

  // If last action was an error, clear it first
  if (state.lastAction === 'error') {
    state.errorMessage = null;
    state.lastAction = 'input';
    state.inputString = '';
  }

  // If last action was result, start new input with digit (not chaining) unless user wants to continue with operator
  if (state.lastAction === 'result') {
    // If digit is a decimal point, start with "0."
    state.inputString = digit === '.' ? '0.' : digit;
    state.lastResult = null; // starting new input resets last result for typed digits
    state.lastAction = 'input';
    render();
    return;
  }

  // Enforce single decimal in current number token
  const lastToken = getCurrentNumberToken();
  if (digit === '.' && lastToken.includes('.')) {
    // ignore additional decimal point
    return;
  }

  // Avoid leading multiple zeros unless decimal follows
  if (lastToken === '0' && digit === '0' && (state.inputString.length === 1 || /[+\-*/]0$/.test(state.inputString))) {
    // Keep a single leading zero (user typed multiple zeros) -> ignore
    return;
  }

  // Append digit
  state.inputString += digit;
  state.lastAction = 'input';
  render();
}

/**
 * Append an operator to the current input, handling chaining and unary minus rules.
 * If last token is an operator, this may replace it, except allow unary minus.
 * If input is empty and operator is '-', allow unary minus to start a negative number.
 * @param {string} operator one of '+', '-', '*', '/'
 */
function appendOperator(operator) {
  operator = normalizeOperatorKey(operator);
  if (!/^[+\-*/]$/.test(operator)) return;

  // Clear any error
  if (state.lastAction === 'error') {
    state.errorMessage = null;
    state.lastAction = 'input';
    state.inputString = '';
  }

  // If lastAction was result, treat result as left-hand operand for chaining and append operator
  if (state.lastAction === 'result') {
    // Use lastResult as left operand
    state.inputString = String(state.lastResult) + operator;
    state.lastAction = 'input';
    render();
    return;
  }

  // If input is empty
  if (state.inputString.length === 0) {
    if (operator === '-') {
      // start unary minus
      state.inputString = '-';
      state.lastAction = 'input';
      render();
    }
    // ignore other operators at start
    return;
  }

  // If last character is an operator
  const lastChar = state.inputString.slice(-1);
  if (/[+\-*/]/.test(lastChar)) {
    // If trying to add unary minus after another operator, allow it (e.g., "5+ -3" -> "5+-")
    if (operator === '-' && lastChar !== '-') {
      // Append unary minus
      state.inputString += '-';
    } else {
      // Replace trailing operator sequence with the new operator
      state.inputString = state.inputString.replace(/[+\-*/]+$/, '') + operator;
    }
    state.lastAction = 'input';
    render();
    return;
  }

  // Normal append
  state.inputString += operator;
  state.lastAction = 'input';
  render();
}

/**
 * Remove last character from input, or if last action was result, clear the result and start fresh.
 */
function backspace() {
  // If last action was result, clear result and start new input
  if (state.lastAction === 'result') {
    state.inputString = '';
    state.lastResult = null;
    state.lastAction = 'input';
    state.errorMessage = null;
    render();
    return;
  }

  if (state.lastAction === 'error') {
    // Clear error state fully
    state.inputString = '';
    state.errorMessage = null;
    state.lastAction = 'input';
    render();
    return;
  }

  // Remove last character
  if (state.inputString.length > 0) {
    state.inputString = state.inputString.slice(0, -1);
    state.lastAction = 'input';
    render();
  }
}

/**
 * Reset input state, clear errors and display to initial state.
 */
function clearAll() {
  state.inputString = '';
  state.lastResult = null;
  state.lastAction = 'input';
  state.errorMessage = null;
  render();
}

/**
 * Compute the current expression using evaluate() from calculator.js.
 * Handles errors thrown by evaluate and updates UI accordingly.
 * Supports chaining behavior: result becomes left-hand operand for next operator.
 */
function compute() {
  // Nothing to compute if no expression
  if (!state.inputString || state.inputString.trim().length === 0) {
    return;
  }

  // If last action already result, nothing to do
  if (state.lastAction === 'result') {
    return;
  }

  try {
    // Delegate to the calculation engine
    const result = evaluate(state.inputString);

    if (typeof result !== 'number' || Number.isNaN(result) || !isFinite(result)) {
      // Unexpected result - treat as invalid
      throw { code: 'INVALID_RESULT', message: 'Calculation produced non-finite result' };
    }

    // Success path
    state.lastResult = result;
    state.lastAction = 'result';
    state.errorMessage = null;
    // Render the numeric result in a normalized form
    // Display as string; let calculator formatting be simple
    state.inputString = String(result);
    render();
  } catch (err) {
    // Log full error for debugging
    console.error('Calculator evaluate error:', err);

    // Map known error codes to user-facing messages
    let userMessage = 'Error';
    if (err && err.code === 'DIVIDE_BY_ZERO') {
      userMessage = 'Error: Division by zero';
    } else if (err && (err.code === 'INVALID_EXPRESSION' || err.code === 'TOKENIZE_ERROR' || err.code === 'INVALID_RESULT')) {
      userMessage = 'Invalid expression';
    } else if (err && err.message) {
      // Generic - show brief message
      userMessage = 'Error';
    } else {
      userMessage = 'Error';
    }

    state.errorMessage = userMessage;
    state.lastAction = 'error';
    // Do not replace inputString - keep it if you want to allow edits; render will display error message
    render();
  }
}

/**
 * Update the DOM display area with the current expression or error/result.
 * Applies CSS classes for error state and updates aria-live for assistive tech.
 */
function render() {
  if (!displayEl) return;

  if (state.lastAction === 'error') {
    displayEl.textContent = state.errorMessage || 'Error';
    displayEl.classList.add('error');
    // Make sure screen readers announce errors assertively
    displayEl.setAttribute('aria-live', 'assertive');
  } else {
    displayEl.classList.remove('error');
    displayEl.setAttribute('aria-live', 'polite');
    // Show the typed expression; when result was computed inputString contains the result already
    displayEl.textContent = state.inputString || '0';
  }

  // Optionally expose a title for hover/readers
  displayEl.setAttribute('title', displayEl.textContent);
}

/* ---------------------- Utility helpers ------------------------ */

/**
 * Get the current number token (characters after the last operator) to enforce decimals, etc.
 * @returns {string}
 */
function getCurrentNumberToken() {
  if (!state.inputString) return '';
  // Split on operators; this naive split will treat unary '-' as separator which is acceptable for token checks
  const tokens = state.inputString.split(/([+\-*/])/);
  // tokens will include separators if grouped; safer to find last run of digits/decimal/hyphen
  // Walk backwards to find last contiguous token that looks like number (may start with '-')
  let i = state.inputString.length - 1;
  let token = '';
  while (i >= 0) {
    const ch = state.inputString[i];
    if (/[0-9.]/.test(ch)) {
      token = ch + token;
      i--;
      continue;
    }
    if (ch === '-') {
      // If '-' is directly before token or at start, include as unary minus only if preceding char is operator or start
      const prev = i - 1;
      if (prev < 0 || /[+\-*/]/.test(state.inputString[prev])) {
        token = '-' + token;
      }
    }
    break;
  }
  return token;
}

/**
 * Normalize operator input to internal representation: '+', '-', '*', '/'
 * Accept inputs like 'x', '×', '÷'
 * @param {string} k
 * @returns {string}
 */
function normalizeOperatorKey(k) {
  if (k === '×' || k.toLowerCase() === 'x') return '*';
  if (k === '÷') return '/';
  return k;
}

/**
 * Determine whether the keyboard event target is a text input area where we should not intercept keystrokes.
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isTypingInInput(event) {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || active.isContentEditable) {
    return true;
  }
  // Also allow if a button is focused (we still want to handle keys)
  return false;
}

/**
 * Focus the button mapped to a key and flash an active class for short-lived keyboard feedback.
 * @param {string} key
 */
function focusAndFlashKey(key) {
  // Try several normalized forms to find a matching button
  const tries = [key];
  if (key === '*' || key === 'x' || key === '×') tries.push('*', '×', 'x');
  if (key === '/' || key === '÷') tries.push('/', '÷');
  if (key === 'Enter') tries.push('=');
  if (key.toLowerCase() === 'c') tries.push('Clear', 'c');

  for (const t of tries) {
    const btn = keyButtonMap.get(t);
    if (btn) {
      try {
        btn.focus({ preventScroll: true });
      } catch (e) {
        try { btn.focus(); } catch (_) {}
      }
      flashButton(btn);
      break;
    }
  }
}

/**
 * Temporarily add an "active" class for visual keyboard feedback and remove it shortly after.
 * @param {HTMLElement} btn
 */
function flashButton(btn) {
  if (!btn) return;
  btn.classList.add('active');
  // Remove after KEY_FEEDBACK_MS
  setTimeout(() => btn.classList.remove('active'), KEY_FEEDBACK_MS);
}

// Export default init for convenience
export default { init };