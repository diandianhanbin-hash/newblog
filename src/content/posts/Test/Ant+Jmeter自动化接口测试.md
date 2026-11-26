---
title: "Ant+Jmeter自动化接口测试"
publishedAt: "2016-08-23T18:59:36+08:00"
categories: ["Test"]
tags: ["Jmeter","测试"]
path: "/Test/Ant+Jmeter自动化接口测试.html"
---

![20160823](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537778217744134.jpg)

## 背景
最近在看Jmeter和接口测试，发现了几个问题，基于HTTP协议的接口测试实施起来很简单，但是怎么实施接口测试就是一个难点，而且接口测试如果不做成自动化，就纯粹靠手工执行，那么意义其实并不大。所以稍微看了一下Ant+Jmeter的组合，来实现自动化。

## Ant驱动Jmeter
单独使用Jmeter来执行接口测试是非常简单的了，使用Ant来驱动Jmeter就需要些一个构建文件*build.xml*

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project name="ant-jmeter-test" default="all" basedir=".">
    <tstamp>
        <format property="time" pattern="yyyyMMddhhmm" />
    </tstamp>
    <!-- 需要改成自己本地的 Jmeter 目录-->
    <property name="jmeter.home" value="/Users/SvenWeng/apache-jmeter-3.0" />
    <!-- jmeter生成jtl格式的结果报告的路径-->
    <property name="jmeter.result.jtl.dir" value="/Users/SvenWeng/Desktop" />
    <!-- jmeter生成html格式的结果报告的路径-->
    <property name="jmeter.result.html.dir" value="/Users/SvenWeng/Desktop" />
    <!-- 生成的报告的前缀-->
    <property name="ReportName" value="TestReport" />
    <property name="jmeter.result.jtlName" value="${jmeter.result.jtl.dir}/${ReportName}${time}.jtl" />
    <property name="jmeter.result.htmlName" value="${jmeter.result.html.dir}/${ReportName}${time}.html" />
    <target name="all">
        <antcall target="test" />
        <antcall target="report" />
    </target>
    <target name="test">
        <taskdef name="jmeter" classname="org.programmerplanet.ant.taskdefs.jmeter.JMeterTask" />
        <jmeter jmeterhome="${jmeter.home}" resultlog="${jmeter.result.jtlName}">
            <!-- 声明要运行的脚本。"*.jmx"指包含此目录下的所有jmeter脚本-->
            <testplans dir="/Users/SvenWeng/Desktop" includes="获取用户ID.jmx" />
        </jmeter>
    </target>
    <target name="report">
        <xslt in="${jmeter.result.jtlName}" out="${jmeter.result.htmlName}" style="${jmeter.home}/extras/jmeter-results-detail-report_21.xsl" />
        <!-- 因为上面生成报告的时候，不会将相关的图片也一起拷贝至目标目录，所以，需要手动拷贝 -->
        <copy todir="${jmeter.result.html.dir}">
            <fileset dir="${jmeter.home}/extras">
                <include name="collapse.png" />
                <include name="expand.png" />
            </fileset>
        </copy>
    </target>
</project>
```

只要Ant配置好，直接运行Ant就行了。结果如下：

```
SvenWeng@wengyanbin:~/Desktop|⇒  ant
Buildfile: /Users/SvenWeng/Desktop/build.xml

all:

test:
   [jmeter] Executing test plan: /Users/SvenWeng/Desktop/获取用户ID.jmx ==> /Users/SvenWeng/Desktop/TestReport201608220301.jtl
   [jmeter] Writing log file to: /Users/SvenWeng/apache-jmeter-3.0/bin/jmeter.log
   [jmeter] Creating summariser <summary>
   [jmeter] Created the tree successfully using /Users/SvenWeng/Desktop/获取用户ID.jmx
   [jmeter] Starting the test @ Mon Aug 22 15:01:29 CST 2016 (1471849289646)
   [jmeter] Waiting for possible Shutdown/StopTestNow/Heapdump message on port 4445
   [jmeter] summary +      1 in 00:00:01 =    2.0/s Avg:   267 Min:   267 Max:   267 Err:     0 (0.00%) Active: 37 Started: 38 Finished: 1
   [jmeter] summary +   3451 in 00:00:30 =  115.9/s Avg:   841 Min:   130 Max:  3745 Err:     0 (0.00%) Active: 100 Started: 101 Finished: 1
   [jmeter] summary =   3452 in 00:00:30 =  114.0/s Avg:   841 Min:   130 Max:  3745 Err:     0 (0.00%)
   [jmeter] summary +   1548 in 00:00:14 =  107.7/s Avg:   792 Min:    32 Max:  5003 Err:     0 (0.00%) Active: 0 Started: 101 Finished: 101
   [jmeter] summary =   5000 in 00:00:45 =  111.9/s Avg:   826 Min:    32 Max:  5003 Err:     0 (0.00%)
   [jmeter] Tidying up ...    @ Mon Aug 22 15:02:14 CST 2016 (1471849334383)
   [jmeter] ... end of run

report:
     [xslt] Processing /Users/SvenWeng/Desktop/TestReport201608220301.jtl to /Users/SvenWeng/Desktop/TestReport201608220301.html
     [xslt] Loading stylesheet /Users/SvenWeng/apache-jmeter-3.0/extras/jmeter-results-detail-report_21.xsl
     [copy] Copying 2 files to /Users/SvenWeng/Desktop

BUILD SUCCESSFUL
Total time: 47 seconds
```

## 几个大坑
### taskdef class org.programmerplanet.ant.taskdefs.jmeter.JMeterTask cannot be found
 using the classloader AntClassLoader[]
 
 这个报错非常坑爹，是由于Ant有一个*ant-jmeter-1.1.1.jar*这个文件缺失了，所以一直会报这个错。
 
 
### stylesheet /Users/SvenWeng/apache-jmeter-3.0/extras/jmeter-results-detail-report_21.xsl doesn't exist.

这个报错是由于我使用的是Jmeter3.0。而3.0文件下面的对应文件是*jmeter-results-detail-report.xsl* 所以报了这个错，但是这个文件是有问题的，这个问题下面再说。

### 测试报告中没有数据

这个问题就是由于上面文件的不正确导致的。两个文件的不同点如下：

![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/153777826246584.jpg)

自己把这块改了，或者直接使用Jmeter2.*的文件也行。

### 测试报告中三个指标为NaN
这个问题也是一个坑，我找了好久才找到原因。

需要从Jmeter的lib包里把xalan-2.7.2.jar和serializer-2.7.2.jar copy到Ant的lib包里。

## 下一步
下一步当然是扔到jenkins里面啦，监控代码变动，然后自动执行接口测试。当然，也可以写一个Python的脚本定时执行或监控代码库执行都可以。
 