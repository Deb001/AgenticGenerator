import os
from gunicorn.app.base import BaseApplication
from app import create_app

class GunicornApp(BaseApplication):
    """Custom Gunicorn application to run the Flask app programmatically."""
    def __init__(self, app, options=None):
        self.application = app
        self.options = options or {}
        super().__init__()

    def load_config(self):
        config = {key: value for key, value in self.options.items()
                  if key in self.cfg.settings and value is not None}
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

def _run_development():
    """Run the Flask development server."""
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

def _run_production():
    """Run the Flask app under Gunicorn with 4 workers."""
    app = create_app()
    options = {
        'bind': '0.0.0.0:5000',
        'workers': 4,
    }
    GunicornApp(app, options).run()

if __name__ == '__main__':
    flask_env = os.getenv('FLASK_ENV')
    if not flask_env:
        raise RuntimeError('FLASK_ENV environment variable is required')
    if flask_env.lower() == 'development':
        _run_development()
    else:
        _run_production()
