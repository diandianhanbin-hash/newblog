---
title: "channel基础"
publishedAt: "2022-03-16T23:01:11+08:00"
categories: ["Go"]
tags: ["Go"]
path: "/go/channel基础 .html"
---

## 背景

`channel`是`go`进行复杂并发的基础，因此这里单独记录一下关于`channel`的基础用法

## 接收数据

```go
package main

import (
	"fmt"
	"time"
)

func recv(c chan int) {
	info := <-c
	fmt.Printf("recv info is: %d", info)
}

func main() {
	ch := make(chan int)
	go recv(ch)
	ch <- 10
	fmt.Println("send to ch success")
	time.Sleep(1 * time.Second)
}
```

## 关闭通道

```go
package main

import (
	"fmt"
)

func send(c chan int) {
	for i := 0; i < 5; i++ {
		c <- i
	}
	close(c)

}

func main() {
	ch := make(chan int)
	go send(ch)
	for {
		if data, ok := <-ch; ok {
			fmt.Printf("data is: %d, ok is : %v\n", data, ok)
		} else {
			break
		}
	}
	fmt.Println("over")
}
```

可以看到，从`chan`获取数据的时候有两个变量，一个是`chan`的数据，另一个是数据标记，当第二个参数直是`false`的时候，表示通道已经没有数据了，此时代码应该对这种情况做额外的处理。

当然，上面的例子还有更简单的方式，那就是用`range`来迭代这个通道。

```go
package main

import (
	"fmt"
)

func send(c chan int) {
	for i := 0; i < 5; i++ {
		c <- i
	}
	close(c)

}

func main() {
	ch := make(chan int)
	go send(ch)
	for data := range ch {
		fmt.Printf("data is: %d\n", data)
	}
	fmt.Println("over")
}
```

## 通道大小

平时真实的业务中，可能会对并发的数量进行限制，以确保并发请求不会破坏系统。因此在处理的时候可以限制通道的大小。还是刚刚的例子，我们做一下简单的修改。可以看到，所有的`push`动作一定是在`get`动作之后，而不能一次性`push`过多数据进去。

```go
package main

import (
	"fmt"
	"time"
)

func send(c chan int) {
	for i := 0; i < 5; i++ {
		c <- i
		fmt.Printf("push to channel, time is: %d\n", time.Now().Unix())
		time.Sleep(1 * time.Second)
	}
	close(c)

}

func main() {
	ch := make(chan int, 1)
	go send(ch)
	for data := range ch {
		fmt.Printf("get data is: %d,time is: %d\n", data, time.Now().Unix())
		time.Sleep(2 * time.Second)
	}
	fmt.Println("over")
}
```

## 多通道获取数据

像上面的做法，获取一个通道的数据是没问题的，但是我们日常业务中可能会有多个通道数据产生，用上面的方式当然是可以的，但是不免产生很多相似的代码，因此`go`语言给我们提供了`select`关键字。我们用上一篇文章的例子来试试看。

```go
package main

import (
	"fmt"
	"time"
)

type PersonInfo struct {
	Name string
	Age  int32
}

func QryName(ch chan string) {
	ch <- "sven"
	time.Sleep(time.Second * 1)
	fmt.Println("send name over")
}

func QryAge(ch chan int32) {
	ch <- 30
	fmt.Println("send age over")
}

func main() {
	var person PersonInfo
	nameCh := make(chan string)
	ageCh := make(chan int32)
	go QryName(nameCh)
	go QryAge(ageCh)
	for {
		select {
		case nm := <-nameCh:
			person.Name = nm
		case age := <-ageCh:
			person.Age = age
		case <-time.After(3 * time.Second):
			fmt.Println("time out by 3 second")
			fmt.Printf("person info is: %+v", person)
			return
		}
	}

}
```

这个例子通过`select`的方式，来控制每个通道返回的数据进行数据赋值。