from PySide6.QtWidgets import QWidget, QVBoxLayout, QSizePolicy

from core.widget import WidgetImpl


class BookmarkWidget(QWidget, WidgetImpl):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        self.init_base_layout()

    def init_base_layout(self):
        """初始化基础布局"""

        # Bookmark基础竖向布局
        base_layout = QVBoxLayout()
        base_layout.setContentsMargins(0, 0, 0, 0)
        self.setLayout(base_layout)
        self.cache_widget(base_layout, "0001")
        # 核心页面
        main_widget = QWidget()
        base_layout.addWidget(main_widget)
        self.set_css(main_widget, "test_background")
        self.cache_widget(main_widget, "0002")
        # 核心页面布局
        main_layout = QVBoxLayout()
        main_widget.setLayout(main_layout)
        self.cache_widget(main_widget, "0003")
        # 标题栏
        title_widget = QWidget()
        title_widget.setMinimumHeight(150)
        title_widget.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        main_layout.addWidget(title_widget)
        self.set_css(title_widget, "white_background")
        self.cache_widget(title_widget, "0004")
