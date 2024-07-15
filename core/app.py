from flask import Flask

from core.routes import register_blueprints


def run():
    """运行api程序"""
    app = Flask(__name__)  # api主程序
    register_blueprints(app)  # 注册蓝图
    app.run(debug=True, host="0.0.0.0", port=5000)
