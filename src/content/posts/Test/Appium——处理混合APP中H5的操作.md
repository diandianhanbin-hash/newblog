---
title: "Appium——处理混合APP中H5的操作"
publishedAt: "2016-03-22T20:56:54+08:00"
categories: ["Test"]
tags: ["Android","测试","Appium"]
path: "/Test/Appium——处理混合APP中H5的操作.html"
---

## 背景
自己自学`Appium`测试公司的APP有一段时间的，`Android`原生的元素定位，包括数据处理和逻辑判断也基本上搞熟了，但是公司的APP很坑爹，开发过程中存在混合开发的情况，这就意味着我必须要处理APP里面的webview，真的是很坑爹的东西。

***

操作系统：Mac OS X EI Caption

Appium: 1.4.16

Java: java version "1.7.0_79"

node.js: v5.3.0

npm: 3.3.12

手机：小米NOTE4

待测应用： 微证券

***

## 常规方法
正常来说，常规的方法应该是使用`UI Automator Viewer`来探测页面的元素，比如下面这样：

![页面元素](<https://ww1.sinaimg.cn/mw690/811987cbgw1f20rlzwtwwj21kw103thr.jpg>)

但是，如果是混合开发，就会出现只有一个`webview`元素的情况，正常的方法无法定位。比如这样：
![webview](<https://ww3.sinaimg.cn/mw690/811987cbgw1f25r2354hcj21d4120n6k.jpg>)

常规的方法是没办法定位出这部分内容，只有一个webview，无法像原生一样获取内容。

## 取巧的办法
如果针对H5的元素，只需要点击的话，可以这么做，比如上文我们的开户页面，我们需要做的只是在这个页面上点击立即开户，跳转到下一个页面，我们可以用这种取巧的方法：

```python
self.driver.get_name('立即开户').click()
```

这样的代码，也是可以实现的，当然，上面的get_name我是进行封装了的，原来的代码是：

```python
def get_name(self, name):
        element = self.driver.find_element_by_name(name)
        return element
```

## 更优化的处理方式
既然是H5页面，如果能够获取HTML代码就好了，那么就可以使用操作DOM的方式来操作这个H5。

***

谷歌浏览器：版本 49.0.2623.87 (64-bit)

***

我用的谷歌浏览器是这个版本，把手机连接上电脑，在谷歌浏览器中输入这个代码：

```
chrome://inspect
```

点击这个按钮：

![inspect](<https://ww1.sinaimg.cn/mw690/811987cbgw1f25rku93r2j21kw176grv.jpg>)

神奇的一幕出现了，所有的代码都展示在你面前。就像web一样调试混合APP中的H5.

## 切换webdriver
虽然解决了html代码的问题，但是另一个问题出现了，我们要怎么去操作DOM。常规的方法是没办法了，只能操作原生的，这个时候我们需要把webdriver切换成H5的，而不是原生的。

其实原理很简单，只要把`webdriver`切换到H5的方式就行了。使用如下代码：

```python
contexts
contexts(self):

    Returns the contexts within the current session.
    返回当前会话中的上下文，使用后可以识别H5页面的控件

    :Usage:
        driver.contexts
用法 driver.contexts
```

调用这个方法后，把结果打印出来，你会发现是一个列表，列表中的第一个是NATIVE_APP，这个就表示现在的`webdriver`是调用原生的功能，我们使用这个命令切换一下就行了。

```python
def switch_h5(self):
        self.driver.execute(MobileCommand.SWITCH_TO_CONTEXT, {"name": "WEBVIEW_com.weizq"})

    def switch_app(self):
        self.driver.execute(MobileCommand.SWITCH_TO_CONTEXT, {"name": "NATIVE_APP"})
```

第一个函数就是封装切换到H5的方法，`name`对应的东西就是通过`contexts`列表中打印出来的东西，当然你也可以使用其他的方法封装。

切换到H5的`webdriver`之后，再使用`driver.find_element_by_id`试试？现在就变成查找DOM相关的功能了，再调用第二个函数，又切回原生的`webdriver`了。