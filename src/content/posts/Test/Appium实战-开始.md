---
title: "Appium实战-开始"
publishedAt: "2016-04-25T19:23:12+08:00"
categories: ["Test"]
tags: ["Appium","测试"]
path: "/Test/Appium实战-开始.html"
---

## 初衷
最近研究了挺多有关于`Appium`的东西。也写了一些`Appium`的学习笔记。

1. [《Appium——驱动和常用功能的封装》](http://wybblog.applinzi.com/blog/article/35/)
2. [《Appium——处理混合APP中H5的操作》](http://wybblog.applinzi.com/blog/article/34/)
3. [《Appium——无安卓源码的一些准备》](http://wybblog.applinzi.com/blog/article/33/)
4. [《Appium学习之路—环境搭建》](http://wybblog.applinzi.com/blog/article/25/)

相信很多人和我一开始一样，都会觉得学习文档太少了，但是没什么基础的又看不懂别人写好的代码，官方的`demo`比较简单等等问题，不知道怎么走下去。

其实最大的坎还是在自己，只要开始写，一边写一边`Google`，慢慢的会发现很其实并不难。

`Appium`实战我打算记录自己写自动化的过程。希望对新司机有帮助。

**注：整个流程是按照Page Object来写的，直接撸代码的请看[《Appium——驱动和常用功能的封装》](http://wybblog.applinzi.com/blog/article/35/)然后自己撸代码**

## 几种设计模式
### 线性模式
我称呼它为撸代码，也就是按照业务逻辑直接`hard code`。基本上初学者都会这样折腾，当然，折腾了一段时间就会觉得很操蛋，自己都不想看自己写的代码。

### Page Object
比较流行的设计模式，高度解耦，初学者看起来会觉得有点操蛋，但是了解了逻辑之后，会发现这样做非常棒，维护起来简直是轻松加愉快。

### 通用框架
通用框架就是比较高级的做法了，实施起来比较麻烦，如果水平到了，这种方式肯定是最好的，利用关键字来驱动程序，是比较高级的境界。缺点就是比较难。。。。

## 设计思路
整个设计思路是基于`Page Object`模式，如下图：

![设计图](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379771769997609.jpg)

什么是`Page Object`？

> When you write tests against a web page, you need to refer to elements within that web page in order to click links and determine what's displayed. However, if you write tests that manipulate the HTML elements directly your tests will be brittle to changes in the UI. A page object wraps an HTML page, or fragment, with an application-specific API, allowing you to manipulate page elements without digging around in the HTML.

原来是`Web`端的模式，搬到移动端来，就是把页面分拆成一个一个元素，如示意图所示，我拆分为元素数据、元素定位、元素操作、测试步骤这么些东西。

## 有什么好处？
这种模式整个架构看起来比直接撸代码复杂了很多，不过当遇到一些坑爹的问题时，尤其开发频繁改动的时候，这种设计模式的优势就出来了，比如开发改了元素的ID那些东西，那么我们只要修改相应ID就行了，所有和这个元素相关的都直接关联修改了，，而直接撸代码，涉及到的地方可能会有很多，改动起来很麻烦。查找方法，测试步骤什么的都不用改，维护起来相对轻松。

## 一些环境
简单列一下我的环境吧：

***

系统：Mac OS X EI Capitan

Python: 2.7

Appium: 1.4.16

IDE: PyCharm

测试系统：Android

测试对象：微证券（应用商店可以直接下载）

***

我的项目结构：

```
|____config.py
|____Data
| |____data.json
|____img
| |____.DS_Store
| |____caixun
| | |____gupiao.png
| | |____gupiaoneirong.png
| | |____jijin.png
| | |____jijinneirong.png
| | |____tuijian.png
| | |____tuijianneirong.png
| | |____xinsanban.png
| | |____xinsanbanneirong.png
| | |____zhaiquan.png
| | |____zhaiquanneirong.png
| | |____黄金.png
|____Report
|____test.py
|____TestCase
| |______init__.py
| |____common.py
| |____testCaixun.py
|____View
| |______init__.py
| |______init__.pyc
| |____BaseTestCase.py
| |____BaseView.py
| |____Caixun.py

```

大的目录我是这么划分的：

1. Data 用来放置一些数据
2. Report 存放测试报告
3. TestCase 存放测试用例
4. img 存放一些截图
5. config.py 配置文件

当然写到后续可能会做一些调整，毕竟我才刚刚开始写。

## 一些忠告
1. 一些很弱智的问题就自己去`Google`，比如`Appium`怎么开始啊，怎么学啊，环境怎么搭建啊！
2. 多用`Google`
3. `StockOverflow`是个好地方
4. 多写、多写、多写
5. 人脑不是万能的，遇到问题解决后记录下来才是王道
