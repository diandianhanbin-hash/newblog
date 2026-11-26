---
title: "理解unittest测试框架（一）从入口说起"
publishedAt: "2019-11-26T22:12:19+08:00"
categories: ["Python"]
tags: ["Python","unittest"]
path: "/python/理解unittest测试框架（一）从入口说起.html"
---

## 背景
作为一名测试人员，自动化测试框架可能是我们日常工作中使用的最多的东西了，以我为例，日常工作中天天打交道的框架就是`unittest`，深入理解`unittest`测试框架的原理，再工作中能避免我们踩到某些大坑。

## 启动方式

`unittest`的启动方式有两种

* `python -m unittest xxx.xxx`
* `unittest.main()`

第一种方式是以命令行的方式，也是我们正常执行用例和调试的时候使用的命令。
第二种方式是代码中编排执行测试用例的时候常用的方法。

## 命令行方式

使用命令行方式，首先得了解，这个`-m` 参数的作用。

[官方文档](https://docs.python.org/2/using/cmdline.html)说明了这个参数是按照模块化的方式执行。
```
-m <module-name>
Search sys.path for the named module and execute its contents as the __main__ module.
Since the argument is a module name, you must not give a file extension (.py). The module-name should be a valid Python module name, but the implementation may not always enforce this (e.g. it may allow you to use a name that includes a hyphen).
Package names are also permitted. When a package name is supplied instead of a normal module, the interpreter will execute <pkg>.__main__ as the main module. This behaviour is deliberately similar to the handling of directories and zipfiles that are passed to the interpreter as the script argument.
Note This option cannot be used with built-in modules and extension modules written in C, since they do not have Python module files. However, it can still be used for precompiled modules, even if the original source file is not available.
```

从这里能看到几个关键点。

* `-m`执行对象是一个包，而不是一个`.py`文件。
* 使用`-m`的方式执行之后，`python`会把当前路径加到`sys.path`中。
* 无法这样执行内建模块

一点一点来分析。

### 第一点
>`-m`执行对象是一个包，而不是一个`.py`文件。

准确的说，`-m`执行的是这个包的`__main__.py` 文件。

例如，新建一个文件夹叫`testmodule`，在文件夹中创建`__init__.py`, `__main__.py`两个文件，在`__main__.py`中添加如下代码.

```python
print "test"
```

然后在文件夹上层执行：`python -m testmodule`，此时输出的内容是：
```
$ python -m testmodule
test
```

所以命令行执行`python -m unittest`的时候，实际上是执行`unittest`包下的`__main__.py`

```python
# unittest中的源代码

import sys
if sys.argv[0].endswith("__main__.py"):
    sys.argv[0] = "python -m unittest"

__unittest = True

from .main import main, TestProgram, USAGE_AS_MAIN
TestProgram.USAGE = USAGE_AS_MAIN

main(module=None)

```

从这类可以看出来，调用`__main__.py`的时候，拿到的是`TestProgram`。从`main`中引入的`main`，其赋值对象是`main = TestProgram`，也就是说，从命令行来运行`unittest`框架，最终运行的类，是`TestProgram`。

### 第二点
>使用`-m`的方式执行之后，`python`会把当前路径加到`sys.path`中

这点其实非常关键，在测试过程中，经常遇到的问题就是在`pycharm`运行的好好的，但是用命令行执行的时候就经常报错包不存在。

例如这样的结构：

```
.
|____testmodel
| |______init__.py
| |______main__.py
|____util
| |______init__.py
| |____sum.py
|______init__.py
|____case
| |______init__.py
| |____test.py
```

在`case`中的`test.py`中引用了`util`下面的`sum`方法。

```python
import unittest
from util import sum

class TestDemo(unittest.TestCase):
    def test_sum(self):
        result = sum.sum(1, 2)
        self.assertEqual(result, 3)
```

在根目录下执行就能正常运行

```
$ python -m unittest case.test.TestDemo.test_sum
.
----------------------------------------------------------------------
Ran 1 test in 0.000s

OK
```

但是在case目录下执行就会报错找不到包。

我们把`sys.path`打出来就能看到。

```
['', '/Library/Python/2.7/site-packages/six-1.12.0-py2.7.egg', '/Library/Python/2.7/site-packages/basedeal-0.0.2-py2.7.egg', '/Library/Python/2.7/site-packages', '/Library/Python/2.7/site-packages/M2Crypto-0.35.2-py2.7-macosx-10.14-intel.egg', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python27.zip', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/plat-darwin', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/plat-mac', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/plat-mac/lib-scriptpackages', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/lib-tk', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/lib-old', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/lib-dynload', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site-packages', '/Library/Python/2.7/site-packages', '/System/Library/Frameworks/Python.framework/Versions/2.7/Extras/lib/python', '/System/Library/Frameworks/Python.framework/Versions/2.7/Extras/lib/python/PyObjC']
```

其中的第一个`""` 就是命令所在的目录。如果直接执行`python xxx.py`则会将这个文件的路径添加到`sys.path`中，这个细微的区别不注意，就会导致经常出现`python`执行的时候经常找不到包。

## 函数方式

函数的方式启动时，运行代码是这样：

```python
import unittest

something....balabala

unittest.main()
```

运行的方法是`unittest`中的`main`方法，跟踪代码可以发现，`main()`方法对应的依然是`TestProgram`。这样就找到了整个测试框架的起点。

## 结语
可以看到，`unittest`不同的启动方式，最终走到的地方是一样的，下一篇，从`TestProgram`开始继续往下看。