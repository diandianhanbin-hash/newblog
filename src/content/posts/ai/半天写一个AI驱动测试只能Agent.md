---
title: "用DeepSeek半天上架一个小程序"
publishedAt: "2025-03-12T20:13:54+08:00"
categories: ["AI"]
tags: ["Python","AI"]
path: "/ai/半天写一个AI驱动测试只能Agent.html"
---

# 总结
官话： AI驱动测试智能Agent

人话：一个脚本循环调用AI的接口。

实现难度不大，代码能力在线的话半天足够，但真正跑起来则需要有足够强大的工程能力支持。

# 常规测试理论
在测试这个行业，有一些常见的测试理论，例如DDD，DDT，BDT，MBT等等。都是常规的工程能力实现了XX驱动测试的能力。

举个例子，MBT（Model-Based Testing）的实现大概是下面几步。

1. 创建一个测试模型，常见的就是话一个UML模型。

2. 根据这个模型的线生成行为，点形成状态。

3. 通过算法生成不同的路径

4. 把不同路径用代码表示出来，然后执行这些代码。

这就是典型的工程化测试提效的方案，所有的步骤都高度结构化。在状态机相关的测试场景中有非常优秀的表现。

缺点也非常明显，UML建模后生成的路径存在大量重复，需要对生成的路径进行剪枝，否则生成的用例无穷无尽。同时要用代码把这些行为表示出来，对于整个测试代码的标准化要求极高。

# 测试代码标准化

我用伪代码表达一个常见的自动化脚本有如下行为：

```
Env Setup
Case1: Setup
Case1: GetEnvInfo
Case1: BuildRequestData
Case1: CallServer
Case1: GetServerResponse
Case1: AssertResult
Case1: Teardown
Case2: …
Env Teardown
```

理论上是这样，但是实际上自动化代码不可能会写的这么规整，一定会存在大量的if-else，for等奇奇怪怪的代码。这就导致了没办法用一个函数表示一个行为。

如果没有做到这么极致的标准化，即使用UML把整个模型建出来，也无法生成可执行的代码。

这个问题也就导致了绝大部分团队无法实现XX驱动测试。


# 建模
不管哪个测试理论，都设计到建模的问题，也就是一定做一个结构化的模型出来，可以是UML，也可以是其他，但这个建模的过程不可能省去。

比如这样一个场景：“对100和500两个数求和，结果再和5求积”。想要自动化实现这个过程，首先就需要进行建模。我也用伪代码表示出来

```
func_list = [
{"name”: “sum”, “number_one”: 100, “number_two”: 500},
{"name”: “multiplication”, “number_one”: {result of sum}, “number_two”: 5}
]
For x in func_list:
    do(“name”)
```

这个建模的过程就很麻烦，一般来说设计的太抽象，使用者会一脸懵逼，如果设计的太简单，适配的场景非常局限。


# AI驱动测试
AI驱动测试解决了什么问题呢？其实解决的是建模的过程。

还是上面的例子，“对100和500两个数求和，结果再和5求积”。

我把这句话扔给AI，让他以结构化的方式给我返回可执行的步骤，我再根据结构化的可执行步骤顺序执行即可。

这样的流程就以简单的方式代替了传统的建模。但这样一次性生成所有步骤的方式不具备变数，如果想让它更强大一点，可以参考AI本身的思考方式。

大语言模型（LLM）在回答我们提的问题时，并不是全部想好之后一次性回答，而是一个token一个token的生成，也就是我们在网页或者APP上看到的打字机的效果。

因此我们可以换一种方式建模，把要实现的场景告诉它之后，让AI每次只返回一个行为，我们的智能体执行完这个行为后告诉AI，让AI把下一次的行为告诉智能体，以此往复，直到所有步骤都执行完毕后，这个场景都算结束了。

用一个流程图表示大概是这样：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/Pasted%20Graphic.png)


智能体第一次带场景询问：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/Pasted%20Graphic%201.png)

AI返回第一步行为：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/%E6%89%A7%E8%A1%8C%E7%9A%84%E7%AC%AC%E4%B8%80%E6%AD%A5.png)

智能体第二次询问：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/Pasted%20Graphic%203.png)

AI第二次返回：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/Pasted%20Graphic%204.png)

智能体第三次询问：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/Pasted%20Graphic%205.png)

AI第三次返回，告知执行完毕：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/Pasted%20Graphic%206.png)

最终输出报告：
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/Pasted%20Graphic%207.png)

# 工具标准化
可以看到，整个智能体需要按照AI返回的指令执行响应的代码，这就需要保证所有逻辑必须要做到标准化，不能是零散的代码。

并且每个工具需要包含详细的说明。

比如上面智能的的其中一个工具实现代码如下：

```python
class TwoNumSum:
    name = "TwoNumSum"  # 工具唯一标识

    def __init__(self):
        self.parameters = {
            "num_one": {
                "type": "int",
                "description": "数字1",
                "required": True  # 标记为必填参数
            },
            "num_two": {
                "type": "int",
                "description": "数字2",
                "required": True
            }
        }
        self.description = "对两个数求和"

    def execute(self, num_one: int, num_two: int):
        print(num_one, num_two)
        return [num_one + num_two]
```

# 最后
可以看到不管理论如何发展，最终想要实现，都必须依赖强大的工程能力。在本文的例子中，如果团队有为MBT这些做过工具的标准化，那么AI这阵到来的时候，实现它就是水到渠成的事。

但当今社会，浮夸居多，真正能沉下心来做事的又有多少？