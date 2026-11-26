---
title: "MonkeyRunner—环境搭建（Mac）"
publishedAt: "2016-05-17T15:56:43+08:00"
categories: ["Test"]
tags: ["MonkeyRunner","测试"]
path: "/Test/MonkeyRunner—环境搭建（Mac）.html"
---

## 背景
之前想学习自动化测试的时候，就研究过`MonkeyRunner`，说实话`MonkeyRunner`在一定程度上是有局限性的，但是在某些方面解决问题来看，是非常方便的。比如使用Monkey测试的时候，无法很好的控制`Monkey`的落点。不能保证所有的页面都测到，因此可以使用`MonkeyRunner`来定制脚本，保证每个`Activity`都能覆盖。

## 机器环境
其实一开始我是想找一个现成的教程学学，结果发现基本上说的都是Windows环境下，只能自己摸索摸索。

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7

IDE：Sublime Text 3

***

## MonkeyRunner环境
`MonkeyRunner`是`AndroidSDK`自带的一个东西，在`SDK`目录中的`tools`文件夹中，直接带有`MonkeyRunner`。

![路径](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976941095854.jpg)

这个命令可以直接使用命令行工具的`open`方法来直接打开命令，会进入`Jyhon`的命令行:

```bash
SvenWeng@wengyanbindeMacBook-Pro:~/Desktop/android-sdk-macosx/tools|
⇒  monkeyrunner
Jython 2.5.3 (2.5:c56500f08d34+, Aug 13 2012, 14:54:35)
[Java HotSpot(TM) 64-Bit Server VM (Oracle Corporation)] on java1.7.0_79
>>>
```

在这里直接输入命令：

```python
from com.android.monkeyrunner import MonkeyRunner
```

没有报错说明MonkeyRunner命令是没问题的，现在需要把MonkeyRunner配置到环境变量中。

### 配置MonkeyRunner到环境变量
在Mac中，环境变量有好多个，一般来说，我们说的环境变量就是一个配置文件，如果你使用的是Mac的默认命令行终端，那么你用的就是bash，你需要在bash_profile中添加环境变量：

```bash
open ~/.bash_profile
```

打开文件后，需要输入这些内容：

```bash
export PATH=${PATH}:/Users/SvenWeng/Desktop/android-sdk-macosx/platform-tools/:/Users/SvenWeng/Desktop/android-sdk-macosx/tools/
```

然后保存后关闭文件，需要注意的是，上面的命令配置sdk的路径是我的，你的肯定不一样，需要把路径做一些修改。然后执行:

```bash
source ~/.bash_profile
```

如果你使用的是zsh，那么环境变量就是:

```bash
~/.zshrc
```

同样的内容放置进去即可。

上面的配置完毕之后打开命令行工具运行`monkeyrunner`，如果成功的进入了`Jython`，那么恭喜你，`MonkeyRunner`的环境已经配置成功。如果失败，请按照上面的方法仔细检查检查。

## 第一个Demo
配置完毕之后，我们需要运行一下脚本检查是否运行成功，`MonkeyRunner`的API是python的，那么我们就要写一个python的demo。

```python
import sys
from com.android.monkeyrunner import MonkeyRunner as mr

device = mr.waitForConnection()
if device:
	device.startActivity(component='com.weizq/com.zztzt.android.simple.app.MainActivity')

```

上面代码中，`startActivity`方法中需要填入你需要启动的`Activity`。请使用adb或者咨询开发拿到相关`Activity`名称。

### 运行demo
运行的方法很简单，命令是`monkeyrunner` + py文件的路径，比如我这样：

```bash
monkeyrunner test.py
```

我直接用文件名是因为我已经把`shell`的路径进到和文件同一层级了，如果不在同一层级，可以使用绝对路径。