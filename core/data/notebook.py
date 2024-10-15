import threading
import time
from random import Random

from tinydb import TinyDB, Query

from core.data import data_utils


class NotebookType:
    """书签类型"""
    NOTEBOOK = "1"
    FOLDER = "2"


class NotebookServer:
    """书签数据库服务"""

    def __init__(self, db_path: str):
        """
        @param db_path: 数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.nb_query = Query()
        self.rand = Random()
        self.thread_lock = threading.Lock()
        self.init()

    def init(self):
        if len(self.db.all()) == 0:
            self.db.insert({
                "id": 1,
                "name": "根目录",
                "url": "/notebook.html?parentId=1",
                "type": NotebookType.FOLDER,
                "content": None
            })

    def add_data(self, data: dict):
        """新增数据"""
        with self.thread_lock:
            key_list = ["name", "url", "parentId", "type", "content"]
            data = data_utils.extra_data(data, key_list)
            data["id"] = "%s%s" % (int(time.time()), str(self.rand.randint(100, 999)))
            if data["parentId"] == "":
                data["parentId"] = "1"
            if data["type"] == NotebookType.NOTEBOOK:
                self.db.insert(data)
            elif data["type"] == NotebookType.FOLDER:
                data["url"] = "/notebook.html?parentId=%s" % data["id"]
                self.db.insert(data)

    def edit_data(self, nb_id: str, data: dict, html_url: str):
        """编辑数据"""
        with self.thread_lock:
            key_list = ["name", "url", "parentId", "type", "content"]
            data = data_utils.extra_data(data, key_list)
            now_data = self.db.get(self.nb_query.id == nb_id)
            if not ("parentId" in data and data["parentId"] != ""):
                data["parentId"] = now_data["parentId"]
            if data["type"] == NotebookType.FOLDER:
                data["url"] = "%s?parentId=%s" % (html_url, nb_id)
            self.db.update(data_utils.extra_data(data, key_list), (self.nb_query.id == nb_id))

    @staticmethod
    def default_sort_key(data):
        """默认排序"""
        return -int(data["type"]), data["name"]
