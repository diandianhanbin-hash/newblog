---
title: "从零到一学习Flutter——（一）布局"
publishedAt: "2023-02-08T22:41:16+08:00"
categories: ["Flutter"]
tags: ["Flutter"]
path: "/flutter/从零到一学习Flutter——（一）布局.html"
---

## 环境

开发机器：Mac

```
$ flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.7.1, on macOS 13.1 22C65 darwin-arm64, locale
    zh-Hans-CN)
```

安装环境的流程就不重复写了，可以参考官方文档进行安装。

## 第一个应用

我们直接用`flutter create testapp`命令就可以直接创建一个工程。

工程里面，我们目前编码用到的就是`lib`文件夹下的`main.dart`。

删了所有内容，只保留以下内容：

```
void main() {
  runApp(const Center(
    child: Text("Hello world"),
  ));
}
```

`Flutter`是可以支持跨平台的，因此运行的时候可以根据需要指定运行的平台。

```
$ flutter run
Multiple devices found:
macOS (desktop) • macos  • darwin-arm64   • macOS 13.1 22C65 darwin-arm64
Chrome (web)    • chrome • web-javascript • Google Chrome 109.0.5414.119
[1]: macOS (macos)
[2]: Chrome (chrome)
Please choose one (To quit, press "q/Q"): 2
```

我这里以`web`的形式运行。

理论上这样运行就能看到一个网页打开，中间出现`Hello World`字样。

## 布局说明

`Flutter`的布局核心机制是`widgets`。其实简单说起来类似`html`里面的盒模型。也是一层包一层的方式来进行布局。

举个例子，微信最下方的导航页面。可以用一个`Container`来表示。`Container`里面带有一个`Row`，这个`Row`包含了4个`Column`，每个`Column`包含了一个`Icon`和一个文本。

如下图所示：
![结构关系](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/2023-02-08_11-21-29.png)

再Flutter中，每一个组件都对应一个widget，而要调整样式，则是调整这个widget中的属性。

下面代码是一段关于按钮的`widget`，如果我们要调整按钮的样式，则是在`style`里面进行调整，如果要添加按钮的事件，则是在`onPressed`里面添加方法。

```dart
class EgContainer extends StatelessWidget {
  const EgContainer({super.key});
  @override
  Widget build(BuildContext context) {
    return const TextButton(
        onPressed: null,
        child: Text(
          "环境",
          style: TextStyle(color: Colors.white),
        ));
  }
}
```

## 理解widget
`Flutter`主要有两种类型的`StatelessWidget`和`StatefulWidget`。顾名思义，一个是有状态的，一个是无状态的。

### 无状态的StatelessWidget
`StatelessWidget`是`Flutter`中的一种可复用小部件，它不维护任何状态，也不会在渲染期间改变。 `StatelessWidget`不会响应任何用户输入或发出任何事件，并且只是渲染一次，因此通常用于显示静态内容，如用户界面布局中的标签、图像或文本。

### 有状态的StatefulWidget
`StatefulWidget`是一种可改变自身状态的`widget`，它有状态可供外部访问，而且状态可以随时间改变。

举个例子，一个按钮组件在点击下之后，除了执行必要的逻辑之外，还得把自身设置成不可点击，并给出一个`loadind`的提示。当逻辑执行完毕之后，需要把按钮状态重置回正常状态。这种场景下，就涉及到了按钮自身状态的变动。

`StatefulWidget`类回对应一个`State`类，这个`State`类就是维护状态变动的关键。要理解这个类，就必须关注它的生命周期。

`State`生命周期包括以下几个阶段：

1. 创建（launched）：当`statefulWidget`被实例化时，会调用`createState()`方法来创建状态对象，该对象会被保存在`widget`的`state`属性中，以便在构建`widget`时使用。

2. 初始化（initState）：创建完状态对象后，会调用`initState()`方法，这个方法在首次构建`widget`时只会被调用一次，用于初始化变量等操作。

3. 构建（build）：当`widget`需要构建时，会调用`build()`方法，此方法会根据最新的状态来构建界面。

4. 更新（didUpdateWidget）：当`widget`的状态发生变化时，会调用`didUpdateWidget()`方法，这个方法会在构建界面之前被调用，用于执行当前状态到新状态的转换操作。

5. 销毁（dispose）：当widget被销毁时，会调用`dispose()`方法，用于销毁资源等操作。

官方给了一个比较清楚的生命周期图。
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/2023-02-08_16-20-38.png)

## 布局方式

`Flutter `布局方法有：

1、线性布局：它将控件沿水平或垂直方向排列，可以利用`Row`和`Column`组件来实现线性布局。线性布局可以帮助开发者更方便的控制控件的排列方式，实现页面布局，并且可以更加灵活地定义控件的大小和位置。

2、层叠布局：用于在一个视图中展示多个组件。它使用堆叠（`Stack`）布局，将一个组件（比如图片）放在另一个组件（比如文本）的正上方，可以在Z轴上任意调整元素的顺序，也就是谁在谁的上面。

3、弹性布局：它使用类似于`Flexbox`的思想来定义子部件之间的关系，使布局更加灵活，可以在不同的尺寸的设备上实现可缩放的用户界面。它使用`Flexbox`的概念，如果给子部件定义了对应的空间权重，则它们将会自动地占据剩余的空间。

4、流式布局：它将组件以及它们之间的空间按照一定的方向流动布局。它可以帮助你快速实现从左到右或者从上到下等方向上的布局，而不用去计算每个组件的位置。流式布局还可以帮助你轻松的实现复杂的布局，例如灵活的列表、网格布局等等。

## 小结
有一定`web`基础来写`Flutter`的布局应该是比较容易的了。基本理念都差不多，`Flutter`遵循`Flex规范`，因此非常容易上手。
更多详细的布局，可以参考[官方手册](https://flutter.cn/docs/development/ui/layout#stack)
