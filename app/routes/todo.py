from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Todo
from app.schemas import TodoCreateSchema, TodoUpdateSchema, TodoResponseSchema
from werkzeug.exceptions import BadRequest
from pydantic import ValidationError

todo_bp = Blueprint('todos', __name__)

@todo_bp.route('/', methods=['GET'])
@jwt_required()
def list_todos():
    """List all todos for the authenticated user."""
    owner_id = get_jwt_identity()
    todos = Todo.query.filter_by(owner_id=owner_id).all()
    result = [TodoResponseSchema.from_orm(t).model_dump() for t in todos]
    return jsonify(result), 200

@todo_bp.route('/', methods=['POST'])
@jwt_required()
def create_todo():
    """Create a new todo for the authenticated user."""
    owner_id = get_jwt_identity()
    try:
        payload = request.get_json(force=True)
        data = TodoCreateSchema(**payload)
    except (BadRequest, ValidationError) as exc:
        raise BadRequest(str(exc))

    todo = Todo(
        owner_id=owner_id,
        title=data.title,
        description=data.description,
        completed=data.completed,
    )
    db.session.add(todo)
    db.session.commit()
    return jsonify(TodoResponseSchema.from_orm(todo).model_dump()), 201

@todo_bp.route('/<int:todo_id>', methods=['GET'])
@jwt_required()
def get_todo(todo_id: int):
    """Retrieve a single todo belonging to the authenticated user."""
    owner_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, owner_id=owner_id).first()
    if not todo:
        abort(404, description='Todo not found')
    return jsonify(TodoResponseSchema.from_orm(todo).model_dump()), 200

@todo_bp.route('/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id: int):
    """Update fields of an existing todo."""
    owner_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, owner_id=owner_id).first()
    if not todo:
        abort(404, description='Todo not found')
    try:
        payload = request.get_json(force=True)
        data = TodoUpdateSchema(**payload)
    except (BadRequest, ValidationError) as exc:
        raise BadRequest(str(exc))

    updated = False
    if data.title is not None:
        todo.title = data.title
        updated = True
    if data.description is not None:
        todo.description = data.description
        updated = True
    if data.completed is not None:
        todo.completed = data.completed
        updated = True

    if not updated:
        raise BadRequest('No fields provided for update.')

    db.session.commit()
    return jsonify(TodoResponseSchema.from_orm(todo).model_dump()), 200

@todo_bp.route('/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id: int):
    """Delete a todo."""
    owner_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, owner_id=owner_id).first()
    if not todo:
        abort(404, description='Todo not found')
    db.session.delete(todo)
    db.session.commit()
    return '', 204
