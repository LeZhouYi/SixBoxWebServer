import os.path
from typing import Optional

from flask import Blueprint, render_template, send_file, request, jsonify
from werkzeug.datastructures import FileStorage

from core.config.config import get_config
from core.data.movie_player import MovieServer
from core.routes import route_utils
from core.util import check_utils

MoviePlayerBp = Blueprint('movie', __name__)

MpSever = MovieServer(get_config("movie_path"))
MpQuery = MpSever.mp_query
MpDb = MpSever.db

RepoInfo = {
    "001": "名称不能为空",
    "002": "文件格式错误，必须为.mp3",
    "003": "文件不能为空",
    "004": "文件名重复",
    "005": "上传视频成功",
    "006": "文件不存在"
}


@MoviePlayerBp.route("/movie_player.html")
def movie_player_page():
    return render_template("movie_player.html")


@MoviePlayerBp.route("/movie/<movie_id>", methods=["GET"])
def get_movie(movie_id: str):
    """获取视频"""
    if check_utils.is_empty(movie_id):
        return route_utils.gen_fail_response(RepoInfo["006"])
    with MpSever.thread_lock:
        try:
            data = MpDb.get(MpQuery.id == movie_id)
        except KeyError:
            return route_utils.gen_fail_response(RepoInfo["006"])
    filepath = data["path"]
    filename = "%s.mp4" % data["name"]
    return send_file(os.path.join(os.getcwd(), filepath), as_attachment=True, download_name=filename)


def check_file_type(file: Optional[FileStorage]):
    """检查文件类型"""
    if file.filename is None or file.filename.rsplit('.', 1)[1].lower() not in ['mp4']:
        return route_utils.gen_fail_response(RepoInfo["002"])


@MoviePlayerBp.route("/movie", methods=["POST"])
def add_movie():
    """新增视频"""
    form_data = request.form
    filename = form_data.get("name")
    file = request.files.get("file")

    if check_utils.is_empty(filename):
        return route_utils.gen_fail_response(RepoInfo["001"])

    if file:
        result = check_file_type(file)
        if result is not None:
            return result
        filepath = os.path.join(get_config("movie_save_path"), "%s.mp4" % filename)
        with MpSever.thread_lock:
            if len(MpDb.search(MpQuery.path == filepath)) > 0:
                return route_utils.gen_fail_response(RepoInfo["004"])
        file.save(filepath)
        data = {
            "name": filename,
            "path": filepath
        }
        MpSever.add_data(data)
    else:
        return route_utils.gen_fail_response(RepoInfo["003"])
    return route_utils.gen_success_response(RepoInfo["005"])


@MoviePlayerBp.route("/movie", methods=["GET"])
def get_movie_list():
    """获取视频列表"""
    with MpSever.thread_lock:
        data = MpDb.all()
    return jsonify(MpSever.get_list(["id", "name"], data))
