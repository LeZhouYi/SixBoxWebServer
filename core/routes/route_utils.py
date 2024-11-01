import copy

from flask import Response, jsonify


def combine_query(now_query, new_query, new_query_data):
    """&组合query"""
    if new_query_data is None:
        return now_query
    if now_query is None:
        return new_query
    return now_query & new_query


def extra_data(data: dict, key_list: list) -> dict:
    """提取数据"""
    data_return = {}
    for key in key_list:
        if key in data:
            data_return[key] = copy.deepcopy(data[key])
        else:
            data_return[key] = None
    return data_return


def gen_fail_response(text: any) -> tuple[Response, int]:
    """生成400 response"""
    return jsonify({"status": "Fail", "message": text}), 400


def gen_success_response(text: any) -> Response:
    """生成操作成功的信息"""
    return jsonify({"status": "OK", "message": text})
