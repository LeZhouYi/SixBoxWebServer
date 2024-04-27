import configparser

from PySide6.QtGui import QPixmap

from core.util import load_json_data


def get_config(key: str, config_type: str = "DEFAULT", ):
    """
    读取当前配置对应字段的值
    :param config_type: 类型
    :param key: [str]字段
    :return: [any]字段对应的值
    """
    if config_type == "DEFAULT":
        return __config.get("DEFAULT", key)
    elif config_type == "widget":
        return __widget_config[key]


__config = configparser.ConfigParser()
__config.read("src/config/config.ini", encoding="utf-8")
__widget_config = load_json_data(get_config("widget_config"))
__widget_css = load_json_data(get_config("widget_css"))
__resource_config = load_json_data(get_config("resource_config"))
__resources = {}


def load_resource(resource_key: str) -> QPixmap:
    """
    @param resource_key: 资源关键字
    @return: 资源，通常是图片
    """
    assert resource_key in __resource_config
    if resource_key not in __resources:
        __resources[resource_key] = QPixmap(__resource_config[resource_key])
    return __resources[resource_key]


def get_css(class_type: str, object_name: str) -> str:
    """
    根据tag获得对应style
    :param class_type: 控件对应的类型
    :param object_name: 控件名称
    :return: 样式内容
    """
    return __widget_css[class_type][object_name]
