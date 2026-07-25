---
title: 文章标题示例：这里写你的文章标题
date: 2026-07-24
description: 用一句话说明文章解决的问题和覆盖范围，作为 SEO 描述和文章摘要。
categories:
  - AI
  - 后端
tags:
  - LLM
  - Agent
  - 系统设计
readingTime: 15
series: 系列名称（可选）
seriesOrder: 1
draft: false
hidden: true
published: true
---

## 引言

在这里介绍文章的背景、问题和目标。告诉读者这篇文章能解决什么问题、带来什么价值。

## 核心内容

### 小节标题

使用 `##` 作为二级标题，`###` 作为三级标题。标题会自动生成目录导航。

#### 代码块

支持多种编程语言语法高亮：

```python
def hello_world():
    print("Hello, World!")
    return True
```

```typescript
interface User {
  id: string
  name: string
  email: string
}
```

### 列表

无序列表：
- 第一项
- 第二项
- 第三项

有序列表：
1. 步骤一
2. 步骤二
3. 步骤三

### 引用

> 引用他人的话或重要观点。

### 表格

| 特性 | 描述 | 状态 |
|------|------|------|
| 性能 | 支持高并发 | ✅ |
| 可扩展性 | 水平扩展 | ✅ |
| 易用性 | 简单直观 | ⏳ |

### 数学公式

行内公式：$E=mc^2$

块级公式：

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 总结

总结文章的核心观点和收获，给出下一步建议或思考方向。

---

## 格式规范说明

### Frontmatter 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题，显示在页面头部和列表中 |
| date | string | 是 | 发布日期，格式 `YYYY-MM-DD` |
| description | string | 是 | SEO 描述，一句话概括文章内容 |
| categories | string[] | 否 | 文章分类，用于主题导航 |
| tags | string[] | 是 | 关键词标签，用于标签筛选 |
| readingTime | number | 否 | 预计阅读时长（分钟），不填则自动计算 |
| series | string | 否 | 系列名称，将文章组织为连续阅读路径 |
| seriesOrder | number | 否 | 系列内排序序号 |
| draft | boolean | 否 | 是否草稿，`true` 则不显示在列表中 |
| hidden | boolean | 否 | 是否隐藏，`true` 则不显示在列表中 |
| published | boolean | 否 | 是否发布，`false` 则不显示在列表中 |

### 文件命名规则

- 文件名即为 URL slug，例如 `agent-memory.md` 对应 `/posts/agent-memory`
- 使用小写字母、数字和连字符 `-`
- 文件名应简洁描述文章内容

### 目录结构

文章按时间年月分类存储：

```
content/posts/
└── 2026/
    ├── 07/
    │   ├── your-article.md
    │   └── another-article.md
    └── 08/
        └── new-post.md
```

### 配图规范

- 文章配图存放在 `public/images/posts/<YYYY>/<MM>/<slug>/`
- 正文引用路径为 `/images/posts/<YYYY>/<MM>/<slug>/image-name.png`
- 优先使用 SVG 格式，需包含 title、desc 和 viewBox 属性

### 注意事项

1. 文章内容会自动生成目录（TOC），基于 `##` 和 `###` 标题
2. 代码块支持语法高亮，指定语言即可（python、typescript、javascript 等）
3. 数学公式使用 KaTeX 渲染，支持 LaTeX 语法
4. 草稿文章设置 `draft: true`，不会在前端展示
