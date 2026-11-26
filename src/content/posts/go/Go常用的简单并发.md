---
title: "Go常用的简单并发"
publishedAt: "2022-03-15T22:51:11+08:00"
categories: ["Go"]
tags: ["Go"]
path: "/go/Go常用的简单并发.html"
---

# Go常用的简单并发

## 背景

Go的优势在于性能比较好，这里记录一下go并发的简单使用。

## 无状态并发

无状态的并发，直接使用go关键字即可。

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	go DoSomething()
	go DoSomething2()
	time.Sleep(2 * time.Second)
}

func DoSomething() {
	time.Sleep(1 * time.Second)
	fmt.Println("DoSomething")
}

func DoSomething2() {
	time.Sleep(1 * time.Second)
	fmt.Println("DoSomething2")
}
```

但是这里需要特别注意，main函数的主进程必须要最后结束，否则就会看到啥东西都没执行，就结束了。其原理是因为go的并发使用的是协程，而协程并不能独立于主进程外运行，因此主进程在推出之后，协程执行的操作也会随之推出，而不会执行。

## 并发后同时返回

我们在日常编码中，经常需要并发的执行某些行为，比如某个数据需要调3个接口才能拿全，那么这里就会需要3个查询并发进行，并且查询结果要全部返回后，才能结束。这里需要引入go的WaitGroup机制。如下代码所示，并发修改一个对象的内容。会等全部执行完毕后再继续流程。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

type Test struct {
	name string
	age  int32
}

func main() {
	var wg sync.WaitGroup
	var t Test
	wg.Add(2)
	go DoSomething(&wg, &t)
	go DoSomething2(&wg, &t)
	fmt.Println("i will print before do something")
	wg.Wait()
	fmt.Println("all run over")
	fmt.Printf("test info is: %+v\n", t)
}

func DoSomething(wg *sync.WaitGroup, t *Test) {
	defer wg.Done()
	t.name = "sven"
	time.Sleep(2 * time.Second)
}

func DoSomething2(wg *sync.WaitGroup, t *Test) {
	defer wg.Done()
	t.age = 30
	time.Sleep(1 * time.Second)
}
```

可以看到，这里有两个函数同时修改了一个对象，这里只是为了演示并发的情况。真实的业务上这样去修改，必须保证每个修改动作是可控的，不会发生互相践踏。

## 小结

本文介绍的是go语言中最简单，也是最常用的并发姿势，一般的业务系统，这两种情况已经足够在大部分场景下使用了。之后再要进阶，则会涉及到channel等相关的知识