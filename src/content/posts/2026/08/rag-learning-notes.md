---
title: RAG 学习笔记：检索增强生成的原理与工程实践
date: 2026-08-14
description: 系统整理 RAG 的核心原理、完整流程、与 Agent 的关系及工程挑战，覆盖切分、向量化、检索、重排、生成等关键环节。
categories:
  - AI
tags:
  - RAG
  - LLM
  - 学习笔记
  - AI Infra
readingTime: 8
---

## 引言

RAG（Retrieval-Augmented Generation，检索增强生成）是当前 LLM 落地最广泛的技术范式之一。它通过在生成前检索外部知识，将 LLM 的"参数化记忆"与"外部知识库"结合，有效缓解了知识过时、幻觉和无法溯源等问题。本文系统整理 RAG 的核心原理、完整流程、与 Agent 的关系及工程挑战，作为个人学习笔记。

## 为什么需要 RAG

LLM 存在固有的知识局限：训练数据有截止时间、无法访问私有知识、对长尾事实容易产生幻觉。RAG 通过在生成前检索外部知识，将"参数化记忆"与"外部知识"结合，显著缓解上述问题。

| 方案 | 优点 | 缺点 |
|------|------|------|
| 纯 LLM | 响应快、无需外部依赖 | 知识过时、易幻觉、无法溯源 |
| Fine-tuning | 定制能力强 | 训练成本高、知识更新需重训 |
| RAG | 知识可动态更新、可溯源 | 需检索系统、存在检索失败风险 |

> 实践建议：知识频繁更新的场景优先 RAG；行为/风格定制的场景才考虑 Fine-tuning，二者常结合使用。

## RAG 的核心流程


RAG 系统由三个核心阶段串联而成，缺一不可：

阶段	作用	关键组件
索引（Indexing）	把原始文档转换为可快速检索的格式，离线执行一次	文档切分器、Embedding 模型、向量数据库
检索（Retrieval）	根据用户问题找到最相关的文档片段，在线实时执行	检索器（Retriever）、相似度算法
生成（Generation）	把检索到的资料和问题一起交给 LLM，生成最终回答	Prompt 模板、LLM
阶段 1：索引（Indexing）
索引阶段是离线准备工作，将原始文档加工成向量数据库可以存储和检索的格式。流程是：原始文档 -> 文本切分 -> 向量化 -> 存入向量数据库。

文档切分（Chunking）把长文档切成小片段，通常 500-1000 个 token。切分后，Embedding（嵌入）模型把每个片段转换为一个高维浮点数向量（比如 1536 维），语义相近的文本在向量空间中距离更近。最后把向量和原文一起存入向量数据库。

阶段 2：检索（Retrieval）
用户提问时实时执行。将用户问题用同一个 Embedding 模型转为向量，然后在向量数据库中做相似度搜索，找出与问题最相关的 K 个文档片段（通常 K=3~5）。搜索通常基于余弦相似度（Cosine Similarity）或欧氏距离（L2 Distance）。

阶段 3：生成（Generation）
将检索到的文档片段和用户问题拼接成一个 Prompt（提示词），输入 LLM。LLM 基于这些"参考资料"生成回答，而不是凭记忆编造。关键在于 Prompt 设计要引导 LLM 忠于检索结果，而非自由发挥。

```text
文档加载 → 切分（Chunking）→ 向量化（Embedding）→ 存入向量库
                                                        ↓
用户提问 → Query 向量化 → 检索（Retrieval）→ 重排（Reranking）→ 拼装 Prompt → LLM 生成
```

### 1. 文档切分（Chunking）

切分策略直接影响检索质量：

- **固定长度切分**：按 token 数切分，配合 overlap 避免语义断裂
- **结构化切分**：按段落、标题、Markdown 层级切分，保留语义边界
- **语义切分**：用模型检测语义边界，质量更高但成本增加

```python
# LangChain 典型切分配置
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", "。", " ", ""]
)
```

> 经验值：chunk_size 通常取 300-800 tokens，overlap 取 chunk_size 的 10%-20%。中文场景注意按句号、换行优先切分。

### 2. 向量化（Embedding）

将文本映射为高维向量，用于相似度计算：

- **开源模型**：bge-m3、m3e-base、text2vec
- **商用 API**：OpenAI text-embedding-3、Cohere Embed、Qwen Embedding
- **多维检索**：bge-m3 支持稠密、稀疏、多向量三种检索

选型要点：维度、语言支持、最大输入长度、MTEB 榜单表现。

### 3. 检索（Retrieval）

常见检索方式：

| 检索类型 | 原理 | 适用场景 |
|---------|------|---------|
| 稠密检索 | 向量相似度（余弦/内积） | 语义相似、模糊匹配 |
| 稀疏检索 | BM25、TF-IDF | 关键词精准命中 |
| 混合检索 | 稠密 + 稀疏融合 | 兼顾语义与关键词，生产推荐 |

```python
# 混合检索示例（伪代码）
dense_results = vector_store.similarity_search(query, k=20)
sparse_results = bm25_retriever.search(query, k=20)
final_results = reciprocal_rank_fusion(dense_results, sparse_results, k=5)
```

### 4. 重排（Reranking）

初检召回的文档往往相关性参差，用 Cross-Encoder 重排提升精度：

- **模型**：bge-reranker-v2、Cohere Rerank、jina-reranker
- **流程**：初检召回 Top-K（如 20-50）→ 重排取 Top-N（如 3-5）

> 关键洞察：Bi-Encoder（Embedding）速度快但精度有限，Cross-Encoder 精度高但慢。两者级联是性价比最优解。

### 5. 生成（Generation）

将检索结果拼装进 Prompt，交由 LLM 生成最终回答：

```text
系统：你是一个严谨的问答助手，仅基于以下检索内容回答，无法回答时明确说明。

检索内容：
[1] ...
[2] ...
[3] ...

用户问题：{question}

要求：回答末尾标注引用编号，如 [1][2]。
```

## RAG 与 Agent 的关系

RAG 与 Agent 并非对立，而是互补关系：

- **RAG 是 Agent 的工具**：Agent 通过工具调用 RAG 检索外部知识，类似 Function Calling
- **Agent 是 RAG 的升级**：传统 RAG 是单次检索-生成；Agentic RAG 让 Agent 自主决定是否检索、检索几次、如何组合多源信息
- **共享底层**：向量数据库既是 RAG 的存储，也是 Agent 长期记忆的载体

```text
传统 RAG:   Query → Retrieve → Generate（单轮）
Agentic RAG: Query → Agent 决策 → 检索/重写/多跳检索 → 综合 → Generate（多轮）
```

## RAG 的工程挑战

- **切分质量**：切分不当导致语义断裂，检索再准也答非所问
- **检索召回率**：Query 与文档表达差异大时召回失败，常用 Query Rewriting、HyDE 缓解
- **上下文丢失**：Top-K 过少漏信息，过多稀释信号并增加 Token 成本
- **评估困难**：需从检索质量（Recall@K、MRR）与生成质量（Faithfulness、Answer Relevancy）双维度评估
- **知识更新**：增量索引、删除过期文档、版本管理

主流评估框架：Ragas、TruLens、DeepEval。

## 推荐资源

- 论文：[Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- 项目：LlamaIndex 官方教程、LangChain RAG 模板、Qwen-Agent RAG 示例
- 进阶：HyDE、Self-RAG、GraphRAG、Agentic RAG

## 总结

RAG 的本质是 **检索 + 生成** 的协同，通过外部知识增强 LLM 的回答质量与可信度。其核心流程包括切分、向量化、检索、重排、生成五个环节，每个环节都有值得深入优化的空间。与 Agent 结合后，RAG 从单轮检索升级为多轮自主检索（Agentic RAG），打开了更复杂知识问答场景的可能。

下一阶段我计划深入 GraphRAG 与 Agentic RAG 的工程实现，相关实战记录将持续整理到本博客。

---

> 本文为个人学习整理，部分观点来自公开论文与博客，如有理解偏差欢迎指正。
