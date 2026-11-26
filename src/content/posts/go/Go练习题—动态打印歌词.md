---
title: "Go练习题—动态打印歌词"
publishedAt: "2019-02-14T00:26:11+08:00"
categories: ["Go"]
tags: ["Go"]
path: "/go/Go练习题—动态打印歌词.html"
---

## 背景
15年我开始学`Python`的时候，写的第一个练习题就是[Python练习题—动态打印歌词](http://www.wengyb.com/blog/detail/1)。现在开始学习`Golang`，也沿用原来的学习路线，实现一下打印歌词

## 实现思路
代码实现起来基本上是非常简单的，由以下几步组成：

* 读取文件
* 逐行解析出时间和歌词
* 循环读取解析数据，然后根据时间计算时间差来等待
* 等待完成后打印歌词

## 代码

```go
package main

import (
	"fmt"
	"os"
	"io/ioutil"
	"strings"
	"strconv"
	"time"
)

func main() {
	var iLastTime int
	data, _ := ReadFile("gechi.txt")
	lines := strings.Split(string(data), "\n")
	fmt.Println("开始播放")
	for i := 0; i < len(lines); i++ {
		sTime, content := ParseOneLrc(lines[i])
		iTime, _ := strconv.Atoi(sTime)
		time.Sleep(time.Duration(iTime-iLastTime) * time.Millisecond)
		iLastTime = iTime
		fmt.Println(content)
	}
	fmt.Println("停止播放")
}

// 根据传入的地址读取歌词文件。
// 返回byte类型,如果需要转字符串，则需要使用string()方法转为字符串
func ReadFile(path string) ([]byte, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	data, err := ioutil.ReadAll(f)
	f.Close()
	return data, err
}

// 解析一行歌词
// 返回字符类型的时间和歌词内容
func ParseOneLrc(lrc string) (extime, content string) {
	tmp := strings.Split(lrc, "]")
	first, second := tmp[0], tmp[1]
	extime = strconv.Itoa(Str2Ms(first[1:]))
	content = second
	return extime, content
}

// 把歌词的时间转成毫秒
// 返回int类型的毫秒
func Str2Ms(t string) int {
	tmp1 := strings.Split(t, ":")
	tMin := tmp1[0]
	tmp2 := strings.Split(tmp1[1], ".")
	tSecond := tmp2[0]
	tMs := tmp2[1]
	ms, _ := strconv.Atoi(tMs)
	min, _ := strconv.Atoi(tMin)
	second, _ := strconv.Atoi(tSecond)
	ms = ms + min*60*1000 + second*1000
	return ms
}
```

## 几个关键点记录

* 类型转换

`Golang`是强类型语言，相比于`Python`来说，写起来要非常注意这个问题，好在大部分类型不正确的问题IDE都会提示我们

`strconv.Atoi`可以把字符串转为`int`，同理`strconv.Itoa`可以把`int`转为字符串

* 多返回值和错误

在`Golang`中是支持多返回值的，但是`Golang`中的错误处理不想`Python`、`Java`那样用`try`来处理，而是把`err`这种错误信息用一个返回值来返回，所以经常调用内建库的时候，要注意使用这样的代码来处理错误：

```go
f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
```

如果需要忽略这个错误的话，就需要借助一个`_`来处理，比如：`data, _ := ReadFile("gechi.txt")`

* 读取文件返回字节

调用`ioutil.ReadAll(f)`读取文件的时候，返回的是一个`[]byte`类型，打印出来则是这样的：

```
[91 48 48 58 48 49 46 51 52 93 230 136 144 233 131 189 10 91 48 48]
```

如果需要转为字符串，则需要使用`string([]byte)`。

* `time.Sleep`方法传值比较蛋疼

如果用`Python`来实现睡眠，只要`time.sleep()`方法，在`sleep`中直接传参具体的数字即可实现等待。而`Golang`中略微蛋疼，比如我们要按微秒来休眠，则要这样：
`time.Sleep(time.Duration(iTime-iLastTime) * time.Millisecond)`

如果是要休眠秒，则需要乘以`time.Second`。使用起来略微麻烦

* 其他

`Golang`的命名规范是驼峰式命名，而`Python`则建议以蛇形命名。

要定义变量并赋值，使用语法`a := 1`，如果要赋值的是函数的返回值，则直接使用`a = 1`即可，在定义了返回值就表示变量已经被声明了。

`Golang`的注释是放在函数名的上方，而`Python`是放在函数体内。



