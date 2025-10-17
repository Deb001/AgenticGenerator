import os
from typing import Any, Dict

from flask import Flask, jsonify, render_template, request

from config import Config


def calculate(request_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate the incoming JSON payload, perform the arithmetic operation,
    and return a dictionary containing either the result or an error message.

    Expected keys in ``request_json``:
        - operand1: int or float
        - operand2: int or float
        - operator: one of '+', '-', '*', '/'

    Returns:
        dict: {"result": <value>} on success or {"error": <message>} on failure.
    """
    required_keys = {"operand1", "operand2", "operator"}
    missing = required_keys - request_json.keys()
    if missing:
        return {"error": f"Missing field(s): {', '.join(sorted(missing))}"}

    operand1 = request_json["operand1"]
    operand2 = request_json["operand2"]
    operator = request_json["operator"]

    # Validate operand types
    if not isinstance(operand1, (int, float)):
        return {"error": "operand1 must be a numeric type"}
    if not isinstance(operand2, (int, float)):
        return {"error": "operand2 must be a numeric type"}

    # Validate operator
    if operator not in {"+", "-", "*", "/"}:
        return {"error": f"Unsupported operator '{operator}'. Supported operators are +, -, *, /"}

    try:
        if operator == "+":
            result = operand1 + operand2
        elif operator == "-":
            result = operand1 - operand2
        elif operator == "*":
            result = operand1 * operand2
        elif operator == "/":
            result = operand1 / operand2  # May raise ZeroDivisionError
        else:
            # This branch is theoretically unreachable due to prior validation
            return {"error": "Invalid operator"}
    except ZeroDivisionError:
        return {"error": "Division by zero is not allowed"}

    return {"result": result}


def create_app() -> Flask:
    """
    Application factory that creates and configures the Flask app.
    """
    app = Flask(
        __name__,
        static_folder=os.path.join(os.path.dirname(__file__), "static"),
        template_folder=os.path.join(os.path.dirname(__file__), "templates"),
    )
    app.config.from_object(Config)

    @app.route("/", methods=["GET"])
    def index():
        return render_template("index.html")

    @app.route("/api/calculate", methods=["POST"])
    def api_calculate():
        if not request.is_json:
            return jsonify({"error": "Request must be in JSON format"}), 400

        payload = request.get_json()
        response = calculate(payload)

        if "error" in response:
            return jsonify(response), 400
        return jsonify(response), 200

    return app


# When run directly, start the development server.
if __name__ == "__main__":
    application = create_app()
    # Default to host/port from environment or Flask defaults.
    application.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=application.config.get("DEBUG", False))