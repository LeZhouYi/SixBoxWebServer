import os.path

from flask import Blueprint, render_template, send_file, Response, stream_with_context

from core.config.config import get_config
from core.data.movie_player import MovieServer

MoviePlayerBp = Blueprint('movie', __name__)

MpSever = MovieServer(get_config("movie_path"))
MpQuery = MpSever.mp_query
MpDb = MpSever.db


@MoviePlayerBp.route("/movie_player.html")
def movie_player_page():
    return render_template("movie_player.html")


@MoviePlayerBp.route("/movie/<movie_id>", methods=["GET"])
def get_movie(movie_id: str):
    """获取视频"""
    file_path = os.path.join(os.getcwd(), "data\\movie\\test.mp4")
    return send_file(file_path, as_attachment=True, download_name='test.mp4')
