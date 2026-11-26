---
title: "理解unittest测试框架（五）——加载模块"
publishedAt: "2020-04-06T22:14:19+08:00"
categories: ["Python"]
tags: ["Python","unittest"]
path: "/python/理解unittest测试框架（五）—加载模块.html"
---

## 背景

前面一系列文章研究了`unittest`框架的一些最小单元，比如用例，结果，这次看的是加载模块，也就是测试用例，是如何被框架加载到的。

## TestLoader

加载模块实际上就是`TestLoader`这个类。

```
- TestLoader
---- loadTestsFromTestCase
---- loadTestsFromModule
---- loadTestsFromName
---- loadTestsFromNames
```

可以看到，在这个类中，最关键的就是以上几个方法。从名字可以看出来，他们分别是从测试用例中加载测试内容，从模块中加载测试内容，从名字中加载测试内容。

再进一步的看代码，可以发现`loadTestsFromNames`方法实际上调用的是`loadTestsFromName`方法。

代码如下

```python
def loadTestsFromNames(self, names, module=None):
    """Return a suite of all test cases found using the given sequence
    of string specifiers. See 'loadTestsFromName()'.
    """
    suites = [self.loadTestsFromName(name, module) for name in names]
    return self.suiteClass(suites)
```

所以，我们从`loadTestsFromName`开始看。

### loadTestsFromName

这个方法有一个入参，也就是name，这个name是我们执行命令行启动时，这样的内容：

```
python -m unittest a.b.c.test
```

而这个`a.b.c.test`就是这个`name`。

```python
if module is None:
    parts_copy = parts[:]
    while parts_copy:
        try:
            module = __import__('.'.join(parts_copy))
            break
        except ImportError:
            del parts_copy[-1]
            if not parts_copy:
                raise
```

这里代码可以看到，如果传入了`module`，那么使用的就是这个`module`。如果没有，那么通过传入的`name`来解析出`module`,这里的`__import__`是一个动态引用的方法，如果引入失败，那么就把最后一层的数据踢掉重新引入，直到引入成功为止。

```python
obj = module
for part in parts:
    parent, obj = obj, getattr(obj, part)
```

接下来，通过循环的方式，找出最终执行的一个`obj`。

```python
if isinstance(obj, types.ModuleType):
    return self.loadTestsFromModule(obj)
elif isinstance(obj, type) and issubclass(obj, case.TestCase):
    return self.loadTestsFromTestCase(obj)
elif (isinstance(obj, types.UnboundMethodType) and
        isinstance(parent, type) and
        issubclass(parent, case.TestCase)):
    name = parts[-1]
    inst = parent(name)
    return self.suiteClass([inst])
elif isinstance(obj, suite.TestSuite):
    return obj
elif hasattr(obj, '__call__'):
    test = obj()
    if isinstance(test, suite.TestSuite):
        return test
    elif isinstance(test, case.TestCase):
        return self.suiteClass([test])
    else:
        raise TypeError("calling %s returned %s, not a test" %
                        (obj, test))
else:
    raise TypeError("don't know how to make test from: %s" % obj)
```

找到这个`obj`之后，就要对这个`obj`进行判定。

如果这个`obj`是一个`module`类型。说明这里测试的是一整个模块。那么就调用`loadTestsFromModule`去加载测试的内容

如果这个`obj`是`TestCase`的子类，那么说明这里是一个测试类，调用`loadTestsFromTestCase`去加载测试的内容。

如果这个`obj`是一个方法，而`parent`是`TestCase`的子类。那么直接用`suiteClass`来组织用例后再返回.

如果`obj`是一个`TestSuite`类型，那么就直接返回这个类型即可。

以上几种情况都是使用`unittest`自己的方法来写的测试用例。还有可能用例是自己写了`call`的方法，`unittest`还需要对这些做一下兼容。

也就是判定这个`obj`的`call`方法是不是`TestSuite`或者`TestCase`的类型，如果是的话，也要吧这部分数据通过一定的方式组织后返回。

从这里其实可以看到，这里加载完的测试数据，都是按照`TestSuite`的方式组织后返回的。

### loadTestsFromTestCase

```python
def loadTestsFromTestCase(self, testCaseClass):
    """Return a suite of all test cases contained in testCaseClass"""
    if issubclass(testCaseClass, suite.TestSuite):
        raise TypeError("Test cases should not be derived from TestSuite." \
                            " Maybe you meant to derive from TestCase?")
    testCaseNames = self.getTestCaseNames(testCaseClass)
    if not testCaseNames and hasattr(testCaseClass, 'runTest'):
        testCaseNames = ['runTest']
    loaded_suite = self.suiteClass(map(testCaseClass, testCaseNames))
    return loaded_suite
```

这里的代码不多，类型判定没问题之后，会调用`getTestCaseNames`这个方法获取测试用例的名字，

`getTestCaseNames`这里的代码不继续贴了，有兴趣的可以自己去看看，这里主要做了几件事：

1. 把`test`开头的函数全部整理出来
2. 按照ASCII码的顺序排列之后返回

再往下，如果没有整理出`test`开头的，但是有`runTest`方法在里面，也就是自定义的测试用例。那么也吧这部分给放到`suite`中返回。

### loadTestsFromModule

```python
tests = []
for name in dir(module):
    obj = getattr(module, name)
    if isinstance(obj, type) and issubclass(obj, case.TestCase):
        tests.append(self.loadTestsFromTestCase(obj))
```

这里的逻辑其实也不复杂，从`module`中读取所有的文件，再从文件中读取所有的类，如果是`TestCase`的子类，那么就调用`loadTestsFromTestCase`方法去加载数据。

```python
load_tests = getattr(module, 'load_tests', None)
tests = self.suiteClass(tests)
if use_load_tests and load_tests is not None:
    try:
        return load_tests(self, tests, None)
    except Exception, e:
        return _make_failed_load_tests(module.__name__, e,
                                        self.suiteClass)
```

同样的，这里还有自定义加载模块的一些内容，如果模块中有`load_tests`来标记加载的内容，那么就按照`load_test`的内容来加载用例。

### discover

`loader`模块还有一个`discover`的函数，这个函数是用来寻找当前路径下所有的测试用例，这个函数的思路和上面是类似的，获取当前地址的绝对地址后，动态的引入，找到`test*.py`这样的文件，再加载其中的测试用例，最后使用`Suite`的形式返回。

由于逻辑类似，这里就不单独的去展开，有兴趣的朋友可以自行阅读。


## 总结

`unittest`的加载模块是一个非常值得学习的源码。从它的设计上来看，整个加载的最终结果，是按照`Suite`返回，原子方法就是`TestCase`的子类加载测试用例。而业务上各种方式也最终回归到`TestCase`上，由`TestCase`来加载出数据，最终统一返回`Suite`。这中方式很值得我们在日常的开发中借鉴。