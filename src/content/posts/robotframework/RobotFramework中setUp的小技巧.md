---
title: "RobotFramework中setUp的小技巧"
publishedAt: "2017-10-26T11:14:54+08:00"
categories: ["RobotFramework"]
tags: ["RobotFramework"]
path: "/robotframework/RobotFramework中setUp的小技巧.html"
---

## 背景
使用RobotFramework进行测试的时候，经常会需要写一些准备数据的脚本，比如我现在的的脚本框架下，把所有的变量和项目配置都放在服务器上，那么我在执行用例的时候，就必须要去读取这些配置，但是在每个用例都要写一遍这个读取配置的代码，显得很繁琐，偶然的尝试，发现了这个小技巧。

## 往常的做法
正常来说，我们如果要拿到这些配置，必须要执行获取配置的关键字，然后拿到这个关键字的返回值，然后才能执行后续的步骤，比如如下代码：

```
*** Keywords ***
get config
    log     开始获取配置
    [Return]    config

*** Test Cases ***
test
    ${rst}      get config
    log     ${rst}
```

但是这样做会非常麻烦，每个用例在跑的时候，都必须要调用这个关键字，`RobotFramework`提供了`setUp`的方法，但是这个方法是在每个用例开始的时候执行，用来清理环境的，比如用例执行的前置准备，我们的问题是要拿到系统配置的值。在`setUp`执行的时候，下方的用例，没有地方可以拿到值。

## 小技巧
其实`setUp`也是可以拿到值，只是需要做一个简单的动作。如下面的代码：

```
*** Settings ***
Test Setup      get config

*** Keywords ***
get config
    log     开始获取配置
    set suite variable     ${config}       config

*** Test Cases ***
test
    log     ${config}
```

在case中，我们直接打印了`${config}`这个变量，这个变量哪里来的呢？就是在关键字`get config`中的`set suite variable`方法设置了`${config}`变量，然后在`setUp`中执行了`get config`关键字，这个变量就变成了`suite`级别的变量，其他case在执行的过程中就能够直接拿来用了。
