---
title: "基于Python的Jenkins的二次开发"
publishedAt: "2018-07-06T20:23:26+08:00"
categories: ["Python"]
tags: ["Python","Jenkins"]
path: "/python/基于Python的Jenkins的二次开发.html"
---

## 背景
最近我们在整一个云执行的平台，底层用的是`Jenkins`来做执行引擎，方便的把我们的脚本做一个统一的调度。

`Jenkins`确实是一个非常方便的框架，它提供了一整套的`RESTful`的API，可以非常方便的做二次开发，而且提供了一个`python`的库，操作起来就更加方便了。

## 常用的Jenkins概念
我们在使用`Jenkins`的时候，一般看到的都是`Jenkins的View`。

也就是说我们看到的基本上都是一些视图。

每一个构建的内容，无论是执行用例，跑脚本，还是打包编译发布，都是一个`job`。

每一个`job`都有一个对应的`name`，如果这个`job`被放在某个文件夹了，那么`name`就是文件夹名+job名。在查看`job`信息的时候，会返回一个`full_name`字段，指的就是这个了。

## PythonSDK
`pip install python-jenkins`执行这条命令就可以安装SDK了。

官网：`https://pypi.org/project/python-jenkins/`

说明文档：`http://python-jenkins.readthedocs.io/en/latest/`

说明文档都是英文的，如果有兴趣，看这块当然最好，不过这个SDK实际上非常非常的简单，如果直接去看源代码，也是没问题的，我在开发的过程中，基本上都是去看源码来写的，SDK里面函数命名比较直白，不用深刻理解也能够正常的去使用。

这里列一些比较常用的方法，也是我这次开发的时候用到的一些，我按照我自己写的过程中，一步一步的写出来。

## 开发过程
* job信息查询

在`Jenkins`中，每一个构建都是一个`job`，所以，我们做开发的时候，要在页面上展示历史的构建信息，因此，要能够拿到`历史执行job`的信息。因此我们要使用`get_job_info`这个方法。

```python
    def get_job_info(self, name, depth=0, fetch_all_builds=False):
        '''Get job information dictionary.

        :param name: Job name, ``str``
        :param depth: JSON depth, ``int``
        :param fetch_all_builds: If true, all builds will be retrieved
                                 from Jenkins. Otherwise, Jenkins will
                                 only return the most recent 100
                                 builds. This comes at the expense of
                                 an additional API call which may
                                 return significant amounts of
                                 data. ``bool``
        :returns: dictionary of job information
        '''
```

这里的`name`参数指的是`job`的名字，比如我新建了一个叫`自动化测试`这么个`job`，那么这个`name`传的就是`自动化测试`，如果我把这个`job`放到了某个文件夹中，那么`name`这个参数需要传`文件夹名/自动化测试`。
这里有一个坑，在`Python2.7`版本中传递这个`name`，如果以变量的形式传递过去，会有一个报错，规避的方法是`name.encode('utf-8')`做一下编码的处理。返回的参数是这些：

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537775114.494164.jpg)

在`builds`字段里面就存有所有的历史构建数据。在`property`这个字段中放有`Jenkins`构建时的各种参数。

* 构建日志

拿到了构建数据，我们需要在页面上展示出来，如果能在页面上直接看日志就更方便了，因此要把每次的构建日志拿出来，需要调用`get_build_console_output`这个方法。

```python
    def get_build_console_output(self, name, number):
        '''Get build console text.

        :param name: Job name, ``str``
        :param number: Build number, ``int``
        :returns: Build console output,  ``str``
        '''
```

这里可以拿到`Jenkins`的构建日志，返回的就是一个字符串了。需要注意的是，如果你想要构建的时候也展示构建日志，只需要在构建的时候调用这个方法就行，会返回调用时候构建的日志，用`socket`或者`轮询`的方式都可以实现实时日志的展示。

* 执行构建

执行构建当然是非常关键的一步，我们可以使用`build_job`这个方法来执行构建。

```python
    def build_job(self, name, parameters=None, token=None):
        '''Trigger build job.

        This method returns a queue item number that you can pass to
        :meth:`Jenkins.get_queue_item`. Note that this queue number is only
        valid for about five minutes after the job completes, so you should
        get/poll the queue information as soon as possible to determine the
        job's URL.

        :param name: name of job
        :param parameters: parameters for job, or ``None``, ``dict``
        :param token: Jenkins API token
        :returns: ``int`` queue item
        '''
```
这里的`name`参数跟`job信息查询`的参数一样，也会有编码的问题。`parameters`字段传入的是一个字典类型，也就是在页面上点击构建的时候，需要填入的参数。`token`参数在`Jenkins`这个类初始化的时候就已经有了，所以一般来说无需传入。这个方法会返回一个`queue_item`的编号，这个就是`Jenkins`的构建编号，这个编号可以做一些其他数据的查询，比如构建状态，取消构建等操作，在SDK里面都有对应的方法。

**注意：**绝对不行用这个来查询是否处于构建中，这个编号在一定时间内会出现失效的情况，如果构建时间过长，会导致查询不到结果而报错，实际上`job`依然处于构建中

这些方法使用起来比较方便，但是有一些局限性，我们如果在构建的时候用了第三方插件，这些方法是没办法拿到第三方插件的结果的，比如我们这里用`RobotFramework`的插件来处理了结果，用这些方法是没办法拿到结果的。

## 从原理入手
`Jenkins`对外提供的是一个`RESTful`的接口，那么`Python的SDK`做的动作实际上就是去请求这个接口，只不过做了一些包装，保证了易用性，很多方法的核心，都会用到`jenkins_request`，比如：

```python
response = self.jenkins_request(requests.Request(
            'POST', self.build_job_url(name, parameters, token)))
```
有兴趣的可以自己去读一读源码，整个`SDK`实际上就是基于`requests`这个库做了一下包装，然后最终都是通过`jenkins_request`去请求`RESTful`的API。我们进入`jenkins`的页面，在右下角能看到一个这样的东西。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537775145.797475.jpg)

有这个标记的页面，就是有接口的，那么这个接口是怎么拿的呢？

从源码里面可以找到答案，很多方法里面都有这么样一个东西。

```python
self.jenkins_open(requests.Request('GET', self._build_url(INFO),auth=auth),
                        add_crumb=False, resolve_auth=False)
                        
response = self.jenkins_open(requests.Request('GET', self._build_url(BUILD_INFO,locals())))
```

在最上方的配置中可以找到：`INFO = 'api/json'`

也就是说，在我们看到页面的后方加上`/api/json`就可以拿到数据了。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537775249.7763999.jpg)

所有的操作都在这个数据的背后了，也就是说只要写好这个url的拼接规则，就能很简单的去做二次开发了。

当然，在开发的过程中，也是有很多坑的，比如拿历史数据的时候，接口竟然不返回历史构建的状态。。。。

## 总结
整个开发过程下来还算比较顺利，由于源码比较简单的原因，基本上遇到问题都能通过看源码来解决，但是比较大的问题就是返回结果的枚举没有一个地方列出来，所以导致开发完成后经常有地方需要修修补补。
