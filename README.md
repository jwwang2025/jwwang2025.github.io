# jwwang.log

王敬文的个人技术博客，记录 AI 应用开发、Agent 架构、RAG 系统和知识图谱的技术笔记。

基于 Nuxt 4 与 Nuxt Content 3 构建，静态生成后部署到 GitHub Pages。

[访问博客](https://jwwang2025.github.io) · [文章库](https://jwwang2025.github.io/posts) · [主题索引](https://jwwang2025.github.io/tags) · [GitHub](https://github.com/jwwang2025)

## 关于博主

王敬文 (Wang Jingwen)，AI 应用开发工程师，北京理工大学在读硕士。

热爱 AI 技术，专注于 Agent、RAG 和知识图谱方向。具备扎实的数理基础和编程能力，善于独立解决问题并推动项目落地。

## 内容地图

- **AI 应用开发**：基于 LangGraph 和 LangChain 的多智能体系统设计与实现
- **知识图谱**：知识图谱构建、实体抽取、关系推理与图数据库应用
- **RAG 系统**：向量检索、多模态检索、重排序与 RAG 系统优化
- **LLM 推理优化**：模型量化、推理加速和部署策略
- **AI Infra**：从模型基础到推理服务和 Agent 平台

文章通过首页知识地图组织学习路径，文章库支持关键词搜索和标签筛选。

## 近期文章

- **LangGraph 多智能体框架实战**：构建智能研究助手系统 · 2026-07-21
- **知识图谱增强的智能问答系统**：融合结构化与非结构化数据 · 2026-07-20
- **LLM 推理优化实战**：从模型量化到部署加速 · 2026-07-19

## 技术栈

- Nuxt 4、Vue 3、TypeScript
- Nuxt Content 3、Markdown
- Tailwind CSS 4
- Nitro 静态生成、GitHub Pages

## 项目结构

```
.
├── assets/css/main.css       # 全站主题、排版和响应式样式
├── components/               # 导航、文章卡片、知识地图等组件
├── content/posts/            # Markdown 文章
├── content.config.ts         # Nuxt Content collection schema
├── pages/                    # 首页、文章、标签、友链和关于页面
├── server/api/posts.get.ts   # 静态文章元数据接口
├── server/api/posts/[slug].get.ts  # 文章详情接口
├── utils/blog.ts             # 日期、阅读时长和标签工具
├── app.config.ts             # 作者、导航和站点信息
└── nuxt.config.ts            # 构建、Markdown 与预渲染配置
```

## 本地开发

要求 Node.js 22。

```bash
npm ci
npm run dev       # 默认 http://localhost:3000
npm run build     # 静态产物输出到 .output/public
npm run preview   # 预览生产构建
```

## 写新文章

在 `content/posts/` 下新建 Markdown 文件。文件名即 URL slug，例如 `agent-memory.md` 对应 `/posts/agent-memory`。

```yaml
---
title: 文章标题
date: 2026-07-17
description: 用一句话说明文章解决的问题和覆盖范围。
categories:
  - AI
tags:
  - LLM
  - Agent
readingTime: 10
---
```

**可见性字段**：

- `draft: true`：草稿，不进入公开列表
- `hidden: true`：保留页面内容，但不进入文章列表
- `published: false`：暂不发布

## 部署

构建产物位于 `.output/public` 目录，可部署到 GitHub Pages：

```bash
npx gh-pages --dotfiles -d .output/public
```

## License

MIT