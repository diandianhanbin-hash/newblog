---
title: "说说Python中的queue"
publishedAt: "2018-06-24T00:53:41+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/说说Python中的queue.html"
---

## 背景
最近在看Python基础，刚好看到生产者与消费者这快内容，视频使用了`queue`模块来处理，这里记录一下学习的内容

## 概念
生产者与消费者是一个比较容易理解的概念，比如游泳池中一头进水一头出水，就是很典型的例子。

## 视频中的内容
视频中的代码主要是下面这块：

```python
# ecoding=utf-8
# Author: 翁彦彬 | Sven_Weng
# Email : sven_weng@wengyb.com
# Web   : http://wybblog.applinzi.com
from threading import current_thread, Thread
import time
import random
import queue

q = queue.Queue(5)


class Productor(Thread):
	def run(self):
		name = current_thread().getName()
		nums = range(100)
		while 1:
			nowput = random.choice(nums)
			if q.full():  # 消息队列满则停止生产
				print "队列已经达到上限{0}".format(q.qsize())
				time.sleep(10)
			q.put(nowput)
			print "生产者{0}生产了{1}".format(name, nowput)
			sl = random.choice([1, 2, 3])
			time.sleep(sl)  
			print "生产者休息了{0}秒".format(sl)


class Consumer(Thread):
	def run(self):
		name = current_thread().getName()
		while 1:
			if q.empty():  # 消息队列空的时候则暂停消费
				print "队列空了，暂停消费"
				time.sleep(5)
			num = q.get()
			q.task_done()
			print "消费者{0}消费了{1}".format(name, num)
			sl = random.choice([1, 2, 3])
			time.sleep(sl)
			print "消费者休息了{0}秒".format(sl)


if __name__ == '__main__':
	p1 = Productor()
	p1.start()
	p2 = Productor()
	p2.start()
	c1 = Consumer()
	c1.start()
	c2 = Consumer()
	c2.start()
	c3 = Consumer()
	c3.start()
```

用的是`threading`模块来一边生产内容一边消费内容，整个代码是比较简单，但是不是特别容易理解，尤其是新手理解的时候不够直观。

## 个人理解
消息队列这个东西可以理解为一个复杂的`list`，比如要实现先进先出，那么每次返回`list[0]`就行了，同理，如果要实现后进先出，那么每次返回`list[len(list)]`就行了，这么理解起来比较容易。
当然，消息队列相比起`list`来是复杂了一些，但是原理基本上就是这样，比如`queue`使用的是`threading`模块来实现的，再复杂的消息队列，比如`Python`中用的比较多的`celery`，可选的消息队列就有`RabbitMQ`或者`Redis`

## 一个直观的例子
鉴于视频中的例子过于复杂，我自己写了一个简单直观的例子，用`Flask`写了一个简单的`Web`化的消息队列服务。

```python
from flask import Flask, jsonify, request
from queue import Queue

app = Flask(__name__)


@app.before_first_request
def init_queue():
	app.q = Queue(5)


@app.route('/')
def hello_world():
	data = {
		"code": "0000",
		"queue_count": app.q.qsize()
	}
	return jsonify(data)


@app.route('/put')
def put_to_queue():
	num = request.args['num']
	print num
	if app.q.full():
		data = {
			"code": "0001",
			"msg": "The Queue is full"
		}
	else:
		app.q.put(num)
		data = {
			"code": "0000",
			"msg": "Success put {1} to the Queue, current count is {0}".format(app.q.qsize(), num)
		}
	return jsonify(data)


@app.route('/get')
def get_from_queue():
	if app.q.empty():
		data = {
			"code": "0002",
			"msg": "The Queue is empty"
		}
	else:
		data = {
			"code": "0000",
			"msg": "Success get from the Queue, current count is {0}".format(app.q.qsize()),
			"num": app.q.get()
		}
		app.q.task_done()
	return jsonify(data)


if __name__ == '__main__':
	app.run(debug=True)
```

首先在启动的时候调用`before_first_request`来初始化队列，放到`app.q`这个全局变量中，用不同的请求来执行不同的队列操作，在页面上就可以看到不同的结果了。演示例子中队列数量5个就满了，再执行`put`就会返回错误信息，同理，如果空了，也会返回错误信息。


