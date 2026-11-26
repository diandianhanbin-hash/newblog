---
title: "Python基于unix socket的并发技巧"
publishedAt: "2019-07-28T14:26:56+08:00"
categories: ["Python"]
tags: ["Python","UnixSocket"]
path: "/python/Python基于unix socket的并发技巧.html"
---

## 背景
在开发Mock中心的过程中，每个`server`与`client`通讯的时候，需要使用`unix socket`这种高效的本机通讯协议来交换数据，但是`unix socket`通讯协议是基于文件的，也就是当并发量大的时候，单个文件作为通讯信道会出现拥堵的情况。

## 思路
解决的思路很简单，不使用单文件作为通讯信道。
`TCP`协议中，应对并发是有多种方式的。最常规的方式就是以多线程的方式，监听多个通讯信道，还有`Linux`上比较经典的`epoll`的方式。
从本质上来说，多线程的方式，其实就是开启了多个通信信道，在`Linux`系统底层看来，就是多个`socket`文件。而`epoll`的方式，其实就是极致的压榨单信道的性能。
在设计这个通讯方式的时候，其实就是为了简便的实现高性能。
在`server`监听的时候，仅监听一个文件，但是回包的时候，`client`在请求之前先监听一个文件，然后把文件地址带到请求串中，`server`在收到这个请求之后，回包就不通过原路返回，而是回到这个`client`监听的地址。

## 代码
* client


```python
class UnixSocketUDPServer(object):
    """由于unix socket的特殊模式，如果有返回值的，必须在发包前监听一个socket文件"""

    def __init__(self, srv_addr, soc_model=socket.SOCK_DGRAM):
        try:
            os.unlink(srv_addr)
        except OSError:
            if os.path.exists(srv_addr):
                raise EnvironmentError("path is exist")
        self.srv_addr = srv_addr
        self.rsp_data = ""
        self.sock = socket.socket(socket.AF_UNIX, soc_model, 0)
        self.sock.bind(self.srv_addr)

    def __del__(self):
        os.unlink(self.srv_addr)
        
def unpack_package(data):
    """
    unix socket 的解包方法，对应下面的pack_package。
    由于struck的unpack方法解出来的数据都是tuple类型，所以取数据的时候需要注意忽略tuple的第二个参数
    :param data:
    :return: tuple，tuple
    """
    total_len, addr_len, body_len = struct.unpack("iii", data[:4 * 3])
    addr = struct.unpack("{addr_len}s".format(addr_len=addr_len), data[12:addr_len + 12])
    body = struct.unpack("{body_len}s".format(body_len=body_len), data[addr_len + 12:])
    return addr, body


def pack_package(addr, body):
    """
    unix socket 的打包数据的方法，打包的内容是：地址+数据。
    打包的格式是： 包总长度+地址长度+数据长度+地址+数据
    :param addr:
    :param body:
    :return: 打包好的二进制数据
    """
    addr_len = len(addr)
    body_len = len(body)
    total_len = addr_len + body_len + 12
    _package = struct.pack("iii{addr_len}s{body_len}s".format(addr_len=addr_len,
                                                              body_len=body_len),
                           total_len, addr_len, body_len, addr, body)
    return _package
    
addr = "/tmp/{_addr}.sock".format(_addr=random_utils.get_uuid())
# 这里在请求时需要先监听一个unix socket文件。
us = network_utils.UnixSocketUDPServer(addr)
us.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
# 这里使用unicode把数据包起来是为了防止解析后某些数据非unicode导致数据转换失败
_req_data = unicode(self.method) + u"|" + unicode(str(getattr(self.t, "m_data")), errors="ignore")
logger.info("===========call unix socket to agent===========")
req_data = string_utils.pack_package(addr, str(_req_data))
logger.info(repr(req_data))
us.sock.sendto(req_data, 0, US_ADDR)
sec = 0
usec = 10000
timeval = struct.pack('ll', sec, usec)
us.sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVTIMEO, timeval)
raw_data, _ = us.sock.recvfrom(20480)    
```

* server

```python

s = net_util.unix_socket_server("/tmp/mock_mgr_agent_addr.sock")
while True:
    data = s.recv(20480)
    _addr, _body = unpack_package(data)
    addr = _addr[0]
    body = _body[0]
    
    ......
    
    ret_info = pack_package(addr, str(_ret_info))
    unix_socket_send(addr, ret_info)
```

## 说明
* 打包和解包

这里打包和解包用了`strunt`方法，把字符串打成二进制，这样可以加快传输的效率。同时也把地址的长度位和数据的长度位打包进去，方便`server`截取。

* client

在client的代码中，先生成了一个`unix socket`的对象，监听了一个用`uuid`生成的随机文件地址，然后把这个地址信息和需要传递的数据一起发送给服务端。

* server

服务端就是传统的socket服务，只是在回包的时候，发往的地址是收到的数据中的地址。

* socket端口和地址复用

一般的，socket绑定了一个地址，那么就不会变，但是我们这里的client端，需要监听一个地址的同时，发送消息到另一个地址，这里就需要使用这个`socket.SOL_SOCKET`，通过`setsockopt`，对`socket`进行设置，允许使用端口和地址复用。`socket.SO_REUSEADDR`这个参数提供如下功能：
```
SO_REUSEADDR允许启动一个监听服务器并捆绑其众所周知端口，即使以前建立的将此端口用做他们的本地端口的连接仍存在。这通常是重启监听服务器时出现，若不设置此选项，则bind时将出错。
 
SO_REUSEADDR允许在同一端口上启动同一服务器的多个实例，只要每个实例捆绑一个不同的本地IP地址即可。对于TCP，我们根本不可能启动捆绑相同IP地址和相同端口号的多个服务器。
 
SO_REUSEADDR允许单个进程捆绑同一端口到多个套接口上，只要每个捆绑指定不同的本地IP地址即可。这一般不用于TCP服务器。
 
SO_REUSEADDR允许完全重复的捆绑：当一个IP地址和端口绑定到某个套接口上时，还允许此IP地址和端口捆绑到另一个套接口上。一般来说，这个特性仅在支持多播的系统上才有，而且只对UDP套接口而言（TCP不支持多播）。
```

简单的理解就是，这个参数后面的值不等于0，就可以在监听的同时，发送数据到其他地址。
