---
title: "Python开发测试工具(一)—Monkey"
publishedAt: "2016-04-01T17:14:55+08:00"
categories: ["Python","测试"]
tags: ["Python","Monkey","测试"]
path: "/python/Python开发测试工具(一)—Monkey.html"
---

## 背景
最近在测试安卓的时候，经常会用到`Monkey`，`Monkey`作为安卓的基础工具，必须要到命令行去敲敲敲，做起来非常非常麻烦，于是我就想能不能利用学会的`Python`知识直接开发一个带有界面的安卓测试工具。

## 思路
整个实现流程并不困难，一个界面填写数据，提交到后台，然后`Python`调用`os`模块，执行`shell`命令，然后就可以实现`GUI`端的`Monkey`了。

## Web端
前段时间一直都在看`web`端的知识，我就想用`web`写一个界面，然后后台用`Django`执行，就可以很简单的完成这个工具了。

### 使用POST表单实现
前端就是用`Bootstrap`来实现了，对我来说，写了这么久得博客，这块东西比较容易了，代码就不放了，`bootstrap`套套就出来了，界面图如下：

![界面图](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379785281480691.jpg)

本来上面还有一个结束`Monkey`按钮的，被我拿掉了，拿掉的原因后面会说。

现在该有的东西都有了，后台实现起来也不难，获取前端给的参数，然后执行命令就行了，第一版用的是POST提交表单的方式执行，我发现了这么些问题：

1. 点击执行Monkey命令的时候整个页面是卡住的，没办法点击获取Monkey进程和结束Monkey
2. 执行完Monkey后整个页面会刷新，也就是说没办法从前端获取我命令的参数，虽然日志中可以获取到命令相关的参数，但是总的来说并不是那么直观

### 使用Ajax提交表单
用`POST`提交是最简单的了，我也最熟悉，不过存在上面的问题，总是很操蛋，于是我就改为使用Ajax异步提交数据，这样就不会导致执行`Monkey`的时候整个页面卡死的情况了。

页面没有修改，改了一个方法，`jQuery`的方法如下：

```js
$(document).ready(function () {
    $("#sub").click(function () {
        $.post("/monkey/",
            {
                "package_name": $("#package_name").val(),
                "event_count": $("#event_count").val(),
                "log_path": $("#log_path").val(),
                "log_level": $("#log_level").val(),
                "delay": $("#delay").val(),
                "sys_event": $("#sys_event").val(),
                "touch_event": $("#touch_event").val(),
                "zoom_event": $("#zoom_event").val(),
                "finger_event": $("#finger_event").val(),
                "ball_event": $("#ball_event").val(),
                "nav_event": $("#nav_event").val(),
                "switch_event": $("#switch_event").val()
            }
        )
    })
});
```

使用这个方法实现，是解决了一些问题，执行`Monkey`的时候页面也不会卡了，也可以正常的获取`Monkey`进程，不过依然存在这么些问题：

1. 端口容易出现异常，我执行的过程中发现`Monkey`经常会占用两个`pid`
2. 执行停止`Monkey`命令的时候无法生效

第一个问题倒是还好，占用两个结束两次就行了，倒也还能接受，第二个问题就无法接受了，NND不能直观的开始和结束，我写这个工具就没有什么意义了，我专门试了直接调用`python`执行停止命令是正常的。代码如下：

```js
$(document).ready(function () {
    $("#stop_monkey").click(function () {
        $.post("/monkey/stop_monkey/",
            {
                "monkey_id": $("#monkey_id").val()
            })
    })
});
```

```python
@csrf_exempt
def stop_monkey(request):
    data = {
            "msg": "Monkey已经停止"
        }
    if request.method == 'POST':
        command = 'adb shell kill {}'.format(request.POST['monkey_id'])
        cm.run_monkey(command)
        return JsonResponse(data, safe=False)
    return JsonResponse(data, safe=False)
```

**若读者知道，请发邮件告诉我到底是为什么这里不会执行，我丢了print在这上面是可以正常打印的。**

## GUI端
`web`端的实验失败了，效果并没有达到我的预期，只能换一种方案了，用桌面的`GUI`端来实现这个方案试试，然而`GUI`端又有很多选择，`PYQT`据说是最好的，但是在我电脑数据抹掉之前我有装过这个，虽然最后装成功了，但是整个装的过程太操蛋了，有点心理阴影，wxpython也是一个不错的选择，不过还要装第三方包，有点折腾，最终我选择了最基本的`Tkinter`来处理`GUI`。那么问题来了，`Tkinter`没用过，要重新去熟悉这个包。

[《Tkinter介绍文档》](http://effbot.org/tkinterbook/tkinter-index.htm)。。。麻蛋又是全英文的，果然英语还是必须要学好，我大概看了两小时，把一些主要的点扫了一遍，就开始写了，代码丑也是没办法的，时间少，没办法去慢慢想设计模式。

写完的界面是这样的：

![MonkeyTool](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537978565307096.jpg)

### 按钮方法
整个GUI的代码有100多行，有点长，布局是用`Grid`写的，所有的代码我就不贴了，我把按钮的方法贴一下：

```python
connect_text = Button(master, text='获取设备号',
                      command=lambda: cm.set_text(device_name, ad.get_devices()))
up_pknm_conf = Button(master, text='修改包名',
                      command=lambda: cm.update_conf(status, 'package_name', cm.get_text(package_name)))
up_log_path_conf = Button(master, text='修改日志地址',
                          command=lambda: cm.update_conf(status, 'log_path', cm.get_text(log_path)))
up_log_level_conf = Button(master, text='修改日志等级',
                           command=lambda: cm.update_conf(status, 'log_level', cm.get_text(log_level)))
up_count_conf = Button(master, text='修改测试数量',
                       command=lambda: cm.update_conf(status, 'count', cm.get_text(count)))
up_delay_conf = Button(master, text='修改延时',
                       command=lambda: cm.update_conf(status, 'delay', cm.get_text(delay)))
up_touch_conf = Button(master, text='修改触摸事件',
                       command=lambda: cm.update_conf(status, 'touch', cm.get_text(touch)))
up_motion_conf = Button(master, text='修改手势事件',
                        command=lambda: cm.update_conf(status, 'motion', cm.get_text(motion)))
up_pinch_conf = Button(master, text='修改缩放事件',
                       command=lambda: cm.update_conf(status, 'pinch', cm.get_text(pinch)))
up_trackball_conf = Button(master, text='修改轨迹球事件',
                           command=lambda: cm.update_conf(status, 'trackball', cm.get_text(trackball)))
up_screen_conf = Button(master, text='修改屏幕事件',
                        command=lambda: cm.update_conf(status, 'screen', cm.get_text(screen)))
up_nav_conf = Button(master, text='修改导航事件',
                     command=lambda: cm.update_conf(status, 'nav', cm.get_text(nav)))
up_major_conf = Button(master, text='修改主要事件',
                       command=lambda: cm.update_conf(status, 'major', cm.get_text(major)))
up_system_conf = Button(master, text='修改系统事件',
                        command=lambda: cm.update_conf(status, 'system', cm.get_text(system)))
up_app_conf = Button(master, text='修改切屏事件',
                     command=lambda: cm.update_conf(status, 'app', cm.get_text(app)))
up_keyboard_conf = Button(master, text='修改键盘事件',
                          command=lambda: cm.update_conf(status, 'keyboard', cm.get_text(keyboard)))
up_anyevents_conf = Button(master, text='修改其他事件',
                           command=lambda: cm.update_conf(status, 'anyevents', cm.get_text(anyevents)))
cat_monkey_pid = Button(master, text='显示Monkey进程',
                        command=lambda: cm.set_text(monkey_pid, ad.get_monkey_id()))
start_monkey = Button(master, text='开始Monkey',
                      command=lambda: mk.merge_command(cm.get_text(log_path), *cm.collect(*ENTRYLIST)))
stop_monkey = Button(master, text='结束Monkey',
                     command=lambda: ad.stop_monkey(status))
get_monkey = Button(master, text='获取Monkey',
                    command=lambda: cm.set_text(status, mk.get_monkey(cm.get_text(log_path), *cm.collect(*ENTRYLIST))))
```

值得一提的是，在`Button`组件中的`command`执行函数是**不能带参数**的，否则就会报错，不知道`Tkinter`的作者是怎么想的，不带参数的函数能有几个啊。。。。。

我用了一个折中的方法，用`lambda`函数来处理这一块，这样就可以加上参数了。

### 封装其他方法
其他方法我使用了三个函数，`common`来处理普通的方法，`adb`专门处理操作`shell`的方法，而`monkey`专门处理和`Monkey`有关的方法，这样设计以后工具就很容易拓展了，可以加上性能监控的方法等高级功能。

简单的贴一下方法。

```python
class Adb:
    def __init__(self):
        self.mk = monkey.Monkey()
        self.cm = common.Common()

    def get_devices(self):
        """
        获取设备名称
        :return:设备名称
        """
        a = os.popen('adb devices')
        devices = a.readlines()
        spl = devices[1].find('	')
        devices_name = devices[1][:spl]
        if devices_name == '':
            return "请确认设备是否连接"
        else:
            return devices_name

    def get_monkey_id(self):
        """
        获取monkey进程ID
        :return:monkey进程id
        """
        if self.get_devices():
            a = os.popen('adb shell ps | grep monkey')
            try:
                monkey_id = a.read().split(' ')[5]
                print "进程为{} 的Monkey已停止".format(monkey_id)
            except Exception:
                monkey_id = ''
            return monkey_id
        else:
            print "设备未连接"

    def stop_monkey(self, entry):
        """
        停止monkey
        :param monkey_id:monkey的进程号
        :return:None
        """
        monkey_id = self.get_monkey_id()
        if monkey_id != '请确认你的设备是否连接':
            os.system('adb shell kill {}'.format(monkey_id))
            self.cm.set_text(entry, "进程为{} 的Monkey已停止".format(monkey_id))
        else:
            print "设备未连接"
```

```python
def merge_command(self, path, *args):
        """
        组合命令,Monkey使用
        :param path:日志地址
        :param args:Monkey命令中的其他参数
        :return:None
        """
        member = ' '.join(args)
        command = 'adb shell monkey {} > {}'.format(member, path)
        self.run(command)

    def get_monkey(self, path, *args):
        """
        获取Monkey命令
        :param path: 日志地址
        :param args: Monkey命令中的其他参数
        :return:
        """
        if self.check_total(*args):
            member = ' '.join(args)
            command = 'adb shell monkey {} > {}'.format(member, path)
            return command
        else:
            return '事件百分数大于100%,请修正后再获取'

    def check_total(self, *args):
        """
        检查事件百分比是否合规,大于100则返回False
        :param args:传入的事件列表
        :return:True
        """
        rst = []
        all_list = self.deal_list(*args)
        for x in all_list:
            x = x.split(' ')[1]
            rst.append(int(x))
        num = sum(rst)
        if num > 100:
            return False
        else:
            return True

    def deal_list(self, *args):
        """
        处理列表数据,返回只有事件的列表
        :param args:传入的列表数据
        :return:list
        """
        rst = []
        for x in range(1, 12):
            rst.append(args[x])
        print rst
        return rst
```

### 存在的问题
用`GUI`端来处理也会存在这么个问题，点击开始的时候回出现整个`GUI`卡住的情况，必须要等`Monkey`执行完毕才能正常操作其他东西，因此我想了一个折中的方案，加一个状态显示的文本框，加一个生成`Monkey`命令的按钮，这样生成命令然后在`GUI`上就可以使用其他命令了，加上多进程或者多线程应该能解决这个问题，但是现在我对多线程多进程几乎是0了解，等了解了之后再来完善这部分的功能。

## 最后
就实现了这么一点点功能，代码量差不多也要300行，不得不说真是一个操蛋的工程。

最后，我仍然没有解决这个操蛋的问题，等研究完多线程之后再来重新改善这段代码。

最后的最后，虽然功能还不齐全，还是放上[Github](https://github.com/diandianhanbin/AndroidTools)，怎么说也是一个可以试想功能的工具吧。

最近博客上线了，读者可以关注我的博客。
博客地址：[www.wengyb.com](www.wengyb.com)