---
title: "Android日志相关"
publishedAt: "2016-03-01T14:48:30+08:00"
categories: ["Test"]
tags: ["Android","测试"]
path: "/Test/Android日志相关.html"
---

## 使用环境
电脑是**MacBook**，已经安装adb环境。

## 抓取命令
`adb logcat >/Users/svenweng/Desktop/aaa.log`这条命令表示抓取安卓手机中的所有日志，然后输出到`aaa.log`这个文件中，`Windows`系统的路径也类似，填写绝对路径。一旦这样打出日志后，你只要在手机上发起某些操作，就能够实时的看到。在`Unix`或者`Linux`系统上，可以使用`tail -f aaa.log`来实时打出日志。所有被推动到`aaa.log`的日志都会实时打出来。

### 根据进程过滤

操作类似`Unix`的命令，使用`|grep`来过滤。`adb logcat |grep 4333>/Users/svenweng/Desktop/aaa.log`，这样就只会打印`4333`这个进程的日志。
查询进程的方式很简单.输入`adb shell top | grep 包名`。如下所示：

> SvenWengdeMacBook-Pro:~ svenweng$ adb shell top | grep com.weizq
 > 7253  0  14% R    28 950800K  46000K  fg u0_a524  com.weizq
 > 7253  1  16% S    28 950800K  46000K  fg u0_a524  com.weizq
 > 7253  1   0% S    28 950800K  46000K  fg u0_a524  com.weizq
 
 上面显示的第一列就是`com.weizq`的进程（PID）
 
### Log的种类

`Android`一般来说使用的Log类型有这么几个：

> Log.v() Log.d() Log.i() Log.w() ， Log.e()以及Log.a() (android 4.0新增加的)。根据首字母对应：VERBOSE，DEBUG,INFO,WARN，ERROR,Assert。
 
 过滤的命令如下：
 
 ```
adb logcat *:e |grep PID
 ```
 
 命令中的*:e就表示查看Log.e()的日志，同样可以使用grep命令来根据进程过滤需要的信息
 
### Log的产生

> 什么时候会有Log文件的产生？
> Log的产生大家都知道， 大家也都知道通过DDMS来看log（这个就不用说了），但什么时候会产生log文件呢？一般在如下几种情况会产生log文件。 
> 1，程序异常退出，uncausedexception      （Fatal）
> 2，程序强制关闭，ForceClosed (简称FC)       （Fatal）
> 3，程序无响应，ApplicationNo Response（简称ANR)

* ANR

ANR产生的原因如下：1、界面操作按钮的点击等待响应时间超过5秒。2、HandleMessage回调函数执行超过10秒，BroadcasterReciver里的onRecive（）方法处理超过10秒
