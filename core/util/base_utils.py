import json
import os.path
from typing import Optional


def load_json_data(file_path: str, parent_dir: str = None) -> Optional[dict]:
    """
    读取Json数据
    :param file_path: 文件相对路径
    :param parent_dir: 父文件夹，绝对路径，None则默认根目录
    :return 整体数据
    """
    if parent_dir is None:
        file_path = os.path.join(os.getcwd(), file_path)
    else:
        file_path = os.path.join(parent_dir, file_path)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
