---
title: "RobotFramework二次开发——实时日志"
publishedAt: "2017-12-06T14:09:29+08:00"
categories: ["RobotFramework"]
tags: ["RobotFramework"]
path: "/robotframework/RobotFramework二次开发——实时日志.html"
---

## 背景
基于`RobotFramework`的二次开发，少不了要打印实时日志出来，比如广泛应用的工具`ride`中，在执行用例时会把执行过程中的log全部打印出来，如果二次开发的时候，执行用例只能静默等待执行完毕，那只能算是一个半成品。

**结果在最后，不想看过程的可以直接跳到最后**

## 思路
`RobotFramework`的日志有好几种，一个是执行后的`log`文件，这个文件可以作为数据留存，但是没办法实时获取，因为文件是在执行完毕之后才生成的。

第二种是`命令行执行`时留存的记录，我们在命令行执行`RobotFramework`的时候，会有很多日志打印出来，但是，这个日志经过观察，可获取的信息少，而且实时的程度不够

第三种是类似`ride`的日志显示，这种目前来看是最友好的显示方式，因此目标是用`ride`的实现方式来实现此功能。

## 开工前准备
应该来说，基于`ride`的方式是比较麻烦的，我用`Google`搜了一下这方面的资料，几乎为0，想要折腾出来，就只能自己去看`ride`的源码，所以，准备工作就是要吧`ride`的源码拿出来。

## 定位功能
首先用`ride`执行一条用例，可以发现，`ride`执行的时候是以命令行的形式来执行的，如下所示：

```
pybot.bat  -v ENV:PRE -v PID:30911 --argumentfile c:\users\hetong~1\appdata\local\temp\RIDExvh51x.d\argfile.txt --listener C:\Python27\lib\site-packages\robotide\contrib\testrunner\TestRunnerAgent.py:64337:False E:\本地脚本
```

执行的功能后续会新增文章来说明，这里我们看这一段：

```
--listener C:\Python27\lib\site-packages\robotide\contrib\testrunner\TestRunnerAgent.py:64337:False E:\本地脚本
```

可以发现一个东西，执行的时候，加了一个`--listener`的参数，这个参数用到了`ride`里面的一个叫`TestRunnerAgent.py`的文件，后面还带了两个参数，分别是`64337`和`False`，这个时候，再检查一下本地的端口情况。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537776054.8657222.jpg)

这个端口被打开了，并且处于`Listening`状态，那么就可以推断，这应该是一个本地的`socket`通讯。有了这个发现，就可以去源码全局搜索`socket`了。在`testrunner.py`文件中发现了这样的代码：

```python
    def _send_socket(self, data):
        if self._port is None:
            return  # Silent failure..
        sock = None
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('localhost', self._port))
            sock.send(data)
        finally:
            sock.close()
```
和这样的代码：

```python
# The following two classes implement a small line-buffered socket
# server. It is designed to run in a separate thread, read data
# from the given port and update the UI -- hopefully all in a
# thread-safe manner.
class RideListenerServer(SocketServer.TCPServer):
    """Implements a simple line-buffered socket server"""
    allow_reuse_address = True
    def __init__(self, RequestHandlerClass, callback):
        SocketServer.TCPServer.__init__(self, ("",0), RequestHandlerClass)
        self.callback = callback

class RideListenerHandler(SocketServer.StreamRequestHandler):
    def handle(self):
        decoder = TestRunnerAgent.StreamHandler(self.request.makefile('r'))
        while True:
            try:
                (name, args) = decoder.load()
                self.server.callback(name, *args)
            except (EOFError, IOError):
                # I should log this...
                break

```

注释说的很明白了，这两个类就用来监听执行的日志，并且根据端口来更新UI。

这个时候再来看看命令中的`TestRunnerAgent.py`。

```python
	def start_test(self, name, attrs):
		self._send_socket("start_test", name, attrs)

	def end_test(self, name, attrs):
		self._send_socket("end_test", name, attrs)

	def start_suite(self, name, attrs):
		self._send_socket("start_suite", name, attrs)

	def end_suite(self, name, attrs):
		self._send_socket("end_suite", name, attrs)
```

这里从字面意思就能看出来，是在发送socket通讯，在`TestRunnerAgent`初始化的时候，就开启了socket通讯。

## 重写监听类
从上面我们就可以得出，`ride`是通过`--listener`方法来监听实时数据，然后以`socket`的方式推给UI端，然后UI端再试试更新界面。那么我们只要把监听的数据拿出来，就可以以自己的方式来随意模拟一个`ride`的实现。第一步就是**重写监听类**。

打开`RobotFramework`的`User Guide`我们可以找到`Listener`参数的相关解释，[点我直达](http://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html#listener-interface)。我们可以它的API说明。根据说明文档，我这里简单写了一个可用的类，如有需要，可以根据文档自己重写。

```python
# ecoding=utf-8
# Author: Sven_Weng
# Email : sven_weng@wengyb.com
# Web   : http://wybblog.applinzi.com


class RobotListener(object):
	ROBOT_LISTENER_API_VERSION = 2

	def start_suite(self, name, args):
		print "Starting Suite : " + name + "  " + args['source']

	def start_test(self, name, args):
		print "Starting test : " + name
		if args['template']:
			print 'Template is : ' + args['template']

	def end_test(self, name, args):
		print "Ending test:  " + args['longname']
		print "Test Result is : " + args['status']
		print "Test Time is: " + str(args['elapsedtime'])

	def log_message(self, message):
		print message['timestamp'] + " :   " + message['level'] + " : " + message['message']
```
执行结果如下：

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537776083.171663.jpg)

打印日志会和命令返回的结果重叠在一起，如果要看到完整的日志信息，可以把结果导出到一个文件。

