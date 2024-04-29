from PySide6.QtCore import Qt
from PySide6.QtWidgets import QWidget, QHBoxLayout, QLineEdit, QLabel, QSizePolicy

from core.widget import WidgetImpl


class SearchBar(QWidget, WidgetImpl):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        # 基础布局
        base_layout = QHBoxLayout()
        base_layout.setContentsMargins(0, 0, 0, 0)
        self.setLayout(base_layout)
        self.cache_widget(base_layout, "A0")
        # 内容容器
        content_widget = QWidget()
        base_layout.addWidget(content_widget)
        self.cache_widget(content_widget, "A1")
        # 内容布局
        content_layout = QHBoxLayout()
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_widget.setLayout(content_layout)
        self.cache_widget(content_layout, "A2")
        # 输入框容器
        input_widget = QWidget()
        content_layout.addWidget(input_widget)
        self.set_css(input_widget,"quartz_ui", "QWidget")
        self.cache_widget(input_widget, "A3")
        # 输入框布局
        input_layout = QHBoxLayout()
        input_layout.setContentsMargins(40, 2, 40, 2)
        input_widget.setLayout(input_layout)
        self.cache_widget(input_layout, "A4")
        # 输入框
        input_edit = QLineEdit()
        input_edit.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        input_layout.addWidget(input_edit)
        self.set_css(input_edit, "transparent", "QLineEdit")
        self.cache_widget(input_edit, "A5")
        # 搜索按钮
        search_button = QLabel()
        search_button.setText("搜索")
        search_button.setFixedWidth(100)
        search_button.setAlignment(Qt.AlignmentFlag.AlignCenter)
        search_button.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Expanding)
        content_layout.addWidget(search_button)
        self.set_css(search_button, "quartz_ui", "QLabel")
        self.cache_widget(search_button, "A6")
