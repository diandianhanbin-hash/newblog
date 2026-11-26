---
title: "Appium——驱动和常用功能的封装"
publishedAt: "2016-03-24T22:32:56+08:00"
categories: ["Test"]
tags: ["Android","测试","Appium"]
path: "/Test/Appium——驱动和常用功能的封装.html"
---

## 背景
初步了解`Appium`各个功能之后，应该把这些功能进行一些封装，否则整个代码会比较难看，可用性和重用性也会很差。本文是我这段时间使用`Appium`的一些想法，仅供参考。

***

操作系统：Mac OS X EI Caption

Appium: 1.4.16

Java: java version “1.7.0_79”

node.js: v5.3.0

npm: 3.3.12

手机：小米NOTE4

待测应用： 微证券

***

## driver的封装
初始化的`driver`是`Python`操作`Appium`的核心，因此driver在整个代码中重用率是非常高的。

新建一个`driver.py`文件，专门用来封装`driver`。代码如下：

```python
# ecoding=utf-8
__author__ = "Sven_Weng"
from appium import webdriver


class AppiumTest:
    def __init__(self):
        desired_caps = {'platformName': 'Android',
                        'platformVersion': '5.0.2',
                        'deviceName': '5136b01e',
                        'appPackage': 'com.weizq',
                        'appActivity': 'com.zztzt.android.simple.app.MainActivity'}
        self.driver = webdriver.Remote('http://localhost:4723/wd/hub', desired_caps)
        self.driver.implicitly_wait(30)

    def get_driver(self):
        return self.driver
```

在`AppiumTest`这个类中，初始化函数包含了`driver`的信息，然后在`get_driver`函数中直接把这个`driver`返回回去，测试用例中只要在测试类的初始化中调用它，就能获取`driver`。

## 按模块划分封装的方法
我是这么划分模块的，一个`Element`，专门封装操作和对象有关的方法，把`find_element_by_id`这种很长很长的方法缩短一点，用一些比较简洁的名字封装一下，使用起来代码可读性也会比较强。一个`common`类，专门封装通用的方法，其他就是按照功能模块来划分，我测试的微证券有4个主要功能，所以会有财讯、行情、发现、我这些类模块。

### element对象封装
我自己的代码如下：

```python
class Element:
    """
    封装Appium中关于元素对象的方法
    """

    def __init__(self):
        at = AppiumTest()
        self.driver = at.get_driver()

    def get_id(self, id):
        element = self.driver.find_element_by_id(id)
        return element

    def get_name(self, name):
        element = self.driver.find_element_by_name(name)
        return element

    def over(self):
        element = self.driver.quit()
        return element

    def get_screen(self, path):
        self.driver.get_screenshot_as_file(path)

    def get_size(self):
        size = self.driver.get_window_size()
        return size

    def swipe_to_up(self):
        window_size = self.get_size()
        width = window_size.get("width")
        height = window_size.get("height")
        self.driver.swipe(width / 2, height * 3 / 4, width / 2, height / 4, 500)

    def swipe_to_down(self):
        window_size = self.get_size()
        width = window_size.get("width")
        height = window_size.get("height")
        self.driver.swipe(width / 2, height / 4, width / 2, height * 3 / 4, 500)

    def swipe_to_left(self):
        window_size = self.get_size()
        width = window_size.get("width")
        height = window_size.get("height")
        self.driver.swipe(width / 4, height / 2, width * 3 / 4, height / 2, 500)

    def swipe_to_right(self):
        window_size = self.get_size()
        width = window_size.get("width")
        height = window_size.get("height")
        self.driver.swipe(width * 4 / 5, height / 2, width / 5, height / 2, 500)

    def back(self):
        self.driver.keyevent(4)

    def get_classes(self, classesname):
        elements = self.driver.find_elements_by_class_name(classesname)
        return elements

    def get_ids(self, ids):
        elements = self.driver.find_elements_by_id(ids)
        return elements

    def switch_h5(self):
        self.driver.execute(MobileCommand.SWITCH_TO_CONTEXT, {"name": "WEBVIEW_com.weizq"})

    def switch_app(self):
        self.driver.execute(MobileCommand.SWITCH_TO_CONTEXT, {"name": "NATIVE_APP"})
```

上面封装的很简单，就是一些常用的方法，在初始化函数中初始化`driver`即可。

### common
common就是封装一些通用的方法，比如登录，比大小，获取股票代码，页面标题校验等等。以下是我的代码：

```python
class Common:
    """
    封装通用的方法
    """

    def __init__(self):
        self.cf = ConfigParser.ConfigParser()
        self.cf.read('enable_data.conf')

    def cycle_screen(self, section_name, num, driver):
        """
        循环截图功能
        从json文件中读取信息,用来定位点击的方位和保存截图的路径
        执行成功则返回True,否则返回False
        :param section_name: json文件中一级节点的名称
        :param num: json文件中对应的列表序列位
        :param driver: Appium的驱动
        :return:True or False
        """
        try:
            with open('get_screen.json', 'r') as f:
                jsondata = f.read()
            cx_info = json.loads(jsondata)
            values = cx_info[section_name][num].values()
            for value in values:
                driver.get_name(value['name']).click()
                time.sleep(2)
                self.check_title(value['name'], driver)
                driver.get_screen(value['path'])
                logging.info(value['log'])
            return True
        except Exception as e:
            logging.warning(e)
            return False

    def cycle_screen_and_back(self, section_name, num, driver):
        """
        功能和上一个函数一样,在步骤最后加了一个返回事件,用来处理"行情"-"更多"页面的数据校验
        :param section_name: conf配置文件的节点名称
        """
        try:
            with open('get_screen.json', 'r') as f:
                jsondata = f.read()
            cx_info = json.loads(jsondata)
            values = cx_info[section_name][num].values()
            for value in values:
                logging.info(value)
                driver.get_name(value['name']).click()
                time.sleep(2)
                self.check_title(value['name'], driver)
                # title = driver.get_classes('android.widget.TextView')[0].text
                # try:
                #     assert title == value['name']
                #     logging.info(title + '页面显示正确')
                # except Exception as e:
                #     logging.warning(value['name'])
                #     logging.warning(title + '页面显示不正确')
                driver.get_screen(value['path'])
                driver.driver.keyevent(4)
                time.sleep(1)
                logging.info(value['log'])
            return True
        except Exception as e:
            logging.warning(e)
            return False

    def check_title(self, title, driver):
        text = driver.get_classes('android.widget.TextView')[0].text
        try:
            assert text == title
            logging.info("标题为: {} 校验通过".format(title))
            return True
        except Exception as e:
            logging.warning(e)
            logging.warning("标题为: {} 校验不通过".format(title))
            return False

    def compare(self, ids, numstar, numend, driver):
        """
        比较传入值得大小, 第一个数比第二个数大返回True,否则返回False
        :param ids:传入的ID名
        :param numstar:传入的开始序号
        :param numend:传入的结束需要
        :param driver:驱动
        :return:True or False
        """
        try:
            startext = float(driver.get_ids(ids)[numstar].text)
            endtext = float(driver.get_ids(ids)[numend].text)
        except ValueError:
            starmark = driver.get_ids(ids)[numstar].text[:1]
            endmark = driver.get_ids(ids)[numend].text[:1]
            if starmark == endmark:
                startext = float(driver.get_ids(ids)[numstar].text.lstrip(starmark).rstrip('%'))
                endtext = float(driver.get_ids(ids)[numend].text.lstrip(endmark).rstrip('%'))
            elif starmark == "+":
                return True
            elif starmark == "-":
                return False
        if startext > endtext:
            return True
        else:
            return False

    def get_SotckCode(self, ids, driver):
        """
        获取行情-自选页面中的所有股票代码,自选超过50支的时候请修改参数中的range(10)
        返回list
        :param driver:驱动控件
        :return:list, 自选股票代码
        """
        SotckCode = []
        for x in driver.get_ids(ids):
            SotckCode.append(x.text)
        for x in range(5):
            driver.swipe_to_up()
            for x in driver.get_ids(ids):
                if x.text not in SotckCode:
                    SotckCode.append(x.text)
        return SotckCode

    def zjzh_login(self, driver):
        """
        资金账号登录方法,传入appium-driver
        APP启动时需要资金账号为登录状态时调用
        :param driver: Appium驱动
        :return: True
        """
        driver.get_name('发现').click()
        driver.switch_h5()
        driver.get_classes('list-item')[1].click()
        driver.switch_app()
        driver.get_name('买入').click()
        username = self.cf.get('zjzh_login_info', 'username')
        password = self.cf.get('zjzh_login_info', 'password')
        if self.tra_login(username, password, driver):
            self.check_title(u'委托买入', driver)
            driver.back()
            driver.back()
            self.check_title(u'发现', driver)
            logging.info('资金账号登录成功')
            return True

    def tra_login(self, username, password, driver):
        """
        资金账号登录页面的登录方法
        :param username:账号
        :param password:密码
        :param driver:Appium驱动
        :return:True
        """
        driver.get_id('com.weizq:id/edit_account').clear()
        driver.get_id('com.weizq:id/edit_account').send_keys(username)
        logging.info('输入的账号为: {}'.format(username))
        driver.get_id('com.weizq:id/edit_password').send_keys(password)
        logging.info('输入的密码为: {}'.format(password))
        yzm = driver.get_id('com.weizq:id/text_yanzhengma').text
        logging.info('验证码为:{}'.format(yzm))
        driver.get_id('com.weizq:id/edit_yanzhengma').send_keys(yzm)
        driver.get_id('com.weizq:id/login').click()
        time.sleep(3)
        return True
```

### 其他功能模块
其他功能模块也是同样的道理，不过其他模块封装的都是特定功能模块才会用到的方法，因为代码可能涉及公司的机密，所以功能模块的代码就暂不放出来，思想还是一样的。

## 日志记录
关于日志记录的原则，我觉得是这样的，写入日志的必须是一些关键的信息，把日志浏览一遍，基本上就能了解到整个脚本跑的流程，比如我调试一些功能的时候，基本上不用关注手机运行的页面，脚本到底做了什么，只要看日志就懂了。下面是一些我调试功能的时候打出来的日志：

> Thu, 24 Mar 2016 14:26:35 test_weizq.py[line:437] INFO ==========结束测试我的内容==========

> Thu, 24 Mar 2016 14:26:37 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:26:55 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:27:23 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:27:32 test_weizq.py[line:448] INFO -----开始测试个人资料页面校验-----

> Thu, 24 Mar 2016 14:27:36 test_weizq.py[line:456] INFO 旧的昵称是: 6850252

> Thu, 24 Mar 2016 14:27:50 test_weizq.py[line:463] INFO 新的昵称是: 5030013

> Thu, 24 Mar 2016 14:27:50 test_weizq.py[line:437] INFO ==========结束测试我的内容==========

> Thu, 24 Mar 2016 14:31:55 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:32:06 test_weizq.py[line:448] INFO -----开始测试个人资料页面校验-----

> Thu, 24 Mar 2016 14:32:09 test_weizq.py[line:468] INFO 女

> Thu, 24 Mar 2016 14:32:09 test_weizq.py[line:437] INFO ==========结束测试我的内容==========

> Thu, 24 Mar 2016 14:34:38 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:34:50 test_weizq.py[line:448] INFO -----开始测试个人资料页面校验-----

> Thu, 24 Mar 2016 14:34:53 test_weizq.py[line:468] INFO 修改前的性别: 女

> Thu, 24 Mar 2016 14:34:58 test_weizq.py[line:472] INFO 性别修改为: 男

> Thu, 24 Mar 2016 14:34:58 test_weizq.py[line:437] INFO ==========结束测试我的内容==========

> Thu, 24 Mar 2016 14:35:14 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:35:35 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:35:47 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:36:01 test_weizq.py[line:429] INFO ==========开始测试我的内容==========

> Thu, 24 Mar 2016 14:36:12 test_weizq.py[line:448] INFO -----开始测试个人资料页面校验-----

> Thu, 24 Mar 2016 14:36:16 test_weizq.py[line:456] INFO 旧的昵称是: 5030013

> Thu, 24 Mar 2016 14:36:28 test_weizq.py[line:463] INFO 新的昵称是: 908602

> Thu, 24 Mar 2016 14:36:28 test_weizq.py[line:468] INFO 修改前的性别: 男

> Thu, 24 Mar 2016 14:36:33 test_weizq.py[line:475] INFO 性别修改为: 女

> Thu, 24 Mar 2016 14:36:33 test_weizq.py[line:437] INFO ==========结束测试我的内容==========

基本上看到这些日志就知道我到底在测试什么东西了。
