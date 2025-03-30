from app import mysql
from flask import jsonify

class Comment:
    @staticmethod
    def get_all():
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT commentId, ratings, text, timestamp, sentimentId, userId, productId, commentCategoryId 
                FROM comments
            """)
            
            comments = []
            for row in cursor.fetchall():
                comment = {
                    'commentId': row[0],
                    'ratings': row[1],
                    'text': row[2],
                    'timestamp': row[3].strftime('%Y-%m-%d %H:%M:%S') if row[3] else None,
                    'sentimentId': row[4],
                    'userId': row[5],
                    'productId': row[6],
                    'commentCategoryId': row[7]
                }
                comments.append(comment)
            
            cursor.close()
            return comments, None
            
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_comment_by_id(comment_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT commentId, ratings, text, timestamp, sentimentId, userId, productId, commentCategoryId
                FROM comments
                WHERE commentId = %s
            """, (comment_id,))
            
            row = cursor.fetchone()
            cursor.close()
            
            if row:
                comment = {
                    'commentId': row[0],
                    'ratings': row[1],
                    'text': row[2],
                    'timestamp': row[3].strftime('%Y-%m-%d %H:%M:%S') if row[3] else None,
                    'sentimentId': row[4],
                    'userId': row[5],
                    'productId': row[6],
                    'commentCategoryId': row[7]
                }
                return comment, None
            else:
                return None, f'Comment with ID {comment_id} not found'
                
        except Exception as e:
            return None, str(e)
        
    @staticmethod
    def get_by_user_id(user_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT commentId, ratings, text, timestamp, sentimentId, userId, productId, commentCategoryId
                FROM comments
                WHERE userId = %s
            """, (user_id,))
            
            comments = []
            for row in cursor.fetchall():
                comment = {
                    'commentId': row[0],
                    'ratings': row[1],
                    'text': row[2],
                    'timestamp': row[3].strftime('%Y-%m-%d %H:%M:%S') if row[3] else None,
                    'sentimentId': row[4],
                    'userId': row[5],
                    'productId': row[6],
                    'commentCategoryId': row[7]
                }
                comments.append(comment)
            
            cursor.close()
            return comments, None
            
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_by_product_id(product_id, user_id=None):
        try:
            cursor = mysql.connection.cursor()
            
            if user_id:
                cursor.execute("""
                    SELECT c.commentId, c.text, c.timestamp, u.firstName, u.lastName, c.ratings
                    FROM comments c
                    JOIN users u ON c.userId = u.userId
                    WHERE c.productId = %s AND c.userId = %s
                    ORDER BY c.timestamp DESC
                """, (product_id, user_id))
            else:
                cursor.execute("""
                    SELECT c.commentId, c.text, c.timestamp, u.firstName, u.lastName, c.ratings
                    FROM comments c
                    JOIN users u ON c.userId = u.userId
                    WHERE c.productId = %s
                    ORDER BY c.timestamp DESC
                """, (product_id,))
            
            comments = []
            for row in cursor.fetchall():
                comment = {
                    'commentId': row[0],
                    'text': row[1],
                    'timestamp': row[2].strftime('%Y-%m-%d %H:%M:%S') if row[2] else None,
                    'userName': f"{row[3]} {row[4]}",
                    'ratings': row[5]
                }
                comments.append(comment)
            
            cursor.close()
            return comments, None
        
        except Exception as e:
            return None, str(e)
        
      
    @staticmethod
    def get_sentiment_by_category(product_id, user_id=None):
        try:
            cursor = mysql.connection.cursor()
            
            # Base query
            query = """
                SELECT 
                    cc.commentCategoryName,
                    sa.sentimentType,
                    COUNT(*) as count,
                    (SELECT COUNT(*) 
                     FROM comments c2
                     JOIN commentcategory cc2 ON c2.commentCategoryId = cc2.commentCategoryId
                     WHERE c2.productId = %s
            """
            
            params = [product_id]
            
            if user_id is not None:
                query += " AND c2.userId = %s"
                params.append(user_id)
            
            query += """
                     AND cc2.commentCategoryName = cc.commentCategoryName) as total
                FROM comments c
                JOIN sentimentanalysis sa ON c.sentimentId = sa.sentimentId
                JOIN commentcategory cc ON c.commentCategoryId = cc.commentCategoryId
                WHERE c.productId = %s
            """
            params.append(product_id)
            

            if user_id is not None:
                query += " AND c.userId = %s"
                params.append(user_id)
            
            query += " GROUP BY cc.commentCategoryName, sa.sentimentType"
            
            cursor.execute(query, tuple(params))
            
            results = cursor.fetchall()
            cursor.close()
            

            categories = {}

            for category in ['Product', 'Delivery', 'Service', 'Other']:
                categories[category.lower()] = {
                    "positive (%)": 0.0,
                    "negative (%)": 0.0,
                    "neutral (%)": 0.0,
                    "none (%)": 0.0
                }
            

            for row in results:
                category = row[0].lower()  
                sentiment = row[1].lower()  
                count = row[2] 
                total = row[3] 
                
                if total > 0:
                    percentage = round((count / total) * 100, 1)
                    categories[category][f"{sentiment} (%)"] = percentage
            
            return categories, None
            
        except Exception as e:
            return None, str(e)