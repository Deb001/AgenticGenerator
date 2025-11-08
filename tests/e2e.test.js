import '@testing-library/jest-dom';
import { fireEvent, getByText, getByRole } from '@testing-library/dom';
import path from 'path';
import fs from 'fs';
import '../src/app.js';

function loadHTML() {
  const htmlPath = path.resolve(__dirname, '../src/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  document.documentElement.innerHTML = html;
  const event = new Event('DOMContentLoaded', { bubbles: true, cancelable: true });
  document.dispatchEvent(event);
}

describe('Calculator end-to-end UI tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    loadHTML();
  });

  test('click sequence computes 7*8=', async () => {
    try {
      const button7 = getByText(document.body, '7');
      const buttonMultiply = getByText(document.body, '×');
      const button8 = getByText(document.body, '8');
      const buttonEquals = getByText(document.body, '=');
      const display = getByRole(document.body, 'textbox', { name: /display/i });

      fireEvent.click(button7);
      fireEvent.click(buttonMultiply);
      fireEvent.click(button8);
      fireEvent.click(buttonEquals);

      expect(display).toHaveValue('56');
    } catch (err) {
      throw err;
    }
  });

  test('keyboard entry works', async () => {
    try {
      const display = getByRole(document.body, 'textbox', { name: /display/i });

      fireEvent.keyDown(document.body, { key: '1', code: 'Digit1' });
      fireEvent.keyDown(document.body, { key: '+', code: 'Equal', shiftKey: true });
      fireEvent.keyDown(document.body, { key: '2', code: 'Digit2' });
      fireEvent.keyDown(document.body, { key: 'Enter', code: 'Enter' });

      expect(display).toHaveValue('3');
    } catch (err) {
      throw err;
    }
  });

  test('clear and backspace behavior', async () => {
    try {
      const button1 = getByText(document.body, '1');
      const button2 = getByText(document.body, '2');
      const buttonClear = getByText(document.body, 'C');
      const buttonBackspace = getByText(document.body, '←');
      const display = getByRole(document.body, 'textbox', { name: /display/i });

      fireEvent.click(button1);
      fireEvent.click(button2);
      expect(display).toHaveValue('12');

      fireEvent.click(buttonBackspace);
      expect(display).toHaveValue('1');

      fireEvent.click(buttonClear);
      expect(display).toHaveValue('');
    } catch (err) {
      throw err;
    }
  });

  test('accessibility focus order', async () => {
    try {
      const allButtons = Array.from(document.querySelectorAll('button'));
      let focusIndex = 0;
      allButtons[focusIndex].focus();
      expect(document.activeElement).toBe(allButtons[focusIndex]);

      for (let i = 1; i < allButtons.length; i++) {
        fireEvent.keyDown(document.body, { key: 'Tab', code: 'Tab' });
        allButtons[i].focus();
        expect(document.activeElement).toBe(allButtons[i]);
        expect(allButtons[i].classList.contains('focus-visible')).toBe(true);
        const ariaLabel = allButtons[i].getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    } catch (err) {
      throw err;
    }
  });
});