from PySide6.QtGui import QGuiApplication
from PySide6.QtWidgets import QMainWindow, QHBoxLayout, QVBoxLayout, QScrollArea

from core.app.widget import WidgetImpl
from core.config import get_config


class MainWindow(QMainWindow, WidgetImpl):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.init_ui()

    def init_ui(self):
        """初始化ui"""
        self.set_window_geometry()
        self.set_css(self, "_white_bg")
        main_layout = self.cache_widget(QHBoxLayout(), "mainLayout")
        side_scroll_area = self.cache_widget(QScrollArea(), "side_scroll_area")
        self.set_css(side_scroll_area, "_test_bg")
        main_layout.addWidget(side_scroll_area)
        self.setLayout(main_layout)
        # side_layout = self.cache_widget(QVBoxLayout(main_layout), "sideLayout")

    def set_window_geometry(self):
        """设置窗口大小、位置"""
        window_size_hint = get_config("window_size_hint", "widget")
        screen_size = QGuiApplication.primaryScreen().size()
        width = int(screen_size.width() * window_size_hint[0])
        height = int(screen_size.height() * window_size_hint[1])
        x = (screen_size.width() - width) // 2
        y = (screen_size.height() - height) // 2
        self.setGeometry(x, y, width, height)
