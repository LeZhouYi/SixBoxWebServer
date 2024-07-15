import os.path
from typing import Optional

from flask import Blueprint, render_template, send_file, request, jsonify
from werkzeug.datastructures import ImmutableMultiDict, FileStorage

from core.config.config import get_config
from core.data.music_player import MusicServer, PlayCollectServer
from core.routes import route_utils
from core.util import check_utils

MusicPlayerBp = Blueprint('music', __name__)

MscServer = MusicServer(get_config("music_path"))
MscDB = MscServer.db
MscQuery = MscServer.msc_query

PcServer = PlayCollectServer(get_config("play_collect_path"))
PcDB = PcServer.db
PcQuery = PcServer.pc_query

RepoInfo = {
    "001": "歌曲不存在",
    "002": "名称不能为空",
    "003": "歌手不能为空",
    "004": "文件格式错误，必须为.mp3",
    "005": "文件不能为空",
    "006": "文件名不能为空",
    "007": "新增成功",
    "008": "删除成功",
    "009": "歌曲名重复",
    "010": "编辑成功"
}


@MusicPlayerBp.route("/musicplayer.html")
def backup_page():
    return render_template("musicplayer.html")


@MusicPlayerBp.route("/music/<music_id>/file")
def get_music_file(music_id: str):
    if check_utils.is_empty(music_id):
        return route_utils.gen_fail_response(RepoInfo["001"])
    try:
        with MscServer.thread_lock:
            data = MscDB.get(MscQuery.id == music_id)
            music_path = os.path.join(os.getcwd(), data["path"])
            download_name = "%s-%s.mp3" % (data["artist"], data["name"])
        download_name = route_utils.rfc5987_encode(download_name)
        return send_file(music_path, as_attachment=True, download_name=download_name)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["001"])


@MusicPlayerBp.route("/music/<music_id>")
def get_music(music_id: str):
    if check_utils.is_empty(music_id):
        return route_utils.gen_fail_response(RepoInfo["001"])
    try:
        with MscServer.thread_lock:
            data = MscDB.get(MscQuery.id == music_id)
        data = route_utils.extra_data(data, ["id", "name", "artist", "album"])
        return jsonify(data)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["001"])


def check_music_data(form_data: ImmutableMultiDict[str, str]):
    """检查音乐数据"""
    if check_utils.is_empty(form_data.get("name")):
        return route_utils.gen_fail_response(RepoInfo["002"])
    if check_utils.is_empty(form_data.get("artist")):
        return route_utils.gen_fail_response(RepoInfo["003"])


def check_file_type(file: Optional[FileStorage]):
    """检查文件类型"""
    if file.filename is None or file.filename.rsplit('.', 1)[1].lower() not in ['mp3']:
        return route_utils.gen_fail_response(RepoInfo["004"])


@MusicPlayerBp.route("/music", methods=["POST"])
def add_music():
    """新增音乐"""
    form_data = request.form
    result = check_music_data(form_data)
    if result is not None:
        return result
    file = request.files.get("file")
    if file:
        result = check_file_type(file)
        if result is not None:
            return result
        filename = "%s-%s.mp3" % (form_data.get("artist"), form_data.get("name"))
        filepath = os.path.join(get_config("music_save_path"), filename)
        file.save(filepath)
        data = {
            "name": form_data.get("name"),
            "album": form_data.get("album"),
            "artist": form_data.get("artist"),
            "path": str(filepath)
        }
        MscServer.add_data(data)
    elif not file:
        return route_utils.gen_fail_response(RepoInfo["005"])
    else:
        return route_utils.gen_fail_response(RepoInfo["006"])
    return route_utils.gen_success_response(RepoInfo["007"])


@MusicPlayerBp.route("/music", methods=["GET"])
def get_music_list():
    """获取音乐列表"""
    search = request.args.get("search", None, str)
    if search is None:
        return jsonify(MscServer.get_list(["id", "name", "artist"]))
    else:
        search_query = (MscQuery.name == search) | (MscQuery.artist == search)
        with MscServer.thread_lock:
            result = MscDB.search(search_query)
        return jsonify(MscServer.get_list(["id", "name", "artist"], result))


@MusicPlayerBp.route("/music/<music_id>", methods=["DELETE"])
def del_music(music_id: str):
    """删除音乐"""
    if check_utils.is_empty(music_id):
        return route_utils.gen_fail_response(RepoInfo["001"])
    try:
        with MscServer.thread_lock:
            data = MscDB.get(MscQuery.id == music_id)
            path = data["path"]
            if os.path.exists(path) and os.path.isfile(path):
                os.remove(path)
            MscDB.remove(MscQuery.id == music_id)
        return route_utils.gen_success_response(RepoInfo["008"])
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["001"])


@MusicPlayerBp.route("/music/<music_id>", methods=["PUT"])
def edit_music(music_id: str):
    """编辑音乐"""
    if check_utils.is_empty(music_id):
        return route_utils.gen_fail_response(RepoInfo["001"])
    request_data = request.json
    if check_utils.is_empty(request_data["name"]):
        return route_utils.gen_fail_response(RepoInfo["002"])
    if check_utils.is_empty(request_data["artist"]):
        return route_utils.gen_fail_response(RepoInfo["003"])
    try:
        with MscServer.thread_lock:
            data = MscDB.get(MscQuery.id == music_id)
            path = data["path"]
            new_name = "%s-%s.mp3" % (request_data["artist"], request_data["name"])
            new_path = os.path.join(get_config("music_save_path"), new_name)
            if os.path.exists(new_path) and new_path != path:
                return route_utils.gen_fail_response(RepoInfo["009"])
            os.rename(path, new_path)
            data["name"] = request_data["name"]
            data["artist"] = request_data["artist"]
            data["album"] = request_data["album"]
            data["path"] = new_path
            MscDB.update(data, MscQuery.id == music_id)
        return route_utils.gen_success_response(RepoInfo["010"])
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["001"])


@MusicPlayerBp.route("/music/collect", methods=["GET"])
def get_collect_list():
    """获取合集列表"""
    with PcServer.thread_lock:
        data = []
        for item in PcDB.all():
            data.append({
                "id": item["id"],
                "name": item["name"]
            })
        return jsonify(data)
