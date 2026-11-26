---
title: "用表达式的方式来获取json的值"
publishedAt: "2018-12-06T14:11:45+08:00"
categories: ["代码片段"]
tags: ["Python"]
path: "/code/用表达式的方式来获取json的值.html"
---

## 背景
用表达式的方式，其实也就是用`a.b.c`这种方式来获取一个层级比较深的`json`串的值

## 代码

```python
def express_get_json_value(express, json_ori):
    """
    用表达式的方式获取一个json的值
    :param express: 表达式，类似a.b.c
    :param json_ori:json的原串
    :return: str，获取的值，如果没有值则返回空
    """
    if "." not in express:
        return json_ori[express]
    tmp_list = express.split(".")
    tmp = json_ori
    for x in tmp_list:
        tmp = tmp.get(x, '')
    print tmp
    return tmp
```