from flask_jwt_extended import create_access_token, JWTManager
from flask_bcrypt import Bcrypt
import jwt

# Initialize Flask-Bcrypt for password hashing
bcrypt = Bcrypt()

def generate_token(user):
    """
    Generates JWT token for authentication.
    
    Args:
        user (dict): User data containing at least 'id' and 'username'.
        
    Returns:
        str: JWT token.
    """
    # Ensure the user dictionary contains necessary fields
    if 'id' not in user or 'username' not in user:
        raise ValueError("User must have an id and username.")
    
    # Generate JWT token for the user
    return create_access_token(identity=user['id'])

def verify_token(token):
    """
    Verifies JWT and returns user ID if valid.
    
    Args:
        token (str): JWT token to be verified.
        
    Returns:
        int or None: User ID if the token is valid, otherwise None.
    """
    try:
        # Decode the token using Flask-JWT-Extended's decode method
        user_id = JWTManager().decode_token(token)['identity']
        return user_id
    except jwt.ExpiredSignatureError:
        # Handle expired token error
        print("Token has expired.")
        return None
    except jwt.InvalidTokenError:
        # Handle invalid token error
        print("Invalid token.")
        return None

# Example usage in app.py or main.py
if __name__ == "__main__":
    user = {'id': 1, 'username': 'john_doe'}
    token = generate_token(user)
    print("Generated Token:", token)
    
    verified_user_id = verify_token(token)
    if verified_user_id:
        print("Verified User ID:", verified_user_id)