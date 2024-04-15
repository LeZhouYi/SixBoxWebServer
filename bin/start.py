import sys

from PySide6.QtWidgets import QApplication

from core.app.main import MainWindow

if __name__ == "__main__":
    app = QApplication(sys.argv)
    main_window = MainWindow()
    main_window.show()
    sys.exit(app.exec())
