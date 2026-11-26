---
title: "Django使用第三方接口"
publishedAt: "2016-03-12T13:06:56+08:00"
categories: ["Python"]
tags: ["Python","Django","接口"]
path: "/python/Django使用第三方接口.html"
---

好久没发文章了，最近我在学习使用第三方接口来优化我的网站，这篇文章介绍两个接口吧，都是从百度API商店折腾了之后使用的，一个是天气资讯，另一个是名人名言。

## 思路
其实调接口很简单，原理和使用数据库的数据差不多，我们使用本地数据库的时候是通过： 连接数据库——获取数据——返回前端——前端处理这么一个流程，调用接口其实也差不多是这样，发送请求——收到数据——数据处理——返回前端——前端处理。理清思路后我们就来处理处理这块的使用方法。

## 名人名言
关于名人名言，我是放在我博客的首页展示。

整个调用流程和上文说的思路差不多，首先，进入百度API商店，传送门在这：http://apistore.baidu.com/apiworks/servicedetail/1756.html

查看API后，只要请求的时候带上相关参数就行了，API文档比较简单，百度API商店也给了Python的示例，不过百度的示例使用的是urllib这个python自带的库，我用的是requests这个库，对比起来requests这个库使用起来更简单，我的前端使用的是jQuery调用ajax来从Django后台异步获取数据，所以打开网页的时候你会发现这一块一开始是没有的，过了一秒后才会出现数据。废话不多说，上代码。

### views.py

```python

def famous(request):   
  famous_word = Mingrenmingyan()    
  return JsonResponse(famous_word.get_mrmy(), safe=False)

```

视图函数很简单，初始化这个类，然后返回一个json数据给前端。整个处理方法我单独写了一个common类来处理，所以还需要在views的开头引入这个方法。

```python

from common.common import Weather, Mingrenmingyan

```

### common.py
这个方法我是专门来处理一些数据的，所以会写好几个类。代码如下：

```python

class Mingrenmingyan:
    """
    处理名人名言接口返回的数据
    """
    def __init__(self):
        """
        初始化相关数据,包括接口的url,headers和parm
        :return: None
        """
        self.url = 'http://apis.baidu.com/avatardata/mingrenmingyan/lookup'
        self.headers = {"apikey": "your key"}
        self.parm = {
            "dtype": "JSON",
            "keyword": "人生",
            "page": "1",
            "rows": "20"
        }

    def get_mrmy(self):
        """
        从接口获取名人名言数据,随机选取一条返回,返回json数据.
        :return:json, 名人名言数据
        """
        wb_data = requests.get(self.url, headers=self.headers, params=self.parm)
        data = wb_data.json()
        if data['error_code'] == 0:
            result = data['result']
            random_num = random.randint(0, 19)
            return json.dumps(result[random_num])
        else:
            return json.dumps(data)

```

这个类是处理名人名言数据的，因为接口返回的是20条数据，因此我会随机选取一条返回给前端。

### 前端
在前端我是用js的ajax方法异步获取数据，所以这里我只贴js部分的代码，代码如下：

```python

function famous(){
    $.getJSON('/blog/get_famous/', function(data){
        var famous_data = jQuery.parseJSON(data);
        console.log(famous_data);
        $('#mrmy-body').html(
            '<p>' + famous_data.famous_saying + '</p>'
        );
        $('#mrmy-footer').html(
            '<p>By--' + famous_data.famous_name + '</p>'
        )
    })
}

```

### url.py
在url部分就为前后端通讯加一条路由就行了。

```python

url(r'^get_famous', views.famous, name='famous'),

```

这样一个名人名言的接口调用就完成了。

## 天气资讯
天气资讯接口的调用方式也非常简单，和这部分是一样的。我就不详细的贴了，就是一个页面一个搜索框一个展示，方法和上文说的是一样的，相信聪明的你自己就可以写出来。