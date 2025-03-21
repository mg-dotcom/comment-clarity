from app import mysql
from flask import jsonify

class Product:
    @staticmethod
    def get_all():
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT productId, productName
                FROM products
            """)
            
            products = []
            for row in cursor.fetchall():
                product = {
                    'productId': row[0],
                    'productName': row[1],
                }
                products.append(product)
            
            cursor.close()
            return products, None
            
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_by_id(product_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT productId, productName
                FROM products
                WHERE productId = %s
            """, (product_id,))
            
            row = cursor.fetchone()
            cursor.close()
            
            if row:
                product = {
                    'productId': row[0],
                    'productName': row[1],
                }
                return product, None
            else:
                return None, 'Product not found'
            
        except Exception as e:
            return None, str(e)



