---
title: "从零到一学习Flutter——（二）状态和路由"
publishedAt: "2023-02-09T22:41:16+08:00"
categories: ["Flutter"]
tags: ["Flutter"]
path: "/flutter/从零到一学习Flutter——（二）状态和路由.html"
---

## 背景

前文提到了`Widget`的状态，在`Flutter`中一切都是`Widget`，那么由`Widget`组成的页面，会有很多复杂的父子关系，要想交互友好，则需要这些`Widget`进行通讯，也就是所谓的状态管理。

同时在了解了布局之后，我们会写出很多的页面，那么在这些页面切换，也是一个很重要的能力。

因此本文主要介绍`Flutter`中的状态管理和路由管理。

## 状态管理

除了`Widget`本身自己管自己之外，大致有这么几个类别：父管理子，事件总线，全局状态。

### 自身状态管理

这个其实没啥好说的，用`StatefulWidget`就可以直接实现自身的状态管理。

### 父管理子

这算是一种比较常见的管理方式，通过子Widget内部事件的触发，通过回调函数通知父`Widget`，再根据父`Widget`的逻辑处理之后，触发子`Widget`的`build`实现了父管理子。


### 混合管理

除了上面的方法之外，还能通过`Provider`这种状态管理框架来进行统一的状态管理。它可以让子`Widget`访问父`Widget`的状态，并且可以让子`Widget`访问多个父`Widget`的状态，从而实现父子通讯。

### 全局管理

我们上面说的情况更多是在一个组件内部，如果涉及到跨组件甚至跨路由的管理，这些方式就不适用了。

* 事件总线

通过`initState`订阅事件的方式，来统一管理状态是一种比较可靠的全局管理方式

* 状态管理包

例如`Redux`这类包可以帮助我们做全局的管理。

## 路由管理

`Flutter`提供了两种路由管理的方式，直接指定导航和名字导航。

### 直接指定导航
也就是直接指定一个跳转的页面，通过`Navigator.push`方法实现页面的跳转，实例代码如下：

```dart
TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) {
                    return NewRoute();
                  }),
                );
              },
              child: Text("OpenRoute"),
            ),

...


class NewRoute extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("newRoute"),
      ),
      body: Center(child: Text("this is new route")),
    );
  }
}
```

上面的代码直接跳转到了`NewRoute`页面。这里使用了`Flutter`提供的`MaterialPageRoute`来实现的跳转。

`MaterialPageRoute`是`Flutter`中的一个路由组件，它可以用来实现页面跳转，并且可以携带参数。它可以让你在不同的页面之间进行跳转，并且可以在跳转的过程中传递参数，从而实现页面之间的数据传递。

### 名字导航

名字导航应该是我们比较常用的方式了，我们需要维护一个路由表，维护路由名字和对应实现的映射关系。

实现起来也非常简单，我们只需要在`MaterialApp`里面维护这个路由即可。调用的时候直接使用名字。

```dart
routes: {
          "new_page": (context) => NewRoute(),
        }

...

调用代码
onPressed: () {
                // Navigator.push(
                //   context,
                //   MaterialPageRoute(builder: (context) {
                //     return NewRoute();
                //   }),
                // );
                Navigator.pushNamed(context, "new_page");
              },
```

### 参数传递

`Flutter`提供了`Navigator`类来处理路由，可以在两个页面之间传递参数：

1. 使用`pushNamed`方法时，可以传入一个`Map`类型的参数，这种方式常用于静态参数传递：

```dart
Navigator.pushNamed(context, 'routeName', arguments: {'id': 123});
```

2. 使用`push`方法时，可以传入一个`Object`类型的参数，这种方式常用于动态参数传递：

```dart
Navigator.push(context, MaterialPageRoute(builder: (context) {
  return MyRoute(arguments: myObject);
}));
```

3. 使用`pushReplacementNamed`方法时，可以传入一个`Map`类型的参数，这种方式常用于替换当前页面的参数传递：

```dart
Navigator.pushReplacementNamed(context, 'routeName', arguments: {'id': 123});
```

4. 使用`pushReplacement`方法时，可以传入一个`Object`类型的参数，这种方式常用于替换当前页面的动态参数传递：

```dart
Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) {
  return MyRoute(arguments: myObject);
}));
```

另外，`Flutter`还提供了一个`RouteSettings`类，可以通过设置`RouteSettings.arguments`来传递参数：

```dart
Navigator.pushNamed(context, 'routeName', settings: RouteSettings(arguments: {'id': 123}));
```

接收参数也非常简单，路由可以通过构造函数接收参数，可以使用 `MaterialPageRoute` 或 `CupertinoPageRoute` 的 `builder` 函数接收参数，也可以使用 `Navigator` 的 `pushNamed` 方法接收参数，这种方法可以通过 `ModalRoute` 的 `settings.arguments` 属性接收参数。

```dart
@override
  Widget build(BuildContext context) {
    //获取路由参数  
    var args=ModalRoute.of(context).settings.arguments;
    //...省略无关代码
  }
```

### 路由选型

名字路由可以让开发者更轻松地管理路由，更容易跟踪，并且可以更容易地重新组织路由。使用名称路由可以使应用的维护更容易，也可以防止路由不断增加而导致的混乱。同时，使用名称路由可以使代码更清晰，更容易阅读和理解。

但是从官方文档的描述来看，并不建议使用名字路由。

>Although named routes can handle deep links, the behavior is always the same and can’t be customized. When a new deep link is received by the platform, Flutter pushes a new Route onto the Navigator regardless where the user currently is.
Flutter also doesn’t support the browser forward button for applications using named routes. For these reasons, we don’t recommend using named routes in most applications.

开发者可以根据实际情况进行选型。

### 路由钩子

换种说法，也叫路由守卫，也就是我们在进行页面切换的时候，经常会有一些全局的东西需要进行校验，例如用户的登录态，这种通用的逻辑，在每个页面都写一次明显不合理，因此就可以利用路由钩子来做这种通用的逻辑。

在`MateralApp`里面添加`onGenerateRoute`方法，进行钩子逻辑的添加。并且可以根据不同的路由添加不同的方法。

```dart
onGenerateRoute: (RouteSettings settings) {
        return MaterialPageRoute(builder: (context) {
          var routeName;
          routeName = settings.name;
          print(routeName);
          return MyHomePage(title: "title");
        });
      },
```