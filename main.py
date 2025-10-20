from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    db.init_app(app)
    
    from . import models, backend_logic, routes
    return app

def run_application():
    app = create_app()
    app.run(debug=True)

if __name__ == '__main__':
    run_application()