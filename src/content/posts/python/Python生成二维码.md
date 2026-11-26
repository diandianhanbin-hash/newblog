---
title: "Python生成二维码"
publishedAt: "2016-02-22T14:39:41+08:00"
categories: ["Python"]
tags: ["Python"]
path: "/python/Python生成二维码.html"
---
## 背景
使用一个第三方库生成二维码

***

版本相关 

操作系统：Mac OS X EI Caption 

Python版本：2.7

IDE：Sublime Text 3

***

## 依赖库
`Python`生成二维码需要的依赖库为`PIL`和`QRcode`。
坑爹的是，百度了好久都没有找到`PIL`，不知道是什么时候改名了，`pillow`就是传说中的`PIL`。
安装命令：`sudo pip install pillow、sudo pip install qrcode`
验证是否安装成功，使用命令`from PIL import Image`，就可以验证PIL是否安装成功，`qrcode`则使用`import qrcode`，两条命令不报错，就说明依赖的环境已经完毕了。

## 使用qrcode
`qrcode`使用起来也很简单，代码如下：

```python
import qrcode
 
 
qr = qrcode.QRCode(
    version=7,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4
)
qr.add_data("Hello")
qr.make(fit=True)
img = qr.make_image()
img.save("test.png")
```

参数 `version` 表示生成二维码的尺寸大小，取值范围是 `1 至 40`，最小尺寸 1 会生成 21 * 21 的二维码，version 每增加 1，生成的二维码就会添加 4 尺寸，例如 version 是 2，则生成 25 * 25 的二维码。
参数 error_correction 指定二维码的容错系数，分别有以下4个系数：

```
1.ERROR_CORRECT_L: 7%的字码可被容错
2.ERROR_CORRECT_M: 15%的字码可被容错
3.ERROR_CORRECT_Q: 25%的字码可被容错
4.ERROR_CORRECT_H: 30%的字码可被容错
```

参数 `box_size` 表示二维码里每个格子的像素大小。
参数 `border` 表示边框的格子厚度是多少（默认是4）。
运行代码后，会在代码的当前目录下生成一个`test.png`的二维码，用手机扫一下就可以看到`Hello`了。

## 带有logo的二维码
生成这个二维码的原理就是利用PIL库操作`icon`，把`icon`放到二维码的正中间。`PIL`操作没有去了解，就直接使用脚本之家的代码来做事例。

```python
import Image
import qrcode
 
 
qr = qrcode.QRCode(
    version=2,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=1
)
qr.add_data("http://jb51.net/")
qr.make(fit=True)
 
img = qr.make_image()
img = img.convert("RGBA")
 
icon = Image.open("favicon.png")
 
img_w, img_h = img.size
factor = 4
size_w = int(img_w / factor)
size_h = int(img_h / factor)
 
icon_w, icon_h = icon.size
if icon_w > size_w:
    icon_w = size_w
if icon_h > size_h:
    icon_h = size_h
icon = icon.resize((icon_w, icon_h), Image.ANTIALIAS)
 
w = int((img_w - icon_w) / 2)
h = int((img_h - icon_h) / 2)
img.paste(icon, (w, h), icon)
 
img.save("dhqme_qrcode.png")
```