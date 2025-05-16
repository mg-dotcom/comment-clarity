from flask import jsonify
from api import api_bp
from api.models.product import Product
import logging
from flask import request
from auth import jwt_required  # เพิ่มการใช้ JWT
from api.models.comment import Comment
from analyze_model import test_analyze_model as model
from flask import current_app
from db import mysql

# สร้าง API สำหรับดึงข้อมูลจากตาราง products
@api_bp.route('/product/all', methods=['GET'])
@jwt_required
def get_all_products(decoded_token):
    try:
        products, error = Product.get_all()
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 500
        
        return jsonify({
            'success': True,
            'data': products
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลสินค้าจากตาราง products ของ user ท
@api_bp.route('/product', methods=['GET'])
@jwt_required
def get_current_user_products(decoded_token): 
    try:
        user_id = decoded_token['sub']
        products, error = Product.get_user_products(user_id)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 500
        
        return jsonify({
            'success': True,
            'data': products
        }), 200
    
    except Exception as e:
        return jsonify({
             'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
    
# สร้าง API สำหรับดึงข้อมูลจากตาราง products โดยระบุ product_id
@api_bp.route('/product/<int:product_id>', methods=['GET'])
@jwt_required
def get_by_id_and_user(decoded_token, product_id):
    try:
        user_id = decoded_token['sub']
        product, error = Product.get_by_id(product_id, user_id)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 500
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': product
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลจากตาราง products โดยระบุ product_id และแสดง comment ของ user
@api_bp.route('/product/<int:product_id>/with-comments', methods=['GET'], endpoint='get_product_with_comments')
@jwt_required
def get_product_with_comments(decoded_token, product_id):
    try:
        user_id = decoded_token['sub']
        product, product_error = Product.get_by_id(product_id, user_id)
        
        if product_error:
            return jsonify({
                'success': False,
                'message': product_error
            }), 500
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        comments, comment_error = Comment.get_by_product_id(product_id, user_id)
        
        if comment_error:
            logging.error(f"Error fetching comments for product {product_id}: {comment_error}")
            comments = []

        product['comments'] = comments
        
        return jsonify({
            'success': True,
            'data': [product] 
        }), 200
    
    except Exception as e:
        logging.error(f"Error in get_product_with_comments: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลจากตาราง products โดยระบุ product_id และแสดง result ของ category comment average
@api_bp.route('/product/<int:product_id>/result/category-average', methods=['GET'])
@jwt_required()
def get_product_sentiment_by_category_average(decoded_token, product_id):
    try:
        user_id = decoded_token['sub']
        category_name = request.args.get('name', '').strip()

        if category_name:
            valid_categories = ['product', 'delivery', 'service', 'other']
            if category_name.lower() not in valid_categories:
                return jsonify({
                    'success': False,
                    'message': f'Invalid category. Valid categories are: {", ".join(valid_categories)}'
                }), 400
            
        else:
            categories = Comment.get_sentiment_by_all_category(product_id,user_id)
            return jsonify({
                'success': True,
                'data': categories
            }), 200
        
        product, product_error = Product.get_by_id(product_id, user_id)
        
        if product_error:
            return jsonify({
                'success': False,
                'message': product_error
            }), 500
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404

        
        categories, error = Comment.get_sentiment_by_category(product_id, category_name, user_id)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 500
        
        return jsonify({
            'success': True,
            'data': categories
        }), 200
    
    except Exception as e:
        logging.error(f"Error in get_product_sentiment_by_category_average: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลจากตาราง products โดยระบุ product_id และแสดง comment rating
@api_bp.route('/product/<int:product_id>/ratings', methods=['GET'])
@jwt_required()
def get_product_ratings(decoded_token, product_id):
    try:
        user_id = decoded_token['sub']
        product, product_error = Product.get_by_id(product_id, user_id)
        
        if product_error:
            return jsonify({
                'success': False,
                'message': product_error
            }), 500
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        user_id = decoded_token['sub']
        ratings, error = Comment.get_ratings_by_product(product_id, user_id)
        
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 500
        
        return jsonify({
            'success': True,
            'data': {
                'ratings': ratings
            }
        }), 200
    
    except Exception as e:
        logging.error(f"Error in get_product_ratings: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# สร้าง API สำหรับดึงข้อมูลจากตาราง products โดยระบุ product_id และแสดง result ของ category comment detail
@api_bp.route('/product/<int:product_id>/result/category-comments', methods=['GET'])
@jwt_required()
def get_product_sentiment_by_category_detail(decoded_token, product_id):
    try:
        category_name = request.args.get('name', '').strip()
        sentiment_filter = request.args.get('sentiment', '').strip().lower() or None

        valid_categories = ['product', 'delivery', 'service', 'other']
        valid_sentiments = ['positive', 'negative', 'neutral']

        if not category_name or category_name.lower() not in valid_categories:
            return jsonify({
                'success': False,
                'message': f'Invalid category. Valid categories are: {", ".join(valid_categories)}'
            }), 400

        if sentiment_filter and sentiment_filter not in valid_sentiments:
            return jsonify({
                'success': False,
                'message': f'Invalid sentiment. Valid sentiments are: {", ".join(valid_sentiments)}'
            }), 400
        
        user_id = decoded_token['sub']
        product, product_error = Product.get_by_id(product_id, user_id)

        if product_error:
            return jsonify({'success': False, 'message': product_error}), 500

        if not product:
            return jsonify({'success': False, 'message': 'Product not found'}), 404


        sentiment_data, error = Comment.get_sentiment_by_category_detail(product_id, category_name, user_id, sentiment_filter)

        if error:
            return jsonify({'success': False, 'message': error}), 500

        if sentiment_filter is None:
            all_comments = []
            for sentiment in sentiment_data.values():
                all_comments.extend(sentiment.get("comments", []))
            
            sentiment_data = {"comments": all_comments}

        return jsonify({'success': True, 'data': sentiment_data}), 200

    except Exception as e:
        logging.error(f"Error in get_product_sentiment_by_category_detail: {str(e)}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@api_bp.route('/product/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_user_product(decoded_token, product_id): 
    try:
        user_id = decoded_token['sub']
        success, message = Product.delete_user_product(user_id, product_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message}), 200
        else:
            return jsonify({
                'success': False,
                'error': message}), 400
    except Exception as e:
        logging.error(f"Error in delete_user_product: {str(e)}")
        return jsonify({
           'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
    
# สร้าง API สำหรับเพิ่มข้อมูลสินค้าลงในตาราง products
@api_bp.route('/product/create', methods=['POST'])
@jwt_required()
def create_product_and_analyze(decoded_token):
    data = request.json
    user_id = decoded_token['sub']
    product_id = None
    
    # สร้าง connection สำหรับ transaction
    connection = None
    
    try:
        product_name = data.get('productName')
        product_link = data.get('productLink')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        
        if not all([product_name, product_link, start_date, end_date]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        connection = mysql.connection
        
        # ตั้งค่า autocommit เป็น False เพื่อให้ทำ transaction แบบที่เราควบคุมได้
        connection.autocommit = False
        
        # STEP 1: สร้าง Product ในตาราง products
        # ตรวจสอบว่าผู้ใช้มีสินค้านี้อยู่แล้วหรือไม่
        product_id, error = Product.create_product_if_unique_for_user(
            product_name, start_date, end_date, user_id, connection
        )
        
        if error:
            if connection:
                connection.rollback()
            return jsonify({'success': False, 'message': error}), 400
            
        # STEP 2: วิเคราะห์ข้อมูลจาก product_link
        # ทดสอบว่า link ถูกต้องหรือไม่
        df = model.analyze(product_link, start_date, end_date)
        
        # ตรวจสอบว่าได้รับข้อมูลหรือไม่
        if df.empty:
            if connection:
                connection.rollback()
            return jsonify({
                'success': False, 
                'message': 'No data found for the given time period or product link is invalid'
            }), 404
        
        comment_count = 0
        
        for _, row in df.iterrows():
            comment_category_id = get_comment_category_id(row['commentCategoryName'])
            sentiment_id = get_sentiment_id(row['sentimentType'])
            
            # STEP 3: เพิ่มข้อมูลคอมเมนต์ลงในตาราง comments
            success, error = Comment.insert_comment(
                product_id=product_id,
                user_id=user_id,
                comment_category_id=comment_category_id,
                ratings=row['ratings'],
                text=row['text'],
                sentiment_id=sentiment_id,
                connection=connection
            )
            
            if not success:
                if connection:
                    connection.rollback()
                return jsonify({'success': False, 'message': f'Insert failed: {error}'}), 500
            comment_count += 1
            
        # ตรวจสอบว่ามีการเพิ่มความคิดเห็นหรือไม่
        if comment_count == 0:
            if connection:
                connection.rollback()
            return jsonify({
                'success': False, 
                'message': 'No comments/reviews found for the specified time period'
            }), 404
        
        # ถ้าทุกอย่างสำเร็จ ให้ commit การเปลี่ยนแปลงทั้งหมด
        if connection:
            connection.commit()
            
        return jsonify({
            'success': True,
            'message': 'Product and comments created successfully',
            'data': {
                'productId': product_id,
                'commentCount': comment_count
            }
        }), 201
        
    except Exception as e:
        # กรณีเกิดข้อผิดพลาด ให้ rollback ทั้งหมด
        if connection:
            connection.rollback()
        logging.error(f"Error in create_product_and_analyze: {str(e)}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500
    finally:
        # คืนค่า autocommit กลับเป็นค่าเดิม
        if connection:
            connection.autocommit = True

# ฟังก์ชันเพื่อแปลงชื่อ commentCategoryName เป็น commentCategoryId
def get_comment_category_id(comment_category_name):
    comment_category_map = {
        'Product': 1,
        'Delivery': 2,
        'Service': 3,
        'Other': 4
    }
    return comment_category_map.get(comment_category_name, 4)  # จะคืนค่า 4 (Other) ถ้าไม่พบชื่อใน map

# ฟังก์ชันเพื่อแปลงชื่อ sentimentType เป็น sentimentId
def get_sentiment_id(sentiment_type):
    sentiment_map = {
        'Positive': 1,
        'Negative': 2,
        'Neutral': 3,
    }
    return sentiment_map.get(sentiment_type, 3)  # จะคืนค่า 3 (Neutral) ถ้าไม่พบชื่อใน map