from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models import db, User
from app.schemas import UserRegisterSchema, UserLoginSchema
from app.utils.security import hash_password, verify_password
from werkzeug.exceptions import BadRequest, Conflict, Unauthorized
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        payload = request.get_json(force=True)
        data = UserRegisterSchema(**payload)
    except (BadRequest, ValidationError) as exc:
        raise BadRequest(str(exc))

    if User.query.filter_by(email=data.email).first():
        raise Conflict('Email already registered.')

    hashed = hash_password(data.password)
    user = User(email=data.email, password_hash=hashed, name=data.name)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise Conflict('Email already registered.')

    return jsonify(message='User registered successfully', user_id=user.id), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT."""
    try:
        payload = request.get_json(force=True)
        data = UserLoginSchema(**payload)
    except (BadRequest, ValidationError) as exc:
        raise BadRequest(str(exc))

    user = User.query.filter_by(email=data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise Unauthorized('Invalid credentials.')

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200
