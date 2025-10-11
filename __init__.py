import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask

def create_app():
    """
    Creates and configures the Flask application instance.

    This function initializes the Flask app, sets up static and template folders
    to serve the frontend, registers blueprints for API routes, and configures
    basic application settings like secret key and logging.

    Returns:
        Flask: The configured Flask application instance.
    """
    # Determine the absolute path to the project root.
    # This file is located at 'calculator_app/backend/app/__init__.py'.
    # The project root is 'calculator_app/'.
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

    # Define paths for static and template folders relative to the project root.
    # These paths point to the 'frontend' directory.
    template_dir = os.path.join(project_root, 'frontend', 'templates')
    static_dir = os.path.join(project_root, 'frontend', 'static')

    # Initialize the Flask application.
    # Specify the template and static folders to serve frontend assets.
    app = Flask(__name__,
                template_folder=template_dir,
                static_folder=static_dir)

    # --- Application Configuration ---
    # Load SECRET_KEY from environment variables for production.
    # Provide a default for development purposes.
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_strong_dev_secret_key_please_change_me')
    
    # Set the environment (e.g., 'development', 'production').
    app.config['ENV'] = os.environ.get('FLASK_ENV', 'development')
    
    # Enable/disable debug mode based on the environment.
    app.config['DEBUG'] = app.config['ENV'] == 'development'

    # --- Logging Configuration ---
    # Set up basic file logging for non-debug environments.
    if not app.debug:
        # Ensure 'logs' directory exists.
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        # Configure a rotating file handler to prevent log files from growing indefinitely.
        file_handler = RotatingFileHandler(
            'logs/calculator_app.log', 
            maxBytes=10240,  # 10 KB per file
            backupCount=10   # Keep up to 10 backup log files
        )
        
        # Define the log message format.
        formatter = logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
        file_handler.setFormatter(formatter)
        
        # Set the logging level for the file handler.
        file_handler.setLevel(logging.INFO)
        
        # Add the file handler to the application's logger.
        app.logger.addHandler(file_handler)

        # Set the overall logging level for the application.
        app.logger.setLevel(logging.INFO)
        app.logger.info('Calculator app startup')
    else:
        # For debug mode, log to console.
        app.logger.setLevel(logging.DEBUG)
        app.logger.info('Calculator app running in DEBUG mode')

    # --- Register Blueprints/Routes ---
    # Import the blueprint from the 'routes.py' file within the 'app' package.
    # This assumes 'routes.py' defines a Flask Blueprint named 'main_bp'.
    try:
        from .routes import main_bp
        app.register_blueprint(main_bp)
        app.logger.info("Blueprint 'main_bp' registered successfully.")
    except ImportError as e:
        app.logger.error(f"Failed to import blueprint from routes.py: {e}")
        # Depending on the severity, you might want to raise the exception
        # or handle it gracefully, e.g., by serving an error page.
    except Exception as e:
        app.logger.error(f"An unexpected error occurred during blueprint registration: {e}")

    return app