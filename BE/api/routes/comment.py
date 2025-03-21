from flask import jsonify
from api import api_bp
from api.models.comment import Comment
from auth import jwt_required  

# สร้าง API สำหรับดึงข้อมูลจากตาราง comments
@api_bp.route('/comment', methods=['GET'])
@jwt_required
def get_all_comments(decoded_token):  # รับ decoded_token จาก decorator
    try:
        comments, error = Comment.get_all()
        
        if error:
            return jsonify({
                'status': 'error',
                'message': error
            }), 500
        
        return jsonify({
            'status': 'success',
            'data': comments
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลจากตาราง comments โดยระบุ comment_id
@api_bp.route('/comment/<int:comment_id>', methods=['GET'])
@jwt_required
def get_comment_by_id(decoded_token,comment_id):
    try:
        comment, error = Comment.get_comment_by_id(comment_id)
        
        if error:
            status_code = 404 if 'not found' in error else 500
            return jsonify({
                'status': 'error',
                'message': error
            }), status_code
        
        return jsonify({
            'status': 'success',
            'data': comment
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลจากตาราง comments โดยระบุ user_id
@api_bp.route('/comment/user', methods=['GET'])
@jwt_required
def get_user_comments(decoded_token):
    try:
        user_id = decoded_token['sub']
        
        comments, error = Comment.get_by_user_id(user_id)
        
        if error:
            return jsonify({
                'status': 'error',
                'message': error
            }), 500
        
        return jsonify({
            'status': 'success',
            'data': comments
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500