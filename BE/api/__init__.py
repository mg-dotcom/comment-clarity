from flask import Blueprint

# สร้าง Blueprint สำหรับ API
api_bp = Blueprint('api', __name__)

# นำเข้า routes
from api.routes import comments, products