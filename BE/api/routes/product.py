from flask import jsonify
from api import api_bp
from api.models.product import Product
import logging
from flask import request
from auth import jwt_required  # เพิ่มการใช้ JWT
from api.models.comment import Comment


# สร้าง API สำหรับดึงข้อมูลจากตาราง products
@api_bp.route('/product', methods=['GET'], endpoint='get_all_products')
@jwt_required
def get_all_products(decoded_token):
    try:
        products, error = Product.get_all()
        
        if error:
            return jsonify({
                'status': 'error',
                'message': error
            }), 500
        
        return jsonify({
            'status': 'success',
            'data': products
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

# # สร้าง API สำหรับดึงข้อมูลจากตาราง products โดยระบุ product_id
# @api_bp.route('/product/<int:product_id>', methods=['GET'], endpoint='get_product_by_id')
# @jwt_required(optional=True)
# def get_product_by_id(decoded_token, product_id):
#     try:
#         if decoded_token:
#             # If token exists, use the user_id from the token
#             user_id = decoded_token['sub']
#             product, error = Product.get_by_user_id(user_id)
            
#             if error:
#                 return jsonify({
#                     'status': 'error',
#                     'message': error
#                 }), 404
        
#             # Return the product(s) for the given user
#             return jsonify({
#                 'status': 'success',
#                 'data': product
#             }), 200
        
#         else:
#             # If no token is provided, fetch the product by product_id
#             product, error = Product.get_by_id(product_id)
            
#             if error:
#                 status_code = 404 if 'not found' in error else 500
#                 return jsonify({
#                     'status': 'error',
#                     'message': error
#                 }), status_code
            
#             return jsonify({
#                 'status': 'success',
#                 'data': product
#             }), 200

#     except Exception as e:
#         return jsonify({
#             'status': 'error',
#             'message': f'Server error: {str(e)}'
#         }), 500

# สร้าง API สำหรับดึงคอมเมนต์ของสินค้าจากตาราง comments
@api_bp.route('/product/<int:product_id>/comments', methods=['GET'], endpoint='get_comments_by_product_id')
@jwt_required
def get_comments_by_product_id(decoded_token, product_id):
    try:
        user_id = decoded_token['sub']

        comments, error = Comment.get_by_product_id(product_id, user_id)
        
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


