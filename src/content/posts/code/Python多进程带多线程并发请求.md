---
title: "Python多进程带多线程并发请求"
publishedAt: "2019-03-23T14:52:20+08:00"
categories: ["代码片段"]
tags: ["Python"]
path: "/code/Python多进程带多线程并发请求.html"
---

## 背景
偶尔我们需要简单的做并发做压测，如果只是多线程并发会出现并发量级不够的情况，因此需要使用多进程带多线程产生并发量。
如果还要更大的量级的话，可以在线程里面再使用协程。
需要注意的是，进程数要视情况而定，给的值太大会导致OOM，单个线程数不建议超过2K。我在2015款的`Macbook Pro`中测试结果是线程数不超过`2000`，进程数不超过`8`，也就是单次并发量不超过`16000`。

## 代码

```python
# ecoding=utf-8
# Email : sven_weng@wengyb.com
# Web   : http://www.wengyb.com
import threading
from multiprocessing import Pool
import os, time, random


def press(target, threads_num, times, args):
    threads = []
    for x in range(threads_num * times):
        t = threading.Thread(target=target, args=args)
        threads.append(t)
    for x in range(times):
        time.sleep(1)
        for t in threads[x * threads_num: (x + 1) * threads_num]:
            t.setDaemon(True)
            t.start()
        t.join()
    print "press is over"


def press_poll(target, p_num, threads_num, times, args):
    """
    开启多进程带多线程并发执行, 单次并发总量级=p_num*threads_num
    :param target: 需要执行的函数
    :param p_num: int， 进程数
    :param threads_num: int, 单线程的量级, 最大建议不超过2K
    :param times:int, 总共发起多少次
    :param args:tuple，函数的参数
    :return:None
    """
    p = Pool()
    for i in range(p_num):
        p.apply_async(press, args=(target, threads_num, times, args))
    p.close()
    p.join()


def test_task(name):
    print 'Run task %s (%s)...%s' % (name, os.getpid(), time.time())
    time.sleep(random.random() * 3)


if __name__ == '__main__':
    print "start"
    press_poll(test_task, 5, 2000, 3, ("a",))
    print "end"

```