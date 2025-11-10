// tests/calculator.test.js
import { evaluate } from "../src/calculator.js";

describe("Calculator.evaluate", () => {
  test("basic addition", () => {
    expect(evaluate("2+3")).toBe(5);
  });

  test("operator precedence", () => {
    expect(evaluate("2+3*4")).toBe(14);
    expect(evaluate("10-2/2")).toBe(9);
  });

  test("parentheses handling", () => {
    expect(evaluate("(2+3)*4")).toBe(20);
    expect(evaluate("(10-(2+3))*2")).toBe(10);
  });

  test("decimal numbers", () => {
    expect(evaluate("0.1+0.2")).toBeCloseTo(0.3);
    expect(evaluate("5.5*2")).toBe(11);
  });

  test("division by zero throws", () => {
    expect(() => evaluate("5/0")).toThrow(/Division by zero/);
  });

  test("invalid characters throw", () => {
    expect(() => evaluate("2+3a")).toThrow(/Unexpected character/);
  });

  test("malformed expression throws", () => {
    expect(() => evaluate("(2+3"))
      .toThrow(/Mismatched parentheses/);
    expect(() => evaluate("2++2"))
      .toThrow(/Malformed expression/);
  });

  test("empty expression throws", () => {
    expect(() => evaluate("   ")).toThrow(/Empty expression/);
  });
});
