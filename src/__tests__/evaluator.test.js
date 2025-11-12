import { evaluateExpression, EvaluationError } from '../evaluator.js';

test('basic addition', () => {
  expect(evaluateExpression('2+3')).toBe(5);
});

test('operator precedence', () => {
  expect(evaluateExpression('2+3*4')).toBe(14);
});

test('parentheses', () => {
  expect(evaluateExpression('(2+3)*4')).toBe(20);
});

test('unary minus', () => {
  expect(evaluateExpression('-5+2')).toBe(-3);
});

test('decimal numbers', () => {
  expect(evaluateExpression('3.5*2')).toBeCloseTo(7);
});

test('division by zero throws', () => {
  expect(() => evaluateExpression('5/0')).toThrow(EvaluationError);
  try {
    evaluateExpression('5/0');
  } catch (e) {
    expect(e).toBeInstanceOf(EvaluationError);
    expect(e.code).toBe(1003);
  }
});

test('invalid character throws', () => {
  expect(() => evaluateExpression('2+3a')).toThrow(EvaluationError);
  try {
    evaluateExpression('2+3a');
  } catch (e) {
    expect(e.code).toBe(1001);
  }
});

test('mismatched parentheses throws', () => {
  expect(() => evaluateExpression('(2+3')).toThrow(EvaluationError);
  try {
    evaluateExpression('(2+3');
  } catch (e) {
    expect(e.code).toBe(1002);
  }
});
