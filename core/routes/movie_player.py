from flask import Blueprint, render_template, send_file

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
    print("test")
    return send_file('data/movie/test.mp4', as_attachment=True, download_name='test.mp4')
    # def gen_movie_stream():
    #     with open('data/movie/test.mp4', 'rb') as f:
    #         while True:
    #             chunk = f.read(1024)
    #             if not chunk:
    #                 break
    #             yield chunk
    #     print("test")
    # return Response(stream_with_context(gen_movie_stream()),
    #                 mimetype='video/mp4',
    #                 headers={
    #                     "Content-Disposition": "attachment;filename=test.mp4",
    #                     "Transfer-Encoding": "chunked"
    #                 })
