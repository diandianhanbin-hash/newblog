---
title: "Django微信后台开发"
publishedAt: "2016-01-03T14:47:31+08:00"
categories: ["Python"]
tags: ["Python","Django"]
path: "/python/Django微信开发.html"
---

## 背景
博客开发完之后，想找一些其他的东西来练手，我知道Python开发微信公众号，那么Django肯定也是可以的，所以简单的写一个微信个人订阅号吧，每个人都应该有自己的一个主页，包括博客、微博、微信等门户，既然学了Django，就给自己也写一个吧。

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7

Django版本：1.9 

IDE：PyCharm

***

为什么我的`Python`用2.7，因为我使用的第三方包只支持2.7，所以就用低版本的`Python`来写了，不过差距不大，并不存在语法不通用的情况。

## 微信相关
微信公众平台需要自己去申请，和申请SAE差不多，我自己是申请了个人订阅号，功能比较少，本来也就是自己的门户嘛，不用整的太复杂了。
微信公众号有两种模式，一种是普通模式，就是自己设置一些信息的模式。另一种是开发者模式，也就是我们今天要动手做的这个模式

## 整个处理流程
详细的内容可以参考微信的官方文档，这里只做一个简单的描述，微信公众号的大致处理流程是这样的，用户对公众号发出一条信息，此时微信会收到这条信息，然后用xml格式封装成一个包，发送到我们的服务端，我们的服务端根据这个包的内容做一些处理，处理之后要给微信回复一个xml包，微信根据我们服务端回复的xml包，解析出相关要素后，再返回给用户，整个流程图如下：

[原图待补（微信处理流程图）](<http://img.blog.csdn.net/20160131132311047>)

其实看起来并不复杂。

## Django处理
首先你必须要有一个服务端咯，我用的是SAE的服务端，也就是把微信公众号集成到我的博客里了。专门给微信加一个url就行了。比如这样：`url(r'^weixin/', include('WechatApp.urls'))`。我使用的是第三方包，因此需要安装wechat_sdk和requests这两个包，具体方法可以参考[《Django开发博客（八）——部署在SAE》](http://blog.csdn.net/wyb199026/article/details/50612760)。

### token认证
微信和我们服务端的第一次通讯需要设置token，使用的是GET方法，因此我们需要为这个认证写一个方法（除了第一次认证使用GET，其他时候都是POST），代码如下：

```python

@csrf_exempt
def index(request):
    if request.method == 'GET':
        # 检验合法性
        # 从 request 中提取基本信息 (signature, timestamp, nonce, xml)
        signature = request.GET.get('signature')
        timestamp = request.GET.get('timestamp')
        nonce = request.GET.get('nonce')

        if not wechat_instance.check_signature(
                signature=signature, timestamp=timestamp, nonce=nonce):
            return HttpResponseBadRequest('Verify Failed')

        return HttpResponse(
            request.GET.get('echostr', ''), content_type="text/plain")
```

注意，最上方的@csrf_exempt装饰器是取消Django的csrf标记的，毕竟微信不会有这种标记。这次认证通过之后，这个方法你注销了都行，除非你再次认证，不然不会再使用这个方法了。

### 添加关注回复
`wechat_sdk`的使用方法可以参考[wechat_sdk的官方文档](http://wechat-python-sdk.readthedocs.org/zh_CN/master/tutorial.html)，在之后的view代码中加入

```python
    # 解析本次请求的 XML 数据
    try:
        wechat_instance.parse_data(data=request.body)
    except ParseError:
        return HttpResponseBadRequest('Invalid XML Data')

    # 获取解析好的微信请求信息
    message = wechat_instance.get_message()

    # 关注事件的默认回复
    response = wechat_instance.response_text(
        content=(
            '感谢您的关注！\n回复【help】查看支持的功能'
            '\n【<a href="http://www.ddhbblog.sinaapp.com">我的博客</a>】'
            ))
```

用来处理关注的内容。

### 被动消息回复
最后加上被动回复的内容，代码如下：

```python
if isinstance(message, TextMessage):
        # 当前会话内容
        content = message.content.strip()
        if content == 'help':
            reply_text = (
                    '目前支持的功能：\n1. 输入【博客】来查看我的博客\n'
                    '2. 回复【随机】来随机展示文章\n'
                    '还有更多功能正在开发中哦 ^_^\n'
                    '【<a href="http://www.ddhbblog.sinaapp.com">我的博客</a>】'
                )
        elif content == '博客':
            reply_text = '我的博客地址是http://www.ddhbblog.sinaapp.com'
        elif content == '随机':
            reply_text = '随机功能还在开发中噢,亲可以先查看【<a href="http://www.ddhbblog.sinaapp.com">我的博客</a>】'
        else:
            reply_text = '功能还在开发中哦,亲可以提出您宝贵的意见'

        response = wechat_instance.response_text(content=reply_text)

    return HttpResponse(response, content_type="application/xml")
```

我们的简单的微信公众号就完成了。

## 效果图

效果如下图：

[原图待补（效果图）](<http://img.blog.csdn.net/20160131134123230>)


## 完整的代码
```python
# ecoding:utf-8
from __future__ import unicode_literals
from django.http.response import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from wechat_sdk.basic import WechatBasic
from wechat_sdk.exceptions import ParseError
from wechat_sdk.messages import TextMessage

WECHAT_TOKEN = 你的token
# APP_ID = 你的app id
# APP_SECRET = 你的app secret


# 实例化 WechatBasic
wechat_instance = WechatBasic(token=WECHAT_TOKEN)


@csrf_exempt
def index(request):
    if request.method == 'GET':
        # 检验合法性
        # 从 request 中提取基本信息 (signature, timestamp, nonce, xml)
        signature = request.GET.get('signature')
        timestamp = request.GET.get('timestamp')
        nonce = request.GET.get('nonce')

        if not wechat_instance.check_signature(
                signature=signature, timestamp=timestamp, nonce=nonce):
            return HttpResponseBadRequest('Verify Failed')

        return HttpResponse(
            request.GET.get('echostr', ''), content_type="text/plain")

    # 解析本次请求的 XML 数据
    try:
        wechat_instance.parse_data(data=request.body)
    except ParseError:
        return HttpResponseBadRequest('Invalid XML Data')

    # 获取解析好的微信请求信息
    message = wechat_instance.get_message()

    # 关注事件的默认回复
    response = wechat_instance.response_text(
        content=(
            '感谢您的关注！\n回复【help】查看支持的功能'
            '\n【<a href="http://www.ddhbblog.sinaapp.com">我的博客</a>】'
            ))

    if isinstance(message, TextMessage):
        # 当前会话内容
        content = message.content.strip()
        if content == 'help':
            reply_text = (
                    '目前支持的功能：\n1. 输入【博客】来查看我的博客\n'
                    '2. 回复【随机】来随机展示文章\n'
                    '还有更多功能正在开发中哦 ^_^\n'
                    '【<a href="http://www.ddhbblog.sinaapp.com">我的博客</a>】'
                )
        elif content == '博客':
            reply_text = '我的博客地址是http://www.ddhbblog.sinaapp.com'
        elif content == '随机':
            reply_text = '随机功能还在开发中噢,亲可以先查看【<a href="http://www.ddhbblog.sinaapp.com">我的博客</a>】'
        else:
            reply_text = '功能还在开发中哦,亲可以提出您宝贵的意见'

        response = wechat_instance.response_text(content=reply_text)

    return HttpResponse(response, content_type="application/xml")
```
## 我的微信公众号
你可以在微信中搜索：点点微资讯
或是扫描下方的二维码来添加关注

[原图待补（点点微资讯）](<http://img.blog.csdn.net/20160131134601669>)