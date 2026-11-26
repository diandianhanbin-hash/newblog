---
title: "说说Python中的property"
publishedAt: "2020-03-07T14:53:41+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/说说Python中的property.html"
---

## 背景

最近在项目中，发现项目越来越大之后，之前的编写方式会留下很多坑，因此最近专门研究了一下静态语言中的方法，比如java中的bean这玩意，发现这种方式引入后，可以很有效的解决这类问题。

## 有关property

`property`是`Python`中的一类装饰器，可以把某个类函数变成只读属性。

比如下面的这些代码

```python
class Student(object):
    def __init__(self, name, age):
        self._name = name
        self._age = age

    @property
    def name(self):
        return self._name

if __name__ == '__main__':
    std =  Student("sven", 20)
    print(std.name)
    std.name = "123"
```

`name`这个属性如果被实例化的类去设置，则会抛错：

```
echo:

sven
Traceback (most recent call last):
  File "/Users/sven/PycharmProjects/paymap/debug.py", line 128, in <module>
    std.name = "123"
AttributeError: can't set attribute
```

当然，如果要支持设置，可以改成下面这样：

```python
class Student(object):
    def __init__(self, name, age):
        self._name = name
        self._age = age

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, name):
        self._name = name

if __name__ == '__main__':
    std =  Student("sven", 20)
    print(std.name)
    std.name = "123"
    print(std.name)
```

这样就能正常修改某个值了。

不过这种操作，对于Python来说，似乎有一种脱裤子放屁的感觉，不用property，一样能够正常的获取类属性，比如这样

```python
class Student(object):
    def __init__(self, name, age):
        self.name = name
        self.age = age

if __name__ == '__main__':
    std =  Student("sven", 20)
    print(std.name)
    std.name = "123"
    print(std.name)
```

跟上面的实际上是一样的，那么`property`这玩意到底有什么用？

## 类型检查

Python是一个弱类型的语言，某个变量可以随便赋值，即使原来是字符串，也可以重新赋值成数值类型。

还是上面那个例子，如果这个学生类，我要确保姓名和年龄字段必须传对类型。可以这么做：

```python
class Student(object):
    def __init__(self, name, age):
        self._name = name
        self._age = age

    @property
    def name(self):
        if not isinstance(self._name, str):
            raise TypeError("name must be string")
        return self._name

    @property
    def age(self):
        if not isinstance(self._age, int):
            raise TypeError("age must be int")
        return self._age


if __name__ == '__main__':
    std = Student(10, 20)
    print(std.name)
```

通过上面的方式，参数类型不正确，取值的时候就会抛错处理。通过这种方式可以确保这个类在使用的时候，每个字段都是特定的类型。

## property的其他应用

当然，property如果只有这么功能，那么使用的意义其实不大，还有其他实用的点，比如懒加载，数据缓存。

### 懒加载

我们在使用某些数据的时候，可以把计算过程放到使用时再进行计算，避免无意义的计算资源浪费。比如下面的例子。

```python
class Student(object):
    def __init__(self, math, chinese, english):
        self._math = math
        self._chinese = chinese
        self._english = english

    @property
    def score(self):
        return self._math + self._chinese + self._english


if __name__ == '__main__':
    std = Student(10, 20, 30)
    print(std.score)
```

这里学生的成绩score，只有再使用这个score的时候，才会把其他学科的成绩做一个加总，否则是不会计算这个值的。

### 缓存资源

复用刚刚懒加载的那个例子。这个过程还可以再优化一下，如果分数已经被计算出来了，那么就不需要再重新计算分数，直接返回就行了。

```python
class Student(object):
    def __init__(self, math, chinese, english):
        self._math = math
        self._chinese = chinese
        self._english = english
        self._score = 0

    @property
    def score(self):
        if self._score == 0:
            print("calc score")
            self._score = self._math + self._chinese + self._english
        return self._score


if __name__ == '__main__':
    std = Student(10, 20, 30)
    print(std.score)
    print(std.score)
```

输出的结果为：

```
calc score
60
60
```

这里的逻辑就把成绩这个结果给缓存下来了，多次使用这个数据的时候，就不需要重复的计算。

### 懒加载和缓存实际中的应用

这两个特性在实际的工作中，使用的还是比较广的，比如前段时间，我写微服务的client功能的时候，需要把路由信息在进程中缓存，如果发现路由信息过期了，才去重新拉取路由信息，否则就直接返回缓存中的路由信息，这里实际上用的就是上面的懒加载和缓存的特性。

通过懒加载，确保路由信息需要使用并且过期的时候，才会发网络请求去获取最新的路由。

通过缓存，无需每次获取路由都去服务器查询路由信息，直接从缓存中拿即可。

## 其他讨论

说实话，上面的演示例子非常的简单，不是特别具有代表性。我们日常工作中，用到的类成员可能有非常多，比如请求了某个接口回来的数据可能有十几个字段，每个字段都单独写一个`property`，再写上对应的setter，delete装饰器方法，那真的是非常蠢。是否有其他方式可以达到类似的效果呢？其实是有的。

这里参考了*Python Cookbook*中的一个用法。

可以单独写一个装饰器的方法，如下

```python

class Typed(object):
    def __init__(self, name, excepted_type):
        self.name = name
        self.expected_type = excepted_type

    def __get__(self, instace, cls):
        if instace is None:
            return self
        else:
            return instace.__dict__[self.name]

    def __set__(self, instance, value):
        if not isinstance(value, self.expected_type):
            raise TypeError("Expected" + str(self.expected_type))
        instance.__dict__[self.name] = value


def typeassert(**kwargs):
    """
    类型校验装饰器
    @param kwargs:
    @return:
    """
    def decorate(cls):
        for name, expected_type in kwargs.items():
            setattr(cls, name, Typed(name, expected_type))
        return cls

    return decorate
```

这个装饰器可以装饰我们的类，在`setter`数据的时候对类型进行检查.

还是用本文的演示例子。

```python
@typeassert(math=int, chinese=int, english=int)
class Student(object):
    def __init__(self, math, chinese, english):
        self.math = math
        self.chinese = chinese
        self.english = english
```

这样装饰了这个类之后，这些字段在赋值的时候，就必须赋值对应的类型，否则就会抛错。这种方式是一个批量处理类型校验的方法，可以极大的减少重复代码的编写。

当然，每个参数的赋值过程，其实是很麻烦的，比如下面这样:

```python
data = {"math": 10, "chinese": 20, "english": 30}
std = Student(data.get("math"), data.get("chinese"), data.get("english"))
```

这样的方式，在实际工作过程中还是会经常遇到，别人给你的东西可能就是一个字典，那么有没有比较有效的方式来解决这个呢? 可以参考下面的方案。

```python
@typeassert(math=int, chinese=int, english=int)
class Student(object):
    def __init__(self, info):
        self.math = 0
        self.chinese = 0
        self.english = 0
        self.parse_input_param(info)

    def parse_input_param(self, info):
        for key, value in info.items():
            setattr(self, key, value)


if __name__ == '__main__':
    data = {"math": 10, "chinese": 20, "english": 30}
    std = Student(data)
    print(std.math)
    print(std.chinese)
    print(std.english)
```

当然，在init中不定义`self.math`, `self.chinese`, `self.english`，上面的代码也是可以工作的，但是我不建议你这么做，事先声明好类型，对于其他人的接收，以及自己后续的维护是有很大的帮助的，这部分工作的省略是得不偿失的。

## 最后

特别强调一下，每种方式都是需要在特定的方式下做才有意义，如果只是一个简单的脚本，那么使用property这种方式去处理，完全是没有意义的，浪费时间。

但是，如果你的工程是一个比较大型的工程，有很多外部系统的交互，那么使用property这类的处理方式，则是磨刀不误砍柴工，它可以确保你在使用这些数据的时候，类型是一致的，也能减少很多重复的代码编写，同时在多人协同的工作中，能够更方便他人阅读代码。



