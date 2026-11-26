---
title: "DeepSeek测试AI智能体使用总结"
publishedAt: "2025-03-28T20:13:54+08:00"
categories: ["AI"]
tags: ["Python","AI"]
path: "/ai/DeepSeek测试AI智能体使用总结.html"
---

# 背景
前段时间用DeepSeek写了个DeepSeek的测试智能体。上次只留了一个简单的demo，不具备代表性。本文把最近的使用情况以及优缺点做一个总结。

# 准备工作
这个在之前文章已经做了基本的描述，所有的能力都必须标准化。这是一个巨大的工作量，我大约做了两个星期，把一些零散的功能全部做了标准化。

**这个应该是所有想做AI智能体自动测试最大的阻碍，没有之一。**

# 写提示词看效果
我需要简单的介绍一下业务背景。我做的是广告相关的测试，也就是需要保证一条广告信息在终端能够正在的展示，比如图片显示正确，跳转正确等。在接口层面的表现就是图片的url，jump_url等数据要正常返回。

直接上脱敏后的测试用例。
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic.png)

基本上是完全的自然语言驱动的测试。下面是执行结果

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic%206.png)

# 常规做法
如果不是用AI来做，常规做法长什么样呢？这里我也直接上图。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic%201.png)

# 综合对比
从实际的结果来看，二者都能正常完成一个场景的测试。

相比于常规做法，AI智能体用的是自然语言驱动，看起来更直观，拓展的时候只需要有个语文水平正常的人就能够快速完成一条新测试用例的编写。而传统用例的写法则需要有一定的代码功底。

# 存在的问题

* 执行耗时长。
但AI智能体还是存在一些问题，比如执行效率及其低下，传统的方法在经过用例编写者思考后，形成的测试用例就是一个固定的流程，实际执行耗时基本都在妙级。而AI智能体执行测试，则每一步走需要实时思考，因此执行的步骤越多，执行耗时就越长。

比如我上图贴的例子，执行实际耗时需要246秒，基本上是处于一个不可用的时间。

* 存在幻觉
实际执行的过程中发现AI还是会出现挺多幻觉。比如下面这个case，我并没有提供PullAd这个工具，但提示词里面有“拉广告”

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic%2011.png)

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic22.png)

* 执行一半不继续执行
AI返回的文本中已经说明需要继续调用工具，但返回的结果中却给了终止的标记。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic%2024.png)

* 没有执行相应的工具，但告知已经执行完毕。
实际上CallMp方法并没有被调用，但AI的返回信息中告诉你它已经调用了。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic%2051.png)

* 上下文存储有限
代码执行过程中，内存基本上不可能被用完，但AI能够接受的Token是有限的，因此一旦步骤多，或者其中某一个步骤的返回信息过长时，询问AI就会失败。

在实际的场景中，我测试发现token过长时，并不会报错，就会莫名其妙的结束整个流程。

# 真人测试
不管缺点有多少，总归它能正常跑起来了，于是我找了几个平时经常测业务的同事，让他们用自然语言来描述一个拉广告的行为。反正我感觉想要把这些他们真实的想法变成真正可执行的用例，还有很长的一段路要走。

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/666.png)

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/777.png)

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/DeepSeek%E6%B5%8B%E8%AF%95AI%E6%99%BA%E8%83%BD%E4%BD%93%E4%BD%BF%E7%94%A8%E6%80%BB%E7%BB%93/Pasted%20Graphic%2091.png)

# 后续拓展
AI智能体真的投入使用确实还有一些问题要解决，比如AI的实时思考过程是否可以固化下来，在智能体的端上固化思考过程，避免每次需要大量时间思考。

开发一个系统配合智能体做上下文存储，避免大量的上下文信息在询问的message中重复出现，导致过多无意义的思考。

当然，还有人的问题要解决，每个人不能有太多的思考空间，思维得限制在有限的空间内。例如每个工具配套那么几句话。写用例的时候不让他们打字，直接勾选看起来像的哪一个步骤就好了。

不过话说回来，这样的做法到底是AI驱动，还是人驱动？
