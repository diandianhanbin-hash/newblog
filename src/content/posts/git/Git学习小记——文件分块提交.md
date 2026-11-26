---
title: "Git学习小记——文件分块提交"
publishedAt: "2016-07-03T15:55:50+08:00"
categories: ["Git"]
tags: ["Git","代码管理"]
path: "/git/Git学习小记——文件分块提交.html"
---

## 前言
![de3a0cf6eb61abffb6e02d79d5c51bb4](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976617927228.jpg)


真的是非常难得的周末啊，好不容易可以静下心来慢慢的学习，慢慢的整理一些东西。

## 一
第一次见到Git的这个功能，我简直惊呆了。尤其是我这种非专业开发人员，常年线性撸代码，简直就是福音啊！

## 二
我们来做一个实验，首先先在本地生成一个`git仓库`，建立一个文件叫做`file`.里面的内容是五行A。如下所示：

```
SvenWeng@wengyanbin:~/Desktop/gittest|master
⇒  echo a > file
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  echo a >> file
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  echo a >> file
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  echo a >> file
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  echo a >> file
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  cat file
a
a
a
a
a
```

现在把我们的文件提交。

```
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  git add file
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  git commit -am'init'
[master (root-commit) a3e5e97] init
 1 file changed, 5 insertions(+)
 create mode 100644 file
```

## 三
提交文件之后，我们对文件做一些修改。修改内容如下：

```
diff --git a/file b/file
index 72e1fe3..a39bec5 100644
--- a/file
+++ b/file
@@ -1,5 +1,5 @@
+ab
 a
 a
 a
-a
-a
+abc
```

第一行，把a变成了ab,第五行，我把a变成了abc。那么就存在两个地方修改，现在要把这两个地方修改分次提交上去。

## 四
我们使用`git add -p`。得到如下结果：

```
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  git add -p
diff --git a/file b/file
index 72e1fe3..a39bec5 100644
--- a/file
+++ b/file
@@ -1,5 +1,5 @@
+ab
 a
 a
 a
-a
-a
+abc
Stage this hunk [y,n,q,a,d,/,s,e,?]?
```

最后一句`Stage this hunk [y,n,q,a,d,/,s,e,?]?`是让我们选择一种方式，我们选择`s`，表示我们要做`拆分（split）`。拆分之后，我们可以查看拆分的内容。输入`g`可以查看拆分的区块：

```
Stage this hunk [y,n,q,a,d,/,j,J,g,e,?]? g
  1:  -1,3 +1,4          +ab
  2:  -1,5 +2,4          -a
  go to which hunk?
```

最后一句`go to which hunk?`是问我们跳转到哪个区块。我们选择1。

进入1之后，我们选择`y`表示提交这一块。选择`y`之后，会吧第二个区块展示给我们看，这个时候我们输入`q`表示退出。然后我们提交，这时会出现一个很有意思的情况，我们看这个：

```
SvenWeng@wengyanbin:~/Desktop/gittest|master⚡
⇒  git status -s
MM file
```

`file`这个文件一部分在暂存区，一部分在修改区

## 五
我们做一次提交查看一次不同:

```
diff --git a/file b/file
index fc27ec6..a39bec5 100644
--- a/file
+++ b/file
@@ -2,5 +2,4 @@ ab
 a
 a
 a
-a
-a
+abc
```

现在就之后一处修改暂未提交了。我们再次提交。

使用`git log`查看一下提交的记录：

```
commit a0804d4aa4fa413c74c6f03e9fb938036b4d1a8d
Author: 翁彦彬 <diandianhanbin@gmail.com>
Date:   Sun Jul 3 15:39:17 2016 +0800

    hunk2 commit

commit 85e1635c6542b47d40ea74dacfce3ba68dfaa677
Author: 翁彦彬 <diandianhanbin@gmail.com>
Date:   Sun Jul 3 15:36:35 2016 +0800

    hunk1 commit

commit a3e5e97a6e7eaacc2acdcf5fc20c7947b168d587
Author: 翁彦彬 <diandianhanbin@gmail.com>
Date:   Sun Jul 3 15:24:06 2016 +0800

    init
```

可以很清楚的看到，我们提交了三次，第一次是init，第二次是hunk1 commit，第三次是hunk2 commit。

## 六
当然，我们也可以查看每次提交的不同的具体位置。

使用`git show head -2`表示查看近两次提交的不同点。

```
commit a0804d4aa4fa413c74c6f03e9fb938036b4d1a8d
Author: 翁彦彬 <diandianhanbin@gmail.com>
Date:   Sun Jul 3 15:39:17 2016 +0800

    hunk2 commit

diff --git a/file b/file
index fc27ec6..a39bec5 100644
--- a/file
+++ b/file
@@ -2,5 +2,4 @@ ab
 a
 a
 a
-a
-a
+abc

commit 85e1635c6542b47d40ea74dacfce3ba68dfaa677
Author: 翁彦彬 <diandianhanbin@gmail.com>
Date:   Sun Jul 3 15:36:35 2016 +0800

    hunk1 commit

diff --git a/file b/file
index 72e1fe3..fc27ec6 100644
--- a/file
+++ b/file
@@ -1,3 +1,4 @@
+ab
 a
 a
 a
```

可以很清晰的看到，hunk1修改的是第一行我把a变成ab的结果。hunk2是我把a变成abc的结果。
