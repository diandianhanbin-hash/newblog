---
title: "AndroidTestTool开发笔记"
publishedAt: "2016-04-19T10:30:53+08:00"
categories: ["Test"]
tags: ["Android","测试"]
path: "/Test/AndroidTestTool开发笔记.html"
---

## 前言
这段时间在`Testerhome`上看了一些有关性能测试的帖子，看别人的东西，始终是别人的，只有自己写一遍才能体会其中的细节，虽然说不要重复造轮子，但是这种基础的东西，造一次轮子能够学会很多东西，最近看的东西也比较多，拿来实战一下也未尝不可。

整个工程下来难度其实不大，主要是一些基本知识，只不过涉及的面比较广，需要的要素如下：

***

开发相关

操作系统： Mac OS X EI capitan

Python： 2.7

Django：1.8.2

前端：Html、Css、Js、Bootstrap、jQuery、Ajax、[Echarts](http://echarts.baidu.com)

Android：ADB相关知识、Monkey相关知识

***

## 程序的架构
当然，用架构来形容有点夸张了，大概的模型如下图：

![程序模型](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537978347982095.jpg)

整个程序的模型并不复杂，都是通过`ADB SHELL`来操作`Android`设备、获取设备信息。在最初设计的时候是没有`Tkinter`的，因为我对这个`GUI`端并不熟，信号槽的信号传递和事件的绑定并不了解，而Web端相对了解一些。但是执行的时候发现有一些问题。在[《Python开发测试工具(一)—Monkey》](http://wybblog.applinzi.com/blog/article/36/)里面有详细描述这个问题。于是临时去学习Tkinter的知识，临时硬拼拼了一个GUI端出来。

## 前端
前端分为GUI和Web两个端，GUi端使用Tkinter，Web端使用Bootstrap和jQuery。两个端界面大概长这样。

![客户端](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379783660962439.jpg)

![web端](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379783867268102.jpg)

### Tkinter
最初我的选择不是`TKinter`，这个`Python`自带的原生包功能非常原始，而且最关键的是用的人太少，没人写中文文档，我如果要使用它，就必须去看英文的原文。但是其他几个GUI端也都有相应的缺点，`PyQt`环境搭建麻烦，而且中文文档大多是Qt4的，`WxPython`文档少，功能也不见得比`Tkinter`强大多少。最终还是硬着头皮吧T`kinter`的官方文档看完了，因为没有现成的代码，所以我就把所有代码丢到了一起，全部放在gui.py中，整个代码完全没有结构而言，不过再怎样，功能也算是实现了。

**Tkinter有几个坑爹的点我简单的列一下。**

#### Entry只读时无法显示文字
Entry就是一个Text输入框，单行的那种。一旦设置为只读属性，就无法显示文字，所以整个Tkinter如果要做成一个不允许输入又要展示状态的信息媒介，That's Impossible。

#### Label不能动态的改变
Tkinter的标签在初始化生成之后，就再也无法改变了，无法做动态的更新。

#### Placeholder效果实现起来很坑爹
Html中placeholder的效果很友好（就是文本框为空时显示一个提示语，输入内容后提示语消失的属性），但是在Tkinter中如果要实现它，就必须自己动手写两个事件，一是初始化的时候默认赋值，二是点击Entry获得焦点后做一个删除处理。

#### 按钮回调函数的时候无法传参
这才是最坑爹的一点。。。基本上函数都要传参的诶~~~当然，通过万能的Google我还是找到了解决办法，就是使用lambda语句来处理。代码如下：

```python

get_cpu_info = Button(master, text="开始生成cpu信息",
                              command=lambda: self.get_cpuinfo(self.cm.get_text(cpu_monitor)))

```

在这么多的坑中，我竟然还是坚持用完了Tkinter，当然我看的是英文的文档，也有可能有这个方法我没有看到，毕竟看英文的文档还是很操蛋的一件事。

### 多进程的处理
`Tkinter`是一个单线程的处理机制，我想在执行`Monkey`的同时又执行获取内存、获取`CPU`，那就必须挂上多进程来处理（多线程理论上也是可以的，但是实践中我发现经常会发生线程阻塞的情况）。当然，程序比较简单，不需要专门去做进程池来处理，只要每个功能开一个进程去处理就好了。代码如下：

```python

t = multiprocessing.Process(target=lambda: self.ad.get_cpuinfo(package_name, 'cpuinfo'))
t.start()


```

### GUI端的一些核心代码
* 执行Monkey

```python
def run_monkey(self):
        t = multiprocessing.Process(target=lambda: self.mk.merge_command(self.cm.get_text(log_path),
                                                                         *self.cm.collect(*ENTRYLIST)))
        t.start()

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

def collect(self, *args):
        """
        收集参数中的元素,转换为列表返回
        :param args:传入的参数
        :return:list
        """
        str_list = []
        for x in args:
            str_list.append(self.get_text(x))
        return str_list

```

* 获取内存信息

```python

def run_meminfo(self, package_name):
        self.cf.read('monkey.conf')
        self.cf.set('monkey_check', 'mark', 'True')
        self.cf.write(open('monkey.conf', 'w'))
        status = self.cf.get('monkey_check', 'mark')
        with open(self.ad.get_dir('meminfo'), 'w') as f:
            while status == 'True':
                f.write(self.ad.get_meminfo(package_name))
                f.write('\n')
                time.sleep(0.5)
                self.cf.read('monkey.conf')
                if self.cf.get('monkey_check', 'mark') == 'False':
                    break

def get_meminfo(self, package_name):
		"""
		获取内存信息
		:return:str, 内存信息
		"""
		newlist = []
		f = os.popen('adb shell dumpsys meminfo ' + package_name)
		for x in f.readlines():
			newlist.append(x.strip())
		try:
			mem_total = newlist[8].split('   ')[7]
			mem_used = newlist[8].split('   ')[8]
			mem_free = newlist[8].split('   ')[9]
		except Exception:
			mem_total = ''
			mem_used = ''
			mem_free = ''
		meminfo = '{},{},{}'.format(mem_total, mem_used, mem_free)

		return meminfo


```

* 获取CPU信息

```python

def get_cpuinfo(self, package_name, url):
		"""
		往cpuinfo文件夹中新写一个记录cpu信息的文件
		:param package_name:测试包名
		:param url:cpu文件的路径
		:return:None
		"""
		self.cf.read('monkey.conf')
		self.cf.set('cpu_check', 'mark', 'True')
		self.cf.write(open('monkey.conf', 'w'))
		with open(self.get_dir(url), 'w') as f:
			while True:
				a = os.popen('adb shell dumpsys cpuinfo | grep ' + package_name)
				cpuinfo_list = a.readlines()[0].split(' ')
				if len(cpuinfo_list) == 13:
					cpu = [cpuinfo_list[2], cpuinfo_list[4], cpuinfo_list[7]]
					cpuinfo = ','.join(cpu)
					f.write(cpuinfo)
					f.write('\n')
					time.sleep(0.5)
					self.cf.read('monkey.conf')
					if self.cf.get('cpu_check', 'mark') == "False":
						break

```

当时写代码的时候比较随性，没有做统一的规划，写完后又不太想重新改，就这样放着吧。

### Web端
`Web`端的处理就相对比较顺畅了，我把收集内存信息和CPU信息都放在Tkinter了，因此在Web端只负责展示就行了。当然，最后我又突发奇想把收集流量信息放在Web端了，主要是流量信息不完全用走势图可以完全展示，因此就把这个功能放在Web端了。

#### web端的几个页面
最初web端我是设计用来查看走势图的，因此有这么几个页面：主页、内存信息、CPU信息、流量信息，本来还有一个gxfinfo，但是不同Android手机展示出来的矩阵不同，统一处理的方案我还没想出来，暂时就搁浅了，等后续想出来后我再补充，在导航栏上我把打开GUI端的按钮集成了进来，也就是说以后我要使用就只要打开WEB端就行了，一站式解决方案。

#### 首页
首页原来我是放置一些说明的，后来发现在首页也可以加一些功能，比如直接查看包名、查看`Activity`，查看手机上有多少app等简单实用的功能。这些功能自己从shell中去获取也不难，但是集成进来之后显得更简单易用了。

##### 获取当前包名和Activity
获取的命令很简单，在*nux下的命令就是

```

adb shell dumpsys window windows | grep mFocusedApp

```

windows需要调整一下这个命令。获取之后做一些截取就可以拿到包名和Activity，把信息返回给前端即可，代码如下：

```python

def get_cur_pknm(self):
		try:
			f = os.popen('adb shell dumpsys window windows | grep mFocusedApp')
			for x in f.readlines():
				pknm = x.strip().split(' ')[4]
			pk_info = pknm.split('/')
			pk_data = {
				'errmsg': '查询成功',
				'package_name': pk_info[0],
				'avtivity_name': pk_info[1]
			}
		except Exception as e:
			pk_data = {
				'errmsg': '请确认设备正确连接或者是否有打开APP?'
			}
		return pk_data

```

前端接受代码：

```js

//获取当前包名和Activity
    $("#get_cur_packagename").click(function () {
        $.getJSON(
            '/datashow/get_cur_packagename/',
            function (data) {
                $("#pkinfo").fadeIn('slow');
                $("#package_name").html('当前打开的包名为: <mark>'+data['package_name']+"</mark>");
                $("#activity_name").html('当前打开的avtivity为: <mark>'+data['avtivity_name']+"</mark>")
            }
        )
    });
    
```

获取所有第三方应用的命令是这个：

```

adb shell pm list package -3

```

依照上面的方式给代码就行了。效果就是这样：

[原图待补（web端）](<http://7xsgl3.com1.z0.glb.clouddn.com/D40ABEF3-5AFF-4107-8DE9-1219E92A724E.png>)

### 内存cpu监控
这两部分的内容类似，都是作为一个展示的页面来处理，就需要后端给数据，数据收集在GUi端做处理，那么前端就需要发Ajax请求到后端获取数据，获取数据后调用Echarts进行绘图。前端的代码如下：

```js

//内存信息获取
    $('#mem_query').click(function () {
        var filename = $("#selquery").val();
        var myChart = echarts.init(document.getElementById('main'), 'dark');
        $.get('/datashow/getmemdata/' + filename).done(function (data) {
            myChart.hideLoading();
            myChart.setOption({
                title: {
                    text: '内存监控信息'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['内存总体使用量', '内存剩余可用量']
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: []
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '内存剩余可用量',
                        type: 'line',
                        areaStyle: {normal: {}},
                        data: data['user_data']
                    },
                    {
                        name: '内存总体使用量',
                        type: 'line',
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        },
                        opacity: '0.1',
                        areaStyle: {normal: {opacity: '0.1'}},
                        data: data['total_data']
                    }
                ]
            });
        });
    });

```

后端数据我们收集的时候是存在一个一个的TXT文本中，因此需要做这么几件事。
1. 在初始化页面的时候，获取所有的txt文件名，在前端生成一个下拉框给用户选择。
2. 选择对应的文件查看后，发送数据给前端绘图。

因此我是这样设计的，在前端页面初始化的时候，发Ajax请求获取文件名来生成下拉框，代码如下：

```js

$.ajax({
            url: '/datashow/getdirlist/meminfo',
            success: function (data) {
                var arr = data['data'];
                var select = $("<select id='selquery' class='form-control'></select>");
                for (var i = 0; i < arr.length; i++) {
                    select = select.append("<option value='" + arr[i] + "'>" + arr[i] + "</option>")
                }
                $("#selection").append(select)
            }
        });

```

后端获取所有文件名后返回给前端，这里我会把第一个文件剔除出返回的列表，第一个文件名是我初始化项目结构的时候给的文件，并没有实际的数据，之后按倒叙返回给前端。代码如下：

```python

def getDirList(request, cate):
	rst = []
	url = '{}/device_info/{}'.format(os.getcwd(), cate)
	old_rst = os.listdir(url)
	old_rst.pop(0)
	for x in old_rst:
		rst.append(x.split('.')[0])
	rst_data = {
		'status': 200,
		'data': rst[::-1]
	}
	return JsonResponse(rst_data)

```

CPU信息也是同理获取，代码就不多贴了。

### 流量监控
流量监控的命令是由两部分组成，一个要取到应用的PID，然后通过这个PID去取相应的记录文件，两部分的代码如下：

```python

def get_pid(self, package_name):
		"""
		获取pid
		:param package_name:包名
		:return: str, pid
		"""
		pid = []
		f = os.popen('adb shell ps | grep ' + package_name)
		for x in f.readlines():
			pid_list = x.split(' ')
			for y in pid_list:
				if y.strip() == package_name:
					for z in x.split(' '):
						if z:
							pid.append(z)
		rst = pid[1]
		return rst
		
def write_flow(self, package_name, url):
		self.cf.read('monkey.conf')
		self.cf.set('flow_mark', 'mark', 'True')
		self.cf.write(open('monkey.conf', 'w'))
		with open(self.get_dir(url), 'w') as fn:
			while True:
				rst_list = []
				f = os.popen('adb shell cat /proc/{}/net/dev | grep wlan0'.format(self.get_pid(package_name)))
				for x in f.readlines():
					for y in x.split(' '):
						if y:
							rst_list.append(y)
				up = rst_list[9]
				down = rst_list[1]
				flowInfo = '{},{}'.format(down, up)
				fn.write(flowInfo)
				fn.write('\n')
				print flowInfo
				time.sleep(0.5)
				self.cf.read('monkey.conf')
				if self.cf.get('flow_mark', 'mark') == "False":
					break

```

流量的功能需要记录执行的时间和上行下行流量，因此在开始记录流量的时候，我会在配置文件写入一个时间戳，和已发生的上下行流量，停止的时候再记录一次信息，两个信息对减的结果返回给前端，前端就能展示时间和消耗的流量了。代码如下：

```python

def get_flow(self, package_name, mark):
		"""
		获取流量信息
		:param package_name:包名
		:param mark:获取流量的标记
		:return:
		"""
		if mark == "start":
			rst_list = []
			f = os.popen('adb shell cat /proc/{}/net/dev | grep wlan0'.format(self.get_pid(package_name)))
			for x in f.readlines():
				for y in x.split(' '):
					if y:
						rst_list.append(y)
			rst = int(rst_list[1]) + int(rst_list[9])
			conf_data = {
				'total': str(rst),
				'flowup': str(rst_list[9]),
				'flowdown': str(rst_list[1]),
				'timestart': str(time.time())
			}
			self.cf.read('monkey.conf')
			self.cf.set('flow_mark', 'flow_total', conf_data['total'])
			self.cf.set('flow_mark', 'flow_up', conf_data['flowup'])
			self.cf.set('flow_mark', 'flow_down', conf_data['flowdown'])
			self.cf.set('flow_mark', 'time_start', conf_data['timestart'])
			self.cf.write(open('monkey.conf', 'w'))
		else:
			rst_list = []
			f = os.popen('adb shell cat /proc/{}/net/dev | grep wlan0'.format(self.get_pid(package_name)))
			for x in f.readlines():
				for y in x.split(' '):
					if y:
						rst_list.append(y)
			rst = int(rst_list[1]) + int(rst_list[9])
			end_data = {
				'total': str(rst),
				'flowup': str(rst_list[9]),
				'flowdown': str(rst_list[1]),
				'timend': str(time.time())
			}
			self.cf.read('monkey.conf')
			oldTotal = self.cf.get('flow_mark', 'flow_total')
			oldUp = self.cf.get('flow_mark', 'flow_up')
			oldDown = self.cf.get('flow_mark', 'flow_down')
			oldTime = self.cf.get('flow_mark', 'time_start')
			rst_data = {
				'total': str(int(end_data['total']) - int(oldTotal)),
				'up': str(int(end_data['flowup']) - int(oldUp)),
				'down': str(int(end_data['flowdown']) - int(oldDown)),
				'time': str(float(end_data['timend']) - float(oldTime))
			}
			return rst_data

```

因为处理的东西比较多，所以我也贴一下前端的代码。

```js

$("#getflow").click(function () {
        var val = $("#getflow").text();
        var myDate = new Date();
        var package_name = $("#package").val();
        if (val == '点击开始测试') {
            $("#getflow").removeClass().addClass('btn btn-danger');
            $.get(
                '/datashow/testflow/',
                {mark: 'start', package: package_name}
            );
            $("#getflow").text('点击停止测试');
            $("#start").text('开始测试时间为: ' + myDate.toLocaleTimeString());
            $("#end").text('');
            $("#result").html('')
        }
        else {
            $("#getflow").removeClass().addClass('btn btn-default');
            $("#end").text('结束测试时间为: ' + myDate.toLocaleTimeString());
            $("#getflow").text('点击开始测试');
            $.get(
                '/datashow/testflow/',
                {mark: 'end', package: package_name},
                function (data) {
                    $("#result").html(
                        "测试结果:" +
                        "<hr>" +
                        "测试一共耗时:" + data['time'] + "秒" +
                        "<hr>" +
                        "总计流量消耗: " + data['total'] + "byte" +
                        "<hr>" +
                        "上行流量: " + data['up'] + "byte" +
                        "<hr>" +
                        "下行流量: " + data['down']
                    )
                }
            );
            $("#selection").html('');
            $.ajax({
                url: '/datashow/getdirlist/flowinfo',
                success: function (data) {
                    var arr = data['data'];
                    var select = $("<select id='selquery' class='form-control'></select>");
                    for (var i = 0; i < arr.length; i++) {
                        select = select.append("<option value='" + arr[i] + "'>" + arr[i] + "</option>")
                    }
                    $("#selection").append(select)
                }
            });

        }
    });

```

最终的效果图就是这样：

[原图待补（流量监控）](<http://7xsgl3.com1.z0.glb.clouddn.com/02C218C4-5922-439C-A63B-10BC5661C5F4.png>)

## 结语
整个开发周期前后大概花了两周时间，这些知识熟的朋友应该可以更快，在使用前端知识的时候，我基本上都是靠w3cschool来解决，大概的概念我懂，但是具体的编码还是需要去copy。在整个项目写完后，我感觉我对这块的了解也更加深入了，重复造轮子的好处就是可以深入理解这些东西的来源，比如adb的使用，Android的一些知识。真正在工作当中使用的话，当然还是直接使用一些大公司的产品比较好，他们的东西比较成熟，精准度从一定程度上来说也比我们自己写的质量会高一些。

最后的最后，代码放在[Github](https://github.com/diandianhanbin/AndroidTools)，有兴趣的朋友可以自行翻阅。