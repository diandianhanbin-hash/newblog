---
title: "Git监控版本变动"
publishedAt: "2016-07-12T08:20:22+08:00"
categories: ["Git","Python"]
tags: ["Git","Python"]
path: "/git/Python+Git+FTP实现内部分发网站数据的自动更新.html"
---

![20160827](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/153777781071578.jpg)

## 需求
我们的内部分发平台可以算是半个静态页面，前端用`AngularJS`写的，数据是拿一个json来实现动态展示，每次我要在本地修改完代码，然后再通过FTP传到服务器上。整个步骤有点繁琐，尤其是打包打的多的时候，每次要花上1~2分钟来折腾这个东西，我就在想自己写一个脚本来处理这个繁琐的操作，内容编辑只能手工编辑，但是上传到服务器这种操作，肯定是可以通过脚本来处理，而且必须要自动处理。

## 思路
最初的思路我是想监控整个代码，一旦发生变动，就把整个代码直接更新到服务器上，后来发现有点问题，Python的FTP并不支持文件夹上传，如果要这样实现，那么势必要递归去抓取所有的文件，再执行上传操作，效率会非常的低。

那么就只能执行增量更新的操作了，增量更新最方便的就是用`Git`来监控代码库，通过比对提交的不同点抓出变动的文件，然后将这个变动的文件上传至服务器即可。

## 开始
大概的功能是比较简单的，写起来也比较顺，不过还是有遇到一些问题的。`Python`的FTP方法，上传文件的时候只能传递在当前目录，也就是说如果文件在子文件中，就必须要切换到子文件的目录下，再执行上传操作。

```python
def getChangeFile():
	"""
	获取变动的文件名的绝对路径的列表
	:return:List
	"""
	if getChangeStatus():
		os.system('git add .')
		os.system('git commit -m"{}"'.format(time.strftime("%Y%m%d%H%M")))
	cmdrst = os.popen("git diff head head^1 --name-only").read()
	print "{}产生了变动，变动信息如下：".format(time.strftime("%Y%m%d%H%M"))
	print cmdrst
	rst = cmdrst.split('\n')
	rst.remove('')
	rstdir = [os.getcwd() + '/' + x for x in rst]
	return rstdir
```
这个方法是获取变动的文件，拼接出文件的绝对路径。

```python
def getRelaDir(absDir):
	"""
	通过绝对路径的分割来获取相对路径
	:param absDir:List, 绝对路径
	:return:List
	"""
	relaDir = []
	for x in absDir:
		dir = x.split('release')[1]
		dirlist = dir.split('/')
		for x in dirlist:
			if x == '':
				dirlist.remove('')
		relaUrl = '/'.join(dirlist)
		relaDir.append(relaUrl)
	return relaDir
```

这个方法是吧绝对路径做一次分割，获取文件相对于代码根目录的路径。

最后在执行的时候，把相对地址处理成服务器的相对地址，在上传的之前切到对应的相对地址，再使用绝对地址获取文件，执行上传操作。

## 最后
整个逻辑其实还是有优化的空间，只是已经实现了，有时候就懒的去改动了，至少在功能上已经能满足我的日常需要了，再写一个启动脚本，每5分钟监控一次，然后我要做的只是把每次安装包的内容更新一下就行了，可以省去那么几分钟。

放上整个代码：

```python
# ecoding=utf-8
# Author: 翁彦彬 | Sven_Weng
# Email : diandianhanbin@gmail.com

import os
import time
import sys

from ftplib import FTP

reload(sys)
sys.setdefaultencoding('utf8')

devIP = 'xxx.xxx.xxx.xxx'
devPort = '21'
usr = 'xxxxxx'
pwd = '123456'
url = '\\zzinfo-new\\tzt\\jy\\download\\release'
try:
	ftp = FTP()
except Exception:
	print "FTP无法建立连接"
	sys.exit(0)


def connFtp():
	"""
	连接FTP
	:return:None
	"""
	try:
		ftp.set_debuglevel(2)
		ftp.connect(devIP, devPort)
		ftp.login(usr, pwd)
	except Exception as e:
		print e
		print "FTP连接失败"
		sys.exit(0)


def quitFtp():
	"""
	断开FTP
	:return:None
	"""
	ftp.quit()


def getChangeStatus():
	"""
	获取变动的状态,有变动返回True,无变动返回False
	:return:True/False
	"""
	rst = os.popen('git status -s').read()
	if rst == '':
		return False
	else:
		return True


def getChangeFile():
	"""
	获取变动的文件名的绝对路径的列表
	:return:List
	"""
	if getChangeStatus():
		os.system('git add .')
		os.system('git commit -m"{}"'.format(time.strftime("%Y%m%d%H%M")))
	cmdrst = os.popen("git diff head head^1 --name-only").read()
	print "{}产生了变动，变动信息如下：".format(time.strftime("%Y%m%d%H%M"))
	print cmdrst
	rst = cmdrst.split('\n')
	rst.remove('')
	rstdir = [os.getcwd() + '/' + x for x in rst]
	return rstdir


def getRelaDir(absDir):
	"""
	通过绝对路径的分割来获取相对路径
	:param absDir:List, 绝对路径
	:return:List
	"""
	relaDir = []
	for x in absDir:
		dir = x.split('release')[1]
		dirlist = dir.split('/')
		for x in dirlist:
			if x == '':
				dirlist.remove('')
		relaUrl = '/'.join(dirlist)
		relaDir.append(relaUrl)
	return relaDir


def upload(filename):
	"""
	上传文件
	:param filename:文件名的绝对路径
	:return:None
	"""
	print 'uploading {}'.format(filename)
	try:
		fileHandle = open(filename, 'rb')
		ftp.storbinary('STOR {}'.format(os.path.basename(filename)), fileHandle)
		print '{} upload finished'.format(filename)
	except IOError:
		pass


def fuckDS_Store(dsdir):
	"""
	干掉该死的DS_Store
	:param dsdir: List, 绝对路径或者相对路径的集合
	:return:List
	"""
	for i, x in enumerate(dsdir):
		if 'DS_Store' in x:
			dsdir.pop(i)
	return dsdir


if __name__ == '__main__':
	if getChangeStatus():
		connFtp()
		absPATH = fuckDS_Store(getChangeFile())
		relaPATH = fuckDS_Store(getRelaDir(absPATH))
		for x, y in zip(relaPATH, absPATH):
			fileinfo = os.path.split(x)
			file_url = os.path.join(url, os.path.split(x)[0]).replace('/', '\\')
			file_name = os.path.split(x)[1]
			ftp.cwd(file_url)
			upload(y)
		quitFtp()
	else:
		print '暂无变化'
```
