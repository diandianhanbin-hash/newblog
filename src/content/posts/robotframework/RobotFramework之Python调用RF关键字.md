---
title: "RobotFramework之Python调用RF关键字"
publishedAt: "2018-02-11T17:48:33+08:00"
categories: ["RobotFramework"]
tags: ["RobotFramework"]
path: "/robotframework/RobotFramework之Python调用RF关键字.html"
---

## 背景
这个需求说实话是有那么些奇葩，因为正常的框架不会用到这个需求，要么就纯`Python`来实现，要么就纯`RobotFramework`来实现，用`RobotFramework`的时候是可以正常调用`Python`的，但是反过来就有点蛋疼了。

我们现在的框架就是基于`RobotFramework`实现的，但是由于`RobotFramework`在某些地方的扩展性太低，某些时候用`Python`来实现更为高效，不过现有的`RobotFramework`工程已经有非常多的沉淀了，要是把这部分全部重写，工作量太大了，因此就有了这么个奇葩的需求。在网上搜索了大半天后，终于还是放弃了，只能自己去看源代码来实现了。

## 简单粗暴的实现
有一种非常简单粗暴的实现方式，用`RobotFramework`写一个测试用例，然后这个用例调用对应的关键字，再用`Python`来执行这条用例，就实现了调用关键字的功能，但是这样有两个弊端。

1. 每次调用关键字都要写测试用例，非常麻烦
2. 如果要获取返回值，就很蛋疼了

## 更为优雅的实现
整个部分实现起来其实不难，只不过`RobotFramework`的源代码没有什么人去解读，也没有很好的翻译文档，其实在之前的解析文章中用到的`robot.api`中就已经涉及到这个点了，实现代码如下：


```python
class RobotAbout(object):
	"""
	调用RobotFramework的方法
	eg：
	ra = RobotAbout.RobotAbout()
	ra.exec_keywords('xxx.robot', ['获取随机数', '获取计数'])
	"""

	def exec_keyword(self, path_to_file, keyword, arg=None):
		"""
		执行RobotFramework的关键字
		:param path_to_file: String，RobotFramework文件的路径，一般是执行文件的相对路径，绝对路径也可以
		:param keyword: String，执行的关键字
		:param arg: List[String], 执行关键字的参数，如果没有则不传
		:return: None， 没有返回则表示执行通过，可以查看执行文件目录下的log.html来定位问题
		"""
		suite = TestSuite('Test')
		suite.resource.imports.resource(path_to_file)
		test = suite.tests.create('TEST', tags=['smoke'])
		if arg:
			if isinstance(arg, list):
				test.keywords.create(keyword.decode('utf-8'), args=arg)
			else:
				raise TypeError('args must be list')
		else:
			test.keywords.create(keyword.decode('utf-8'))
		result = suite.run(critical='smoke')
		if result.suite.status == 'PASS':
			pass
		else:
			ResultWriter('test.xml').write_results()
```

给我灵感的页面就在[官方的说明文档上](http://robot-framework.readthedocs.io/en/latest/autodoc/robot.running.html)，这里有一段非常有意思的说明：

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537775929.320301.jpg)

这里提供了两种方式执行`RobotFramework`，一种是用`TestSuiteBuilder`，这种其实跟我们之前的方法没啥区别，都是执行一个测试用例，第二种方法则是用`Python`来写一个`RobotFramework`的测试用例，这种思路可以通过抽象成一个类，就可以达到优雅的执行`RobotFramework`的关键字了。

需要注意，官方文档写的是`suite.resource.imports.library`，而`RobotFramework`的文件引用都是要用`Resource`来引用的，不能原样照搬。所以这里我们要去看它的源代码来实现：


```python
robot.running.model.py

class ResourceFile(object):

    def __init__(self, doc='', source=None):
        self.doc = doc
        self.source = source
        self.imports = []
        self.keywords = []
        self.variables = []

    @setter
    def imports(self, imports):
        return model.Imports(self.source, imports)

    @setter
    def keywords(self, keywords):
        return model.ItemList(UserKeyword, items=keywords)

    @setter
    def variables(self, variables):
        return model.ItemList(Variable, {'source': self.source}, items=variables)
```

从这里我们能看到，`imports`是由一个装饰器`@setter`来处理的，那么只要跟进它的方法就能看到：

```python
robot.model.imports.py

class Imports(ItemList):

    def __init__(self, source, imports=None):
        ItemList.__init__(self, Import, {'source': source}, items=imports)

    def library(self, name, args=(), alias=None):
        self.create('Library', name, args, alias)

    def resource(self, path):
        self.create('Resource', path)

    def variables(self, path, args=()):
        self.create('Variables', path, args)
```

这里就告诉了我们，`import`这个列表中可以放`library`，`resource`和`variables`

因此在这里我们只要把源代码改成`suite.resource.imports.resource(path_to_file)`就可以正常的引用`RobotFramework`的关键字了。

## 其他注意点
在调试的过程中我发现一个问题，如果关键字用中文编写，那么必须要把调用的关键字编码成`utf-8`，否则会报错找不到关键字。就像上面的代码这样处理：

```python
test.keywords.create(keyword.decode('utf-8'), args=arg)
```

或者如果你不在方法中处理，也可以这样传入参数：

```python
ra.exec_keyword('../xxx/xxx.robot', u'获取随机数')
```

