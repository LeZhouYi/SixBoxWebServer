import io
import os
import sys
import time
import urllib
import zipfile
from random import Random
from typing import Optional

from flask import Blueprint, render_template, request, jsonify, Response, stream_with_context
from werkzeug.datastructures import FileStorage

from core.config.config import get_config_path
from core.data.backup import BackupServer, FileType
from core.routes import route_utils
from core.routes.route_utils import extra_data
from core.util.base_utils import load_json_data
from core.util.check_utils import is_empty, is_str_empty

BackupBp = Blueprint('backup', __name__)
BackupRand = Random()
BackupConfig = load_json_data(get_config_path("backup_config"))

BkServer = BackupServer(get_config_path("config_path"))
BkDB = BkServer.db
BkQuery = BkServer.bk_query

RepoInfo = {
    "001": "文件格式错误",
    "002": "新增成功",
    "003": "文件不能为空",
    "004": "文件不存在",
    "005": "文件夹不存在",
    "006": "保存文件失败",
    "007": "删除文件成功",
    "008": "文件名不能为空",
    "009": "编辑成功",
    "010": "文件夹名不能为空"
}


def check_file_type(file: Optional[FileStorage]):
    """检查文件类型"""
    file_types = BackupConfig["fileTypes"]
    if file.filename is None or file.filename.rsplit('.', 1)[1].lower() not in file_types:
        return route_utils.gen_fail_response(RepoInfo["001"])


@BackupBp.route("/backup.html")
def backup_page():
    return render_template("backup.html")


@BackupBp.route("/backup/files", methods=["GET"])
def get_backup_list():
    """获取备份文件列表"""
    # 获取搜索参数
    parent_id = request.args.get("parentId", None, str)
    bk_type = request.args.get("type", None, str)
    file_id = request.args.get("id", None, str)
    search = request.args.get("search", None, str)

    # 构造搜索语句并判断，阻止无条件搜索
    search_query = route_utils.combine_query(None, BkQuery.parentId == parent_id, parent_id)
    search_query = route_utils.combine_query(search_query, BkQuery.type == bk_type, bk_type)
    search_query = route_utils.combine_query(search_query, BkQuery.id == file_id, file_id)
    if search_query is None and search is None:
        return jsonify([])

    with BkServer.thread_lock:
        if search_query is not None:
            data = BkDB.search(search_query)
        else:
            data = BkDB.all()

        # 限制文本搜索的长度需>=2
        if search is not None and len(data) > 0:
            if len(search) < 2:
                return jsonify([])
            temp_data = []
            search_lower = str(search).lower()
            for item in data:
                if str(item["name"]).lower().find(search_lower) >= 0:
                    temp_data.append(item)
            data = temp_data
        data = sorted(data, key=BkServer.default_sort_key)

        # 只返回特定字段
        return_data = []
        for data_item in data:
            return_data.append(
                extra_data(data_item, [
                    "name", "id", "parentId", "url", "type"
                ])
            )
    return jsonify(return_data)


@BackupBp.route("/backup/folders", methods=["POST"])
def add_backup_folder():
    """新增文件夹"""
    data = request.json
    # 检查文件夹名
    if is_str_empty(data, "name"):
        return route_utils.gen_fail_response(RepoInfo["010"])

    # 检查文件夹是否存在
    if is_str_empty(data, "parentId"):
        return route_utils.gen_fail_response(RepoInfo["005"])
    parent_id = data["parentId"]
    with BkServer.thread_lock:
        try:
            BkDB.get(BkQuery.parentId == parent_id)
        except KeyError:
            return route_utils.gen_fail_response(RepoInfo["005"])
    BkServer.add_data({
        "name": data["name"],
        "parentId": parent_id,
        "type": FileType.FOLDER
    })
    return route_utils.gen_success_response(RepoInfo["002"])


@BackupBp.route("/backup/files", methods=["POST"])
def add_backup_file():
    """新增备份文件，只接收文件，不接收文件夹"""
    # 获取文件
    if 'file' not in request.files:
        return route_utils.gen_fail_response(RepoInfo["003"])
    file = request.files.get("file")

    if file is not None:
        # 检查文件格式并获取
        result = check_file_type(file)
        if result is not None:
            return result
        file_ext = file.filename.rsplit('.', 1)[1]

        # 检查文件夹ID
        parent_id = request.form.get("parentId")
        if parent_id is not None and parent_id != "":
            with BkServer.thread_lock:
                try:
                    BkDB.get(BkQuery.id == parent_id)
                except KeyError:
                    return route_utils.gen_fail_response(RepoInfo["005"])

        # 获取文件名
        filename = request.form.get("filename")
        filename = "%s.%s" % (filename, file_ext)

        # 保存文件至本地
        local_name = "%s%s.%s" % (int(time.time()), str(BackupRand.randint(100, 999)), file_ext)
        filepath = os.path.join(get_config_path("upload_file_path"), local_name)
        try:
            root_path = os.path.dirname(os.path.realpath(sys.argv[0]))
            file.save(os.path.join(root_path, filepath))
        except Exception as e:
            print(e)
            return route_utils.gen_fail_response(RepoInfo["006"])

        # 新增文件
        BkServer.add_data({
            "name": filename,
            "parentId": parent_id,
            "url": "/backup/files/%s" % local_name,
            "path": str(filepath),
            "type": FileType.FILE
        })
        return route_utils.gen_success_response(RepoInfo["002"])
    return route_utils.gen_fail_response(RepoInfo["003"])


@BackupBp.route("/backup/files/<file_id>", methods=["DELETE"])
def delete_backup_files(file_id: str):
    """删除备份文件/文件夹"""
    # 检查文件ID是否存在
    if is_empty(file_id):
        return route_utils.gen_fail_response(RepoInfo["004"])
    try:
        with BkServer.thread_lock:
            BkDB.get(BkQuery.id == file_id)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["004"])
    # 删除文件
    with BkServer.thread_lock:
        data = BkDB.search((BkQuery.id == file_id) | (BkQuery.parentId == file_id))
    for data_item in data:
        if "path" in data_item:
            try:
                os.remove(data_item["path"])
            except Exception as e:
                print(e)
    # 删除数据
    with BkServer.thread_lock:
        BkDB.remove((BkQuery.id == file_id) | (BkQuery.parentId == file_id))
    return route_utils.gen_success_response(RepoInfo["007"])


@BackupBp.route("/backup/files/<file_id>", methods=["PUT"])
def edit_backup_file(file_id: str):
    # 检查文件ID是否存在
    if is_empty(file_id):
        return route_utils.gen_fail_response(RepoInfo["004"])
    try:
        with BkServer.thread_lock:
            BkDB.get(BkQuery.id == file_id)
    except KeyError:
        return route_utils.gen_fail_response(RepoInfo["004"])

    # 检查文件名和所属文件夹
    data = request.json
    if is_str_empty(data, "name"):
        return route_utils.gen_fail_response(RepoInfo["008"])
    if is_str_empty(data, "parentId"):
        return route_utils.gen_fail_response(RepoInfo["005"])
    parent_id = data["parentId"]
    with BkServer.thread_lock:
        try:
            BkDB.get(BkQuery.id == parent_id)
        except KeyError:
            return route_utils.gen_fail_response(RepoInfo["005"])

    # 编辑
    BkServer.edit_data(file_id, data)
    return route_utils.gen_success_response(RepoInfo["009"])


@BackupBp.route("/backup/db", methods=["GET"])
def download_data():
    """下载所有数据"""
    memory_zip = io.BytesIO()
    data_path = get_config_path("db_path")
    # 打包成zip数据
    with zipfile.ZipFile(memory_zip, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(data_path):
            for file in files:
                zip_file.write(str(os.path.join(root, file)), arcname=file)
    memory_zip.seek(0)

    # 构造返回
    response = Response(
        memory_zip.read(),
        mimetype='application/zip',
        headers={
            'Content-Disposition': 'attachment; filename=data.zip'
        }
    )
    return response


@BackupBp.route("/backup/files/<filename>", methods=["GET"])
def download_backup_file(filename: str):
    url = "/backup/files/%s" % filename
    with BkServer.thread_lock:
        try:
            data = BkDB.get(BkQuery.url == url)
        except KeyError:
            return route_utils.gen_fail_response(RepoInfo["004"])
    filepath = os.path.join(os.path.dirname(os.path.realpath(sys.argv[0])), data["path"])
    if not os.path.exists(filepath):
        return route_utils.gen_fail_response(RepoInfo["004"])

    def generate():
        with open(filepath, 'rb') as f:
            while True:
                chunk = f.read(10240)  # 读取 10240 字节的块
                if not chunk:
                    break
                yield chunk

    return Response(stream_with_context(generate()),
                    headers={
                        "Content-Disposition": "attachment;filename=%s" % urllib.parse.quote(data["name"]),
                        "Transfer-Encoding": "chunked"
                    })
