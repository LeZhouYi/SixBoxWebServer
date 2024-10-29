import os
import time
from random import Random
from typing import Optional

from flask import Blueprint, render_template, request, jsonify
from werkzeug.datastructures import FileStorage

from core.config.config import get_config_path
from core.data.backup import BackupServer
from core.routes import route_utils
from core.util.base_utils import load_json_data

BackupBp = Blueprint('backup', __name__)
BackupRand = Random()
BackupConfig = load_json_data(get_config_path("backup_config"))

BkServer = BackupServer(get_config_path("config_path"))
BkDB = BkServer.db
BkQuery = BkServer.bk_query

RepoInfo = {
    "001": "文件格式错误",
    "002": "上传成功",
    "003": "文件不能为空",
    "004": "文件不存在"
}


@BackupBp.route("/backup.html")
def backup_page():
    return render_template("backup.html")


@BackupBp.route("/backup/files", methods=["GET"])
def get_backup_list():
    """获取备份文件列表"""
    parent_id = request.args.get("parendId", None, str)
    bk_type = request.args.get("type", None, str)
    search = request.args.get("search", None, str)
    search_query = route_utils.combine_query(None, BkQuery.parentId == parent_id, parent_id)
    search_query = route_utils.combine_query(search_query, BkQuery.type == bk_type, bk_type)
    if search_query is None and search is None:
        return jsonify([])
    with BkServer.thread_lock:
        if search_query is not None:
            data = BkDB.search(search_query)
        else:
            data = BkDB.all()
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
    return jsonify(data)


@BackupBp.route("/backup/files", methods=["POST"])
def add_backup_file():
    """新增备份文件"""
    if 'file' not in request.files:
        return route_utils.gen_fail_response(RepoInfo["003"])
    file = request.files.get("file")

    if file is not None:
        result = check_file_type(file)
        # 文件格式不符合要求
        if result is not None:
            return result
        file_ext = file.filename.rsplit('.', 1)[1]
        local_name = "%s%s.%s" % (int(time.time()), str(BackupRand.randint(100, 999)), file_ext)
        filename = file.filename
        filepath = os.path.join(get_config_path("upload_file_path"), filename)
        BkServer.add_data({
            "name": filename,
            "parentId": request.form.get("parentId"),
            "url": "/backup/files/%s" % local_name
        })
    return route_utils.gen_fail_response(RepoInfo["003"])


# @BackupBp.route("/backup", methods=["GET"])
# def download_data():
#     """下载所有数据"""
#     memory_zip = io.BytesIO()
#     data_path = get_config_path("db_path")
#     with zipfile.ZipFile(memory_zip, "w", zipfile.ZIP_DEFLATED) as zip_file:
#         for root, dirs, files in os.walk(data_path):
#             for file in files:
#                 zip_file.write(str(os.path.join(root, file)), arcname=file)
#     memory_zip.seek(0)
#     response = Response(
#         memory_zip.read(),
#         mimetype='application/zip-js',
#         headers={
#             'Content-Disposition': 'attachment; filename=data.zip-js'
#         }
#     )
#     return response
#
#

def check_file_type(file: Optional[FileStorage]):
    """检查文件类型"""
    file_types = BackupConfig["fileTypes"]
    if file.filename is None or file.filename.rsplit('.', 1)[1].lower() not in file_types:
        return route_utils.gen_fail_response(RepoInfo["001"])
#
#
# @BackupBp.route("/backup", methods=["POST"])
# def upload_data():
#     """上传数据"""
#     file = request.files.get("file")
#     if file:
#         result = check_file_type(file)
#         if result is not None:
#             return result
#         file_ext = file.filename.rsplit('.', 1)[1]
#         filename = "%s%s.%s" % (int(time.time()), str(BackupRand.randint(100, 999)), file_ext)
#         filepath = os.path.join(get_config_path("upload_file_path"), filename)
#         file.save(filepath)
#         return route_utils.gen_success_response(RepoInfo["002"])
#     return route_utils.gen_fail_response(RepoInfo["003"])
#
#
# @BackupBp.route("/backup/<filename>", methods=["GET"])
# def download_backup(filename: str):
#     """下载文件"""
#     if check_utils.is_empty(filename):
#         return route_utils.gen_fail_response(RepoInfo["004"])
#
#     filepath = os.path.join(get_config_path("upload_file_path"), filename)
#     if not os.path.exists(filepath):
#         return route_utils.gen_fail_response(RepoInfo["004"])
#
#     def generate():
#         with open(os.path.join(os.path.dirname(os.path.realpath(sys.argv[0])), filepath), 'rb') as f:
#             while True:
#                 chunk = f.read(10240)  # 读取 10240 字节的块
#                 if not chunk:
#                     break
#                 yield chunk
#
#     return Response(stream_with_context(generate()),
#                     mimetype='video/mp4',
#                     headers={
#                         "Content-Disposition": "attachment;filename=%s" % urllib.parse.quote(filename),
#                         "Transfer-Encoding": "chunked"
#                     })
