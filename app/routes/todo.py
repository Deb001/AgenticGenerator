from flask import Blueprint, request, jsonify, g, current_app
from ..models import Todo, db
from ..utils.security import token_required
from ..utils.validators import validate_todo_payload
from marshmallow import ValidationError

todo_bp = Blueprint("todo_bp", __name__, url_prefix="/todos")

@todo_bp.route("", methods=["GET"])
@token_required
def list_todos():
    """
    List all todos for the current user.
    """
    try:
        todos = Todo.query.filter_by(owner_id=g.current_user.id).all()
        from ..schemas import TodoSchema
        schema = TodoSchema(many=True)
        return jsonify(schema.dump(todos)), 200
    except Exception as e:
        current_app.logger.exception("Error fetching todos")
        return jsonify({"error": "Internal server error"}), 500

@todo_bp.route("", methods=["POST"])
@token_required
def create_todo():
    """
    Create a new todo for the current user.
    """
    try:
        json_data = request.get_json()
        if not json_data:
            return jsonify({"error": "Invalid JSON payload"}), 400
        data = validate_todo_payload(json_data)
        todo = Todo(
            title=data["title"],
            description=data.get("description"),
            completed=data.get("completed", False),
            owner_id=g.current_user.id,
        )
        db.session.add(todo)
        db.session.commit()
        from ..schemas import TodoSchema
        schema = TodoSchema()
        return jsonify(schema.dump(todo)), 201
    except ValidationError as ve:
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        current_app.logger.exception("Error creating todo")
        return jsonify({"error": "Internal server error"}), 500

@todo_bp.route("/<int:todo_id>", methods=["GET"])
@token_required
def get_todo(todo_id):
    """
    Retrieve a single todo by ID.
    """
    try:
        todo = Todo.query.get_or_404(todo_id)
        if todo.owner_id != g.current_user.id:
            return jsonify({"error": "Forbidden"}), 403
        from ..schemas import TodoSchema
        schema = TodoSchema()
        return jsonify(schema.dump(todo)), 200
    except Exception as e:
        current_app.logger.exception("Error retrieving todo")
        return jsonify({"error": "Internal server error"}), 500

@todo_bp.route("/<int:todo_id>", methods=["PUT"])
@token_required
def update_todo(todo_id):
    """
    Update an existing todo.
    """
    try:
        todo = Todo.query.get_or_404(todo_id)
        if todo.owner_id != g.current_user.id:
            return jsonify({"error": "Forbidden"}), 403
        json_data = request.get_json()
        if not json_data:
            return jsonify({"error": "Invalid JSON payload"}), 400
        data = validate_todo_payload(json_data, partial=True)
        for key, value in data.items():
            setattr(todo, key, value)
        db.session.commit()
        from ..schemas import TodoSchema
        schema = TodoSchema()
        return jsonify(schema.dump(todo)), 200
    except ValidationError as ve:
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        current_app.logger.exception("Error updating todo")
        return jsonify({"error": "Internal server error"}), 500

@todo_bp.route("/<int:todo_id>", methods=["DELETE"])
@token_required
def delete_todo(todo_id):
    """
    Delete a todo.
    """
    try:
        todo = Todo.query.get_or_404(todo_id)
        if todo.owner_id != g.current_user.id:
            return jsonify({"error": "Forbidden"}), 403
        db.session.delete(todo)
        db.session.commit()
        return jsonify({"message": "Todo deleted"}), 200
    except Exception as e:
        current_app.logger.exception("Error deleting todo")
        return jsonify({"error": "Internal server error"}), 500