---
title: "Django开发博客（十）—添加分页"
publishedAt: "2016-05-11T23:33:09+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（十）—添加分页.html"
---

## 背景
我的博客上线也有一段时间了，非常稳定的运行了那么久，我也写了挺多文章。

那么问题来了，文章多了，我们并没有做分页，随着文章越来越多，整个页面看起来就不是那么舒服了，所以现在我需要给我的博客做一个分页。

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7 

IDE：PyCharm

***

## 分页的原理
`Django`是一个非常全面的Web框架，也预置了分页的功能，[《Django中文文档-分页》](http://python.usyiyi.cn/django/topics/pagination.html)比较详细的介绍了`Django`的分页功能。

然而，我并不想按照`Django`给的分页功能来做。学习一个东西最好学习它的本质。

分页的原理其实很简单，就是**根据你传入的参数从数据库获取一部分的数据来展示**。比如按照5篇文章来分页，每次就从数据库取5条数据，然后返回给前端展示即可。

## url的修改
我们要对原有的url进行一个简单的修改。修改后的url是这样的：

```python
url(r'^list/(?P<list_type>\S+)/(?P<page>[0-9]+)/$', views.article_list, name='article_list'),
```

比起原来的`url`，这里多传了一个参数`page`。这个`page`就是用来标记我们的页码，比如第一页数据，这个`page`就填1，然后后台接受这个`page`后从数据库去第一条至第五条数据返回给前端。第二页就传2，以此类推。

## views的修改
`url`做了修改，那么`views`也要做一些修改来接收这个`page`。

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

`views`的修改基本上是整个分页的核心。我详细的说明一下。

```python
page = int(page)
```

先把传入的`page`转换成`int`类型，方便后续做数学计算。如果不做转换，在`python2.7`中是`unicode`类型，无法执行计算。

```python
pages = [x for x in range(1, get_pages(list_type) + 1)]
```

这里专门做一个`pages`的列表，是用来给前端迭代生成分页页码的，当然`Django`也可以用loop的方式来生成，我觉得在后台能处理的就一起处理了，前端只负责展示，不进行不必要的计算。

```python
end = pages[-1]
```

这个赋值是吧最后一页的页码返回给前端。

```python
content_list = BlogBody.objects.filter(blog_type=list_type).order_by('-blog_timestamp')[(page - 1) * 8: page * 8]
```

这句就是一个查询的逻辑，也是分页的重点，前面是筛选和按时间戳排序，重点关注最后一个。我这里是按每页8篇文章来分页，那么传入的page为1的时候，我就要取【0：8】的数据来展示，传入2的时候，我就要取【8：16】的数据来展示，这个计算方式就确保了每次传入的page都会去后台取对应的记录。

```python
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
                                                          'errmsg': 'faile'})
                                                          
def get_pages(list_type):
    num = divmod(BlogBody.objects.filter(blog_type=list_type).count(), 8)
    if num[1] != 0:
        pages = num[0] + 1
    else:
        pages = num[0]
    return pages
```

这段逻辑就判断是做一个简单的处理，首先通过查询逻辑确定一共有几页，如果只有一页，那么前端就不展示分页的数据，如果大于1页，那么就把分页的页码展示出来。

## 前端修改
前端要针对后台的修改做一些针对性的修改.

### base.html
`base.html`文件里面的很多url跳转，由于url新增了一个参数，那么也要对应的加上这个参数。

```html
<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
	<ul class="nav navbar-nav">
		<li><a href="{% url 'article_list' 'python' '1'%}">Python</a></li>
		 <li><a href="{% url 'article_list' 'test' '1'%}">有关测试</a></li>
		 <li><a href="{% url 'article_list' 'mytalk' '1'%}">个人杂谈</a></li>
		<li><a href="{% url 'article_list' 'diary' '1'%}">日记</a></li>
		<li><a href="{% url 'message' %}">留言板</a></li>
		<li role="presentation" class="dropdown">
			<a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button"
                                       aria-haspopup="true" aria-expanded="false">
                                        寒彬小数据 <span class="caret"></span>
		  </a>
		<ul class="dropdown-menu">
			<li><a href="{% url 'film' %}">实时票房</a></li>
			<li><a href="{% url 'weather' %}">天气资讯</a></li>
			</ul>
			</li>
		</ul>
		<form class="navbar-form navbar-right" role="search">
			<div class="form-group">
				<input type="text" class="form-control" placeholder="Search">
			</div>
				<button type="submit" class="btn btn-default">搜索</button>
		</form>
</div>
```

为page参数默认赋值为1的逻辑是因为点击某个分类后，肯定是进入这个分类的第一页。

### article_list.html
这个文件的修改同样是最重要的部分。代码如下：

```js
{% if errmsg == 'OK' %}
        <nav>
            <ul class="pagination pagination-lg">
                <li>
                    <a href="{% url 'article_list' list_type '1' %}" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                {% for p in pages %}
                    {% if page == p %}
                        <li class="active"><a href="{% url 'article_list' list_type p %}">{{ p }}</a></li>
                    {% else %}
                        <li><a href="{% url 'article_list' list_type p %}">{{ p }}</a></li>
                    {% endif %}

                {% endfor %}
                <li id="end">
                    <a href="{% url 'article_list' list_type end %}" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    {% endif %}
```

首先判断`errmsg`。如果页码大于2，那么后台传的`errmsg`的值就是OK。这个时候我们才需要进行分页，否则不显示分页。

获取到OK之后，我们要在前端展示页码。分页信息一般由这么几部分组成：

* 第一页和最后一页
* 中间的页码

```js
<li>
	<a href="{% url 'article_list' list_type '1' %}" aria-label="Previous">
		<span aria-hidden="true">&laquo;</span>
	</a>
</li>
```

上面的代码就是处理第一页的逻辑。代码是直接从bootstrap的官网copy下来的，使用的是首页的默认图标，当然也可以自行修改文字。

```js
<li id="end">
	<a href="{% url 'article_list' list_type end %}" aria-label="Next">
		<span aria-hidden="true">&raquo;</span>
	</a>
 </li>
```

之前在views文件中我返了一个end字段。就用来填到最后一页的地方。

```js
{% for p in pages %}
	 {% if page == p %}
		<li class="active"><a href="{% url 'article_list' list_type p %}">{{ p }}</a></li>
	 {% else %}
		<li><a href="{% url 'article_list' list_type p %}">{{ p }}</a></li>
	 {% endif %}
 {% endfor %}
```

上面代码就是生成中间页码部分的代码。有几个地方要注意的。

迭代获取数据，然后生成页码，这个没有上面大问题。

我们必须告诉浏览网页的人当前页是第几页，当然url中有，但是在页面中有的话更好咯。所以在`views`中我专门把`url`中的页码返回给前端，当然用`js`也是可以处理的，我整了一遍，发现用`Django`直接处理更方便。if的逻辑就是当迭代的页码等于当前页码的时候，给当前的li标签加上一个`active`的`class`。

## 最后
我只记录了一些功能的流程，还有很多异常的处理读者可以自行脑补，比如访问者手工输入了不存在的页码要怎么处理。

最后放上效果图

![效果图](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976978611681.jpg)