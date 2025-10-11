import os
from backend.app import app

# Issue Key: AI-1
# File: run.py
# Purpose: Main application entry point for the Flask server.
# This script is responsible for setting up environment variables
# and starting the Flask development server.

def main():
    """
    Configures and starts the Flask development server.

    This function performs the following steps:
    1. Sets the FLASK_APP environment variable to 'backend.app',
       directing Flask to the application instance defined in
       `backend/app/__init__.py`.
    2. Sets the FLASK_ENV environment variable to 'development',
       enabling debugging features and automatic reloading.
    3. Initializes and runs the Flask development server, making it
       accessible on all network interfaces (0.0.0.0) and port 5000.

    Error handling relies on Flask's built-in server error logging for
    startup issues or unhandled exceptions during runtime.
    """
    # 1. Sets the FLASK_APP environment variable.
    # This tells Flask where to find the application instance.
    os.environ['FLASK_APP'] = 'backend.app'

    # 2. Sets the FLASK_ENV environment variable to 'development'.
    # This enables debug mode, which provides a debugger in the browser
    # for unhandled exceptions and automatically reloads the server
    # on code changes. For production, this should be set to 'production'.
    os.environ['FLASK_ENV'] = 'development'

    # 3. Initializes and runs the Flask development server.
    # Host '0.0.0.0' makes the server accessible from any IP address,
    # which is crucial for running inside containers or accessing from
    # other devices on the local network.
    # Port 5000 is the standard default for Flask.
    print(f"Starting Flask application '{os.environ['FLASK_APP']}' in '{os.environ['FLASK_ENV']}' mode...")
    print("Server will be accessible at http://0.0.0.0:5000")
    try:
        app.run(host='0.0.0.0', port=5000)
    except Exception as e:
        # Flask's app.run() handles most server-related errors internally,
        # but this catch-all ensures any unexpected issues during startup
        # are logged.
        print(f"An error occurred while starting the Flask server: {e}")
        # Optionally, re-raise or exit with a non-zero status
        # import sys
        # sys.exit(1)


if __name__ == '__main__':
    main()