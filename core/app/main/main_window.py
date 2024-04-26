from PySide6.QtCore import Qt
from PySide6.QtGui import QGuiApplication
from PySide6.QtWidgets import QMainWindow, QHBoxLayout, QWidget, QSizePolicy, QScrollArea, QVBoxLayout, QPushButton

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
        content_widget = self.get_widget("0004")
        # 添加竖向布局
        content_layout = QVBoxLayout()
        content_layout.setSpacing(5)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_widget.setLayout(content_layout)
        self.cache_widget(content_layout, "0006")
        # 添加滚动容器
        scroll_area = QScrollArea()
        scroll_area.setAlignment(Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft)
        content_layout.addWidget(scroll_area)
        self.set_css(scroll_area, "scroll_main", "QScrollArea")
        self.cache_widget(scroll_area, "0007")
        # 滚动容器内容
        scroll_widget = QWidget()
        scroll_widget.setMinimumWidth(500)
        scroll_widget.setMinimumHeight(500)
        scroll_area.setWidget(scroll_widget)
        self.set_css(scroll_widget,"test_background")
        self.cache_widget(scroll_widget, "0008")
        # 滚动容器竖向布局
        scroll_layout = QVBoxLayout()
        scroll_widget.setLayout(scroll_layout)
        self.cache_widget(scroll_layout, "0009")

        for i in range(40):
            button = QPushButton(f"Button {i + 1}")
            button.setMinimumWidth(100)
            button.setMinimumHeight(50)
            scroll_layout.addWidget(button)

    def init_base_layout(self):
        """初始化基础布局"""
        # 设置窗口属性、样式
        self.set_window_geometry()
        self.set_css(self, "white_background")
        # 设置中央窗口部件
        main_widget = QWidget()
        self.set_css(main_widget, "widget_base", "QWidget")
        self.setCentralWidget(main_widget)
        self.cache_widget(main_widget, "0001")
        # 中央窗口水平布局
        main_layout = QHBoxLayout()
        main_layout.setSpacing(5)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_widget.setLayout(main_layout)
        self.cache_widget(main_layout, "0002")
        # 侧边栏窗口部件
        sidebar_widget = QWidget()
        sidebar_widget.setMinimumWidth(200)
        sidebar_widget.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Expanding)
        main_layout.addWidget(sidebar_widget)
        self.set_css(sidebar_widget, "widget_main", "QWidget")
        self.cache_widget(sidebar_widget, "0003")
        # 内容栏窗口部件
        content_widget = QWidget()
        main_layout.addWidget(content_widget)
        self.set_css(content_widget, "widget_main", "QWidget")
        self.cache_widget(content_widget, "0004")

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
        # page_widget = BookmarkWidget()
        # self.cache_widget(page_widget, "0005")
