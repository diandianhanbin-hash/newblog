---
title: "Python获取可用端口"
publishedAt: "2018-11-21T23:17:03+08:00"
categories: ["代码片段"]
tags: ["Python"]
path: "/code/Python获取可用端口.html"
---

## 说明

```python
扫描本机的可用端口。
    eg:
        pd = PortDetect()
        pd()
        print pd.avaliable
    ==>
        50000

    默认会从本机的50000端口开始扫描，依次递增到55000，如果发现可用的端口则把端口号赋值给
    类的成员变量avaliable，如果扫描完成后avaliable的值是0，说明所有端口都被占用了。

    也可以单独使用check_port方法，通过传入端口的方式来检查端口是否被占用。
    eg:
        pd = PortDetect()
        pd.check_port(9999)

    ==>
        True
```

## 代码
```python
import socket


class PortDetect(object):
    """
    扫描本机的可用端口。
    eg:
        pd = PortDetect()
        pd()
        print pd.avaliable
    ==>
        50000

    默认会从本机的50000端口开始扫描，依次递增到55000，如果发现可用的端口则把端口号赋值给
    类的成员变量avaliable，如果扫描完成后avaliable的值是0，说明所有端口都被占用了。

    也可以单独使用check_port方法，通过传入端口的方式来检查端口是否被占用。
    eg:
        pd = PortDetect()
        pd.check_port(9999)

    ==>
        True
    """
    def __init__(self, range_s=50000, range_e=55000):
        self.range_s = range_s
        self.range_e = range_e
        self.avaliable = 0

    def check_port(self, port):
        """
        单独检查端口是否可用
        :param port: int, 端口号
        :return: Bool， True表示端口可用，False表示端口不可用
        """
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = s.connect_ex(("127.0.0.1", int(port)))
        if result == 0:
            return False
        else:
            return True

    def __call__(self, *args, **kwargs):
        for x in range(self.range_s, self.range_e):
            rst = self.check_port(x)
            if rst:
                self.avaliable = x
                break
        else:
            print "all port used"
```