---
title: "从实践来看HTTP"
publishedAt: "2019-06-19T00:01:30+08:00"
categories: ["Python"]
tags: ["Python","HTTP"]
path: "/python/从实践来看HTTP.html"
---

## 背景
了解`HTTP`一直是从各种渠道来了解，但是一直都没有真正的从它实际的样子来了解这个协议，这次借着写`Mock`的机会，从`TCP`的层面来理解一下它。

## 初步窥视
首先用`Python`写一个基本的`TCP Server`，然后用浏览器打开这个地址，收到的数据不直接`print`,而是用`print repr()`打印出来，类似这样:`print repr(recv)`。这样就能看到它原来的样子。
```
''GET /test/sven?testname=sven HTTP/1.1\r\nHost: localhost:31500\r\nConnection: keep-alive\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3\r\nAccept-Encoding: gzip, deflate, br\r\nAccept-Language: zh-CN,zh;q=0.9,en;q=0.8,vi;q=0.7\r\nCookie: token=eyJ2ZXIiOiJ2MiIsInVpZCI6Ijdh'
```
可以看到，它的所有信息，都是用`\r\n`来分割的。那么问题来了，为什么是`\r\n`？

>在计算机还没有出现之前，有一种叫做电传打字机（Teletype Model 33）的玩意，每秒钟可以打10个字符。但是它有一个问题，就是打完一行换行的时候，要用去0.2秒，正好可以打两个字符。要是在这0.2秒里面，又有新的字符传过来，那么这个字符将丢失。
于是，研制人员想了个办法解决这个问题，就是在每行后面加两个表示结束的字符。一个叫做“回车”，告诉打字机把打印头定位在左边界；另一个叫做“换行”，告诉打字机把纸向下移一行。
这就是“换行”和“回车”的来历，从它们的英语名字上也可以看出一二。
后来，计算机发明了，这两个概念也就被般到了计算机上。那时，存储器很贵，一些科学家认为在每行结尾加两个字符太浪费了，加一个就可以。于是，就出现了分歧。
Unix系统里，每行结尾只有“<换行>”，即“\n”；
Windows系统里面，每行结尾是“<换行><回车>”，即“\n\r”；
Mac系统里，每行结尾是“\r”。

通俗的来说，就是一个用作换行的东西。头部的数据全部按照这种格式来组成一个长字符串。

## 头部信息
由于`GET`请求没有数据，因此上面的请求信息其实就是`HTTP`的头部信息。

第一行是一个特殊的信息，标记着这个请求的关键信息，包括`请求方法`、`URL`和`参数`、`请求的协议和版本号`，这些关键信息用空格分割。

剩下的行就是请求头部的信息，这些头部字段可以在[RFC4229](https://tools.ietf.org/html/rfc4229)上查看到国际通用的规范定义。

## GET
`GET`方法是`HTTP`中比较常见的方法，我们日常访问某个网站，使用的就是get方法。

如上一节示的`GET`请求，服务端拿到的其实是`HTTP`的首部信息，`GET`请求并没有请求的数据，所以使用`GET`方式请求，如果需要携带参数，那么只能放在`URL`中，因此我们可以从这里看出，`GET`和`POST`的一个很明显的区别，就是当需要携带数据的时候，`GET`方法只能把数据放在`URL`上，而`POST`可以放在请求数据中.

## POST
用同样的方法来跑一次`POST`请求，可以看到如下数据：
```
'POST /?name=sven HTTP/1.1\r\nHost: 127.0.0.1:31500\r\nConnection: keep-alive\r\nAccept-Encoding: gzip, deflate\r\nAccept: */*\r\nUser-Agent: python-requests/2.19.1\r\nContent-Length: 3\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\na=1'

POST /?name=sven HTTP/1.1
Host: 127.0.0.1:31500
Connection: keep-alive
Accept-Encoding: gzip, deflate
Accept: */*
User-Agent: python-requests/2.19.1
Content-Length: 3
Content-Type: application/x-www-form-urlencoded

a=1
```

可以看到，请求头部和请求数据中，使用了两个`\r\n`，也就是换两行来做分割。

同样的，如果在`URL`携带参数，`POST`方法也是能发往服务器的，不过`POST`方法可以支持数据层携带数据，我们常说的`POST`方法传递数据，比`GET`方法安全，实际上从`TCP`层来看，并没有什么区别，只是解析的时候，获取的地方不一样而已。

另一方面，从前端传递数据到后端，有`表单`传递和`JSON`数据传递这两种模式。上面获取的数据实际上是通过表单传递而得到的数据。通过`JSON`传递的数据格式如下：
```
POST /?name=sven HTTP/1.1
Host: 127.0.0.1:31500
Connection: keep-alive
Accept-Encoding: gzip, deflate
Accept: */*
User-Agent: python-requests/2.19.1
Content-Length: 8
Content-Type: application/json

{"a": 1}
```

可以看到数据格式是有一些不同的。

## Flask的某些处理

研究这些数据，其实是有一个好奇点，`Flask`在拿请求参数的时候，使用的方法都是`request.values.get("xxx")`，那么他是怎么去处理这些数据的呢？观看源码即可得到答案。

```python
    def values(self):
        """A :class:`werkzeug.datastructures.CombinedMultiDict` that combines
        :attr:`args` and :attr:`form`."""
        args = []
        for d in self.args, self.form:
            if not isinstance(d, MultiDict):
                d = MultiDict(d)
            args.append(d)
        return CombinedMultiDict(args)
```
这里可以看到，返回的是一个`CombinedMultiDict`对象处理后的`args`的对象，这个对象的`get`方法实际上就是我们调用的方法。

```python
    def get(self, key, default=None, type=None):
        for d in self.dicts:
            if key in d:
                if type is not None:
                    try:
                        return type(d[key])
                    except ValueError:
                        continue
                return d[key]
        return default
```
这里可以看到，我们调用的时候它回去这个列表的每个字典里面去尝试拿值，拿到就返回值，拿不到就把默认结果返回回去。这个字典的数据是`self.args, self.form`，这两个数据实际上一个是解析了`url`中的参数，和`form`里面的参数，统一放到这个列表里面去的。所以如果只是要拿表单的数据，可以直接调用`request.form.get()`也是一样的。