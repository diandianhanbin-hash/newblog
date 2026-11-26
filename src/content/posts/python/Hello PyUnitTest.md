---
title: "Hello PyUnitTest"
publishedAt: "2015-12-01T14:50:28+08:00"
categories: ["Python"]
tags: ["Python","unittest"]
path: "/python/Hello PyUnitTest.html"
---

## PyUnitTest是什么

> 作为标准python中的一个模块，是其它框架和工具的基础，参考资料是它的官方文档：http://docs.python.org/2.7/library/unittest.html和源代码，文档已经写的非常好了，我在这里记录的主要是它的一些重要概念、关键点以及可能会碰到的一些坑，目的在于对unittest加深理解，而不是停留在泛泛的表面层上。
> unittest是一个python版本的junit，junit是java中的单元测试框架，对java的单元测试，有一句话很贴切：Keep the bar green，相信使用eclipse写过java单元测试的都心领神会。unittest实现了很多junit中的概念，比如我们非常熟悉的test case, test suite等，总之，原理都是相通的，只是用不同的语言表达出来。

这里吐槽一下，我其实是想研究Appium对移动端的自动化测试，结果发现Appium是基于selenium发展过来的，Python调用selenium自动化测试有比较详细的文档，而Appium文档实在是太少太少，于是我就顺着Appium看到了selenium。看着看着发现，要执行selenium的自动化测试，必须要了解测试框架。于是又开始研究这个Python的unittest测试框架。

## 第一个例子
程序语言都喜欢使用helloworld来开始，这个框架我们也使用这个来作例子吧。

```python
# -*- coding: utf-8 -*-
import unittest

def hello():
	return "hello world"

class testNum(unittest.TestCase):
	def testHello(self):
		self.assertEqual("hello world",hello())


if __name__ == '__main__':
	unittest.main()
```

上面是一个很简单的测试例子。运行的结果如下：

```
.
----------------------------------------------------------------------
Ran 1 tests in 0.000s

OK
[Finished in 0.1s]
```

我们来分析一下这个代码

```python
# -*- coding: utf-8 -*-
import unittest
```

编码类型使用UTF8，引用unittest模块，unittest是Python自带的模块，无需另外安装

```python
def hello():
	return "hello world"
```
功能函数，返回hello world，也是我们的被测试函数

```python
class testNum(unittest.TestCase):
	def testHello(self):
		self.assertEqual("hello world",hello())
```

测试函数，继承unittest.TestCase。里面所有的测试案例都使用test开头，里面的方法self.assertEqual()表示断言两个值相等比如调用hello()函数，我们得到的结果就是hello world。和我们给的预期值相同。运行结果就是成功。如果运行失败，会显示下面的东西

```
F
======================================================================
FAIL: testHello (__main__.testNum)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/Users/svenweng/Desktop/Development/unittest/testcal.py", line 21, in testHello
    self.assertEqual("hello word",hello())
AssertionError: 'hello word' != 'hello world'

----------------------------------------------------------------------
Ran 1 tests in 0.000s

FAILED (failures=1)
[Finished in 0.1s with exit code 1]
[shell_cmd: python -u "/Users/svenweng/Desktop/Development/unittest/testcal.py"]
[dir: /Users/svenweng/Desktop/Development/unittest]
[path: /usr/bin:/bin:/usr/sbin:/sbin]
```

错误提示很明确。AssertionError: 'hello word' != 'hello world'

## 其他方法
assertEqual(a, b)     a == b       
assertNotEqual(a, b)     a != b       
assertTrue(x)     bool(x) is True       
assertFalse(x)     bool(x) is False       
assertIs(a, b)     a is b     2.7  
assertIsNot(a, b)     a is not b     2.7 
assertIsNone(x)     x is None     2.7  
assertIsNotNone(x)     x is not None     2.7 
assertIn(a, b)     a in b     2.7  
assertNotIn(a, b)     a not in b     2.7  
assertIsInstance(a, b)     isinstance(a, b)     2.7 
assertNotIsInstance(a, b)     not isinstance(a, b)     2.7 