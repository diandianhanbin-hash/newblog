---
title: "从self、cls看Python的实例化"
publishedAt: "2018-11-05T00:46:09+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/从self、cls看Python的实例化.html"
---

## 背景
刚开始学习`Python`的时候经常会有一个疑问，为什么每个类方法的第一个参与一定要加一个`self`？经过一定的编码后发现，怎么还有一些类方法里面写的是`cls`？

## 实例化
在使用类方法的时候，我们通常会把一个类做实例化之后再进行调用，比如这样：

```python
class Calc(object):
	def add(self, x, y):
		print x + y


if __name__ == '__main__':
	calc = Calc()
	calc.add(1, 1)
```

这个`self`到底是什么呢？我们加两行代码来看。


```python
class Calc(object):
	def add(self, x, y):
		print x + y
		print self


if __name__ == '__main__':
	calc = Calc()
	calc.add(1, 1)
	print calc
	
--->
2
<__main__.Calc object at 0x108b4e4d0>
<__main__.Calc object at 0x108b4e4d0>	
```

可以看的出来，这个`self`和实例化出来的`calc`都是`Calc`这个对象，并且指向的内存地址是同一个，也就是他们两个是同一个东西。

## 静态方法
在看别人的代码的时候，经常会看到一个`@staticmethod`。这个东西是静态方法，在类中的方法都必须要传`self`对象，但是一旦被`@staticmethod`装饰器装饰后的方法，就不需要传入`self`这个参数，如下：

```python
class Calc(object):
	def add(self, x, y):
		print x + y

	@staticmethod
	def minus(x, y):
		print x - y


if __name__ == '__main__':
	calc = Calc()
	calc.add(1, 1)
	Calc.minus(3, 2)
```

具体来说这个有什么用？我个人理解来说在`Python`这个装饰器只是一个基于类设计的一个方法。你用一个`def`来实现，或者就用类方法来实现影响其实并不大。当然，你实例化了，也是可以通过实例来调用静态方法的。

## 类方法
在`Python`中还有一个方法`@classmethod`，使用了这个方法，传入的第一个参数就不是`self`，而是`cls`。比如这样：

```python
class Calc(object):
	def add(self, x, y):
		print x + y

	@staticmethod
	def minus(x, y):
		print x - y

	@classmethod
	def multi(cls, x, y):
		print x * y


if __name__ == '__main__':
	calc = Calc()
	calc.add(1, 1)
	Calc.minus(3, 2)
	calc.multi(2, 2)
	
--->

2
1
4	
```

可以在这行代码中吧这个`cls`打出来看看是个什么东西，最为对比，同样也加上打印`self`。


```
<class '__main__.Calc'>
<__main__.Calc object at 0x1033ef4d0>
```

这样对比出来就非常清晰了。`cls`指的是这个类，如果严谨一点可以再加上`print Calc`。而`self`是这个类的一个实例，是放在内存中的。

那么这个到底有什么用呢？说实话，一般来说没什么卵用，跟`@staticmethod`一样。可以在不需要实例化的时候调用这个方法。

**划重点**

如果你需要经常对函数的结构进行修改，那么这个方法就非常有用了。

英文好的可以看这里[Meaning of @classmethod and @staticmethod for beginner?](https://stackoverflow.com/questions/12179271/meaning-of-classmethod-and-staticmethod-for-beginner/12179752#12179752)

英文不好的就看这里[Python 中的 classmethod 和 staticmethod 有什么具体用途？ - 水中柳影的回答 - 知乎](https://www.zhihu.com/question/20021164/answer/115518482)

## 实例化的过程
理解了`self`和`cls`是什么时候，可以继续再研究实例化的过程。

`Python`在实例化的过程中，会首先调用`__new__`这个内置的方法。如果我们重写这个方法，但是不按照原有的方式去写，那么就会实例化失败，比如这样：

```python
class Calc(object):
	def __init__(self):
		print "class init..."

	def __new__(cls, *args, **kwargs):
		print "new a class..."

	def add(self, x, y):
		print x + y


if __name__ == '__main__':
	calc = Calc()
	print calc
	
--->
new a class...
None
```

可以看到，实例化了一个`None`出来。
在`__new__`方法总增加`return object.__new__(cls)`即可正常实例化。同时可以看到`__init__`方法也被执行了。

特别说明一下，这个`object`是`Python`所有的[**新式类**](https://www.python.org/doc/newstyle/)的基类。

## 单例
了解了这些内容，重新来看看单例模式。之前介绍了一个不严谨的单例，这里来看一个比较严谨的单例示例。

```python
class Single(object):
	def __new__(cls, *args, **kwargs):
		if not hasattr(cls, '_single'):
			cls._single = object.__new__(cls, *args, **kwargs)
		return cls._single
```

这里可以看到在`__new__`方法中加了一个判断，如果类实例化的时候没有`_single`这个属性，说明类还没有被实例化，这个时候就按照正常的方法实例化，如果发现有`_single`这个属性了，那么就直接返回类的`_single`对象，也就是已经被实例化的对象，通过这个逻辑来保证实例化的时候，只会存在一个实例。
