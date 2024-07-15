import threading
import time
from random import Random

from tinydb import TinyDB, Query

from core.data import data_utils


class BookmarkType:
    """书签类型"""
    BOOKMARK = "1"
    FOLDER = "2"


class BookmarkServer:
    """书签数据库服务"""

    def __init__(self, db_path: str):
        """
        @param db_path: 数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.bm_query = Query()
        self.rand = Random()
        self.thread_lock = threading.Lock()

    def add_data(self, data: dict, html_url: str):
        """新增数据"""
        with self.thread_lock:
            key_list = ["name", "url", "parentId", "type"]
            data = data_utils.extra_data(data, key_list)
            data["id"] = "%s%s" % (int(time.time()), str(self.rand.randint(100, 999)))
            if data["type"] == BookmarkType.BOOKMARK:
                self.db.insert(data)
            elif data["type"] == BookmarkType.FOLDER:
                data["url"] = "%s?parentId=%s" % (html_url, data["id"])
                self.db.insert(data)

    def edit_data(self, bm_id: str, data: dict):
        """编辑数据"""
        with self.thread_lock:
            key_list = ["name", "url", "parentId", "type"]
            data = data_utils.extra_data(data, key_list)
            now_data = self.db.get(self.bm_query.id == bm_id)
            data["parentId"] = now_data["parentId"]
            self.db.update(data_utils.extra_data(data, key_list), (self.bm_query.id == bm_id))

    @staticmethod
    def default_sort_key(data):
        """默认排序"""
        return -int(data["type"]), data["name"]
