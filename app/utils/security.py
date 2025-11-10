import os
import datetime
import jwt
from functools import wraps
from flask import request, jsonify, current_app, abort, g
from ..models import User
from .. import db

def generate_jwt(user_id: int) -> str:
    """
    Generate a JWT token for a given user ID.
    Token expires in 15 minutes.
    """
    secret = current_app.config.get("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET not configured")
    now = datetime.datetime.utcnow()
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + datetime.timedelta(minutes=15),
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    # PyJWT may return bytes in older versions; ensure string
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

def decode_jwt(token: str) -> dict:
    """
    Decode a JWT token and return its payload.
    Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError on failure.
    """
    secret = current_app.config.get("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET not configured")
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    return payload

def token_required(f):
    """
    Flask decorator that ensures a valid JWT is present.
    On success, sets ``g.current_user`` to the authenticated User instance.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 401
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format"}), 401
        token = parts[1]
        try:
            payload = decode_jwt(token)
            user_id = payload.get("sub")
            if not user_id:
                raise jwt.InvalidTokenError("Token missing subject")
            user = User.query.get(user_id)
            if not user:
                raise jwt.InvalidTokenError("User not found")
            g.current_user = user
        except jwt.ExpiredSignatureError:
            current_app.logger.warning("Expired JWT token")
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            current_app.logger.warning(f"Invalid JWT token: {e}")
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            current_app.logger.exception("Unexpected error during token validation")
            return jsonify({"error": "Authentication failed"}), 401
        return f(*args, **kwargs)
    return decorated