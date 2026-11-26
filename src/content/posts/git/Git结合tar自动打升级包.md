---
title: "Git结合tar自动打升级包"
publishedAt: "2016-07-07T21:34:15+08:00"
categories: ["Git"]
tags: ["Git"]
path: "/git/Git结合tar自动打升级包.html"
---

![IMG_0039](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976533363888.jpg)

近日武汉遭受特大洪水，仿佛又见98年特大洪灾，每次出现天灾，总是一方有难八方支援。为武汉祈福。

次次灾情都有伟大的人民子弟兵站在第一线，向他们致敬。

## 背景
最近在看`Git`，那么看了之后就需要用`Git`来解决一些工作中遇到的问题，学了不能用在工作中，等于白学。

这次遇到的问题是打包升级的问题，我们公司目前还处于最原始的手工打更新包的状况，每次打包都要找开发要更新的内容，非常非常的麻烦，于是我就想用学习的`Git`来解决这个问题。

## 目的
我们的环境有两个，一个是开发环境、另一个是测试环境，那么我希望每次在开发环境都能自动把一个周期内开发改动的内容自动打包出来。我只要`down`下来用`ftp`上传到测试环境就行了。

## 开始
当然，两个环境都需要装上`Git`。装完之后我需要让两个环境的数据同步。所以要先手工处理一次，然后在两个环境打上相同的`Tag`。以后，不管开发提交了几次改动，我只要和我上次使用的`Tag`做比对，就能知道开发做了哪些改动

## 自动打包
自动打包有两个工作要做，第一步要把改动的文件抓出来，第二步要把他们打包。

* 抓出改动的文件

我使用的是diff命令，`Git`中自带了这个功能。

`git diff <原来的版本> <现在的版本> --only-name`

这条命令就能抓出两个版本中不同的内容。

```
README.MD
TestTools/mobile/adb.py
TestTools/mobile/adbconfig.py
TestTools/urls.py
TestTools/views.py
static/bootstrap/bootstrap.min.css
static/img/bodyBg.jpg
static/img/bodyBg2.jpg
static/img/bodyBg3.jpg
static/img/test1.jpg
static/img/test2.jpg
static/js/androidbaseinfo.js
static/js/bootstrap.min.js
static/js/bug.js
static/js/commonfunction.js
static/js/jquery-3.0.0.min.js
templates/TestTools/base.html
templates/TestTools/mobileTest/baseinfo.html
```

比如某次我的工具箱的改动就是这些。

* 自动打包

在`Linux`中，打包的命令是`tar`。

`tar -cvf + <文件名> + <打包的文件名>`就可以把文件打包出来了，那么，我们第一步的操作，不就是把改动的文件名输出出来么？

* 通过管道符连接两个句子

`Linux`中神奇的管道符可谓功能多多。完整的句子如下：

`git diff fff3e56 0685a03 --name-only | xargs tar -cvf update.tar`

这样当前目录就会多出一个update.tar的压缩包。解压缩出来就是这次改动的更新包了。

## 最后
我们的环境是`Windows`的，所以还要研究一下怎么去跑自动化。如果是`Linux`的，那就非常简单了，写一个`shell`脚本就能很轻松的实现自动化更新了。

