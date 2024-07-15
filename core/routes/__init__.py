import flask

from .backup import BackupBp
from .bookmark import BookmarkBp
from .home import HomeBp
from .notebook import NotebookBp
from .music_player import MusicPlayerBp


def register_blueprints(app: flask.Flask):
    """注册所有蓝图"""
    app.register_blueprint(HomeBp)
    app.register_blueprint(BookmarkBp)
    app.register_blueprint(BackupBp)
    app.register_blueprint(NotebookBp)
    app.register_blueprint(MusicPlayerBp)
