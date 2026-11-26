---
title: "Docker+Python初探"
publishedAt: "2016-11-11T15:23:17+08:00"
categories: ["Docker"]
tags: ["Docker"]
path: "/docker/Docker+Python初探.html"
---

![20161109](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537776691.705579.jpg)


## 背景
Docker是时下很流行的东西，具体的介绍就不多说了，简单说说我今天用Docker构建Python的过程

## 环境

***

操作系统： macOS Sierra 

Python： 2.7

Docker: 1.12.3

Client:
 Version:      1.12.3
 API version:  1.24
 Go version:   go1.6.3
 Git commit:   6b644ec
 Built:        Wed Oct 26 23:26:11 2016
 OS/Arch:      darwin/amd64

Server:
 Version:      1.12.3
 API version:  1.24
 Go version:   go1.6.3
 Git commit:   6b644ec
 Built:        Wed Oct 26 23:26:11 2016
 OS/Arch:      linux/amd64

***

## 编写Dockerfile
首先我们需要编写一个Dockerfile，用来构建Docker环境以及Python的依赖。

```bash

cd ~/Desktop

mkdir dockerpython

cd dockerpython

touch Dockerfile

```

**注意：这里的Dockerfile没有扩展名。**

然后用Vim或者Sublime打开这个文件，输入以下内容

```
FROM ubuntu

MAINTAINER Sven Weng <sven@wengyb.com>

# APT 自动安装 Python 相关的依赖包，如需其他依赖包在此添加
RUN apt-get update && \  
      apt-get install -y python \
                       python-dev \
                       python-pip  \
    # 用完包管理器后安排打扫卫生可以显著的减少镜像大小
    && apt-get clean \
    && apt-get autoclean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* 

# 配置默认放置 App 的目录
RUN mkdir -p /app  
WORKDIR /app  
EXPOSE 80  
CMD ["bash"] 
```

然后执行`docker build -t .`

看着命令行一直跳吧，跳到结束基于Docker的Python环境就搭建好了

## Dockerfile几个命令的解释

我们的Python环境实质上是建立一个带有Python的Ubuntu系统。

`FROM`表示一个依赖的镜像，这里我们的python环境需要ubuntu。

`MAINTAINER`表示一个署名，可以随意写。

`RUN`表示拉取Ubuntu系统后，要执行哪些命令，这里我们要执行`apt-get`的更新，安装Python的依赖

`WORKDIR`表示工作目录

`EXPOSE`表示对外暴露的端口

`CMD`构建完成后执行的命令


## 运行容器
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537776721.1749382.jpg)

以上就是我们创建好的镜像,看到了两个none,于是我们再执行`docker tag 8a7 withpython/ubuntu`命令来重新打标签。

```
SvenWeng@wengyanbin:~/Desktop|⇒  docker tag 8a7 withpython/ubuntu
SvenWeng@wengyanbin:~/Desktop|⇒  docker images
REPOSITORY                 TAG                 IMAGE ID            CREATED             SIZE
withpython/ubuntu          latest              8a73e75b23ba        29 minutes ago      127.2 MB
ubuntu                     latest              f753707788c5        4 weeks ago         127.2 MB
daocloud.io/sakeven/2048   latest              ccb67859d5ac        12 weeks ago        7.476 MB
```

`docker tag`命令的使用方式如下：

```
SvenWeng@wengyanbin:~/Desktop|⇒  docker tag --help

Usage:	docker tag IMAGE[:TAG] IMAGE[:TAG]

Tag an image into a repository

Options:
      --help   Print usage
```

现在我们来启动容器.

`docker run -i -t 8a7 `

我们就进入了这个Ubuntu的bash，执行`python`就可以看到进入python的交互模式了。

## 一个问题
在我重新执行的时候发现了一个问题，最初我是使用Daocloud的镜像`FROM daocloud.io/ubuntu:trusty`来处理的，可以直接安装成功，但是我第二次编写的时候用了官方的镜像，它给我报错了。

```
The command '/bin/sh -c apt-get update &&       apt-get install -y python                        python-dev                        python-pip      && pip install requests     && apt-get install wget     && apt-get clean     && apt-get autoclean     && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*' returned a non-zero code: 1
```

也许是Daocloud为了写这个教程，对官方的Ubuntu做了一些修改，所以能一次性成功，如果你也遇到了这个问题，可以使用Daocloud的这个镜像。当然，你也可以手工执行这些命令，这就是在Ubuntu上搭建Python的步骤，没有什么难度。

