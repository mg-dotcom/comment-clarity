from app import mysql
from flask import jsonify

class Comment:
    @staticmethod
    def get_all():
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT commentId, ratings, text, date, sentimentId, userId, productId, commentCategoryId 
                FROM comments
            """)
            
            comments = []
            for row in cursor.fetchall():
                comment = {
                    'commentId': row[0],
                    'ratings': row[1],
                    'text': row[2],
                    'date': row[3].strftime('%Y-%m-%d') if row[3] else None,
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
                SELECT commentId, ratings, text, date, sentimentId, userId, productId, commentCategoryId
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
                    'date': row[3].strftime('%Y-%m-%d') if row[3] else None,
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
                SELECT commentId, ratings, text, date, sentimentId, userId, productId, commentCategoryId
                FROM comments
                WHERE userId = %s
            """, (user_id,))
            
            comments = []
            for row in cursor.fetchall():
                comment = {
                    'commentId': row[0],
                    'ratings': row[1],
                    'text': row[2],
                    'date': row[3].strftime('%Y-%m-%d') if row[3] else None,
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
                    SELECT c.commentId, c.text, c.date, u.firstName, u.lastName, c.ratings
                    FROM comments c
                    JOIN users u ON c.userId = u.userId
                    WHERE c.productId = %s AND c.userId = %s
                    ORDER BY c.date DESC
                """, (product_id, user_id))
            else:
                cursor.execute("""
                    SELECT c.commentId, c.text, c.date, u.firstName, u.lastName, c.ratings
                    FROM comments c
                    JOIN users u ON c.userId = u.userId
                    WHERE c.productId = %s
                    ORDER BY c.date DESC
                """, (product_id,))
            
            comments = []
            for row in cursor.fetchall():
                comment = {
                    'commentId': row[0],
                    'text': row[1],
                    'date': row[2].strftime('%Y-%m-%d') if row[2] else None,
                    'userName': f"{row[3]} {row[4]}",
                    'ratings': row[5]
                }
                comments.append(comment)
            
            cursor.close()
            return comments, None
        
        except Exception as e:
            return None, str(e)
        
    @staticmethod
    def get_sentiment_by_category(product_id, category_name=None, user_id=None):
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
            
            # Add category filter if provided
            if category_name is not None:
                query += " AND LOWER(cc.commentCategoryName) = LOWER(%s)"
                params.append(category_name)
            
            if user_id is not None:
                query += " AND c.userId = %s"
                params.append(user_id)
            
            query += " GROUP BY cc.commentCategoryName, sa.sentimentType"
            
            cursor.execute(query, tuple(params))
            
            results = cursor.fetchall()
            cursor.close()
            
            categories = {}
            
            # If a specific category was requested, only initialize that one
            if category_name:
                categories[category_name.lower()] = {
                    "positive (%)": 0.0,
                    "negative (%)": 0.0,
                    "neutral (%)": 0.0,
                    "none (%)": 0.0
                }
            else:
                # Otherwise initialize all categories
                for category in ['Product', 'Delivery', 'Service', 'Other']:
                    categories[category.lower()] = {
                        "positive (%)": 0.0,
                        "negative (%)": 0.0,
                        "neutral (%)": 0.0,
                        "none (%)": 0.0
                    }
            
            for row in results:
                category = row[0].lower()
                sentiment = row[1].lower() if row[1] else "none"
                count = row[2]
                total = row[3]
                
                if total > 0:
                    percentage = round((count / total) * 100, 1)
                    
                    # Only process this category if it matches our filter or if no filter
                    if category in categories:
                        categories[category][f"{sentiment} (%)"] = percentage
            
            return categories, None
            
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_ratings_by_product(product_id, user_id=None):
        try:
            cursor = mysql.connection.cursor()

            query = """
                SELECT 
                    c.ratings,
                    COUNT(*) as count
                FROM comments c
                WHERE c.productId = %s AND c.ratings IS NOT NULL
            """
            params = [product_id]
            
            if user_id is not None:
                query += " AND c.userId = %s"
                params.append(user_id)
            
            query += " GROUP BY c.ratings ORDER BY c.ratings DESC"
            
            cursor.execute(query, tuple(params))
            results = cursor.fetchall()
            cursor.close()
            
            ratings = {
                "5-star": 0,
                "4-star": 0,
                "3-star": 0,
                "2-star": 0,
                "1-star": 0
            }
            
            for row in results:
                rating = row[0]  
                count = row[1]   
                
                if 1 <= rating <= 5:
                    ratings[f"{rating}-star"] = count
            
            return ratings, None
                
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_sentiment_by_category_detail(product_id, category_name, user_id):
        try:
            cursor = mysql.connection.cursor()
            
            query = """
                SELECT 
                    c.commentId,
                    c.ratings,
                    c.text,
                    c.date,
                    CONCAT(u.firstName, ' ', u.lastName) as userName,
                    sa.sentimentType
                FROM comments c
                JOIN users u ON c.userId = u.userId
                JOIN sentimentanalysis sa ON c.sentimentId = sa.sentimentId
                JOIN commentcategory cc ON c.commentCategoryId = cc.commentCategoryId
                WHERE c.productId = %s
                AND LOWER(cc.commentCategoryName) = LOWER(%s)
                AND c.userId = %s
            """
            params = [product_id, category_name, user_id]
            
            cursor.execute(query, tuple(params))
            comments = cursor.fetchall()
            cursor.close()
            
            result = {
                "positive": {"comments": []},
                "negative": {"comments": []},
                "neutral": {"comments": []},
                "none": {"comments": []}
            }

            for comment in comments:
                commentId = comment[0]
                ratings = comment[1]
                text = comment[2]
                date = comment[3]
                userName = comment[4]
                sentimentType = comment[5].lower() if comment[5] else 'none'
                
                comment_obj = {
                    "commentId": commentId,
                    "ratings": ratings,
                    "text": text,
                    "date": date.strftime('%Y-%m-%d'),
                    "userName": userName
                }
                
                if sentimentType in result:
                    result[sentimentType]["comments"].append(comment_obj)
            
            return result, None
            
        except Exception as e:
            return None, str(e)