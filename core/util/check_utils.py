from urllib.parse import urlparse


def is_empty(value: str) -> bool:
    """判断当前字符串数据是否为空"""
    return value is None or value.strip() == ""


def is_str_empty(dict_data: dict, key: str) -> bool:
    """判断某字典中某字符串数据非空"""
    if key not in dict_data or dict_data[key] is None or str(dict_data[key]).strip() == "":
        return True
    return False


def is_none(dict_data: dict, key: str) -> bool:
    """判断某字典中某数据非空"""
    return key not in dict_data or dict_data[key] is None


def is_url(content: str):
    """判断是否是链接"""
    try:
        result = urlparse(content)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False
