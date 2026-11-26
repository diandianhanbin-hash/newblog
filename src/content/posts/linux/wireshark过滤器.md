---
title: "wireshark过滤器"
publishedAt: "2022-06-28T17:14:19+08:00"
categories: ["Linux"]
tags: ["Linux","Wireshark"]
path: "/linux/wireshark过滤器.html"
---

## 背景
`Wireshark`可以按照网卡进行网络封包的抓取，可以抓取从2层到7层的协议数据。
过滤器用法比较复杂，这里做一些记录。
## 过滤器
过滤器的语法就是 表达式 运算符 值，这种形式，例如ip.src==127.0.0.1
常用的运算符有：
	==（eq）（等于）
	contains（包含）
### 按IP过滤
ip.src eq 127.0.0.1
ip.dst eq 127.0.0.1192.168.1.107

### 按端口过滤
tcp.port eq 80 // 不管端口是来源的还是目标的都显示
tcp.port == 80  
tcp.port eq 2722  
tcp.port eq 80 or udp.port eq 80  
tcp.dstport == 80 // 只显tcp协议的目标端口80  
tcp.srcport == 80 // 只显tcp协议的来源端口80  
tcp.port >= 1 and tcp.port <= 80 // 过滤端口范围
### 包长度过滤
udp.length == 26 这个长度是指udp本身固定长度8加上udp下面那块数据包之和
tcp.len >= 7   指的是ip数据包(tcp下面那块数据),不包括tcp本身
ip.len == 94 除了以太网头固定长度14,其它都算是ip.len,即从ip本身到最后
frame.len == 119 整个数据包长度,从eth开始到最后
### 过滤HTTP
过滤 HTTP是非常常用的方法。
* 按method过滤
http.request.method == "GET"  
* 按url过滤
http.request.uri == "/img/logo-edu.gif"  
* 按host过滤
http.host==magentonotes.com  
* 按cookie过滤
http.cookie contains xxx