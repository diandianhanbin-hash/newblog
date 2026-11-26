---
title: "Python爬取网页的编码处理"
publishedAt: "2016-09-17T11:58:56+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/Python爬取网页的编码处理.html"
---

![20160913](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777202.6596842.jpg)
不是中秋节的中秋快乐！！！

## 背景
中秋的时候，一个朋友给我发了一封邮件，说他在爬链家的时候，发现网页返回的代码都是乱码，让我帮他参谋参谋(中秋加班，真是敬业= =！)，其实这个问题我很早就遇到过，之前在爬小说的时候稍微看了一下，不过没当回事，其实这个问题就是对编码的理解不到位导致的。

## 问题
很普通的一个爬虫代码，代码是这样的：

```python
# ecoding=utf-8
import re
import requests
import sys
reload(sys)
sys.setdefaultencoding('utf8')

url = 'http://sz.lianjia.com/ershoufang/rs%E6%8B%9B%E5%95%86%E6%9E%9C%E5%B2%AD/'
res = requests.get(url)
print res.text
```

目的其实很简单，就是爬一下链家的内容，但是这样执行之后，返回的结果，所有涉及到中文的内容，全部会变成乱码，比如这样

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777224.073407.jpg)


```
<script type="text/template" id="newAddHouseTpl">
  <div class="newAddHouse">
    èªä»æ¨ä¸æ¬¡æµè§ï¼<%=time%>ï¼ä¹åï¼è¯¥æç´¢æ¡ä»¶ä¸æ°å¢å äº<%=count%>å¥æ¿æº
    <a href="<%=url%>" class="LOGNEWERSHOUFANGSHOW" <%=logText%>><%=linkText%></a>
    <span class="newHouseRightClose">x</span>
  </div>
</script>
```

这样的数据拿来可以说毫无作用。

## 问题分析
这里的问题很明显了，就是文字的编码不正确，导致了乱码。

## 查看网页的编码
从爬取的目标网页的头来看，网页是用`utf-8`来编码的。

```
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
```

所以，最终的编码，我们肯定也要用utf-8来处理，也就是说，最终的文本处理，要用utf-8来解码，也就是：`decode('utf-8’)`

## 文本的编码解码
Python的编码解码的过程是这样的，`源文件` ===》 `encode(编码方式)` ===》`decode(解码方式)`，在很大的程度上，不推荐使用

```python
import sys
reload(sys)
sys.setdefaultencoding('utf8')
```

这种方式来硬处理文字编码。不过在某些时候不影响的情况下，偷偷懒也不是什么大问题，不过比较建议的就是获取源文件之后，使用`encode`和`decode`的方式来处理文本。

## 回到问题
现在问题最大的是源文件的编码方式，我们正常使用`requests`的时候，它会自动猜源文件的编码方式，然后转码成`Unicode`的编码，但是，毕竟是程序，是有可能猜错的，所以如果猜错了，我们就需要手工来指定编码方式。官方文档的描述如下：

>When you make a request, Requests makes educated guesses about the encoding of the response based on the HTTP headers. The text encoding guessed by Requests is used when you access r.text. You can find out what encoding Requests is using, and change it, using the r.encoding property.

所以我们需要查看`requests`返回的编码方式到底是什么？

```python
# ecoding=utf-8
import re
import requests
from bs4 import BeautifulSoup
import sys
reload(sys)
sys.setdefaultencoding('utf8')

url = 'http://sz.lianjia.com/ershoufang/rs%E6%8B%9B%E5%95%86%E6%9E%9C%E5%B2%AD/'

res = requests.get(url)
print res.encoding
```

打印的结果如下：

```
ISO-8859-1
```

也就是说，源文件使用的是`ISO-8859-1`来编码。百度一下`ISO-8859-1`，结果如下：

>ISO8859-1，通常叫做Latin-1。Latin-1包括了书写所有西方欧洲语言不可缺少的附加字符。

## 问题解决

发现了这个东东，问题就很好解决了，只要指定一下编码，就能正确的打出中文了。代码如下：

```python
# ecoding=utf-8
import requests
import sys
reload(sys)
sys.setdefaultencoding('utf8')

url = 'http://sz.lianjia.com/ershoufang/rs%E6%8B%9B%E5%95%86%E6%9E%9C%E5%B2%AD/'

res = requests.get(url)
res.encoding = ('utf8')

print res.text
```

打印的结果就很明显，中文都正确的显示出来了。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777249.183904.jpg)


另一种方式是在源文件上做解码和编码，代码如下：

```python
# ecoding=utf-8
import requests
import sys
reload(sys)
sys.setdefaultencoding('utf8')

url = 'http://sz.lianjia.com/ershoufang/rs%E6%8B%9B%E5%95%86%E6%9E%9C%E5%B2%AD/'

res = requests.get(url)
# res.encoding = ('utf8')

print res.text.encode('ISO-8859-1').decode('utf-8')
```

另：`ISO-8859-1`也叫做`latin1`，使用`latin1`做解码结果也是正常的。



## 其他衍生
关于字符的编码，很多东西可以说，想了解的朋友可以参考以下大神的资料。

* [《The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!)》](http://www.joelonsoftware.com/articles/Unicode.html)

* [字符编码笔记：ASCII，Unicode和UTF-8](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html)
