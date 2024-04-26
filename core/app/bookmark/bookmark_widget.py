from PySide6.QtWidgets import QWidget

from core.widget import WidgetImpl


class BookmarkWidget(QWidget, WidgetImpl):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
