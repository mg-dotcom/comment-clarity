from flask import jsonify
from api import api_bp
from api.models.comment import Comment
from auth import jwt_required  
from flask import request
from analyze_model import test_analyze_model as model

# สร้าง API สำหรับดึงข้อมูลจากตาราง comments
@api_bp.route('/comment', methods=['GET'])
@jwt_required
def get_all_comments(decoded_token):  # รับ decoded_token จาก decorator
    try:
        comments, error = Comment.get_all()
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 500
        
        return jsonify({
            'success': True,
            'data': comments
        }), 200
    
    except Exception as e:
        return jsonify({
           'success': False,
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
                'success': False,
                'message': error
            }), status_code
        
        return jsonify({
            'success': True,
            'data': comment
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลจากตาราง All comments ของ user โดยไม่่ใช Product_id
@api_bp.route('/comment/user', methods=['GET'])
@jwt_required
def get_user_comments(decoded_token):
    try:
        user_id = decoded_token['sub']
        
        comments, error = Comment.get_by_user_id(user_id)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 500
        
        return jsonify({
            'success': True,
            'data': comments
        }), 200
    
    except Exception as e:
        return jsonify({
           'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
    
# สร้าง API สำหรับ analyze sentimental comment โดยใช้ URL
@api_bp.route('/comment/analyze', methods=['POST'])
@jwt_required
def create_analyze_comment(decoded_token):
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({'success': False, 'message': 'URL is required'}), 400

    try:
        df = model.analyze(url)
        user_id = decoded_token['sub']

        for _, row in df.iterrows():
            comment_category_id = get_comment_category_id(row['commentCategoryName'])
            sentiment_id = get_sentiment_id(row['sentimentType'])

            success, error = Comment.insert_comment_to_db(
                product_id=data.get('productId'),
                user_id=user_id,
                comment_category_id=comment_category_id,
                ratings=row['ratings'],
                text=row['text'],
                sentiment_id=sentiment_id
            )
            if not success:
                return jsonify({'success': False, 'message': f'Insert failed: {error}'}), 500

        return jsonify({
            'success': True,
            'message': 'All comments imported successfully',
            'data': df.to_dict(orient='records')
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

