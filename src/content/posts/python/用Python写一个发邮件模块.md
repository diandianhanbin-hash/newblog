---
title: "用Python写一个发邮件模块"
publishedAt: "2016-05-28T01:16:08+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/用Python写一个发邮件模块.html"
---

## 背景
在开发的过程中，很可能经常需要记录一些日志，这些日志一般来说需要定时的发送到自己的邮箱，让自己能够随时监控程序的状态。

之前我写过一个一次性使用的，但是发现工作中经常会用到这个功能，那么能不能写一个通用的模块，放到Python的系统目录，每次需要使用的时候，只要导入包调用它就行了呢？

## 环境和思路

***

操作系统：Mac OS X EI Caption

Python版本：2.7

IDE：Pycharm

***

思路其实很简单，整个书写的过程就是先按照面向过程的方法一步一步写代码，先把功能实现了，再对功能进行封装。

## 开始写方法

### 导入依赖的包

```python
import smtplib
from email.mime.text import MIMEText
```

### 书写的方法

```python
msgtype = 'html'
mailto_list = ["xxx@qq.com"]
mail_host = "smtp.163.com"
mail_user = "xxx@163.com"
mail_pwd = "xxx"
		
me = u"点点寒彬|SvenWeng" + "<" + mail_user + ">"
msg = MIMEText("<h1>Hello World!</h1>", _subtype=msgtype, _charset='utf8')
msg['Subject'] = theme
msg['From'] = me
msg['To'] = ";".join(mailto_list)
try:
	s = smtplib.SMTP()
	s.connect(mail_host)  # 连接smtp服务器
	s.login(mail_user, mail_pwd)  # 登陆服务器
	s.sendmail(me,mailto_list, msg.as_string())  # 发送邮件
	s.close()
	return True
except Exception, e:
	print str(e)
	return False
```

几个比较重要的点。

* 协议是使用smtp协议发送的，理论上所有支持这个协议的邮箱都适用，我是用163邮箱来作为发件箱
* 收件人的数据类型是一个列表，在日常使用的过程中，我们很可能需要发送给多个人邮件，因此我们需要将它作为列表
* me字段表示发件人信息，分为两部分，第一部分是展示的名字，比如我这里展示为u"点点寒彬|SvenWeng"，第二部分是你的发件箱地址，这里当然可以随意填一个地址，但是在某些收件客户端（比如QQ邮箱）就会提示你这个发件人有问题，所以这里我建议和发件箱地址一致。

接下来发送的方法就没什么好说了，就是固定的格式，照着写就行了，直接运行，收件箱应该能够正常的收到这封测试邮件。

## 封装成类
想要做成通用的类，那么必须要按照面向对象的方法重新规划成类。直接上代码：

```python
# ecoding=utf-8
# Author: 点点寒彬 | Sven_Weng
# Email : diandianhanbin@gmail.com
import smtplib
from email.mime.text import MIMEText

class MyNetEastMail(object):
	"""
	入参msgtype
	msgtype:{普通文本:plain},{html:html}
	"""

	def __init__(self, msgtype):
		"""
		初始化入参
		:param msgtype: {普通文本:plain},{html:html}
		"""
		self._msgtype = msgtype
		self._mailto_list = ["xxx@qq.com"]
		self._mail_host = "smtp.163.com"
		self._mail_user = "xxx@163.com"
		self._mail_pwd = "xxx"

	def sendMailByNetEastMail(self, content, theme):
		"""
		发送邮件
		:param content:邮件正文内容,可以是html,也可以是文本
		:param theme: 邮件的主体
		:return: True or False
		"""
		if not self.checkInstance():
			print "入参输入错误,请检查msgtype,只能是plain或者html"
			return False
		me = u"翁彦彬|SvenWeng" + "<" + self._mail_user + ">"
		msg = MIMEText(content, _subtype=self._msgtype, _charset='utf8')
		msg['Subject'] = theme
		msg['From'] = me
		msg['To'] = ";".join(self._mailto_list)
		try:
			s = smtplib.SMTP()
			s.connect(self._mail_host)  # 连接smtp服务器
			s.login(self._mail_user, self._mail_pwd)  # 登陆服务器
			s.sendmail(me, self._mailto_list, msg.as_string())  # 发送邮件
			s.close()
			return True
		except Exception, e:
			print str(e)
			return False

	def checkInstance(self):
		if self._msgtype == "html":
			return True
		elif self._msgtype == "plain":
			return True
		else:
			return False

if __name__ == '__main__':
	sdml = MyNetEastMail('plain')
	sdml.sendMailByNetEastMail("<h1>test</h1>", "zhuticeshi")
```

还是那么几个注意的点：

* 可以根据自己的需要做不同的封装，我这里吧发件邮箱和收件邮箱等信息全部都写死了，读者可以根据需要做一个配置文件或者其他方式获取，这取决于你的需求。
* 方法有两种，一种是普通文本，另一种是html方式，两种方式的区别只在于_subtype的取值，html就表示html，plain表示普通文本，我在类里面做了说明，因此在初始化的时候要给一个类型。
* 把文本类型剥离出来之后，在调用发送方法之前，要做一下检查，所以有了checkInstance方法。

## 放到系统目录下
这里涉及到Python的导入机制。当import一个包时，Python会先查找系统级别目录下的所有包，如果没有，再查找import路径的包，如果都没有则报错。

所以根据上面的条件，我们需要把我们写好的包放到系统级别的目录中。

PS：Python的包需要放在一个文件夹中，并且必须有__init__.py。否则不算一个Python包

在交互模式下输入如下命令：

```python
import sys
sys.path
```

命令行会输出以下内容：

```bash
['', '/Library/Python/2.7/site-packages/node-0.9.16-py2.7.egg', '/Library/Python/2.7/site-packages/zope.component-4.2.2-py2.7.egg', '/Library/Python/2.7/site-packages/zope.deprecation-4.1.2-py2.7.egg', '/Library/Python/2.7/site-packages/zope.lifecycleevent-4.1.0-py2.7.egg', '/Library/Python/2.7/site-packages/plumber-1.3.1-py2.7.egg', '/Library/Python/2.7/site-packages/odict-1.5.1-py2.7.egg', '/Library/Python/2.7/site-packages/zope.event-4.1.0-py2.7.egg', '/Library/Python/2.7/site-packages/npm-0.1.1-py2.7.egg', '/Library/Python/2.7/site-packages/optional_django-0.1.0-py2.7.egg', '/Library/Python/2.7/site-packages/autopep8-1.2.2-py2.7.egg', '/Library/Python/2.7/site-packages/pep8-1.7.0-py2.7.egg', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python27.zip', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/plat-darwin', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/plat-mac', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/plat-mac/lib-scriptpackages', '/System/Library/Frameworks/Python.framework/Versions/2.7/Extras/lib/python', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/lib-tk', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/lib-old', '/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/lib-dynload', '/System/Library/Frameworks/Python.framework/Versions/2.7/Extras/lib/python/PyObjC', '/Library/Python/2.7/site-packages']
```

这样打出来的列表，就是Python系统级别的目录，import的时候会优先在这些目录下寻找，所以我们只要把我们的包放到这里就行了。

## 在交互命令行中测试是否成功
在我们的交互命令后中输入python进入命令行页面，只要导入不报错，我们就可以在任意的脚本中直接引用我们写好的这个模块了。

```
>>> from NetEastMail import NetEastMail
>>> nem = NetEastMail('html')
>>> nem = NetEastMail.MyNetEastMail('html')
>>> nem.sendMailByNetEastMail("<h1>test</h1>", "zhuticeshi")
True
```
这样我就收到测试邮件了

![邮件](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976833306109.jpg)

## 最后
当然，还有一些功能没有补上，比如发送带有图片的邮件，带有附件的文件，读者可以根据自己的需要去重新写一个方法，封装到这个类中，这样你就开发了一个属于你自己的发邮件模块了。