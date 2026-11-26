---
title: "理解unittest测试框架（三）——结果处理"
publishedAt: "2020-01-23T13:14:19+08:00"
categories: ["Python"]
tags: ["Python","unittest"]
path: "/python/理解unittest测试框架（三）—结果处理.html"
---

## 背景
前文说到了测试的核心，用例的处理，这篇文章来说说`unittest`框架对于测试结果的处理方式。

从结构上来看，`TestResult`就是一个单独的结果类，所有的逻辑全靠`TestCase`来做调度。所以在看`TestResult`的时候，笔者会结合上一篇文章的内容，来一起看这块内容。

## 开始

### 引入结果

在`case`的最上方，结果函数被直接引入了：

```python
from . import result
```

在TestCase中的默认结果函数，实例化了这个结果类的对象。

```python
def defaultTestResult(self):
    return result.TestResult()
```

### 实例化结果对象

上文说过，`TestCase`执行的时候，调用的是`run`方法，这个方法有一个`result`的参数，默认是`None`，一般来说，不做二次开发，使用的都是默认的参数。

```python
if result is None:
    result = self.defaultTestResult()
```

### 开始执行用例的结果记录

执行的时候调用了startTestRun()方法。这里有个疑问点，这个方法在`result`中其实是一个空方法。

```python
startTestRun = getattr(result, 'startTestRun', None)
if startTestRun is not None:
    startTestRun()
```
在开始执行用例之前，调用了如下方法：

```python
result.startTest(self)

def startTest(self, test):
    "Called when the given test is about to be run"
    self.testsRun += 1
    self._mirrorOutput = False
    self._setupStdout()

def _setupStdout(self):
    if self.buffer:
        if self._stderr_buffer is None:
            self._stderr_buffer = StringIO()
            self._stdout_buffer = StringIO()
        sys.stdout = self._stdout_buffer
        sys.stderr = self._stderr_buffer
```

可以看出，这里实际上做了三件事，一个是测试用例梳理的计数，`testsRun`这个属性在构造的时候，默认给的值是0.

`_mirrorOutput`这个方法其实是一个开关，这个参数与`buffer`是成对的使用，如果`buffer`的值为`True`，那么会把标准输出的内容写到内存中，`_mirrorOutput`值对应的就是在输出结果的时候，把内存中的数据使用标准输出打到控制台。

`_setupStdout`这个方法就是初始化标准输出，如果`buffer`为`True`，那么就把结果写进内存，否则就是正常的打到控制台.

### 用例被跳过的结果处理

再往下走，就是检查用例是否跳过执行，以及执行原因的流程。

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


result.py

def addSkip(self, test, reason):
    """Called when a test is skipped."""
    self.skipped.append((test, reason))

def stopTest(self, test):
    """Called when the given test has been run"""
    self._restoreStdout()
    self._mirrorOutput = False

def _restoreStdout(self):
    if self.buffer:
        if self._mirrorOutput:
            output = sys.stdout.getvalue()
            error = sys.stderr.getvalue()
            if output:
                if not output.endswith('\n'):
                    output += '\n'
                self._original_stdout.write(STDOUT_LINE % output)
            if error:
                if not error.endswith('\n'):
                    error += '\n'
                self._original_stderr.write(STDERR_LINE % error)

        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr
        self._stdout_buffer.seek(0)
        self._stdout_buffer.truncate()
        self._stderr_buffer.seek(0)
        self._stderr_buffer.truncate()
```

这里调用了`result`中的`addSkip`，会记录跳过测试的用例和跳过的原因。用例需要跳过执行，所以最终需要记录用例已经执行结束。

这里可以看到如果测试结果是写到内存的用例，则会在这一步把内存中的执行结果拿出来打到控制台，再执行清理操作，把`sys.stdout`和`sys.stderr`的句柄恢复成标准输出，同时把内存读取的指针指向初始位置，并清空内存数据。

### 调用setUp()

在执行setUp方法的时候，如果其中出现了异常，那么在捕获异常之后，会调用`result.addError(self, sys.exc_info())`方法，记录执行错误的信息。

### 正式执行用例和结果清理

执行用例和结果清理的时候，如果发现有任何异常，同样会记录对应的异常信息。

通过`addError`， `addFailure`，`addSuccess`，`addSkip`，`addExpectedFailure`，`addUnexpectedSuccess`等方法来记录信息。方法与上面都类似，就不单独展开来描述这块信息，有兴趣了解细节的，可以自行阅读对应的源码。

### 执行完毕

执行完毕后会调用结束函数，这部分与跳过执行中的`finally`子句中执行的一致。
同样的，有一个`stopTestRun`空方法也会被调用。

### 自定义清理函数

自定义清理函数的执行结束之后，如果发生异常，同样会调用`addError`方法记录异常信息。

## 结语

`result`的代码复杂度并不高，核心的逻辑就是通过标准输出，把传入的信息给打到控制台。

不过这次看了这部分源代码，发现了`StringIO`的妙用，之前做全局配置的缓存，都是以单例的形式来处理，这个库给了一个新方式，可以写入内存来做全局配置。