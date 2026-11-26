---
title: "Gin增加全局告警"
publishedAt: "2020-12-17T11:26:11+08:00"
categories: ["Go"]
tags: ["Go","Gin"]
path: "/go/Gin增加全局告警.html"
---

## 背景

`Gin`框架是一个Go语言的Web框架，最近在用这个框架做开发，像实现一个类似之前[全局异常捕获和切面日志》](http://www.wengyb.com/python/Django开发博客（十五）——全局异常捕获和切面日志》.html) 这样的功能。好处就是可以快速的感知到代码运行过程中产生的问题。

## 错误原理

Go语言把错误分为几类: `不可恢复的异常`，`可恢复的异常`，`业务错误`。前两个是panic，第三个是错误码的形式。而根据Go语言的风格，发生非预期的情况下，不引发异常（也就是不执行panic）而是返回一个错误（码）通过错误（码）的层层传递。传递错误信息。因此我们在编码过程中，都是返回错误码，而不像Python这类，直接raise异常。

这里就涉及到一个点。错误码的设计。

## 错误码的设计

我们要设计一个错误码的规范。例如某框架的错误码，1000一下是系统异常。以上是业务错误。对于业务错误，我们是不需要捕获的，而对于系统异常，我们则需要获取这部分数据进行告警。

目前我们的设计：错误码0表示成功，90000以上属于系统异常。子系统的系统异常错误码是0～10000.因此，我们这里的设计就是获取到错误码在90000+或者0～10000之间的时候，发送告警信息，而其他错误码，则放过。

## 捕获时机

Gin框架也有类似Django的中间件的机制。官方文档参考[https://github.com/gin-gonic/gin#using-middleware](https://github.com/gin-gonic/gin#using-middleware)。

中间件的执行顺序也是一个顺序的执行，比如下面的代码：

```go
g := gin.Default()
g.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
g.Use(log.LoggerToFile())
g.Use(middleware.Auth())
g.Use(middleware.ReportToEs())
g.Use(middleware.SendWarning())
```

我们把告警捕获放到了最后引入。那么它就会最后执行。这个执行顺序需要注意。

## 告警的内容

告警的内容有一个原则，看到这个告警信息，你就能知道发生问题的地方，或者最起码，你要能够根据这个信息，进行问题的复现，否则告警将变得无意义。

我这里告警的信息报错：操作人、请求的url、请求的参数、返回的参数。

## 代码实现
代码实现放到最后，如果上面的原理你都理解了，可以自行设计，并不需要拘泥于我这里的代码。

```go
package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/gin-gonic/gin"
)

/**
* @Author: svenweng
* @Date: 2020/12/15 3:50 下午
* @website: http://www.wengyb.com
 */

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

type rspBody struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data string `json:"data"`
}

type reqInfo struct {
	FullPath string `json:"full_path"`
	ReqBody  string `json:"req_body"`
	RspBody  string `json:"rsp_body"`
	RspCode  int    `json:"rsp_code"`
	User     string `json:"user"`
}

func (r reqInfo) buildNotifyInfo() string {
	s := fmt.Sprintf(
		"# 请求异常请关注 \n请求地址：%s\n请求信息：%s\n返回信息：%s\n操作用户：%s",
		r.FullPath,
		r.ReqBody,
		r.RspBody,
		r.User,
	)
	return s
}

// Write 。。。
func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// CheckWarning  异步校验告警
func CheckWarning() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req reqInfo
		req.User = c.Request.Header.Get("UserName")
		req.FullPath = c.FullPath()
		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw
		reqData, _ := c.GetRawData()
		req.ReqBody = string(reqData)
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(reqData))
		c.Next()
		var r rspBody
		_ = json.Unmarshal(blw.body.Bytes(), &r)
		req.RspCode = r.Code
		req.RspBody = fmt.Sprintf("%+v", r)
		go asyncWarning(req)
	}
}

func asyncWarning(r reqInfo) {
	if r.RspCode > 90000 {
		conf.Notify.CallBatchNofity(r.buildNotifyInfo(), conf.NotifyKey)
	}
	if r.RspCode > 0 && r.RspCode <= 10000 {
		conf.Notify.CallBatchNofity(r.buildNotifyInfo(), conf.NotifyKey)
	}
}
```

这段代码需要注意的一个点是，gin在读取一次请求信息之后，这个请求信息就没了，也就是如果在中间件拿了请求信息，不做一个放回去的动作，业务代码就会拿不到请求参数，因此这里做了如下处理：

```go
blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
c.Writer = blw
reqData, _ := c.GetRawData()
req.ReqBody = string(reqData)
c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(reqData)) // 重要
```