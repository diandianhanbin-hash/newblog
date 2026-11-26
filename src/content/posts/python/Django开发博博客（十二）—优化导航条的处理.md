---
title: "Django开发博博客（十二）—优化导航条的处理"
publishedAt: "2016-07-01T16:16:15+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博博客（十二）—优化导航条的处理.html"
---

## 背景
在之前的开发过程中，博客的每一个栏位内容都是写死的、固定的，这样会有很多坏处，比如一开始我写的导航内容只有`Python`、`有关测试`、`个人杂谈`、`测试人生`和`留言板`，那么随着我阅读的资料越来越多，我写的文章内容的广度已经很大了，这些分类不够用，那么每次加一些东西都要重新加页面，再加逻辑，使用起来就非常笨重，因此需要对导航这块进行页面的优化。

## 环境

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7 

IDE：PyCharm

***

## 思路
要实现的是可以任意加导航的内容，而不需要修改后台的处理逻辑，那么就必须要做一个参数化处理。

导航栏点击后，传递参数给后台，后台根据这个参数，进行内容的筛选和返回，前端根据返回的内容进行页面展示。

## views.py

在`views.py`中把原来的每个页面定制的方法删了。使用如下代码：

```python
def article_list(request, list_type, page):
    page = int(page)
    pages = [x for x in range(1, get_pages(list_type) + 1)]
    end = pages[-1]
    content_list = BlogBody.objects.filter(blog_type=list_type).order_by('-blog_timestamp')[(page - 1) * 8: page * 8]
    print page
    if get_pages(list_type) > 1:
        return render(request, 'blog/article_list.html', {'content_list': content_list,
                                                          'list_type': list_type,
                                                          'pages': pages,
                                                          'end': end,
                                                          'page': page,
                                                          'errmsg': 'OK'})
    else:
        return render(request, 'blog/article_list.html', {'content_list': content_list,
                                                          'list_type': list_type,
                                                          'pages': pages,
                                                          'end': end,
                                                          'errmsg': 'faile'})
```

这样的处理方式就非常简单了，需要从`url`中获取两个参数，一个是`list_type`这个参数用来查询数据库，通过这个类别来查询数据库的文章列表。另一个是`page`，这个参数用来处理分页的逻辑。

## 前端页面
参数这样处理之前，需要给每一个新增的导航条重写一个页面，然后继承`base.html`。这样处理之后，只要在前端的`url`跳转参数加上相关信息，就能够非常简单的处理。相关增加的内容如下：

```html
<ul class="nav navbar-nav navbar-right">
	<li class="python"><a href="{% url 'article_list' 'python' '1' %}">Python</a></li>
	<li class="test"><a href="{% url 'article_list' 'test' '1' %}">有关测试</a></li>
	<li class="mytalk"><a href="{% url 'article_list' 'mytalk' '1' %}">个人杂谈</a></li>
	<li class="diary"><a href="{% url 'article_list' 'diary' '1' %}">测试人生</a></li>
	<li role="presentation" class="dropdown">
		<a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button"aria-haspopup="true" aria-expanded="false">其他技术 <span class="caret"></span></a>
	<ul class="dropdown-menu">
		<li><a href="{% url 'article_list' 'git' '1' %}">Git</a></li>
		<li><a href="{% url 'article_list' 'java' '1' %}">Java</a></li>
		<!--<li><a href="{% url 'article_list' 'ios' '1'%}">IOS</a></li>-->
	</ul>
	</li>
	<li class="leavemessage"><a href="{% url 'message' %}">留言板</a></li>
	<li role="presentation" class="dropdown">
		<a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button"aria-haspopup="true" aria-expanded="false">寒彬小数据 <span class="caret"></span></a>
	<ul class="dropdown-menu">
		<li><a href="{% url 'weather' %}">天气资讯</a></li>
	</ul>
	</li>
</ul>
```

下次新增导航条的时候，只要在这里新增内容就行了，新增的时候带上两个 参数，一个是类型，一个是分页用的1。所有的后端代码都不需要变动。非常的方便。

## 后记
随着学习的不断深入，是需要不断的增加内容的，后续我们还可以做标签云，归档等功能，实现一个完整的博客功能。

