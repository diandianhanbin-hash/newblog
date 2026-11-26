---
title: "Django开发博客（二）——使用模版写网站"
publishedAt: "2016-01-04T14:32:59+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（二）——使用模版写网站.html"
---

## 前提
我们应该把精力放在写Python上，而不是写前端的样式，所以我比较喜欢的就是拿一个模版来改一改，就可以获得一个漂亮的界面，否则，你需要好好的了解了解html和css相关的知识。
## 版本相关

***
操作系统：Mac OS X EI Caption 

Python版本：3.4 

Django版本：1.9 

IDE：PyCharm

***

## 模版下载
网络上应该有很多很多的模版可以下载，可以直接找Django的源码下载，不过我是不太推荐这样，因为下下来的东西你不知道要如何实现它。对于学习`Django`来说没有什么好处，本次演示的模版下载地址：[黑色质感时间轴html5个人博客模板](http://www.yangqq.com/download/div/2013-08-08/571.html)我个人比较喜欢这种黑色系的风格。
## 放入Django
我目前的目录结构是这样的

```
|-MyBlog
 |---__pycache__
 |-grzx
 |---__pycache__
 |---migrations
 |-----__pycache__
 |---templates
 |-static
 |---css
 |---images
 |-----index_img
 |-----music_img
 |---js
```

很简单，把所有的.html文件放到templates文件夹下，所有的css、js和img文件全部放在static文件中，Django读取静态文件就是从static文件夹中加载。详细的配置实在setting.py中，有兴趣的可以看看[Django的官方中文文档。](http://python.usyiyi.cn/django/index.html)
## 数据库系统
数据库目前我弄了两个简单的表来处理数据
***
About Me

网名：Sven Weng | 点点寒彬

职业：测试工程师

公司：XXX

Email：XXX
***
这部分在model里面，用一个表来处理这部分数据，记录这个主要是为了以后拓展使用

```python
models.py

class UserInfo(models.Model):
    nickname = models.CharField(max_length=20)
    work = models.CharField(max_length=20)
    company = models.CharField(max_length=50)
    email = models.CharField(max_length=20)
```

主体部分我们可以看到有一段一段的文章，元素有：标题、图片、部分内容、时间、（喜欢和评论）还有一个没显示的作者。所以数据库这样写。

```python
models.py

class BlogBody(models.Model):
    blog_title = models.CharField(max_length=50)
    blog_body = models.TextField()
    blog_type = models.CharField(max_length=50)
    blog_timestamp = models.DateTimeField()
    blog_imgurl = models.CharField(max_length=50, null=True)
    blog_author = models.CharField(max_length=20)
```

null=True表示这个字段允许空。这两个表内容写好后生成数据库。1.9生成数据库的方式和之前不一样，不了解的可以看看[《Django1.9快速写简单的博客》](http://blog.csdn.net/wyb199026/article/details/50437048)，数据库结构生成之后，进入admin手工插入文章内容。
## 视图函数
视图函数中我们需要返回给index.html两个数据库的信息，一个是UserInfo中的我的个人信息，另外一个是文章的信息，代码如下：

```python
views.py

from django.shortcuts import render
from .models import UserInfo, BlogBody


def index(request):
    userinfo = UserInfo.objects.first()
    blog_body = BlogBody.objects.all()[:6]
    return render(request,
                  'index.html',
                  {'userinfo': userinfo, 'blog_body': blog_body})
```
userinfo = UserInfo.objects.first()这句表示返回UserInfo数据库中的第一条信息（其实也只有自己插入的一条信息）
blog_body = BlogBody.objects.all()[:6]这句表示返回BlogBody中的前6条数据。（首页视图有限，只能展示其中的一些）
更多的数据库操作方式请查看[《执行查询》](http://python.usyiyi.cn/django/topics/db/queries.html)

## 地址配置
我们需要给视图函数配置一个地址。按照[《Django1.9快速写简单的博客》](http://blog.csdn.net/wyb199026/article/details/50437048)把地址链接到自己应用的urls。

```python
app/urls.py

from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    ]
```
加上这句url后，我们进入`127.0.0.1:8000/app/`就可以看到我们调用的`index.html`

## 模版修改
模版文件中有`index.html list.html view.html`这些页面使用的都是同一个头部和脚部。所以把这部分内容单独抓出来写一个base.html文件，所有页面都继承这个就行了。在头部和脚部中间加上

```python
{% block bodycontent %}
{% endblock bodycontent %}
```

这一段，内容就是可以自定义的内容，index.html中只要输入

```python
{% extends "base.html" %}#继承base.html

{% block bodycontent %}
#index的中间内容
{% endblock bodycontent %}
```

这样，头部和尾部就是统一样式了。现在需要修改index的内容。
### 思路
首先，首页中多篇文章的显示方式是相同的，也就是说我们可以使用一个for循环来生成多个数据。其次，我们需要把每一篇文章的数据用数据库的内容来填充，最后，点击标题后可以跳转到文章详细内容（后续再谈）
### 实现
实现的过程中，只要填充内容就行，不要修改html中的相关样式参数

```python
index.html

...
    <div class="card">
        <h1>About Me</h1>
        <p>网名：{{ userinfo.nickname }}</p>
        <p>职业：{{ userinfo.work }}</p>
        <p>公司：{{ userinfo.company }}</p>
        <p>Email：{{ userinfo.email }}</p>
      <ul class="linkmore">
        <li><a href="/" class="talk" title="给我留言"></a></li>
        <li><a href="/" class="address" title="联系地址"></a></li>
        <li><a href="/" class="email" title="给我写信"></a></li>
        <li><a href="/" class="photos" title="生活照片"></a></li>
        <li><a href="/" class="heart" title="关注我"></a></li>
      </ul>
    </div>
....
{% for content in blog_body %}
      <li>
        <div class="arrow_box">
          <div class="ti"></div>
          <!--三角形-->
          <div class="ci"></div>
          <!--圆形-->
          <h2 class="title"><a href="{% url 'article' content.id%}" target="_blank">{{ content.blog_title }}</a></h2>
          <ul class="textinfo">
            <a href="/"><img src="{{ content.blog_imgurl }}"></a>
            <p> {{ content.blog_body }}</p>
          </ul>
          <ul class="details">
            <li class="likes"><a href="#">10</a></li>
            <li class="comments"><a href="#">34</a></li>
            <li class="icon-time"><a href="#">{{ content.blog_timestamp }}</a></li>
          </ul>
        </div>
        <!--arrow_box end--> 
      </li>
      {% endfor %}
      ···
```

修改完成后，就可以看到最终的样式了。
