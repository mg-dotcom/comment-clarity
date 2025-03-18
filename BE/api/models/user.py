from app import mysql

class User:
    @staticmethod
    def get_all():
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("""
                SELECT userId, firstName, lastName,email,password,createdAt,created_at 
                FROM users
            """)
            
            users = []
            for row in cursor.fetchall():
                user = {
                    'userId': row[0],
                    'firstName': row[1],
                    'lastName': row[2],
                    'email': row[3],
                    'password': row[4],
                    'createdAt': row[5],
                    'created_at': row[6]
                }
                users.append(user)
            
            cursor.close()
            return users, None
            
        except Exception as e:
            return None, str(e)
        