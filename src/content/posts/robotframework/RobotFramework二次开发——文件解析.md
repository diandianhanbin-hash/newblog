---
title: "RobotFramework二次开发——文件解析"
publishedAt: "2017-12-06T14:13:06+08:00"
categories: ["RobotFramework"]
tags: ["RobotFramework"]
path: "/robotframework/RobotFramework二次开发——文件解析.html"
---

## 背景
今年下半年，基本上都在跟`RobotFramework`打交道了，框架是不错，但是我总是不喜欢`ride`的那套东西，项目大就卡成狗，而且只要更新一次代码，就要重新打开一次项目，特别繁琐，如果能够二次开发，那用起来应该会舒服很多，网上找了一圈没有找到关于`RobotFramework`二次开发的文章，只能自己去看源代码了。当然，不会涉及太多的源码解析，旨在分享能用的代码。

## 环境

如果没有特别交代，默认使用以下版本的`RobotFramework`。

```
Robot Framework 3.0.2 (Python 2.7.10 on darwin)
```

## Robot.Parse
要在`RobotFramework`上做二次开发，那么就必须能够解析`RobotFramework`的文件，最能想到的方式，就是自己写正则去匹配，毕竟`RobotFramework`支持的文件，基本都是文本文件，但是写起来肯定会很蛋疼，还会有一堆bug，幸好，`RobotFramework`已经有了一些内部的`API`，我们可以直接获取到这些数据，所以第一步，先要去看`robot.parse`这个模块，它提供了解析文件的方法。

## 支持类型
`Parse`模块支持文件解析和目录解析。在`Parse`模块中，最主要的方法是`TestData`。源代码如下：

```
def TestData(parent=None, source=None, include_suites=None,
             warn_on_skipped=False, extensions=None):
    if os.path.isdir(source):
        return TestDataDirectory(parent, source).populate(include_suites,
                                                          warn_on_skipped,
                                                          extensions)
    return TestCaseFile(parent, source).populate()
```

从源代码中可以看到，如果给的`source`参数是文件夹，那么就按照`TestDataDirectory`去解析，否则按照`TestCaseFile`去解析，顾名思义，就是文件夹解析和文件解析

## 文件解析
`RobotFramework`支持的文件类型主要是`.robot`和`.txt`，
我们来看`TestCaseFile`的`__init__.py`函数，里面声明了可拿到的值。

```python
class TestCaseFile(_TestData):

    def __init__(self, parent=None, source=None):
        self.directory = os.path.dirname(source) if source else None
        self.setting_table = TestCaseFileSettingTable(self)
        self.variable_table = VariableTable(self)
        self.testcase_table = TestCaseTable(self)
        self.keyword_table = KeywordTable(self)
        _TestData.__init__(self, parent, source)
```

可以很容易的看到，我们可以卡到的值有这么些`directory`,`setting_table`,`variable_table`,`testcase_table`,`keyword_table`,这些其实就是一个`RobotFramework`文件的主体了，其中`variable_table`，`testcase_table`和`keyword_table`都是可迭代的类型，用一个`for`循环就可以拿到这些值。例如这样：

```
test.robot

*** Settings ***
Library     methods.py
Test Setup      get config

*** Variables ***

${test}     123

*** Keywords ***
get config
    log     开始获取配置
    set suite variable     ${config}       config

*** Test Cases ***
test
    log     ${config}


test1
    test
```

这样解析

```python
from robot.parse import TestData

def test():
	suite = TestData(source='test.robot')
	for x in suite.variable_table:
		print '-', x.name

	for y in suite.testcase_table:
		print '-', y.name

	for z in suite.keyword_table:
		print '-', z.name
```

返回的结果如下：

```
- ${test}
- test
- test1
- get config
```

但是`setting_table`不一样，如果去翻源代码，这个类不是一个可迭代的。


```python
class _SettingTable(_Table, _WithSettings):
    type = 'setting'

    def __init__(self, parent):
        _Table.__init__(self, parent)
        self.doc = Documentation('Documentation', self)
        self.suite_setup = Fixture('Suite Setup', self)
        self.suite_teardown = Fixture('Suite Teardown', self)
        self.test_setup = Fixture('Test Setup', self)
        self.test_teardown = Fixture('Test Teardown', self)
        self.force_tags = Tags('Force Tags', self)
        self.default_tags = Tags('Default Tags', self)
        self.test_template = Template('Test Template', self)
        self.test_timeout = Timeout('Test Timeout', self)
        self.metadata = MetadataList(self)
        self.imports = ImportList(self)
```

`__init__`方法里面的值，就是可以获取的内容，比如上面的`test.robot`文件，我定义了一个`Test SetUp`，那么我就可以通过`print suite.setting_table.test_setup.name`这行代码，来拿到`SetUp`的名称。

## 注意
需要特别注意，如果一个`.robot`或者`.txt`文件没有`test_case`,那么这个解析就会报错。

## 目录解析
目录解析实际上，就是获取目录中所有`RobotFramework`支持的文件，当然，这个可以通过初始化`TestData`的时候配置`extensions`参数来过滤，默认是所有`RobotFramework`支持的文件类型。
获取到文件之后，全部转换成一个个文件解析的对象，在目录解析的方法中，会有一个`children`的变量，这个变量会存储目录下所有支持的文件，只要迭代这个变量，再按照文件解析的方法去获取`testcase_table`、`variable_table`或者其他。比如刚刚的目录，按照如下代码来解析，就可以获取到刚刚文件的内容。

```python
def test():
	suite = TestData(source=os.getcwd())
	for x in suite.children:
		print x.name
		for y in x.testcase_table:
			print y.name
```

输出的结果为：

```
Test
test
test1
```

其中第一行为没有后缀的文件名，会把首字母大写。

## 最后
所以回过头来，我们看`ride`，实际上也是用这种方式来获取文件名，方法和内容，然后用表格的形式来呈现。
