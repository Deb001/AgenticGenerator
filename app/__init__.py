from flask import Flask, jsonify, current_app
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from .config import Config
from .routes.auth import auth_bp
from .routes.todo import todo_bp

db = SQLAlchemy()
ma = Marshmallow()

def create_app() -> Flask:
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(todo_bp)

    # Optional security headers via Flask-Talisman
    try:
        from flask_talisman import Talisman
        Talisman(app, content_security_policy=None)
    except ImportError:
        pass

    # Register error handlers
    app.register_error_handler(400, handle_400)
    app.register_error_handler(401, handle_401)
    app.register_error_handler(403, handle_403)
    app.register_error_handler(404, handle_404)
    app.register_error_handler(500, handle_500)

    # Disable debug in production
    if app.config.get("ENV") == "production":
        app.config["DEBUG"] = False

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

    return app

def handle_400(error):
    return jsonify({"error": "Bad Request", "message": str(error), "status": 400}), 400

def handle_401(error):
    return jsonify({"error": "Unauthorized", "message": str(error), "status": 401}), 401

def handle_403(error):
    return jsonify({"error": "Forbidden", "message": str(error), "status": 403}), 403

def handle_404(error):
    return jsonify({"error": "Not Found", "message": str(error), "status": 404}), 404

def handle_500(error):
    current_app.logger.exception("Internal server error")
    return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred.", "status": 500}), 500