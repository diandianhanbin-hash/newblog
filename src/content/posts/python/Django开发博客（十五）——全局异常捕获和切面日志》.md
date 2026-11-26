---
title: "Django开发博客（十五）—利用中间件全局异常捕获和切面日志"
publishedAt: "2019-12-08T11:09:39+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（十五）——全局异常捕获和切面日志》.html"
---

## 背景
正常在使用`Django`开发的时候，经常会遇到这样的问题：
逻辑代码中可能会出现异常，如果每个异常都需要用`try excetp`去处理，整个开发代码都会充满这些异常处理的代码。
同理，我们要定位问题的时候，需要把每个处理函数的入参打出来，如果在每个处理函数都打日志，这样整个看起来也都充满着非逻辑代码。
这些对于维护工作来说，非常的不方便。

## Django的中间件

`Django`中间件是一个全局的钩子处理框架，[官方文档](https://docs.djangoproject.com/en/2.2/topics/http/middleware/)是这么介绍的：

>Middleware is a framework of hooks into Django’s request/response processing. It’s a light, low-level “plugin” system for globally altering Django’s input or output.

`Django`有自己自带默认的执行顺序，我们的目的，就是在自带的基础上，增加我们需要的特性。

## 配置

在`Django`中的`application`同级目录下新建`middleware`目录，在这个目录中新增`req_acc.py`，再这个文件中新增`RequestAccLog`的类，这个类就是我们的中间件。

增加之后，在`settings.py`中的配置中增加我们的中间件

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'middleware.req_acc.RequestAccLog'
]
```

最后一行，是我们新增加的处理的中间件。

这样，中间件就配置好了。

## 初始化函数__init__
这个`__init__`函数必须要接收一个`get_response`参数，这个是中间件拿到函数处理的返回结果，往上一个中间件抛出的结果。可以看官方给出的例子，我们这边不需要篡改返回结果，因此这个直接套用就行

```python
def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization
```

## 全局钩子函数__call__
这个方法里面是这个中间件的全局钩子函数，这个函数带的参数`request`会吧所有的请求都打出来，但是我们其实不需要所有的请求，我们要打的只是业务请求，也就是`GET`和`POST`方法，对于`OPTIONS`等请求，我们是需要忽略的。

## 全局钩子函数process_view()
这个方法是我们用来打切面日志的钩子函数。这个函数有4个参数：`process_view(request, view_func, view_args, view_kwargs)`

* request

这个参数跟我们业务使用的是一样的，都是`Django`的请求对象,如果是GET方法，我们从`request.GET`中能拿到请求的参数。如果是`POST`方法，可以从`request.POST`中拿到参数

* view_func

这个就是处理函数的对象，如果要打函数名，那么这里要写`view_func.__name__`

* view_args, view_kwargs

这两个参数如果使用了`Django`的模板引擎，那么这里会是参数，由于我们用的是`RESTFul`的方式，这两个都是空数据，有需要的朋友可以自己打出来看看。

这里贴一个我自己用的切面日志的代码：

```python
def process_view(self, request, view_func, view_args, view_kwargs):
    """
    中间件调用视图前的钩子函数，用来打印acc日志
    :param request: 请求的对象
    :param view_func: 请求的python函数对象
    :param view_args: 请求参数，如果没有使用django的参数，这个为空
    :param view_kwargs: 请求参数，如果没有使用django的参数，这个为空
    :return: None, 这里返回None，以便其他中间件的钩子函数进行处理
    """
    try:
        method = request.method
        url = request.path
        func = view_func.__name__
        addr = request.META.get("REMOTE_ADDR")
        if request.method == 'POST':
            args = str(request.POST)
        elif request.method == 'GET':
            args = str(request.GET)
        elif request.method == 'DELETE':
            args = request.query_params['0']
        else:
            args = 'none'
        logger.debug('[{method}]-[{url}]-[{func}]-[{addr}]-[args:]{args}'.format(method=method,
                                                                                    url=url,
                                                                                    func=func,
                                                                                    args=args,
                                                                                    addr=addr))
    except Exception as e:
        logger.error(e)
    return None
```

我这样可以把所有的业务请求的方法，地址，函数名，请求放的ip，还有参数全部都打出来。

## 全局钩子函数process_exception()

这个钩子函数是用于处理异常场景的钩子函数，这个函数有两个参数。`process_exception(request, exception)`

如果一个请求是正常的，那么这个钩子函数是不会被调用的。如果发生了异常，那么`exception`参数就是异常的内容，比如在请求中发生了这样的代码。

```python
try:
    do something
except Exception:
    raise IOError("read file failed!“)
```

那么`exception`参数打出来的内容就是`read file failed!`,因此在这里，我们应该尽量把堆栈信息的内容给打出来，方便定位问题。

下面是我自用的处理函数：

```python
def process_exception(self, request, exception):
    try:
        method = request.method
        url = request.path
        if request.method == 'POST':
            args = str(request.POST)
        elif request.method == 'GET':
            args = str(request.GET)
        elif request.method == 'DELETE':
            args = request.query_params['0']
        else:
            args = 'none'
        e_logger.error("==========start to catch exception===========")
        e_logger.error('[{method}]-[{url}]-[args:]{args}'.format(method=method,
                                                                    url=url,
                                                                    args=args))
        e_logger.error(exception)
        e_logger.error("==========catch exception over===========")
    except Exception as e:
        e_logger.error(e)
```

## 配置日志
配置日志这块可以参考官方文档，日志句柄分开两个，分别输出到`access.log`和`error.log`。这里不单独陈述，有兴趣可以看官方文档。

## 特别注意
我这里使用的`Django`版本是`2.2`。如果使用的是老版本的`Django`，中间件的钩子函数是不一样的，请自行阅读官方文档。