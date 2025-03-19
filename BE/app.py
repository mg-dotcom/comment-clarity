from flask import Flask, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
from config import mysql_config, PORT, DEBUG, JWT_SECRET_KEY
from api import api_bp
from flask_jwt_extended import JWTManager
from datetime import timedelta

mysql = MySQL()

def create_app():
    app = Flask(__name__)

    app.config['PORT'] = PORT
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  
    app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY

    CORS(app, supports_credentials=True)

    app.config['MYSQL_HOST'] = mysql_config['HOST']
    app.config['MYSQL_USER'] = mysql_config['USER']
    app.config['MYSQL_PORT'] = mysql_config['PORT']
    app.config['MYSQL_PASSWORD'] = mysql_config['PASSWORD']
    app.config['MYSQL_DB'] = mysql_config['DATABASE']

    jwt = JWTManager(app)
    mysql.init_app(app)

    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute("SET time_zone = '+7:00'")
        cursor.close()

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Unhandled Exception: {e}")
        return jsonify({'status': 'error', 'message': 'Internal Server Error'}), 500


    app.register_blueprint(api_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
