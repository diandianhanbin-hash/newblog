---
title: "Django开发博客（十四）—用户登录和站点统计"
publishedAt: "2016-08-02T13:21:39+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（十四）—用户登录和站点统计.html"
---

![20160725](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779541754739.jpg)


## 背景
由于博客一直没有自己的CMS，所以导致博客维护起来有点麻烦，每次我都是去数据库添加文章，太麻烦了，但是之前没有做用户登录系统，就导致了内容的维护很麻烦。

So，是时候加一个用户系统了

## 思路
同样，思路是非常简单的，网站进行会话校验一般是使用Cookie或者Session。不过Cookie有那么些不安全，加了密的Session比较符合我们的要求。

实现起来就是加一个登陆页，验证通过就写一个Session，在CMS相关的页面加上一个校验Session的内容就可以了。

## 前端
前端就是需要找一个你喜欢的页面，网上找一些CMS的模板抄下来就行了。比如我的是这样的：

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779559668085.jpg)

很简单的一个登陆界面。

然后你还要准备一个着陆页，登陆成功后往哪里跳转，我是直接跳转CMS的入口页面。

前端的准备就这些了。

## 后端
主要是Django的后端处理逻辑。分为两点，一个是写Session，另一个是读取Session。

### 写Session
这个动作要放在登录的时候，当登录成功之后，为用户写上session，然后在这个session有效期内，用户就可以对需要权限的页面进行操作了。比如管理CMS什么的。

```python
def login(request):
    if request.method == 'POST':
        if request.POST['username'] != 'xxxx':
            return render(request, 'blog/login.html', {"Errmsg": "用户名错误"})
        elif request.POST['password'] != "xxxx":
            return render(request, 'blog/login.html', {"Errmsg": "密码错误"})
        request.session['user'] = request.POST['username']
        return HttpResponseRedirect('/add_article/')
    return render(request, 'blog/login.html', {"Errmsg": "OK"})
```

这里的验证逻辑是可拓展的，我这里的演示代码是直接写死，正常写这部分应该去数据库校验。最后的session就是登陆的用户名，这个用户名会存储在Django默认的一个django_session的表里面。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537779579689753.jpg)

就像这样存储。

### session有效期
session都有一个有效期，我们可以在项目的`settings.py`文件中设置有效期。

```
SESSION_SAVE_EVERY_REQUEST = True
```

表示开启session有效期设置的功能。

```
SESSION_COOKIE_AGE = 60*60
```

表示session有效期为60S*60，也就是1小时。

```
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
```

表示关闭浏览器后session就失效。

### 读取session
读取session就很简单了，在需要session认证的页面上加上这么一段代码：

```python
user = request.session.get('user', '')
    if user != "xxxx":
        return HttpResponseRedirect('/authorlogin/')
```

同理，这里最需要去数据库校验。

## 站点统计
站点统计有两个方案，一个是第三方，另一个是自己写。

第三方比较成熟的百度、腾讯等统计都非常方便，不过后续我要自己写一个cms，这些第三方统计的数据我们都拿不过来，所以自己能写一个最好。

同样，我提供的也是一个思路。就是在页面载入的时候发送一次请求，数据库记录这次请求，就能记录网页被打开多少次了，深入的统计，当然还需要一个数据库来支持。
