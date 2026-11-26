---
title: "基于Flask的一个简单的定时任务调度器"
publishedAt: "2019-01-30T20:31:13+08:00"
categories: ["代码片段"]
tags: ["Python"]
path: "/code/基于Flask的一个简单的定时任务调度器.html"
---

## 背景
日常开发的web项目中在某些程度上会需要使用定时任务去处理一些事情，比如心跳，定时拉取数据等。但是现有的解决方案很多都太重，我们其实只是需要一个很轻巧定时器去做事，这里实现一个非常简单小巧的定时任务调度器。主要是用在`Flask`框架上，当然，也可以用于其他的服务中。

## 代码

```python
from flask import Flask
from threading import Timer

app = Flask(__name__)


@app.route("/hello")
def api():
    return "ok"


class Scheduler(object):
    def __init__(self, sleep_time, function):
        self.sleep_time = sleep_time
        self.function = function
        self._t = None

    def start(self):
        if self._t is None:
            self._t = Timer(self.sleep_time, self._run)
            self._t.start()
        else:
            raise Exception("this timer is already running")

    def _run(self):
        self.function()
        self._t = Timer(self.sleep_time, self._run)
        self._t.start()

    def stop(self):
        print "stoped"
        if self._t is not None:
            self._t.cancel()
            self._t = None


def start(func):
    func.start()


def end(func):
    func.stop()


def query_db():
    print "IM QUERYING A DB"


def test_print():
    print "print something"


if __name__ == "__main__":
    scheduler1 = Scheduler(5, query_db)
    scheduler2 = Scheduler(7, test_print)
    schedulers = [scheduler1, scheduler2]
    map(start, schedulers)
    app.run(host='0.0.0.0', port=10086, debug=True, use_reloader=False)
    map(end, schedulers)
```

## 说明
代码的总体思路是使用了`threading`的`Timer`模块来处理的。整体的实现完全没有依赖于第三方库，因此移植性比较强。并且在启动和停止上用了`map`函数，简化了多个定时任务重复的调用`start`和`stop`方法。

在`Flask`框架中，还必须在以`debug`模式运行时加上`use_reloader=False`，否则每个周期都会调用两次。或者以`production`的形式来运行，也是不会出现运行两次的问题。

## 原出处
[https://gist.github.com/chadselph/4ff85c8c4f68aa105f4b](https://gist.github.com/chadselph/4ff85c8c4f68aa105f4b)