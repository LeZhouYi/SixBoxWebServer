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
