---
title: "记一个ajax下载的坑"
publishedAt: "2017-10-19T15:26:36+08:00"
categories: ["大前端"]
tags: ["js"]
path: "/web/记一个ajax下载的坑.html"
---

## 背景
我们用了一个开源的测试管理平台，但是这个平台只支持用例用XML导入，用XML来写测试用例那简直就是反人类，因此，我要写一个脚本来把Excel转成XML格式。然而，脚本要给大家用的，因此要放在WEB上，功能就是上传写好的测试用例，然后脚本转成XML之后下载到用户本地。

## 结论
先说结论。

`ajax`并不支持下载文件！

`ajax`并不支持下载文件！

`ajax`并不支持下载文件！

## 过程
项目结构是`Flask`+`Vue.js`。首先需要做一个下载模板的功能，我的第一想法就是发一个`ajax`请求到后台，然后后台把文件返回给前端，前端来下载这个文件。

实施起来难度也并不大，但是执行之后发现，通讯是正常的，但是后台返回的是一个流文件内容。如下图所示
![](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/1537776145.956094.jpg)

但是如果是同样的地址（localhost:5000/download?filename=test.xls），在浏览器访问，就能正常的下载文件。

后台代码都是同一个：

```python
@BP_VIEW.route('/download', methods=["GET", "POST"])
def download():
	filename = request.values.get('filename')
	return send_from_directory(os.path.join(os.getcwd() + '/upload/modelfile/'), filename, as_attachment=True)
```

## 正确的姿势
正确的实现方式就是后台返回一个url地址，然后用`js`直接执行`window.location.href=url`。如果实在想用`ajax`来实现流文件内容的下载，可以去`Github`找找有没有大神来解决。

## 另外记一个
在开发的过程中用`ajax`来上传附件，需要使用`FormData`这个对象。

下面是一个用`Vue.js`实现上传文件的代码：

```html
html
<label for="exampleInputFile">上传文件</label>
<input type="file" @change="getFile">

js
<script>
upload: function () {
                    var MyForm = new FormData();
                    MyForm.append('filename', this.file, "xls");
                    this.$http.post('/upload', MyForm, {emulateJSON: true}).then(function (rst) {
                        console.log(rst);
                        if (rst['body']['code'] === '0000') {
                            var filename = rst['body']['filename'];
                            window.location.href = 'downloadcase?filename=' + filename
                        } else {
                            alert(rst['body']['msg'])
                        }
                        app.button_text = '提交'
                    })
</script>
```

