from flask import jsonify
from api import api_bp
from api.models.product import Product
import logging
from flask import request
from auth import jwt_required  # เพิ่มการใช้ JWT
from api.models.comment import Comment


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
        valid_sentiments = ['positive', 'negative', 'neutral', 'none']

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