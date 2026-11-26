---
title: "Django开发博客（一）快速写简单的博客"
publishedAt: "2015-12-30T13:22:28+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django1.9快速写简单的博客.html"
---

## 背景

好吧，我承认是我比较蛋疼，直接下了Django的最新版，然后好像很多东西都改了，比如生成sqlite数据库的时候，老版本用的是python manage.py syncdb，但是在1.9版本中移除了这个命令。最头疼的是现在网络上的教程说的都是1.8或者更老版本的Django。于是花了点时间看了[Django的官方文档](http://python.usyiyi.cn/django/index.html)，结合[虫师的教程](http://www.cnblogs.com/fnng/p/3737964.html)简单写了一下

***
操作系统：Mac OS X EI Caption
Python版本：3.4
Django版本：1.9
IDE：PyCharm
***

## 新建工程
首先在PyCharm中新建一个Django项目，会自动帮你配置好工程的文件，比如我的工程名字叫BlogC。
manage.py ----- Django项目里面的工具，通过它可以调用django shell和数据库等。
settings.py ---- 包含了项目的默认设置，包括数据库信息，调试标志以及其他一些工作的变量。
urls.py ----- 负责把URL模式映射到应用程序。

## 创建一个应用
在PyCharm命令行（以下简称命令行）中输入命令python manage.py startapp easyblog，命令的作用就是创建一个名字叫做easyblog的应用，如果是其他方式，就用命令行工具进入到BlogC的根目录下（就是你打ls会看到manage.py这个文件的目录）输入这个命令

## 数据库模型
在命令行中输入python manage.py migrate，就会自动根据Django现有的模型建立起一套强大的CMS（这里与老版本不一样的内容是：老版本使用的是syncdb这个命令，而且老版本会自动创建用户）。输入完命令后你就会看到新建了一个db.sqlite的文件，这个就是你的数据库文件（当然你也可以用其他数据库）。这时一个CMS系统已经搭建起来了，输入python manage.py runserver启动Django服务器，然后进入127.0.0.1:8000/admin就可以看到你的CMS系统了，不过现在还没有用户。输入命令python manage.py createsuperuser就会让你输入用户名、密码和邮箱。

```
SvenWengdeMacBook-Pro:BlogC svenweng$ python manage.py createsuperuser
Username (leave blank to use 'svenweng'): 
Email address: ****@qq.com
Password: 
Password (again): 
Superuser created successfully.
```

现在用这个用户就可以进入CMS系统了

## 定义博客的数据库模型
我们网站的CMS已经做好了，现在要定义我们自己的模型。

```python
easyblog/models.py

from django.db import models
from django.contrib import admin


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    timestamp = models.DateTimeField()

admin.site.register(BlogPost)
```

上面的代码帮我们定义了一个简单的数据内容。现在我们要让数据库发生变化。执行以下命令

```
python manage.py makemigrations easyblog
python manage.py sqlmigrate easyblog 0001
python manage.py migrate
```

按顺序执行命令，就会把我们新增的models生成。这个时候进入CMS就可以看到多了一个group，在里面输入标题，内容和时间，保存即可。

## 视图
写完数据模型后，我们写视图函数，让我们的网站能够展示出来。

```python
easyblog/views.py

from django.shortcuts import render
from easyblog.models import BlogPost


def index(request):
    blog_list = BlogPost.objects.all()
    return render(request, 'index.html', {'blog_list': blog_list})
```

def index表示定义一个index的视图函数，BlogPost.objects.all()就表示我们刚刚定义的模型类BlogPost返回所有数据，我们在CMS插入的文章就会全部返回给blog_list。最后就是把视图函数处理的内容返回给模版index.html。

## 模版
在模版文件templates中新建index.html。根据视图函数返回的数据，我们来编写这个index.html模版

```python
templates/index.html

{% for blog in blog_list %}
    <h2>{{ blog.title }}</h2>
    <p>{{ blog.timestamp }}</p>
    <p>{{ blog.body }}</p>
{% endfor%}
```

视图函数最后的{'blog_list': blog_list}就表示把blog_list的内容赋值给‘blog_list’，所以在模版中我们要有‘blog_list’这个变量，用for来迭代，把数据全部打出来

## 地址
内容我们已经写好了，现在要通过一个地址定位到我们写的网站。在BlogC中已经有一个urls.py文件，这个文件就是把定位到我们网站的地址。

```python
BlogC/urls.py

from django.conf.urls import url, include
from django.contrib import admin

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^easyblog/', include('easyblog.urls')),
]
```

上面的代码就表示我们输入地址后带有easyblog的链接全部会跳转到easyblog/urls.py这个文件中，我们需要新建这个文件，然后输入下面的代码

```python
easyblog/urls.py

from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
]
```

这个就表示我们输入地址后带有easyblog的网址链接的视图。url的参数，第一个是一个名称适配的正则。这里表示为空，第二个参数就是视图函数的地址了，name表示视图函数的名称。

## 完工
我们简单的blog系统就搭建起来了，现在需要看看结果是什么，运行`python manage.py runserver`，进入`127.0.0.1:8000/easyblog`。就可以看到我们刚刚写的网站了。

## 优化
我们发现我们写的网站很丑。这时你需要给你的模版加上一些css样式，新建一个base.html模版，输入下列代码

```python
templates/base.html

<html>
      <style type="text/css">
        body{color:#efd;background:#453;padding:0 5em;margin:0}
        h1{padding:2em 1em;background:#675;text-align: center}
        h2{color:#bf8;border-top:1px dotted #fff;margin-top:2em}
        p{margin:1em 0}
      </style>

      <body>
        <h1>点点寒彬的blog</h1>
        <h3>精通各大语言的hello world!</h3>
        {% block content %}
        {% endblock %}
      </body>
</html>
```

然后把我们之前的1index.html1代码改为这样

```python
templates/index.html

{% extends "base.html" %}

{% block content %}
{% for blog in blog_list %}
    <h2>{{ blog.title }}</h2>
    <p>{{ blog.timestamp }}</p>
    <p>{{ blog.body }}</p>
{% endfor%}
{% endblock %}
```

好了，再次进入我们的网站看看。

## 后记
这里搭建的只是一个很简单很简单的博客系统，它没有登陆，分类等博客的相关要素，需要你自己去拓展。CSS真是一个不错的东西。值得去看看。