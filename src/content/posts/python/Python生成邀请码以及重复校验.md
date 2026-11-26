---
title: "Python生成邀请码以及重复校验"
publishedAt: "2016-07-08T23:40:43+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/Python生成邀请码以及重复校验.html"
---

 ![org_20160626131921_113](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976460227644.jpg)

5S坏了，用了好几年的手机毕竟是有感情的，希望明天到的屏幕能够拯救我亲爱的5S吧

## 背景
最近公司在弄一个邀请码的东西，要搞一个生成的机制，理论上这是后端开发做的事情，但是我们的前端开发也去搞了一套这个验证码的东西，有兴趣的朋友可以看看[《Javascript实现的一种简单的推荐码算法》](http://www.jianshu.com/p/9995cc192588)。我也就顺带写了一个验证重复的代码，最好控制一下比如1KW不会重复就行了。

## 验证重复
其实验证重复的逻辑很简单，用`Python`来处理就是几行代码的事。主要流程就是从把生成的邀请码读取到一个列表中，然后用`set`方法去重，最后比对去重前后列表的长度，就能知道有没有重复了。

## 代码如下

```python
import time
start = time.time()
with open('test.txt', 'r') as f:
	data = f.readlines()
arr = [x.strip() for x in data]
old = len(arr)
new = len(set(arr))
print old
print new
if old == new:
	print "success"
else:
	print "error"
end = time.time()
print end-start
```

代码中我加上了运行时间的处理，可以观察在读取大量数据的时候的效率。

**注 ：请不要使用以下的方式来建立列表**

```python
testlist = []
for x in f.readlines():
	testlist.append(x)
```

事实证明，这种方式在数据量大的情况下效率会低很多。

我们来做一个测试，使用1000W条数据来处理。第一种方式的结果如下：

```
10000000
10000000
success
5.89996790886
```

第二种方式的结果如下：

```
10000000
10000000
success
7.04926991463
```

当然，结果也证明了我写的验证码在1KW条的情况下，不会出现重复的情况。

## 随机邀请码生成

一般我们看到的序列号或者邀请码长成这样的：`BKMv-c1Nf-IvRr-ZAsy`，这种逻辑的生成也挺简单的，就是取随机的字母和数字，然后拼接起来就好了。

代码如下：

```python
#coding: utf-8
import string
import random
field = string.letters + string.digits

# 生成num位的随机字母或数字组成的
def getSingleMa(num):
	singleMa = "".join(random.sample(field, num))
	return singleMa
# 把num个字符串拼接起来
def getAllMa(num):
	AllMa = "-".join([getSingleMa(4) for i in range(num)])
	return AllMa

# 生成num组邀请码
def outMa(num):
	AllMaList = [getAllMa(4) for i in range(num)]
	return AllMaList

if __name__ == '__main__':
	data = outMa(10000)
	with open("test.txt", "w") as f:
		for x in data:
			f.write(x)
			f.write('\n')
```

这样本地就生成了一个名为`test.txt`的邀请码文件，里面有10000个邀请码。

## 最后
我这种方式我验证了一下，在1KW条记录的情况下，只要有4组4个字母组成的邀请码，基本上不会出现重复的情况，我测试了大概20次，就只有一次出现了一个验证码重复。

当然，1E条邀请码的情况我没有测试，毕竟电脑配置有限，如果能够使用多线程来生成多个文件，最后再合并，应该效果会快很多。

