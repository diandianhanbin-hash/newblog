---
title: "IOS学习Day2—事件响应链"
publishedAt: "2016-09-04T23:15:50+08:00"
categories: ["iOS"]
tags: ["iOS"]
path: "/iOS/IOS学习Day2—事件响应链.html"
---

![20160906](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777658817479.jpg)


## 环境

***
Mac系统：OS X EI Capitan 10.11.5

Xcode版本：7.3
***

## 流程图
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777681577566.jpg)

图有点歪，不过大概的流程是这么个样子。获取事件的是最上层的元素，如果这个元素没有对应的相应事件，就会往这个元素的父元素传递，元素传递完毕之后，就会传递到UIController，接下来是UIWindow，最后是AppDelegate。如果AppDelegate没有响应，那么就不会响应。

## 代码实现
上面的流程可以用代码写出来，把日志打出来后进行理解。

新建一些类，`subView` `MainView` 继承于 `UIView`。`VCRoot`继承于`UIController`。`MyWindow`继承于`UIWindow`。整个工程结构大概这样：

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777702241229.jpg)

### AppDelegate

首先在`AppDelegate.m`我们要导入相关包

```
#import "VCRoot.h"
#import "MyWindow.h"
```

然后添加如下代码：

```
-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    NSLog(@"AppDelegate 事件响应!next== %@", self.nextResponder);
    
    [super touchesBegan:touches withEvent:event];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    
    self.window = [[MyWindow alloc]initWithFrame:[UIScreen mainScreen].bounds];
    self.window.rootViewController = [[VCRoot alloc]init];
    [self.window makeKeyAndVisible];
    
    
    return YES;
}
```

`-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event`这个方法是监控点击事件，监控到这个事件后会打一个日志出来。

`didFinishLaunchingWithOptions`这部分的功能是用`MyWindow`初始化一个视图。设置`VCRoot`为根视图。

## VCRoot
在`VCRoot`中就可以添加方法了。

```
- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    _mainView = [[MainView alloc]init];
    _mainView.frame = CGRectMake(50, 50, 200, 200);
    _mainView.backgroundColor = [UIColor orangeColor];
    
    [self.view addSubview:_mainView];
    
    _subView = [[subView alloc]init];
    _subView.frame = CGRectMake(30, 30, 100, 20);
    _subView.backgroundColor = [UIColor purpleColor];
    
    [_mainView addSubview:_subView];
    
    self.view.backgroundColor = [UIColor blueColor];
    
    
    
}

-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    NSLog(@"VCRoot事件响应!next== %@", self.nextResponder);
    
    [super touchesBegan:touches withEvent:event];
}
```

在这里，我们添加了`_subView`和`_mainView`，其中`_subView`是`_mainView`的子视图。

### subView和MainView
在这两部分添加点击事件的代码：

```
-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    NSLog(@"subView 事件响应! next== %@", self.nextResponder);
    
    [super touchesBegan:touches withEvent:event];
}
```

### 运行效果
运行之后，点击`_subView`，也就是紫色的区块，会打出如下日志：

```
2016-09-06 16:32:45.579 事件响应链[79863:6604417] subView 事件响应! next== <MainView: 0x7faf48f3ccb0; frame = (50 50; 200 200); layer = <CALayer: 0x7faf48f034d0>>
2016-09-06 16:32:45.580 事件响应链[79863:6604417] MainView 事件响应!next== <UIView: 0x7faf48f3aed0; frame = (0 0; 320 568); autoresize = W+H; layer = <CALayer: 0x7faf48f3bac0>>
2016-09-06 16:32:45.581 事件响应链[79863:6604417] VCRoot事件响应!next== <MyWindow: 0x7faf48c4b050; baseClass = UIWindow; frame = (0 0; 320 568); gestureRecognizers = <NSArray: 0x7faf48f39930>; layer = <UIWindowLayer: 0x7faf48d16bc0>>
2016-09-06 16:32:45.581 事件响应链[79863:6604417] MyWindow 事件响应next== <UIApplication: 0x7faf48c05f80>
2016-09-06 16:32:45.581 事件响应链[79863:6604417] AppDelegate 事件响应!next== (null)
```

我们可以看到，一个相应的是`subView`，然后是`MainView`，这两个是我们定义的`UIView`，所有我们定义的元素相应结束之后，下一个响应者就是`VCRoot`，也就是`UIController`。在这之后是`MyWindow`也就是`UIWindow`，最后是`AppDelegate`。

