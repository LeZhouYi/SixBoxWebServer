import json
import os


def load_json_data(file_path: str):
    """
    根据相对于项目根目录加载json文件数据
    :param file_path: json文件路径
    :return: json数据
    """
    if file_path is None:
        raise Exception("File path: cannot empty")
    file = os.path.join(os.getcwd(), file_path)
    if os.path.exists(file):
        with open(file, encoding="utf-8") as f:
            return json.load(f)
    else:
        raise Exception("Json file: [%s] not exist" % file)
