---
title: "Appium实战-基类的构建"
publishedAt: "2016-04-26T22:42:58+08:00"
categories: ["Test"]
tags: ["Appium","测试"]
path: "/Test/Appium实战-基类的构建.html"
---

接上文[《Appium实战-开始》](http://wybblog.applinzi.com/blog/article/41/)

## 套用UnitTest构建测试
`UnitTest`是`Python`的测试框架，我们这次的实战就是基于这个测试框架来构建的，所以就把基类用`UnitTest`构建起来。

扫盲，什么是`UnitTest`？怎么用`UnitTest`？

1. [《Hello PyUnitTest》](http://blog.csdn.net/wyb199026/article/details/50129361)
2. [《为你的测试结果打印案例名称》](http://blog.csdn.net/wyb199026/article/details/50130133)
3. [《测试多个类》](http://blog.csdn.net/wyb199026/article/details/50134631)
4. [《测试用例的初始化和结束函数》](http://blog.csdn.net/wyb199026/article/details/50147529)
5. [《引入其他类》](http://blog.csdn.net/wyb199026/article/details/50147571)
6. [《第一个web自动化》](http://blog.csdn.net/wyb199026/article/details/50157897)
7. [《加上测试报告》](http://blog.csdn.net/wyb199026/article/details/50159449)
8. [《测试多个文件》](http://blog.csdn.net/wyb199026/article/details/50160673)

以上是我自己在学习`UnitTest`过程中做的一些记录。

测试案例的颗粒度必须要细，而且测试一个点之后最好进行环境的还原，因此我的基类是这么写的。

新建一个文件叫`BestTestCase`，然后输入下面的代码：

```python

import unittest
from appium import webdriver
import config

class AppTestCase(unittest.TestCase):
	def setUp(self):
		desired_caps = {
			'platformName': config.CONNECT['platformName'],
			'platformVersion': config.CONNECT['platformVersion'],
			'deviceName': config.CONNECT['deviceName'],
			'appPackage': config.CONNECT['appPackage'],
			'appActivity': config.CONNECT['appActivity']
		}
		self.driver = webdriver.Remote(config.CONNECT['baseUrl'], desired_caps)

	def tearDown(self):
		self.driver.quit()

```

这样写，只要其他的测试类来集成这个类就行了，就不用再每个测试类中写`setUp`和`tearDown`了，而且每次测试完功能点后就会自动退出`APP`，还原环境。

导入包有一个`import config`，这个是我做的一个配置文件，命名为`config.py`，我把一些不常修改的参数往这里丢。比如这个初始化的参数，我就这样放了。

```python

config.py

CONNECT = {
	'platformName': 'Android',
	'platformVersion': '4.4.4',
	'deviceName': '5136b01e',
	'appPackage': 'com.weizq',
	'appActivity': 'com.zztzt.android.simple.app.MainActivity',
	"baseUrl": "http://127.0.0.1:4723/wd/hub"
}

```

## 构建通用方法
`UnitTest`的基类构建完之后，我们要对基础的方法做一些封装。

常用的功能大概有这些：寻找元素的各种方法，系统的按键，滑动，获取坐标，截图等。废话不多说，先上代码：

```python

from selenium.webdriver.support.expected_conditions import NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
import time as t
import config

class WebDdriver(object):
	def __init__(self, driver):
		self.driver = driver

	def __str__(self):
		return 'webDdriver'

	def find_element(self, *loc):
		"""
		定位元素,定位正确后返回元素的信息,外部调用传入元组参数必须有*,
		例如:
		find_element(*self.native_caixun)

		:param loc: 元组类型,结构必须是(By.NAME, u'财讯')
		:return: element
		"""
		try:
			element = WebDriverWait(self.driver, 10).until(lambda x: x.find_element(*loc))
			return element
		except NoSuchElementException, e:
			print 'Error details :%s' % (e.args[0])

	def find_elements(self, *loc):
		"""
		定位元素,定位正确后返回元素的信息,外部调用传入元组参数必须有*,
		例如:
		find_elements(*self.native_caixun)

		:param loc: 元组类型,结构必须是(By.NAME, u'财讯')
		:return: elements
		"""
		try:
			# return self.driver.find_elements(*loc)
			elements = WebDriverWait(self.driver, 10).until(lambda x: x.find_elements(*loc))
			return elements
		except NoSuchElementException, e:
			print 'Error details :%s' % (e.args[0])

	def get_title(self):
		"""
		获取页面的标题
		:return: str, 页面的标题
		"""
		title = self.find_elements(*config.COMMON['view_title'])[0].text
		return title

	@property
	def wait(self):
		t.sleep(5)

	def getScreenshot(self, name, url, form='png'):
		t.sleep(2)
		self.driver.get_screenshot_as_file(url + name + "." + form)

	def sysback(self):
		"""
		系统的返回按钮
		:return: None
		"""
		self.driver.keyevent(4)

	def get_size(self):
		"""
		获取当前屏幕的分辨率
		:return: int, x*y
		"""
		size = self.driver.get_window_size()
		return size

	def swipe_to_up(self):
		"""
		从下往上滑动
		:return: None
		"""
		window_size = self.get_size()
		width = window_size.get("width")
		height = window_size.get("height")
		self.driver.swipe(width / 2, height * 3 / 4, width / 2, height / 4, 500)

	def swipe_to_down(self):
		"""
		从上往下滑动
		:return: None
		"""
		window_size = self.get_size()
		width = window_size.get("width")
		height = window_size.get("height")
		self.driver.swipe(width / 2, height / 4, width / 2, height * 3 / 4, 500)

	def swipe_to_left(self):
		"""
		从右往左滑动
		:return: None
		"""
		window_size = self.get_size()
		width = window_size.get("width")
		height = window_size.get("height")
		self.driver.swipe(width / 4, height / 2, width * 3 / 4, height / 2, 500)

	def swipe_to_right(self):
		"""
		从左往右滑动
		:return: None
		"""
		window_size = self.get_size()
		width = window_size.get("width")
		height = window_size.get("height")
		self.driver.swipe(width * 4 / 5, height / 2, width / 5, height / 2, 500)

	def getLocation(self, *loc):
		"""
		获取元素的定位信息,外部调用传入元组参数必须有*,
		例如:
		(*self.native_caixun)
		:param loc: 元素的定位方式
		:return: list, [x, y]
		"""
		locaX = self.find_element(*loc).location.get('x')
		locaY = self.find_element(*loc).location.get('y')
		rst = [locaX, locaY]
		return rst

```

注释我应该写的很清楚了，就把一些比较重要的地方做一些解释，在`init`中先把刚刚构建的`driver`初始化了，让类中的其他方法可以使用`driver`。

两个最重要的方法，`find_element`和`find_elements`做一下重点说明。正常来说，找元素的方法有这么几种，`name`、`id`、`xpath`、`tag`、`class_name`、`link_text`等，但是如果做这么多封装，代码就会显得非常多，当然，如果没有其他办法的话，那就只能老老实实的枚举了，但是如果去看`webdriver`的源码，就能找到这么一个方法。源码是这样的：

```python

class By(object):
    """
    Set of supported locator strategies.
    """

    ID = "id"
    XPATH = "xpath"
    LINK_TEXT = "link text"
    PARTIAL_LINK_TEXT = "partial link text"
    NAME = "name"
    TAG_NAME = "tag name"
    CLASS_NAME = "class name"
    CSS_SELECTOR = "css selector"

    @classmethod
    def is_valid(cls, by):
        for attr in dir(cls):
            if by == getattr(cls, attr):
                return True
        return False

```

那么也就是说，在`webdriver`的方法源码中已经帮我们枚举了，那么我们就可以直接调用这个方法，，做参数传入就行了。方法有做入参检查，因此传入参数要求是tuple的类型，所以元素我就全部剥离出来用配置文件处理，配置文件的内容我们就这样写：

```python

from selenium.webdriver.common.by import By
CAIXUN = {
	'tuijian': (By.NAME, u'推荐'),
	'gupiao': (By.NAME, u'股票'),
	'jijin': (By.NAME, u'基金'),
	'zhaiquan': (By.NAME, u'债券'),
	'xinsanban': (By.NAME, u'新三板'),
	'zixunneirong': (By.ID, 'com.weizq:id/new_title'),  # 财讯记录列表,用find_elements调用
	'imgurl': '/Users/SvenWeng/PycharmProjects/WeStock/img/caixun/',
	'title': [
		['tuijian', 'tuijianneirong'],
		['gupiao', 'gupiaoneirong'],
		['jijin', 'jijinneirong'],
		['zhaiquan', 'zhaiquanneirong'],
		['xinsanban', 'xinsanbanneirong']
	],
	'jiahao': (By.CLASS_NAME, 'android.widget.ImageView'),
	'pindao': (By.ID, 'com.weizq:id/text_item'),
}

```

中间的那些元素就直接这样配置，如果开发进行了一些修改，那么我们就直接改这里就行了。这就是`Page Object`最大的好处了。

## 最后
最底层的构建就先这样处理了。当然还有其他方法需要构建，比如某个页面的元素定位方法。已经方法的调用。