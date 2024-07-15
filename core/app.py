import os.path

from flask import Flask

from core.routes import register_blueprints


def run():
    """运行api程序"""
    template_folder = os.path.join(os.getcwd(), "core/templates")
    static_folder = os.path.join(os.getcwd(), "core/static")
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)  # api主程序
    register_blueprints(app)  # 注册蓝图
    app.run(debug=True, host="0.0.0.0", port=5000)
