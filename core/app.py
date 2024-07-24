import os.path
import sys

from flask import Flask

from core.routes import register_blueprints


def run():
    """运行api程序"""
    root = os.path.dirname(os.path.realpath(sys.argv[0]))
    template_folder = os.path.join(root, "core/templates")
    static_folder = os.path.join(root, "core/static")
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)  # api主程序
    register_blueprints(app)  # 注册蓝图
    app.run(debug=False, host="0.0.0.0", port=5000)
