from flask import jsonify
from api import api_bp
from api.models.comment import Comment

# สร้าง API สำหรับดึงข้อมูลจากตาราง comments
@api_bp.route('/comments', methods=['GET'])
def get_all_comments():
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

# สร้าง API สำหรับดึงข้อมูลจากตาราง comments โดยระบุ comment_id
@api_bp.route('/comments/<int:comment_id>', methods=['GET'])
def get_comment_by_id(comment_id):
    comment, error = Comment.get_by_id(comment_id)
    
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