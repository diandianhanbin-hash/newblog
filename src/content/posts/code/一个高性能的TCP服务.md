---
title: "一个高性能的TCP服务"
publishedAt: "2019-02-12T17:10:15+08:00"
categories: ["代码片段"]
tags: ["Python"]
path: "/code/一个高性能的TCP服务.html"
---

## 背景
普通的TCP服务每个链接都需要线程或者进程的开销，一旦出现大流量的请求，会导致服务挂掉，这里给一个基于`Epoll`模型的服务。
**！！！注意！！！**。由于`Epoll`只再`Linux`上有，因此代码只能再`Linux`环境下执行。

## 代码
```python
import socket
import select
import threading
import Queue
import time

def get_server():
    server_address = ("127.0.0.1", 9898)
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(server_address)
    server.listen(5)
    return server


def client_recv_data(sock, buffer_size=1024):
    buf = sock.recv(buffer_size)
    if not buf:
        return
    try:
        while buf:
            yield buf
            if len(buf) < buffer_size:
                break
            buf = sock.recv(buffer_size)
    except Exception as err:
        print "recv client data error:{0}".format(err)


def client(sock, data):
    print sock, data
    sock.sendall(data)

def start_tcp():
    server = get_server()
    message_queues = {}
    timeout = -1

    # Create a limit for the event
    READ_ONLY = (select.EPOLLIN | select.EPOLLPRI |
                    select.EPOLLHUP | select.EPOLLERR)
    READ_WRITE = (READ_ONLY | select.EPOLLOUT)

    print "READ ONLY"
    print READ_ONLY
    print "READ WRITE"
    print READ_WRITE

    # Set up the poller
    epoller = select.epoll()
    epoller.register(server, READ_ONLY)
    fd_to_socket = {server.fileno(): server, }

    print "file_no==>"
    print server.fileno()

    while True:
        events = epoller.poll(timeout)
        print "event ==> "
        print events
        for fd, flag in events:
            time.sleep(0.001)
            s = fd_to_socket[fd]
            if flag & (select.EPOLLIN | select.EPOLLPRI):
                print "first in ==>"
                print flag & (select.EPOLLIN | select.EPOLLPRI)
                print "flag:"
                print flag
                print "select status"
                print select.EPOLLIN, select.EPOLLPRI
                print "s is==>"
                print s
                if s is server:
                    connection, client_address = s.accept()
                    connection.setblocking(False)
                    fd_to_socket[connection.fileno()] = connection
                    epoller.register(connection, READ_ONLY)
                    message_queues[connection] = Queue.Queue()
                else:
                    try:
                        data = ''.join(client_recv_data(s))
                        if data[:4]:
                            result = data
                            message_queues[s].put(result)
                            epoller.modify(s, READ_WRITE)
                        else:
                            epoller.unregister(s)
                            s.close()
                            print "s.close"
                            del message_queues[s]

                    except Exception as e:
                        print "system error {0}".format(e)
            elif flag & select.EPOLLHUP:
                print "second in ==>"
                print flag & select.EPOLLHUP
                print "second flag==>"
                print flag, select.EPOLLHUP
                epoller.unregister(s)
                s.close()

            elif flag & select.POLLOUT:
                print "thrid in ===>"
                print flag & select.POLLOUT
                print "thrid flag ==>"
                print flag, select.POLLOUT
                try:
                    next_msg = message_queues[s].get_nowait()
                except Queue.Empty:
                    epoller.modify(s, READ_ONLY)
                else:
                    try:
                        my_thread = threading.Thread(target=client, args=(s, next_msg))
                        my_thread.start()
                        # self._client(s, next_msg)
                    except Exception as ex:
                        # logger.debug("count :" + str(count))
                        print "SEND except"
                        print traceback.format_exc()
            elif flag & select.EPOLLERR:
                print "forth flag == >"
                print flag, select.EPOLLERR
                print "  exception on", s.getpeername()
                epoller.unregister(s)
                s.close()
                del message_queues[s]


if __name__ == "__main__":
    start_tcp()
```

## 说明
代码中的`client_recv_data()`方法是接受数据的处理方法。在`result = data`这一步可以单独抽一个数据处理的方法来处理数据后把结果返回出去。处理的数据后会扔到消息队列中。

`client()`方法则是回数据的方法
