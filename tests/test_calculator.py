import unittest
from app.calculator import add, subtract, multiply, divide, calculate


class TestCalculator(unittest.TestCase):
    """Unit test suite for arithmetic functions defined in ``app.calculator``."""

    def test_add(self):
        """Assert that ``add(2, 3)`` returns ``5``."""
        self.assertEqual(add(2, 3), 5)

    def test_subtract(self):
        """Assert that ``subtract(5, 2)`` returns ``3``."""
        self.assertEqual(subtract(5, 2), 3)

    def test_multiply(self):
        """Assert that ``multiply(4, 3)`` returns ``12``."""
        self.assertEqual(multiply(4, 3), 12)

    def test_divide(self):
        """Assert that ``divide(10, 2)`` returns ``5`` and division by zero raises ``ValueError``."""
        self.assertEqual(divide(10, 2), 5)
        with self.assertRaises(ValueError):
            divide(10, 0)

    def test_calculate_dispatch(self):
        """
        Ensure ``calculate`` routes to the correct operation for each operator
        and raises ``ValueError`` for an invalid operator.
        """
        # Valid operators
        self.assertEqual(calculate('+', 2, 3), 5)
        self.assertEqual(calculate('-', 5, 2), 3)
        self.assertEqual(calculate('*', 4, 3), 12)
        self.assertEqual(calculate('/', 10, 2), 5)

        # Division by zero via calculate
        with self.assertRaises(ValueError):
            calculate('/', 10, 0)

        # Invalid operator
        with self.assertRaises(ValueError):
            calculate('%', 10, 2)


if __name__ == '__main__':
    unittest.main()