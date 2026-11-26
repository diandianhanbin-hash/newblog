---
title: "requests源码简略阅读"
publishedAt: "2019-06-20T00:10:47+08:00"
categories: ["Python"]
tags: ["Python","requests"]
path: "/python/requests源码简略阅读.html"
---

## 背景

`requests`库号称是为人类设计的`HTTP`请求库，个人也经常使用这个库，因此对它的源码产生了兴趣，带着这个目的去看看它的源码。

## api
`requests`的最外层是`api`层，这里提供了对外暴露的接口，比如我们使用`requests.get`那么这个`get`方法就是在`api`这里定义的方法。

```python
def get(url, params=None, **kwargs):
    """Sends a GET request.

    :param url: URL for the new :class:`Request` object.
    :param params: (optional) Dictionary or bytes to be sent in the query string for the :class:`Request`.
    :param \*\*kwargs: Optional arguments that ``request`` takes.
    :return: :class:`Response <Response>` object
    :rtype: requests.Response
    """

    kwargs.setdefault('allow_redirects', True)
    return request('get', url, params=params, **kwargs)
```

这里观察了一系列的方法啊，可以看到这里其实调用的是`api`中的`request`方法，而`request`中调用的是`session`中的方法。继续跟到`session`中去

## session
`session`是`requests`用来会话管理的这么一个类，在`api`层看到的方法参数其实只是一个`**kwargs`，我们并不知道可以传什么参数进来，但是在`session`层我们就能看到它接受的参数了。

```python
    def request(self, method, url,
        params=None,
        data=None,
        headers=None,
        cookies=None,
        files=None,
        auth=None,
        timeout=None,
        allow_redirects=True,
        proxies=None,
        hooks=None,
        stream=None,
        verify=None,
        cert=None,
        json=None):
```

在`api`层会根据调用方法定义好`method`，而`url`是用户传入的参数，我们常用的`params`，`data`，`headers`，`cookies`等参数在这里就能看到了。

之后代码会把这些参数用来初始化`Model`层的一个`Request`对象。初始化后调用`prepare_request`方法做请求前的准备，其实说白了就是要做请求串的拼装了，因为`HTTP`请求，本质上来说是`TCP`的请求，只是数据格式被严格定义好了的字符串。

### prepare

准备阶段首先是处理`Cookie`。

```python
cookies = request.cookies or {}

# Bootstrap CookieJar.
if not isinstance(cookies, cookielib.CookieJar):
    cookies = cookiejar_from_dict(cookies)

# Merge with session cookies
merged_cookies = merge_cookies(
    merge_cookies(RequestsCookieJar(), self.cookies), cookies)
```

从源码可以看到，`Cookie`是通过`cookiejar`这个对象来管理的，这里会把传入的`cookie`与会话中的`cookie`做一个合并。再往下就是鉴权。

`cookie`和鉴权处理了之后，就会把参数全部用来初始化`Model`层的`PreparedRequest`对象，之后把这个对象返回回去。

当然，在`PreparedRequest`对象中会把改解析的数据全部做一次解析，源码如下：
```python
    def prepare(self, method=None, url=None, headers=None, files=None,
        data=None, params=None, auth=None, cookies=None, hooks=None, json=None):
        """Prepares the entire request with the given parameters."""

        self.prepare_method(method)
        self.prepare_url(url, params)
        self.prepare_headers(headers)
        self.prepare_cookies(cookies)
        self.prepare_body(data, files, json)
        self.prepare_auth(auth, url)

        # Note that prepare_auth must be last to enable authentication schemes
        # such as OAuth to work on a fully prepared request.

        # This MUST go after prepare_auth. Authenticators could add a hook
        self.prepare_hooks(hooks)
```

这里继续跟下去，会看到很多编码的处理。具体的代码有兴趣的可以自己跟一下，基本上都是一些字符串的处理。

* Cookie的处理

值得一提的是，之前我一直有一个困惑，`Cookie`在请求头里面的，为什么`requests`的参数中会把`cookie`单独列出来，我直接在`headers`里面写上`"Cookie": "abcdefg"`和用cookie参数传进去会有什么区别。从源代码里面去看，实际上是没有区别的。

```python
    def prepare_cookies(self, cookies):
        if isinstance(cookies, cookielib.CookieJar):
            self._cookies = cookies
        else:
            self._cookies = cookiejar_from_dict(cookies)

        cookie_header = get_cookie_header(self._cookies, self)
        if cookie_header is not None:
            self.headers['Cookie'] = cookie_header
```

可以看到，最后会把`cookiejar`对象中的数据转成字符串后扔到`header`里面。其实也确实应该最终放到头部，毕竟在`HTTP`标准中，`Cookie`就是放在头部往下传的。

* 数据层的处理

请求数据有三种类型，`json`数据、`表单数据`和`文件`。

首先会处理`json`。

```python
if not data and json is not None:
    content_type = 'application/json'
    body = complexjson.dumps(json)
```

如果传入参数是`json`，那么就会把请求的`Content-Type`设置为`application/json`，然后用`json.dumps()`去处理数据。

然后来判断是否是流信息。

```python
is_stream = all([
            hasattr(data, '__iter__'),
            not isinstance(data, (basestring, list, tuple, dict))
        ])
```

这里有意思的是`all`这个方法。

再接下来是处理文件类型和如果是文件类型。

文件类型支持多个参数，比较重要的是要调用`open`方法把文件打开后传入，而源码在处理的时候会调用对象的`read()`方法，`fdata = fp.read()`。

最后才是处理表单类型的数据

```python
if data:
    body = self._encode_params(data)
    if isinstance(data, basestring) or hasattr(data, 'read'):
        content_type = None
    else:
        content_type = 'application/x-www-form-urlencoded'
```

## 发送请求
发送请求其实调用的是`urllib3`的能力。在上面的准备阶段做完之后，会把配置做一个合并，然后调用`send`方法，`send`方法会调到`adapter.py`中封装的方法，请求完毕后，返回请求的结果。为了使用起来友好，在拿到返回结果之后，会把请求的对象和返回的对象做一个合并。
```python
return self.build_response(request, resp)

    def build_response(self, req, resp):
        response = Response()

        # Fallback to None if there's no status_code, for whatever reason.
        response.status_code = getattr(resp, 'status', None)

        # Make headers case-insensitive.
        response.headers = CaseInsensitiveDict(getattr(resp, 'headers', {}))

        # Set encoding.
        response.encoding = get_encoding_from_headers(response.headers)
        response.raw = resp
        response.reason = response.raw.reason

        if isinstance(req.url, bytes):
            response.url = req.url.decode('utf-8')
        else:
            response.url = req.url

        # Add new cookies from the server.
        extract_cookies_to_jar(response.cookies, req, resp)

        # Give the Response some context.
        response.request = req
        response.connection = self

        return response
```

这里就是对返回结果的一些封装了。

## 最后
可以看到`requests`库的封装比较好，通过`api`层来暴露接口，往下用一个`session`来做规划管理，收拢数据和配置，再根据关键的`method`做路由分发，组参数。最后调用请求方法，通过这样的分层包装，使用起来非常简单，但功能却很强大。
