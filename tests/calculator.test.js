import { evaluateExpression } from '../src/calculator.js';

describe('evaluateExpression', () => {
  test('basic addition', () => {
    expect(evaluateExpression('2+3')).toBe(5);
  });

  test('operator precedence', () => {
    expect(evaluateExpression('2+3*4')).toBe(14);
  });

  test('parentheses handling', () => {
    expect(evaluateExpression('(2+3)*(4+5)')).toBe(45);
  });

  test('invalid syntax throws', () => {
    expect(() => evaluateExpression('2++3')).toThrow(SyntaxError);
  });
});