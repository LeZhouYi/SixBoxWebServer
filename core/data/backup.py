import threading
import time
from random import Random

from tinydb import TinyDB, Query

from core.data import data_utils


class FileType:
    """文件类型"""
    FILE = "1"
    FOLDER = "2"


class BackupServer:
    """备份数据库服务"""

    def __init__(self, db_path: str):
        """
        @param db_path: 数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.bk_query = Query()
        self.rand = Random()
        self.thread_lock = threading.Lock()
        self.init()

    def init(self):
        if len(self.db.all()) == 0:
            self.db.insert({
                "id": 1,
                "name": "根目录",
                "url": "/backup.html?parentId=1",
                "type": FileType.FOLDER,
            })

    def add_data(self, data: dict):
        """
        新增数据
        name: 文件名/文件夹名
        id: 文件/文件夹id
        parentId: 所属文件夹的ID
        url: 文件类型即本身下载路径，文件夹类型即对应的文件夹页面
        path: 文件路径
        type: 所属类型
        """
        with self.thread_lock:
            key_list = ["name", "id", "parentId", "url", "path", "type"]
            data = data_utils.extra_data(data, key_list)
            data["id"] = "%s%s" % (int(time.time()), str(self.rand.randint(100, 999)))
            if data["parentId"] == "":
                data["parentId"] = "1"
            if data["type"] == FileType.FILE:
                self.db.insert(data)
            elif data["type"] == FileType.FOLDER:
                data["url"] = "/backup.html?parentId=%s" % data["id"]
                self.db.insert(data)
