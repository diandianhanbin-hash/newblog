---
title: "【译】Running Tests and Viewing Results"
publishedAt: "2016-09-07T09:37:55+08:00"
categories: ["翻译"]
tags: ["iOS","测试","TestingWithXcode"]
path: "/trans/【译】Running Tests and Viewing Results.html"
---

原文地址：[《Running Tests and Viewing Results》](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/05-running_tests.html#//apple_ref/doc/uid/TP40014132-CH5-SW1)

## 文章导读
本篇介绍了如何运行测试用例、查看测试结果和构建测试的配置

看完之后你能学到：

1. 使用各种方法来运行测试。
2. 在各种场景查看测试结果。
3. 为不同的目标构建相应的配置

## 声明
文章翻译自Apple官方文档《Testing with Xcode》，不保证每个字都能翻译的精准，如有翻译错误，请留言指出，不胜感激。

# Running Tests and Viewing Results
就像你在[《Quick Start》](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/02-quick_start.html#//apple_ref/doc/uid/TP40014132-CH2-SW1)中看到的一样，在Xcode的测试导航器中运行测试和查看测试结果是非常容易的。有一些额外的可以相互作用的方式来运行测试。Xcode运行测试时基于任务中包含该并且可实行的测试目标。在一个测试任务中，即使不使用任务编辑器，测试导航器允许你直接控制测试的目标中包含的类、方法，执行或者目录额某些测试。

## Commands for Running Tests
测试导航器提供你一个简单的方式执行测试，作为程序流程的一部分。可以在代码编辑器中直接执行或者使用产品菜单。

### Using the Test Navigator
当你把鼠标放在测试导航器上的一个包名，类名，方法名称上时，一个运行按钮就会出现，你可以运行一条测试，一个类中的所有测试或者一个包中的所有测试，这取决于你鼠标放在测试导航器的位置。

* 运行一个包中的所有测试，把鼠标放在包名上，点击右侧出现的运行按钮。

![twx-runtst-1_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779068532968.jpg)

* 运行一个类中的所有测试，把鼠标放在类名上，点击右侧出现的运行按钮。

![twx-runtst-2_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/153777912511049.jpg)

* 单独运行一条测试，把鼠标放到测试名称上，点击右侧出现的运行按钮。

![twx-runtst-3_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779148377702.jpg)

### Using the Source Editor
当你的代码编辑器打开了一个测试类，一个清晰的标志出现在每个方法名的旁边。把鼠标放到标志上会出现一个运行按钮，点击运行按钮执行测试方法，然后标志会展示测试通过或者失败。再次把鼠标放到标志上，标志会再次展示运行按钮来重复测试。这种方式一般来说一次只运行一个测试。

![twx-runtst-4_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779169153952.jpg)

![twx-runtst-5_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779190313104.jpg)

***
注意：同样的标志会出现在*@implementation*类旁边。允许你运行整个类的测试。
***

## Using the Product Menu
产品目录包含了快捷键来直接运行测试。

**Product > Test**，执行当前活动的测试任务。快捷键是*Command-U*

```
**Product > Build for > Testing**和**Product > Perform Action > Test without Building**。
```
这两个命令可以用来构建测试包，一个接一个的独立执行测试。这些都是方便的命令来快速的构建测试流程。当改变代码去检查构建工程的*warning*和*errors*时，他们是非常有用的。当你知道构建日期时你可以快速的测试它。他们各自的快捷键是*Shift-Command-U*和*Control-Command-U*。

**Product > Perform Action > Test <testName>**。当你在编辑一个测试方法的时候，这个菜单会动态的展示当前的位置的测试方法，同时也允许你使用快捷键来执行测试。命令的名称会相对应的展示将要运行的测试的名称。例如，*Product > Perform Action > Test testAddition*。快捷键是*Control-Option-Command-U*

***
注意：除了在代码编辑器之外，这个命令同样适用于项目导航器和测试导航器选中的目标。当两个导航器中的任意一个被选中，代码编辑器没有焦点，命令会选择当前两个导航器中任意一个被选中的选项来执行测试。

在测试导航器中，备选项可以是一个包，一个类或者一个方法。在项目导航器中，被选项可能是一个可执行的测试类文件，例如*CalcTests.m*。
***

**Product > Perform Action > Test Again <testName>**。当对测试方法debug或者编辑代码的时暴露问题，显示最后被执行的测试方法是最有用的。就像*Product > Perform Action > Test command*一样，测试的名字也是动态的出现的。例如*Product > Perform Action > Test Again testAddition*，快捷键是*Control-Option-Command-G*。

### Display of Test Results
Xcode的XCTest框架有好几种方式展示测试结果通过或者失败。下面的截图展示了你在那些地方能看到结果。

* 在测试导航器中，一个测试或者一组测试结束后，你可以看到通过/失败的标识。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15377792135705228.jpg)

如果测试方法被收进他们所属的类，或者测试类被收进所属的测试包。标识会反应出所有测试结果的状态的汇总。在这个例子里，在*BasicFunctionsTests*类中至少有一个测试被标记为失败。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779236219811.jpg)

* 在代码编辑器中，你可以查看通过/失败标志，debug信息。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779257663958.jpg)

* 在报告导航器中，你可以在测试运行后输出测试结果。测试面板是活动的，在左侧选择你想要执行的测试。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779279986239.jpg)

对于性能测试而言，点击结果的时间列进入性能测试报告的详情页面。你可以通过单击单个测试运行按钮来查看测试的聚合性能以及为每个十运行的值。编辑按钮允许你设置或者修改测试的基线和偏离最大标准的值来判定测试成功或者失败。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779297915049.jpg)

使用日志面板，你可以查看失败相关的描述和其他简介。打开三角形标志，你可以乡下显示所有测试运行的详细内容。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15377793160933828.jpg)

***
注意：除了在左侧点击三角形标志来进入项目。可以展示更多的心，右侧的测试失败的小图标。就像你在上面失败的*testMultiplication*中展示的一样。
***

* debug日志能以文本的形式全面的展示测试运行的信息。和你在日志导航器中看到的信息一致，但是如果你激活了debugging。任意debugging的信息都会在这里出现。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779333871105.jpg)

### Working with Schemes and Test Targets
Xcode方案控制构建，运行，测试，Debug菜单执行哪些命令。当你创建测试目标的时候，Xcode为你管理计划配置，使用测试导航器执行其他系统操作。举个例子，当你激活或者忽略一个测试方法，测试类或者测试包。使用Xcode Server持续集成需要在Manage Schemes页面勾选复选框，被设置为共享，并且一起随着你的项目和源代码放到代码仓库中。

为你的测试检查计划配置：

1. 在工具栏中选择*Scheme menu > Manage Schemes*进入管理页。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779355306605.jpg)

在这个项目中更有两个计划，一个构建APP，另一个构建库/框架。复选框共享标签在配置的右侧，标记为共享，允许使用Xcode Server。

2. 在管理页，双击一个计划来展示计划编辑页面。当你执行测试命令的时候，一个测试计划行为等同于裕兴Xcode测试。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779373830148.jpg)

***
注意：测试导航器和配置助手与测试目标和测试类、测试方法想关联，通常保持计划配置对测试的所有操作。
***

更多有关使用，配置和编辑计划的信息详见*Scheme Editor Help*，视频详见[ WWDC 2012: Working with Schemes and Projects in Xcode (408)](https://developer.apple.com/videos/wwdc/2012/?id=408)

### Build Settings—Testing Apps, Testing Libraries
App测试在你的app环境中运行，允许您创建结合来自不同类、库/框架和应用程序功能方面的行为的测试。库测试是在一个库或者框架内运行的测试类和测试方法，独立于你的app，是为了验证他们的行为是否符合库的规范和要求。

两种类型的测试包需要使用不同的构建配置。当你通过测试目标助手中选择测试目标参数来创建测试目标时，构建设置的配置就会为你自动生成。当Target pop-up打开时展示目标助手。这个app，*SampleCalc*和库/框架，*CacLibrary*，都是允许选择的。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15377793955748448.jpg)

选择*SampleCalc*作为项目构建的测试目标配置是为了测试一个app。app的主进程会执行你的测试，在收到*applicationDidFinishLaunching*的通知后会执行测试。在这个例子中，项目的默认名称*“SampleCalc Tests*源自测试目标的名字*SampleCalc*。你可以根据你的喜好来修改它。

选择*CalcLibrary*作为关联的构建项目，目标助手会为library测试设置基础构建设定。Xcode引导库/框架的测试会话，你的测试代码是由Xcode的主进程来控制的。在这个例子中，项目的默认名称*CalcLibrary Tests*源自测试目标的名字。和app测试一样，你可以根据你的喜好来修改它。

## Build Setting Defaults
对大多数情况而言，选择当前测试目标构建项目需要做的所有事就是为app，库或者框架构建配置构建设置。Xcode自动为你管理构建配置。由于你可能需要为你的项目做一些复杂的配置，了解Xcode为app，库或者框架的构建配置标准是非常有用的。

*SampleCalc*项目作为样例来说明当前默认的配置。

* 在项目导航器中点击*SampleCalc*项目进入项目编辑菜单，然后在编辑菜单的General面板中选择*SampleCalcTests*的测试目标，一个下拉菜单就会展示出来，下拉菜单默认展示*SampleCalc*作为目标。
	
![twx-runtst-15_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779415084073.jpg)

你可以检查*SampleCalcTests*的构建设置是否正确。

* 点击Build Settings，然后在搜索框中输入*Bundle Loader*。*SampleCalc*的测试是由*SampleCalc*app加载而来。你可以看到调试和发布的版本的可执行的自定义参数的路径。

如果你搜索*Test Host*，你也可以看到同样的路径。
	
	![twx-runtst-16_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779435463809.jpg)

这个名叫*CalcLibrary*项目的计算器目标库有一个关联的测试目标名叫*CalcLibraryTests*。

* 在General面板中选择*CalcLibraryTests*

目标设置为空，同样在Build Setting面板中检查*Bundle Loader*和*Test Host*是否缺少相关参数。这表示Xcode已经使用正确的配置配置了默认值。
