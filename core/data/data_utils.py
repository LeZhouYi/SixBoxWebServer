import copy


def extra_data(data: dict, key_list: list) -> dict:
    """提取数据"""
    data_return = {}
    for key in key_list:
        if key in data:
            data_return[key] = copy.deepcopy(data[key])
        else:
            data_return[key] = None
    return data_return
