---
title: "【译】Writing Test Classes and Methods"
publishedAt: "2016-09-09T14:15:57+08:00"
categories: ["翻译"]
tags: ["iOS","测试","TestingWithXcode"]
path: "/trans/【译】Writing Test Classes and Methods.html"
---

原文地址：[《Writing Test Class and Methods》](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/04-writing_tests.html#//apple_ref/doc/uid/TP40014132-CH4-SW1)

## 文章导读

本篇介绍了如何编写测试类和测试方法。

看完之后你能学习到：

* 如何编写一个测试类
* 如何编写测试方法
* 测试类和测试方法的架构
* 如何断言
* Object——C与Swift在断言上的区别

## 声明
文章翻译自Apple官方文档《Testing with Xcode》，不保证每个字都能翻译的精准，如有翻译错误，请留言指出，不胜感激。

# Writing Test Classes and Methods
当你通过测试导航菜单为一个项目添加测试目标时，Xcode会在测试导航菜单中展示目标的测试类和测试方法。在测试目标中，在测试中，目标是包含着测试方法的测试类。这章将想你解释如何创建测试类和编写测试方法。

## Test Targets, Test Bundles, and the Test Navigator
在看创建测试类之前，先看看测试导航菜单是值得的。使用它是创建测试和使用测试的核心。

为一个项目增加测试目标，创建一个测试包。测试导航菜单列出了项目源代码中所有测试报。用层级列表的方式展示测试类和测试方法，这里展示了一个含有两个测试目标项目的测试导航菜单视图，显示了一套层级列表形式的测试包，测试类和测试方法。

![twx-wtcm-1_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15377796422139132.jpg)

测试包能容纳许多测试类。无论是功能性的还是有组织目的的归类，你都能用测试类把有关联的测试分到同一组。举个例子，对于计算的示例项目，你可以创建`BasicFunctionsTests`，`AdvancedFunctionsTests`和`DisplayTests`类，所有类都在`Mac_Calc_Tests`包里。

![twx-wtcm-2_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779668563064.jpg)

某些类型的测试可能需要共享确定的`sepUp`和`tesrDown`方法，有效地把不同的测试收集到不同的测试类中，仅适用一套`setUp`和`tearDown`的方法让编写各个测试方法的代码量最少。

## Creating a Test Class

***
注意： 为了更好的通过图例说明，本章重点聚焦于单元测试的测试类和测试方法，创建UI测试目标，类和方法。它们和在单元测试中工作的区别，在[User Interface Testing](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/09-ui_testing.html#//apple_ref/doc/uid/TP40014132-CH13-SW1)讨论。
***

你可以使用测试导航菜单中的增加按钮（+）来创建新的测试类。

![twx-wtcm-3_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779687637256.jpg)

你可以选择增加单元测试类或者UI测试类，选择其中一个之后，Xcode会展示一个含有默认选定模板的文件种类选择器。下图中高亮显示了一个单元测试类的模板。点击`Next`确认你的选择。

![twx-wtcm-4_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779709972437.jpg)
基于你在配置表中输入的测试类的名称，每个测试类会把你放置测试结果的文件命名为`TestClassName.m`

![twx-wtcm-5_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779817146902.jpg)
***
注意：所有的测试类都是在XCTest框架下XCTestCase的子类。
***

虽然Xcode的会默认的根据你的计划测试目标把组件分成不同的组，但是你也可以放在项目中任意一个你选择的位置。当你选择下一步的时候，标准的Xcode新增目录列表的配置图入如下所示。

![twx-wtcm-6_2x](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779727148631.jpg)

使用新增目录列表和你在项目导航中新增一个项目的方式也是一样的，更多有关*Add Files sheet*的内容，请看*Adding an Existing File or Folder*。

***
注意：当你新建一个项目的时候，测试目标和所关联的测试包会默认的基于你的项目名称而命名。在这种情况下，创建一个项目名称为*MyApp*的时候，会自行创建一个名为*MyAppTests*的测试包和一个名为*MyAppTests*测试类，此测试类带有关联的*MyAppTests.m*可执行文件。
***

## Test Class Structure
测试类有这样的基本结构：

```
#import <XCTest/XCTest.h>
 
@interface SampleCalcTests : XCTestCase
@end
 
@implementation SampleCalcTests
 
- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
}
 
- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}
 
- (void)testExample {
    // This is an example of a functional test case.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
}
 
- (void)testPerformanceExample {
    // This is an example of a performance test case.
    [self measureBlock:^{
        // Put the code you want to measure the time of here.
    }];
}
@end
```

这个测试类的例子，不仅可以在Object-C中运行，也可以在Swift下运行。

***
注意：为了保证统一性，本文所有的可执行案例都是用Object-C编写。
XCTest也全部支持使用Swift编写你的测试方法。所有的Object-C和Swift混编的方法也同样支持。
***

需要注意的是，这些可执行案例会附带实现方法，例如含有`setUp`和`tearDown`的基础实现方法，但这些方法不是必须的。如果某个类中的所有方法都需要相同的代码。你可以自己编写`setUp`和`tearDown`的实现方法。这些代码在每一条测试用例前后都会执行一遍。你可以为测试类增加同样的类方法，`setUp(+(void)setUp)`和`tearDown((+void)tearDown)`。它们会在测试类的所有方法执行前和执行后执行。

## Flow of Test Execution
在默认的例子中，当我们执行测试，XCTest会找到所有的测试类，并执行它们下面的所有测试方法（所有的测试类继承于`XCTestCase`）。

***
注意：在XCTest运行时，一些配置允许你对测试做一些特定的更改。你可以在测试导航器中不执行某些测试或者编辑测试计划。你也可以使用测试导航器或者代码编辑器中的运行按钮来选择只执行一条测试用例或者一组测试用例或者在代码编辑器中直接编辑。
***

对于每个类来说，从每个类的`setUp`方法开始执行测试。对于每个测试方法来说，一个类被实例化，就会先执行`setUp`方法，然后执行测试方法，最后执行`tearDown`方法。这一系列动作在每个测试方法中重复。在最后一个`tearDown`方法被执行后，测试类就被执行完毕了。Xcode执行完`tearDown`类方法后就开始执行下一个测试类。这一系列动作一致重复到所有的测试类都被执行完。

## Writing Test Methods
你通过编写测试方法来为测试类增加测试。一个测试方法是测试类一种实例，使用*test*作为前缀，没有参数，返回`void`。例如`(void)testColorIsRed()`。测试方法运用你项目中的代码，如果它没有产生预期的结果，报告会用一组断言API来报告失败。例如一个功能性的返回值和你预期的值做对比或者因为测试类中方法的不恰当使用导致抛出了一个异常。[XCTest Assertions](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/04-writing_tests.html#//apple_ref/doc/uid/TP40014132-CH4-SW34)描述了这些断言。

对于一个测试方法，将相关的头文件导入到你的测试类中，来使用将被测试的代码。

当Xcode运行测试时，它会独立的运行每一条测试方法。因此，每一种方法必须准备和清理所有的辅助变量，结构和对象。它需要和主体的API进行交互。如果这些代码在类中的所有方法都会用到，你可以像*Test Class Structure*章节中描述的那样把它们加进`setUp`和`tearDown`方法中。

下面是一个单元测试方法的模板：

```
- (void)testColorIsRed {
   // Set up, call test subject API. (Code could be shared in setUp method.)
   // Test logic and values, assertions report pass/fail to testing framework.
   // Tear down. (Code could be shared in tearDown method.
}
```

这里有一个简单的测试方法实例用来检查`CalcView`是否成功的被SampleCalc创建，app在[Quick Start](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/02-quick_start.html#//apple_ref/doc/uid/TP40014132-CH2-SW1)章节中展示了。

```
- (void) testCalcView {
   // setup
   app = [NSApplication sharedApplication];
   calcViewController = (CalcViewController*)[NSApplication sharedApplication] delegate];
   calcView             = calcViewController.view;
 
   XCTAssertNotNil(calcView, @"Cannot find CalcView instance");
   // no teardown needed
}
```

## Writing Tests of Asynchronous Operations
测试是同步执行的，因为每一个测试用例都是相互独立的一条接一条的执行下去。但是越来越多的代码是异步执行的。要处理调用异步执行方法和函数的测试组件，从Xcode6开始，XCTest在测试方法中增加了连续异步执行测试用例的功能。通过等待异步回调完成或者超时。

一个源码的例子：

```
// Test that the document is opened. Because opening is asynchronous,
// use XCTestCase's asynchronous APIs to wait until the document has
// finished opening.
- (void)testDocumentOpening
{
    // Create an expectation object.
    // This test only has one, but it's possible to wait on multiple expectations.
    XCTestExpectation *documentOpenExpectation = [self expectationWithDescription:@"document open"];
 
    NSURL *URL = [[NSBundle bundleForClass:[self class]]
                              URLForResource:@"TestDocument" withExtension:@"mydoc"];
    UIDocument *doc = [[UIDocument alloc] initWithFileURL:URL];
    [doc openWithCompletionHandler:^(BOOL success) {
        XCTAssert(success);
        // Possibly assert other things here about the document after it has opened...
 
        // Fulfill the expectation-this will cause -waitForExpectation
        // to invoke its completion handler and then return.
        [documentOpenExpectation fulfill];
    }];
 
    // The test will pause here, running the run loop, until the timeout is hit
    // or all expectations are fulfilled.
    [self waitForExpectationsWithTimeout:1 handler:^(NSError *error) {
        [doc closeWithCompletionHandler:nil];
    }];
}
```

更多关于编写异步操作的详细信息，请看`XCTest.framework`的头文件`XCTestCase+AsynchronousTesting.h`

## Writing Performance Tests
性能测试需要一大堆代码，你会想要评估并运行这些代码十次，收集执行的平均耗时和标准偏移量。这些单独的测量的平均值，形成一个测试运行的值，可以与基线相比以评估成功或失败。

***
注意：基线是已经被你用来评估成功或者失败的值。报告界面提供了一个设置或更改基线值的途径
***

执行性能测试，你需要使用Xcode6或者以后版本提供的XCTest的新的API来编写运行方法。

```
- (void)testPerformanceExample {
    // This is an example of a performance test case.
    [self measureBlock:^{
        // Put the code you want to measure the time of here.
    }];
}
```

下面简单的例子展示了使用样例计算器APP编写性能测试来测试加法速度的场景。`measureBlock`是一个加法，随着一个XCTest的次数的迭代。

```
- (void) testAdditionPerformance {
    [self measureBlock:^{
        // set the initial state
        [calcViewController press:[calcView viewWithTag: 6]];  // 6
        // iterate for 100000 cycles of adding 2
        for (int i=0; i<100000; i++) {
           [calcViewController press:[calcView viewWithTag:13]];  // +
           [calcViewController press:[calcView viewWithTag: 2]];  // 2
           [calcViewController press:[calcView viewWithTag:12]];  // =
        }
    }];
}
```

性能测试运行一次，当查看执行文件时，会在代码编辑器上提供信息、也会在测试导航器和报告导航器上展示信息。点击信息会呈现单独的运行结果。测试结果显示包括设置测试结果作为未来测试标准的基线。基线存储在每个设备的配置文件中所以你如果在不同的设备上运行同样的测试用例，由于每个设备处理速度，内存等配置不同会导致出现不同的基线。

***
注意：性能测试第一次运行总是会报告失败，直到基线在设备的配置文件中被设置。
***

更多关于性能测试的方法，请查看`XCTest.framework`的头文件`XCTestCase.h`。

## Writing UI Tests
用XCTest创建UI测试就像创建单元测试一样，是对一个同样程序模型的扩展。总提上说，都是类似的操作和程序的模型是一样的。工作流程中的和执行中的区别主要集中在实施UI测试和使用XCTest UI测试API，这些在[User Interface Testing](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/09-ui_testing.html#//apple_ref/doc/uid/TP40014132-CH13-SW1)有描述

## Writing Tests with Swift
Swift存取控制模型阻止测试从app或者框架内部进入声明。为了在Xcode6中使用Swift的内部功能，你需要为测试设置这些入口点为公共的，降低Swift类型安全性。

Xcode7针对这个问题提供了一个氛围两部的解决方案：

1. Swift在构建编译的时候直接做成内部可访问的。改变编译的方式是在Xcode执行你测试构建的动作时发出一个新的`-enable-testing`标志。这个行为是由构建设置的`Enable Testability`来控制的，为新的项目设置默认为*Yes*。这样你不需要改变你的源代码。
2. 可测试的入口点的可见性受限于客户端。它通过对导入声明的修改来控制。修改的实施是通过导入一个新的`@testable`属性，为你的测试代码做一次调整，app的代码不需要变动。

例如，为一个名叫“MySwiftApp”的app考虑Swift的模型像`AppDelegate`这样的方式。

```
import Cocoa
@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
    @IBOutlet weak var window: NSWindow!
    func foo() {
        println("Hello, World!")
    }
}
```

编写测试类允许`AppDelegate`类作为入口，你需要在你的测试代码中为`@testable`属性修改`import`语句，像下面这样：

```
// Importing XCTest because of XCTestCase
import XCTest
 
// Importing AppKit because of NSApplication
import AppKit
 
// Importing MySwiftApp because of AppDelegate
@testable import MySwiftApp
 
class MySwiftAppTests: XCTestCase {
    func testExample() {
        let appDelegate = NSApplication.sharedApplication().delegate as! AppDelegate
        appDelegate.foo()
    }
}
```

使用这种解决方案，你的Swift应用代码内部的功能就可以全部被你的测试类和测试方法访问。准许`@testable`的导入确认其他非测试客户端没有权限访问Swift控制的规则，即使是在编译测试的时候。

***
注意：`@testable`提供访问仅仅是内部功能，当使用`@testalbe`时，私有声明的目录也是无法访问的。
***

## XCTest Assertions
你的测试方法使用XCTest框架提供的断言来展示Xcode显示的测试结果。所有的断言都有一个类似的格式，比对逻辑表达式的项目，一个失败结果的字符串格式和插入到字符串格式中的参数。

***
注意：所有断言的最后偶一个参数被格式化。一个格式化的字符串和它的变量参数列表。XCTest为所有的断言提供了一个默认失败结果的字符串，结合着传递给断言的参数一起使用，format字符串对失败的结果提供一个附加的、特定的说明，除此之外，你也可以自行添加。这个参数是可选的，也可以忽略的。
***

例如，查看[Quick Start](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/02-quick_start.html#//apple_ref/doc/uid/TP40014132-CH2-SW1)中的`testAddition`这个断言：

```
XCTAssertEqualObjects([calcViewController.displayField stringValue], @"8", @"Part 1 failed.");
```

像自然语言一样读它，是这样的*Indicate a failure when a string created from the value of the controller’s display field is not the same as the reference string ‘8’.”*。如果断言失败，在测试导航器上，Xcode会单独展示一个失败的标志，Xcode也会在问题导航器上或者代码编辑器或者其他地方展示一个失败的描述。在源码编辑器上一个典型的结果是这样的：

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15377798351518478.jpg)

一个测试方法可以包括多个断言，任意一个断言报告了失败，Xcode会标记这个测试方法为失败。

断言失败有五个种类，一定失败，相等测试，为空测试，真值测试和预期测试，例如：

### Unconditional Fail
XCTFail,一定产生失败

```
XCTFail(format...)
```

### Equality Tests
XCTAssertEqual, 当表达式1和表达式2不相等时给出失败。

```
XCTAssertEqual(expression1, expression2, format...)
```

在[Assertions Listed by Category](https://developer.apple.com/library/prerelease/content/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/04-writing_tests.html#//apple_ref/doc/uid/TP40014132-CH4-SW35)获取所有XCTest的断言。

## Using Assertions with Objective-C and Swift
当使用XCTest断言的时候，你需要知道断言Swift代码和断言Object-C（其他类C语言）代码的基本的不同点。了解这些不同点让你编写和debug你的测试更简单。

XCTest断言做相等测试的时候区分对象比较和非对象比较。例如，`XCTAssertEqualObjects`测试两个表达式对象类型是否相等。而`XCTAssertEqual`测试两个表达式的值是否相等。这些差异通过在描述中显示为“此测试是标量的”，使在XCTest断言列表中是被标记的。用标量的方式来告诉你断言的基本区别，但是它不能精确的描述表达式不匹配。

* 对于Objective-C来说，被标记为量化类型的断言标记可以使用以下等式比较的算子：==,!=,<=,<,>=,>等。如果表达式解析C语言类型，或者数组比较，需要使用这些操作方式，会被当成一个标量来处理。
* 对于Swift来说，标记为标量的断言遵从*Equatable*标准（对于所有的相等和不想等的断言）和*Comparable*标准（大于或者小于断言），可以用来比较任意类型的表达式。另外，当*T，K，V*遵循*Equatable*和*Comparable*标准时，量化标记的断言优先针对*[T]*或者*[k:v]*。例如，*XCTAssertEqual*兼容一个合理的数组类型，*XCTAssertLessThan*也兼容字典的*KV对*的比较。

***
注意：在Swift中，*NSObject*遵从*Equatable*，所以使用*XCTAssertEqualObjects*也是可以工作的，但是这样不是必须的。
***

Object——C和Swift在测试中使用XCTest断言也是不同的是因为语言处理数据类型和内部转换的方式不同。

* 对于Object——C来说，在XCTest实施内部转换的时候运行相互独立表达式类型的对比，不会检查输入的数据类型。
* 对于Swift来说，内部转换是不允许的，由于Swift的类别安全更严格，所有比较的成员必须是相同类型的。类型不匹配会在代码编辑器编写代码的时候被标记出来。

## Assertions Listed by Category
XCTestAssertions被分类为五组，无条件失败断言，相等测试，为空测试，真值测试和预期测试。

下面部分是XCTest断言的清单。你可以在Xcode使用快速帮助查看`XCTestAssertions.h`了解更多关于XCTest断言的信息。

### Unconditional Fail
XCTFail，直接产生一个失败

```
XCTFail(format...)
```

### Equality Tests
**XCTAssertEqualObjects**，当表达式1不等于表达式2（或者一个对象是空，另一个不是）产生失败

```
XCTAssertEqualObjects(expression1, expression2, format...)
```

**XCTAssertNotEqualObjects**,当表达式1等于表达式2的时候产生失败

```
XCTAssertNotEqualObjects(expression1, expression2, format...)
```

**XCTAssertEqual**，当表达式1不等于表达式2的时候产生失败，这个针对标量测试。

```
XCTAssertEqual(expression1, expression2, format...)
```

**XCTAssertNotEqual**，当表达式1等于表达式2的时候产生错误，这个针对标量测试。

```
XCTAssertNotEqual(expression1, expression2, format...)
```

**XCTAssertEqualWithAccuracy**,当表达式1和表达式2大于精确度时产生一个错误，这个标量测试一般针对浮点和双精度，微小的不同之处可以让这些项目他们精确的不相等，但是对所有标量有效。

```
XCTAssertEqualWithAccuracy(expression1, expression2, accuracy, format...)
```

**XCTAssertNotEqualWithAccuracy**,当表达式1和表达式2小于精确度时产生一个错误，这个标量测试一般针对浮点和双精度，微小的不同之处可以让这些项目他们精确的不相等，但是对所有标量有效。

```
XCTAssertNotEqualWithAccuracy(expression1, expression2, accuracy, format...)
```

**XCTAssertGreaterThan**，当表达式1小于或者等于表达式2时产生一个错误，这个针对标量测试。

```
XCTAssertGreaterThan(expression1, expression2, format...)
```

**XCTAssertGreaterThanOrEqual**,当表达式1小于表达式2时产生一个错误，这个针对标量测试。

```
XCTAssertGreaterThanOrEqual(expression1, expression2, format...)
```

**XCTAssertLessThan**,当表达式1大于或者等于表达式2时产生一个错误，这个针对标量测试。

```
XCTAssertLessThan(expression1, expression2, format...)
```

**XCTAssertLessThanOrEqual**，当表达式1大于表达式2时产生一个错误，这个针对标量测试。

```
XCTAssertLessThanOrEqual(expression1, expression2, format...)
```

### Nil Tests
**XCTAssertNil**,当表达式参数不为空时产生一个错误。

```
XCTAssertNil(expression, format...)
```

**XCTAssertNotNil**,当表达式参数为空时产生一个错误。

### Boolean Tests
**XCTAssertTrue**，当表达式为*false*时产生一个错误。

```
XCTAssertTrue(expression, format...)
```

**XCTAssert**,当表达式为*false*时产生一个错误，与*XCTAssertTrue*一样。

```
XCTAssert(expression, format...)
```

**XCTAssertFalse**，当表达式为*true*时产生一个错误。

```
XCTAssertFalse(expression, format...)
```

### Exception Tests
**XCTAssertThrows**,当表达式没有抛出异常时产生一个错误。

```
XCTAssertThrows(expression, format...)
```

**XCTAssertThrowsSpecific**,当表达式没有抛出一个特定的类时产生一个错误。

```
XCTAssertThrowsSpecific(expression, exception_class, format...)
```

**XCTAssertThrowsSpecificNamed**,当表达式没有抛出一个特殊的类和一个特殊的名称时产生一个错误。对于那些像AppKit和Foundation的框架个很有用，抛出一个普通的带有特殊名称（*NSInvalidArgumentException*等等）的*NSException*

```
XCTAssertThrowsSpecificNamed(expression, exception_class, exception_name, format...)
```

**XCTAssertNoThrow**，当表达式抛出异常时产生一个错误。

```
XCTAssertNoThrow(expression, format...)
```

**XCTAssertNoThrowSpecific**.当表达式抛出一个特定的类时产生一个错误。任意一个其他异常事通过的。这就意味着，不产生一个错误。

```
XCTAssertNoThrowSpecific(expression, exception_class, format...)
```

**XCTAssertNoThrowSpecificNamed**,当表达式抛出一个特殊的类和一个特殊的名称时产生一个错误。对于那些像AppKit和Foundation的框架个很有用，抛出一个普通的带有特殊名称（*NSInvalidArgumentException*等等）的*NSException*

```
XCTAssertNoThrowSpecificNamed(expression, exception_class, exception_name, format...)
```

