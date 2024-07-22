import copy
import threading
import time
from random import Random

from tinydb import TinyDB, Query

from core.data import data_utils


class MovieServer:

    def __init__(self, db_path: str):
        """
        @param db_path: 数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.mp_query = Query()
        self.rand = Random()
        self.thread_lock = threading.Lock()

    def add_data(self, data: dict):
        """
        新增数据
        name: 视频名称
        path: 本地文件路径
        """
        with self.thread_lock:
            key_list = ["name", "path"]
            data = data_utils.extra_data(data, key_list)
            data["id"] = "%s%s" % (int(time.time()), str(self.rand.randint(100, 999)))
            self.db.insert(data)

    def get_list(self, keys: list, extra_data: list = None):
        """
        只返回特定字段的所有数据的列表
        """
        with self.thread_lock:
            return_data = []
            if extra_data is None:
                extra_data = self.db.all()
            for data in extra_data:
                return_item = {}
                for key in keys:
                    if key in data:
                        return_item[key] = data[key]
                return_data.append(copy.deepcopy(return_item))
            return return_data
