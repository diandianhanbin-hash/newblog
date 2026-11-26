---
title: "Django博客开发（十三）—一个简单的站内搜索"
publishedAt: "2016-07-24T11:07:07+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django博客开发（十三）—一个简单的站内搜索.html"
---

![20160714](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379757543295958.jpg)

最近在努力的翻译Apple的测试文档，英文差果然是一个硬伤。

## 背景
博客内容越来越多了，慢慢的发现有时候需要一个搜索引擎来处理一些搜索的要求。当然，不需要那么复杂的逻辑，我们的博客只需要一个很小很小的搜索引擎，甚至不需要很高大上的算法。

PS：百度站内搜索也是一个解决方案，不过用它的搜索，整个网站风格就变了，所以还是决定自己写一个。

## 思路
思路其实很简单，把关键字拿去比对标题和内容就好了，比如输入一个关键字，先去把包含这个关键字的标题的文章抓出来，再把内容包含该关键字的文章，去重一下就OK了。

最初的思路是抓出来去重，后来我实践中试了一下，搜索有点慢，我就做了一下优化处理，在判断标题的时候也判断内容，如果标题不存在，内容存在，就放到搜索结果中，这样就不用去重处理了。

## 前端
前端首先要放一个搜索框出来，提供一个输入的地方。

还要有一个搜索结果的展示页。这个展示页效果大概是这样的。

![27659CDC-D026-433A-8D9F-78E468D65805](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/153797578235072.jpg)

导航页和右侧的边栏是直接从`base.html`中继承过来的，完全不用动，那么其实就是增加一个搜索数量，还有搜索结果。

前端的代码长这样：

```python
{% extends "blog/base.html" %}
{% block bodycontent %}
    {% if SearchStatus == 'Error' %}
        <div class="well fade in daytips">
            <button type="button" class="close" data-dismiss="alert">×</button>
            <strong>作者水平有限,并没有关于<font color="red"><b>"{{ keyword }}"</b></font>的内容,请换一个词试试</strong>
        </div>
    {% endif %}
    {% if SearchStatus == 'Success' %}
        <div class="well fade in daytips">
            <strong>关于<font color="red"><b>"{{ keyword }}"</b></font>的搜索结果一共有<font
                    color="red"><b>"{{ ResultAmount }}"</b></font>条</strong>
        </div>
        <div id="article-list">
            {% for x in SearchResult %}
                <article class="excerpt excerpt-first">
                    <header><a class="cat" href="#" id="wybtype"> {{ x.blog_type }} <i></i></a>
                        <h2><a class="gotoArchive" href="{% url 'article' x.id %}"
                               title="{{ x.blog_title }}">{{ x.blog_title }}</a></h2>
                    </header>
                    <p class="meta">
                    <span class="posttime">
                        {{ x.blog_timestamp }}
                    </span>
                        <span class="viewnum">浏览(<a href="#">{{ x.blog_clicknum }}</a>)</span>
                    <p class="note">{{ x.blog_body | slice:':300' }}</p>
                    <footer class="entry-footer">
                        <a class="more-link gotoArchive" rel="nofollow" href="{% url 'article' x.id %}">继续阅读 »</a>
                    </footer>
                </article>
            {% endfor %}
        </div>
    {% endif %}
{% endblock %}
```

展示的时候要考虑两种情况，如果没有结果，要给一个友好的提示，比如我代码中这样的。

有搜索结果，就要告诉访问者，搜索的关键字是什么，总共有多少结果。

那么问题来了，要从后端获取哪些数据？

## 后端处理
`url`就不说了，要交互肯定是需要一个`search`的url。

逻辑处理大概是这样的，先获取前端送过来的关键字，然后用这个关键字对数据库进行全部搜索，包括标题和内容。把符合条件的文章放到一个列表中。最后返回的时候，这个列表的长度就是记录数。

代码如下：

```python
def get_search(request):
    keyword = request.POST['searchWords']
    allArticle = BlogBody.objects.all()
    SearchResult = []
    for x in allArticle:
        if keyword in x.blog_title:
            SearchResult.append(x)
        elif keyword in x.blog_body:
            SearchResult.append(x)
    SearchStatus = "Error" if len(SearchResult) == 0 else "Success"
    ResultAmount = len(SearchResult)

    return render(request, 'blog/search.html', {"keyword": keyword,
                                                "SearchResult": SearchResult,
                                                "SearchStatus": SearchStatus,
                                                "ResultAmount": ResultAmount})
```

## 最后
做的东西是很简单，但是在博客数量大到一定程度的时候，性能会比较差，所以后续可能要对搜索的逻辑做一下优化。

