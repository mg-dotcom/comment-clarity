from app import mysql
from flask import jsonify

class Product:
    @staticmethod
    def get_all():
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT productId, productName, startDate, endDate, createdAt, userId
                FROM products
            """)
            
            products = []
            for row in cursor.fetchall():
                product = {
                    'productId': row[0],
                    'productName': row[1],
                    'startDate': row[2],
                    'endDate': row[3],
                    'createdAt': row[4],
                    'userId': row[5]
                }
                products.append(product)
            
            cursor.close()
            return products, None
            
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_by_id(product_id, user_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT productId, productName, startDate, endDate, createdAt, userId
                FROM products
                WHERE productId = %s AND userId = %s
            """, (product_id, user_id))
            
            row = cursor.fetchone()
            cursor.close()

            if row:
                product = {
                    'productId': row[0],
                    'productName': row[1],
                    'startDate': row[2],
                    'endDate': row[3],
                    'createdAt': row[4],
                    'userId': row[5]
                }
                return product, None
            else:
                return None, 'Product not found or not owned by this user'
            
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_user_products(user_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT productId, productName, startDate, endDate, createdAt, userId
                FROM products
                WHERE userId = %s
            """, (user_id,))
            
            products = []
            for row in cursor.fetchall():
                product = {
                    'productId': row[0],
                    'productName': row[1],
                    'startDate': row[2],
                    'endDate': row[3],
                    'createdAt': row[4],
                    'userId': row[5]
                }
                products.append(product)
            
            cursor.close()
            return products, None
            
        except Exception as e:
            return None, str(e)
            
    @staticmethod
    def delete_user_product(user_id, product_id):
        try:
            cursor = mysql.connection.cursor()
            
            # ตรวจสอบว่า product นี้เป็นของ user นี้จริงๆ
            cursor.execute("""
                SELECT * FROM products 
                WHERE productId = %s AND userId = %s
            """, (product_id, user_id))
            
            if not cursor.fetchone():
                cursor.close()
                return False, "Product not found or not owned by this user"
            
            # ลบ comments ที่เกี่ยวข้องก่อน
            cursor.execute("""
                DELETE FROM comments 
                WHERE productId = %s
            """, (product_id,))
            
            # จากนั้นค่อยลบ product
            cursor.execute("""
                DELETE FROM products 
                WHERE productId = %s AND userId = %s
            """, (product_id, user_id))
            
            mysql.connection.commit()
            cursor.close()
            
            return True, "Product and related comments successfully deleted"
            
        except Exception as e:
            return False, str(e)