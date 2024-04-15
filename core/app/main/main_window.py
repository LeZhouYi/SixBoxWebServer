from PySide6.QtGui import QGuiApplication
from PySide6.QtWidgets import QMainWindow

from core.config import get_config


class MainWindow(QMainWindow):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.init_ui()

    def init_ui(self):
        """初始化ui"""
        self.set_window_geometry()

    def set_window_geometry(self):
        """设置窗口大小、位置"""
        window_size_hint = get_config("window_size_hint", "widget")
        screen_size = QGuiApplication.primaryScreen().size()
        width = int(screen_size.width() * window_size_hint[0])
        height = int(screen_size.height() * window_size_hint[1])
        x = (screen_size.width() - width) // 2
        y = (screen_size.height() - height) // 2
        self.setGeometry(x, y, width, height)
