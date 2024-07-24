import io
import os
import zipfile
from typing import Optional

from flask import Blueprint, render_template, Response, request
from werkzeug.datastructures import FileStorage

from core.config.config import get_config_path
from core.routes import route_utils

BackupBp = Blueprint('backup', __name__)

RepoInfo = {
    "001": "文件格式错误",
    "002": "上传成功",
    "003": "文件不能为空"
}


@BackupBp.route("/backup.html")
def backup_page():
    return render_template("backup.html")


@BackupBp.route("/backup", methods=["GET"])
def download_data():
    """下载所有数据"""
    memory_zip = io.BytesIO()
    data_path = get_config_path("db_path")
    with zipfile.ZipFile(memory_zip, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(data_path):
            for file in files:
                zip_file.write(str(os.path.join(root, file)), arcname=file)
    memory_zip.seek(0)
    response = Response(
        memory_zip.read(),
        mimetype='application/zip',
        headers={
            'Content-Disposition': 'attachment; filename=data.zip'
        }
    )
    return response


def check_file_type(file: Optional[FileStorage]):
    """检查文件类型"""
    file_types = ['png', 'mp4', 'mp3', 'jpg', 'pdf']
    if file.filename is None or file.filename.rsplit('.', 1)[1].lower() not in file_types:
        return route_utils.gen_fail_response(RepoInfo["001"])


@BackupBp.route("/backup", methods=["POST"])
def upload_data():
    """上传数据"""
    form_data = request.form
    file = request.files.get("file")
    if file:
        result = check_file_type(file)
        if result is not None:
            return result
        filename = form_data.get("name")
        filepath = os.path.join(get_config_path("upload_file_path"), filename)
        file.save(filepath)
        return route_utils.gen_success_response(RepoInfo["002"])
    return route_utils.gen_fail_response(RepoInfo["003"])
