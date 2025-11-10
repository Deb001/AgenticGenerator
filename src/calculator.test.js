import * as Calculator from './calculator.js';

test('addition works', () => {
  expect(Calculator.add(2, 3)).toBe(5);
});

test('division by zero throws', () => {
  expect(() => Calculator.divide(5, 0)).toThrow(RangeError);
});

test('evaluateExpression parses simple expr', () => {
  expect(Calculator.evaluateExpression('4*5')).toBe(20);
});

test('evaluateExpression invalid syntax throws', () => {
  expect(() => Calculator.evaluateExpression('4**')).toThrow(SyntaxError);
});