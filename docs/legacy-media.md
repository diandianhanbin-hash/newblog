# 旧博客媒体迁移清单

2026-11-26 从腾讯云托管下载文章 HTML，提取正文图片并按地址去重。以无登录状态请求 HTTPS，检查 HTTP 状态和媒体类型。

- 198 个腾讯云 COS 图片地址通过检查，文章沿用这些地址。
- 8 个第三方图片地址通过 HTTPS 检查，文章已改用 HTTPS，后续可迁入腾讯云开发云存储。
- 17 个图片地址待恢复，文章保留原地址和可见的「原图待补」提示。其中 13 个 HTTPS 请求未成功，3 个返回 404，另 1 个相对文件未见于旧托管清单。
- 旧文章正文未发现音视频。新文章可引用腾讯云开发云存储的公开 HTTPS 地址并使用原生播放器。

| 文章 | 源图片 | 状态 |
| --- | --- | --- |
| [RobotFramework初识](../src/content/posts/robotframework/RobotFramework%E5%88%9D%E8%AF%86.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com/th.jpg>) | HTTPS 请求未成功 |
| [RobotFramework初识](../src/content/posts/robotframework/RobotFramework%E5%88%9D%E8%AF%86.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com/QQ%E5%9B%BE%E7%89%8720170421093445.png>) | HTTPS 请求未成功 |
| [RobotFramework之Dialogs](../src/content/posts/robotframework/RobotFramework%E4%B9%8BDialogs.md) | [旧地址](<http://o9iqz76t2.bkt.clouddn.com/exec.png>) | HTTPS 请求未成功 |
| [RobotFramework之Dialogs](../src/content/posts/robotframework/RobotFramework%E4%B9%8BDialogs.md) | [旧地址](<http://o9iqz76t2.bkt.clouddn.com/selections.png>) | HTTPS 请求未成功 |
| [RobotFramework之Dialogs](../src/content/posts/robotframework/RobotFramework%E4%B9%8BDialogs.md) | [旧地址](<http://o9iqz76t2.bkt.clouddn.com/inputDialogs.png>) | HTTPS 请求未成功 |
| [RobotFramework之Dialogs](../src/content/posts/robotframework/RobotFramework%E4%B9%8BDialogs.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com//1495456206.png>) | HTTPS 请求未成功 |
| [Appium--无安卓源码的一些准备](../src/content/posts/Test/Appium--%E6%97%A0%E5%AE%89%E5%8D%93%E6%BA%90%E7%A0%81%E7%9A%84%E4%B8%80%E4%BA%9B%E5%87%86%E5%A4%87.md) | [旧地址](<http://ww3.sinaimg.cn/mw690/811987cbgw1f20rbgiuv4j20wi0kcqcu.jpg>) | HTTPS 可访问，待迁入云存储 |
| [Appium--无安卓源码的一些准备](../src/content/posts/Test/Appium--%E6%97%A0%E5%AE%89%E5%8D%93%E6%BA%90%E7%A0%81%E7%9A%84%E4%B8%80%E4%BA%9B%E5%87%86%E5%A4%87.md) | [旧地址](<http://ww1.sinaimg.cn/mw690/811987cbgw1f20ri5te6xj21kw11ok72.jpg>) | HTTPS 可访问，待迁入云存储 |
| [Appium--无安卓源码的一些准备](../src/content/posts/Test/Appium--%E6%97%A0%E5%AE%89%E5%8D%93%E6%BA%90%E7%A0%81%E7%9A%84%E4%B8%80%E4%BA%9B%E5%87%86%E5%A4%87.md)、[Appium——处理混合APP中H5的操作](../src/content/posts/Test/Appium%E2%80%94%E2%80%94%E5%A4%84%E7%90%86%E6%B7%B7%E5%90%88APP%E4%B8%ADH5%E7%9A%84%E6%93%8D%E4%BD%9C.md) | [旧地址](<http://ww1.sinaimg.cn/mw690/811987cbgw1f20rlzwtwwj21kw103thr.jpg>) | HTTPS 可访问，待迁入云存储 |
| [Appium——处理混合APP中H5的操作](../src/content/posts/Test/Appium%E2%80%94%E2%80%94%E5%A4%84%E7%90%86%E6%B7%B7%E5%90%88APP%E4%B8%ADH5%E7%9A%84%E6%93%8D%E4%BD%9C.md) | [旧地址](<http://ww3.sinaimg.cn/mw690/811987cbgw1f25r2354hcj21d4120n6k.jpg>) | HTTPS 可访问，待迁入云存储 |
| [Appium——处理混合APP中H5的操作](../src/content/posts/Test/Appium%E2%80%94%E2%80%94%E5%A4%84%E7%90%86%E6%B7%B7%E5%90%88APP%E4%B8%ADH5%E7%9A%84%E6%93%8D%E4%BD%9C.md) | [旧地址](<http://ww1.sinaimg.cn/mw690/811987cbgw1f25rku93r2j21kw176grv.jpg>) | HTTPS 可访问，待迁入云存储 |
| [AndroidTestTool开发笔记](../src/content/posts/Test/AndroidTestTool%E5%BC%80%E5%8F%91%E7%AC%94%E8%AE%B0.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com/D40ABEF3-5AFF-4107-8DE9-1219E92A724E.png>) | HTTPS 请求未成功 |
| [AndroidTestTool开发笔记](../src/content/posts/Test/AndroidTestTool%E5%BC%80%E5%8F%91%E7%AC%94%E8%AE%B0.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com/02C218C4-5922-439C-A63B-10BC5661C5F4.png>) | HTTPS 请求未成功 |
| [Android和Appium自学自测（一）](../src/content/posts/Test/Android%E5%92%8CAppium%E8%87%AA%E5%AD%A6%E8%87%AA%E6%B5%8B%EF%BC%88%E4%B8%80%EF%BC%89.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com//1482995586.png>) | HTTPS 请求未成功 |
| [Android和Appium自学自测（一）](../src/content/posts/Test/Android%E5%92%8CAppium%E8%87%AA%E5%AD%A6%E8%87%AA%E6%B5%8B%EF%BC%88%E4%B8%80%EF%BC%89.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com//1482999216.png>) | HTTPS 请求未成功 |
| [Android和Appium自学自测（一）](../src/content/posts/Test/Android%E5%92%8CAppium%E8%87%AA%E5%AD%A6%E8%87%AA%E6%B5%8B%EF%BC%88%E4%B8%80%EF%BC%89.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com//1482999447.png>) | HTTPS 请求未成功 |
| [自己驱动自己—Python代码写接口测试（一）](../src/content/posts/Test/%E8%87%AA%E5%B7%B1%E9%A9%B1%E5%8A%A8%E8%87%AA%E5%B7%B1%E2%80%94Python%E4%BB%A3%E7%A0%81%E5%86%99%E6%8E%A5%E5%8F%A3%E6%B5%8B%E8%AF%95%EF%BC%88%E4%B8%80%EF%BC%89.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com//1477396588.png>) | HTTPS 请求未成功 |
| [自己驱动自己—Python代码写接口测试（一）](../src/content/posts/Test/%E8%87%AA%E5%B7%B1%E9%A9%B1%E5%8A%A8%E8%87%AA%E5%B7%B1%E2%80%94Python%E4%BB%A3%E7%A0%81%E5%86%99%E6%8E%A5%E5%8F%A3%E6%B5%8B%E8%AF%95%EF%BC%88%E4%B8%80%EF%BC%89.md) | [旧地址](<http://7xsgl3.com1.z0.glb.clouddn.com//1477396649.png>) | HTTPS 请求未成功 |
| [Python装饰器的一些小知识](../src/content/posts/python/Python%E8%A3%85%E9%A5%B0%E5%99%A8%E7%9A%84%E4%B8%80%E4%BA%9B%E5%B0%8F%E7%9F%A5%E8%AF%86.md) | [旧地址](<https://www.wengyb.com/python/media/15290566503359.jpg>) | 旧托管清单无此相对文件 |
| [测试多个文件](../src/content/posts/python/%E6%B5%8B%E8%AF%95%E5%A4%9A%E4%B8%AA%E6%96%87%E4%BB%B6.md) | [旧地址](<http://upload-images.jianshu.io/upload_images/1228386-8bcfbd41e32d55bc.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240>) | HTTPS 可访问，待迁入云存储 |
| [Django微信开发](../src/content/posts/python/Django%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91.md) | [旧地址](<http://img.blog.csdn.net/20160131132311047>) | HTTPS 返回 404 |
| [Django微信开发](../src/content/posts/python/Django%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91.md) | [旧地址](<http://img.blog.csdn.net/20160131134123230>) | HTTPS 返回 404 |
| [Django微信开发](../src/content/posts/python/Django%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91.md) | [旧地址](<http://img.blog.csdn.net/20160131134601669>) | HTTPS 返回 404 |
| [ApplePay之殇](../src/content/posts/Talk/ApplePay%E4%B9%8B%E6%AE%87.md) | [旧地址](<http://upload-images.jianshu.io/upload_images/1228386-ee69bf66a030a1e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240>) | HTTPS 可访问，待迁入云存储 |
| [ApplePay之殇](../src/content/posts/Talk/ApplePay%E4%B9%8B%E6%AE%87.md) | [旧地址](<http://upload-images.jianshu.io/upload_images/1228386-2620368f276afd2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240>) | HTTPS 可访问，待迁入云存储 |
