from typing import Union

from PySide6.QtCore import QObject
from PySide6.QtWidgets import QWidget, QLayout

from core.config import get_css


class WidgetImpl:
    """控件通用类，提供一些控件通用的方法"""

    def __init__(self):
        self.cache_widgets = {}

    def cache_widget(self, widget: QObject, key: str):
        """
        缓存控件
        :param widget: 需缓存的控件
        :param key: 控件关键字
        """
        assert key not in self.cache_widgets
        self.cache_widgets[key] = widget

    def get_widget(self, key: str) -> Union[QWidget, QLayout]:
        """
        返回缓存的控件
        :param key: 控件关键字
        :return: 对应的控件
        """
        assert key in self.cache_widgets
        return self.cache_widgets[key]

    @staticmethod
    def set_css(widget: QWidget, object_name: str, class_type: str = "*"):
        """
        给控件设置样式
        :param widget: 需设置样式的控件
        :param object_name: 控件名
        :param class_type: 控件所属类型；*代表通用，通常只与特定object_name有关
        """
        widget.setObjectName(object_name)
        widget.setStyleSheet(get_css(class_type, object_name))
