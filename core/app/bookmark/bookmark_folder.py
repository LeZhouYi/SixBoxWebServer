from PySide6.QtWidgets import QWidget, QHBoxLayout

from core.widget import WidgetImpl


class BookmarkFolder(QWidget, WidgetImpl):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.init_ui()

    def init_ui(self):
        """初始化UI"""
        # 基础布局
        base_layout = QHBoxLayout()
        self.setLayout(base_layout)
        self.cache_widget(base_layout, "A0")
        # 主内容
        main_widget = QWidget()
        base_layout.addWidget(main_widget)
        self.cache_widget(main_widget, "A1")
        # 主布局
        main_layout = QHBoxLayout()
        main_widget.setLayout(main_layout)
        self.cache_widget(main_layout, "A2")