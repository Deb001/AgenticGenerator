import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from app.config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app() -> Flask:
    """Factory to create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    Talisman(app, content_security_policy=None)

    # Register blueprints
    from app.routes import auth_bp, todo_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(todo_bp, url_prefix='/api/todos')

    # Generic error handlers
    @app.errorhandler(400)
    def handle_400(error):
        return jsonify(error=str(error.description or 'Bad Request')), 400

    @app.errorhandler(401)
    def handle_401(error):
        return jsonify(error=str(error.description or 'Unauthorized')), 401

    @app.errorhandler(403)
    def handle_403(error):
        return jsonify(error=str(error.description or 'Forbidden')), 403

    @app.errorhandler(404)
    def handle_404(error):
        return jsonify(error=str(error.description or 'Not Found')), 404

    @app.errorhandler(500)
    def handle_500(error):
        # In a real app you would log the exception here
        return jsonify(error='Internal Server Error'), 500

    return app
