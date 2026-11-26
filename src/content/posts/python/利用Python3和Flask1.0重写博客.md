---
title: "利用Python3和Flask1.0重写博客"
publishedAt: "2018-10-16T23:17:01+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/利用Python3和Flask1.0重写博客.html"
---

## 背景
最近准备重构博客，看了一下`Flask`更新到了1.0了，于是抽时间看了一下更新的内容。具体的变动信息请参考[官方文档](http://flask.pocoo.org/docs/1.0/changelog/)。刚好在腾讯云上买了台服务器，于是想着用`Python3.6`来重写博客。

## Flask1.0支持版本
`Flask`1.0之后，不再支持`Python2.6`和`Python3.3`。

## Flask1.0的启动方式
此项改动应该是本次最大的变动了。

* 普通模式

传统的方式是在入口文件中写入`app.run()`，如果需要调试模式，则使用`app.run(DEBUG=True)`，最后使用`python app.py`运行主文件。

更新为1.0之后，启动方式改了。

入口文件中无需写`app.run()`.而是在环境变量中加入`FLASK_APP=hello.py`，然后用命令`python -m flask run`即可启动服务。

```python
  python -m flask run
 * Serving Flask app "hello.py" (lazy loading)
 * Environment: development
 * Debug mode: on
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 281-319-154
```
如果需要调试模式，则在环境变量中添加`FLASK_ENV=development`。

如果需要整个局域网都可见此服务，则在启动参数中增加`--host=0.0.0.0`

* 工厂函数

此方法也是官方比较推荐的方式，在主目录下建一个`__init__.py`文件，里面代码如下：

```python
from flask import Flask

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    return app
```

然后在主文件中写入：

```python
from . import create_app

app = create_app()
```
启动方式同普通模式一样即可。

* 在生产环境启动

最终写完的内容还是要部署到生产的，在生产一般来说用`uwsgi`或者`gunicorn`比较多，本次我用的是`gunicorn`来部署。`gunicorn`是支持协程的方式部署的，性能较之前有比较大的提升，具体的执行脚本如下：

```bash
export FLASK_APP=app.py
gunicorn -w 4 -b 127.0.0.1:8000 -k gevent main.app:app
```

附上重启的方式：

执行`pstree -ap|grep gunicorn`就可以看到`gunicorn`执行的主进程号，执行`kill HUB 主进程号`即可重启，再次查看的时候会发现子进程号已经更新了。

## Python3.6的坑

* 缺失SSL

使用最新的方式难免会要踩坑，最新的`Python3`在编译的过程中，是没有带上`SSL`的，但是在使用`pip3`的时候，需要`ssl`的支持，这是一个巨大的坑。解决方案是在`make`之前执行的`./configure`中加上这些参数`./configure –prefix=/usr/local/python3 --with-ssl`。
其中`–prefix=/usr/local/python3`表示`make`后安装的路径，而`--with-ssl`则是编译的过程中需要加上`ssl`，否则在使用`pip`时会报：

```
pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.
```

* 缺失zlib

在编译python3的时候，报了这个错，`zipimport.ZipImportError: can’t decompress data; zlib not available `，意思就是缺少了`zlib`这个库，在编译之前需要执行`yum -y install zlib*`

## 博客的重构
本次的博客重构如题所说用了`Python3.6`和`Flask1.0`，算是用比较新的方式来开发，前端用的是`Vue.js`+`Bootstrap`来处理样式，整体的样式都是非常简单的。而前后端交互用了`flask_restful`库。使用了`RESTful`风格的接口，让整个接口的接口看起来更清晰。功能暂时只做了一个展示，算是从新浪云的服务器彻底的迁移了吧，后续还要慢慢完善统计的功能。

全新编写的同时，去掉了以往的统计数据，这些东西只能全部重新来收集了。

整个过程看起来好像没什么内容，实际上整整花了近两天的时间，遇到的很多小细节的问题没办法每个都列出来，但是整个部署的过程也是一个学习的过程，毕竟在一个全新的环境上部署，还是有很多坑要踩的。

## 后续的计划
博客的CMS，统计，用户权限，留言等内容都还没有做完，剩下的路还有很多。

## 最后
欢迎参观[http://www.wengyb.com](http://www.wengyb.com)

