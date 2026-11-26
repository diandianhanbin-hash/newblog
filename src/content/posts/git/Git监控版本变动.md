---
title: "Git监控版本变动"
publishedAt: "2016-07-12T08:20:22+08:00"
categories: ["Git"]
tags: ["Git"]
path: "/git/Git监控版本变动.html"
---

![20160710](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976400379309.jpg)

葡萄牙竟然获得了冠军，这真是不科学！！！！

## 背景
上一篇文章说道Git可以结合tar来自动打升级包，如果要每次去开发环境执行监控代码，那其实意义并不大，这篇文章介绍的是写一个监控程序来监控变动情况，一旦发生变动，就发邮件通知自己，然后每天定时在某个时点把更新包打出来。

## 思路
思路其实很简单，就利用上一篇文章[《Git结合tar自动打升级包》](http://wybblog.applinzi.com/blog/article/63/)介绍的方法，做一个拓展就好了，流程图如下：

![git自动打包流程图](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379764244888902.jpg)

## 流程中的方法

* 定时执行`git status -s`来监控是否有新的改动，如果返回空，则表示没变动。
* 发生了新的变动，就提交版本，然后邮件通知变动的内容
* 在某个时点打上`tag`，然后校验最后两次`tag`的内容，把变动打出升级包，然后邮件通知
* 如果两次`tag`没有发生变动，就表示没有发生变化，就直接退出

## 动手
理清了思路之后，整个流程很简单，就是用`Python`来控制`Shell`去执行`Git`，按照流程一步一步走下来就行了。

### 常用方法封装

```python
import os
import time
from NetEastMail import NetEastMail

class CommandExec(object):
	def __init__(self):
		pass

	def direExec(self, command):
		os.system(command)

	def listExec(self, command):
		fileobj = os.popen(command)
		return fileobj

	def fileObjAnaNoNull(self, command):
		data = [x.strip() for x in self.listExec(command)]
		return data

	def fileObjAnaNative(self, command):
		data = [x for x in self.listExec(command)]
		return data
```

在整个过程中会经常用到执行命令和对命令返回值的校验，所以对这些常用的方法做一下封装。

代码中的`from NetEastMail import NetEastMail`是之前一篇文章[《用Python写一个发邮件的模块》](http://wybblog.applinzi.com/blog/article/53/)写的发邮件的方法。

### Git监控的处理

```python
class GitDeal(CommandExec):
	def __init__(self):
		CommandExec.__init__(self)
		self.smdl = NetEastMail.MyNetEastMail('plain')
		self.gitstatus = "git status -s"
		self.gitcommit = "git commit -m'hlzq{}'".format(time.strftime("%Y%m%d%H"))
		self.gitadd = "git add ."
		self.gittag = "git tag hlzq{}".format(time.strftime("%Y%m%d"))
		self.getnewtags = "git tag"

	def getNewTag(self):
		data = [x.strip() for x in self.fileObjAnaNoNull(self.getnewtags)]
		return data

	def tagDiff(self):
		new = self.getNewTag()[-1]
		old = self.getNewTag()[-2]
		diff = "git diff {} {} --name-only".format(new, old)
		data = [x.strip() for x in self.fileObjAnaNoNull(diff)]
		return data

	def tarUpdate(self):
		new = self.getNewTag()[-1]
		old = self.getNewTag()[-2]
		update = "git diff {} {} --name-only | xargs tar -cvf {}update.tar".format(new, old, time.strftime("%Y%m%d"))
		self.direExec(update)

	def run(self):
		changeText = ""
		theme = ""
		if len(self.fileObjAnaNoNull(self.gitstatus)) != 0:
			changeText = "请认真核对变动信息是否正确,变动信息如下:\n\n" + "\n".join(self.fileObjAnaNoNull(self.gitstatus))
			theme = "开发环境{}发生变动,请核对变动信息".format(time.strftime("%Y%m%d%H"))
			self.direExec(self.gitadd)
			self.direExec(self.gitcommit)
		if time.strftime("%H") == "9":
			self.direExec(self.gittag)
			if len(self.tagDiff()) == 0:
				self.direExec("git tag -d {}".format(self.getNewTag()[-1]))
			changeText = "本次更新内容详情如下: \n\n" + "\n".join(self.tagDiff())
			theme = "Tag与更新包已经打完,请下载更新包更新到测试环境"
			self.tarUpdate()
		if changeText != "":
			self.smdl.sendMailByNetEastMail(changeText, theme)
		else:
			print "暂无变动"
```

到此为止，基本的代码就写完了，只要执行`Gitdeal（）中的run方法就行了`。

## 监控程序
说了要自动处理，那么就一定要带一个监控程序。其实监控程序就是上面那个东东。只是少了个循环执行的东西，我比较喜欢用另外的启动程序来启动这个程序，可以在启动程序中加很多东西，简单的就比如这样：

```python
import os
import time
while True:
	os.system("python gitmanager.py")
	time.sleep(3600)
```

循环的时间自己是可以控制的，要实时获取数据，就把`sleep`的时间减少就行了。

## 结语
`Python`是一个很强大的胶水语言，学好了可以帮助工作中做很多有意义的事，可以节省大量时间来投入一些有意义的事中。

## 巨大的坑
本来应该结束了，但是在部署的时候发现了一个巨大的坑。公司的服务器是windows的，诶~~~用了才知道到底是多坑。

整个流程的核心是自动打包。结果在windows上`xargs`和`tar`都不能用，真是坑爹。

当然，也不是没办法解决，在windows上cmd要执行某个命令，那么就需要把环境变量配到`*.exe`的路径，在windows上我发现`GitBash`是可以使用`Linux`的命令，那么肯定有相关的可执行文件在`Git`安装目录下。我发现`C:\Program Files (x86)\Git\usr\bin`路径中有大量`Linux命令的可执行文件`，那么我只要把这个路径配到环境变量就行了，试了一下，果然成功了。