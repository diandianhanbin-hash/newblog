---
title: "ai学习第一课"
publishedAt: "2024-01-29T20:13:54+08:00"
categories: ["AI"]
tags: ["Python","AI"]
path: "/ai/ai学习第一课.html"
---

# 目的

学习的第一课是一个走迷宫的案例。
有一个九宫格的迷宫，我们会在这个九宫格上话一些线段作为挡板，最终要通过系统自己学习快速走完迷宫。

# 画出迷宫

```python
import matplotlib.pyplot as plt

def draw_maze():
    fig = plt.figure(figsize=(5, 5))
    ax = plt.gca()

    plt.plot([1, 1], [0, 1], color='red', linewidth=2)
    plt.plot([1, 2], [2, 2], color='red', linewidth=2)
    plt.plot([2, 2], [2, 1], color='red', linewidth=2)
    plt.plot([2, 3], [1, 1], color='red', linewidth=2)

    plt.text(0.5, 2.5, "S0", size=14, ha='center')
    plt.text(1.5, 2.5, "S1", size=14, ha='center')
    plt.text(2.5, 2.5, "S2", size=14, ha='center')
    plt.text(0.5, 1.5, "S3", size=14, ha='center')
    plt.text(1.5, 1.5, "S4", size=14, ha='center')
    plt.text(2.5, 1.5, "S5", size=14, ha='center')
    plt.text(0.5, 0.5, "S6", size=14, ha='center')
    plt.text(1.5, 0.5, "S7", size=14, ha='center')
    plt.text(2.5, 0.5, "S8", size=14, ha='center')

    plt.text(0.5, 2.3, "START", ha='center')
    plt.text(2.5, 0.3, "GOAL", ha='center')

    ax.set_xlim(0, 3)
    ax.set_ylim(0, 3)
    plt.tick_params(axis='both', which='both', bottom='off', top='off', labelbottom='off', right='off', left='off',
                    labelleft='off')

    line, = ax.plot([0.5], [2.5], marker='o', color='g', markersize=60)
```

这段代码主要是演示画出来的图，需要注意的是，需要用jupyter notebook，或者pycharm这类支持画图的IDE来执行。图片如下

![图片](https://blog-img-1251534856.cos.ap-guangzhou.myqcloud.com/img/2024-01-29_18-19-23.png)

这里的图片仅用于感知迷宫，不画出此图，不影响后续代码的实现。

# 定义每个位置的行为

```python
# 上，右，下，左
theta_0 = np.array([
    [np.nan, 1, 1, np.nan],  # s0
    [np.nan, 1, np.nan, 1],  # s1
    [np.nan, np.nan, 1, 1],  # s2
    [1, 1, 1, np.nan],  # s3
    [np.nan, np.nan, 1, 1],  # s4
    [1, np.nan, np.nan, np.nan],  # s5
    [1, np.nan, np.nan, np.nan],  # s6
    [1, 1, np.nan, np.nan]  # s7
])
```

每个数组的行为分别定义可以移动的方向，顺序是：上，右，下，左。

# 计算每个行为的概率

```python
def simple_convert_into_pi_from_theta(theta):
    [m, n] = theta.shape
    pi = np.zeros((m, n))
    for i in range(0, m):
        pi[i, :] = theta[i, :] / np.nansum(theta[i, :])

    pi = np.nan_to_num(pi)
    return pi
```

这里其实就是针对每一个点位进行下一次移动的概率计算，目前计算的方式就是平均概率，比如`S0`，起点只能往右或者往下，那么对应的每个行为的概率就是`1/(1+1)`。以此类推。

# 获取下一步的坐标

```python
def get_next_s(pi, s):
    direction = ["up", "right", "down", "left"]

    next_direction = np.random.choice(direction, p=pi[s, :])

    if next_direction == "up":
        s_next = s - 3
    elif next_direction == "right":
        s_next = s + 1
    elif next_direction == "down":
        s_next = s + 3
    elif next_direction == "left":
        s_next = s - 1

    return s_next
```

我们定义的迷宫是`3*3`的。对应的坐标就是：
```
0  1  2
3  4  5
6  7  8
```
因此这里其实是定义下一步的目的地例如往上走，就是坐标`-3`.

# 计算到达终点的路径

```python
def goal_maze(pi):
    s = 0
    state_history = [0]

    while True:
        next_s = get_next_s(pi, s)
        state_history.append(next_s)

        if next_s == 8:
            break
        else:
            s = next_s

    return state_history
```

这几个组合最终跑下来，可以看到执行结果如下：

```python
pi_0 = simple_convert_into_pi_from_theta(theta_0)
state_history = goal_maze(pi_0)
print(pi_0)
print(state_history)

>>>

[[0.         0.5        0.5        0.        ]
 [0.         0.5        0.         0.5       ]
 [0.         0.         0.5        0.5       ]
 [0.33333333 0.33333333 0.33333333 0.        ]
 [0.         0.         0.5        0.5       ]
 [1.         0.         0.         0.        ]
 [1.         0.         0.         0.        ]
 [0.5        0.5        0.         0.        ]]
[0, 1, 0, 3, 4, 3, 4, 7, 8]

```

当然，也不是每次都这么顺利。有时候执行的结果会非常长。

```
[0, 1, 0, 3, 6, 3, 6, 3, 0, 3, 4, 7, 4, 3, 6, 3, 0, 1, 2, 5, 2, 5, 2, 5, 2, 1, 0, 3, 0, 1, 0, 3, 0, 1, 0, 3, 6, 3, 4, 7, 4, 7, 4, 7, 8]
```

究其原因，就是概率是随机的。

而我们要做的，则是让他走正确步骤的概率变大，变大之后，走的步数就会变少，或者直接走向正确的道路。

# 调整思路

我们其实可以把这个问题抽象一下，如果走的步数越少，那么走的路就是正确的。

在我们之前的执行结果中，重复出现的次数越多的坐标，那么走到这个坐标的步骤的概率就要降低。

我们重复执行N次，我们就能得到哪些步骤执行的次数多，哪些步骤执行少。执行感步骤少的，概率就要提高，执行步骤多的，概率就要降低。

# 改造
基于上面的思路，我们改造一下相关方法。

```python
simple_convert_into_pi_from_theta >> softmax_convert_into_pi_from_theta

def softmax_convert_into_pi_from_theta(theta):
    beta = 1.0
    [m, n] = theta.shape
    pi = np.zeros((m, n))
    exp_theta = np.exp(beta * theta)

    for i in range(0, m):
        pi[i, :] = exp_theta[i, :] / np.nansum(exp_theta[i, :])

    pi = np.nan_to_num(pi)
    return pi


get_next_s >> get_action_and_next_s

def get_action_and_next_s(pi, s):
    direction = ["up", "right", "down", "left"]

    next_direction = np.random.choice(direction, p=pi[s, :])

    if next_direction == "up":
        action = 0
        s_next = s - 3
    elif next_direction == "right":
        action = 1
        s_next = s + 1
    elif next_direction == "down":
        action = 2
        s_next = s + 3
    elif next_direction == "left":
        action = 3
        s_next = s - 1

    return [action, s_next]

goal_maze >> goal_maze_ret_s_a

def goal_maze_ret_s_a(pi):
    s = 0
    s_a_history = [[0, np.nan]]

    while True:
        [action, next_s] = get_action_and_next_s(pi, s)
        s_a_history[-1][1] = action
        s_a_history.append([next_s, np.nan])
        if next_s == 8:
            break
        else:
            s = next_s

    return s_a_history
```

除此之外，我们还要对概率进行修正。

```python
def update_theta(theta, pi, s_a_history):
    eta = 0.1
    T = len(s_a_history) - 1
    [m, n] = theta.shape
    delta_theta = theta.copy()
    for i in range(0, m):
        for j in range(0, n):
            if not (np.isnan(theta[i, j])):
                SA_i = [SA for SA in s_a_history if SA[0] == i]
                SA_ij = [SA for SA in s_a_history if SA == [i, j]]
                N_i = len(SA_i)
                N_ij = len(SA_ij)
                delta_theta[i, j] = (N_ij - pi[i, j] * N_i) / T
    new_theta = theta + eta * delta_theta
    return new_theta
```

这里对应的公式是：

$$\theta_{s_i,a_j} = \theta_{s_i,a_j} + \eta\cdot\Delta\theta_{s,a_j}$$

$$\Delta\theta_{s,a_j} = \{N(s_i,a_j) - P(s_i,a_j)N(s_i,a)\} / T$$

最终执行函数：

```python
def main():
    stop_epsilon = 10 ** -4
    pi_0 = pi_0 = softmax_convert_into_pi_from_theta(theta_0)
    theta = theta_0
    pi = pi_0
    is_continue = True
    count = 1
    while is_continue:
        s_a_history = goal_maze_ret_s_a(pi)
        new_theta = update_theta(theta, pi, s_a_history)
        new_pi = softmax_convert_into_pi_from_theta(new_theta)
        change = np.sum(abs(new_pi - pi))
        print(change)
        if change < stop_epsilon:
            is_continue = False
        else:
            theta = new_theta
            pi = new_pi
        count += 1
    np.set_printoptions(precision=3, suppress=True)
    print(pi)
    print(count)
```

改造的点在于要把每个移动的步骤给体现出来，
在`update`函数里面，我们把出现移动步骤和坐标出现多的情况给抓出来，进行概率计算并且修正这个概率。再用修正后的概率再玩一次迷宫，继续修正。
这样持续N次之后，变动比率低于我们的阈值`10的-4次方`时，就不继续进行计算了，这个最终的概率，就是我们迷宫的通路。

```python
[[0.    0.014 0.986 0.   ]
 [0.    0.238 0.    0.762]
 [0.    0.    0.443 0.557]
 [0.012 0.977 0.011 0.   ]
 [0.    0.    0.983 0.017]
 [1.    0.    0.    0.   ]
 [1.    0.    0.    0.   ]
 [0.013 0.987 0.    0.   ]]
```

可以用这个与迷宫图来对比，绝大部分正确的路，概率都在`98%`左右，基本上可以保证用这个概率去玩这个迷宫游戏，妥妥的是直达终点。

# 概念延伸

这里的修正算法使用的是`REINFORCE算法`，一开始可以不可以纠结这个算法是啥，只需要知道它能修正这个概率即可。

从AI的角度来看，每个算出来的概率矩阵，都是一个“模型”。

可以看到最初的那个模型是非常糟糕的，会走很多弯路，而最后我们通过学习得到的“模型”就非常有效了。

训练的次数我们也打出来了，我试了好多次，大概在`4000`次左右，也就是说我们的“AI”在经过4000次的玩游戏之后，学会了走这个迷宫。

# 一些问题

这里的方法并不是剃度下降的，也就是说训练的过程概率其实是随机的，会导致非常多的无效计算，我们这里的计算非常简单，所以感知不明显，如果换成大模型，这么多的无效计算会浪费非常多的资源。