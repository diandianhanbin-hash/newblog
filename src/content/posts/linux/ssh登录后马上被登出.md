---
title: "ssh登录后马上被登出"
publishedAt: "2019-11-19T17:14:19+08:00"
categories: ["Linux"]
tags: ["Linux","ssh"]
path: "/linux/ssh登录后马上被登出.html"
---

## 背景

使用`ssh`登录是一个很常见的操作，本次我是制作一个镜像，然后使用`docker`的`host`模式来启动`docker`，因此需要修改`ssh`的端口，避免与母机端口产生冲突。

## 现象

在实际的操作过后，登录完毕后马上被退出。

```
sven @ SVENWENG-MB0 in ~/Desktop [16:34:44] C:254
$ ssh root@xxx -p port
root@xxx's password:
Last login: Tue Nov 19 16:35:13 2019 from xxx
test
Connection to xxx closed.
```

## 解决
执行`sed -i "s/UsePAM yes/UsePAM no/g" /etc/ssh/sshd_config`命令后重启`ssh`即可。

## 追因

`UsePAM`选项是启动`PAM`验证。

>PAM 提供四个安全领域的特性，但是应用程序不太可能同时需要所有这些方面。例如，passwd 命令只需要下面列表中的第三组：
account 处理账户限制。对于有效的用户，允许他做什么？
auth 处理用户识别 — 例如，通过输入用户名和密码。
password 只处理与密码相关的问题，比如设置新密码。
session 处理连接管理，包括日志记录。
在 /etc/pam.d 目录中为将使用 PAM 的每个应用程序创建一个配置文件，文件名与应用程序名相同。例如，login 命令的配置文件是 /etc/pam.d/login。

参考文章:[https://www.ibm.com/developerworks/cn/aix/library/au-sshlocks/index.html](https://www.ibm.com/developerworks/cn/aix/library/au-sshlocks/index.html)