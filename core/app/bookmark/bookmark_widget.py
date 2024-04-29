from PySide6.QtWidgets import QWidget, QVBoxLayout, QSizePolicy, QHBoxLayout, QScrollArea

from core.widget import WidgetImpl
from core.widget.ui import SearchBar


class BookmarkWidget(QWidget, WidgetImpl):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        self.init_base_layout()
        self.init_title_layout()
        self.init_content_layout()

    def init_content_layout(self):
        """初始化内容栏"""
        content_widget = self.get_widget("A4")
        # 内容栏布局
        content_layout = QHBoxLayout()
        content_layout.setContentsMargins(5, 5, 5, 5)
        content_widget.setLayout(content_layout)
        self.cache_widget(content_layout, "B40")
        # 滚动页
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        content_layout.addWidget(scroll_area)
        self.set_css(scroll_area, "quartz_ui", "QScrollArea")
        self.cache_widget(scroll_area, "B41")
        # 滚动内容
        scroll_widget = QWidget()
        scroll_area.setWidget(scroll_widget)
        self.set_css(scroll_widget, "transparent")
        self.cache_widget(scroll_widget, "B42")

    def init_title_layout(self):
        """初始化标题栏"""
        # 标题栏
        title_widget = self.get_widget("A3")
        # 标题栏Layout
        title_layout = QHBoxLayout()
        title_layout.setContentsMargins(5, 5, 5, 5)
        title_widget.setLayout(title_layout)
        self.cache_widget(title_layout, "B30")
        # 搜索栏
        search_bar = SearchBar()
        title_layout.addWidget(search_bar)
        self.cache_widget(search_bar, "B31")

    def init_base_layout(self):
        """初始化基础布局"""

        # Bookmark基础竖向布局
        base_layout = QVBoxLayout()
        base_layout.setContentsMargins(0, 0, 0, 0)
        self.setLayout(base_layout)
        self.cache_widget(base_layout, "A0")
        # 核心页面
        main_widget = QWidget()
        base_layout.addWidget(main_widget)
        self.set_css(main_widget, "plant_ui", "QWidget")
        self.cache_widget(main_widget, "A1")
        # 核心页面布局
        main_layout = QVBoxLayout()
        main_layout.setSpacing(0)
        main_widget.setLayout(main_layout)
        self.cache_widget(main_widget, "A2")
        # 标题栏
        title_widget = QWidget()
        title_widget.setFixedHeight(50)
        title_widget.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        main_layout.addWidget(title_widget)
        self.cache_widget(title_widget, "A3")
        # 内容栏
        content_widget = QWidget()
        main_layout.addWidget(content_widget)
        self.cache_widget(content_widget, "A4")
