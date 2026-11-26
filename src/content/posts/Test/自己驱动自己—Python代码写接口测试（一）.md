---
title: "自己驱动自己—Python代码写接口测试（一）"
publishedAt: "2016-10-26T21:07:50+08:00"
categories: ["Test","Python"]
tags: ["测试"]
path: "/Test/自己驱动自己—Python代码写接口测试（一）.html"
---

![20161021](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537776801.484821.jpg)


## 背景
在[《聊聊接口测试》](http://wybblog.applinzi.com/blog/article/92/)中我提到了使用Jmeter的问题和局限性。

>这里其实是有一个问题的。Jmeter的学习成本其实挺大的，基础的发请求断言这类功能当然是很简单，再往后，很多细节上的处理问题，解决起来就非常非常困难，网络上很难找到类似的问题和解决方法，即使是自己去翻官方文档，也不一定就能很快的找到。

那自己写一个接口测试就迫在眉睫了，本着自己驱动自己的想法，我直接把所有内容写在代码中，自己维护起来也很快。

## 环境

***

版本相关

操作系统：Mac OS X EI Caption

Python版本：3.6

IDE：PyCharm

第三方依赖库：requests

前端：Bootstrap

可视化：Echarts

***

## 思路
这部分主要参考Jmeter的方法。先执行接口测试，然后收集执行结果，写到一个结果文件中，再用脚本去读这个结果文件，生成结果报告。Jmeter是使用xml的方式生成一个jmx的结果，我对JSON熟悉一些，就使用JSON来生成结果文件。

## 测试报告

[原图待补（报告展示）](<http://7xsgl3.com1.z0.glb.clouddn.com//1477396588.png>)

[原图待补（报告展示2）](<http://7xsgl3.com1.z0.glb.clouddn.com//1477396649.png>)

## 整体架构

```
|____Common.py
|____Debug.py
|____NewLive.py
|____outReport.py
|____report.html
|____reportData.json
|____Run.py
```

`Common.py`封装了一些通用的方法，为以后拓展多个项目做准备。

`Debug.py`是用于编写单条接口测试用例的文件，基于Pycharm对`unittest`的友好支持，调试起来非常方便。

`NewLive.py`是我的接口测试文件，里面放了所有的接口测试用例、执行方法和生成结果文件的方法。

`outReport.py`是读取结果文件生成HTML测试报告的脚本

`report.html`是测试报告。

`reportData.json`是接口测试文件生成的结果文件。

`Run.py`是启动器，运行后就会批量执行接口测试。

**注意：本工程只适用于单个接口测试项目，如果有多个接口测试项目，则需要增加一些遍历的方法。**

## 接口测试文件
这个文件是每一个接口测试项目的核心文件，整个项目的所有接口测试用例和执行方法都在这里面。

项目的每一个接口，都写一个类。这个接口的测试用例，在这个类中都以test开头。

使用`unittest`作为框架本是最方便的方法，无奈`unittest`方法对于结果文件的写入不方便，我又懒得去翻官方文档，于是简单的自己写一个启动方法。

### run方法

```python
def run(classInstance):
	"""
	执行类中的所有以test开头的方法,前提是初始化的内容要与类中的name属性一致
	:param classInstance:类
	:return:None
	"""
	funcs = []
	for x in dir(classInstance):
		if x.startswith('test'):
			funcs.append(x)
	for x in funcs:
		eval(classInstance.name+'.'+x+'()')
```

这个方法是启动测试的实现方法，`run()`方法需要传入一个类作为参数，方法中需要获取这个类中的name属性用来启动类中的测试用例，因此需要在类中专门定义这个name属性，并且实例化的时候需要与这个name属性一致。

### 接口类

```python
class StartLive:
	def __init__(self):
		self.classes = []
		self.name = 'startlive'
		InterFaceInfo = {
			'InterFaceName': 'StartLive',
			'FuncNo': 'xxx',
			'Desc': 'xxx'
		}
		self.classes.append(InterFaceInfo)
```

接口类的初始化需要定制一些内容。

`self.classes`列表用于收集这个接口的测试情况。

`self.name`需要与实例化的名称一致，用于启动测试。

`InterFaceInfo`说明接口的描述，方便测试报告展示。

### 测试用例
```python
def test001_StartLiveCommon(self):
		"""正常开始直播"""
		payload = {
			"funcNo": "XXX",
			"roomId": "XXX",
			"userId": "XXX",
			"broadIssue": time.strftime("%H%m%d") + "直播开始",
			"broadNotice": time.strftime("%H%m%d") + "直播开始",
		}

		r = requests.post(url, data=payload)
		result = r.json()

		try:
			assert result['error_no'] == '0'
			assert result['error_info'] == '创建直播并发布直播公告成功'
			consequence = "success"
		except Exception:
			consequence = 'error'

		rst_data = {
			"Url": url,
			"desc": "正常开始直播",
			"sendData": payload,
			"rspData": result,
			"result": consequence
		}
		self.classes.append(rst_data)
```

由于之前的`run()`方法是遍历以test开头的方法，因此用例的方法的命名必须以test开头。

第一部分的payload是请求的参数，第二部分是请求的方法，可以根据自己的需求使用`get`或者`post`方法。第三部分是断言部分，断言成功则给一个成功的标记，断言失败则给一个失败的标记。第四部分是测试结果的收集，信息包括url、案例描述、发送数据、接受数据和测试结果，用于最终报告的展示。第五部分就是把这个结果放到接口类初始化时候的容器中。

### 清理方法

```python
def testTearClass(self):
		reportElement.append(self.classes)
```

在执行完毕之后需要做一下数据收集，因此把初始化中的容器`self.classes`列表的内容放到`reportElement`这个大容器中。

**注意：这个方法必须放在类的最后，确保这个方法是最后一个被执行的，也就确保了所有的测试结果数据都能被收集，当然，由于要被run()方法执行到，因此命名也必须以test开头**

### 写结果文件
```python
if __name__ == '__main__':
	startlive = StartLive()
	run(startlive)

	with codecs.open('reportData.json', 'w', 'utf-8') as f:
		data = json.dumps(reportElement, sort_keys=True, indent=4)
		f.write(data)
```

最终文件的执行需要将类初始化，然后在`run()`方法中传入这个初始化的类，`run()`方法就会自动执行所有的测试用例，将结果全部归集到`reportElement`这个容器中。

再调用写json文件的方法把结果文件写出来。

## 生成测试报告
生成测试报告的核心就是去遍历这个JSON文件的内容。

```python
def exportReport(jsonName):
	"""
	根据结果报告的JSON文件生成HTML报告
	:param jsonName:{str}JSON文件名
	:return:None
	"""
	tableHead = []
	trs = []
	table = []
	global interFaceName
	with open(jsonName, 'r') as f:
		jsonData = json.loads(f.read())

	for x in jsonData:  # x表示每个接口的数据
		trbody = []
		for i, a in enumerate(x):
			if i == 0:
				interFaceName = a['InterFaceName']
				tableHead.append(exportInterfaceTableHead(
					"接口名称: {0}, 接口描述: {1}, 功能号: {2}".format(a['InterFaceName'], a['Desc'], a['FuncNo'])))
			else:
				trbody.append(
					exportTableTr(interFaceName + str(i), a['desc'], a['result'], a['sendData'], a['rspData'],
								  a['Url']))
		trs.append(''.join(trbody))

	for x, y in zip(tableHead, removeEmptyInList(trs)):
		table.append(x + y + exportBottom())

	interFaceTable = ''.join(table)
	html = htmlHead('直播接口测试', dashBoardTable(exportDashBoardTable(jsonName))) + interFaceTable + htmlFoot(jsonName)
	with codecs.open('report.html', 'w', 'utf-8') as f:
		f.write(html)
```

生成HTML结果的最优方式，肯定是用Django来做一个小后台，这样可以用模板引擎来来处理HTML，更加快速和灵活。不过为了懒得折腾后台，在整个生成结果的方法中，我用的是硬编码的方式，也就是说我把html的内容全部以字符串的形式放在代码中。然后用`format`方法把一些遍历的结果放到字符串中，最终把所有的字符串全部拼接到一起，直接写到文件中，就生成了最终的测试报告。

大部分前端展示的内容，都是使用Bootstrap来处理，比较简单直观。饼状图使用的是百度Echarts。

## 最后
这只是一个初步的结果，后期在项目增加时，需要做一些改造，比如测试报告的归档，测试用例的归档等内容，执行方法的优化等等。

