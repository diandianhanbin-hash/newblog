---
title: "JS实现回到顶部按钮"
publishedAt: "2016-06-30T21:19:40+08:00"
categories: ["大前端"]
tags: ["js"]
path: "/web/JS实现回到顶部按钮.html"
---

## 一
今天在写我的测试工具箱，我突然发现一个问题，好像所有页面都存在这样的问题：页面内容过长导致想要返回页面顶部的时候非常麻烦，所以我想通过JS来实现一个返回顶部的按钮。

## 二
当然，作为半桶水的JS开发人员，让我自己写肯定是完不成的，那么就应该好好的使用Google和百度。

在我找的过程中我发现有很多方法，不过看起来都很花哨，我只想要一个最简单的方法。

## 三
最后还是我旁边的前端开发给了我结果，代码如下，做一个记录。

```js
<script>
    $(function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() != 0) {
                $("#toTop").fadeIn();
            } else {
                $("#toTop").fadeOut();
            }
        });
        $("body").append("<div id=\"toTop\" style=\"border:1px solid #444;background:#333;color:#fff;text-align:center;padding:10px 13px 7px 13px;position:fixed;bottom:10px;right:10px;cursor:pointer;display:none;font-family:verdana;font-size:22px;\">^</div>");
        $("#toTop").click(function () {
            $("body,html").animate({scrollTop: 0}, 800);
        });
    })
</script>
```

## 四
我的工具箱的`base.html`页面上放入这个方法，那么所有的页面，只要超过一个屏幕，就会自动在右下角出现一个返回顶部的按钮，使用起来非常爽，也不需要依赖外部的资源。
