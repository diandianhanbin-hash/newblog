---
title: "Django开发博客（六）——添加MarkDown支持"
publishedAt: "2016-01-11T14:35:15+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（六）——添加MarkDown支持.html"
---

## 背景
新增文章的功能总算是磕磕碰碰的完成了，有时间要去学学前端的技术，自己写一个界面出来，目前看到的界面都是别人的，看起来有点坑，虽然总体风格不错，但是很难找到特别符合我想法的界面。
下一步博客需要新增markdown的功能、编辑功能和删除功能
注：markdown现在基本上已经是一个博客所必须具备的功能了，语法详见[《markdown语法说明》](http://www.appinn.com/markdown/)
编辑和删除功能：这两个功能一般来说放在后台使用，因为博客只负责展示内容给别人看，只不过熟悉一下这个东西

***
版本相关 

操作系统：Mac OS X EI Caption 

Python版本：3.4 

Django版本：1.9 

IDE：PyCharm

***

## 编辑和删除

### 思路
删除的思路很简单，点击按钮的时候web端传一个文章的唯一键值（ID）给后端，后端执行删除操作吧数据库这条记录删除了，再返回一个页面，可以自己做一个结果页。也可以直接返回首页（或者其他），我是直接返回首页了，等学会前端后再来返工写这个结果页。
编辑相对复杂一些，点击编辑按钮的时候，web端要吧文章的ID传给后端，后端要跳转到一个页面，然后把文章的内容填充到页面的编辑框中。我的想法是和新增使用同一个页面，具体实现细节还没想好，后续再增加这个逻辑的处理

### 视图函数
先写好编辑和删除的函数，编辑先用占位符处理，删除可以写好方法。

```python
views.py

def del_article(request, blog_body_id):
    BlogBody.objects.get(id=blog_body_id).delete()
    return redirect('/')


def edit_article(request):
    pass
```

传入ID，然后使用ID在数据库做一个删除，最后重定向到首页。编辑的视图函数暂时不处理，使用pass站位。

### url处理
url需要新增一个删除的匹配规则。

```
urls.py

url(r'^del_article/(?P<blog_body_id>\d+)/$', views.del_article, name='del_article'),
```

匹配的规则和显示文章的内容一样。需要吧这个(?P<blog_body_id>\d+加上，这样后台才能接受到传入的ID。

### 模版处理
模版处理其实就是一个删除的入口。这个入口放在那里取决于你自己。我是放在文章的内容页里面

```
view.html

<a href="/">编辑</a> <a href="{% url 'del_article' blog_content.id %}">删除</a>
```

这个可以自己随意放置，里面链接的方式和之前的URL跳转方式一样。这样删除功能就搞定了

## markdown

### 思路
这一块就比较麻烦了，自己去写语法肯定是比较麻烦的。Python有现成的markdown库，我们直接调用就行了。安装方法如下：

```
$sudo pip install markdown
```

安装完毕之后，我们要做的就是在Django中使用这个语法作为一个过滤器，把存入后台的markdown文本转化显示出来。
注：Django在1.5之后的版本把内置的markdown移除了，所以我们只能自己制造过滤器。

### 自定义过滤器
在app下新建一个templatetags，里面新建两个文件，一个是__init__.py空文件。表示这个是Python的一个模块。另一个是custom_markdown.py。输入以下代码：


```
app/templatetags/custom_markdown.py

import markdown
from django import template
from django.template.defaultfilters import stringfilter
from django.utils.encoding import force_text
from django.utils.safestring import mark_safe

register = template.Library()  # 自定义filter时必须加上


@register.filter(is_safe=True)  # 注册template filter
@stringfilter  # 希望字符串作为参数
def custom_markdown(value):
    return mark_safe(markdown.markdown(value,
                                       extensions=['markdown.extensions.fenced_code', 'markdown.extensions.codehilite'],
                                       safe_mode=True,
                                       enable_attributes=False))

```

这样我们的过滤方法就写好了，详细的内容参照[《自定义标签和过滤器》](http://python.usyiyi.cn/django/howto/custom-template-tags.html)

### 模版处理
在需要使用markdown过滤的模版中输入这行代码{% load custom_markdown %}。表示载入我们的过滤器。然后再我们的文章内容的变量中使用这个就行了，类似这样：{ blog_content.blog_body | custom_markdown }就不需要上次写的那个增加空格和换行的过滤了。

### 代码高亮
使用markdown还不够，我们还需要让代码高亮显示。去[pygment-css](https://github.com/richleland/pygments-css)下载自己需要的css样式，随便一个下载来使用都可以。我是全部下下来一个一个的看了效果。使用这个的时候需要安装[pygment](https://pypi.python.org/pypi/Pygments)，我是使用3.x的版本，所以我下载的是3.3的库，安装完毕后，在base.html载入下载的CSS就可以看到最终的效果了

## 后记
markdown和语法高亮相关是参考[《极客学院教程》](http://wiki.jikexueyuan.com/project/django-set-up-blog/markdown.html)整（chao）理（xi）而来。总体来说，还是很快速的实现了功能。但是还是有一些问题。比如：
1、存放到数据库的字段会变成##这种，显示列表的时候不好看。
2、我的HTML代码是高亮了。。。。可是Python的代码依然不是高亮的。= =！
3、代码不会自动换行，基本上长代码都无法浏览。
（未完待续。。。。）