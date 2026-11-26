---
title: "Android和Appium自学自测（一）"
publishedAt: "2016-12-29T17:00:53+08:00"
categories: ["Test"]
tags: ["测试","Android","Appium"]
path: "/Test/Android和Appium自学自测（一）.html"
---

![20161220](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537776487.279417.jpg)

## 背景
本来今年计划是要把Android和iOS都学一下，结果现在到年底了，还是没点苗头，再怎样也应该开个头，于是就买了《第一行代码（第二版）》开始学习Android，在学习的过程中，利用Appium来测试自己写出来的东西，也不失为一个学习的方法。

项目Github地址：[https://github.com/diandianhanbin/LearnAndroidDoAppium](https://github.com/diandianhanbin/LearnAndroidDoAppium)

## TextView
这个控件对应着HTML的Label，其实可以理解为一个标签，用来展示文本内容，当然，它也可以监听点击，所以在某种程度上来说，也可以发挥一个按钮的作用。

```
<TextView
        android:id="@+id/text_view"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="24sp"
        android:gravity="center|center_horizontal"
        android:text="This is a TextView!" />
```

`TextView`控件可以定义`id`，这个`id`无论对于开发还是测试，都是很有用的东西，开发的时候，可以通过id来对控件监听、设置等操作。

比如下面的代码就是用来关联和设置`TextView`。

```
textView = (TextView) findViewById(R.id.text_view);

case R.id.changeTextView:
                if (textView.getText().toString() == "Change Text") {
                    textView.setText("This is a TextView");
                } else {
                    textView.setText("Change Text");
                }
                break;
```

对于测试来说，这个控件就是获取文本最方便的地方。利用`uiautomatorviewer`我们可以很直接的获取这个控件的`resource-id`

**注：`resource-id的组成是 包名 + / + id`**

[原图待补](<http://7xsgl3.com1.z0.glb.clouddn.com//1482995586.png>)

在使用Appium测试的过程中获取的方式就是这样的

```python
TextView = methodConfig.SIMPLEREAD['TextView']

def getTextView(self):
		"""
		获取TextView
		:return:str, 标题文本
		"""
		return self.getTextOfElement(*self.TextView)
		
class MessageSimpleRead(AppiumBaseTest, SimpleRead):
	def test001_checkTextView(self):
		"""测试TextView内容是否正确"""
		textcontent = self.getTextView()
		self.assertEqual('This is a TextView!', textcontent)
```

## Activity
`Activity`应该是Android的非常重要的东西，属于Android的四大组件之一。

简单的来理解，`Activity`可以理解为一个`HTML`页面，Android所有的显示，都是由`Activity`来承载，关于`Activity`的信息就不多写了，在网络上很多，主要需要熟悉它的生命周期.

这里我用按钮来触发跳转第二个`Activity`，所以在测试的时候需要测试这个跳转。

Android部分是一个显式启动，代码如下：

```
@Override
    public void onClick(View v) {
        Intent intent = new Intent(MainActivity.this, SecondActivity.class);
        startActivity(intent);
    }
```

对应的Appium的操作方法如下：

```python
SecondActivity = methodConfig.SIMPLEREAD['SecondActivity']

def clickButtonStartActivity(self):
		"""
		点击按钮启动Activity
		:return:
		"""
		self.clickElement(*self.ButtonStartActivity)

	def checkSecondActivity(self):
		"""
		检查是否启动第二个Activity
		:return: True or False
		"""
		return self.waitActivity(self.SecondActivity)
		
def test003_changeActivity(self):
		"""跳转Activity测试"""
		self.clickButtonStartActivity()
		self.assertEqual(self.checkSecondActivity(), True)
		self.assertEqual(self.getSecondActivityTextView(), u'This is Second Activity')
```

当然，通过`Appium`还有其他方法启动`Activity`，源码中对应的还有这个方法：

```python
def start_activity(self, app_package, app_activity, **opts):
        """Opens an arbitrary activity during a test. If the activity belongs to
        another application, that application is started and the activity is opened.

        This is an Android-only method.

        :Args:
        - app_package - The package containing the activity to start.
        - app_activity - The activity to start.
        - app_wait_package - Begin automation after this package starts (optional).
        - app_wait_activity - Begin automation after this activity starts (optional).
        - intent_action - Intent to start (optional).
        - intent_category - Intent category to start (optional).
        - intent_flags - Flags to send to the intent (optional).
        - optional_intent_arguments - Optional arguments to the intent (optional).
        - stop_app_on_reset - Should the app be stopped on reset (optional)?
        """
        data = {
            'appPackage': app_package,
            'appActivity': app_activity
        }
        arguments = {
            'app_wait_package': 'appWaitPackage',
            'app_wait_activity': 'appWaitActivity',
            'intent_action': 'intentAction',
            'intent_category': 'intentCategory',
            'intent_flags': 'intentFlags',
            'optional_intent_arguments': 'optionalIntentArguments',
            'stop_app_on_reset': 'stopAppOnReset'
        }
        for key, value in arguments.items():
            if key in opts:
                data[value] = opts[key]
        self.execute(Command.START_ACTIVITY, data)
        return self
```

不过正常来说，不建议这么处理，因为这样处理，就没有覆盖到点击按钮跳转`Activity`这个业务场景了。

## Menu
系统的`Menu`对测试来说绝对一个大坑。

从开发上来看，是一个非常正常的开发流程，在`xml`中写一个`menu`的布局、控件名称和控件ID。然后在需要展示`Menu`的`Activity`中调用如下方法即可生成`Menu`：

```
@Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }
```

这是一个再正常不过的开发方式了，但是到了测试这里，完全就是一个深坑。

比如，我在定义这个`Menu`的时候，用的`id`是这样的：

```
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/main_menu"></menu>
```

但是用`uiautomatorviewer`来查看的时候，它给我显示的却是这个

[原图待补](<http://7xsgl3.com1.z0.glb.clouddn.com//1482999216.png>)

WTF!!!这个菜单竟然是一个`ImageView`，然后，我定义的`id`呢？被Android吃了么？？？？

然后再看这个菜单栏。。。。从`uiautomatorviewer`上来看，是由一个一个的`ListView`组成的，这些我不关心，作为测试，我关心的依然是它的`id`。

[原图待补](<http://7xsgl3.com1.z0.glb.clouddn.com//1482999447.png>)

从`uiautomatorviewer`探测的结果是`com.example.svenweng.uiwidgettest:id/title`。可是，我特么开发的时候，定义的是这样的啊啊啊啊！！！

```
<item
        android:id="@+id/getTextView"
        android:title="@string/main_menu_getTextView"/>
    <item
        android:id="@+id/changeTextView"
        android:title="@string/main_menu_changeTextView"/>
    <item
        android:id="@+id/changeImageView"
        android:title="@string/main_menu_changeImageView"/>
    <item
        android:id="@+id/changeProgressBar"
        android:title="@string/main_menu_changeProgressBar"/>
    <item
        android:id="@+id/insertProgressBar"
        android:title="@string/main_menu_insertProgressBar"/>
    <item
        android:id="@+id/delProgressBar"
        android:title="@string/main_menu_delProgressBar"/>
    <item
        android:id="@+id/alertDialog"
        android:title="@string/main_menu_alertDialog"/>
    <item
        android:id="@+id/alertProgressDialog"
        android:title="@string/main_menu_progressDialog"/>
```

Android你全部给我改成`com.example.svenweng.uiwidgettest:id/title`是几个意思？？？？

在开发调用对应菜单监控的时候，用的也是它的`id`啊！！！

```
switch (item.getItemId()) {
            case R.id.getTextView:
                Toast.makeText(this, textView.getText().toString(), Toast.LENGTH_SHORT).show();
                break;
            case R.id.changeTextView:
                if (textView.getText().toString() == "Change Text") {
                    textView.setText("This is a TextView");
                } else {
                    textView.setText("Change Text");
                }
                break;
            case R.id.changeImageView:
                imageView.setImageResource(R.drawable.img_1);
                break;
            case R.id.changeProgressBar:
                if (progressBar.getVisibility() == View.GONE) {
                    progressBar.setVisibility(View.VISIBLE);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
                break;
            case R.id.insertProgressBar:
                progress = progress + 10;
                oriProgressBar.setProgress(progress);
                break;
            case R.id.delProgressBar:
                progress = progress - 10;
                oriProgressBar.setProgress(progress);
                break;
            case R.id.alertDialog:
                AlertDialog.Builder dialog = new AlertDialog.Builder(MainActivity.this);
                dialog.setTitle("This is a Dialog");
                dialog.setMessage("This is a Message");
                dialog.setCancelable(false);
                dialog.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        Toast.makeText(MainActivity.this, "OK", Toast.LENGTH_SHORT).show();
                    }
                });
                dialog.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        Toast.makeText(MainActivity.this, "Cancel", Toast.LENGTH_SHORT).show();
                    }
                });
                dialog.show();
                break;
            case R.id.alertProgressDialog:
                ProgressDialog progressDialog = new ProgressDialog(MainActivity.this);
                progressDialog.setTitle("This is a ProgressDialog");
                progressDialog.setMessage("loading....");
                progressDialog.setCancelable(true);
                progressDialog.show();
                break;
            default:
                break;
```

为毛线在测试使用的时候，唯一的`id`都变成了一样的东西啊！！！

## 最后
我一直坚持的观点，不懂开发就很难测试，从这一次的学习来看，我之前有很多想法是有一些问题的，以前我总是觉得开发为什么这么懒，控件不用就不加`id`，或者老喜欢用同样的`id`。现在我终于知道了，很多时候我都在错怪开发。

