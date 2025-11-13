from flask import Flask, request, jsonify, current_app
from typing import Any, Dict

from .config import Config
from .evaluator import evaluate, EvaluationError

def create_app() -> Flask:
    """Flask application factory.

    Returns:
        A configured Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(Config.from_env())

    @app.route("/evaluate", methods=["POST"])
    def evaluate_route() -> Any:
        """Endpoint that evaluates a mathematical expression.

        Expected JSON payload: {"expression": "2+2"}
        Returns JSON with either {"result": <value>} or {"error": "msg"}.
        """
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        data: Dict[str, Any] = request.get_json()
        expression = data.get("expression")
        if not isinstance(expression, str):
            return jsonify({"error": "Field 'expression' must be a string"}), 400
        try:
            result = evaluate(expression)
        except EvaluationError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception as exc:  # pragma: no cover
            current_app.logger.exception("Unexpected error during evaluation")
            return jsonify({"error": "Internal server error"}), 500
        return jsonify({"result": result})

    return app

if __name__ == "__main__":
    # Local development entry point
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=app.config["DEBUG"])
