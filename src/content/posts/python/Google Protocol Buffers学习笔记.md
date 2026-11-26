---
title: "Google Protocol Buffers学习笔记"
publishedAt: "2018-12-17T01:17:24+08:00"
categories: ["Python"]
tags: ["Python","Protobuf"]
path: "/python/Google Protocol Buffers学习笔记.html"
---

## 背景
最近由于工作需要，需要做一些`IDL`的事情，参考对象就是`Google Protocol Buffers`。学习的过程中做一些记录

## 介绍

[官方文档：https://developers.google.com/protocol-buffers/](https://developers.google.com/protocol-buffers/)

[Github：https://github.com/protocolbuffers/protobuf/tree/master/python](https://github.com/protocolbuffers/protobuf/tree/master/python)

## 安装

安装其实比较简单，按照步骤安装就好了，`Mac`自带的`Python`就可以直接支持，但是有几个坑需要注意

* `Protocol Buffers`现阶段的安装包没有`configure`文件，需要自己打包

从`Github`上下载下源码之后，需要运行`./autogen.sh`来自行生成`configure`文件。

* 生成`configure`的过程中报错`autoconf`不存在

```
brew install autoreconf
brew install automake
brew install libtool
```
用`brew`直接安装这三个东西即可解决

* 运行`python setup.py install`后依然会报错`google not found`

这个报错是比较奇怪，一般来说会直接把依赖包安装完毕，但是我这里确实是遇到了这个坑，解决办法是直接手工安装`google`。

```
sudo pip install protobuf
sudo pip install google
```

## 参考官方文档撸码
具体的过程就不记录了，基本上完全照搬官方文档的代码，记录几个坑。

#### proto文件的版本标识

`syntax = "proto2";`在协议文件的最上方需要标识出版本号，2和3是有一些区别的：

* 3中不需要定义`require`和`optional`，只有`repeat`声明仍然保留
* 3中自带默认值，不能自定义默认值，这样在序列化的时候就可以节省空间
* 3中支持map的编写
* 3中支持`json`的映射

#### 编写的记录
首先要根据协议生成一个`Python`对象。比如`addressbook_pb2`。有兴趣的可以直接去看这个类的内容，基本上是定义一些空类和方法的声明，具体的操作`API`还是参考官方的说明比较靠谱。

用`Python`操作`Protocol Buffers`的时候，有几个注意点。

* 操作`repeat`对象

`repeat`对象在`Python`中的对应可以理解为是数组。如果需要新增一个数组元素的话，需要这样调用

```python
phone_number = person.phones.add()
phone_number.number = number
phone_number.type = addressbook_pb2.Person.MOBILE
```
说实话，并不太符合`Python`优雅的语法。如果要再新增一个数组元素，那么就要再调用一次`add`生成一个对象。再给对象赋值。

* 序列化与反序列化

官方文档中的序列化方法为`SerializeToString`。实际上序列化的方法还有一个是`SerializePartialToString`，它们的区别是第一个会检查是否所有的元素都被初始化了，而第二个方法不会检查。序列化之后会变成一个二进制的字符串，然而我看到的结果是这样的：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15449789449465.jpg)
也就是说序列化成二进制之后，值并没有被序列化成二进制。

反序列化的方法为`ParseFromString`。

## 思考
`Google Protocol Buffers`无疑是一个不错的传输载体，优点是很明显的：
1. 以二进制的方式来传递能够更加高效。
2. 相比于`XML`,`JSON`等协议来说，它更加规范化。
3. 由于自身编译的机制，确保了两端的接口字段一定是对齐的，减少了一些调试的工作，也可以杜绝一些一端私自增加删除字段导致的bug问题。
4. 能够自动的生成对应的解析代码。减少了代码的复杂度，更专注于业务代码的编写

但是缺点也很明显：
1. 以`IDL`的方式来定义接口，本身就是一个比较重的事情。
2. 协议文件需要编译，额外增加了程序的复杂度，在一些小型项目中并不适用。
3. 由于编译之后会生成对应编程语言的操作对象，因此对于编码语言也有一定的限制，所幸`Google`毕竟是大公司，主流的语言也都支持。
4. 以二进制的方式传输，调试起来会有一定的复杂度。

## 吐槽
当前版本的协议已经是3.6的版本了，但是官方文档中的示例依然用的是2的版本

在官方文档下方的语言选择中可以看出来，是支持简体中文的，但是。。
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15449798674560.jpg)
你的汉化程度就只有这些也敢说支持简体中文吗？？？

## 最后附上代码
我把官方的示例做了一些修改，原来官方的示例是以文件的形式传递的，这里我修改为以`TCP`的方式传递。

```python
pb_client.py

# ecoding=utf-8
# Author: Sven_Weng
# Email : sven_weng@wengyb.com
# Web   : http://www.wengyb.com
import addressbook_pb2
import socket


def PromptForAddress(person):
	person.id = 1
	person.name = "svenweng"
	person.email = "sven_weng@wengyb.com"
	number = "17700000001"
	phone_number = person.phones.add()
	phone_number.number = number
	phone_number.type = addressbook_pb2.Person.MOBILE
	phone_num = person.phones.add()
	phone_num.number = "17700000002"
	phone_num.type = addressbook_pb2.Person.HOME


address_book = addressbook_pb2.AddressBook()

PromptForAddress(address_book.people.add())

print address_book

ss = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
ss.connect(("127.0.0.1", 6969))
print address_book.SerializeToString()
ss.send(address_book.SerializeToString())
ss.close()

```

```python

pb_server.py

# ecoding=utf-8
# Author: Sven_Weng
# Email : sven_weng@wengyb.com
# Web   : http://www.wengyb.com
import socket
import addressbook_pb2
address_book = addressbook_pb2.AddressBook()


def ListPeople(data):
	address_book.ParseFromString(data)
	for person in address_book.people:
		print "Person ID:", person.id
		print "  Name:", person.name
		if person.HasField('email'):
			print "  E-mail address:", person.email

		for phone_number in person.phones:
			if phone_number.type == addressbook_pb2.Person.MOBILE:
				print "  Mobile phone #: ",
			elif phone_number.type == addressbook_pb2.Person.HOME:
				print "  Home phone #: ",
			elif phone_number.type == addressbook_pb2.Person.WORK:
				print "  Work phone #: ",
			print phone_number.number


ss = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
ss.bind(("127.0.0.1", 6969))

ss.listen(0)
while True:
	print 'Wait for connection ...'
	sock, addr = ss.accept()
	data = sock.recv(1024)
	ListPeople(data)
```