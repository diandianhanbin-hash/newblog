---
title: "理解unittest测试框架（二）框架核心——case"
publishedAt: "2019-12-14T22:12:19+08:00"
categories: ["Python"]
tags: ["Python","unittest"]
path: "/python/理解unittest测试框架（二）—框架核心:case.html"
---

## 背景

上文说到`unittest`框架的入口，知道了多种方式执行`unittest`的时候，框架是如何处理的。
本文会详细说明测试框架的核心，`case`：测试用例是如何构成的。

## 从使用来感知

我们在编写测试用例的有这么几步
1. 需要定义一个类，这个类名以`Test`开头，并且需要继承`unttest.TestCase`。
2. 定义好这个类之后，在这个类中定义以`test`开头的函数。
3. 在这个函数中编写用例

`unittest`测试框架最终会把函数当成一条测试用例去执行。

在执行的过程中，`unittest`测试框架会根据参数来打印不同详细程度的执行日志。

执行完毕后，打印出执行结果是成功或者是失败。

同时，在执行用例主体前，会执行`setUp()`初始化函数，执行用例完毕后，会执行`tearDown()`清理函数。

如果有多条用例，那么就会一直重复以上步骤。

## case的构成

以上的核心就在`TestCase`这个基类。

从代码的结构来看，`TestCase`除了主体的功能，有很大一部分都是断言类的方法。断言类的方法不多展开描述，主要看主体的功能。

* init

在测试的初始化中，主要的功能就是定义一些全局的信息，比较关键的有两个点。

第一，入参中传入`methodName`，默认值是`runTest`。
实际上，在测试套件创建测试用例的时候，会把测试用例的名称(test开头的函数名))传进来，这里后面会用到。

第二，定义了一个清理的容器。
这个在后续，会吧清理方法丢进来，按顺序的去执行清理的工作。

其他功能都是一些断言的方法，或者声明了空的钩子方法。无需特别关注。

* run

这个是需要重点关注的，整个测试执行的编排就是通过这个钩子函数来执行的。我们一段一段来看。

```python
orig_result = result
if result is None:
    result = self.defaultTestResult()
    startTestRun = getattr(result, 'startTestRun', None)
    if startTestRun is not None:
        startTestRun()

self._resultForDoCleanups = result
result.startTest(self)

testMethod = getattr(self, self._testMethodName)
```

最上面的部分是声明了测试结果的对象。这里会调用结果对象的钩子函数，告诉结果对象，测试用例开始执行了，结果对象会通过标准输出的方式把用例启动的信息打出来，关于结果对象，我们后续再看。

第二部分是把`init`方法中的`testMethodName`这个对象动态的加载进来，读者可以用`debug`模式在这里打一个断点。上文也提到了。这个参数其实就是函数名。通过`getattr`方法加载进来这个对象。

接着往下看。

```python
if (getattr(self.__class__, "__unittest_skip__", False) or
    getattr(testMethod, "__unittest_skip__", False)):
    # If the class or method was skipped.
    try:
        skip_why = (getattr(self.__class__, '__unittest_skip_why__', '')
                    or getattr(testMethod, '__unittest_skip_why__', ''))
        self._addSkip(result, skip_why)
    finally:
        result.stopTest(self)
    return
```

这一部分是检查测试用例是否被跳过了，如果发现用例需要跳过，那么就把跳过的原因放到结果对象去，结果对象会把这些数据通过标准输出的方式打到控制台。

在`unittest`中，跳过测试用例的方式是通过`@unittest.skip()`的装饰器来实现跳过执行的，这个`skip`方法也是在`TestCase`所属的`case.py`文件中。

```python
def skip(reason):
    """
    Unconditionally skip a test.
    """
    def decorator(test_item):
        if not isinstance(test_item, (type, types.ClassType)):
            @functools.wraps(test_item)
            def skip_wrapper(*args, **kwargs):
                raise SkipTest(reason)
            test_item = skip_wrapper

        test_item.__unittest_skip__ = True
        test_item.__unittest_skip_why__ = reason
        return test_item
    return decorator
```

这个`skip`的方法，实际上就是给这个测试对象添加`__unittest_skip__`和`__unittest_skip_why__`这两个属性。而测试用例是否跳过执行，就是从测试对象中拿这两个参数来对比。

这些检查做完之后，则是测试用例开始执行的代码了。代码有点长，我们一段一段来看。

```python
try:
    self.setUp()
except SkipTest as e:
    self._addSkip(result, str(e))
except KeyboardInterrupt:
    raise
except:
    result.addError(self, sys.exc_info())
```

这一部分的代码，处理的是当前对象的`setUp()`方法。在`TestCase`中，这个`setUp()`是一个空方法，我们写的时候如果写了`setUp()`方法，那么就相当于在子类中重写了`setUp()`，当然，不管怎样，这个方法都会优先于测试用例本身的代码执行。

这里监听了几个异常，如果有抛错跳过，那么就停止执行，如果监听到了`KeyboardInterrupt`异常，这个异常实际上就是我们在执行的时候按下`Ctrl+C`的信号引发的异常。如果有其他异常，同样的会停止执行。

```python
try:
    testMethod()
except KeyboardInterrupt:
    raise
except self.failureException:
    result.addFailure(self, sys.exc_info())
except _ExpectedFailure as e:
    addExpectedFailure = getattr(result, 'addExpectedFailure', None)
    if addExpectedFailure is not None:
        addExpectedFailure(self, e.exc_info)
    else:
        warnings.warn("TestResult has no addExpectedFailure method, reporting as passes",
                        RuntimeWarning)
        result.addSuccess(self)
except _UnexpectedSuccess:
    addUnexpectedSuccess = getattr(result, 'addUnexpectedSuccess', None)
    if addUnexpectedSuccess is not None:
        addUnexpectedSuccess(self)
    else:
        warnings.warn("TestResult has no addUnexpectedSuccess method, reporting as failures",
                        RuntimeWarning)
        result.addFailure(self, sys.exc_info())
except SkipTest as e:
    self._addSkip(result, str(e))
except:
    result.addError(self, sys.exc_info())
else:
    success = True
```

这里逻辑其实也不复杂，`testMethod`这个对象在`run`方法开始的时候，就被赋值了测试函数作为对象，这里则是执行这个对象。这里有一大堆的异常捕获，有兴趣的读者可以慢慢的去跟踪这些异常。执行完毕如果没有发现异常，则把`success`置为`True`。

用例执行完毕之后需要执行清理函数。

```python
try:
    self.tearDown()
except KeyboardInterrupt:
    raise
except:
    result.addError(self, sys.exc_info())
    success = False
```

这里的逻辑基本上与`setUp()`类似。值得注意的是，如果清理函数执行失败了，用例也会被当成失败的。

如果根据平时写用例来看，到这里似乎流程就跟踪完了。实际上我们看代码之后发现，还没有结束。

```python
cleanUpSuccess = self.doCleanups()
success = success and cleanUpSuccess
if success:
    result.addSuccess(self)
```

这里还调用了一次`doCleanups()`方法。

```python
def doCleanups(self):
    """Execute all cleanup functions. Normally called for you after
    tearDown."""
    result = self._resultForDoCleanups
    ok = True
    while self._cleanups:
        function, args, kwargs = self._cleanups.pop(-1)
        try:
            function(*args, **kwargs)
        except KeyboardInterrupt:
            raise
        except:
            ok = False
            result.addError(self, sys.exc_info())
    return ok
```

这里会循环的把`self._cleanups`中的对象弹出来执行，弹出的数据是这个数组的最后一个对象给弹出来执行。所以自定义清理函数的执行原则是**后进先出**。

上面的这些执行逻辑统一包在一个`try`里面，执行了这些之后，不论结果如果，都会执行最后的工作。

```python
finally:
    result.stopTest(self)
    if orig_result is None:
        stopTestRun = getattr(result, 'stopTestRun', None)
        if stopTestRun is not None:
            stopTestRun()
```

最后的工作实际上就是结果对象的标准输出了。


## FunctionTestCase

在`case.py`文件中，还有一个这个我们基本上很少见到的方法。它同样是`TestCase`的子类。

这个方法的作用其实是一个装饰器，通过这个装饰器，可以吧一个已有的函数变成测试框架兼容的函数，通过源代码我们可以看到这个类中有这样一个方法.

```python
def runTest(self):
    self._testFunc()
```

而在上文中有提到，`TestCase`方法的`methodName`这个参数的默认值是`runTest`。而如果是一个正常的测试用例，这个参数会被传入函数名。而使用这个修饰器的函数，传入的就是默认值。所以在`run`中执行的`testMethodName`就是这个`runTest`方法。


## 总结

本文介绍了`unittest`测试框架中的测试用例是如何运行的。

再次回顾一下，测试用例首先呢通过初始化的时候传入用例名(测试函数名)。通过编排，顺序执行`setUp()`、测试用例主体逻辑、`tearDown()`以及个性化的`doCleanups`。完成一条用例的执行。

## 补充

* 关于`getattr`方法

这个方法其实非常常见，可以**简单的理解**为`反射`、`hook`或者`代理`。通过这种方式可以拿到对象的某个方法的实例。再通过调用的方式来执行对象中的方法。

例如如下代码：

```python
class A(object):
    def test_attr():
        print("hello")
```

这样的一个类，下面两种方式，执行的结果是样的：

```python
a = A()
a.test_attr()


a = getattr(A, 'test_attr')
a()
```

在设计框架的时候，经常会使用到这种机制。相比于第一种方式来看，这种方式更加灵活。即使不知道传入的类是什么。只要这个类有对应的方法就可以执行。