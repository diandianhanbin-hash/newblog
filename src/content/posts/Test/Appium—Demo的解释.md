---
title: "Appium—Demo"
publishedAt: "2015-11-30T14:49:22+08:00"
categories: ["Test"]
tags: ["Appium","测试"]
path: "/Test/Appium—Demo的解释.html"
---

# Appium学习之路—demo

```python
from appium import webdriver
desired_caps = {}
desired_caps['platformName'] = 'Android'
desired_caps['platformVersion'] = '4.4.2'
desired_caps['deviceName'] = 'wybtest'
desired_caps['appPackage'] = 'com.android.calculator2'
desired_caps['appActivity'] = '.Calculator'

driver = webdriver.Remote('http://localhost:4723/wd/hub', desired_caps)
```

解释转载自[乙醇大神的博客](http://www.cnblogs.com/nbkhic/p/3805805.html)

，`desired_caps`这个东西按照`demon`来看，其实是一个字典类型的东西，在第二行就定义为一个空字典，之后再34567行加入一些参数。

* `platformName`表示测试使用的系统，Android或者IOS
* `platformVersion`表示测试系统的版本
* `deviceName`表示设备的名称
* `appPackage`表示测试使用的包名，查询的方式可以使用`root`的安卓手机，进入`data/data`查询安装的包名
* `appActivity`表示进入的Acvtivity

还有一些其他的参数`demon`里面没有，乙醇大神列出来了。

* `automationName`表示使用哪种引擎，不填写默认使用appium
* `browserName`表示使用移动浏览器的名称，比如Safari' for iOS and 'Chrome', 'Chromium', or 'Browser' for Android；与app属性互斥。

不过从我目前使用情况来看，只连接一部手机的话，deviceName、platformVersion这种东西可以随便填，我填的值是错的，但是也是可以正常使用的。