import os

from core.config.config import get_config_path


def pre_init():
    folder_list = ["data_path", "db_path", "music_save_path", "upload_file_path", "movie_save_path"]
    for folder_config in folder_list:
        path = get_config_path(folder_config)
        if not os.path.exists(path):
            os.makedirs(path)


pre_init()
