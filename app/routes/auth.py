from flask import Blueprint, request, jsonify, current_app
from ..models import User, db
from ..utils.security import generate_jwt
from ..utils.validators import validate_registration, validate_login
from werkzeug.security import generate_password_hash, check_password_hash
from marshmallow import ValidationError

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    """
    try:
        json_data = request.get_json()
        if not json_data:
            return jsonify({"error": "Invalid JSON payload"}), 400
        data = validate_registration(json_data)

        # Check uniqueness
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username already exists"}), 400
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already registered"}), 400

        hashed_pw = generate_password_hash(data["password"])
        user = User(
            username=data["username"],
            email=data["email"],
            password_hash=hashed_pw,
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except ValidationError as ve:
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        current_app.logger.exception("Unexpected error during registration")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT.
    """
    try:
        json_data = request.get_json()
        if not json_data:
            return jsonify({"error": "Invalid JSON payload"}), 400
        data = validate_login(json_data)

        user = User.query.filter_by(username=data["username"]).first()
        if not user or not check_password_hash(user.password_hash, data["password"]):
            return jsonify({"error": "Invalid credentials"}), 401

        token = generate_jwt(user.id)
        return jsonify({"access_token": token}), 200
    except ValidationError as ve:
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        current_app.logger.exception("Unexpected error during login")
        return jsonify({"error": "Internal server error"}), 500