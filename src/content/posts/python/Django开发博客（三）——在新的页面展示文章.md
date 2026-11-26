---
title: "Django开发博客（三）——在新的页面展示文章"
publishedAt: "2016-01-04T20:33:29+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（三）——在新的页面展示文章.html"
---

## 背景
之前的文章写了如何用模版快速改成自己的博客，但是那只有首页，其他页面并没有做出来。现在需要实现的功能为：在首页点击一篇文章的标题，能够在新的页面展示文章的所有内容。

***
版本相关

操作系统：Mac OS X EI Caption 

Python版本：3.4 

Django版本：1.9 

IDE：PyCharm

***

## 思路
思路很简单，其实就是我点击标题，要跳转到一个新的url地址，跳转到这个地址的时候，会传给url一个**唯一的标识**视图函数再从url中捕获这个**唯一的标识**，这个标识就代表这个标题的文章所有信息的索引。然后用这个**唯一的标识**去数据库查询出这里的记录，再把查出来的记录传递到展示文章内容的页面就可以了。

## 模版文件的修改
模版文件是html的内容，Html中我们文章的标题有一个a标签，这个标签标识超链接，点击标题就会跳转到a标签指向的url。所以我们就从这里下手

```python
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
```

用for循环生成的文章标题的a标签都用href="{% url 'article' content.id%}"这个带入，每一篇文章的标题的链接就是/app/article/id。这里我们就完成了跳转的第一步。
##url跳转视图函数
跳转到了新的url。我们需要获取这个url的id信息，然后传递给视图函数去执行相关处理。在url.py中加入这个url匹配信息

```python
url.py

 url(r'^article/(?P<blog_body_id>[0-9])/$', views.article, name='article'),
```

url其中的?P blog_body_id[0-9]就表示这样一个信息

```
在Python 正则表达式中，命名正则表达式组的语法是(?P<name>pattern)，其中name 是组的名称，pattern 是要匹配的模式。
```

所以我们这样写，blog_body_id就表示传递进去的id值，也就是a标签跳转页面/app/article/id中的id。[0-9]表示是这个位置只会出现数字。这部分具体的介绍请参考[《URL调度器》](http://python.usyiyi.cn/django/topics/http/urls.html)
## 视图函数处理
这时url已经把id传递给了视图函数。现在视图函数要执行的处理有：1、获取传入的id。2、使用id查询文章的信息。3、把文章的信息返回给处理的模版。

* 获取传入的id

在视图函数中定义一个article的函数，获取的信息为request和blog_body_id.

```python
def article(request, blog_body_id=''):
	print(blog_body_id)
```

执行的时候，如果有参数传入，则会把传入的参数打印出来

* 使用id查询文章
 
这个就比较简单了，因为这个id是唯一的，所以只要用get方法就可以获取了

```
blog_content = BlogBody.objects.get(id=blog_body_id)
```


* 把文章信息返回给模版

返回信息给模版，我们下载的模版有一个view.html文件，就是它了，你也可以自己改一个名字。

```
return render(request, 'view.html', {'blog_content': blog_content})
```

## `view.html`模版的修改
相关修改的内容参照[《使用现有的H5模版写网站》](http://blog.csdn.net/wyb199026/article/details/50456143)修改就可以了。
