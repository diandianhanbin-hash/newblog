---
title: "基于Python的接口测试框架"
publishedAt: "2016-05-23T22:23:58+08:00"
categories: ["Python"]
tags: ["Python","测试框架"]
path: "/python/基于Python的接口测试框架.html"
---

## 背景
最近公司在做消息推送，那么自然就会产生很多接口，测试的过程中需要调用接口，我就突然觉得是不是可以自己写一个测试框架？

说干就干，由于现有的接口测试工具Jmeter、SoupUI等学习周期有点长，干脆自己写一个吧，不求人，所有功能自己都能一清二楚。

**当然，写工具造轮子只是学习的一种方式，现成成熟的工具肯定比我们自己的写的好用。**

## 开发环境

***

操作系统：Mac OS X EI Caption

Python版本：2.7

IDE：Pycharm

***

## 分析
接口是基于HTTP协议的，那么说白了，就是发起HTTP请求就行了，对于Python来说简直就是小菜一碟。直接使用requests就可以很轻松的完成任务。

## 架构
整个框架是比较小的，涉及的东西也比较少，只要分清楚几个模块的功能就行了。

![流程图](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537976878928431.jpg)

上面是一个接口测试的完整流程。只要一步一步的走下来就行了，并不是很难。

## 数据源
数据源我使用的是JSON来保存，当然，比较广泛的是使用Excel来保存，用JSON来保存是因为JSON用起来比较方便，懒得去读取Excel了，Python对JSON的支持是非常友好的。当然这个就看个人喜好了。

```json
{
    "TestId": "testcase004",
    "Method": "post",
    "Title": "单独推送消息",
    "Desc": "单独推送消息",
    "Url": "http://xxx.xxx.xxx.xx",
    "InputArg": {
      "action": "44803",
      "account": "1865998xxxx",
      "uniqueid": "00D7C889-06A0-426E-BAB1-5741A1192038",
      "title": "测试测试",
      "summary": "豆豆豆",
      "message": "12345",
      "msgtype": "25",
      "menuid": "203"
    },
    "Result": {
      "errorno": "0"
    }
  }
```

示例如上面代码所示，可以根据个人的业务需要进行调整。

## 发送请求
发送请求就很简单了，用requests模块，然后从JSON中读取发送的参数，post、get或者其他。由于要生成测试报告，那么发送的数据需要做一下记录，我选择用txt文本来作为记录的容器。

```python
f = file("case.json")
testData = json.load(f)
f.close()


def sendData(testData, num):
	payload = {}
	# 从json中获取发送参数
	for x in testData[num]['InputArg'].items():
		payload[x[0]] = x[1]
	with open('leftside.txt', 'a+') as f:
		f.write(testData[num]['TestId'])
		f.write('-')
		f.write(testData[num]['Title'])
		f.write('\n')

	# 发送请求
	data = requests.get(testData[num]['Url'], params=payload)
	r = data.json()
```

## 接受返回
由于我们是需要生成测试报告的，那么返回的数据我们先需要进行一次存储，可以选择用数据库存储，但是我觉得数据库存储太麻烦了，只要用txt文本作为存储容器即可。

```python
with open('rightside.txt', 'a+') as rs:
		rs.write('发送数据')
		rs.write('|')
		rs.write('标题:'+testData[num]['Title'])
		rs.write('|')
		rs.write('发送方式:'+testData[num]['Method'])
		rs.write('|')
		rs.write('案例描述:'+testData[num]['Desc'])
		rs.write('|')
		rs.write('发送地址:'+testData[num]['Url'])
		rs.write('|')
		rs.write('发送参数:'+str(payload).decode("unicode-escape").encode("utf-8").replace("u\'","\'"))
		rs.write('|')
		rs.write(testData[num]['TestId'])
		rs.write('\n')
```

## 结果判定
结果判定我使用的是全等于判定。因为我们的接口只需要这样处理就行了，如果有需要，可以写成正则判定。

```python
with open('result.txt', 'a+') as rst:
		rst.write('返回数据')
		rst.write('|')
		for x, y in r.items():
			rst.write(' : '.join([x, y]))
			rst.write('|')
		# 写测试结果
		try:
			if cmp(r, testData[num]['Result']) == 0:
				rst.write('pass')
			else:
				rst.write('fail')
		except Exception:
			rst.write('no except result')
		rst.write('\n')
```

我这里结果有3种，成功、失败或者没结果。结果的设置就看自己的定义了。

## 生成测试报告
测试报告是一个重头戏，由于我发送数据、返回数据和结果都是用txt文本存储，那么每次使用a+模式新增，会让结果越来越多，而且检查起来非常蛋疼。

我的处理方式是每次测试完毕之后，用Python读取txt文本中的数据，然后使用Django动态生成一个结果，然后再使用requests抓取这个网页，保存在Report文件夹中。

### 网页报告
Django的方法我就不多说了，博客中已经有一整个系列文章了。我们需要在views文件中打开之前记录的3个txt文件，然后做一些数据处理，返回给前端，前端用Bootstrap来渲染，就能生成一个比较漂亮的测试报告。

```python
def index(request):
	rightside = []
	result = []
	rst_data = []
	leftside = []
	passed = 0
	fail = 0
	noresult = 0
	with open(os.getcwd() + '/PortTest/leftside.txt') as ls:
		for x in ls.readlines():
			lf_data = {
				'code': x.strip().split('-')[0],
				'title': x.strip().split('-')[1]
			}
			leftside.append(lf_data)

	with open(os.getcwd() + '/PortTest/rightside.txt') as rs:
		for x in rs.readlines():
			row = x.strip().split('|')
			rs_data = {
				"fssj": row[0],
				"csbt": row[1],
				"fsfs": row[2],
				"alms": row[3],
				"fsdz": row[4],
				"fscs": row[5],
				'testid': row[6]
			}
			rightside.append(rs_data)

	with open(os.getcwd() + '/PortTest/result.txt') as rst:
		for x in rst.readlines():
			row = x.strip().split('|')
			if row[len(row)-1] == 'fail':
				fail += 1
			elif row[len(row)-1] == 'pass':
				passed += 1
			elif row[len(row)-1] == 'no except result':
				noresult += 1

			rs_data = []
			for y in row:
				rs_data.append(y)
			result.append(rs_data)
	for a, b in zip(rightside, result):
		data = {
			"sendData": a,
			"dealData": b,
			"result": b[len(b)-1]
		}
		rst_data.append(data)
	return render(request, 'PortTest/index.html', {"leftside": leftside,
													"rst_data": rst_data,
													"pass": passed,
													"fail": fail,
													"noresult": noresult})
```

基本上都是一些很基础的知识，字符串分割等等。这里的数据处理为了方便，在获取数据存储的时候就要按照一定的格式来存储，views的方法就很容易做处理。

前端代码如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link href="http://libs.baidu.com/bootstrap/3.0.3/css/bootstrap.min.css" rel="stylesheet">
    <script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
    <script src="http://libs.baidu.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</head>
<body>
<div class="container">
    <div class="row">
        <div class="page-header">
            <h1>接口测试报告
                <small>Design By Sven</small>
            </h1>
        </div>
    </div>
    <div class="row">
        <div class="col-md-4">
            <h3>测试通过 <span class="label label-success">{{ pass }}</span></h3>
        </div>
        <div class="col-md-4">
            <h3>测试失败 <span class="label label-danger">{{ fail }}</span></h3>
        </div>
        <div class="col-md-4">
            <h3>无结果 <span class="label label-warning">{{ noresult }}</span></h3>
        </div>
    </div>
    <p></p>
    <div class="row">
        <div class="col-md-3">
            <ul class="list-group">
                {% for ls in leftside %}
                    <li class="list-group-item"><a href="#{{ ls.code }}">{{ ls.code }} - {{ ls.title }}</a></li>
                {% endfor %}
            </ul>
        </div>
        <div class="col-md-9">
            {{ x.result }}
            {% for x in rst_data %}
                <div class="panel-group" id="accordion">
                {% if x.result == 'pass' %}
                    <div class="panel panel-success">
                {% elif x.result == 'fail' %}
                    <div class="panel panel-danger">
                {% elif x.result == 'no except result' %}
                    <div class="panel panel-warning">
                {% endif %}

            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" href="#{{ x.sendData.testid }}">
                        {{ x.sendData.testid }} - {{ x.sendData.csbt }}
                    </a>
                </h4>
            </div>
            <div id="{{ x.sendData.testid }}" class="panel-collapse collapse">
                <div class="panel-body">
                    <b>{{ x.sendData.fssj }}</b><br>
                    {{ x.sendData.csbt }}<br>
                    {{ x.sendData.fsfs }}<br>
                    {{ x.sendData.alms }}<br>
                    {{ x.sendData.fsdz }}<br>
                    {{ x.sendData.fscs }}
                    <hr>
                    {% for v in x.dealData %}
                        {{ v }}<br>
                    {% endfor %}
                </div>
            </div>
            </div>
            </div>
                <p></p>
            {% endfor %}
            </div>
            </div>
        </div>
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
            });
        </script>
</body>
</html>
```

## 测试报告效果图

![测试报告](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/15379768989239712.jpg)

## 最后
用Python写一个工具很容易，主要还是要能更方便地满足实际工作中的使用需要为目的。如果要做完整的接口测试，还是尽量使用已经成熟的工具。

PS：简单的造轮子也是学习原理的一个绝佳的方法。
