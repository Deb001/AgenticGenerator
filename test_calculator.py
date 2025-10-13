#!/usr/bin/env python3
"""
Unit tests for the Calculator class.

This module provides a comprehensive test suite covering all arithmetic operations,
input validation, and error handling. It is designed to be run with the standard
unittest framework.

Author: AI-1
"""

import unittest

# Import the Calculator class from the src package.
from src.calculator import Calculator


class TestCalculator(unittest.TestCase):
    """
    A test suite for the Calculator class, inheriting from unittest.TestCase.
    """

    def setUp(self) -> None:
        """
        Sets up a new Calculator instance before each test method.
        """
        self.calc = Calculator()

    def test_add(self) -> None:
        """
        Tests the addition operation with various inputs.
        """
        self.assertEqual(self.calc.add(1, 2), 3)
        self.assertEqual(self.calc.add(-5, 5), 0)
        self.assertEqual(self.calc.add(0, 0), 0)

    def test_subtract(self) -> None:
        """
        Tests the subtraction operation.
        """
        self.assertEqual(self.calc.subtract(10, 4), 6)
        self.assertEqual(self.calc.subtract(-3, -7), 4)
        self.assertEqual(self.calc.subtract(0, 5), -5)

    def test_multiply(self) -> None:
        """
        Tests the multiplication operation.
        """
        self.assertEqual(self.calc.multiply(3, 7), 21)
        self.assertEqual(self.calc.multiply(-2, 4), -8)
        self.assertEqual(self.calc.multiply(0, 100), 0)

    def test_divide(self) -> None:
        """
        Tests the division operation with valid inputs.
        """
        self.assertEqual(self.calc.divide(20, 4), 5)
        self.assertEqual(self.calc.divide(-15, 3), -5)
        self.assertAlmostEqual(self.calc.divide(7, 2), 3.5)

    def test_divide_by_zero(self) -> None:
        """
        Tests that division by zero raises a ZeroDivisionError.
        """
        with self.assertRaises(ZeroDivisionError):
            self.calc.divide(10, 0)

    def test_invalid_input_type(self) -> None:
        """
        Tests that non-numeric inputs raise a ValueError.
        """
        with self.assertRaises(ValueError):
            self.calc.add("a", 1)
        with self.assertRaises(ValueError):
            self.calc.subtract(5, None)
        with self.assertRaises(ValueError):
            self.calc.multiply([1], 2)
        with self.assertRaises(ValueError):
            self.calc.divide(10, "b")

    def test_float_operations(self) -> None:
        """
        Tests operations with floating-point numbers.
        """
        self.assertAlmostEqual(self.calc.add(0.1, 0.2), 0.3)
        self.assertAlmostEqual(self.calc.subtract(5.5, 2.2), 3.3)
        self.assertAlmostEqual(self.calc.multiply(1.5, 2), 3.0)
        self.assertAlmostEqual(self.calc.divide(7.5, 2.5), 3.0)


if __name__ == "__main__":
    unittest.main()