---
title: "IOS与ReactNative"
publishedAt: "2016-08-25T21:37:26+08:00"
categories: ["iOS"]
tags: ["iOS"]
path: "/iOS/IOS与ReactNative.html"
---

![20160825](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777844356856.jpg)


## 背景
上一篇文章[《Appium与React Native》](http://wybblog.applinzi.com/blog/article/76/)的最后猜测到：

> IOS暂未上手，但是应该与Android是一样的，封装原生的UI层，JS通过API与原生交互。

刚好又从开发手中拿到了IOS的端，于是对这个工程做一些拆解，论证论证我的猜测。

## 运行APP
直接构建工程，可以看到启动了一个服务。

![20160825210940](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777865465415.jpg)

服务占用了8081端口，启动模拟器，在这之后会进入欢迎页面，在欢迎页面的同时，会出现如下界面

![20160825211142](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777888927545.jpg)

很明显，是在做一个转换，等这个转换结束之后，就进入了APP的首页。整个过程结合终端和模拟器看，会显得非常直观。

## 分析
直接来看`AppDelegate.m`。

```
NSURL *jsCodeLocation;

  /**
   * Loading JavaScript code - uncomment the one you want.
   *
   * OPTION 1
   * Load from development server. Start the server from the repository root:
   *
   * $ npm start
   *
   * To run on device, change `localhost` to the IP address of your computer
   * (you can get this by typing `ifconfig` into the terminal and selecting the
   * `inet` value under `en0:`) and make sure your computer and iOS device are
   * on the same Wi-Fi network.
   */

  jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"];
```
一开始就起了一个8081端口的服务，这个和我们构建的时候看到终端占用的端口是一致的。然后是初始化根视图，控制器等APP的重要组件。

```
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"douban"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}
```

之后转换JS的代码来驱动原生的控件。转换完成后，首页就展示出来了。

工程中有一个库，这个库封装了React Native的内容。

![20160825212207](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777910084084.jpg)

打开源代码看看，其实就是ReactNative封装了原生的代码。

![20160825212527](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537777939707819.jpg)

界面还是原生的，ReactNative做了封装后，提供API提供调用。

## 控件视图查看
我们打开3D视图来查看控件的情况。

![20160825212950](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15377779623640242.jpg)

可以看到控件都是RCT开头的，也就是我们刚刚从工程中库文件发现封装原生内容的工程生成的自定义控件，它们都继承于原生的控件。

## 最后
所以可以断定，我原来的猜测是正确的，IOS的ReactNative也是对原生控件做封装，然后再对外部提供API供调用。

所以还是那句话。

>从结果上来看，无疑是挺好的，现在的混血APP虽然对于开发来说，是一个很好的解决客户端更新的方案，但是使用Appium测起来，要多一个切换会话的过程，虽然不复杂，但是总感觉有点麻烦，反正Appium是基于UI层的测试，那么用ReactNative弄出来的APP在UI层上全都是原生，那么对使用Appium并没有什么影响，反而省了切H5的过程呢。

