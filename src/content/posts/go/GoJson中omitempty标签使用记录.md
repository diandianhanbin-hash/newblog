---
title: "GoJson中omitempty标签使用记录"
publishedAt: "2021-02-20T20:26:11+08:00"
categories: ["Go"]
tags: ["Go"]
path: "/go/GoJson中omitempty标签使用记录.html"
---

## 背景

我们在用`Go`的`struct`转`json`的时候，有时候会有一种需求，如果某个字段没有值了，我们就不转成`json`，这里就需要用到`omitempty`标签来标记这个字段。但是这里会有一些坑在里面。


## 常规操作

```
type Dog struct {
	Head string `json:"head,omitempty"`
}

func main() {
	d := Dog{Head: ""}
	s, _ := json.Marshal(d)
	fmt.Println(string(s))
}
```

如上所示，这样执行的结果，打出来的数据就是`{}`.`head`字段会被默认忽略，不转成`json`，类似定义`-`。区别就是定义成`-`一定不会转json，而定义了`omitempty`则是有值就转`json`，没有就不转。

## 保留默认空值

但是我们在某些时候，也需要保留默认的空值，例如0是有意义的，某个字段不赋值则不展示，赋值0，也是需要展示出来的。

```
type Response struct {
	Status int32 `json:"status,omitempty"`
}

func main() {
	d := Response{Status: 0}
	s, _ := json.Marshal(d)
	fmt.Println(string(s))
}
```

按照上面的写法，我们这样写的话，打出来的结果就是`{}`，而不是我们要的`{"status": 0}`

因此这里我们要改造一下，把这个值变成指针。

```
type Response struct {
	Status *int `json:"status,omitempty"`
}

func main() {
	ss := 0
	d := Response{Status: &ss}
	s, _ := json.Marshal(d)
	fmt.Println(string(s))
}
```

这样，打出来的数据就是`{"status": 0}`

## 自定义对象为空的处理

```
type Response struct {
	Status int `json:"status,omitempty"`
	Dtl    Dtl `json:"dtl,omitempty"`
}

type Dtl struct {
	A string
	B string
}

func main() {
	d := Response{Status: 1}
	s, _ := json.Marshal(d)
	fmt.Println(string(s))
}
```
如上代码所示，按照常规的写法，出来的结果就是`{"status":1,"dtl":{"A":"","B":""}}`

这显然不符合我们的预期。如果需要让自定义结构体的`omitempty`生效，定义类型的时候就需要定义成指针类型。上面的`Response`中的`Dtl`要定义成指针，`Dtl *Dtl`。


这样`omitempty`对自定义的结构体也能生效。

## 参考

[https://www.sohamkamani.com/golang/omitempty/](https://www.sohamkamani.com/golang/omitempty/)