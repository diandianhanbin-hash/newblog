---
title: "基于UnixSocket抽象命名空间的采坑记录"
publishedAt: "2019-03-10T10:13:02+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/基于UnixSocket抽象命名空间的采坑记录.html"
---

## 背景
最近接手的`某平台`的某个服务与业务的通讯交互方式是通过`Unix Socket`的方式，这种通讯方式相对于已有的`TCP`来说，效率更高，传输效率大约是`TCP`的两倍。高效的同时，也是数据可靠的，但是它的缺点是必须本机通讯。由平台的机制，通过这种方式收进行通讯，对性能开销小、效率高的同时也保证了数据传输的可靠性。

## Unix Socket显式文件的缺陷
`Unix Socket`进行通讯时，必须绑定一个文件，也就是需要在服务器上写一个文件，这样就会引发几个问题：
1. 服务必须具备对应路径的读写权限。
2. 关闭通讯的时候，文件是不会自动删除的，每次关闭时都要单独增加删除的逻辑
3. 这个临时文件会被`Linux`系统或其他程序不经意的删除，会导致一些不可控的问题，并且很难发现。

## 解决方案和测试难点
`UNIX域Socket抽象命名空间`是一个很好的解决方案。这个方案采用一个抽象的命名空间，直接在`Linux`的内存中维护一个虚拟文件系统，也就是说绑定的地址用常规方式是无法看到的，并且在连接断开后，会自动删除。

这种解决方案对于程序来说是一个非常好的方案，但是对于测试来说，却是一个非常难解决的问题，尤其是第一次接触这块内容的时候，会是一个灾难。

## 问题浮现
通过查看代码可以直接看到`Unix Socket`绑定的地址是这样的：

```c
//xxx_agent监听地址
const string UnixSocketServerPath = "/tmp/xxx.unix";
```

如果用`Python`绑定去发包，会直接报连接被拒绝的错误。

再往下继续跟代码，发现开发在拼地址的时候，做了一个截断的操作：

```c
server_address.sun_family = AF_UNIX;
strncpy(server_address.sun_path+1, address, sizeof(server_address.sun_path) - 1);
```

整个地址被截了一位。

再试试`/tmp/xxx.uni`这个地址。依然报错连接拒绝。

找开发沟通后，开发的意思是截断1位之后，会在前面补一个0，但是这个0是一个二进制的0。

![-w715](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/wintercheck.jpg)

于是使用`Python`的`struct`库做了二进制转换。代码如下：
```python
b_addr = struct.pack("i{a}s".format(a=len(addr)), 0, addr)
```

依然连接拒绝，通过查看`struct`库的手册之后，发现使用`i`做去格式化，会占用4个字节，而在`C++`的代码中，只截断了1个字节。于是这里需要改用`b`去做格式化。

```python
b_addr = struct.pack("b{a}s".format(a=len(addr)), 0, addr)
```

依然报错。同时我还尝试了各种转换字符串等方式，全部都失败了。这个方向已经是一个死循环了。

## 峰回路转

换一个方向思考，如果从系统的角度来看，这个服务一定是起了某个进程，那么可以去这个进程的`proc`文件夹中，找到使用的文件描述符.

```
[root@eb1a5ee8d3d5 /proc/26043/fd]# sudo ls -lrt
total 0
lrwx------ 1 root root 64 Mar  8 14:20 8 -> anon_inode:[eventfd]
lrwx------ 1 root root 64 Mar  8 14:20 7 -> anon_inode:[eventpoll]
lrwx------ 1 root root 64 Mar  8 14:20 6 -> socket:[2628408710]
l-wx------ 1 root root 64 Mar  8 14:20 5 -> /data/server/xxx_agent/log/xxx_agent_20190308_acc.log
l-wx------ 1 root root 64 Mar  8 14:20 4 -> /data/server/xxx_agent/log/xxx_agent_app_20190308_app.log
lrwx------ 1 root root 64 Mar  8 14:20 3 -> /var/tmp/xxx_agent.lock.pid
lrwx------ 1 root root 64 Mar  8 14:20 2 -> /dev/null
lrwx------ 1 root root 64 Mar  8 14:20 1 -> /dev/null
lrwx------ 1 root root 64 Mar  8 14:20 0 -> /dev/null
l-wx------ 1 root root 64 Mar  8 16:37 10 -> /data/server/xxx_agent/log/xxx_agent_stat_2019030815_stat.log
```

这里有一个`socket:[2628408710]`引起了我的注意，于是拿着这个去`Google`。虽然没有搜索到结果，但是这里找到了一个思路，相关信息中有看到可以在`/proc/net/tcp`位置查看所有进程的tcp的连接信息，那么我们这个协议是`unix socket`，是否也有对应的连接信息？

```
[root@eb1a5ee8d3d5 /proc/net]# sudo ls -lrt
total 0
-r--r--r--  1 root root 0 Mar  8 16:40 xfrm_stat
dr-xr-xr-x  2 root root 0 Mar  8 16:40 vlan
-r--r--r--  1 root root 0 Mar  8 16:40 unix
-r--r--r--  1 root root 0 Mar  8 16:40 udplite6
-r--r--r--  1 root root 0 Mar  8 16:40 udplite
-r--r--r--  1 root root 0 Mar  8 16:40 udp6
-r--r--r--  1 root root 0 Mar  8 16:40 udp
-r--r--r--  1 root root 0 Mar  8 16:40 tcp6
-r--r--r--  1 root root 0 Mar  8 16:40 tcp
```

这里证实了我的猜想，使用`cat`即可查看`unix`的信息。

```
[root@eb1a5ee8d3d5 /proc/net]# cat unix
Num       RefCount Protocol Flags    Type St Inode Path
ffff880058349c00: 00000002 00000000 00000000 0002 01 2629316422 /data/server/xxx_agent/data/xxx_api.sk
ffff880008e83100: 00000002 00000000 00000000 0002 01 2628408710 @/tmp/xxx.uni
ffff8807102aa680: 00000002 00000000 00000000 0001 03 349101185
ffff88001b279880: 00000002 00000000 00000000 0002 01 2629297346
ffff880725603800: 00000002 00000000 00000000 0002 01 2630221924
ffff8800af64de80: 00000002 00000000 00000000 0001 03 349094904
ffff88001b27cd00: 00000002 00000000 00000000 0002 01 2629373949
```

这里一个很扎眼的`@/tmp/xxx.uni`。并且地址前面的`2628408710`与之前在`fd`里面找到的数字是样的，因此可以确定就是我们要找的`Unix Socket`的连接信息了。

但是我尝试使用`@/tmp/xxx.uni`这个地址去连接，依旧是连接失败。

但是有了这个信息，继续去`Google`，可以找到这个内容的关键名词`abstract namespace Unix domain sockets`，也就是`抽象命名空间`。再根据关键字即可找到对应的解决方案。

[https://utcc.utoronto.ca/~cks/space/blog/python/AbstractUnixSocketsAndPeercred](https://utcc.utoronto.ca/~cks/space/blog/python/AbstractUnixSocketsAndPeercred)

这里是最终的解决方案。也就是绑定地址是`addr = "\0/tmp/xxx.uni"`

这里方法对于`Python2`和`Python3`都是有效的。

## 后续思考
`addr = "\0/tmp/xxx.uni"`这个地址通过`print repr(addr)`方法打印出来的结果是`'\x00/tmp/xxx.uni'`。也就是说前面是一个二进制的0。这个方法其实在调试的时候，用`struct`处理了之后是一个同样的结果。

```
b_addr = struct.pack("c{a}s".format(a=len(addr)), '\0', addr)

>>>

'\x00/tmp/xxx.uni'
```
那么为什么在绑定的时候会连接失败呢？

在[Linux官方说明文档](http://man7.org/linux/man-pages/man7/unix.7.html)中其实对此是有专门的解释。

>abstract: an abstract socket address is distinguished (from a
          pathname socket) by the fact that sun_path[0] is a null byte
          ('\0').  The socket's address in this namespace is given by the
          additional bytes in sun_path that are covered by the specified
          length of the address structure.  (Null bytes in the name have no
          special significance.)  The name has no connection with filesystem
          pathnames.  When the address of an abstract socket is returned,
          the returned addrlen is greater than sizeof(sa_family_t) (i.e.,
          greater than 2), and the name of the socket is contained in the
          first (addrlen - sizeof(sa_family_t)) bytes of sun_path.

看官方的定义，似乎这是一个空字节的标识。`an abstract socket address is distinguished (from a pathname socket) by the fact that sun_path[0] is a null byte('\0')`

而我们用`struct`转成二进制之后，会有一个字节的长度，虽然打出来的结果在控制台看起来是一样的，但是实际上占了一个字节的长度，这样就会导致绑定的地址不匹配。