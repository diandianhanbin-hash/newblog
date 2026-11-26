---
title: "第一个web自动化"
publishedAt: "2015-12-03T11:06:41+08:00"
categories: ["Python"]
tags: ["Python","unittest"]
path: "/python/第一个web自动化.html"
---

Pyunittest的内容我们看的也差不多了，主体功能大致如此，现在我们来看看selenium如何使用Pyunittest执行自动化测试。

## 本期目标

1. 打开百度，搜索“selenium”，关闭浏览器
2. 打开百度，设置搜索的最大条数为20条（默认是10条），关闭浏览器

## 编写测试案例

先编写我们的测试类，在初始化的时候要做一些处理，代码如下

```python
class Baidu(unittest.TestCase):

	def setUp(self):
		self.driver = webdriver.Chrome()
		self.driver.implicitly_wait(30)
		self.base_url = "http://www.baidu.com"
		self.verificationErrors = []
		self.accept_next_alert = True
```

Baidu类继承unittest.TestCase。初始化中实例化webdriver.Chrome()。

```python
self.driver.implicitly_wait(30)								#表示等待一段时间。
self.base_url = "http://www.baidu.com"			#定义我们测试的地址。
self.verificationErrors = []									#这行定义的是一个错误接受的列表，暂时不用管。
self.accept_next_alert = True							#这行表示接受弹出的alert窗口。
```

### 第一个目标
第一个目标很简单，用ID定位输入框和搜索按钮，具体代码如下

```python
def test_baidu_search(self):
		driver = self.driver
		driver.get(self.base_url + "/")
		driver.find_element_by_id("kw").send_keys("selenium webdriver")
		driver.find_element_by_id("su").click()
		time.sleep(2)
		driver.close()
```

### 第二个目标
第二个目标有点麻烦，首先百度高级设置的地址是"http://www.baidu.com/gaoji/preferences.html"，我们定义的基础地址是“http://www.baidu.com”，要在后面把相关的字符串补齐。之后我们要定位到搜索条数的地方，修改为20.修改完毕之后会弹出一个alert窗口，我们要干掉这个窗口后再关闭浏览器。具体代码如下：

```python
def test_baidu_set(self):
		driver = self.driver

		driver.get(self.base_url+"/gaoji/preferences.html")

		m = driver.find_element_by_name("NR")
		m.find_element_by_xpath("//option[@value='20']").click()
		time.sleep(2)

		driver.find_element_by_xpath("//input[@value='保存设置']").click()
		time.sleep(2)
		driver.switch_to_alert().accept()
```

同理，在这个测试案例中，我们要先引用初始化的driver。定位地址时用Python的字符串拼接方法。

```python
m = driver.find_element_by_name("NR")
m.find_element_by_xpath("//option[@value='20']").click()
```

这两行表示定位到下拉选项为20的这个地方，第一行是定义到这个下拉组件中。

```js
<select name="NR" id="nr">
<option value="10" selected="">每页显示10条</option>
<option value="20">每页显示20条</option>
<option value="50">每页显示50条</option>
</select>
```

上面是这个下拉组件的源码，先定位到这个select组件，再使用xpath的方式定位到20条记录这个下拉选项，调用点击按钮选中这条记录。谷歌浏览器的调试工具可以直接复制这条xpath地址（//*[@id="nr"]/option[2]）也可以直接使用这个来定位。

```python
driver.find_element_by_xpath("//input[@value='保存设置']").click()
```

这条就是直接用xpath方法定位到保存按钮。

```python
driver.switch_to_alert().accept()
```

这条命令就是接受弹出的alert对话框。
### 结束测试时清除的函数
每条测试案例开始时都会打开浏览器，然后执行测试案例。执行完毕后需要关闭浏览器，关闭的方法我们写在清除函数中，具体代码如下：

```python
def tearDown(self):
		self.driver.quit()
		self.assertEqual([],self.verificationErrors)
```

### 开始跑测试案例
最后我们需要吧测试案例跑起来，验证我们写的对不对。在前面的章节已经讲过这里要这么跑了。具体代码如下：

```python
if __name__ == '__main__':
	testunit = unittest.TestSuite()
	testunit.addTest(Baidu('test_baidu_search'))
	testunit.addTest(Baidu('test_baidu_set'))
	runner.run(testunit)
```

## 完整的代码

```python
# -*- coding: utf-8 -*-
from selenium import webdriver
import unittest,time,re

class Baidu(unittest.TestCase):

	def setUp(self):
		self.driver = webdriver.Chrome()
		self.driver.implicitly_wait(30)
		self.base_url = "http://www.baidu.com"
		self.verificationErrors = []
		self.accept_next_alert = True

	def test_baidu_search(self):
		driver = self.driver
		driver.get(self.base_url + "/")
		driver.find_element_by_id("kw").send_keys("selenium webdriver")
		driver.find_element_by_id("su").click()
		time.sleep(2)
		driver.close()

	def test_baidu_set(self):
		driver = self.driver
		driver.get(self.base_url+"/gaoji/preferences.html")
		driver.find_element_by_xpath('//*[@id="nr"]/option[3]').click()
		time.sleep(2)

		driver.find_element_by_xpath("//*[@id='save']").click()
		time.sleep(2)
		driver.switch_to_alert().accept()

	def tearDown(self):
		self.driver.quit()
		self.assertEqual([],self.verificationErrors)


if __name__ == '__main__':
	testunit = unittest.TestSuite()
	testunit.addTest(Baidu('test_baidu_search'))
	testunit.addTest(Baidu('test_baidu_set'))
	runner.run(testunit)

```