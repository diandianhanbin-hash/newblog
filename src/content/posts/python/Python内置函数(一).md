---
title: "Python内置函数(一)"
publishedAt: "2016-05-16T00:37:16+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/Python内置函数(一).html"
---

## 背景
Python内置了非常多非常强大的函数，如果能用好，码代码起来能够非常大的提升效率。参考官方的文档和一些网上的资料，做一些简单的整理。

## abs()
abs()是一个取绝对值的函数，使用起来相对比较简单。

```python
print abs(-1)

结果
1
[Finished in 0.1s]
```
源码中对它的描述比较简单是这么介绍的：

```python
abs(number) -> number
    
Return the absolute value of the argument.
```

在入参中增加了类型的检查，参数可以是负数也可以为正数。只会取绝对值，不会做取整。

```python
print abs('a')

结果：
Traceback (most recent call last):
  File "/Users/SvenWeng/Desktop/test.py", line 1, in <module>
    print abs('a')
TypeError: bad operand type for abs(): 'str'
```

## all()
all这个函数其实是一个非常好用的函数。入参是一个可迭代的对象，比如tuple、list。迭代对象中全部为True则返回True，否则返回False。

函数等价于：

```python
def all(iterms):
    for iterm in iterms:
        if not iterm:
            return False
    return True
```

怎么理解这个True呢？其实就是Python中Bool类型的判断，if条件成立，那么就是True。所以可迭代对象中有这么些元素会引发False：0、False、''。

不过有一点要特别注意：如果是空列表或者空tuple，返回的也是True。

```python
print all([])

结果：
True
[Finished in 0.1s]
```

## any()
any函数和上面的all有点类似。all函数表示参数中的可迭代对象只要存在判定为False的条件，就返回False。而any是参数中可迭代对象全部判定为False的时候返回False，其他时候则返回True。

入参带有判定为False的参数

```python
print any(['1',2,False])

结果：
True
[Finished in 0.1s]
```

入参全部为判定为False的参数

```python
print any(['',0,False])

结果：
False
[Finished in 0.1s]
```

**注意：any和all的入参都必须是可迭代对象。如果是其他类型则会报错。**

```python
print any(0000)

结果：
Traceback (most recent call last):
  File "/Users/SvenWeng/Desktop/test.py", line 1, in <module>
    print any(0000)
TypeError: 'int' object is not iterable
```

注意：字符串也是可迭代对象。

```python
print all('abcd')

结果：
True
[Finished in 0.1s]
```

## basestring()
basestring是str和unicode的基础类，不能够被直接调用。查看源码就能看到他们是继承于basestring的。

**注意：判断类型是否为字符串的时候，请使用isinstance(arg, basestring)，而不要用str或者unicode**

**注意：python3中把所有的字符串都统一为unicode了，所以在python3中没有basestring这个方法。**

```python
print isinstance(u'Hello', basestring)  # True

print isinstance('Hello', basestring)  # True

print isinstance(u'Hello', str)  # False

print isinstance('Hello', unicode)  # False
```

## callable()
说实话，这个方法我并不是很理解如何运用到实际的编程中。

callable方法是用来判断一个对象是否可以调用。不理解的地方在于，如果返回True，仍然有可能是不能调用的。当然返回False时肯定不能调用的。我们来看几个示例：

```python
print callable('Hello')  # False

print callable(abs)  # True

print callable(basestring)  # True
```
对象如果是一个字符串，那么是不能调用的，如果是一个函数，那么是可以调用的。但是要注意，basestring是不能调用的，在示例中也返回了一个True。

```python
class test:
    def aaa():
        return 0
print callable(test)
结果：
True

-------------------------
class test:
    def aaa():
        return 0
st = test()
print callable(st)
结果：
False
```
从上面示例可以看出如果是直接判定一个类，那么返回的是True，如果把这个类实例化了，那么就会返回False。

```python
class test:
    def __call__():
        return 0
st = test()
print callable(st)
```

那么如果在这个类加上了call这个函数，那么就会返回True。

具体怎么用可能我水平有限，不是很能理解。需要读者自己理解了。

## classmethod
这个方法其实是一个装饰器，用来让类中的函数变为类，不用实例化就可以直接调用。怎么理解这个呢？看看下面的示例。

```python
class test:
    def mytest(self):
        print 'test pass'
test.mytest()
结果：
Traceback (most recent call last):
  File "/Users/SvenWeng/Desktop/test.py", line 6, in <module>
    test.mytest()
TypeError: unbound method mytest() must be called with test instance as first argument (got nothing instead)
```
这样直接调用会报错，需要你把这个类做一下实例化，然后才能调用这个函数。但是如果加上了一个classmethod的装饰器，就不一样了。

```python
class test:
    @classmethod
    def mytest(self):
        print 'test pass'
test.mytest()
结果：
test pass
```

## cmp
cmp就是compare的缩写，意思就是这个函数是用来比较大小。需要传入两个参数，既然是比较大小，一般传入的是数值类型，比如int或者float。

```python
print cmp(1, 2)  # -1

print cmp(2, 2)  # 0

print cmp(3, 2)  # 1
```
上面的示例可以看出，如果第一个值比第二个小，则返回-1，相等，则返回0，如果大于，则返回。

**注意：字符串也是可以比较的。**

```python
print cmp('aaa', 'aa')  # 1

print cmp('aaa', 'aaa')  # 0

print cmp('aaa', 'aaaa')  # -1
```

字符串的比较是一位一位的来比较的，如果第一位不相等，那么就会直接返回结果.

```python
print cmp('aaa', 'baaa')  # -1
```

示例中的第二个参数b已经大于第一个参数的第一位a，那么就直接返回结果了。

## divmod
这个函数是用来取整除的结果和余数。

一般来说我们要获取整除的结果和余数，会使用/和%。比如这样：

```python
print 5/3
print 5%3
结果：
1
2
```
如果用内置的divmod函数，则非常简单就能获取。
```python
print divmod(5,3)  # (1, 2)
```

## enumerate
这个函数是我最喜欢用的函数之一。用来便利迭代对象中的序列和元素。怎么理解这个函数呢？

没接触这个函数之前，我都是额外定义一个参数来获取迭代的序列。比如这样：

```python
testList = ['a', 'b', 'c', 'd']
num = 0
for x in testList:
    print num, x
    num += 1
结果：
0 a
1 b
2 c
3 d
```
但是使用enumerate就相对简单了。

```python
testList = ['a', 'b', 'c', 'd']
for x,y in enumerate(testList):
    print x, y
结果：
0 a
1 b
2 c
3 d
```
5行代码变成3行代码。而且没有重新生成一个变量，性能上也有了提升。

更详细的介绍请看[《Python小知识——深度剖析获取迭代序列》](http://blog.csdn.net/wyb199026/article/details/50866954)
