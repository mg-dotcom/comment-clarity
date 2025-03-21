from functools import wraps
import jwt
from flask import jsonify, request
from config import JWT_SECRET_KEY

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Missing or invalid authorization token'
            }), 401
        
        token = auth_header.split(' ')[1]

        try:
            decoded_token = jwt.decode(
                token, 
                JWT_SECRET_KEY, 
                algorithms=['HS256'],
                options={"verify_signature": True}
            )
            # Pass the decoded token to the next function
            return f(decoded_token, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 'error',
                'message': 'Token has expired'
            }), 401
        
        except jwt.InvalidTokenError as e:
            return jsonify({
                'status': 'error',
                'message': f'Invalid token: {str(e)}'
            }), 401
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Server error: {str(e)}'
            }), 500
            
    return decorated
