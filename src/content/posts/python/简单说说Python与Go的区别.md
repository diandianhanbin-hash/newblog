---
title: "简单说说Python与Go的区别"
publishedAt: "2018-06-21T17:24:05+08:00"
categories: ["Python"]
tags: ["Python","Go"]
path: "/python/简单说说Python与Go的区别.html"
---

## 背景
工作中的主力语言是`Python`，今年要搞性能测试的工具，由于`GIL锁`的原因，`Python`的性能实在是惨淡，需要学一门性能高的语言来生成性能测试的压力端。因此我把目光放在了现在的新秀`Go`。经过一段时间的学习，也写了一个小工具，记一下这两个语言的区别。

## 需求
工具是一个小爬虫，用来爬某网站的某个产品的迭代记录，实现逻辑就是运行脚本后，使用者从命令行输入某些元素（产品ID等）后，脚本导出一个Excel文件出来。

最初的版本是用`Python`写的，30行代码不到就搞定了。这次用`Go`重写，代码量在110行左右。

## 接受输入
第一步就是接受命令行的输入内容，工具要给非技术人员用的，弄一个`CLI`不太合适，要的效果就是一行一行的输入内容，用`Python`实现起来非常容易，像这样：

```python
app_id = raw_input('请输入app_id: ')
app_analysis = raw_input('请输入analysis: ')
```
执行后就是一行一行的往下走，但是用`Go`就有点蛋疼了，完整的代码如下：

```go
func getPara() (string, string) {
	var i = 0
	var appId, analysis string
	fmt.Print("请输入appId：")
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		text := scanner.Text()
		if i == 0 {
			appId = text
			fmt.Print("请输入analysis：")
		} else if i == 1 {
			analysis = text
			fmt.Print("程序初始化数据完毕。。。。请按任意键继续")
		} else {
			break
		}
		i++
	}
	return appId, analysis
}
```

`Go`要实现`CLI`很方便，但是涉及到这种一行一行的输入，要一直监听`Scan()`，所以就有了上面蛋疼的循环处理，而且在必须要先打印信息，再来监听内容，总体的写的过程很恶心，也许是没有找到更好的方法吧，实在是太逆天了。

## 发送请求
在发送请求方便，两种语言倒是差别不太大，至少我写的`Get`请求是这样的。

```python
Python
params = {
	"analysis": app_analysis,
	"appid": app_id,
	"country": 'cn'
}
r = requests.get(url, params)
```


```go
Go
q := req.URL.Query()
q.Add("appid", appId)
q.Add("analysis", analysis)
q.Add("country", "cn")
req.URL.RawQuery = q.Encode()
var resp *http.Response
resp, _ = http.DefaultClient.Do(req)
```

## 返回结果处理
在返回结果的处理上，`Python`的处理方式简直是太友好了，直接调用`json`就处理了。

```python
result = r.json()
```

但是`Go`就有点蛋疼了，由于是静态语言，所以解包数据的时候需要先定义数据格式，比如返回的内容必须要先做如下的结构定义：

```go
type ResultInfo struct {
	Code    int
	Msg     string
	Version []VersionInfo
}

type VersionInfo struct {
	Version     string `json:"version"`
	ReleaseTime string `json:"release_time"`
	ReleaseNote string `json:"release_note"`
	AppName     string `json:"app_name"`
	SubTitle    string `json:"subtitle"`
}
```

第一个`ResultInfo`是返回的数据，其中的`Version`也是一个数组对象，所以还要再定义一个数组对象，这样才能调用方法来解包处理。

```go
body, _ := ioutil.ReadAll(resp.Body)
var rst = ResultInfo{}
if err := json.Unmarshal(body, &rst); err != nil {
	fmt.Println(err)
}
```

## 写数据到Excel
这部分调用的都是第三方库，所以没什么可比性，代码的实现完全依赖于第三方包。

## 无所不在的err != nil
`Go`的异常捕获机制跟`Python`或者`Java`都不一样，`Python`的异常捕获使用的是`try，except`来包裹代码块，而`Go`用的是一个`error`对象，所以所有的`Go`代码都会充斥着大量的

```go
if err != nil {
		return nil, err
	}
```

这种鬼东西，这种异常机制在阅读代码的时候，非常恶心，极大的影响了阅读体验。

## 吐槽完后
基本上从书写代码的过程来看，`Python`的编码效率比`Go`高出了很多很多，`Go`号称语法灵活，可以极大的提高编码效率，实际上并没有，受限于静态语言，相比于`Python`这种动态语言来说，编码效率的差距还是非常大的。只能说比其他静态语言编码效率高。

但是！！！

`Go`的效率比`Python`高了太多。举个例子，有一个计算斐波那契数的算法，`Go`的实现如下：

```go
func main() {
	const n = 40
	starttime := time.Now()
	fibN := fib(n)
	endtime := time.Now()
	cost_time := endtime.Sub(starttime)
	fmt.Println(cost_time)
	fmt.Printf("\rFibonacci(%d) = %d\n", n, fibN)
}

func fib(x int) int {
	if x < 2 {
		return x
	}
	return fib(x-1) + fib(x-2)
}
```

很简单的一个递归，当N为40的时候，`Go`花了大概1秒左右的时间，执行结果如下：

```
876.838ms（消耗时间）
Fibonacci(40) = 102334155
```

我们换成`Python`


```python
def fib(x):
	if x<2:
		return x
	return fib(x-1)+fib(x-2)

if __name__ == '__main__':
	import time
	begin = time.time()
	print fib(40)
	end = time.time()
	print end-begin
```

一样的执行逻辑，执行的结果却是：

```
102334155
52.8657081127（消耗时间）
```

WTF!!! 用`Go`来处理效率是`Python`的50倍以上。

还没完，工具写完了总是要给人用的吧，`Python`写完之后，如果给一个非技术人员使用，那么。。。

```
使用者：要怎么用？
我：你装一下Python，然后配好环境变量，顺便把requests库和xlwt库也装一下。
我：要装这两个库你要先装一下pip。
使用者：黑人问号脸！！！！！
```

如果你用`Go`来写，打包完发过去就行了

```
使用者：要怎么用？
我：你双击一下，让你输入什么就输入什么
```

如果使用者是用`Windows`系统，那也没问题，

`CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build xxx.go`

直接打包成`exe`文件。


