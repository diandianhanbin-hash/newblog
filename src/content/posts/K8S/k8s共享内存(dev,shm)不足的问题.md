---
title: "k8s共享内存(/dev/shm)不足的问题"
publishedAt: "2022-03-14T22:30:19+08:00"
categories: ["kubernetes"]
tags: ["kubernetes"]
path: "/K8S/k8s共享内存(dev,shm)不足的问题.html"
---

# 共享内存不足问题

## 背景

这是一次使用的时候发现的很蛋疼的问题。起因是我们在`k8s`部署一个开发的服务的时候，发现这个服务不停的`core`。

## 找出问题

组内大佬找到了`core`文件，用`gdb`发现了是写共享内存的时候写不进去导致服务`core`了。跟代码的时候发现这个是宏定义的。

## 继续跟进问题

根据上面的情况，检查空间后发现`k8s`分配的容器，`/dev/shm` 是固定的64M。

根据网上找的资料发现，可以发现，挂载一个`emptyDir`  即可解决这个问题。手工修改尝试后确实解决了这个问题

## 进一步的思考

可以看到，挂载`emptyDir` 之后，查看`/dev/shm`的大小就跟磁盘空间一样大了，那这么干是不是意味着内存的空间就无限了呢？实际上并不是的，内存空间依然是优先的，只不过这种方式会偷偷的使用了宿主机的内存，但是这种使用k8s的调度器是感知不到的。

这样就会引发一个问题，`k8s`的调度器觉得目前这个`node`还可以继续创建`pod`，但是实际上这个`node`的内存已经被使用完了，一旦创建，就会出现超发的情况，`node`的资源不够使用，又会反过来触发`k8s`的调度逻辑，强制把这个`node`上的某些`pod`进行驱逐。而从我们外部的表现来看，就是部分`pod`被重建了。

## 参考文档

[设置kubernetes Pod的shared memory (ieevee.com)](https://ieevee.com/tech/2019/11/10/shm.html)

[docker - Define size for /dev/shm on container engine - Stack Overflow](https://stackoverflow.com/questions/46085748/define-size-for-dev-shm-on-container-engine/46434614#46434614)