---
title: "Django开发博客（七）——MarkDown优化"
publishedAt: "2016-01-14T14:35:52+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（七）——MarkDown优化.html"
---

## 背景
上一次把markdown集成之后，发现还是有很多问题。这次需要做一些优化。
1、markdown与普通文本的区别显示。
2、增加点击量的统计
3、添加名片卡的滑动

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：3.4 

Django版本：1.9 

IDE：PyCharm

***

## markdown的优化
我试着转载其他博客的内容过来，发现非`markdown`格式的文本转过来显示的很丑很丑，几乎没办法看，所以针对这个需要做一些优化。刚好之前数据库的字段定义的太少了，趁这个机会扩充一下。在models.py中加几个字段上去。

```python
models.py

blog_ismarkdown = models.CharField(max_length=1, null=True)
blog_like = models.IntegerField(null=True)
blog_clicknum = models.IntegerField(null=True)
```

三个字段，一个用来控制文章格式的分类，是否属于`markdown`。like字段留存，后续做点赞的扩充。`clicknum`字段用来处理统计点击量的数据。
扩充的时候需要添加null=True来处理这几个字段允许为空，否则无法变更成功。变更成功后再取消这些null。

```python
python manage.py makemigrations grzx
python manage.py sqlmigrate grzx 0004
python manage.py migrate
```

第二句的0004要根据自己数据库迁移的版本来定。

### 思路
添加`ismarkdown`字段的意义在于，添加文章的时候，让别人选择文章类型是否属于`markdown`，如果是，则传递一个1到后台，后台处理到数据库中，如果不是，则传递一个0到后台，后台处理到数据库。别人点击查看文章内容时，后台传递文章主体内容到模版，一起传递一个markdown标记。模版做一个简单的判断，以`markdown`格式还是普通文本格式来显示。

### 视图函数的处理
根据上面的思路，需要修改的地方有两个，一个是新增文章的时候存储这个`ismarkdown`这个标记。另一个是查看文章内容的时候返回这个标记，让模版使用相应的方式来处理。

```python
views.py  sub_article

def sub_article(request):
    cursor = connection.cursor()
    if request.method == 'POST':
        mytype = request.POST['article_type']
        title = request.POST['article_title']
        # body = markdown(request.POST['article_editor'])
        body = request.POST['article_editor']
        markdown = request.POST['article_markdown']
        updb = BlogBody(blog_title=title, blog_ismarkdown=markdown, blog_body=body, blog_type=mytype, blog_timestamp=time.strftime("%Y-%m-%d %X", time.localtime()), blog_author='点点寒彬', blog_clicknum=1, blog_like=0)
        updb.save()
        cursor.execute('select max(id) from grzx_blogbody where blog_type = %s ', [mytype])
        new_id = cursor.fetchone()
        return redirect('/grzx/article/' + str(new_id[0]) + '/')
```

由于返回给模版的时候，是整条记录返回回去的，那么就不用专门来处理，只要在模版层处理就行了。

### 模版处理
根据上面的思路，模版处理需要处理两个地方。首先，我们在新增文章的时候需要增加一个文本类型是否为`markdown`的选择栏位。代码如下：

```python
add_article.html

<form method="post" action="/grzx/sub_article/">
    {% csrf_token %}
    <p>文章标题</p>
    <div>
        <select name="article_type" style="height: 20px; width: 120px;">
            <option value="Python" selected="selected">Python</option>
            <option value="abouttest">测试相关</option>
            <option value="mytalk">个人杂谈</option>
            <option value="diary">偶尔能想起来的日记</option>
        </select>
        <input name="article_title" type="text" style="height: 20px;width: 400px;" placeholder="请输入文章标题">
{#        <input name="article_markdown" type="checkbox" value="1">MarkDown#}
        <select name="article_markdown" style="height: 20px; width: 90px;">
            <option value="1" selected="selected">MarkDown</option>
            <option value="0">普通文本</option>
        </select>
    </div>
    <p>文章内容</p>
    <textarea name="article_editor" rows="55" style="width: 630px;"></textarea>
    <input type="submit" value="提交" style="margin-left: 300px;width: 60px;height: 20px;">
</form>
```

增加了这个选择栏位后，每次填写的时候就会传递标记给视图函数去处理了。再一个需要处理的是`view.html`。需要做一个简单的判断。代码如下：

```python
view.html

        <p style="word-wrap: break-word;word-break:break-all;">
            {% if blog_content.blog_ismarkdown == '1' %}
                {{ blog_content.blog_body | custom_markdown }}
            {% elif blog_content.blog_ismarkdown == '0' %}
                {{ blog_content.blog_body }}
            {% endif %}
        </p>
```

这样就完成了。跑起来试试看吧。

## 点击量的统计

### 思路
这部分就比较简单了，上文已经把数据库加好了，现在只要做一个简单的处理，就是点击的时候在数据库吧这个字段的数字加一就好了。当然，我们做了这个处理，模版就要把点击量显示出来。

### 视图函数
这部分很简单，就直接上代码了：

```python
views.py

def article(request, blog_body_id=''):
    """
    处理点击事件,并且点击数加一
    """
    blog_content = BlogBody.objects.get(id=blog_body_id)
    num = blog_content.blog_clicknum
    num += 1
    blog_content.blog_clicknum = num
    blog_content.save()
    return render(request, 'view.html', {'blog_content': blog_content})
```

### 模版函数
同样很简单，就是展示一个显示数据，代码如下：

```python
view.html

<p class="box">发布时间：{{ blog_content.blog_timestamp }}<span>作者：{{ blog_content.blog_author }}</span><span>阅读:{{ blog_content.blog_clicknum }}</span><a href="/">编辑</a> <a href="{% url 'del_article' blog_content.id %}">删除</a></p>
```

## 添加名片的滑动跟随
这部分使用的是一个CSS的属性，就是把这个盒子层次摆放到第一位。代码如下：

```python
       <div class="card" style="width: 280px;position: fixed;z-index: 1;">
            <h1>About Me</h1>
            <p>网名：Sven Weng | 点点寒彬</p>
            <p>职业：测试工程师</p>
            <p>公司：华林证券</p>
            <p>Email：234827102@qq.com</p>
          <ul class="linkmore">
            <li><a href="/grzx/add_article" class="talk" title="给我留言"></a></li>
            <li><a href="/" class="address" title="联系地址"></a></li>
            <li><a href="/" class="email" title="给我写信"></a></li>
            <li><a href="/" class="photos" title="生活照片"></a></li>
    {#        <li><a href="/" class="heart" title="关注我"></a></li>#}
          </ul>
        </div>
```

就是在`style`中增加一个`z-index:1;`这个`css`属性。

## 后记
再怎么说，一个博客也已经搭建完毕了，剩下的功能都需要一点一点的去细化和慢慢的经营。最后的一步，把它部署上去。