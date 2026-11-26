---
title: "学习一下Python3的协程"
publishedAt: "2020-09-11T21:31:49+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/学习一下Python3的协程.html"
---

## 背景

Python3推出好久了，其中的协程特性，一直没有时间来学习，这次跟着官方文档一起了解一下。

```
Python版本：3.6.6
```

## Hello World

```python
import asyncio

async def hello_world():
    print("Hello World!")

loop = asyncio.get_event_loop()
loop.run_until_complete(hello_world())
loop.close()
```

这里其实跟我们正常执行函数，没有很大的区别。

根据官方的介绍，这里的协程是通过一个task去做的，因此这里需要定义一个`loop`，这个`loop`会监听传入函数的执行状态。执行完毕之后，要把这个`loop`给关掉。

其实`Python3.8`改版成`asyncio.run()`，这种方式其实是更友好的，基本上不感知协程的实现方式了。

## 获取异步的结果

```python
import asyncio

async def slow_operation(future):
    await asyncio.sleep(1)
    future.set_result('Future is done!')

loop = asyncio.get_event_loop()
future = asyncio.Future()
asyncio.ensure_future(slow_operation(future))
loop.run_until_complete(future)
print(future.result())
loop.close()
```

可以看到，这里实际上是通过定义了一个`Future`来实现的，在异步函数执行完毕之后，通过`set_result`方法来设置结果。在外层就可以拿到这个结果。这种方式，可以按同步的思维来写异步的程序，并且获取返回结果。

## 回调

```python
import asyncio

async def slow_operation():
    await asyncio.sleep(1)
    return 'Future is done!'

def got_result(future):
    print(future.result())

loop = asyncio.get_event_loop()
task = asyncio.ensure_future(slow_operation())
task.add_done_callback(got_result)
loop.run_until_complete(task)
loop.close()
```

这里的实例是我拿官方的实例修改的，更方便理解。这里的回调，会扔到一个`Future`对象里面。通过这个对象的方法拿到结果。



## 多任务执行

```python
import asyncio
import time

async def factorial(name, number):
    f = 1
    for i in range(2, number+1):
        print("Task %s: Compute factorial(%s)..." % (name, i))
        await asyncio.sleep(1)
        f *= i
    print("Task %s: factorial(%s) = %s" % (name, number, f))

loop = asyncio.get_event_loop()
print(time.time())
loop.run_until_complete(asyncio.gather(
    factorial("A", 2),
    factorial("B", 2),
    factorial("C", 2),
))
print(time.time())
loop.close()
```

这里引入了一个`gather`方法。同构这个方法，可以同时执行多个任务。

上面的代码我把官方的内容改了一下。执行结果可以看到。这三个任务实际上是同时执行的。整个函数执行耗时也只有1s。也就是实现了并发。

官方文档这里的实例，实际上是为了说明，loop会等待所有的任务执行完毕才结束。

>A task is automatically scheduled for execution when it is created. The event loop stops when all tasks are done.

## 一些小细节

在看这个内容的时候，我一直在想，使用`time.sleep(1)`和`await asyncio.sleep(1)`有什么区别。

如果使用await的，协程遇到这部分就会切换上下文，如果不实用await的，就会一直阻塞。也就意味着，如果不实用await。。。并发就是个伪命题。

把上面的多任务执行实例中的`await asyncio.sleep(1)`改成`time.sleep(1)`。你会发现，这三个任务是串行的。


## 参考

[https://hackernoon.com/threaded-asynchronous-magic-and-how-to-wield-it-bba9ed602c32](https://hackernoon.com/threaded-asynchronous-magic-and-how-to-wield-it-bba9ed602c32)

[https://docs.python.org/zh-cn/3.6/library/asyncio-task.html](https://docs.python.org/zh-cn/3.6/library/asyncio-task.html)