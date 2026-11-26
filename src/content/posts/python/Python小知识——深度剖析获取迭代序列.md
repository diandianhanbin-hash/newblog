---
title: "Python小知识——深度剖析获取迭代序列"
publishedAt: "2016-03-12T19:21:47+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/Python小知识——深度剖析获取迭代序列.html"
---

相信获取迭代序列是一个非常普遍的需求功能，基本上写代码都要考虑到这个东西，我自己写博客系统的时候也经常遇到这个问题，实现起来其实很简单，只要在for循环外加一个参数监听迭代就行了，比如下面这种方式

```python
li = ['a', 'b', 'c', 'd', 'f']
num = 0
for i in li:
	print 'index :' num, 'element :', i
	num += 1
```

这种方式获取起来很容写，也比较好理解，但是这个运行过程中多声明了一个变量，性能上并不是最优的（当然基本上我们写的东西性能上不差这一点）。

另一个替代方法是使用`len（）`和`range（）`的结合使用，这个方法用起来也是非常方便的，代码如下：

```python
li = ['a', 'b', 'c', 'd', 'f']
for i in range(len(li)):
	print 'index :' i, 'element :', li[i]
```

类似的方法还有zip（）， while循环等等。

## enumerate

今天在看书的时候突然看到这个函数，这个函数处理起来真的是非常巧妙，至少我感觉比上文提到的方法更简单，更粗暴。

看下面的代码：

```python
li = ['a', 'b', 'c']
for i, e in enumerate(li):
	print  i, e

======输出结果===========
0 a
1 b
2 c
[Finished in 0.1s]
```

这种实现方式代码简洁，可读性强。其函数签名如下：

```python
enumerate(sequence, start=0)
```

其中的`sequence`可以为任意一个可迭代的对象，函数的本质上就是一个迭代器，可以使用`next()`方法获取下一个迭代元素，比如上面的代码我们做一下简单的修改。

```python
li = ['a', 'b', 'c']
print enumerate(li)
e = enumerate(li)
print e.next()
print e.next()

=======输出结果======
<enumerate object at 0x1079faaa0>
(0, 'a')
(1, 'b')
```

### 不适用于字典
字典这个类型是无序的，所以无法使用`enumerate`来处理字典的迭代。