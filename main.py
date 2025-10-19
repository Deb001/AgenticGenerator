from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'  # Example configuration for SQLite database
    db.init_app(app)
    
    from . import models, routes
    return app

def run_app():
    app = create_app()
    app.run(debug=True)

This code initializes the Flask application and sets up a connection to an SQLite database for portfolio management. It also connects to `models.py` and `routes.py` for handling database operations and API routes, respectively.