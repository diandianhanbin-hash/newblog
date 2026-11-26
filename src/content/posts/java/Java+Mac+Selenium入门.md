---
title: "Java+Mac+Selenium入门"
publishedAt: "2016-07-03T13:24:10+08:00"
categories: ["Java"]
tags: ["Java","Selenium"]
path: "/java/Java+Mac+Selenium入门.html"
---

## 背景
最近在看Java的一些基础知识，因为Selenium是支持各种语言的，所以我想用java+Selenium来试水一下，虽然Mac也是可以正常的支持Java和Selenium，但是实际操作起来，有那么些不同，这些不同就会导致刚开始根本进行不下去，我也花了差不多1小时左右才正式跑通Demo。说实话，网络上关于Mac+Java+Selenium的说明实在是太少了。

## 环境

***
版本相关 

操作系统：Mac OS X EI Caption 

IDE：Eclipse

***

## 与Python的区别
我们都知道，用Python来跑同Selenium真的太简单了，使用Pip安装好Selenium，然后直接引入就可以使用了，但是Java不同，Java要先导入架包，然后初始化`driver`路径，然后才是正常的书写。

## 配置环境

### 下载架包

JDK那些我就不多说了，去Selenium官网上下架包，需要下三个文件。

```
|____selenium-java-2.53.0-srcs.jar
|____selenium-java-2.53.0.jar
|____selenium-server-standalone-2.53.0.jar
```

对，是三个文件，最后一个`selenium-server-standalone-2.53.0.jar`是非常关键的，因为导入架包就是要导入这个东西。

### eclipse配置架包

![buildpath](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976657909361.jpg)

### 引入架包

导入成功之后，需要在代码中引用`Selenium`包和驱动，我使用的是Chrome来执行，因此我的引入代码是这样的：

```java
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
```

### 初始化`Driver`

在代码中，我们需要初始化`Driver`，方法如下：

```java
System.setProperty("webdriver.chrome.driver", "/Users/SvenWeng/PycharmProjects/chromedriver");
```

第一个参数，你使用chrome就这样写，没啥好纠结的。第二个参数是你的chromedriver的路径。

* 源码的处理

```java
    public static String setProperty(String key, String value) {
        checkKey(key);
        SecurityManager sm = getSecurityManager();
        if (sm != null) {
            sm.checkPermission(new PropertyPermission(key,
                SecurityConstants.PROPERTY_WRITE_ACTION));
        }

        return (String) props.setProperty(key, value);
    }
```

实际上是一个代理的过程。

## 正常的逻辑代码
在写正常的逻辑代码的时候，我又感觉到了java的面向对象设计——一些都是对象。用`Python`写的时候并没有这么强烈的感觉。不多说了，上完整的代码。

```java
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;

public class SearchSelenium{
	public static void main(String[] args){
		System.setProperty("webdriver.chrome.driver", "/Users/SvenWeng/PycharmProjects/chromedriver");
		
		WebDriver driver = new ChromeDriver();
		driver.get("http://youdao.com");
		WebElement element = driver.findElement(By.id("translateContent"));
		element.sendKeys("selenium");
		element.submit();
		driver.quit();
	}
}
```

## 最后
同样，应该算是一个科普贴吧，用Mac上手Java+Selenium的朋友可以参考一下，本文没有很深的学习内容，仅作为一个入门的知识科普，希望刚入门的可以少走弯路。
