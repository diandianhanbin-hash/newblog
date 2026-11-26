---
title: "Appium--无安卓源码的一些准备"
publishedAt: "2016-03-18T09:37:51+08:00"
categories: ["Test"]
tags: ["Android","测试","Appium"]
path: "/Test/Appium--无安卓源码的一些准备.html"
---

准备工作其实是比较简单了，现阶段我测试的是安卓，所以就需要准备一台安卓手机了，在环境准备中已经把电脑的环境变量配置完毕了，所以现在需要的就是一些安卓测试的一些前奏知识。

## 环境

***

操作系统：Mac OS X EI Caption 

Appium: 1.4.16

Java: java version "1.7.0_79"

node.js: v5.3.0

npm: 3.3.12

一切的前提，需要配置好环境

***

## 获取包名
我这里假设是我们都没有源码的情况下，有源码当然比较简单，如果只有一个apk文件，我们要获取包名的方式也一样很简单。在终端中输入下列命令：

```
adb logcat ActivityManager:I *:s
```

然后打开需要测试的APP，找到topActivity.packageName，里面就是待测应用的包名了。

![示例](<https://ww3.sinaimg.cn/mw690/811987cbgw1f20rbgiuv4j20wi0kcqcu.jpg>)

这条命令的实质就是Android手机的日志打印之后，通过管道符过滤，LInux也同样有效，Windows可能就没办法使用这条命令了，当然，windows的朋友可以使用管道符之前的命令，然后找到topActivity.packageName。也同样可以获取到包名。

## 当前Activity
同样是无源码，也可以通过命令来获取当前Activity。

```
Mac/Linux： adb shell dumpsys window windows | grep mFocusedApp
Windows: adb shell dump sys window windows  并且手动查找mFocusedApp行
```

效果如下图：

![效果图](<https://ww1.sinaimg.cn/mw690/811987cbgw1f20ri5te6xj21kw11ok72.jpg>)

## 获取页面元素
Appium和Selenium一样，需要通过一些元素来定位，达到自动化测试的目的，这里我使用的是Android Studio里面的一个工具：Android Device Monitor。

这个工具可以获取屏幕快照，然后点击相关元素就可以获得上面的信息了，如下图所示：

![示例图](<https://ww1.sinaimg.cn/mw690/811987cbgw1f20rlzwtwwj21kw103thr.jpg>)

## 最后
熟悉使用这些东西，我们就可以开始Appium之旅了。



