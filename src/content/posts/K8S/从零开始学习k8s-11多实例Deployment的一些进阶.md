---
title: "从零开始学习k8s-11多实例Deployment的一些进阶"
publishedAt: "2021-11-10T20:00:19+08:00"
categories: ["kubernetes"]
tags: ["kubernetes"]
path: "/K8S/从零开始学习k8s-11多实例Deployment的一些进阶.html"
---

## 背景

在之前，我们使用`Deployment`部署过多实例。这里来说说一些进阶的内容。

我们从现象可以看到，`deployment`可以部署多个实例，并且监控`pod`的数量，在实例数量不符合预期的时候，`deployment`会进行新增或者减少`pod`的数量，那么`Deployment`一定有对应的控制单元对这些`pod`的数据进行监控，这个控制单元就是`ReplicaSet`。

## ReplicaSet

首先需要明确，`ReplicaSet`是可以单独使用的，但是官方的推荐是没必要，因为`Deployment`已经能够无感知的提供`ReplicaSet`的功能了。

```bash
kubectl get deployments
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   2/2     2            2           5d23h

kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5d59d67564   0         0         0       5d23h
nginx-deployment-64c9d67564   2         2         2       5d23h
```

这里就是`ReplicaSet`的数据。我们修改镜像的版本重新更新一下，可以看到`rs`的变更情况。

```bash
kubectl apply -f third.yaml 
deployment.apps/nginx-deployment configured
kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5d59d67564   2         2         1       5d23h
nginx-deployment-64c9d67564   1         1         1       5d23h
kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5d59d67564   2         2         1       5d23h
nginx-deployment-64c9d67564   1         1         1       5d23h
kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5d59d67564   2         2         1       5d23h
nginx-deployment-64c9d67564   1         1         1       5d23h
kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5d59d67564   2         2         2       5d23h
nginx-deployment-64c9d67564   0         0         0       5d23h
```

可以看到，`5d59d67564`这个`rs`原来是没有东西的，当法师变更的时候，在`5d59d67564`这个`r
s`上就开始创建了，而原来的`64c9d67564`则开始减少，这个过程一直到`64c9d67564`减少到0，而新的`5d59d67564`数量变成2之后，这个变更流程就结束了。

从这个过程可以知道，当`deployment`发送变更的时候，会使用一个新的`rs`来创建`pod`，逐步扩容`pod`到指定的数量，而旧的`rs`则慢慢缩容到0。

## 回滚

知道了`rs`的存在，并且知道更新的操作之后，我们就可以更好的理解回滚这个操作了。

我们用 一个不存在的`nginx`版本号来做这个实验。

```bash
kubectl get pods
NAME                                READY   STATUS         RESTARTS      AGE
nginx-deployment-5d59d67564-48mdm   1/1     Running        0             86m
nginx-deployment-5d59d67564-zjlb6   1/1     Running        0             86m
nginx-deployment-dc6c7f69b-q9hxq    0/1     ErrImagePull   0             39s

kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5d59d67564   2         2         2       6d
nginx-deployment-64c9d67564   0         0         0       6d
nginx-deployment-dc6c7f69b    1         1         0       28s

kubectl get deployment
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   2/2     1            2           6d
```

我们逐步来看，首先是`pod`的情况，由于我们这个镜像版本号是不存在的，因此镜像拉取的时候就一定会失败。这个时候，`pods`列表就可以看到一个新的`nginx-deployment`被创建出来了，但是状态是失败。

再看看`rs`，每次更新的时候，都会调度一个新的`rs`来创建新的`pod`，这里可以看到，新的`dc6c7f69b`正在创建，但是由于创建失败，所以旧的没有发生缩容的情况。

最后看看`deployment`的信息，可以看到，有一个`pods`正在更新。

这个时候，我们执行回滚的操作。

```bash
kubectl rollout undo deployment.v1.apps/nginx-deployment
deployment.apps/nginx-deployment rolled back

kubectl get rs
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-5d59d67564   2         2         2       6d
nginx-deployment-64c9d67564   0         0         0       6d
nginx-deployment-dc6c7f69b    0         0         0       5m45s
kubectl get deployment
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   2/2     2            2           6d

kubectl get pods
NAME                                READY   STATUS    RESTARTS      AGE
nginx-deployment-5d59d67564-48mdm   1/1     Running   0             92m
nginx-deployment-5d59d67564-zjlb6   1/1     Running   0             92m
```

从这里可以看到，新的`rs`的调度任务被清零了，而旧的两个依然还存活着。

## 逐步更新

在我们刚刚更新的时候，可以发现每次更新的时候更新的过程我们不可控，在很快的时间就全部更新成功了，但是在我们的日常工作中，可能需要慢慢的进行更新，比如有2个容器，我们先更新一个，然后跑一些验证流量，验证OK之后再全量更新。

很遗憾，从目前找到的资料来看，这个功能需要自己额外的进行操作，原生的k8s目前还不支持，官方建议的是通过标签的差异来实现金丝雀发布，具体可以查看[https://kubernetes.io/zh/docs/concepts/cluster-administration/manage-deployment/#canary-deployments](https://kubernetes.io/zh/docs/concepts/cluster-administration/manage-deployment/#canary-deployments)

## 参考资料

[https://kubernetes.io/zh/docs/concepts/cluster-administration/manage-deployment/#canary-deployments](https://kubernetes.io/zh/docs/concepts/cluster-administration/manage-deployment/#canary-deployments)

[https://kubernetes.io/zh/docs/concepts/workloads/controllers/replicaset/](https://kubernetes.io/zh/docs/concepts/workloads/controllers/replicaset/)

[https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/](https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/)