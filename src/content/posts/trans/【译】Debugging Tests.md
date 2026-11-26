---
title: "【译】Debugging Tests"
publishedAt: "2016-09-19T08:12:06+08:00"
categories: ["翻译"]
tags: ["iOS","测试","TestingWithXcode"]
path: "/trans/【译】Debugging Tests.html"
---

[原文地址](https://developer.apple.com/library/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/06-debugging_tests.html#//apple_ref/doc/uid/TP40014132-CH6-SW1)

# Debugging Tests
执行测试的时候，所有Xcode提供的debugging工具都可以用来使用。

## Test Debugging Workflow
首先要做的事是要确定引起失败的问题是你测试的内容有bug产生的，还是正在执行的测试方法有bug。测试失败可以指出一些列不同的问题——无论是你的预期，被测代码的要求，或者测试代码本身。所以debugging测试可以产生多个不同的工作流。然而，你的测试方法通常比较小也比较简单，所以首先你最好检查要测试什么，如何执行。

这里有一些常见的问题需要记住：

* 测试的逻辑是否正确？执行是否正确？

一个好的办法是使用测试方法作为基准的预期的标准来检查类型和不正确的值。

* 假设是什么？

例如，你也许可以在测试方法中使用错误的数据类型，为你测试的代码创建一系列的错误。

* 你是否使用了正确的断言来报告通过/失败的状态？

例如，也许测试的场景中需要*XTCAssertTrue*而不是*XCTAssertFalse*，在某些情况下很容易就造出这个错误。

假定你的测试场景是正确的，测试方法也是真确的，那么问题就出在被测试的代码中。是时候来定位和修复它了。

## Test Specific Debugging Tools
当使用测试时，Xcode有许多特殊的工具被设计给你来定位和追踪代码中的bug。

### Test Failure Breakpoint
在测试运行之前，在断点导航器中，点击增加按钮，选择*Add Test Failure Breakpoint*来设置一个特殊的断点。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537778299231252.jpg)

当一个测试方法产生一个错误的断言时，断点会阻止测试运行。在被测代码产生错误之后马上停止执行，这给你机会发现错误产生的位置。你可以在视图中看到*testAddition*这个测试方法通过设置与错误字符串比较的参考标准，被迫断言比较字符串是失败的。测试失败的断点发现失败的断言，在这个点停止了测试执行。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537778391163203.jpg)

当一个测试项这样停止运行，你应该停止执行测试，然后在断言之前设置一个正常的断点。再次运行测试（为了方便和节省时间，您可以使用源代码编辑器中的“运行”按钮来运行此测试），使用debugging操作来修复这个问题。

### Using Project Menu Commands to Run Tests
debugging测试方法是好的时机来记住菜单命令 *Project > Perform Action > Test Again*和*Project > Perform Action > Test*。在运行当前测试方法失败后如果你正在编辑代码修复问题，他们提供一个非常方便的方法复现最后一个测试方法。详细的信息请查看[Using the Product Menu](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/05-running_tests.html#//apple_ref/doc/uid/TP40014132-CH5-SW8).当然你可以使用测试导航器中的运行按钮或者源代码编辑器中的标志或者你发现更多方便的方式来运行测试。

### Assistant Editor Categories
在助手中专门为测试增加了两个类别的编辑菜单。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537778412851925.jpg)

* Test Callers category

如果你刚刚修复一个引发app错误的方法，你可能会想检查该方法在其他测试运行是否成功。问题方法在源码编辑器中，打开编辑助手，在菜单中选择*Test Classes*。一个弹出式菜单将允许您导航到任何调用它的测试方法，以便您可以运行它们，并确保由您的修复的问题还没有回归。

* Test Classes category

这个助手编辑种类和*Test Callers*类似，但是展示了一个含有测试方法的类的列表，在主源码编辑器中引用的类。这是一个很好的方式来确定是否添加测试，例如，仅仅执行你还没有纳入到测试方法中的新方法。

### Exception Breakpoints When Testing
通常来说，当一个断点引发了异常，这个异常会停止测试的执行。所以测试通常运行的时候会被断点异常阻止是为了当端点触发的时候让你定位不正确的地方。当你在回归一个特殊的问题想要停下来修复它的时候你可以启用异常断点。
