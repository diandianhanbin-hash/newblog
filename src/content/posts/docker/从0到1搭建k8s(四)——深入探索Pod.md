---
title: "从0到1搭建k8s(四)——深入探索Pod"
publishedAt: "2021-01-17T23:53:17+08:00"
categories: ["K8S"]
tags: ["K8S"]
path: "/docker/从0到1搭建k8s(四)——深入探索Pod.html"
---

## 前文回顾

[k8s系列文章](https://www.svenweng.com/categories/K8S/)

如果读者已经按照前文的内容走下来，那么应该能够对`k8s`有一个非常基础的了解，即如何搭建环境，如何拉起一个容器，如何访问一个容器，这些操作都是我们想要往`k8s`部署应用所必须会的基本内容，帮助你快速的上手`k8s`。

接下来的一些文章，则会深入的介绍`k8s`的一些特殊的功能，能够更深入的理解`k8s`。

## Pod是什么

`Pod`其实就是`k8s`应用部署的最小单元（这个单元内是可以有多个容器的），我们所有的业务想要跑起来，都需要依赖这个`Pod`。

## Pod的一些配置

###  如何设置hosts

```
apiVersion: v1
kind: Pod
...
spec:
    hostAliases:
    - ip: "192.168.0.1"
        hostnames:
        - "testhost"
        - "testhost1"
...
```

通过这样设置，在`Pod`启动的容器中的`hosts`就会默认带上这个信息。值得注意的是，如果必须要指定`hosts`，那么就只能通过这种方式，否则一旦容器被杀掉重建，这个`hosts`就会消失。

### 如何让容器处于运行状态

```
apiVersion: v1
kind: Pod
...
containers:
    - name: test
        stdin: true
        tty: true
...
```

如果你运行的一个`linux`服务，那么你会发现容器启动的时候马上就会自动退出，这个其实和`docker`类似，`docker`的镜像想要启动容器，就必须要有一个常驻的进程在，常见的方式是写一个死循环在启动命令中（当然启动的时候使用`-it`也是类似的效果）。而在`k8s`中，需要配置`tty`和`stdin`。

### 如何不使用已有的镜像启动容器

为了启动容器速度快，默认的会使用已有的镜像启动容器。但是在某些场景下，我们可能不希望用已有的镜像启动容器（例如镜像仓库的同一个镜像发生了变更，想要获取最新的镜像）这个时候可以配置`k8s`的策略。

```
apiVersion: v1
kind: Pod
...
containers:
    - name: test
        stdin: true
        tty: true
        ImagePullPolicy: Always
...
```

通过配置`ImagePullPolicy`为`Always`可以保证每次都重新拉取镜像后再使用新的镜像启动容器，当然，这样启动速度就会比较慢（取决于你啦镜像的速度）

### 容器的生命周期回调

有两个回调会暴露给容器

`PostStart` 这个回调在容器被创建之后立即被执行。 
`PreStop` 在容器因 API 请求或者管理事件（诸如存活态探针失败、资源抢占、资源竞争等）而被终止之前， 此回调会被调用。 

官方文档的例子：

```
spec:
    containers:
    - name: lifecycle-demo-container
      image: nginx
      lifecycle:
        postStart:
          exec:
            command: ["/bin/sh", "-c", "echo Hello from the postStart handler > /usr/share/message"]
        preStop:
          exec:
            command: ["/usr/sbin/nginx","-s","quit"]
```

### 容器的数据卷挂载

`k8s`提供了丰富的数据卷挂载的方式，但是笔者并不建议读者使用数据挂载的方式来创建容器，这样的方式创建容器，则容器对部署的机器就会有很强烈的依赖，无法做到无状态的任意部署，如果必须的话，建议以其他方式来处理，例如在容器创建的时候使用事件出发下载，又或者通过其他方式把数据啦进容器，因此这里不做过多的讲解。

### 容器的健康度检查

健康度检查应该是一个刚性需求，`k8s`提供了丰富的健康度检测的机制。

* 文件检测

官方文档的例子：

```
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-exec
spec:
  containers:
  - name: liveness
    image: k8s.gcr.io/busybox
    args:
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5
      periodSeconds: 5
```

以上的例子通过 `cat /tmp/healthy`命令探测文件是否存在，这种探测方式用于容器内的应用程序运行时产生的文件，例如`xxx.pid`这类形式。一旦程序退出，则文件就会消失，通过这类机制发现程序已经挂了，那么`k8s`则会根据策略重启容器，确保应用重新启动。

这种方式探测，执行的命令退出时返回码为 `0` 则认为诊断成功。

* HTTP探测

官方文档的例子：

```
...
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 3
      periodSeconds: 3
```

上述的配置，会间隔3秒发起一个`http`请求，请求到当前容器`8080`端口的`/htalthz`。也就是`localhost:8080/healthz`.

这种探测方式如果响应的状态码大于等于 `200` 且小于 `400`，则诊断被认为是成功的。

* TCP探测

官方文档的例子：

```
...
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
```

这里有两个探测，一个是就绪探测，一个是存活探测，通过`tcp`连接的方式进行探测服务。

这种探测方式，如果端口打开，则诊断被认为是成功的。

## Pod的生命周期

最后再来一个概念性的内容，也就是`Pod`的生命周期。

>Pod 自身不具有自愈能力。如果 Pod 被调度到某节点 而该节点之后失效，或者调度操作本身失效，Pod 会被删除；与此类似，Pod 无法在节点资源 耗尽或者节点维护期间继续存活。任何给定的 Pod （由 UID 定义）从不会被“重新调度（rescheduled）”到不同的节点； 相反，这一 Pod 可以被一个新的、几乎完全相同的 Pod 替换掉。 如果需要，新 Pod 的名字可以不变，但是其 UID 会不同。

基于以上的概念，在上文笔者才会建议不使用数据卷挂载的方式，确保每个`Pod`可以被任意节点调度。（当然并非绝对，通过`NodeSelector`的方式也可以确保`Pod`被指定的节点调度，但是这类的`Pod`总归是有一定的局限性）

* Pod的阶段

`Pending`，`Running`，`Succeeded`，`Failed`，`Unknown`。

`Succeeded`和`Failed`都是表示容器终止，但是`Succeed`表示的是`Pod`的所有容器都成功终止，而`Failed`则表示`Pod`中至少有一个容器是异常退出而终止。

* 容器状态

`Waiting`,`Running`,`Terminated`.

* Pod的状况

`PodScheduled`，`ContainersReady`，`Initialized`，`Ready`。

状况是用于定位问题而关注的，需要注意的是，`Pod`必须是`Ready`的状态，才能对外提供服务。