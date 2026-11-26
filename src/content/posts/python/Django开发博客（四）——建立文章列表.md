---
title: "Django开发博客（四）——建立文章列表"
publishedAt: "2016-01-05T14:33:54+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（四）——建立文章列表.html"
---

## 背景
博客系统还需要有一个分类列表来展示某一个分类下的文章，在之前的文章中我们在数据库中留了一个type字段，用来存储文章的类型。博客的最上方，列出了自己博客的分类。我们就按照这个分类来做文章的区分，点击某个标签，就把文章内容全部显示出来。

***
版本相关 

操作系统：Mac OS X EI Caption 

Python版本：3.4 

Django版本：1.9 

IDE：PyCharm

***

## 思路
思路依然是一个很简单的思路。首先建立一个地址来接收点击后跳转的页面。由于我们自己定好了分类，这个链接可以直接定一个硬链接，简单粗暴。跳转到哪个页面后，根据这个类型去数据库抓取所有的文章，再传递给列表的模版，最后用for循环把所有数据打出来，就over了。

## url的定义
这次我给标题定义的是`url(r'^python/', views.python, name='python')`毕竟这里需要使用的链接只有这么几个。url定了之后，就需要修改模版的url跳转和视图函数对于这个跳转的处理了
## 视图函数
新建一个python的函数，用来处理这部分逻辑，同理，这里也是写死的，跳转到这个界面就要显示Python的信息，因此我们要去数据库抓取type=Python的所有数据，返回给模版

```python
views.py

def python(request):
    sql = 'select id, blog_title, blog_type, blog_timestamp, blog_body from grzx_blogbody WHERE blog_type = "Python"'
    python_blog = BlogBody.objects.raw(sql)
    return render(request, 'python_list.html', {'python_blog': python_blog})
```

这里也可以使用python_blog = BlogBody.objects.filter(blog_type='Python')来代替执行sql语句，效果是一样的。
## 模版修改
下载的模版文件中有一个list.html，把它名称改为python_list.html。我们就有一个展示文章列表的页面了。把里面ul标签的内容全部改为for循环打出视图函数返回的内容就行了

```python
python_list.html

<ul>
    {% for x in python_blog %}
        <p class="ptit"><b><a href="{% url 'article' x.id %}"> {{ x.blog_title }}</a></b></p>
        <p class="ptime">发布时间：{{ x.blog_timestamp }} 作者：{{ x.blog_author }}  分类：{{ x.blog_type }} </p>
        <div class="pcon">{{ x.blog_body }}</div>
        <div class="line"></div>
    {% endfor %}
</ul>
```

这里我已经把一些累赘的东西去掉了，比如图片，还有一些没必要存在的A标签。每一个列表需要实现点击跳转到文章详情，这里就要利用到我们上次使用的A标签中的url跳转方式。{% url 'article' x.id %}。详细可参照[《Django开发博客（三）——在新的页面展示文章》。](http://blog.csdn.net/wyb199026/article/details/50458170)
这里其实还会遇到一个问题，如果文章的内容太大，由于我们没有做限制，列表就会把所有的内容显示出来。这样其实就做成了一个文章的展示列表，而不是我们想要的标题+内容的展示列表。这个地方用Python来实现比较折腾，要先从数据库取出文章内容的数据，再做限制，我们可以用一个简单的CSS来做处理。代码如下

```
view.css

.pcon{line-height:3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
```

把`view.css`中的`.pcon`加上`white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`就搞定了。现在点击查看，就有点博客文章列表的样子啦！
## 后记
可以根据这个方式，把相关的类型全部都搭建起来，文章分类就解决了，当然，还有一些不足，比如列表的分页，文章的录入，编辑、评论系统等功能还没有搭建起来。