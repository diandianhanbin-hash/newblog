---
title: "Django开发博客（八）——部署在SAE"
publishedAt: "2016-01-30T14:36:25+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django开发博客（八）——部署在SAE.html"
---

## 背景
PS：中途电脑出了一点问题，所有的数据都被抹去了，所以好多东西都没了，需要重新整理。
虽然我们的博客还是有很多问题，比如图片还无法上传啊，富文本编辑器非常非常low，不过主要的功能还是有了，我自己也比较习惯用markdown来写文章，所以，是时候发布了。

***
版本相关 

操作系统：Mac OS X EI Caption 

Python版本：3.4 

Django版本：1.9 

IDE：PyCharm

***

## SAE相关
SAE就是新浪云应用，相比于阿里云腾讯云等云服务，SAE价格相对亲民，可以按照流量来付费，大多数朋友的主页访问量并不高，按流量付费比较能接受.SAE需要自己去注册，然后认证开发者。这里就不赘述了，需要自己去准备。

## Python web应用
SAE相关的东西准备好之后，需要建立自己的应用，我们选择Python web应用。SAE支持的Python版本是2.7的，不过还好，我们的博客虽然用的是3.4版本的Python来写，但是里面运用的东西比较粗浅，所以不存在版本升级后的语法不兼容的问题。还是可以用的。Django最近貌似SAE开窍了，原来只支持1.4，现在能够支持1.8.3。当然，我们对Django的运用也是非常粗浅的，不论是1.8还是1.9都是通用的。

## 代码管理
我使用的是git来管理我的代码，其实在写的过程中我就是使用git来做版本控制，原来的SAE只支持SVN，现在好了，能够支持git了，不过与SVN不一样的是，使用git管理代码，就没办法在线编辑代码了，不知道以后SAE能不能支持。[《SAE代码部署手册》](http://www.sinacloud.com/doc/sae/tutorial/code-deploy.html#git)告诉我们应该怎么把代码部署上去。使用SVN或者GIT全屏自己的喜好。

## 注意事项
SAE上是使用Nginx来发布的，我们需要做一些相关配置，比起我们本地代码，我们还需要加上index.wsgi和config.yaml两个文件，并且做一些配置。
配置信息如下：

```python
config.yaml

libraries:
- name: "django"
  version: "1.8.3"
```

`config.yaml`用来告诉SAE我们用的web框架是Django，版本是1.8.3

```python
index.wsgi

import sae
from MyBlog import wsgi

application = sae.create_wsgi_app(wsgi.application)
```

`index.wsgi`的配置我看的不太懂，相关Nginx的内容我也没有去了解，不过经过我自己去找的资料来看，这些配置能够生效。

## 关于第三方包
我们的博客使用了第三方的markdown依赖包，因此需要再修改一些东西。对于第三方包，官方也给出了帮助文档[《添加第三方依赖包》](http://www.sinacloud.com/doc/sae/python/tools.html#tian-jia-di-san-fang-yi-lai-bao)

> 除了使用SAE上已经预装的模块之外，开发者还可以通过以下方式给自己的应用添加第三方依赖包。
> 
> 首先，创建一个第三方依赖包目录 vendor 。
> 
> $ mkdir vendor
> 调用 pip 命令安装依赖包，使用其 -t 选项指定第三方包的安装目录。
> 
> $ pip install -t vendor PACKAGE ...
> 最后，在 index.wsgi 文件的最开始，添加以下代码，将 vendor 目录加入到sys.path中，这样刚才安装的模块就可以在应用中使用了。
> 
> import sae
> sae.add_vendor_dir('vendor')
> # 注意：以上代码得放在index.wsgi的最前面，所有其它代码之前。
> sae.add_vendor_dir(dir)¶
> 将site目录或者virtualenv目录加入到sys.path中
> 
> 参数:	dir – site目录或者virtualenv目录的相对路径（相对于应用的根目录）



## 关于数据库
SAE上并不支持sqlite，我们在本地开发的时候使用的是sqlite做的数据存储，因此我们需要自己做一些修改，然后才能够生效，最简单的方法是你在本地把sqlite数据库删了，然后执行python manage.py migrate，会执行很多sql，把这些sql语句贴上去直接生成数据库就行了。
settings的配置数据库相关代码如下：

```python
import sae.const
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'app_ddhbblog',
        'USER': sae.const.MYSQL_USER,
        'PASSWORD': sae.const.MYSQL_PASS,
        'HOST': sae.const.MYSQL_HOST,
        'PORT': sae.const.MYSQL_PORT,
    }
}
```

我使用的是共享行数据库，独享的数据库我没有用过，需要使用的请自己参考SAE的帮助文档。