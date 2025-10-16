import unittest

from app.calculator import calculate_expression


class TestCalculator(unittest.TestCase):
    """Unit tests for the calculate_expression function."""

    def test_addition(self) -> None:
        """Verify simple addition."""
        self.assertEqual(calculate_expression('2+3'), 5)

    def test_subtraction(self) -> None:
        """Verify simple subtraction."""
        self.assertEqual(calculate_expression('5-2'), 3)

    def test_multiplication(self) -> None:
        """Verify simple multiplication."""
        self.assertEqual(calculate_expression('4*3'), 12)

    def test_division(self) -> None:
        """Verify simple division."""
        self.assertEqual(calculate_expression('10/2'), 5)

    def test_divide_by_zero(self) -> None:
        """Ensure division by zero raises a ValueError."""
        with self.assertRaises(ValueError):
            calculate_expression('5/0')

    def test_invalid_expression(self) -> None:
        """Ensure malformed expressions raise a ValueError."""
        with self.assertRaises(ValueError):
            calculate_expression('2++2')


if __name__ == '__main__':
    unittest.main()