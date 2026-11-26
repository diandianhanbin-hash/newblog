---
title: "Linux下Mysql批量修改表"
publishedAt: "2019-01-08T10:49:06+08:00"
categories: ["代码片段"]
tags: ["mysql"]
path: "/code/Linux下Mysql批量修改表.html"
---

## 背景
在日常的工作中经常会遇到`mysql`分库分表的情况，要修改起来非常麻烦，这里记录一个批量修改的脚本

## 代码

```sh
for i in {00..99}
do
	for j in {0..9}
	do
		mysql -uroot -proot -h xxx.xxx.xxx.xxx -P3306 db_${i} -e"ALTER TABLE table_${j} ADD  field varchar(64) DEFAULT NULL;"
	done
done
echo "modify succ"
```

## 注意
这里只能在`Linux`环境下执行，在`Mac`环境下执行会导致`01`被执行为`1`。