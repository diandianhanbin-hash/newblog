---
title: "IOS学习Day1"
publishedAt: "2016-08-24T23:51:57+08:00"
categories: ["iOS"]
tags: ["iOS"]
path: "/iOS/IOS学习Day1.html"
---

![20160824](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537778010788324.jpg)

## 环境

***
Mac系统：OS X EI Capitan 10.11.5

Xcode版本：7.3
***

## HelloWorld
IOS的HelloWorld比较麻烦，需要新建一个Label，然后把这个Label展示出来。

```
//ViewController.m

- (void)viewDidLoad {
    [super viewDidLoad];
    //初始化一个label对象
    UILabel *label = [[UILabel alloc]init];
    
    //设置label的内容
    label.text = @"Hello World!!!";
    
    //放置Label的位置
    label.frame = CGRectMake(100, 100, 200, 50);
    
    //把label放在根视图上
    [self.view addSubview:label];
}
```

这样直接运行即可看到HelloWorld。

![pic1](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15377780299927192.jpg)

## UILabel
除了HelloWorld中说明的属性，还有一些其他的设定。

```
 //设置label的背景颜色
    label.backgroundColor = [UIColor blueColor];
    
    //设置label的字体大小
    label.font = [UIFont systemFontOfSize:20];
    
    //设置label中文字的颜色
    label.textColor = [UIColor redColor];
    
    //设置label中文字的对齐模式
    label.textAlignment = NSTextAlignmentCenter;
```

加上以上的属性之后，效果如下图

![pic2](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537778053388683.jpg)

## UIButton
### 普通按钮
按钮的初始化与其他组件不同，需要使用`UIButton *btn = [UIButton buttonWithType:UIButtonTypeRoundedRect];`方法来初始化，也就是在初始化的时候就要声明按钮的类型，是图片的按钮，圆角按钮还是其他。*UIButtonTypeRoundedRect*属于系统按钮。

同理，设置按钮名称的时候也必须要声明按钮的状态，比如这样：

```
//设置按钮的名称和状态类型
    //p1：按钮的名称
    //p2：按钮的类型 UIControlStateNormal：按钮正常显示的状态
    /* 按钮的枚举
     * typedef NS_OPTIONS(NSUInteger, UIControlState) {
     * UIControlStateNormal       = 0,
     * UIControlStateHighlighted  = 1 << 0,                  // used when UIControl isHighlighted is set
     * UIControlStateDisabled     = 1 << 1,
     * UIControlStateSelected     = 1 << 2,                  // flag usable by app (see below)
     * UIControlStateFocused NS_ENUM_AVAILABLE_IOS(9_0) = 1 << 3, // Applicable only when the screen supports focus
     * UIControlStateApplication  = 0x00FF0000,              // additional flags available for application use
     * UIControlStateReserved     = 0xFF000000               // flags reserved for internal framework use
     * };
     */
    [btn setTitle:@"我是按钮" forState:UIControlStateNormal];
    //按钮被按下
    [btn setTitle:@"按钮被按下" forState:UIControlStateHighlighted];
```

### 带图片按钮
带图片的按钮初始化方式`UIButton *imageBtn = [UIButton buttonWithType:UIButtonTypeCustom];`，设置普通按钮需要设置名称，而设置图片按钮需要设置按钮的图片名称。

```
-(void)createImageBtn
{
    //初始化图片按钮
    UIButton *imageBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    
    imageBtn.frame = CGRectMake(100, 200, 100, 100);
    
    //设置按钮的图片相关属性
    UIImage* icon01 = [UIImage imageNamed:@"btn01"];
    
    UIImage* icon02 = [UIImage imageNamed:@"btn02"];
    
    //设置按钮状态的图片
    [imageBtn setImage:icon01 forState:UIControlStateNormal];
    
    [imageBtn setImage:icon02 forState:UIControlStateHighlighted];
    
    [self.view addSubview:imageBtn];
}
```
当然，这个方法需要`viewDidLoad`方法中调用。结果如下：

![pic3](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537778077663868.jpg)



