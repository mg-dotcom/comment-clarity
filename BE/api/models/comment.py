from app import mysql
from flask import jsonify

class Comment:
    @staticmethod
    def get_all():
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT commentId, customerName, text, timestamp, sentimentId, userId, productId, commentCategoryId 
                FROM comments
            """)
            
            comments = []
            for row in cursor.fetchall():
                comment = {
                    'commentId': row[0],
                    'customerName': row[1],
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
    def get_by_id(comment_id):
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT commentId, customerName, text, timestamp, sentimentId, userId, productId, commentCategoryId
                FROM comments
                WHERE commentId = %s
            """, (comment_id,))
            
            row = cursor.fetchone()
            cursor.close()
            
            if row:
                comment = {
                    'commentId': row[0],
                    'customerName': row[1],
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