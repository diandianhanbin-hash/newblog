---
title: "Appium学习-关于Inspector"
publishedAt: "2016-05-11T00:15:18+08:00"
categories: ["Test"]
tags: ["iOS","测试","Appium"]
path: "/Test/Appium学习-关于Inspector.html"
---

## 背景
既然开始折腾IOS了，那么第一步是把Demo跑起来看效果，[《Appium学习-初窥》](http://wybblog.applinzi.com/blog/article/46/)文中已经把官方的Demo跑起来了。现在要接下来做其他的事

## Inspector问题
`Inspector`是`Appium`客户端给的一个工具，用来探测`IOS`的元素布局。当然`Android`也是可以用的，不过`Android`一般使用`uiautomatorviewer`。

不过我在使用的时候遇到了这么一个问题：

> Could not start a new session
> 
> Be sure the Appium server is running with an application opened by using the "App Path" parameter in Appium.app (along with package and activity for Android) or by connecting with selenium client and supplying this in the desired capabilities object.

挺奇怪的，我的`Appium`是最新版的，`Xcode`是最新的，包括模拟器也都是最新的，为什么会报这个奇怪的错。看这个报错的意思，是因为我没有在`App Path`上配置我的`App`，但是我已经做了相关配置，而且在跑`Demo`的时候也没有遇到这样的问题。

## 解决方案
有问题当然是找万能的`Google`。不过在搜的过程中，虽然有很多人遇到类似的问题，不过基本上都是端口没有配置对。基本上找不到可以解决问题的方案。

最后没办法，只能自己硬着头皮去看日志了。日志很长，我就不全部贴了，贴一个关键的地方。

> [MJSONWP] Calling AppiumDriver.createSession() with args: [{"platformName":"iOS","platformVersion":"8.4","app":"/Users/SvenWeng/Library/Developer/Xcode/DerivedData/HLSC_iOS-bdhwxwdycvlcikacthovhpujxicb/Bui...
> [Appium] Creating new IosDriver session
> [Appium] Capabilities:
> [Appium]   platformName: 'iOS'
> [Appium]   platformVersion: '8.4'
> [Appium]   app: '/Users/SvenWeng/Library/Developer/Xcode/DerivedData/HLSC_iOS-bdhwxwdycvlcikacthovhpujxicb/Build/Products/Debug-iphonesimulator/HLSC_iOS.app'
> [Appium]   automationName: 'Appium'
> [Appium]   deviceName: 'iPhone 5s'
> [Appium]   showIOSLog: true

> [debug] [iOS] Not auto-detecting udid.
> [BaseDriver] Using local app '/Users/SvenWeng/Library/Developer/Xcode/DerivedData/HLSC_iOS-bdhwxwdycvlcikacthovhpujxicb/Build/Products/Debug-iphonesimulator/HLSC_iOS.app'

> [debug] [Instruments] Available devices: Apple TV 1080p (9.2) [44F8DE38-FF72-45B7-9ACA-3F672B6379F1] (Simulator),iPad 2 (9.3) [816AE53B-02BA-4DE2-9BB3-55DDAF2783B1] (Simulator),iPad Air (9.3) [CD83EDC1-16EE-46A0-BC05-2AF844F9021D] (Simulator),iPad Air 2 (9.3) [F830CC23-169D-4785-9867-EFE168E91FCD] (Simulator),iPad Pro (9.3) [1376C2E1-A56F-4E43-AF59-A4EEB981DC63] (Simulator),iPad Retina (9.3) [926EEE63-64C6-4C82-ADE4-E0A3E6E87D0D] (Simulator),iPhone 4s (9.3) [0A818680-510E-4971-A61C-6959AA8257C1] (Simulator),iPhone 5 (9.3) [663A8C62-2E93-438F-970C-FFB4BF7D549B] (Simulator),iPhone 5s (9.3) [39D1C620-D85C-4DC7-9F52-6E765A5CD764] (Simulator),iPhone 6 (9.3) [AF7A72E9-E886-438E-80D7-BAF53AEDFFD5] (Simulator),iPhone 6 Plus (9.3) [E23435AA-1E56-4503-A3D8-C8E313412EB7] (Simulator),iPhone 6s (9.3) [0DFB756B-A5A0-48AE-BB02-6A5BAF32BA89] (Simulator),iPhone 6s (9.3) + Apple Watch - 38mm (2.2) [8F013A8C-94B3-4A86-8573-FDE9D36A1DEC] (Simulator),iPhone 6s Plus (9.3) [126374FA-1277-4CCE-9AA0-3255E9D5C378] (Simulator),iPhone 6s Plus (9.3) + Apple Watch - 42mm (2.2) [DA74EE00-66F5-41F8-B659-995D49354E8F] (Simulator)

> [iOS] Error: Could not find a device to launch. You requested 'iPhone 5s (8.4)', but the available devices were: ["Apple TV 1080p (9.2) [44F8DE38-FF72-45B7-9ACA-3F672B6379F1] (Simulator)","iPad 2 (9.3) [816AE53B-02BA-4DE2-9BB3-55DDAF2783B1] (Simulator)","iPad Air (9.3) [CD83EDC1-16EE-46A0-BC05-2AF844F9021D] (Simulator)","iPad Air 2 (9.3) [F830CC23-169D-4785-9867-EFE168E91FCD] (Simulator)","iPad Pro (9.3) [1376C2E1-A56F-4E43-AF59-A4EEB981DC63] (Simulator)","iPad Retina (9.3) [926EEE63-64C6-4C82-ADE4-E0A3E6E87D0D] (Simulator)","iPhone 4s (9.3) [0A818680-510E-4971-A61C-6959AA8257C1] (Simulator)","iPhone 5 (9.3) [663A8C62-2E93-438F-970C-FFB4BF7D549B] (Simulator)","iPhone 5s (9.3) [39D1C620-D85C-4DC7-9F52-6E765A5CD764] (Simulator)","iPhone 6 (9.3) [AF7A72E9-E886-438E-80D7-BAF53AEDFFD5] (Simulator)","iPhone 6 Plus (9.3) [E23435AA-1E56-4503-A3D8-C8E313412EB7] (Simulator)","iPhone 6s (9.3) [0DFB756B-A5A0-48AE-BB02-6A5BAF32BA89] (Simulator)","iPhone 6s (9.3) + Apple Watch - 38mm (2.2) [8F013A8C-94B3-4A86-8573-FDE9D36A1DEC] (Simulator)","iPhone 6s Plus (9.3) [126374FA-1277-4CCE-9AA0-3255E9D5C378] (Simulator)","iPhone 6s Plus (9.3) + Apple Watch - 42mm (2.2) [DA74EE00-66F5-41F8-B659-995D49354E8F] (Simulator)"]

自己看日志来解决问题是最好的了。以上日志能很清楚的说明问题。

第一段说明了启动`Inspector`的配置，其中的关键就是版本给的是8.4.

第二段日志说明了没有指定`udid`，也就是说我们用的是模拟器来测试，给了一段模拟器app的地址

第三段日志列出了我的mac上所有的可用的模拟器。

第四段给了一个报错。找不到对应的设备启动，设备信息在第一段指定的，版本号是8.4的iphone5s模拟器，但是我的设备只有9.3版本。

看到这里，基本上问题就明朗了。版本不对导致的问题。`Appium`客户端的`Inspector`最高只支持8.4的版本。那么只要去`Xcode`下载8.4版本模拟器就行了。成功的效果图如下：

![效果图](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537977017221528.jpg)

## 最后
总结一下，遇到问题还是先看日志比较靠谱，虽然日志看起来东西很多，很繁琐，但是往往能帮助你解决问题的地方，还是这些日志。