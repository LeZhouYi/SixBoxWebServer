from flask import Blueprint, render_template, request, jsonify

from core.config.config import get_config
from core.data.notebook import NotebookServer, NotebookType
from core.routes import route_utils
from core.util import check_utils

NotebookBp = Blueprint('notebook', __name__)

NbServer = NotebookServer(get_config("notebook_path"))
NbDB = NbServer.db
NbQuery = NbServer.nb_query

RepoInfo = {
    "001": "名称不能为空",
    "002": "类型不能为空",
    "003": "内容不能为空",
    "004": "文件夹不能为空",
    "005": "新增成功",
    "006": "数据不存在",
    "007": "删除成功",
    "008": "编辑成功"
}


@NotebookBp.route("/notebook.html")
def backup_page():
    return render_template("notebook.html")


@NotebookBp.route("/notebook", methods=["GET"])
def get_notebook_list():
    """获取笔记列表"""
    parent_id = request.args.get("parentId", None, str)
    nb_type = request.args.get("type", None, str)
    search = request.args.get("search", None, str)
    search_query = route_utils.combine_query(None, NbQuery.parentId == parent_id, parent_id)
    search_query = route_utils.combine_query(search_query, NbQuery.type == nb_type, nb_type)
    if search_query is None and search is None:
        return jsonify([])
    with NbServer.thread_lock:
        if search_query is not None:
            data = NbDB.search(search_query)
        else:
            data = NbDB.all()
        if search is not None and len(data) > 0:
            if len(search) < 2:
                return jsonify([])
            temp_data = []
            search_lower = str(search).lower()
            for item in data:
                if str(item["name"]).lower().find(search_lower) >= 0:
                    temp_data.append(item)
                elif str(item["content"]).find(search) >= 0:
                    temp_data.append(item)
            data = temp_data
        data = sorted(data, key=NbServer.default_sort_key)
    return jsonify(data)


def check_nb_data(data):
    """检查书签数据"""
    if check_utils.is_str_empty(data, "name"):
        return route_utils.gen_fail_response(RepoInfo["001"])
    if check_utils.is_none(data, "type"):
        return route_utils.gen_fail_response(RepoInfo["002"])
    if data["type"] == NotebookType.NOTEBOOK:
        if check_utils.is_str_empty(data, "content"):
            return route_utils.gen_fail_response(RepoInfo["003"])
    if check_utils.is_none(data, "parentId"):
        return route_utils.gen_fail_response(RepoInfo["004"])


@NotebookBp.route("/notebook", methods=["POST"])
def add_notebook():
    """新增笔记"""
    data = request.json
    check_result = check_nb_data(data)
    if check_result is not None:
        return check_result
    NbServer.add_data(data, "/notebook.html")
    return route_utils.gen_success_response(RepoInfo["005"])


def check_nb_id(nb_id):
    if nb_id is None:
        return route_utils.gen_fail_response(RepoInfo["006"])
    try:
        with NbServer.thread_lock:
            NbDB.get(NbQuery.id == nb_id)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["006"])


@NotebookBp.route("/notebook/<nb_id>", methods=["GET"])
def get_notebook(nb_id):
    """获取笔记详情"""
    if nb_id is None:
        return route_utils.gen_fail_response(RepoInfo["006"])
    try:
        with NbServer.thread_lock:
            data = NbDB.get(NbQuery.id == nb_id)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["006"])
    return jsonify(data)


@NotebookBp.route("/notebook/<nb_id>", methods=["DELETE"])
def del_notebook(nb_id):
    """删除笔记"""
    check_result = check_nb_id(nb_id)
    if check_result is not None:
        return check_result
    with NbServer.thread_lock:
        NbDB.remove((NbQuery.id == nb_id) | (NbQuery.parentId == nb_id))
    return route_utils.gen_success_response(RepoInfo["007"])


@NotebookBp.route("/notebook/<nb_id>", methods=["PUT"])
def edit_notebook(nb_id):
    """编辑书签"""
    check_result = check_nb_id(nb_id)
    if check_result is not None:
        return check_result
    data = request.json
    check_result = check_nb_data(data)
    if check_result is not None:
        return check_result
    NbServer.edit_data(nb_id, data, "/notebook.html")
    return route_utils.gen_success_response(RepoInfo["008"])
