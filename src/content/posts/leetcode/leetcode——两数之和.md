---
title: "leetcode——两数之和"
publishedAt: "2019-10-20T22:17:19+08:00"
categories: ["leetcode"]
tags: ["leetcode"]
path: "/leetcode/leetcode——两数之和.html"
---


## 问题
>给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。
你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。

示例：
```
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

## 思路过程
第一次接触`LeetCode`，感觉这题真的是非常简单。两次遍历这个数组，求和就可以解决这个问题了。

```python
class Solution(object):
    def twoSum(self, nums, target):
        for i, x in enumerate(nums):
            for j, y in enumerate(nums):
                if i == j:
                    pass
                else:
                    if x+y == target:
                        return i, j
```
提交后发现，解答超时了，这时候，才开始真正的去思考，应该如何提升效率。

上面的代码很明显，每次都额外判断了`i==j`，把这个判定稍微修改一下。

```python
class Solution(object):
    def twoSum(self, nums, target):
        for i, x in enumerate(nums):
            for j, y in enumerate(nums):
                if x+y == target:
                    if i != j:
                        return i, j
```

这样简单修改了一下，发现提交通过了，解题时间花了`4000+ms`，似乎还有更大的提升空间。

遍历`hash表`的效率是比遍历`数组`的效率高的，因此我们可以把第二次遍历`数组`改为`hash表`。

```python
class Solution(object):
    def twoSum(self, nums, target):
        dicts = {}
        for i, x in enumerate(nums):
            dicts[x] = i
        for i, x in enumerate(nums):
            if (target-x) in dicts:
                if i != dicts[(target-x)]:
                    return i, dicts[target-x]
```

以上，代码结构和思路没有变化，只是把`数组`替换成`hash表`，但是解题时间从`4000+ms`缩短为`58ms`

## 结语
第一次接触`LeetCode`，突然发现这些题目做完之后，可以优化我们平时写代码的习惯。
