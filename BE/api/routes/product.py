from flask import jsonify
from api import api_bp
from api.models.product import Product

# สร้าง API สำหรับดึงข้อมูลจากตาราง products
@api_bp.route('/products', methods=['GET'])
def get_all_products():
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
    
# สร้าง API สำหรับดึงข้อมูลจากตาราง products โดยระบุ product_id
@api_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    product, error = Product.get_by_id(product_id)
    
    if error:
        status_code = 404 if 'not found' in error else 500
        return jsonify({
            'status': 'error',
            'message': error
        }), status_code
    
    return jsonify({
        'status': 'success',
        'data': product
    }), 200