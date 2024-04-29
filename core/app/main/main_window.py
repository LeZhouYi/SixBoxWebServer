from PySide6.QtGui import QGuiApplication, QPalette, QBrush
from PySide6.QtWidgets import QMainWindow, QHBoxLayout, QWidget, QSizePolicy, QVBoxLayout

from core.app.bookmark import BookmarkWidget
from core.config import get_config
from core.widget import WidgetImpl


class MainWindow(QMainWindow, WidgetImpl):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.init_ui()
        self.load_page()

    def init_ui(self):
        """初始化ui"""
        self.init_base_layout()
        self.init_content_layout()

    def init_content_layout(self):
        """初始化内容栏布局"""
        content_widget = self.get_widget("A3")
        # 添加竖向布局
        content_layout = QVBoxLayout()
        content_layout.setSpacing(5)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_widget.setLayout(content_layout)
        self.cache_widget(content_layout, "B30")

    def init_base_layout(self):
        """初始化基础布局"""
        # 设置窗口属性、样式
        self.set_window_geometry()
        self.set_css(self, "ice_background")
        # 设置中央窗口部件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        self.cache_widget(main_widget, "A0")
        # 中央窗口水平布局
        main_layout = QHBoxLayout()
        main_layout.setSpacing(5)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_widget.setLayout(main_layout)
        self.cache_widget(main_layout, "A1")
        # 侧边栏窗口部件
        sidebar_widget = QWidget()
        sidebar_widget.setMinimumWidth(200)
        sidebar_widget.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Expanding)
        main_layout.addWidget(sidebar_widget)
        self.set_css(sidebar_widget, "plant_ui", "QWidget")
        self.cache_widget(sidebar_widget, "A2")
        # 内容栏窗口部件
        content_widget = QWidget()
        main_layout.addWidget(content_widget)
        self.set_css(content_widget, "plant_ui", "QWidget")
        self.cache_widget(content_widget, "A3")

    def set_window_geometry(self):
        """设置窗口大小、位置"""
        window_size_hint = get_config("window_size_hint", "widget")
        screen_size = QGuiApplication.primaryScreen().size()
        width = int(screen_size.width() * window_size_hint[0])
        height = int(screen_size.height() * window_size_hint[1])
        x = (screen_size.width() - width) // 2
        y = (screen_size.height() - height) // 2
        self.setGeometry(x, y, width, height)

    def load_page(self):
        """加载页面内容"""
        # 内容页
        content_layout = self.get_widget("B30")
        # 滚动内容为Bookmark
        page_widget = BookmarkWidget()
        content_layout.addWidget(page_widget)
        self.cache_widget(page_widget, "C300")
