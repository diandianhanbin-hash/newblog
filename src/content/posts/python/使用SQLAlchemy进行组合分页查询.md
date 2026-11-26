---
title: "使用SQLAlchemy进行组合分页查询"
publishedAt: "2018-05-09T02:52:04+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/使用SQLAlchemy进行组合分页查询.html"
---

## 背景
最近在写web端的时候经常会遇到一个问题，查询数据的时候需要组合条件来查询，并且需要对结果做分页，在网上找了好久，都是到处“借鉴”，无奈之下只能自己研究，这里吧研究的结果记录下来

## 拼SQL来做组合查询
拼SQL是一个最基本的方式，总体的执行难度也不大，不过容易引起SQL注入。但是拼的方式有点讲究，不同的拼法对后续的影响也是不一样的。

* 用`Python`的语法进行格式化

在`Python`中，字符串格式化最方便的就是通过`format()`方法来进行字符串的替换，比如需要拼一句`SQL`可以用下列的方式：

`"select * from photo_info where {0} {1}".format("a=1", " and b=2")`

这种方式应该说是最原始的方式了，比较容易引起`SQL`注入。而且查询条件复杂之后，整个句式看起来会有点不舒服。

目前主流的方式操作数据库都是使用`ORM`的框架来处理，比如`SQLAlchemy`这种。

## 使用SQLAlchemy来做组合查询
首先必须说明，`SQLAlchemy`是不支持组合查询时动态删除元素的，举个例子，比如你有四个查询条件，如果其中一个字段的值为空，那么这个空的值依然会按照空去做`SQL`查询，而不会删了这个字段，用剩下的3个字段去查询。

```
ORM：
photoinfo.filter(PhotoDB.PhotoInfo.category == category)
.filter(PhotoDB.PhotoInfo.is_banner == is_banner)
.filter(PhotoDB.PhotoInfo.photo_desc.like("%{0}%".format(photo_desc))).filter(PhotoDB
.PhotoInfo.photo_title.like("%{0}%".format(photo_title))).all()

SQL：
select * from photo_info where category = "category" and is_banner = "is_banner" and photo_desc = "photo_desc" and photo_title = "photo_title"
```

上面的示例，必须要4个字段有值，如果其中一个没有值，`SQL`就会变成这样：
`select * from photo_info where category = "" and is_banner = "is_banner" and photo_desc = "photo_desc" and photo_title = "photo_title"`
与我要的结果不一样，我想要的是这样：
`select * from photo_info where is_banner = "is_banner" and photo_desc = "photo_desc" and photo_title = "photo_title"`

`SQLAlchemy`还是有一个比较优雅的实现方式，有点类似拼`SQL`，但是整体看起来逻辑很清晰。

```python
	if category:
		photoinfo = photoinfo.filter(PhotoDB.PhotoInfo.category == category)
	if is_banner:
		photoinfo = photoinfo.filter(PhotoDB.PhotoInfo.is_banner == is_banner)
	if photo_desc:
		photoinfo = photoinfo.filter(PhotoDB.PhotoInfo.photo_desc.like("%{0}%".format(photo_desc)))
	if photo_title:
		photoinfo = photoinfo.filter(PhotoDB.PhotoInfo.photo_title.like("%{0}%".format(photo_title)))
	photos = photoinfo.all()
```
这样看起来就很清晰，能够实现我想要的效果，并且`SQLAlchemy`对`SQL`注入做了保护措施，不会引发安全问题。

## 分页查询
分页查询的逻辑很简单，用`SQLAlchemy`实现起来也非常简单。

* 使用`pagenate`

如果要使用`pagenate`来处理分页，那么查询的方式必须继承与`BaseQuery`，否则会报错找不到此方法，使用方式接上例如下所示：

```python
photos = photoinfo.pagination(1, 10)
```

那么，只要迭代`photos`变量的`items`即`photos.items`即可获得查询结果

* 使用`offset()`和`limit()`
`offset`是查询的偏移量，而`limit`限制了返回的条数，接上例实现方式如下：
`photos = photoinfo.limit(PAGESIZE).offset((int(current_page) - 1) * PAGESIZE)`

## 总结
组合条件查询和分页都有多种实现方式，我们应该选择看起来逻辑清晰并且安全的方式来编码，这样对日后的维护会非常友好

