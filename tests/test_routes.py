import json
import unittest
from typing import Any, Dict

from app import create_app


class TestRoutes(unittest.TestCase):
    """Integration tests for Flask application routes.

    The test suite verifies that the main index page and the calculation API
    behave as expected, handling both successful and erroneous requests.
    """

    def setUp(self) -> None:
        """Create a test client for the Flask application."""
        app = create_app()
        app.testing = True
        self.client = app.test_client()

    def test_index_page(self) -> None:
        """GET '/' should return a 200 status and HTML content."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200, "Index page did not return 200")
        self.assertIn(
            b"<html",
            response.data.lower(),
            "Index page response does not contain HTML",
        )

    def test_calculate_success(self) -> None:
        """POST a valid expression to '/api/calculate' and expect a correct result."""
        payload: Dict[str, str] = {"expression": "3*4"}
        response = self.client.post(
            "/api/calculate",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200, "Valid calculation did not return 200")
        data: Any = json.loads(response.data)
        self.assertIsInstance(data, dict, "Response is not JSON object")
        self.assertIn("result", data, "Result key missing in response")
        self.assertEqual(data["result"], 12, "Incorrect calculation result")

    def test_calculate_bad_request(self) -> None:
        """POST without JSON payload should result in a 400 Bad Request."""
        response = self.client.post("/api/calculate")
        self.assertEqual(
            response.status_code,
            400,
            "Missing JSON payload did not trigger 400 Bad Request",
        )
        data: Any = json.loads(response.data)
        self.assertIsInstance(data, dict, "Error response is not JSON object")
        self.assertIn("error", data, "Error message missing in bad request response")

    def test_calculate_invalid_expression(self) -> None:
        """POST an expression that raises an error (e.g., division by zero) should return 400."""
        payload: Dict[str, str] = {"expression": "5/0"}
        response = self.client.post(
            "/api/calculate",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(
            response.status_code,
            400,
            "Invalid expression did not return 400 Bad Request",
        )
        data: Any = json.loads(response.data)
        self.assertIsInstance(data, dict, "Error response is not JSON object")
        self.assertIn("error", data, "Error key missing in invalid expression response")
        self.assertTrue(
            isinstance(data["error"], str) and data["error"],
            "Error message should be a non‑empty string",
        )