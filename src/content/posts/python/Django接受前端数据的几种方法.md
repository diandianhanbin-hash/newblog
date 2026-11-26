---
title: "Django接受前端数据的几种方法"
publishedAt: "2016-07-14T13:19:23+08:00"
categories: ["Python"]
tags: ["Python","Django"]
path: "/python/Django接受前端数据的几种方法.html"
---

![office-1209640_1920](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/153797619813283.jpg)

菲律宾猴子真是逗，各种被国际打脸，什么乱七八糟的狗屁裁决，是中国的就是中国的，祖国领土是神圣不可侵犯的。

## 背景
测试工具箱写到一半，今天遇到了一个前后端数据交互的问题，就一起做一下整理。

## 环境

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7 

IDE：PyCharm

Django： 1.8.2

***

**注： 我测试的是`Get`方法，`POST`方法也同样适用**

## 字符型
字符型的数据相对好获取，前端传递的方法如下：

```javascript
sendData = {     "exporttype": exporttype,
         "bugids": bugids,
         "test": JSON.stringify({"test": "test"})
     };
```

在Django的后端只要使用`exporttype = request.GET.get("exporttype")`就能正常的获取到这个数据了。

**注意： 在`Python2.7`中数据是`unicode`编码的，如果要使用，有时候需要进行转`str`**

结果示例：

```python
Excle <type 'unicode'>
```

## 数组型
获取数组型的数据如果使用获取字符串的数据的方法，打出的结果是None。我们要使用这个方法：

`bugids = request.GET.getlist("bugids[]")
`

这样获取的数据就是数组类型。

**注意： 获取的数组中的元素是`unicode`编码的，在某些时候使用需要转编码**

结果示例：

* 传递的url

```
[14/Jul/2016 11:00:41]"GET /testtools/exportbug/?exporttype=Excle&bugids%5B%5D=102&bugids%5B%5D=101&bugids%5B%5D=100&bugids%5B%5D=99&bugids%5B%5D=98&bugids%5B%5D=97&bugids%5B%5D=96&bugids%5B%5D=95&bugids%5B%5D=94&bugids%5B%5D=93&bugids%5B%5D=92&bugids%5B%5D=91&bugids%5B%5D=90&bugids%5B%5D=89&bugids%5B%5D=88&bugids%5B%5D=87&bugids%5B%5D=86&bugids%5B%5D=85&bugids%5B%5D=84&bugids%5B%5D=83&bugids%5B%5D=82&bugids%5B%5D=81&bugids%5B%5D=80&bugids%5B%5D=79&bugids%5B%5D=78&bugids%5B%5D=77&bugids%5B%5D=76&bugids%5B%5D=75&bugids%5B%5D=74&bugids%5B%5D=73&bugids%5B%5D=72&bugids%5B%5D=71&bugids%5B%5D=70&bugids%5B%5D=69&bugids%5B%5D=68&bugids%5B%5D=67&bugids%5B%5D=66&bugids%5B%5D=65&bugids%5B%5D=64&bugids%5B%5D=63&bugids%5B%5D=62&bugids%5B%5D=61&bugids%5B%5D=60&bugids%5B%5D=59&bugids%5B%5D=58&bugids%5B%5D=57&bugids%5B%5D=56&bugids%5B%5D=55&bugids%5B%5D=54&bugids%5B%5D=53&bugids%5B%5D=52&bugids%5B%5D=51&bugids%5B%5D=50&bugids%5B%5D=49&bugids%5B%5D=48&bugids%5B%5D=47&bugids%5B%5D=46&bugids%5B%5D=45&bugids%5B%5D=44&bugids%5B%5D=43&bugids%5B%5D=42&bugids%5B%5D=41&bugids%5B%5D=40&bugids%5B%5D=39&bugids%5B%5D=38&bugids%5B%5D=37&bugids%5B%5D=36&bugids%5B%5D=35&bugids%5B%5D=34&bugids%5B%5D=33&bugids%5B%5D=32&bugids%5B%5D=31&bugids%5B%5D=30&bugids%5B%5D=29&bugids%5B%5D=28&bugids%5B%5D=27&bugids%5B%5D=26&bugids%5B%5D=25&bugids%5B%5D=24&bugids%5B%5D=23&bugids%5B%5D=22&bugids%5B%5D=21&bugids%5B%5D=20&bugids%5B%5D=19&bugids%5B%5D=18&bugids%5B%5D=17&bugids%5B%5D=16&bugids%5B%5D=15&bugids%5B%5D=14&bugids%5B%5D=13&bugids%5B%5D=12&bugids%5B%5D=11&test=%7B%22test%22%3A%22test%22%7D HTTP/1.1"
```

* 获取的数据

```
[u'102', u'101', u'100', u'99', u'98', u'97', u'96', u'95', u'94', u'93', u'92', u'91', u'90', u'89', u'88', u'87', u'86', u'85', u'84', u'83', u'82', u'81', u'80', u'79', u'78', u'77', u'76', u'75', u'74', u'73', u'72', u'71', u'70', u'69', u'68', u'67', u'66', u'65', u'64', u'63', u'62', u'61', u'60', u'59', u'58', u'57', u'56', u'55', u'54', u'53', u'52', u'51', u'50', u'49', u'48', u'47', u'46', u'45', u'44', u'43', u'42', u'41', u'40', u'39', u'38', u'37', u'36', u'35', u'34', u'33', u'32', u'31', u'30', u'29', u'28', u'27', u'26', u'25', u'24', u'23', u'22', u'21', u'20', u'19', u'18', u'17', u'16', u'15', u'14', u'13', u'12', u'11'] <type 'list'>
```

## 字典型
字典型数据其实可以当成字符串数据来处理，获取到对应字符串后使用`JSON`模块做一下格式化就行了。

对于前端来说，传递字典型的数据就是传递`JSON`数据，所以使用的方法是：

`"test": JSON.stringify({"test": "test"})`

结果示例：

```
{"test":"test"} <type 'unicode'>
```

## 相关源码

* `Get`方法

`Get`方法是`wsgi`里面的一个方法。

```python
def GET(self):
        # The WSGI spec says 'QUERY_STRING' may be absent.
        raw_query_string = get_bytes_from_wsgi(self.environ, 'QUERY_STRING', '')
        return http.QueryDict(raw_query_string, encoding=self._encoding)
```

最终返回的是一个`http.QueryDict(raw_query_string, encoding=self._encoding)`http的原始数据，而`QueryDict`继承于`MultiValueDict
`，所以我们直接看`MultiValueDict`就好了。

* `MultiValueDict`

其实源码看起来并不难。

```python
    def get(self, key, default=None):
        """
        Returns the last data value for the passed key. If key doesn't exist
        or value is an empty list, then default is returned.
        """
        try:
            val = self[key]
        except KeyError:
            return default
        if val == []:
            return default
        return val

    def getlist(self, key, default=None):
        """
        Returns the list of values for the passed key. If key doesn't exist,
        then a default value is returned.
        """
        try:
            return super(MultiValueDict, self).__getitem__(key)
        except KeyError:
            if default is None:
                return []
            return default
            
    def __getitem__(self, key):
        """
        Returns the last data value for this key, or [] if it's an empty list;
        raises KeyError if not found.
        """
        try:
            list_ = super(MultiValueDict, self).__getitem__(key)
        except KeyError:
            raise MultiValueDictKeyError(repr(key))
        try:
            return list_[-1]
        except IndexError:
            return []
```

`getlist`方法也就是把数据全部整合一下，返回回来。
