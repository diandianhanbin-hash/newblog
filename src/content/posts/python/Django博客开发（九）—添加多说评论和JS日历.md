---
title: "Django博客开发（九）—添加多说评论和JS日历"
publishedAt: "2016-03-01T14:36:46+08:00"
categories: ["Python"]
tags: ["Python","Django","博客"]
path: "/python/Django博客开发（九）—添加多说评论和JS日历.html"
---

## 背景
`MacBook`的数据被抹去之后，我又重写了一个博客，同样是用现成已有的前端模板写的。这次我只要一个简洁的功能就行了，太复杂很多功能用不到，毫无意义。这次的博客我多加了两个功能，一个是多说的评论框，另一个是日历。另外，我把自己的公众号的二维码也一起放上去了。

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7 

IDE：PyCharm

***

## 为什么要评论框
其实我的博客PV很低，不过再怎样也应该有一个可以评论的地方，虽然没几个人会起来折腾。
评论框的用处有两个，一个在文章底部，另一个是留言板，所以这次的博客专门加了留言板的页面。

## 多说
首先必须要注册一个多说的账号，[点击这里](http://duoshuo.com)，注册成功之后，在后台管理中的工具可以找到通用代码，这段代码就是一个js的代码，嵌入到你的文章就行了。当然，多说还专门为python做了一个SDK，两种方法都可以实现。

## Js代码实现
公用代码如下：

```python
<!-- 多说评论框 start -->
	<div class="ds-thread" data-thread-key="请将此处替换成文章在你的站点中的ID" data-title="请替换成文章的标题" data-url="请替换成文章的网址"></div>
<!-- 多说评论框 end -->
<!-- 多说公共JS代码 start (一个网页只需插入一次) -->
<script type="text/javascript">
var duoshuoQuery = {short_name:"自动生成"};
	(function() {
		var ds = document.createElement('script');
		ds.type = 'text/javascript';ds.async = true;
		ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js';
		ds.charset = 'UTF-8';
		(document.getElementsByTagName('head')[0] 
		 || document.getElementsByTagName('body')[0]).appendChild(ds);
	})();
	</script>
<!-- 多说公共JS代码 end -->
```

其实代码里面说的也很详细的，你只要在文章的底部，在body标签内放上这段代码，然后把div中的几个东西改一下就可以了。

```python
<div class="ds-thread" data-thread-key="lm" data-title="留言板" data-url="{% url 'message' %}"></div>
```

我的留言板的代码，其实留言板你就当成是一篇文章就行了。文章内部的代码如下：

```python
<div class="ds-thread" data-thread-key="{{ article_view.id }}" data-title="{{ article_view.blog_title }}" data-url="{% url 'article' article_view.id %}"></div>
```

只要这样配置好之后，再重新打开网页，你就会发现网页下方多了一个多说评论框。

## 多说SDK
SDK的原理其实就是在Django中多安装一个应用，[Python-SDK的说明文档](http://dev.duoshuo.com/python-sdk)已经把相关信息说的很清楚了。我没有使用这个方法，因为JS代码已经非常灵活了，没必要再单独使用SDK。

## 多说后台
在多说后台里面可以管理很多东西，包括评论过滤，评论框的主体，允许图片等等，还可以导出评论。当然，我的blog基本上没什么人关注，所以不会有太多人来留言。

## 多说分享
多说的后台里面多了一个分享的功能，代码如下：

```python
<div class="ds-share" data-thread-key="此处请替换为当前文章的thread-key" data-title="此处请替换为分享时显示的标题" data-images="此处请替换为分享时显示的图片的链接地址" data-content="此处请替换为分享时显示的内容" data-url="此处请替换为分享时显示的链接地址">
    <div class="ds-share-inline">
      <ul  class="ds-share-icons-16">
      	
      	<li data-toggle="ds-share-icons-more"><a class="ds-more" href="javascript:void(0);">分享到：</a></li>
        <li><a class="ds-weibo" href="javascript:void(0);" data-service="weibo">微博</a></li>
        <li><a class="ds-qzone" href="javascript:void(0);" data-service="qzone">QQ空间</a></li>
        <li><a class="ds-qqt" href="javascript:void(0);" data-service="qqt">腾讯微博</a></li>
        <li><a class="ds-wechat" href="javascript:void(0);" data-service="wechat">微信</a></li>
      	
      </ul>
      <div class="ds-share-icons-more">
      </div>
    </div>
 </div>
```

我还没有使用，只是看到了，等有时间使用的时候再做一下相关分享吧。

## JS日历
JS日历其实是一个很简单的东西，网络上现成的代码很多，翻一番拿来改一下就行了，下面是我copy的代码：

```python
/**
 * Created by SvenWeng on 16/2/28.
 */
function montharr(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11) {
    this[0] = m0;
    this[1] = m1;
    this[2] = m2;
    this[3] = m3;
    this[4] = m4;
    this[5] = m5;
    this[6] = m6;
    this[7] = m7;
    this[8] = m8;
    this[9] = m9;
    this[10] = m10;
    this[11] = m11;
}
function calendar() {
    var monthNames = "JanFebMarAprMayJunJulAugSepOctNovDec";
    var today = new Date();
    var thisDay;
    var monthDays = new montharr(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    year = today.getYear();
    thisDay = today.getDate();
    if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) monthDays[1] = 29;
    nDays = monthDays[today.getMonth()];
    firstDay = today;
    firstDay.setDate(1); // works fine for most systems
    testMe = firstDay.getDate();
    if (testMe == 2) firstDay.setDate(0);
    startDay = firstDay.getDay();
    document.write('<table border="0" width="100%" cellspacing="0" cellpadding="2" align="CENTER" bgcolor="#0080FF">');
    document.write('<TR><TD align="center">');
    document.write('<table border="0" width="100%" cellspacing="1" cellpadding="2" bgcolor="Silver">');
    document.write('<tr><th colspan="7" bgcolor="#C8E3FF">');
    var dayNames = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
    var monthNames = new Array("一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月");
    var now = new Date();
    document.write('<font class="today">' + today.getFullYear() + "&nbsp;" + monthNames[now.getMonth()] + now.getDate() + "日&nbsp;" + dayNames[now.getDay()] + "</FONT>");
    document.write('</TH></TR><TR><TH class="thead">日</FONT></TH>');
    document.write('<TH class="thead">一</TH>');
    document.write('<TH class="thead">二</TH>');
    document.write('<TH class="thead">三</TH>');
    document.write('<TH class="thead">四</TH>');
    document.write('<TH class="thead">五</TH>');
    document.write('<TH class="thead">六</TH>');
    document.write("</TR><TR>");
    column = 0;
    if (startDay > 0) {
        document.write('<td colspan="' + startDay + '" bgcolor="#ffffff"></td>')
    }
    column += startDay;
    for (i = 1; i <= nDays; i++) {
        if (i == thisDay) {
            document.write('</TD><td align="CENTER" bgcolor="#76d2c5"><FONT class="whiteword"><B>')
        }
        else {
            document.write('</TD><TD BGCOLOR="#FFFFFF" ALIGN="CENTER"><FONT class="nday">');
        }
        document.write(i);
        if (i == thisDay) document.write("</FONT></TD>")
        column++;
        if (column == 7) {
            document.write("<TR>");
            column = 0;
        }
    }
    if (column < 7) {
        document.write('<td colspan="' + (7 - column) + '" bgcolor="#ffffff"></td>');
    }
    //document.write('<TR><td colspan="3" align="right" valign="bottom">');
    //document.write('<font class="whiteword"><b>现在时间</b></font></td><td valign="bottom" colspan="4">');
    document.write('<div id="clock" class="clock"></div>');
    document.write('</TD></TR></TABLE></TD></TR></TABLE>');
}

```

在首页中引用一下就行了：

```python

<div class="box">
	<script language="javascript">
		calendar();
		startclock();
	</script>
</div>
                        
```