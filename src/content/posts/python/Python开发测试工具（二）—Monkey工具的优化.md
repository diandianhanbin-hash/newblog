---
title: "Python开发测试工具（二）—Monkey工具的优化"
publishedAt: "2016-04-06T22:14:07+08:00"
categories: ["Python","测试"]
tags: ["Python","Monkey","测试"]
path: "/python/Python开发测试工具（二）—Monkey工具的优化.html"
---

## 前言
上次写的`Monkey`工具虽然是可以运行，不过用起来非常烂，可以说非常非常的烂，点了执行`Monkey`程序就会卡死，现在我们来解决这个问题。

## 多线程处理
上篇文章末尾提到可以使用多线程或者多进程来处理，其实我心里也没有底。今天算是稍微了解了一下，百度之后发现提的比较多的就是线程，我就先尝试了多线程的处理方式，不过不管用多线程还是多进程，都必须对原来的代码进行改写了，原来的代码编写方式是使用最基本的方式，连函数都没有处理，这次改动就一起改了，新生成一个`AndroidTools`类，然后在`init`函数中把原来界面的代码`copy`进去，这样实例化这个类的时候，就会画出界面了。

### 给按钮加一个线程
其实整个调用方式是在AndroidTools类中加一个函数，然后把执行Monkey按钮的命令封装到这个函数里，在这个函数中给这个命令分配一个线程

```python

def run_monkey(self):
        t = threading.Thread(target=lambda: self.mk.merge_command(self.cm.get_text(log_path),
                                                                         *self.cm.collect(*ENTRYLIST)))
        t.start()
        
```

这样开了一个线程给按钮，运行之后确实解决了界面卡顿的问题，不过新的问题就来了，这个进程没办法停止。即使我点击结束Monkey，从日志来看命令也确实执行了，但是这个线程就是停不下来。这又是一个巨大的坑。

当然，我尝试过很多种方式处理这个问题。比如设置一个全局变量来监控，点击停止后先结束线程，再执行结束Monkey的命令。不过结果都是很失败，不是线程阻塞就是线程阻塞。

网上停止线程的方式基本都是通过一个死循环来监控变量，结束父线程的方式来结束子线程。对线程的了解还不是很深入，实施了几次都不成功。

官方也没有提供停止线程的方法，据说是不提倡手动停止线程。

**按我的理解，线程在执行Monkeky，这时我通过命令停止Monkey，那么这个线程就应该自动结束了。不知道为什么执行起来并不是那么回事**

如果有朋友知道，请留言告诉我。

## 多进程的处理
大概折腾了一整个下午吧，实在是有点心烦，我就换了一个东西写，在写爬虫的时候用到了多进程，我就在想如果把我的思想换一下，用多进程来处理这些按钮事件，是不是也很好呢？

> **按我的理解，线程在执行Monkeky，这时我通过命令停止Monkey，那么这个线程就应该自动结束了。不知道为什么执行起来并不是那么回事**

如果把这个理解放到进程上呢？

```python
 def run_monkey(self):
        t = multiprocessing.Process(target=lambda: 		
        self.mk.merge_command(self.cm.get_text(log_path),  *self.cm.collect(*ENTRYLIST)))
        t.start()

def stop_monkey(self):
        self.ad.stop_monkey(status)
```

这样跑起来，果然是成功了。

## 最后
写代码有时候是这样，突然的灵光一闪，几分钟就可能解决一个大问题，今天这个线程的问题我整整`google`了一天，结果突然一个想法，换成进程，就成功了。

工具的基本功能是完善了，后续可以加上内存监控，电量监控，cup监控等功能，不过那都是后话了。

完整功能的代码在[Github](https://github.com/diandianhanbin/AndroidTools)
