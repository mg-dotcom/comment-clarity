from flask import jsonify
from api import api_bp
from flask import request
from api.models.user import User
from flask import Response

# สร้าง API สำหรับดึงข้อมูลจากตาราง users
@api_bp.route('/users', methods=['GET'])
def get_all_users():
    users, error = User.get_all()
    
    if error:
        status_code = 404 if 'not found' in error.lower() else 500
        return jsonify({
            'status': 'error',
            'message': error
        }), status_code
    
    if users is None or len(users) == 0:
        return jsonify({
            'status': 'success',
            'data': []
        }), 200
    
    return jsonify({
        'status': 'success',
        'data': users
    }), 200

# สร้าง API สำหรับดึงข้อมูลจากตาราง users โดยระบุ user_id
@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user, error = User.get_by_id(user_id)
    
    if error:
        status_code = 404 if 'not found' in error.lower() else 500
        return jsonify({
            'status': 'error',
            'message': error
        }), status_code
    
    if user is None:
        return jsonify({
            'status': 'error',
            'message': f"User with ID {user_id} not found"
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': user
    }), 200

# สร้าง API สำหรับ Register ผู้ใช้งาน
@api_bp.route('/users/register', methods=['POST'])
def register_user():
    data = request.get_json()
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    
    if not firstName or not lastName or not email or not password:
        return jsonify({
            'status': 'error',
            'message': 'Invalid input'
        }), 400
    
    if User.user_exists(email):
        return jsonify({
            'status': 'error',
            'message': 'User already exists'
        }), 400
    
    if User.register(firstName, lastName, email, password):
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully'
        }), 201
    
    return jsonify({
        'status': 'error',
        'message': 'Error registering user'
    }), 500

# สร้าง API สำหรับ login ผู้ใช้งาน
@api_bp.route('/users/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({
            'status': 'error',
            'message': 'Invalid input'
        }), 400
    
    user = User.login(email, password)
    
    if user:
        return jsonify({
            'status': 'success',
            'data': user.__dict__
        }), 200
    
    return jsonify({
        'status': 'error',
        'message': 'Invalid email or password'
    }), 400

