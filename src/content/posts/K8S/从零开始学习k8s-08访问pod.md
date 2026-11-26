---
title: "从零开始学习k8s-08访问pod"
publishedAt: "2021-11-03T23:24:19+08:00"
categories: ["kubernetes"]
tags: ["kubernetes"]
path: "/K8S/从零开始学习k8s-08访问pod.html"
---

## 背景

我们之前跟着官方文档学习了`k8s`中`pod`的基本使用，那么现在就遇到一个问题了，我们创建的`pod`是没办法访问的。本文就继续跟着官方文档来学习如何访问`pod`的。

## 创建一个Nginx Pod

我们还是使用之前的方案，创建一个`nginx`的`pod`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx
  labels:
    run: my-nginx
spec:
  containers:
  - name: my-nginx
    image: nginx
    ports:
    - containerPort: 80
```

这里的`yaml`文件跟之前的有一些差异，增加了`labels`，用来后面我们创建`service`的时候选择使用的。我们尝试创建并访问它

```bash
kubectl get pods -l run=my-nginx -o wide
NAME       READY   STATUS    RESTARTS   AGE   IP           NODE       NOMINATED NODE   READINESS GATES
my-nginx   1/1     Running   0          24s   172.17.0.9   minikube   <none>           <none>
$ curl localhost:80
curl: (7) Failed to connect to ::1: Network is unreachable
curl http://localhost:80
curl: (7) Failed to connect to ::1: Network is unreachable
curl http://172.17.0.9:80
curl: (7) Failed to connect to ::1: Network is unreachable

```

可以看到，这个`nginx`是完全无法访问的。似乎这个k8s给我们分配的`IP`是一个假`IP`。或者，这个`nginx`压根就没起来？

```bash
kubectl exec -it my-nginx -- /bin/bash
root@my-nginx:/# curl localhost:80
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

可以看到，我们进入容器时候，是能够正常的访问`nginx`，也就是说，没有办法从外部来访问。

## 通过Service暴露端口

执行命令

```bash
kubectl expose pod/my-nginx
service/my-nginx exposed
```

这个时候我们端口就暴露出来了，这个命令相当于我们为这个`pod`创建了一个`service`。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nginx
  labels:
    run: my-nginx
spec:
  ports:
  - port: 80
    protocol: TCP
  selector:
    run: my-nginx
```

直接那这个`yaml`来创建，也是可以的。这里的`service`通过之前我们创建容器的`label`的` run: my-nginx`来定位这个`service`为哪个`pod`转发请求。

```bash
kubectl get svc
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP   20h
my-nginx     ClusterIP   10.110.98.179   <none>        80/TCP    13m
```

执行这个命令就可以看到我们创建的`service`列表了。

这个时候，我们在集群的任意一个节点访问这个地址，就能看到`nginx`返回的信息了。

```bash
kubectl get ep 
NAME         ENDPOINTS            AGE
my-nginx     100.121.138.194:80   13m
curl 100.121.138.194:80
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

## 参考资料

[https://kubernetes.io/zh/docs/concepts/services-networking/connect-applications-service/](https://kubernetes.io/zh/docs/concepts/services-networking/connect-applications-service/)