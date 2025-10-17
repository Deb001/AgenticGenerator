from flask import Flask, request, jsonify, render_template
from calculator.evaluator import evaluate_expression
import os
import config


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__, static_folder="static", template_folder="templates")
    # Load configuration from config.py (expects a Config class)
    app.config.from_object(config.Config)

    @app.route("/", methods=["GET"])
    def index():
        """Render the main calculator UI."""
        return render_template("index.html")

    @app.route("/api/evaluate", methods=["POST"])
    def evaluate():
        """Evaluate an arithmetic expression sent in JSON payload."""
        if not request.is_json:
            return jsonify({"error": "Request payload must be in JSON format"}), 400

        data = request.get_json(silent=True) or {}
        expression = data.get("expression")

        if not isinstance(expression, str) or not expression.strip():
            return jsonify({"error": "Missing or empty 'expression' field"}), 400

        try:
            result = evaluate_expression(expression)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 422
        except Exception as exc:  # unexpected errors
            return jsonify({"error": "Internal server error"}), 500

        return jsonify({"result": result}), 200

    return app


# Expose the Flask app instance for WSGI servers like gunicorn
app = create_app()

if __name__ == "__main__":
    # When run directly, use Flask's built‑in server (useful for development)
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=debug)