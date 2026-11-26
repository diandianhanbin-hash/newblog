---
title: "理解unittest测试框架（四）——执行模块"
publishedAt: "2020-02-24T21:14:19+08:00"
categories: ["Python"]
tags: ["Python","unittest"]
path: "/python/理解unittest测试框架（四）—执行模块.html"
---

## 背景

前文讨论了很多关于用例组织相关的内容，这里看看`unittest`的执行模块。执行模块的内容不多，这里我们带着生成测试报告的`HTMLTestRunner.py`的逻辑一起来看看执行模块。

## 开始

执行模块就只有两个大类`TextTestResult`和`TextTestRunner`，其中`TextTestRunner`是执行的主要模块，我们从这里开始看。

执行用例就需要写结果，因此，这两块功能是一体的，在执行类的开始就声明了结果类，如果没有传入结果类，那么就使用默认的`TextTestResult`来处理结果。

```python
def __init__(self, stream=sys.stderr, descriptions=True, verbosity=1,
                failfast=False, buffer=False, resultclass=None):
    self.stream = _WritelnDecorator(stream)
    self.descriptions = descriptions
    self.verbosity = verbosity
    self.failfast = failfast
    self.buffer = buffer
    if resultclass is not None:
        self.resultclass = resultclass
```

这里可以看到，默认是按照标准输出来输出的。

init方法之后，就是run方法了。

```python
def run(self, test):
    "Run the given test case or test suite."
    result = self._makeResult()
    registerResult(result)
    result.failfast = self.failfast
    result.buffer = self.buffer
    startTime = time.time()
    startTestRun = getattr(result, 'startTestRun', None)
    if startTestRun is not None:
        startTestRun()
    try:
        test(result)
    finally:
        stopTestRun = getattr(result, 'stopTestRun', None)
        if stopTestRun is not None:
            stopTestRun()
    stopTime = time.time()
    timeTaken = stopTime - startTime
    result.printErrors()
```

这里可以看到，在调用执行之前，做了一些结果类的注册和处理。再往下都是一些结果处理的逻辑，比如发现有跳过的用例，要把这部分信息打到`stream`里面，类似这样的逻辑由一堆，有兴趣的朋友可以自行阅读.

## HTMLTestRunner

`HTMLTestRunner.py`是一个unittest测试报告的输出类，这个是第三方编写的，我们可以通过这个方法，来看看执行类是这么调用的。

`HTMLTestRunner.py`生成的报告是一个`html`格式的报告，从代码和介绍中都能看的出来，生成`html`的方式其实是通过硬编码`html`的模板，然后在这个模板填充执行结果的数据。

主类HTMLTestRunner继承了Template_mixin，Template_mixin实际上就是我们说的硬编码的模板。

我们在调用的时候，代码通常是这样的：

```python
filename = os.getcwd() + "/xxx_{tm}.html".format(
        tm=time.strftime("%Y-%m-%d %H%M%S"))

fp = file(filename, "wb")
runner = HTMLTestRunner.HTMLTestRunner(
    stream=fp,
    title="xxx_{tm}.html".format(tm=time.strftime("%Y-%m-%d %H%M%S")),
    description=u'本次测试的案例数为：' + str(x) + u'条'
)
runner.run(testunit)
```

首先按照实际定义文件名，确保文件名不重复，接着定义一个文件句柄。然后初始化主类`HTMLTestRunner`，把文件句柄，标题和描述传进去，最后调用`run`方法。

```python
def __init__(self, stream=sys.stdout, verbosity=1, title=None, description=None):
    self.stream = stream
    self.verbosity = verbosity
    if title is None:
        self.title = self.DEFAULT_TITLE
    else:
        self.title = title
    if description is None:
        self.description = self.DEFAULT_DESCRIPTION
    else:
        self.description = description

    self.startTime = datetime.datetime.now()
```

通过代码可以看到，传入的文件句柄，就是stream，默认是标准输出，传入文件句柄后，则会把内容输出到文件中。详细程度默认是1.

接着是执行方法。

```python
def run(self, test):
    "Run the given test case or test suite."
    result = _TestResult(self.verbosity)
    test(result)
    self.stopTime = datetime.datetime.now()
    self.generateReport(test, result)
    print >>sys.stderr, '\nTime Elapsed: %s' % (self.stopTime-self.startTime)
    return result
```

我们这边传入的test实际上是testSuite。这里的run方法一开始注册的结果类_TestResult 集成自TestResult。

可以看到，重写的方法中：

```python
def startTest(self, test):
    TestResult.startTest(self, test)
    # just one buffer for both stdout and stderr
    self.outputBuffer = StringIO.StringIO()
    stdout_redirector.fp = self.outputBuffer
    stderr_redirector.fp = self.outputBuffer
    self.stdout0 = sys.stdout
    self.stderr0 = sys.stderr
    sys.stdout = stdout_redirector
    sys.stderr = stderr_redirector
```

重新定义了句柄。把标准输出的内容替换成输出到的文件的句柄

```python
class OutputRedirector(object):
    """ Wrapper to redirect stdout or stderr """
    def __init__(self, fp):
        self.fp = fp

    def write(self, s):
        self.fp.write(s)

    def writelines(self, lines):
        self.fp.writelines(lines)

    def flush(self):
        self.fp.flush()

stdout_redirector = OutputRedirector(sys.stdout)
stderr_redirector = OutputRedirector(sys.stderr)
```

而句柄的声明，实际上是这个文件。

句柄处理完之后，开始执行用例，执行完毕之后，调用generateReport来吧结果写入文件。

```python
def generateReport(self, test, result):
    report_attrs = self.getReportAttributes(result)
    generator = 'HTMLTestRunner %s' % __version__
    stylesheet = self._generate_stylesheet()
    heading = self._generate_heading(report_attrs)
    report = self._generate_report(result)
    ending = self._generate_ending()
    output = self.HTML_TMPL % dict(
        title = saxutils.escape(self.title),
        generator = generator,
        stylesheet = stylesheet,
        heading = heading,
        report = report,
        ending = ending,
    )
    self.stream.write(output.encode('utf8'))
```

这里实际上就是把之前硬编码的html做一个组装，然后调用stream，也就是我们传入的文件句柄进行数据写入。

实际上HTMLTestRunner也是支持命令行的方式，不过命令行的启动方式目前只支持原生的启动方式。

```python
class TestProgram(unittest.TestProgram):
    """
    A variation of the unittest.TestProgram. Please refer to the base
    class for command line parameters.
    """
    def runTests(self):
        # Pick HTMLTestRunner as the default test runner.
        # base class's testRunner parameter is not useful because it means
        # we have to instantiate HTMLTestRunner before we know self.verbosity.
        if self.testRunner is None:
            self.testRunner = HTMLTestRunner(verbosity=self.verbosity)
        unittest.TestProgram.runTests(self)

main = TestProgram
```

这里作者的注释也声明了，目前还没有实现个性化的启动方式。