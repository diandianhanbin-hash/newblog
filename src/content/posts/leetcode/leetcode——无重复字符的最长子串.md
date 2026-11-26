---
title: "leetcode——无重复字符的最长子串"
publishedAt: "2022-11-17T22:17:19+08:00"
categories: ["leetcode"]
tags: ["leetcode"]
path: "/leetcode/leetcode——无重复字符的最长子串.html"
---

## 题目

原题链接：https://leetcode.cn/problems/longest-substring-without-repeating-characters/

## 思路

看到这题，第一反应的解法就是把最多的字符捞出来。

所以一开始我的思路就是从左开始往右移动下标，一位一位的取出字符来比较，如果发现没有重复，则把字符添加到临时字符串里面，如果发现出现重复了，此时把最大长度的字符串与这个临时字符串相比，如果临时字符长度大则交换位置。
通过上面的遍历，就能拿到最长的字符串，最后计算这个字符串的长度即可。

```go
func lengthOfLongestSubstring(s string) int {
	if len(s) == 0 || len(s) == 1 {
		return len(s)
	}
	var mostLengthString, tmpString string
	for count := 0; count < len(s); count++ {
		tmpString = ""
		data := s[count:]
		for i := range data {
			if len(data) < len(mostLengthString) {
				continue
			}
			if tmpString == "" {
				tmpString = string(data[i])
			} else {
				if strings.Contains(tmpString, string(data[i])) {
					if len(tmpString) > len(mostLengthString) {
						mostLengthString = tmpString
						break
					}
					break
				} else {
					tmpString += string(data[i])
				}
			}
			if i == len(data)-1 {
				if len(tmpString) > len(mostLengthString) {
					mostLengthString = tmpString
					break
				}
			}
		}
	}
	fmt.Println(mostLengthString)
	return len(mostLengthString)
}
//runtime:188 ms
//memory:6.6 MB

```

这种写法确实通过了验证，可以解题，但是这里还是有一些问题的。从代码上来看，这里的边界条件着实有点多，我自己在写的时候，想了很久，并且经过很多测试用例执行失败的调试后，才补全了所有的边界判定，通过了。


## 通用思路
我个人的思路单纯就是一个解题。提交之后我去参阅了其他人的答案，基本上都是使用滑动窗口的方式来实现，相比于我之前的想法，遍历的次数会更少。

```go
func lengthOfLongestSubstring(s string) int {
	n := len(s)
	if n <= 1 {
		return n
	}
	var maxLen = 1
	var left, right, window = 0, 0, make(map[byte]bool)
	for right < n {
		rv := s[right]
		for window[rv] {
			delete(window, s[left])
			left++
		}
		window[rv] = true
		if right-left+1 > maxLen {
			maxLen = right - left + 1
		}

		right++
	}
	return maxLen
}
//runtime:16 ms
//memory:2.4 MB

```

这种方式实现的代码少了很多，阅读起来也比较简单，实质上原理也差不多。

这种方式先滑动右侧下标，通过每次滑动的值，对比已滑过的值来做校验，如果这个值在已滑过的值出现过，那么就移动左下标，一直移动到左下标滑过这个重复的串。再针对每次出现重复的状况计算左右下标的长度，最终获取到最长的长度。

这端代码执行花了16ms，消耗了2.4MB的内存。相比起来，效率比我之前想的方法高了很多。

这里通过了一个`byte:bool`来存储这个滑动的窗口，直接操作`byte`和`map`效率明显比字符串效率高了非常多，资源的消耗也少了。

## Python版本

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        n = len(s)
        if n <= 1:
            return n
        max_length, left, right = 1, 0, 0
        while right < n:
            while s[right] in s[left: right]:
                left += 1
            if len(s[left: right]) + 1 > max_length:
                max_length = len(s[left: right]) + 1
            right += 1
        return max_length
# runtime:48 ms
# memory:15.1 MB
```

Python版本的代码简洁了很多，思路基本上差不多，Python的语法糖比较香，因此这里也不需要设置一个中间容器来存储滑动窗口，直接用下标来计算即可。

## 总结
学习到了滑动窗口的解题思维。