"""app.py

Flask entry point for the arithmetic calculator API.
Provides a single POST endpoint ``/evaluate`` that accepts JSON payloads of the form
``{"expression": "2*(3+4)"}`` and returns ``{"result": 14}`` on success.
All errors are reported with a 400 status code and a JSON body ``{"error": "msg"}``.
"""

import os
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest

# Local imports
from .evaluator import evaluate_expression, EvaluationError

app = Flask(__name__)

# Configuration – read from environment with sensible defaults.
app.config["ENV"] = os.getenv("FLASK_ENV", "production")
app.config["DEBUG"] = app.config["ENV"] == "development"

@app.route("/evaluate", methods=["POST"])
def evaluate_route():
    """API endpoint to evaluate an arithmetic expression.

    Expected JSON payload:
        {"expression": "<arithmetic expression>"}

    Returns:
        200 JSON ``{"result": <number>}`` on success.
        400 JSON ``{"error": "<message>"}`` on failure.
    """
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON"}), 400
    try:
        data = request.get_json()
    except BadRequest:
        return jsonify({"error": "Malformed JSON"}), 400

    expression = data.get("expression")
    if not isinstance(expression, str):
        return jsonify({"error": "'expression' field must be a string"}), 400
    try:
        result = evaluate_expression(expression)
    except EvaluationError as exc:
        return jsonify({"error": exc.message}), 400
    except Exception as exc:  # Catch‑all for unexpected errors
        return jsonify({"error": f"Internal server error: {str(exc)}"}), 500
    return jsonify({"result": result})

if __name__ == "__main__":
    # Allow running via ``python -m backend.app`` for convenience.
    host = "0.0.0.0"
    port = int(os.getenv("PORT", "5000"))
    app.run(host=host, port=port, debug=app.config["DEBUG"])
