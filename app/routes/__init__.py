from flask import Blueprint
from app.routes.auth import auth_bp
from app.routes.todo import todo_bp

__all__ = ['auth_bp', 'todo_bp']
