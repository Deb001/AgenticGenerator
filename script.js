/* script.js
 *
 * Frontend logic for the calculator application.
 * Handles user input, updates the display, and communicates with
 * the backend `/calculate` endpoint.
 *
 * Author: AI-1 Team
 * License: MIT
 */

(() => {
  'use strict';

  /* ------------------------------------------------------------------
   * State variables
   * ------------------------------------------------------------------ */
  let currentInput = '';
  let operand1 = null;
  let operator = null;
  let waitingForSecondOperand = false;

  /* ------------------------------------------------------------------
   * DOM elements
   * ------------------------------------------------------------------ */
  const displayEl = document.getElementById('display');
  if (!displayEl) {
    console.error('Display element with id="display" not found.');
    return;
  }

  const buttons = document.querySelectorAll('.calc-button');
  if (!buttons.length) {
    console.warn('No calculator buttons found.');
  }

  /* ------------------------------------------------------------------
   * Utility functions
   * ------------------------------------------------------------------ */
  /**
   * Update the calculator display.
   *
   * @param {string} value - Text to show on the display.
   */
  function updateDisplay(value) {
    displayEl.textContent = value;
  }

  /**
   * Reset all internal state and clear the display.
   */
  function clearDisplay() {
    currentInput = '';
    operand1 = null;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay('0');
  }

  /**
   * Perform calculation by sending data to the backend.
   */
  async function performCalculation() {
    if (!operator || !currentInput) {
      updateDisplay('Error: Incomplete expression');
      return;
    }

    const payload = {
      operand1,
      operator,
      operand2: currentInput
    };

    try {
      const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown server error');
      }

      const data = await response.json();
      updateDisplay(String(data.result));
      // Prepare for next calculation
      currentInput = String(data.result);
      operand1 = null;
      operator = null;
      waitingForSecondOperand = false;
    } catch (err) {
      console.error('Calculation error:', err);
      updateDisplay(`Error: ${err.message}`);
    }
  }

  /**
   * Handle button click events.
   *
   * @param {MouseEvent} event
   */
  function handleButtonClick(event) {
    const target = event.target;
    if (!target.matches('.calc-button')) return;

    const value = target.dataset.value;
    const type = target.dataset.type; // 'number', 'operator', 'equals', 'clear'

    switch (type) {
      case 'number':
        if (waitingForSecondOperand) {
          currentInput = value;
          waitingForSecondOperand = false;
        } else {
          currentInput += value;
        }
        updateDisplay(currentInput);
        break;

      case 'operator':
        if (currentInput === '') {
          // Allow changing operator before entering second operand
          operator = value;
        } else if (operand1 === null) {
          operand1 = currentInput;
          operator = value;
          waitingForSecondOperand = true;
        } else {
          // Chain calculation
          performCalculation().then(() => {
            operator = value;
            waitingForSecondOperand = true;
          });
        }
        break;

      case 'equals':
        performCalculation();
        break;

      case 'clear':
        clearDisplay();
        break;

      default:
        console.warn(`Unhandled button type: ${type}`);
    }
  }

  /* ------------------------------------------------------------------
   * Event listeners
   * ------------------------------------------------------------------ */
  buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

  /* ------------------------------------------------------------------
   * Initialization
   * ------------------------------------------------------------------ */
  clearDisplay();
})();