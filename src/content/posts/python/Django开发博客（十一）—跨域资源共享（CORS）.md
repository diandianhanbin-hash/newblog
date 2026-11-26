---
title: "Django开发博客（十一）—跨域资源共享（CORS）"
publishedAt: "2016-06-06T22:25:34+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（十一）—跨域资源共享（CORS）.html"
---

## 背景
我旁边的开发在学`ReactNative`，说要拿我的博客练手，顺带给我写一个`Android`的博客客户端。这感情好啊，这个时候就必须要给他写两个接口，一个是获取文章列表，另一个是文章的详情。

## 接口
说实话，写两个接口应该是非常简单的，我也是这么想的，当然，分分钟也就写出来了。

```python
def get_article(request, article_id):
    """
    获取文章详情
    :param request:
    :param article_id:文章ID
    :return: Json
    """
    article_view = BlogBody.objects.get(id=article_id)
    rst_data = {
        "errmsg": "OK",
        "article_title": article_view.blog_title,
        "article_body": markdown.markdown(article_view.blog_body),
        "article_author": article_view.blog_author,
    }
    return JsonResponse(rst_data, safe=False)
```

```python
def get_article_list(request, list_type):
    """
    获取文章列表
    :param request:
    :param list_type:类型
    :return:
    """
    article_list = []
    if list_type == "all":
        article_list_all = BlogBody.objects.all()
        for x in article_list_all:
            article_list_title = x.blog_title
            article_list_id = x.id
            article_data = {
                "title": article_list_title,
                "id": article_list_id
            }
            article_list.append(article_data)
        rst_data = {
            "errmsg": "OK",
            "article_list": article_list
        }
        return JsonResponse(rst_data, safe=False)
    else:
        article_list_type = BlogBody.objects.filter(blog_type=list_type)
        for x in article_list_type:
            article_list_title = x.blog_title
            article_list_id = x.id
            article_data = {
                "title": article_list_title,
                "id": article_list_id
            }
            article_list.append(article_data)
        rst_data = {
            "errmsg": "OK",
            "article_list": article_list
        }
        return JsonResponse(rst_data, safe=False)
```
URL我就不当列了，并不难写。

## 测试
身为一个测试人员，自己写完的东西肯定是要测一下的。我在本地环境调试的时候测试通过，部署上SAE之后，我自己也测了一下，并没有问题。该返回的也都返回了。

## 问题
当我把接口文档丢给开发之后，开发的反馈是，无法获取数据。这就很奇怪了，我自己测试时很正常啊，就是一个普通的http请求而已。

根据开发的经验，这个是跨域调用的问题。我返回的数据必须要是CORS的数据，也就是返回头部要有Access-Control-Allow-Origin这个信息。否则只能同源调用。

什么是CORS?

>CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。

>整个CORS通信过程，都是浏览器自动完成，不需要用户参与。对于开发者来说，CORS通信与同源的AJAX通信没有差别，代码完全一样。浏览器一旦发现AJAX请求跨源，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，但用户不会有感觉。

>因此，实现CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。

## 解决办法
Google了一下，有两种解决办法，一种是使用JSONP来处理返回数据，看起来有点麻烦，另一种是在Http返回的时候加一个头部信息。

```python
response = HttpResponse()
response['Access-Control-Allow-Origin'] = '*'
return response
```

那么问题又来了，我使用的是`JsonResponse()`，并不是`HttpResponse()`。

好吧，其实两个是一样的，我们可以看`JsonResponse`的源码

```python
class JsonResponse(HttpResponse):
    """
    An HTTP response class that consumes data to be serialized to JSON.

    :param data: Data to be dumped into json. By default only ``dict`` objects
      are allowed to be passed due to a security flaw before EcmaScript 5. See
      the ``safe`` parameter for more information.
    :param encoder: Should be an json encoder class. Defaults to
      ``django.core.serializers.json.DjangoJSONEncoder``.
    :param safe: Controls if only ``dict`` objects may be serialized. Defaults
      to ``True``.
    """

    def __init__(self, data, encoder=DjangoJSONEncoder, safe=True, **kwargs):
        if safe and not isinstance(data, dict):
            raise TypeError('In order to allow non-dict objects to be '
                'serialized set the safe parameter to False')
        kwargs.setdefault('content_type', 'application/json')
        data = json.dumps(data, cls=encoder)
        super(JsonResponse, self).__init__(content=data, **kwargs)
```

其他的看不懂没关系，只要看懂JsonResponse是继承于HttpResponse就行了。父类的方法，子类肯定也是可以适用的，最后的返回结果我们只要简单的修改一下就行了。

```python
    response = JsonResponse(rst_data, safe=False)
    response['Access-Control-Allow-Origin'] = '*'
    return response
    
    response = JsonResponse(rst_data, safe=False)
    response['Access-Control-Allow-Origin'] = '*'
    return response
```

这样用`jQuery`就可以成功的跨域调用了。

**注意：没必要共享的借口就不要使用跨域资源共享，否则容易引起攻击**
