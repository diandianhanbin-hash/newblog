---
title: "Appium环境搭建"
publishedAt: "2015-11-21T14:48:56+08:00"
categories: ["Test"]
tags: ["Appium","测试"]
path: "/Test/Appium环境搭建.html"
---

## Appium学习之路—环境搭建
说实话，`Appium`第一次接触还是在`testerhome`看到的，介绍说这个框架可以测试安卓和IOS，并且只要写一个脚本，不需要做任何改动就可以直接在IOS和Android上运行，这真心是一个好消息，说干就干。先吧环境弄起来看看到底牛掰不牛掰。
**PS：笔者使用的是Mac OS X系统。**
## 准备工作
`Appium`提供了两种方式，一个是客户端，另一个是命令行。不过不论哪种方式，以下的东西都必须准备好
* `Xcode Command Line Tools` 这个是必须的工具可以百度以下，我是使用Mac系统，干脆直接下了一个完整的Xcode
* `Android SDK 和AVD` 这个是测试Android必须的，当然AVD可以使用Android的真机来代替。
## Appium客户端
我看到这个框架竟然还是有客户端的，真是有一种莫名的兴奋，有客户端就意味着我可以不用搭建那些操蛋的命令行了？下载一个GUI端我就可以轻轻松松的开搞了。不过下载客户端是需要翻墙的，这个有点蛋疼，我自己的专门翻墙出去下载了一个Appium for Mac的客户端，不过那速度慢得让人无法直视。官网地址：[Appium官网](http://appium.io/downloads.html)。我是不太建议在官网下载。这里推荐一个资源，下载速度比较快。[Appium国内下载地址](http://pan.baidu.com/s/1jGvAISu)。
### 客户端的使用
我个人折腾完客户端之后，感觉不是很给力，客户端虽然界面挺漂亮的，风格也挺好，不过总体折腾下来不是我喜欢的类型，如果喜欢客户端的朋友可以自己去折腾折腾客户端，配置起来很简单，就不做过多的赘述了。
## 命令行
命令行是体现逼格高大上的东东，不过折腾起来也很费事，笔者折腾这个命令行折腾了大概一周的时间，其中种种原因很多

* java环境

Mac自带了这东西，不过说实话一般的电脑也都会把这个环境折腾好吧，毕竟java是最流行的开发语言

* Python环境
 
Mac自带了这东西，因为笔者是使用Python来写脚本，当然你也可以使用其他语言来写，比如java、ruby、c#等等

* brew

brew是一个套件管理器，不过笔者比较懒，直接使用Mac自带的easy_install来安装，比较省事

* node

node也是必须的，如果有了brew或者easy_install，安装是很省事的 sudo easy_install node，输入密码就搞定了

```
>SvenWengdeMBP:~ svenweng$ node -v
v0.10.34
```

这样就算安装成功

* npm

npm这东西和node一样，也是使用安装工具来安装很方便

```
>SvenWengdeMBP:~ svenweng$ npm -v
1.4.28
```

* Appium

终于到我们的主角了安装命令是 npm install -g appium
这里要说明一下，`Appium`的安装不能使用sudo。-g是让npm自动帮我们配置Appium的环境。

```
>SvenWengdeMBP:~ svenweng$ appium -v
1.4.16
```

如果你看到了这个东西，就表示你的`Appium`已经完全安装完毕了。网上还有教程说需要安装一个wd的东西，我不知道这个是干什么的，当然我也安装了，`npm install wd`。很简单的安装

### 检查Appium的配置是否正确
执行命令`appium-doctor`，你如果看到一下的界面，就表示已经正确的安装完毕了

```
>SvenWengdeMBP:~ svenweng$ appium-doctor
> Running iOS Checks
> ✔ Xcode is installed at /Applications/Xcode.app/Contents/Developer
> ✔ Xcode Command Line Tools are installed.
> ✔ DevToolsSecurity is enabled.
> ✔ The Authorization DB is set up properly.
> ✔ Node binary found at /usr/local/bin/node
> ✔ iOS Checks were successful.

>Running Android Checks
> ✔ ANDROID_HOME is set to "/Users/svenweng/Desktop/Application/adt-bundle-mac-x86_64-20131030/sdk"
> ✔ JAVA_HOME is set to "/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Home."
> ✔ ADB exists at /Users/svenweng/Desktop/Application/adt-bundle-mac-x86_64-20131030/sdk/platform-tools/adb
> ✔ Android exists at /Users/svenweng/Desktop/Application/adt-bundle-mac-x86_64-20131030/sdk/tools/android
> ✔ Emulator exists at /Users/svenweng/Desktop/Application/adt-bundle-mac-x86_64-20131030/sdk/tools/emulator
> ✔ Android Checks were successful.
> 
> ✔ All Checks were successful
```

如果某一行签名不是打钩，而是一个红叉叉，那就表示那个配置没有安装正确

### 疑问
理论上我的`Appium`安装是正确的，但是我运行`appium`的时候出现了下面的一大串错误

```
> SvenWengdeMBP:~ svenweng$ appium
> error: uncaughtException: fn must be a function
> 
    > See http://goo.gl/916lJJ
 > date=Sat Nov 21 2015 10:37:25 GMT+0800 (HKT), pid=2504, uid=501, gid=20, cwd=/usr/local/lib/node_modules/appium, execPath=/usr/local/bin/node, version=v0.10.34, argv=[node, /usr/local/bin/appium], rss=103559168, heapTotal=86062080, heapUsed=56309664, loadavg=[1.6328125, 1.86767578125, 1.81103515625], uptime=39552, trace=[column=15, file=/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/node_modules/appium-support/node_modules/bluebird/js/main/promisify.js, function=Function.Promise.promisify, line=268, method=Promise.promisify, native=false, column=13, file=lib/fs.js, function=, line=46, method=null, native=false, column=26, file=module.js, function=Module._compile, line=456, method=_compile, native=false, column=10, file=module.js, function=Object.Module._extensions..js, line=474, method=Module._extensions..js, native=false, column=32, file=module.js, function=Module.load, line=356, method=load, native=false, column=12, file=module.js, function=Function.Module._load, line=312, method=Module._load, native=false, column=17, file=module.js, function=Module.require, line=364, method=require, native=false, column=17, file=module.js, function=require, line=380, method=null, native=false, column=11, file=/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/node_modules/appium-support/build/lib/tempdir.js, function=, line=12, method=null, native=false, column=26, file=module.js, function=Module._compile, line=456, method=_compile, native=false, column=10, file=module.js, function=Object.Module._extensions..js, line=474, method=Module._extensions..js, native=false, column=32, file=module.js, function=Module.load, line=356, method=load, native=false, column=12, file=module.js, function=Function.Module._load, line=312, method=Module._load, native=false, column=17, file=module.js, function=Module.require, line=364, method=require, native=false, column=17, file=module.js, function=require, line=380, method=null, native=false, column=19, file=/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/node_modules/appium-support/build/index.js, function=, line=11, method=null, native=false, column=26, file=module.js, function=Module._compile, line=456, method=_compile, native=false, column=10, file=module.js, function=Object.Module._extensions..js, line=474, method=Module._extensions..js, native=false, column=32, file=module.js, function=Module.load, line=356, method=load, native=false, column=12, file=module.js, function=Function.Module._load, line=312, method=Module._load, native=false, column=17, file=module.js, function=Module.require, line=364, method=require, native=false, column=17, file=module.js, function=require, line=380, method=null, native=false, column=42, file=lib/proxy.js, function=, line=2, method=null, native=false, column=26, file=module.js, function=Module._compile, line=456, method=_compile, native=false, column=10, file=module.js, function=Object.Module._extensions..js, line=474, method=Module._extensions..js, native=false, column=32, file=module.js, function=Module.load, line=356, method=load, native=false, column=12, file=module.js, function=Function.Module._load, line=312, method=Module._load, native=false, column=17, file=module.js, function=Module.require, line=364, method=require, native=false, column=17, file=module.js, function=require, line=380, method=null, native=false, column=17, file=/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/build/index.js, function=, line=9, method=null, native=false, column=26, file=module.js, function=Module._compile, line=456, method=_compile, native=false, column=10, file=module.js, function=Object.Module._extensions..js, line=474, method=Module._extensions..js, native=false, column=32, file=module.js, function=Module.load, line=356, method=load, native=false, column=12, file=module.js, function=Function.Module._load, line=312, method=Module._load, native=false, column=17, file=module.js, function=Module.require, line=364, method=require, native=false, column=17, file=module.js, function=require, line=380, method=null, native=false, column=28, file=lib/chromedriver.js, function=, line=3, method=null, native=false, column=26, file=module.js, function=Module._compile, line=456, method=_compile, native=false, column=10, file=module.js, function=Object.Module._extensions..js, line=474, method=Module._extensions..js, native=false, column=32, file=module.js, function=Module.load, line=356, method=load, native=false], stack=[TypeError: fn must be a function, ,     See http://goo.gl/916lJJ, ,     at Function.Promise.promisify (/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/node_modules/appium-support/node_modules/bluebird/js/main/promisify.js:268:15),     at Object.<anonymous> (lib/fs.js:46:13),     at Module._compile (module.js:456:26),     at Object.Module._extensions..js (module.js:474:10),     at Module.load (module.js:356:32),     at Function.Module._load (module.js:312:12),     at Module.require (module.js:364:17),     at require (module.js:380:17),     at Object.<anonymous> (/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/node_modules/appium-support/build/lib/tempdir.js:12:11),     at Module._compile (module.js:456:26),     at Object.Module._extensions..js (module.js:474:10),     at Module.load (module.js:356:32),     at Function.Module._load (module.js:312:12),     at Module.require (module.js:364:17),     at require (module.js:380:17),     at Object.<anonymous> (/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/node_modules/appium-support/build/index.js:11:19),     at Module._compile (module.js:456:26),     at Object.Module._extensions..js (module.js:474:10),     at Module.load (module.js:356:32),     at Function.Module._load (module.js:312:12),     at Module.require (module.js:364:17),     at require (module.js:380:17),     at Object.<anonymous> (lib/proxy.js:2:42),     at Module._compile (module.js:456:26),     at Object.Module._extensions..js (module.js:474:10),     at Module.load (module.js:356:32),     at Function.Module._load (module.js:312:12),     at Module.require (module.js:364:17),     at require (module.js:380:17),     at Object.<anonymous> (/usr/local/lib/node_modules/appium/node_modules/appium-chromedriver/node_modules/appium-jsonwp-proxy/build/index.js:9:17),     at Module._compile (module.js:456:26),     at Object.Module._extensions..js (module.js:474:10),     at Module.load (module.js:356:32),     at Function.Module._load (module.js:312:12),     at Module.require (module.js:364:17),     at require (module.js:380:17),     at Object.<anonymous> (lib/chromedriver.js:3:28),     at Module._compile (module.js:456:26),     at Object.Module._extensions..js (module.js:474:10),     at Module.load (module.js:356:32)]
```

求大神给一个解答吧。


翻墙工具正常了，我进入了命令行提示的错误网址
网址上显示的是这个
```
Error: fn must be a function

This page is here for the sake of completeness. There really is nothing much to add on that error.
```

翻译过来就是：
错误： FN必须是一个函数

这页是这里为了完整性。真的是没有什么补充该错误。

***

折腾了一天，终于把问题搞定了，问题的原因是因为node的版本太旧了导致的，原因分析在[1楼回答的那个链接上](https://github.com/appium/appium/issues/5814)，再说说今天自己折腾过程中遇到的问题吧，我在网上搜索帖子的时候说需要吧node卸载了才能升级（我真是天真）。于是按照步骤手贱删除了一些不应该删除的东西，结果搞的很乱，思路都乱了，不知道从何下手。于是我就去睡了一觉，醒来重新折腾，重新去官网下了一个node的安装包，把之前干掉的node环境重新部署好。再使用npm install -g appium的时候，一直会出现这个问题

```
> SvenWengdeMBP:~ svenweng$ npm install -g appium
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-10484-941ff227/registry.npmjs.org/appium-uiauto/-/appium-uiauto-1.10.10.tgz
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-10484-941ff227/registry.npmjs.org/appium-instruments/-/appium-instruments-2.0.6.tgz
> loadRequestedDeps → netwo ▐ ╢███████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░╟
> ^C
> SvenWengdeMBP:~ svenweng$ sudo chmod -r 777 /usr/local
> Password:
> chmod: 777: No such file or directory
> SvenWengdeMBP:~ svenweng$ sudo chmod -R 777 /usr/local
> SvenWengdeMBP:~ svenweng$ npm install -g appium
> loadRequestedDeps → netwo ▄ ╢███████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░╟
> ^C
> SvenWengdeMBP:~ svenweng$ npm install -g appium
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/hoek/-/hoek-2.16.3.tgz
> npm ERR! tar.unpack untar error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/hoek/-/hoek-2.16.3.tgz
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.8.tgz
> npm ERR! tar.unpack untar error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.8.tgz
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/core-js/-/core-js-0.9.18.tgz
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/appium-adb/-/appium-adb-1.7.5.tgz
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/appium-instruments/-/appium-instruments-2.0.6.tgz
> npm ERR! tar.unpack unzip error /var/folders/hm/04tcnt812v909nysd8jgl0100000gn/T/npm-13599-e762bf07/registry.npmjs.org/appium-uiauto/-/appium-uiauto-1.10.10.tgz
> npm ERR! Darwin 15.0.0
> npm ERR! argv "/usr/local/bin/node" "/usr/local/bin/npm" "install" "-g" "appium"
> npm ERR! node v5.1.0
> npm ERR! npm  v3.3.12
> npm ERR! code Z_BUF_ERROR
> npm ERR! errno -5
> 
> npm ERR! unexpected end of file
> npm ERR! 
> npm ERR! If you need help, you may report this error at:
> npm ERR!     <https://github.com/npm/npm/issues>
> 
> npm ERR! Please include the following file with any support request:
> npm ERR!     /Users/svenweng/npm-debug.log
```

每次安装到一半都安装不下去，我的电脑也是翻墙的，按道理应该也都能下载才对，具体详细的原因请恕我是小白，不太懂这个。不过我换了一个下载源就把这个问题搞定了，这里发出来，希望下次有遇到这种问题的朋友不会在这个地方浪费太多时间。命令是这个：`npm -g --registry http://registry.cnpmjs.org  install appium`

前前后后折腾了差不多一周的环境，终于把环境的问题搞定了，希望能够更深入的学习，也给自己一个勉励。