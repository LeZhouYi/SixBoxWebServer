from flask import Blueprint, render_template, request, jsonify

from core.config.config import get_config_path
from core.data.bookmark import BookmarkServer, BookmarkType
from core.routes import route_utils
from core.util import check_utils

BookmarkBp = Blueprint('bookmark', __name__)

BmServer = BookmarkServer(get_config_path("bookmark_path"))
BmDB = BmServer.db
BmQuery = BmServer.bm_query

RepoInfo = {
    "001": "数据不存在",
    "002": "名称不能为空",
    "003": "类型不能为空",
    "004": "链接不能为空",
    "005": "链接格式错误",
    "006": "文件夹不能为空",
    "007": "删除成功",
    "008": "新增成功",
    "009": "编辑成功"
}


def check_bm_id(bm_id):
    if bm_id is None:
        return route_utils.gen_fail_response(RepoInfo["001"])
    try:
        with BmServer.thread_lock:
            BmDB.get(BmQuery.id == bm_id)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["001"])


def check_bm_data(data):
    """检查书签数据"""
    if check_utils.is_str_empty(data, "name"):
        return route_utils.gen_fail_response(RepoInfo["002"])
    if check_utils.is_none(data, "type"):
        return route_utils.gen_fail_response(RepoInfo["003"])
    if data["type"] == BookmarkType.BOOKMARK:
        if check_utils.is_str_empty(data, "url"):
            return route_utils.gen_fail_response(RepoInfo["004"])
        if not check_utils.is_url(data["url"]):
            return route_utils.gen_fail_response(RepoInfo["005"])
    if check_utils.is_none(data, "parentId"):
        return route_utils.gen_fail_response(RepoInfo["006"])


@BookmarkBp.route("/bookmark.html")
def bookmarks_page():
    """书签列表页面"""
    return render_template("bookmark.html")


@BookmarkBp.route("/bookmark/<bm_id>", methods=["DELETE"])
def del_bookmark(bm_id):
    """删除书签"""
    check_result = check_bm_id(bm_id)
    if check_result is not None:
        return check_result
    with BmServer.thread_lock:
        BmDB.remove((BmQuery.id == bm_id) | (BmQuery.parentId == bm_id))
    return route_utils.gen_success_response(RepoInfo["007"])


@BookmarkBp.route("/bookmark/<bm_id>", methods=["GET"])
def get_bookmark(bm_id):
    """获取书签详情"""
    if bm_id is None:
        return route_utils.gen_fail_response(RepoInfo["001"])
    try:
        with BmServer.thread_lock:
            data = BmDB.get(BmQuery.id == bm_id)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["001"])
    return jsonify(data)


@BookmarkBp.route("/bookmark", methods=["GET"])
def get_bookmark_list():
    """获取书签列表"""
    parent_id = request.args.get("parentId", None, str)
    bm_type = request.args.get("type", None, str)
    search = request.args.get("search", None, str)
    search_query = route_utils.combine_query(None, BmQuery.type == bm_type, bm_type)
    search_query = route_utils.combine_query(search_query, BmQuery.parentId == parent_id, parent_id)
    if search_query is None and search is None:
        return jsonify([])
    with BmServer.thread_lock:
        if search_query is not None:
            data = BmDB.search(search_query)
        else:
            data = BmDB.all()
        if search is not None and len(data) > 0:
            if len(search) < 2:
                return jsonify([])
            temp_data = []
            search = str(search).lower()
            for item in data:
                if str(item["name"]).lower().find(search) >= 0:
                    temp_data.append(item)
                elif str(item["url"]).lower().find(search) >= 0:
                    temp_data.append(item)
            data = temp_data
        data = sorted(data, key=BmServer.default_sort_key)
        return jsonify(data)


@BookmarkBp.route("/bookmark", methods=["POST"])
def add_bookmark():
    """新增书签"""
    data = request.json
    check_result = check_bm_data(data)
    if check_result is not None:
        return check_result
    BmServer.add_data(data, "/bookmark.html")
    return route_utils.gen_success_response(RepoInfo["008"])


@BookmarkBp.route("/bookmark/<bm_id>", methods=["PUT"])
def edit_bookmark(bm_id):
    """编辑书签"""
    check_result = check_bm_id(bm_id)
    if check_result is not None:
        return check_result
    data = request.json
    check_result = check_bm_data(data)
    if check_result is not None:
        return check_result
    BmServer.edit_data(bm_id, data)
    return route_utils.gen_success_response(RepoInfo["009"])
