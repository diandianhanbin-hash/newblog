---
title: "GitClone拉取的工程为啥这么大？"
publishedAt: "2021-11-29T19:55:50+08:00"
categories: ["Git"]
tags: ["Git","代码管理"]
path: "/git/GitClone拉取的工程为啥这么大？.html"
---

## 背景

在日常工作中，我们都会进行代码的拉取，偶尔有一次我发现，执行`git clone`命令拉下来的代码，发现拉取了特别久，这个工程100%都是我写的，因此可以确认，不可能超过`100M`的大小。

但是当我执行`git clone`拉取代码之后，发现一共拉了将近`600M`的包

```bash
Receiving objects: 100% (312/312), 593.94 MiB | 14.77 MiB/s, done.
Resolving deltas: 100% (204/204), done.
```

```bash
$ du --max-depth=1 -h
595M    ./.git
4.0K    ./conf
60K     ./service
8.0K    ./utils
671M    .
```

可以看到，几乎所有的空间占用，都在`git`的隐藏文件里面了，实际代码的大小其实并不大。

我又尝试直接在页面下载`zip`文件下来，出乎意料的是，这个`zip`只有`37M`。

这就是这次的问题了，为什么`clone`下来的代码这么大呢？

## 猜测

首先，`git clone`和直接下载`zip`的直观区别在于，`zip`下载的只是文件。

而`git clone`下来的代码，跟仓库是有关联的，并且可以任意切换到以前的版本，某个分支。

而资源能够任意变化，要么本地存储有对应的文件，要么就是从远端下载对应版本的文件，我这里试过一些有大文件仓库的切换，发现基本上切换分支的时间都是命令敲完后。马上就能切换到对应的分支，而没有任何网络交互的情况，因此这里一个可靠的猜测，就是`git clone`的时候，把历史记录全部拉下来了。

## 寻根究底—从init开始说起

初始化一个项目的时候，会生成一个`.git`的文件。

```bash
$ ls -lrtha
total 0
drwxrwxr-x 4 svenweng svenweng  34 Nov 29 17:02 ..
drwxrwxr-x 3 svenweng svenweng  18 Nov 29 17:02 .
drwxrwxr-x 7 svenweng svenweng 119 Nov 29 17:02 .git
```

```bash
$ ls -lrth 
total 16K
-rw-rw-r-- 1 svenweng svenweng   73 Nov 29 17:02 description
drwxrwxr-x 2 svenweng svenweng    6 Nov 29 17:02 branches
drwxrwxr-x 4 svenweng svenweng   31 Nov 29 17:02 refs
drwxrwxr-x 4 svenweng svenweng   30 Nov 29 17:02 objects
drwxrwxr-x 2 svenweng svenweng   21 Nov 29 17:02 info
drwxrwxr-x 2 svenweng svenweng 4.0K Nov 29 17:02 hooks
-rw-rw-r-- 1 svenweng svenweng   92 Nov 29 17:02 config
-rw-rw-r-- 1 svenweng svenweng   23 Nov 29 17:02 HEAD
```

这里的每个文件的用处，这其中。

```bash
description 仅供GitWeb使用，不需要关心
config 包含项目特有的配置选项
info 包含全局性排除文件，
hooks 包含客户端或者服务端的钩子脚本

HEAD文件指向目前的分支
index保存暂存区的信息
refs目录指向数据提交对象的指针
objects目录存储所有的数据内容
```

了解了这个结构之后，回头再来看我的工程。

```bash
# .git
$ du --max-depth=1 -h
0       ./branches
52K     ./hooks
4.0K    ./info
8.0K    ./refs
594M    ./objects
12K     ./logs
595M    .

# objects
$ du --max-depth=1 -h
594M    ./pack
0       ./info
594M    .
```

几乎额外占用的空间，都在`objects`下的`pack`里面。

因此，我们需要了解`git`的整个存储过程，才能了解这个`pack`是干啥的。

## git是如何工作的

`git`工作原理是一个很复杂的过程，想要了解明细的可以参考官方文档，本文只做一个简单介绍。

我们修改一个文件，会经历这么些操作：

```bash
git add test.txt
git commit -m'first commit'
```

我们都知道，执行`add`命令的时候，会把这个文件存储到一个临时存储区，执行`commit`的时候，就会正式的提交文件到本地仓库。

在`git`的内部，实际上是一个文件存储系统。也就是我们每个文件，实际上`git`都会帮我们存储一份。

```bash
# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master o [17:36:06] 
$ echo 'version 1' > test.txt                     

# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master x [17:36:13] 
$ git hash-object -w test.txt                             
83baae61804e65cc73a7201a7252750c76066a30

$ find .git/objects/ -type f
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
```

上面的命令是`git`底层的一些命令，我们通过这些底层命令，可以很清晰的看到`git`的工作过程。首先我们创建了一个`txt`文件，然后把这个`txt`文件通过`hash-object`命令写到`git`的文件系统中，这个时候返回了一个`hash`值，实际上这个内容就是`git`的一个存储方式，前两位是`objects`文件夹下的一个子文件夹，后面的`38`位则是真实的文件名。

由于每个文件都是独立计算`hash`的，因此只要文件发生了变动，`hash`值就会发生变更，因此每次文件发生变动的时候，添加到文件系统的文件都是不一样的，并且是**全量**添加的。因此我们这里如果文件变动了2次，那么就会有2个文件出来。我们也可以任意的查看这些文件的内容。如下命令所示。

```bash
# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master o [17:36:06] 
$ echo 'version 1' > test.txt                     

# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master x [17:36:13] 
$ git hash-object -w test.txt                             
83baae61804e65cc73a7201a7252750c76066a30

# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master x [17:36:20] 
$ echo 'version 2' > test.txt 

# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master x [17:36:30] 
$ git hash-object -w test.txt 
1f7a7a472abf3dd9643fd615f6da379c4acb3e3a

# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master x [17:36:33] 
$ find .git/objects/ -type f
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
.git/objects/1f/7a7a472abf3dd9643fd615f6da379c4acb3e3a

# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master o [17:37:02] 
$ git cat-file -p 83baae61804e65cc73a7201a7252750c76066a30
version 1
```

这样存储，势必会浪费很多空间，对于一个文件我们很可能有多次变更，如果每次都全量存储，那么空间占用无疑是巨大的，如果能保存差异内容，就可以解决相当可观的空间。

因此，`git`存在一个打包机制，也就是`git gc`命令。

```bash
# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master x [17:56:47] 
$ git gc                                                                                
Counting objects: 5, done.
Writing objects: 100% (5/5), done.
Total 5 (delta 0), reused 0 (delta 0)

# svenweng @ svenweng1616588482304-0 in /tmp/svenweng/test on git:master x [18:21:33] 
$ find .git/objects/ -type f        
.git/objects/pack/pack-fbcec3bf1d028b3fc6ead24ae690e51b3c0f7dd3.pack
.git/objects/pack/pack-fbcec3bf1d028b3fc6ead24ae690e51b3c0f7dd3.idx
.git/objects/info/packs
```

这里可以看到，我们大部分的对象，其实都不见了。同时出现了一对新闻界，也就是`objects/pack`目录下的`*.pack`和`*.idx`文件。通过`gc`命令把我们提交的内容全部放到`pack`文件和`idx`文件中，并且进行压缩，更进一步的减少空间占用。

`git`在`push`之前，会执行`git gc`进行压缩，确保提交的内容都是被压缩过的。

以上就是一个简单的工作机制。

## pack包含了哪些内容？

我们可以通过`git verify-pack`命令来查看具体打包了哪些内容。

## 回到最初的问题

到了这里，基本上就已经能够理解了，我这个仓库的所有变动信息，在提交前，都会被git打包起来再推送到远端的仓库中，因此，我们执行`git clone`命令的时候，包含裸库`.git` + `checkout`的文件 + 下载的`LFS`文件，且裸库`.git`里面又包含全部历史，而下载`zip`包仅仅包含当前分支最新的`commit`文件，因此这两种方式会有较大的差异。

如果我们想要`clone`一部分代码，可以指定拉取深度，即 `git clone —depth=1` 这样可以降低`clone`工程的大小。

例如我的工程

```bash
$ git clone --depth=1 git@xxxxxxx/xxx.git
Cloning into 'xxx'...
remote: Counting objects: 29, done
remote: Finding sources: 100% (29/29)
remote: Total 29 (delta 0), reused 7 (delta 0)
remote: Total 4.95s (counting objects 0.00s finding sources 0.00s getting size 0.00s writing 4.94s), transfer rate 7.17 M/s (total size 35.45M)
Receiving objects: 100% (29/29), 35.45 MiB | 7.22 MiB/s, done.
```

可以看到，这里拉下来的只有`37M`，比原来小了非常多

如果还想了解为啥仓库文件这么大，可以使用命令：

```bash
git rev-list --objects --all \
| git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
| sed -n 's/^blob //p' \
| sort --numeric-sort --key=2 \
| cut -c 1-12,41- \
| $(command -v gnumfmt || echo numfmt) --field=2 --to=iec-i --suffix=B --padding=7 --round=nearest
```

## 参考文档

[Git - 底层命令与上层命令 (git-scm.com)](https://git-scm.com/book/zh/v2/Git-%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86-%E5%BA%95%E5%B1%82%E5%91%BD%E4%BB%A4%E4%B8%8E%E4%B8%8A%E5%B1%82%E5%91%BD%E4%BB%A4)

[https://stackoverflow.com/a/42544963](https://stackoverflow.com/a/42544963)