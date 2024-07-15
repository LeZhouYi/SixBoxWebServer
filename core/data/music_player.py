import copy
import threading
import time
from random import Random

from tinydb import TinyDB, Query

from core.data import data_utils


class MusicServer:

    def __init__(self, db_path: str):
        """
        @param db_path: 数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.msc_query = Query()
        self.rand = Random()
        self.thread_lock = threading.Lock()

    def add_data(self, data: dict):
        """
        新增数据
        name: 歌曲名称
        path: 本地文件路径
        file: 音频文件，不存进数据库
        album: 专辑
        artist: 歌手
        """
        with self.thread_lock:
            key_list = ["name", "path", "album", "artist"]
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
                extra_data = self.db.all();
            for data in extra_data:
                return_item = {}
                for key in keys:
                    if key in data:
                        return_item[key] = data[key]
                return_data.append(copy.deepcopy(return_item))
            return return_data


class PlayCollectServer:

    def __init__(self, db_path: str):
        """
        @param db_path: 数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.pc_query = Query()
        self.rand = Random()
        self.thread_lock = threading.Lock()

    def add_data(self, data: dict, msc_server: MusicServer):
        """
        新增数据
        name: 合集名称
        playList: 播放列表
        """
        with msc_server.thread_lock:
            with self.thread_lock:
                msc_query = msc_server.msc_query
                key_list = ["name", "playList"]
                data = data_utils.extra_data(data, key_list)
                if data["playList"] is None or not isinstance(data["playList"], list):
                    data["playList"] = []
                actual_play_list = []
                for msc_id in data["playList"]:
                    if len(msc_server.db.search(msc_query.id == msc_id)) > 0:
                        actual_play_list.append(msc_id)
                data["playList"] = actual_play_list
                data["id"] = "%s%s" % (int(time.time()), str(self.rand.randint(100, 999)))
                self.db.insert(data)
