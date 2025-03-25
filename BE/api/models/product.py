from app import mysql
from flask import jsonify


# NOTE: if ADD check if +7.00 is correct
class Product:
    @staticmethod
    def get_all():
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT productId, productName ,startDate , endDate, createdAt
                FROM products
            """)
            
            products = []
            for row in cursor.fetchall():
                product = {
                    'productId': row[0],
                    'productName': row[1],
                    'startDate': row[2],
                    'endDate': row[3],
                    'createdAt': row[4]
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
                SELECT productId, productName, startDate, endDate, createdAt
                FROM products
                WHERE productId = %s
            """, (product_id,))
            
            row = cursor.fetchone()
            cursor.close()
            
            if row:
                product = {
                    'productId': row[0],
                    'productName': row[1],
                    'startDate': row[2],
                    'endDate': row[3],
                    'createdAt': row[4]
                    
                }
                return product, None
            else:
                return None, 'Product not found'
            
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_user_products(user_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT p.productId, p.productName, p. startDate, p.endDate, p.createdAt, up.isCreator
                FROM products p
                JOIN userproducts up ON p.productId = up.productId
                WHERE up.userId = %s
            """, (user_id,))
            
            products = []
            for row in cursor.fetchall():
                product = {
                    'productId': row[0],
                    'productName': row[1],
                    'startDate': row[2],
                    'endDate': row[3],
                    'createdAt': row[4],
                    'isCreator': bool(row[5])
                }
                products.append(product)
            
            cursor.close()
            return products, None
            
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_sentiment_by_product_id(product_id, user_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT sa.sentimentType, c.commentId
                FROM sentimentAnalysis sa
                JOIN comments c ON c.sentimentId = sa.sentimentId
                WHERE c.productId = %s AND c.userId = %s
            """, (product_id, user_id))
            
            sentiment_data = {}
            for sentiment_type, comment_id in cursor.fetchall():
                if sentiment_type not in sentiment_data:
                    sentiment_data[sentiment_type] = {'count': 0, 'commentIds': []}
                sentiment_data[sentiment_type]['count'] += 1
                sentiment_data[sentiment_type]['commentIds'].append(comment_id)
            
            # Convert sentiment_data into the desired structure
            sentiment_list = [{
                'sentimentType': sentiment_type,
                'count': len(data['commentIds']),
                'commentIds': data['commentIds']  # List should be correctly formatted without spaces
            } for sentiment_type, data in sentiment_data.items()]
            
            cursor.close()
            return sentiment_list, None
        
        except Exception as e:
            return None, str(e)
