---
title: "Python装饰器的一些小知识"
publishedAt: "2018-06-21T17:22:47+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/Python装饰器的一些小知识.html"
---

## 调用时机
装饰器的调用时机是在导入时，或者是加载时就执行，如下代码：

```python
register = []


def regester(func):
	print 'running regisster ({0})'.format(func)
	register.append(func)
	return func


@regester
def f1():
	print "running f1()"


@regester
def f2():
	print "running f2()"


def f3():
	print "running f3()"


def main():
	print "running main()"
	print register
	f1()
	f2()
	f3()
```

其执行结果如下：

```
running regisster (<function f1 at 0x1035ae5f0>)
running regisster (<function f2 at 0x1035ae668>)
running main()
[<function f1 at 0x1035ae5f0>, <function f2 at 0x1035ae668>]
running f1()
running f2()
running f3()
```

按照正常的代码执行逻辑要执行，那么第一个打印出来的应该是`"running main()"`，但是实际上在第三行才打出来了，前面两行都是装饰器里面的内容，用Debug模式来运行，看的比较清楚。

[原图待补](<https://www.wengyb.com/python/media/15290566503359.jpg>)

如图所示，我在运行初识的时候打了一个端点，Debug模式运行后，程序已经打印出了装饰器的内容。

------以上来自《流畅的Python》

## 装饰器来打日志
之前一直有用过这块，不过遇到了一点问题，在修饰类里面的函数时，经常会出现参数错误的情况，因为类里面的函数第一个参数总是`self`，在执行的时候经常保参数不正确，这里分享一个我实践成功的一个装饰器函数，可以解决这个问题。

```python
# ecoding=utf-8
# Author: 翁彦彬 | Sven_Weng
# Email : sven_weng@wengyb.com
# Web   : http://wybblog.applinzi.com
import time
import functools


def log(func):
	@functools.wraps(func)
	def inner_methods(*args, **kwargs):
		t0 = time.time()
		result = func(*args, **kwargs)
		t1 = time.time()
		name = func.__name__
		arg_list = []
		if args:
			arg_list.append(', '.join([str(arg) for arg in args]))
		if kwargs:
			pairs = ['{0}={1}'.format(k, w) for k, w in sorted(kwargs.items())]
			arg_list.append(', '.join(pairs))
		print "[{0}]func_name:{1},args:({2})".format(str(t1 - t0), name, arg_list)
		return result

	return inner_methods
```

这个装饰器装饰之后，会把执行的函数名，入参和执行的时间全部都打出来。


