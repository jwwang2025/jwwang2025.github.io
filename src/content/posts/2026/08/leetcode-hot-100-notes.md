---
title: LeetCode Hot 100 学习记录：算法刷题笔记与解题思路
date: 2026-08-24
description: 系统记录 LeetCode Hot 100 题目的刷题过程、解题思路、代码实现，按题型分类整理，包含算法模板总结。
categories:
  - 算法
tags:
  - LeetCode
  - 数据结构
  - 算法
  - 刷题笔记
  - 学习记录
readingTime: 60
series: LeetCode Hot 100
seriesOrder: 1
draft: false
hidden: false
published: true
---

## 引言

LeetCode Hot 100 是面试高频题库，涵盖了数据结构与算法的核心知识点。本文档用于系统记录我的刷题过程，包含每道题的解题思路、代码实现以及相关思考。通过分类整理和反复练习，建立完整的算法知识体系。

## 学习计划

### 刷题策略

1. **按题型分类刷**：先集中攻克同一类型题目，总结通用模板
2. **五遍刷题法**：第一遍看题解、第二遍独立写、第三遍一天后、第四遍一周后、第五遍面试前
3. **时间限制**：中等题 25 分钟、困难题 40 分钟，超时看题解

---

## 一、哈希表

### 1. 两数之和（Easy）

**题目链接**：[https://leetcode.cn/problems/two-sum/](https://leetcode.cn/problems/two-sum/)

#### 题目描述

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出和为目标值 `target` 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

#### 解题思路

- **暴力解法**：两层循环
- **哈希表优化**：遍历数组时，用哈希表记录已遍历元素及其下标。对于当前元素 `nums[i]`，检查 `target - nums[i]` 是否在哈希表中，若存在则找到答案

#### 代码实现

```python
def twoSum(nums: list[int], target: int) -> list[int]:
    num_map = {}  # key: 数值, value: 下标
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []
```

#### 思考与总结

- 哈希表的核心价值是将查找时间从 O(n) 降到 O(1)
- 注意边做边存，而不是先存完整张表再查（避免使用两次相同元素）
- Python 中使用 `dict`（字典）作为哈希表，`enumerate` 同时获取下标和值，写法简洁

---

### 49. 字母异位词分组（Medium）

**题目链接**：[https://leetcode.cn/problems/group-anagrams/](https://leetcode.cn/problems/group-anagrams/)

#### 题目描述

给你一个字符串数组，请你将字母异位词组合在一起。可以按任意顺序返回结果列表。

字母异位词是由重新排列源单词的所有字母得到的一个新单词。

#### 解题思路

- **排序作为 key**：对每个字符串排序，字母异位词排序后相同。将排序后的字符串作为哈希表的 key，value 是原字符串列表
- **计数作为 key**：统计每个字符串中 26 个字母的出现次数，将计数元组作为 key

#### 代码实现

```python
from collections import defaultdict

def groupAnagrams(strs: list[str]) -> list[list[str]]:
    anagram_map = defaultdict(list)
    
    for s in strs:
        # 排序后的字符串作为 key
        key = ''.join(sorted(s))
        anagram_map[key].append(s)
    
    return list(anagram_map.values())
```

**计数法（当字符串很长时更优）：**

```python
from collections import defaultdict

def groupAnagramsCount(strs: list[str]) -> list[list[str]]:
    anagram_map = defaultdict(list)
    
    for s in strs:
        # 用 26 个字母的计数作为 key
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        anagram_map[tuple(count)].append(s)
    
    return list(anagram_map.values())
```

#### 思考与总结

- 字母异位词的核心特征：字符计数完全相同
- 计数法在字符串很长时比排序法更优
- Python 中 `collections.defaultdict(list)` 可以省去判断 key 是否存在的麻烦
- 列表不能作为 dict 的 key，所以计数法中需要转为 `tuple(count)`

---

### 128. 最长连续序列（Medium）

**题目链接**：[https://leetcode.cn/problems/longest-consecutive-sequence/](https://leetcode.cn/problems/longest-consecutive-sequence/)

#### 题目描述

给定一个未排序的整数数组 `nums`，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

请你设计并实现时间复杂度为 **O(n)** 的算法解决此问题。

#### 解题思路

- **哈希集合去重**：先将所有元素存入 set，支持 O(1) 查找
- **只从起点开始遍历**：对于元素 `num`，如果 `num - 1` 不在 set 中，说明 `num` 是某个连续序列的起点。从 `num` 开始不断检查 `num + 1, num + 2, ...` 是否存在，记录长度

#### 代码实现

```python
def longestConsecutive(nums: list[int]) -> int:
    num_set = set(nums)
    max_len = 0
    
    for num in num_set:
        # 只从连续序列的起点开始
        if num - 1 not in num_set:
            current_num = num
            current_len = 1
            
            while current_num + 1 in num_set:
                current_num += 1
                current_len += 1
            
            max_len = max(max_len, current_len)
    
    return max_len
```

#### 思考与总结

- 关键优化：**不从中间元素开始遍历**。如果 `num - 1` 存在，说明 `num` 不是起点，跳过
- 这个优化保证了整体 O(n) 的时间复杂度，否则会退化为 O(n²)
- Python 中 `set` 的 `in` 操作是 O(1)，非常适合此类题目
- 类似的思想也用于图的遍历（只从未访问节点开始 DFS/BFS）

---

## 二、链表

### 206. 反转链表（Easy）

**题目链接**：[https://leetcode.cn/problems/reverse-linked-list/](https://leetcode.cn/problems/reverse-linked-list/)

#### 题目描述

给你单链表的头节点 `head`，请你反转链表，并返回反转后的链表。

#### 解题思路

- **迭代法（三指针）**：维护 `prev`、`curr`、`next` 三个指针，逐个翻转节点的 next 指针
- **递归法**：递归到尾节点，回溯时翻转当前节点与下一节点的关系

#### 代码实现

**迭代法：**

```python
from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val: int = 0, next: Optional['ListNode'] = None):
        self.val = val
        self.next = next

def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    prev = None
    curr = head
    
    while curr is not None:
        next_node = curr.next  # 保存下一个节点
        curr.next = prev       # 翻转当前节点的指针
        prev = curr            # prev 前进
        curr = next_node       # curr 前进
    
    return prev  # prev 最终指向新头节点
```

**递归法：**

```python
from typing import Optional

def reverseListRecursive(head: Optional[ListNode]) -> Optional[ListNode]:
    # 终止条件：空链表或只有一个节点
    if head is None or head.next is None:
        return head
    
    # 递归反转后续链表，返回新头节点
    new_head = reverseListRecursive(head.next)
    # 翻转当前节点与下一节点
    head.next.next = head
    head.next = None
    
    return new_head
```

#### 思考与总结

- 链表翻转的核心操作：`curr.next = prev`
- 迭代时注意保存 `next_node`，否则会断链
- 递归的关键：先递归到尾，再回溯处理当前节点。返回值始终是新头节点（原尾节点）
- Python 中注意 `Optional` 类型注解，LeetCode 中通常已经定义好 `ListNode`
- 翻转链表是很多链表题的基础子操作（如 K 个一组翻转、回文链表判断）

---

## 三、二叉树

### 前序遍历模板

```python
from typing import Optional, List

# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val: int = 0, left: Optional['TreeNode'] = None, right: Optional['TreeNode'] = None):
        self.val = val
        self.left = left
        self.right = right

# 递归
def preorderTraversal(root: Optional[TreeNode]) -> List[int]:
    result = []
    
    def dfs(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        result.append(node.val)   # 根
        dfs(node.left)            # 左
        dfs(node.right)           # 右
    
    dfs(root)
    return result

# 迭代
def preorderTraversalIterative(root: Optional[TreeNode]) -> List[int]:
    if root is None:
        return []
    result = []
    stack = [root]
    
    while stack:
        node = stack.pop()
        result.append(node.val)
        # 注意：栈是 LIFO，所以先压右再压左
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    
    return result
```

### 中序遍历模板

```python
from typing import Optional, List

# 递归
def inorderTraversal(root: Optional[TreeNode]) -> List[int]:
    result = []
    
    def dfs(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        dfs(node.left)            # 左
        result.append(node.val)   # 根
        dfs(node.right)           # 右
    
    dfs(root)
    return result

# 迭代
def inorderTraversalIterative(root: Optional[TreeNode]) -> List[int]:
    result = []
    stack = []
    curr = root
    
    while curr is not None or stack:
        # 一直走到最左边
        while curr is not None:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    
    return result
```

### 层序遍历模板（BFS）

```python
from typing import Optional, List
from collections import deque

def levelOrder(root: Optional[TreeNode]) -> List[List[int]]:
    if root is None:
        return []
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)
        level_values = []
        
        for _ in range(level_size):
            node = queue.popleft()
            level_values.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level_values)
    
    return result
```

#### 二叉树遍历思考

- **递归写法**最简单，但递归深度可能超出 Python 默认限制（默认 1000），极不平衡的大树需要用迭代
- **迭代的中序遍历**最容易写错，核心是"一路向左走到底，边走边压栈；走不动了弹栈访问，然后转向右子树"
- **层序遍历**用 `collections.deque`，`popleft()` 是 O(1)，而 list 的 `pop(0)` 是 O(n)
- 前序遍历的迭代写法注意压栈顺序：先压右子节点，再压左子节点（LIFO）

---

## 四、数组 / 双指针

### 双指针模板总结

| 类型 | 适用场景 | 核心思路 |
|------|----------|----------|
| 左右指针（对撞） | 有序数组两数之和、盛最多水的容器、回文判断 | 左指针从左往右，右指针从右往左，根据条件移动某一侧 |
| 快慢指针 | 链表判环、找中点、数组去重 | 快指针每次走两步/一步，慢指针每次走一步 |
| 滑动窗口 | 子串/子数组问题 | 维护窗口 [left, right)，根据条件收缩或扩展 |

---

## 五、滑动窗口

### 滑动窗口通用模板

```python
from collections import defaultdict

def slidingWindowTemplate(s: str) -> int:
    window = defaultdict(int)
    left = 0
    right = 0
    valid = 0  # 满足条件的字符数
    result = 0
    
    while right < len(s):
        # c 是将移入窗口的字符
        c = s[right]
        # 增大窗口
        right += 1
        # TODO: 进行窗口内数据的更新
        
        # 判断左侧窗口是否要收缩
        while False:  # window needs shrink 的条件替换这里
            # d 是将移出窗口的字符
            d = s[left]
            # 缩小窗口
            left += 1
            # TODO: 进行窗口内数据的更新
        
        # TODO: 更新答案
    
    return result
```

---

## 六、回溯 / DFS

### 回溯通用模板

```python
from typing import List

def backtrackTemplate(选择列表: List[int]) -> List[List[int]]:
    result = []
    path = []
    used = [False] * len(选择列表)
    
    def backtrack() -> None:
        # 触发结束条件
        if len(path) == len(选择列表):
            result.append(path[:])
            return
        
        for i in range(len(选择列表)):
            # 排除不合法的选择
            if used[i]:
                continue
            # 剪枝条件（如需要去重，需先对选择列表排序）
            if i > 0 and 选择列表[i] == 选择列表[i - 1] and not used[i - 1]:
                continue
            
            # 做选择
            used[i] = True
            path.append(选择列表[i])
            # 进入下一层决策树
            backtrack()
            # 撤销选择
            path.pop()
            used[i] = False
    
    backtrack()
    return result
```

#### 回溯问题分类

| 问题类型 | 典型题目 | 关键处理 |
|----------|----------|----------|
| 子集问题 | 78. 子集、90. 子集 II | 组合类，start 控制不回头，排序去重 |
| 组合问题 | 77. 组合、39. 组合总和、40. 组合总和 II | 同上，有 target 限制 |
| 排列问题 | 46. 全排列、47. 全排列 II | used 数组记录使用状态，排序去重 |
| 分割问题 | 131. 分割回文串、93. 复原 IP | 子串判断合法性 |
| 棋盘问题 | 51. N 皇后、37. 解数独 | 逐行/格放置，检查冲突 |

#### 回溯模板补充说明

- **组合/子集类**：通常用 `start` 参数控制"不回头选"，避免重复组合
- **排列类**：不需要 start，但需要 `used` 数组标记是否已选
- **去重**：需要先排序，然后在 for 循环开头判断 `if i > start and nums[i] == nums[i-1]: continue`（组合类）或 `if i > 0 and nums[i] == nums[i-1] and not used[i-1]: continue`（排列类）
- Python 中注意 `result.append(path[:])` —— 必须切片拷贝，否则后续 `path.pop()` 会影响已添加的结果

---

## 七、动态规划

### DP 解题步骤

1. **确定 dp 数组含义**：`dp[i]` 或 `dp[i][j]` 表示什么
2. **推导递推公式**：状态如何转移
3. **初始化 dp 数组**：base case 是什么
4. **确定遍历顺序**：从前往后还是从后往前，先 i 还是先 j
5. **举例推导**：手动跑几个 small case 验证

### 背包问题模板

```python
from typing import List

# 0-1 背包：物品只能选一次
def zeroOneBag(weights: List[int], values: List[int], bag_weight: int) -> int:
    # dp[j] = 容量为 j 的背包能装的最大价值
    dp = [0] * (bag_weight + 1)
    
    for i in range(len(weights)):
        # 0-1 背包：倒序遍历，防止物品被重复选取
        for j in range(bag_weight, weights[i] - 1, -1):
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    
    return dp[bag_weight]

# 完全背包：物品可以选多次
def completeBag(weights: List[int], values: List[int], bag_weight: int) -> int:
    dp = [0] * (bag_weight + 1)
    
    for i in range(len(weights)):
        # 完全背包：正序遍历，物品可以重复选取
        for j in range(weights[i], bag_weight + 1):
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    
    return dp[bag_weight]
```

#### 背包问题思考

- **0-1 背包 vs 完全背包的唯一区别**：内层循环的遍历方向（倒序 vs 正序）
- 倒序遍历保证每个物品只被选一次（因为 `dp[j - w]` 取的是上一轮（即未选当前物品时）的值）
- 正序遍历允许物品被重复选取（因为 `dp[j - w]` 可能已经包含了当前物品）
- 组合问题（求方法数）把 `max` 改成 `+`，并注意初始化 `dp[0] = 1`

---

## 八、Python 算法常用库速查

### collections 模块

| 类/函数 | 用途 | 示例 |
|---------|------|------|
| `defaultdict` | 字典访问不存在的 key 时返回默认值 | `d = defaultdict(list); d['a'].append(1)` |
| `Counter` | 统计可迭代对象元素频次 | `Counter('aabbcc') → {'a':2, 'b':2, 'c':2}` |
| `deque` | 双端队列，两端 O(1) 操作 | `q = deque(); q.popleft(); q.appendleft(x)` |

### heapq 模块（最小堆）

```python
import heapq

nums = [3, 1, 2]
heapq.heapify(nums)       # 原地建堆，O(n)
heapq.heappush(nums, 0)   # 插入元素，O(log n)
smallest = heapq.heappop(nums)  # 弹出最小元素，O(log n)
top_k = heapq.nlargest(3, nums)    # 前 k 大
bottom_k = heapq.nsmallest(3, nums)  # 前 k 小
```

### functools 模块

```python
from functools import lru_cache

# 递归函数加缓存（记忆化搜索）
@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

### bisect 模块（二分查找）

```python
import bisect

nums = [1, 3, 5, 7]
idx = bisect.bisect_left(nums, 3)   # 左侧插入位置 = 1（找到目标下标）
idx = bisect.bisect_right(nums, 3)  # 右侧插入位置 = 2
bisect.insort(nums, 4)              # 有序插入，结果: [1, 3, 4, 5, 7]
```

---

## 九、学习资源

### 网站

- [代码随想录](https://programmercarl.com/) - 按题型分类的题解
- [LeetCode 官方题解](https://leetcode.cn/) - 思路最清晰
- [VisualAlgo](https://visualgo.net/) - 算法可视化

---

## 十、刷题心得

### 待补充

- [ ] 完成第一轮 Hot 100 后总结通用套路
- [ ] 整理高频面试题的多种解法对比
- [ ] 记录自己容易出错的边界条件

---

> 持续更新中...
