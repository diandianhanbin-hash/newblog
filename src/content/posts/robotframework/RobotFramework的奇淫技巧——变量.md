---
title: "RobotFramework的奇淫技巧——变量"
publishedAt: "2017-10-26T11:15:25+08:00"
categories: ["RobotFramework"]
tags: ["RobotFramework"]
path: "/robotframework/RobotFramework的奇淫技巧——变量.html"
---

## 背景
在使用RobotFramework的过程中，会发现写起来跟写代码有点类似，但是比起直接写代码，RobotFramework又有点奇怪，这里总结一下RobotFramework的使用过程中的一些奇淫技巧，本文主要涉及的是变量。

## 标量和链表

在RobotFramework中，标量指的是`${}`,链表指的是`@{}`,大括号中间的变量名如果是一样的，那么就是一个变量，不过有一个很明显的区别，当使用标量时，整个值就会是一个整体，而使用链表的时候，则是一个个分散的个体。

举个例子：

在写脚本的过程中，经常会遇到要写FOR循环，比如下面一个例子：

```
*** Test Cases ***
test
    ${t}    create list     abcde   fghijk
    :FOR    ${x}    IN      ${t}
    \   log     ${x}
```

然而，你会发现这样执行是错的，并没有吧`${t}`给迭代出来。正确的姿势应该是这样：

```
*** Test Cases ***
test
    ${t}    create list     abcde   fghijk
    :FOR    ${x}    IN      @{t}
    \   log     ${x}
```

第一个脚本中，For循环迭代的是一个标量，也就是一个整体，执行结果就会把整个`list`打印出来，而第二个脚本中，迭代的是一个链表，也就是分散的个体，所以在循环的时候会被全部迭代出来打印。

再看一个直观的例子。

```
*** Settings ***
Library     Collections

*** Variables ***
@{t}    1   2   3

*** Test Cases ***
test
    log list    @{t}
```

上面的例子看脚本没毛病，直接打印定义的list变量`@{t}`,但是执行的时候你会发现，执行失败了，报错`Keyword 'Collections.Log List' expected 1 to 2 arguments, got 3.`，这里的`@{t}`使用的是链表，所以相当于这个位置你给了1，2，3三个参数，而`log list`方法只能接受两个参数，所以这里报错了。

## 变量标识

`${}`这个表示定义一个变量，当然，在定义数字的时候，加上这个标识才是数值类型，比如：

```
*** Test Cases ***
test
    ${a}    set variable    ${4}
    ${b}    set variable    4
```

其中a获得的是数字4，b获得的是字符串4。在json中的提现就是`{“a”: 4, "b": "4"}`

布尔值真假用的是`${true}`和`${false}`

空格用的是`${SPACE}`

空变量用的是`${EMPTY}`

## 变量扩展

RobotFramework的变量可以很好的支持扩展，使用得当可以事半功倍。

### 变量拼接

```
*** Test Cases ***
test
    ${ip}       set variable    192.168.9.1
    ${a}        set variable  p
    log     ${i${a}}
====>	192.168.9.1    
```

上面的拼接方式中，RobotFramework会首先解析`${a}`这个变量，然后变量就变成了`${ip}`，最终结果打印的就是`${ip}`.

### 字典列表元素值的获取

```
字典取值示例
*** Test Cases ***
test
    ${a}    create dictionary   a=1     b=2
    log     ${a['a']}
====>	1    
```

RobotFramework的字典值的获取方式非常简单，跟`Python`是一个套路，

```
列表取值示例
*** Test Cases ***
test
    ${a}    create list   a     b
    log     ${a[0]}
====>	a    
```

当然，字典和列表是可以串在一起取值的，比如这样：

```
*** Test Cases ***
test
    ${b}    create dictionary   a=1
    ${c}    create dictionary   b=2
    ${a}    create list   ${b}  ${c}
    log     ${a[0]['a']}
    
====>	1    
```

## 变量文件

常用的变量文件的定义方式主要是在`*.robot`文件中定义`Variable`，值得一提的是，`*.py`是可以作为RobotFramework的变量文件的。相比于RobotFramework，Python的格式定义更清晰一些，而且也是支持字段和列表类型，例如：

```python
test.py

OBJ = 'TEST'
DICT = {
	"CONFIG": "TEST"
}
LIST = [1, 2, 3, 4]
```

```
*** Settings ***
Variables  test.py

*** Test Cases ***
test
    log     ${OBJ}
    log     ${DICT['CONFIG']}
    log     ${LIST[0]}

====>
TEST
TEST
1    
```
如果只是这样，那么变量文件用`*.py`就没意义了，引入`py`的变量文件的意义在于，能够动态的获取数据，举个例子：

```python
test.py

import random

OBJ = random.randint(1, 100)
```

```
*** Settings ***
Variables  test.py

*** Test Cases ***
test
    log     ${OBJ}
```

每次执行时，获取的值都是1到100之间的随机数。同理，也可以自定义返回的规则，这种方式在某些报文字段生成时，可以非常方便的给自己的规则。

如果你定义的是一个对象，那么还可以直接执行对象里面的方法。

```python
test.py

import random

class Test(object):
	def __init__(self):
		pass

	def random(self):
		return random.randint(1, 100)

OBJ = Test()
```

```
*** Settings ***
Variables  test.py

*** Test Cases ***
test
    log     ${OBJ.random()}

```