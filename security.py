from flask import Flask, request, jsonify
from functools import wraps
import jwt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 403
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = {
                "id": data['id'],
                "username": data['username']
            }
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 403

        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/login')
def login():
    auth = request.authorization
    if auth and auth.username == 'admin' and auth.password == 'password':
        token = jwt.encode({
            'id': 1,
            'username': auth.username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token})
    return jsonify({'message': 'Could not verify'}), 401

@app.route('/protected')
@token_required
def protected(current_user):
    return jsonify({'message': f'Hello, {current_user["username"]}! This is a protected route.'})

if __name__ == '__main__':
    app.run(debug=True)