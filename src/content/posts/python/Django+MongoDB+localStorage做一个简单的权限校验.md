---
title: "Django+MongoDB+localStorage做一个简单的权限校验"
publishedAt: "2016-10-04T10:28:36+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/Django+MongoDB+localStorage做一个简单的权限校验.html"
---

![20160930](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976719956612.jpg)


## 背景
最近一直在用自己写的bug管理系统，在某些必要的时候需要对权限做一下控制，比如非相关人员是不能关闭缺陷的。当然，这种控制也是非常简单的控制。正常使用Django的话，可以直接使用它的Session模块，可以很容易达到效果，不过我使用的是MongoDB作为数据库，Django没有官方的支持，所以就只能自己来写了。

***
版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7 

IDE：PyCharm
***

## 思路
整体的思路就是做一个很简单很简单的登录模块，登录之后记录localStorage，关闭的时候把这个localStorage传到后台，校验这个localStorage是否正确，如果正确则允许后续操作，如果不正确则不允许操作。

## 写localStorage
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976741093091.jpg)
我这里是直接写localStorage。

```html
<script>
    $("#login").on('click', function () {
        var cookies = $("#cookies").val();
        window.localStorage.username = cookies;
    })
</script>
```

点击登录之后，就会在本地写一个localStorage。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976758800545.jpg)

## 校验
后台在写数据库之前要校验这个localStorage是否符合我的设定。

```python
def updateBugContent(request, bugid):
	if request.method == "POST":
		data = {
			"Project": request.POST['Project'],
			"bugTitle": request.POST['bugTitle'],
			"Terminal": request.POST['Terminal'],
			"bugDescription": request.POST['bugDescription'],
			"bugStep": request.POST['bugStep'],
			"Developer": request.POST['Developer'],
			"Tester": request.POST['Tester'],
			"bugStatus": request.POST['bugStatus'],
		}

		if request.POST['localStorage'] == "xxx" and request.POST['bugStatus'] == '3':
			mdb.dbUpdateOneRecord(config.COLLECTION['bugContent'], [data, {"bugID": int(bugid)}])
			print 'ok'
		elif request.POST['bugStatus'] != '3':
			mdb.dbUpdateOneRecord(config.COLLECTION['bugContent'], [data, {"bugID": int(bugid)}])
			print 'ok2'
		else:
			print 'error'
		return bugdetail(request, bugid)
```

我要控制的是bugStatus为3的情况下，必须要是符合的localStorage才能进行数据库修改。

## 最后
最后，我写的还是太简单了，一般来说是需要一个账户系统，可以吧用户数据存储在MongoDB中，生成的localStorage也可以做一下加密处理。

