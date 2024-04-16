from PySide6.QtCore import QObject
from PySide6.QtWidgets import QWidget

from core.config.config import get_css


class WidgetImpl:

    def __init__(self):
        self.cache_widgets = {}

    def cache_widget(self, widget: QObject, key: str) -> QObject:
        """
        缓存控件
        :param widget: 需缓存的控件
        :param key: 控件关键字
        :return: 返回控件自身
        """
        assert key not in self.cache_widgets
        self.cache_widgets[key] = widget
        return self.cache_widgets[key]

    @staticmethod
    def set_css(widget: QWidget, tag: str):
        """
        给控件设置样式
        :param widget: 需设置样式的控件
        :param tag: 标签，同时更新widget的ObjectName
        """
        widget.setObjectName(tag)
        widget.setStyleSheet(get_css(tag))
