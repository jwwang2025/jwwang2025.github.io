---
title: LangGraph 多智能体框架实战：构建智能研究助手系统
date: 2026-07-21
description: 基于 LangGraph 构建多智能体协作系统，实现从规划、检索到报告生成的全流程自动化。
categories:
  - AI
tags:
  - Agent
  - LangGraph
  - LLM
  - AI Infra
readingTime: 12
---

## 引言

在 AI 应用开发中，单一智能体往往难以完成复杂任务。本文介绍如何使用 LangGraph 构建一个多智能体协作的智能研究助手系统，通过 Coordinator、Planner、Researcher、Reporter 四个智能体的协作，实现从研究规划到报告生成的自动化流程。

## 系统架构

### 智能体职责划分

- **Coordinator**：接收用户请求，调度其他智能体，管理任务状态和知识复用
- **Planner**：基于用户需求生成研究计划，支持人工审批
- **Researcher**：执行多源信息检索，包括网络搜索、学术论文等
- **Reporter**：整合检索结果，生成结构化报告

### 协作流程

```
用户请求 → Coordinator → Planner → 研究计划
                                      ↓
                              Researcher → 多源检索
                                      ↓
                              Reporter → 结构化报告
                                      ↓
                            返回给用户
```

## 核心实现

### 1. 混合记忆架构

```python
from langgraph.graph import StateGraph, END
from langchain.memory import ConversationBufferMemory
from langchain_community.vectorstores import Chroma

class HybridMemory:
    def __init__(self):
        self.short_term = ConversationBufferMemory()
        self.long_term = Chroma(embedding_function=embeddings)
    
    def add(self, content, importance=0.5):
        self.short_term.chat_memory.add_user_message(content)
        if importance > 0.7:
            self.long_term.add_texts([content])
    
    def retrieve(self, query):
        short = self.short_term.load_memory_variables({})
        long = self.long_term.similarity_search(query, k=3)
        return short['history'] + str(long)
```

### 2. 多智能体编排

```python
workflow = StateGraph(AgentState)

workflow.add_node("planner", planner_agent)
workflow.add_node("researcher", researcher_agent)
workflow.add_node("reporter", reporter_agent)

workflow.set_entry_point("planner")
workflow.add_edge("planner", "researcher")
workflow.add_edge("researcher", "reporter")
workflow.add_edge("reporter", END)

app = workflow.compile()
```

### 3. 多源检索策略

整合多种检索协议：
- **Tavily 搜索**：实时网络搜索
- **ArXiv 学术检索**：论文查找
- **MCP 协议**：工具调用协议
- **RAG 向量检索**：知识库检索

## 关键技术点

### LLM 调度与配置

通过工厂模式支持多种 LLM 提供商（DeepSeek 等），支持运行时动态切换：

```python
class LLMFactory:
    @staticmethod
    def create(provider="deepseek", **kwargs):
        if provider == "deepseek":
            return ChatDeepSeek(**kwargs)
        return ChatOpenAI(**kwargs)
```

### 记忆优化

实现会话结束时的记忆优化机制，结合 TTL 和 LRU 策略：

- TTL（生存时间）：控制信息有效期
- LRU（最近最少使用）：淘汰策略
- 重要性阈值：只有重要性 > 0.7 的内容才持久化

## 总结

多智能体系统通过职责划分和协作机制，能够完成单一智能体难以处理的复杂任务。LangGraph 提供了强大的状态管理和节点编排能力，是构建 Agent 系统的理想选择。