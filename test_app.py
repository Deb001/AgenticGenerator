#!/usr/bin/env python3
"""
Unit tests for the Flask calculator application.

These tests exercise the `/calculate` endpoint defined in `app.py`,
verifying correct arithmetic operations and robust error handling.
"""

import unittest
import json

# Import the Flask application instance from app.py
from app import app


class TestCalculatorLogic(unittest.TestCase):
    """
    A test suite containing unit tests for the arithmetic calculation logic
    and error handling within the Flask application (`app.py`).
    """

    def setUp(self) -> None:
        """
        Initializes a test client for the Flask application before each test method,
        allowing simulated HTTP requests.
        """
        self.client = app.test_client()
        # Ensure the application is in testing mode
        app.config["TESTING"] = True

    def _post_calculate(self, payload: dict) -> tuple:
        """
        Helper method to send a POST request to `/calculate` with the given payload.
        Returns a tuple of (status_code, response_json).
        """
        response = self.client.post(
            "/calculate",
            data=json.dumps(payload),
            content_type="application/json",
        )
        try:
            response_json = response.get_json()
        except Exception:
            response_json = None
        return response.status_code, response_json

    def test_addition(self) -> None:
        """
        Verifies the correctness of the addition operation.
        """
        payload = {"operand1": 10, "operand2": 5, "operator": "+"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 200)
        self.assertIn("result", data)
        self.assertEqual(data["result"], 15)

    def test_subtraction(self) -> None:
        """
        Verifies the correctness of the subtraction operation.
        """
        payload = {"operand1": 10, "operand2": 5, "operator": "-"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 200)
        self.assertIn("result", data)
        self.assertEqual(data["result"], 5)

    def test_multiplication(self) -> None:
        """
        Verifies the correctness of the multiplication operation.
        """
        payload = {"operand1": 10, "operand2": 5, "operator": "*"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 200)
        self.assertIn("result", data)
        self.assertEqual(data["result"], 50)

    def test_division(self) -> None:
        """
        Verifies the correctness of the division operation for valid inputs.
        """
        payload = {"operand1": 10, "operand2": 5, "operator": "/"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 200)
        self.assertIn("result", data)
        self.assertAlmostEqual(data["result"], 2.0)

    def test_division_by_zero(self) -> None:
        """
        Ensures the application correctly handles and reports division by zero errors.
        """
        payload = {"operand1": 10, "operand2": 0, "operator": "/"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 400)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Division by zero is not allowed.")

    def test_invalid_operator(self) -> None:
        """
        Tests the application's response to an unsupported or invalid arithmetic operator.
        """
        payload = {"operand1": 10, "operand2": 5, "operator": "%"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 400)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Unsupported operator '%'. Supported operators are +, -, *, /.")

    def test_missing_operands(self) -> None:
        """
        Verifies error handling when one or both operands are missing from the request payload.
        """
        # Missing operand2
        payload = {"operand1": 10, "operator": "+"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 400)
        self.assertIn("error", data)

        # Missing operand1
        payload = {"operand2": 5, "operator": "+"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 400)
        self.assertIn("error", data)

    def test_non_numeric_operands(self) -> None:
        """
        Checks the application's behavior when non-numeric values are provided as operands.
        """
        payload = {"operand1": "ten", "operand2": 5, "operator": "+"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 400)
        self.assertIn("error", data)

        payload = {"operand1": 10, "operand2": "five", "operator": "+"}
        status, data = self._post_calculate(payload)
        self.assertEqual(status, 400)
        self.assertIn("error", data)


if __name__ == "__main__":
    unittest.main()