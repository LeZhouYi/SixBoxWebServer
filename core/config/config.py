import configparser

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


def get_css(class_type: str, object_name: str) -> str:
    """
    根据tag获得对应style
    :param class_type: 控件对应的类型
    :param object_name: 控件名称
    :return: 样式内容
    """
    if class_type == "*":
        data_key = "#%s" % object_name
    else:
        data_key = "%s#%s" % (class_type, object_name)
    css = __widget_css[data_key]
    if isinstance(css, dict):
        content_str = ""
        for css_key, css_value in css.items():
            content_str = "%s%s:%s" % (content_str, css_key, css_value)
        css = "%s {%s}" % (data_key, content_str)
    __widget_css[data_key] = css
    return css
