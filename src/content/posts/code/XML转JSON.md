---
title: "XML转JSON"
publishedAt: "2019-02-12T16:37:55+08:00"
categories: ["代码片段"]
tags: ["Python"]
path: "/code/XML转JSON.html"
---

## 背景
XML格式的解析一直是很头疼的问题，这里提供一个XML转JSON的神奇代码片段。

## 代码

```python

try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET

class XmlListConfig(list):
    def __init__(self, aList):
        for element in aList:
            if element:
                # treat like dict
                if len(element) == 1 or element[0].tag != element[1].tag:
                    self.append(XmlDictConfig(element))
                # treat like list
                elif element[0].tag == element[1].tag:
                    self.append(XmlListConfig(element))
            elif element.text:
                text = element.text.strip()
                if text:
                    self.append(text)


class XmlDictConfig(dict):
    def __init__(self, parent_element):
        if parent_element.items():
            self.update(dict(parent_element.items()))
        for element in parent_element:
            if element:
                if len(element) == 1 or element[0].tag != element[1].tag:
                    aDict = XmlDictConfig(element)
                else:
                    aDict = {element[0].tag: XmlListConfig(element)}
                if element.items():
                    aDict.update(dict(element.items()))
                self.update({element.tag: aDict})
            elif element.items():
                self.update({element.tag: dict(element.items())})
            else:
                self.update({element.tag: element.text})

class XmlOp(object):
    @staticmethod
    def xml2dict(src):
        tree = ET.XML(src)
        xmldict = XmlDictConfig(tree)
        return xmldict
```

## 调用实例

```python
src = '<?xml version="1.0" encoding="utf-8" ?><root><Node1>122621000</Node1><Node2>exist in param</Node2><Node3>154009366</Node3><Node4>0</Node4></root>'
print XmlOp.xml2dict(src)
```

结果：

```
{'Node1': '122621000', 'Node3': '154009366', 'Node2': 'exist in param', 'Node4': '0'}
```