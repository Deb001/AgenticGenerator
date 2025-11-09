from flask import Flask

from config import Config
from routes import api_blueprint


def create_app() -> Flask:
    """Create and configure the Flask application.

    Returns
    -------
    Flask
        The configured Flask app instance.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    app.register_blueprint(api_blueprint)
    return app


if __name__ == '__main__':
    try:
        application = create_app()
        application.run(host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        # In a real‑world scenario you would log this exception to a file or monitoring system.
        print(f"Failed to start the Flask application: {e}")
