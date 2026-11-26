---
title: "Django开发博客（五）——新增文章"
publishedAt: "2016-01-06T14:34:32+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（五）——新增文章.html"
---


## 背景
大概的博客已经搭建完毕了，但是我们添加内容一直都是通过后台系统来添加。这样的博客感觉档次不是非常高。我们需要添加一个页面，用来提交文章。
另外，我们要修复一些之前处理不是很好的小问题。
1、我们使用css来限制了显示的内容，其实Django自身就可以实现这个功能
2、我们添加的文章全部都缩成了一团。最基本的换行都做不到，这样看起来完全不像是浏览文章。

***
版本相关 

操作系统：Mac OS X EI Caption 

Python版本：3.4 

Django版本：1.9 

IDE：PyCharm

***

## 思路
其实没什么思路可言，就是加一个页面，只是目前对于前端的技术没有研究，只能写一个稍微能看的界面。然后把这个界面的内容传递给视图函数，视图函数重定向后跳转一个页面展示。
使用Django来实现限制显示内容，这个是参考Django官方文档中的[内置标签和过滤器](http://python.usyiyi.cn/django/ref/templates/builtins.html)修改而来，经过实现，效果不错。
解决文章内容全部所称一段，也是参考[内置标签和过滤器](http://python.usyiyi.cn/django/ref/templates/builtins.html)修改而来的。

## 视图函数
由于我在实际使用过程中，发现打开一个页面的时候，调用的是GET方法，所以我们这里使用两个视图函数来处理这部分逻辑，首先，一个视图函数显示正常的添加文章的页面。在这个页面提交后，跳转到一个处理数据的函数。这个视图函数需要获取到提交的数据，然后存入数据库，最后重定向到一个显示的页面。
第一个显示添加文章的页面：

```python
views.py

def add_article(request):
    return render(request, 'add_article.html')
```

直接返回一个界面，没什么好说的，在主页自己喜欢的地方添加一个按钮跳转到这个页面即可。上面的add_article.html模版是下载的文件中没有，需要自己写。= =！很蛋疼，在模版中贴上我写的丑陋的样式。
处理数据的代码如下：

```python
views.py

def sub_article(request):
    if request.method == 'GET':
        mytype = request.GET['article_type']
        title = request.GET['article_title']
        body = request.GET['article_editor']
        updb = BlogBody(blog_title=title, blog_body=body, blog_type=mytype, blog_timestamp=time.strftime("%Y-%m-%d %X", time.localtime()), blog_author='点点寒彬')
        updb.save()
        return redirect('/grzx/'+mytype)
```
从模版中get需要写入数据库的数据，都是一些get方法，时间直接使用当前文件就行了，作者我是直接写死了用我的网名，当然你也可以在前端加一个字段来传递。最后重定向到一个页面，我是直接跳转到刚刚提交文章的分类信息中，所以使用'/grzx/'+mytype。

## url定义
url很简单，加两条适配视图函数的url就行了。

```python
urls.py

    url(r'^add_article/', views.add_article, name='add_article'),
    url(r'^sub_article/', views.sub_article, name='sub_article'),
```

## 模版
我自己新增的模版，样式比较丑，但是再怎么说也可以实现功能。。。。

```python
add_article.html

{% extends "base.html" %}
{% block bodycontent %}
<!--header end-->
<div id="mainbody" style="background-color: #333333">
  <div class="blogs">
    <div class="newlist">
  <h2>您当前的位置：<a href="/">首页</a>&nbsp;>&nbsp;新增文章</h2>

<ul>
<form method="get" action="/grzx/sub_article">
    {% csrf_token %}
    <p>文章标题</p>
    <div>
        <select name="article_type" style="height: 20px; width: 120px;">
            <option selected="selected">请选择文章类型</option>
            <option value="Python">Python</option>
            <option value="abouttest">测试相关</option>
            <option value="mytalk">个人杂谈</option>
            <option value="diary">偶尔能想起来的日记</option>
        </select>
        <input name="article_title" type="text" style="height: 20px;width: 500px;" placeholder="请输入文章标题">
    </div>
    <p>文章内容</p>
    <textarea name="article_editor" rows="55" style="width: 630px;"></textarea>
    <input type="submit" value="提交" style="margin-left: 300px;width: 60px;height: 20px;">
</form>
</ul>

<div class="page">
    <a title="Total record"><b>38</b></a>
    <b>1</b><a href="/jstt/index_2.html">2</a>
    <a href="/jstt/index_2.html">></a>
    <a href="/jstt/index_2.html">>></a></div>
</div>

    <!--bloglist end-->
  </div>
  <!--blogs end-->
</div>
<!--mainbody end-->
{% endblock bodycontent %}
```

## 另外两个优化问题

* 使用Django做一个文字的限制，其实就在代码中加上一个过滤就行了，把原来的`{x.blog_body}`改为`{ x.blog_body | slice:":100"}`就可以了，不过使用过程中发现，这样处理对比css处理，在文章的最后少了3个点。
* 处理文章缩成一团，`{ blog_content.blog_body}`改为`{ blog_content.blog_body | linebreaksbr }`，加上一个转换换行符的功能即可

## 后记
实现方式可以有很多种，这里只是初学者能够快速理解的一种，`form`还可以使用`Django`中的`form`类来生成`form`标签。用`POST`方式处理的话就只需要一个视图函数就行了，详细内容参照[《从模型创建表单》](http://python.usyiyi.cn/django/topics/forms/modelforms.html)