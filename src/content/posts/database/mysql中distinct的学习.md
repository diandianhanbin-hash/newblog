---
title: "mysql学习——distinct"
publishedAt: "2020-01-10T10:26:11+08:00"
categories: ["数据库"]
tags: ["mysql"]
path: "/database/mysql中distinct的学习.html"
author: "sven_weng"
---

## 背景
今年给自己定下的基调就是要好好学一下数据库相关的知识，所以今天也开始弃用各类`ORM`框架，使用原生的`sql`来干一些活。这次遇到的问题就是一个去重查询的问题。

## 过程

去重查询，我第一个想到的就是`group by`。这个方法是可以去重的。

```
SELECT count(tag_id) FROM xx.xx GROUP BY tag_id;
```

结果看到的数据是每一个不同的`tag_id`的计数。类似下面这样的数据:

|  count(tag_id)   | 
|  ----  | 
| 1  |
| 1  |
| 1  |
| 1  |
| 4  |
| 1  |
| 6  |

这样的数据显然不是我需要的，我要的数据是统计不同类型的`tag_id`有多少个，而不是每种`tag_id`有多少条记录。

经过搜索发现，`distinct`能满足我的要求。上面的`sql`改为：

```
SELECT count(distinct tag_id) FROM xx.xx GROUP BY tag_id;
```

这样的查询结果就是我想要的。

## 后续
问题虽然是解决了，但是抱着学习的心态，看了一下`distinct`相关的内容。

`distinct`翻译过来就是  `不同的`  类似的意思。

我是把它跟聚合函数`count`放在一起使用了，如果单独使用，其实就是去重的结果。

如果不使用`count`来统计总数，直接使用`distinct`，这个结果与`group by`都是去重的记录。区别就是排序不一样。`group by`会执行排序，而`distinct`不会执行排序。

如果查询的结果带上`limit`子句的话，`distinct`与`group by`都会返回对应的limit数量，不过`group by`的结果也是排序后的结果。

## 性能

`distinct`与`group by`功能类似。我查了一下资料。

>**DISTINCT：**这种方式会将全部内容存储在一个hash结构里，最后通过计算hash结构中key的个数即可得到结果，典型的以空间换取时间的方式。
**GROUP BY：**这种方式是先将字段排序（一般使用sort），然后进行计数，典型的以时间换取空间。

根据这个说法，数据离散程度越大，用`group by`的方式就更高效，反之则是`distinct`更高效。


## 补充更正


