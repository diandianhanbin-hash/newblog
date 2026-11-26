---
title: "【译】QuickStart"
publishedAt: "2016-07-15T17:11:37+08:00"
categories: ["翻译"]
tags: ["iOS","测试","TestingWithXcode"]
path: "/trans/【译】QuickStart.html"
---

原文地址：[https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/02-quick_start.html#//apple_ref/doc/uid/TP40014132-CH2-SW1](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/02-quick_start.html#//apple_ref/doc/uid/TP40014132-CH2-SW1)

## 文章导读
本篇介绍了Xcode执行测试的方法，说明了Xcode工具如何新建、执行一个测试用例。

看完之后你能学习到：

* 如何使用Xcode来创建一个测试用例。

* 如何执行测试用例

* 如何观察Xcode的测试结果

## 声明
文章翻译自Apple官方文档《Testing with Xcode》，不保证每个字都能翻译的精准，如有翻译错误，请留言指出，不胜感激。

# QuickStart

这个快速入门是为了告诉你，你可以很容易的给你开发的软件做一些必须的测试。

## 介绍测试导航菜单
当你开始测试工作的时候，你经常会使用Xcode的导航器。

测试导航菜单是工作区的一部分，是让你便捷的创建，管理，运行和检视测试代码。你可以点击在issue导航和debug导航中间的的图标进入测试导航菜单。当你有一个项目，其中的测试内容已确定，如下图你可以在这里看到类似的导航菜单。

![twx-qs-1_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537975844451945.jpg)

上图中的测试导航菜单举例展示了以列表的形式分级测试包，类型，以及方法。这个项目是一个类似计算器的app。计算器的核心是以一个框架来执行代码，可以看到优先级最高的`SampleCalcTests`测试包，是为了测试应用的代码。

***

**注意：**Xcode的测试目标会生成测试包，并展示在测试导航菜单中。

如果你测试时使用数据，图片和其他内容，他们可以被添加到测试包，在执行的时候使用`NSBundle`APIs实现存取。使用`+[NSBundle bundleForClass:]`和你的测试类时，区分类型，以确保得到正确的测试包来检索数据。更多详情请看[NSBundle Class Reference](https://developer.apple.com/reference/foundation/nsbundle).

Xcode执行计划会所控制构建的内容。执行计划也会控制可用的测试方法来执行测试操作。你可以在测试菜单中使用Control-clicking以及通过快捷菜单来有选择的使用或者忽略测试包，类和方法。

***

在视图中被激活的测试包是`SampleCalcTests. SampleCalcTests`，它包含了一个测试包，轮换着控制（使用）九种测试方法。当你把鼠标放在列表中任意一项上，这是一个快速的方式来运行一个测试包中所有的测试项、一个类中所有的测试项、或者任意一个单独的测试。测试结束后会返回成功或失败的结果给Xcode。当测试被执行时，这些图标会更新，给你展示测试的结果。绿色对勾表示通过，红色叉叉表示失败。这里测试导航菜单显示的测试结果，有两项被断言为失败。

![twx-qs-2_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537975866692873.jpg)

点击列表中任意一个测试类或者测试方法，会在代码编辑器中打开对应的测试类。测试类和测试方法也会在编辑器中做上标记。工作原理和在测试导航菜单上一样。测试失败会在代码编辑器中展示有关联断言的结果字符串。

在测试菜单的底部是增加按钮和过滤控制，你可以减少展示的内容，只显示活动的测试项或者只展示失败的测试，当然，你也可以按照名称来过滤。

更多测试导航菜单的详细信息，请看*Test Navigator Help*。

## 为你的APP增加测试方法
在Xcode5和以后的版本中你在新建app，框架和资源的时候会预设一个测试的目标。当你开始一个新的项目时打开测试导航菜单，你可以看到一个测试包，一个测试类和一个测试方法的模板。但是你可能会从一个Xcode早期版本中打开一个预先存在的项目，此项目没有确定的测试目标。这里的工作流程假设一个之前的项目是没有纳入测试的。

### 创建一个测试目标
点击测试导航菜单左下方的增加按钮来选择新建一个`Unit Test Target`

![twx-qs-3_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379758897142.jpg)

在下一个对话框中选择OS X或者IOS`Unit Testing Bundle`，然后点击`Next`。会出现一个新的对话框，编辑项目名称和其他你需要的参数。

![twx-qs-4_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379759086501.jpg)

点击`Finish`来增加你的target，在测试导航菜单师徒中包含了一个测试类的模板和两个测试方法的模板

### 运行测试和观察结果
现在你已经为你的项目增加测试方法了。你想要开发一些有用的测试方法。但是首先，先把鼠标放到测试导航菜单的`SampleCalcTests`上并点击运行按钮来执行所有的测试方法。测试结果会在函数名的旁边用绿色的标记标记出来，在代码编辑器中也一样。

![twx-qs-6_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537975927083082.jpg)

模板中的单元测试和演示的测试方法都是空的。这就是为什么他们都会被标记为成功，没有失败的断言。注意34行灰色菱形`measureBlock:`方法。点击菱形来展示演示结果的面板。

![twx-qs-7_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537975947987968.jpg)

面板允许你设置一个预期的基线、编辑基线和最大STDDEV参数。这些特点稍后会讨论。

### 编辑测试案例再次运行
由于这个样本项目是一个计算器APP，你想要检查它能否正确的执行加减乘除和其他计算功能。由于测试是在app项目内部构建，你可以增加所有你愿意增加的测试情景在程序的任意层。创建测试要做的事就是给整个单元添加函数来测试实现文件。

例如。你插入如下`#import`和给`SampleCalcTests.m`增加变量

```
#import <XCTest/XCTest.h>

//

// Import the application specific header files

#import "CalcViewController.h"

#import "CalcAppDelegate.h"

 

@interface CalcTests : XCTestCase {

// add instance variables to the CalcTests class

@private

    NSApplication       *app;

    CalcAppDelegate     *appDelegate;

    CalcViewController  *calcViewController;

    NSView              *calcView;

}

@end

```

然后给测试方法一个描述的名称，就像`testAddition`一样，然后为方法增加一个执行的代码。

```
- (void) testAddition

{

   // obtain the app variables for test access

   app                  = [NSApplication sharedApplication];

   calcViewController   = (CalcViewController*)[[NSApplication sharedApplication] delegate];

   calcView             = calcViewController.view;

 

   // perform two addition tests

   [calcViewController press:[calcView viewWithTag: 6]];  // 6

   [calcViewController press:[calcView viewWithTag:13]];  // +

   [calcViewController press:[calcView viewWithTag: 2]];  // 2

   [calcViewController press:[calcView viewWithTag:12]];  // =

    XCTAssertEqualObjects([calcViewController.displayField stringValue], @"8", @"Part 1 failed.");

 

   [calcViewController press:[calcView viewWithTag:13]];  // +

   [calcViewController press:[calcView viewWithTag: 2]];  // 2

   [calcViewController press:[calcView viewWithTag:12]];  // =

    XCTAssertEqualObjects([calcViewController.displayField stringValue], @"10", @"Part 2 failed.");

}

```

注意测试导航菜单中样例的测试方法，`testExample`被替换成了`testAddition`。

![twx-qs-8_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537975965611209.jpg)

现在点击测试导航菜单中的运行按钮（或者代码编辑器中的指示）来运行`testAddition`方法。

![twx-qs-9_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/153797598856436.jpg)

就像你看到的一样，一个断言失败了，在测试导航菜单和代码编辑器中都高亮显示了。看源代码。Part 1成功了，是Part 2有一个问题。在相近的测试中，错误很明显：在76行，`[calcView viewWithTag:11]`错了。应该是`[calcView viewWithTag:12]`。收集错误信息修复问题后，测试成功。

![twx-qs-8a_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976062331423.jpg)

### 为普通的代码使用setUp()和tearDown()方法
Xcode为活动的测试包运行所有的测试方法一次。在这个小例子中只有一个方法执行了。它需要获得三个计算器app提供的变量对象来运行。如果你写了四个或者五个测试方法在同样的类中。你会发现你需要为每一条测试案例输入重复的代码来获得app的运算结果。XCTest框架提供给你来运行测试类，`setUp`和`tearDown`的实例方法，你可以用他们来放置每次执行测试方法的前置方法和结束方法。

使用`setUp`和`tearDown`方法很简单。从`Mac_Calc_Tests.m`文件中的`testAddition`代码中剪切4行`// obtain the app variable for test access`然后粘贴他们到模板默认的`setUp`实例方法中。

```
- (void)setUp

{

    [super setUp];

    // Put setup code here. This method is called before the invocation of each test method in the class.

 

   // obtain the app variables for test access

   app                  = [NSApplication sharedApplication];

   calcViewController   = (CalcViewController*)[[NSApplication sharedApplication] delegate];

   calcView             = calcViewController.view;

}

```

现在增加更多只使用最少代码的测试方法——`testSubtraction`和其他方法。

![twx-qs-10_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/153797610154141.jpg)

## 总结
从这个简短的快速入门你可以看到，它给项目增加测试是非常简单的。这里有一些需要注意的地方：

* Xcode能建立绝大多数基础的测试框架。当你为你的项目增加一个测试target时，Xcode会自动把它添加到关联的产品目标上去。一个最初的测试类只带一个被添加目标的测试方法，能在测试导航菜单中被找到。
* 测试导航菜单让你很容易的定位和编辑测试方法。你可以在测试导航菜单中使用导航按钮直接运行测试方法，或者在打开的测试类中直接从代码编辑器中运行。当一个测试失败时，测试导航菜单和代码编辑器都会把失败的部分标记出来
* 一个单独的测试方法可以包含该多个断言，结果只显示一个通过或者失败。这种方式允许你根据项目需要创建简单或者复杂的测试。
* `setUp`方法和`tearDown`方法作为入口方法，能够让你把常用的代码统一的使用在方法中，保持代码的连贯性也更容易发现问题。

## 感谢
**感谢小强在百忙之中抽空帮忙校验。**
