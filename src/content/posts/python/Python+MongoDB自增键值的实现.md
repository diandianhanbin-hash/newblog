---
title: "Python+MongoDB自增键值的实现"
publishedAt: "2016-06-17T22:02:16+08:00"
categories: ["Python","测试"]
tags: ["Python","MongoDB"]
path: "/python/Python+MongoDB自增键值的实现.html"
---

## 背景
最近在写一个测试工具箱，里面有一个bug记录系统，因为后台我是用Django和MongoDB来实现的，就遇到了一个问题，要如何实现一个自增的字段。

传统的关系型数据库要实现起来是非常容易，只要直接设置一个自增字段就行了，插入数据时不用管这个键值，只管自己处理的数据就行了，会自动实现自增的功能，但是非关系型数据库好像没有这个功能（或者我不知道）。百度之后发现都是MongoDB的设置方法，并不是我想要的。

## 解决思路
百度没有找到好的思路，那就只能自己解决了，我的想法很简单，字段不会自增，那么就自己造一个自增的方案。

我发现在MongoDB修改的方法有一个`$inc`的方法.可以实现`int`类型的自增。那么就非常简单了，自己建一个`collection`，然后这个`collection`中只有一个`int`的字段，每次插入数据时来这个`collection`取`ID`就行了，然后再调用一下`$inc`方法，那么就实现了自动自增的方案。

## 代码展示
Python实现起来还是非常简单的Python和Django非常契合。代码如下：

```python
def bugPlus(self):
	"""
	bugID自增
	:return:True
	"""
	db = self.__chooseCollection(config.COLLECTION['bugID'])
	db.update_one({"bugID": self.getBugID()}, {"$inc": {"bugID": 1}})
	return True
```

每次插入成功后，调用这个方法就可以实现ID的自增。

```python
def getBugID(self):
	"""
	获取当前bug的最新编号
	:return:None
	"""
	db = self.__chooseCollection(config.COLLECTION['bugID'])
	rst = db.find_one()
	return rst['bugID']
```

在插入之前，调用这个方法，这样每次插入数据时插入的ID就是实现自增的ID。

## 缺点
当然，这种方式还是有缺点的，调用的时候多使用了方法，因此需要确认方法是否执行成功，否则会导致下次插入的ID不是自增后的数据。每次多调了一次方法，会导致性能下降。

## 其他
如果有更好的实现方式，请告诉我！
