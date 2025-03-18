from flask import Flask
from flask_cors import CORS
from flask_mysqldb import MySQL
from config import mysql_config, port, debug 
from api import api_bp

mysql = MySQL()

def create_app():
    app = Flask(__name__)
    
    app.config['DEBUG'] = debug
    app.config['PORT'] = port
    
    CORS(app)
    
    app.config['MYSQL_HOST'] = mysql_config['host']
    app.config['MYSQL_USER'] = mysql_config['user']
    app.config['MYSQL_PORT'] = mysql_config['port']
    app.config['MYSQL_PASSWORD'] = mysql_config['password']
    app.config['MYSQL_DB'] = mysql_config['database']
    
    mysql.init_app(app)
    
    # Add timezone setting 
    @app.before_request
    def set_timezone():
        cursor = mysql.connection.cursor()
        cursor.execute("SET time_zone = '+7:00'")  
        cursor.close()
    
   
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=app.config['PORT'])