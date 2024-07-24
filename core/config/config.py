import configparser
import os
import sys

__config = configparser.ConfigParser()
__config.read(os.path.join(os.path.dirname(os.path.realpath(sys.argv[0])), "config/config.ini"), encoding="utf-8")


def get_config(option: str):
    """
    读取当前配置对应字段的值
    :param option: [str]字段
    :return: [any]DEFAULT中字段对应的值
    """
    return __config.get(section="DEFAULT", option=option)


def get_config_path(option: str):
    """从配置文件读取相对于根目录的路径数据"""
    path = __config.get(section="DEFAULT", option=option)
    root = os.path.dirname(os.path.realpath(sys.argv[0]))
    return os.path.join(root, path)


def get_config_by_section(section: str, option: str):
    """
    读取当前配置对应字段的值
    :param section: [str]对应节点
    :param option: [str]字段
    :return: [any]DEFAULT中字段对应的值
    """
    return __config.get(section=section, option=option)
