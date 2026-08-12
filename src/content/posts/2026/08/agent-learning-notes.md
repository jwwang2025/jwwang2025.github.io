---
title: Agent 学习笔记：从概念到落地的完整知识图谱
date: 2026-08-12
description: 系统整理 Agent 的核心概念、关键能力、架构模式与学习路径，覆盖 ReAct、工具调用、记忆机制与多智能体协作等关键主题。
categories:
  - AI
tags:
  - Agent
  - LLM
  - 学习笔记
  - AI Infra
readingTime: 18
---

## 引言

Agent（智能体）是当前 LLM 应用最活跃的方向之一，但相关概念繁杂、术语混乱：从 ReAct 到 Function Calling，从单智能体到 Multi-Agent，从 LangChain 到 LangGraph，初学者很容易迷失。本文是我学习 Agent 过程中的系统整理，试图建立一个清晰的知识地图，帮助快速理解 Agent 的本质、能力边界与工程实现。

## 什么是 Agent

### 定义

Agent 是以 LLM 为大脑、能够感知环境、做出决策、执行动作并影响环境的系统。与传统 Chatbot 的关键区别在于：**Agent 具有自主行动能力**。

```text
感知（Perception） → 思考（Reasoning） → 决策（Planning） → 行动（Action） → 观察（Observation）
                          ↑                                                        ↓
                          └────────────── 反馈循环（Feedback Loop）←───────────────┘
```

### 与 Chatbot 的对比

| 维度 | Chatbot | Agent |
|------|---------|-------|
| 交互模式 | 单轮或被动多轮 | 主动多轮、自主推进 |
| 输出形式 | 自然语言文本 | 文本 + 工具调用 + 环境操作 |
| 状态管理 | 通常无状态或简单上下文 | 完整记忆系统（短期 + 长期） |
| 决策能力 | 无 | 有目标分解、规划、反思能力 |
| 执行能力 | 无 | 可调用工具、API、代码解释器 |

## Agent 的核心能力

### 1. 推理与行动（ReAct）

ReAct（Reasoning + Acting）是 Agent 最经典的范式，由 Yao 等人在 2022 年提出。核心思想是让 LLM 交替进行思考和行动：

```text
Thought: 我需要查询北京今天的天气
Action: search_weather("北京")
Observation: 北京今天晴，最高温度 32℃
Thought: 我已经获得天气信息，可以回答用户了
Answer: 北京今天晴天，最高气温 32 度。
```

**关键洞察**：将"思考过程"显式化（Chain-of-Thought），让模型在行动前先推理，显著提升了任务的准确性和可解释性。

### 2. 工具调用（Tool Use / Function Calling）

工具调用让 Agent 突破 LLM 的能力边界：

- **信息获取类**：搜索引擎、数据库查询、API 调用
- **计算执行类**：代码解释器、计算器、Shell 命令
- **环境操作类**：浏览器自动化、文件读写、消息发送

```python
tools = [
    {
        "name": "search_web",
        "description": "搜索互联网获取最新信息",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "搜索关键词"}
            },
            "required": ["query"]
        }
    }
]
```

> 实践建议：工具描述（description）是 LLM 选择工具的唯一依据，写得越清晰、越具体，工具调用准确率越高。

### 3. 规划（Planning）

面对复杂任务，Agent 需要将其分解为可执行的子任务。常见规划策略：

- **Task Decomposition**：自顶向下分解任务
- **Plan-and-Execute**：先制定完整计划，再逐步执行
- **Tree of Thoughts (ToT)**：探索多条思维路径，择优选择
- **Reflection**：执行后反思，修正后续计划

### 4. 记忆（Memory）

Agent 的记忆系统是工程化的关键：

| 记忆类型 | 存储方式 | 用途 | 实现示例 |
|---------|---------|------|---------|
| 短期记忆 | 上下文窗口 | 当前对话与任务状态 | ConversationBufferMemory |
| 工作记忆 | 状态对象 | 任务过程中的中间变量 | LangGraph State |
| 长期记忆 | 向量数据库 | 跨会话的知识与偏好 | Chroma、Pinecone、Weaviate |

## 经典 Agent 架构

### 1. 单智能体架构

最简单的 Agent 形态，一个 LLM 完成所有推理与决策：

```text
用户输入 → LLM (ReAct Loop) → 工具调用 → 输出
                ↑                ↓
                └── 观察 ←──────┘
```

**优点**：实现简单、调试方便
**缺点**：上下文容易溢出、角色混杂、单一 Prompt 难以应对复杂任务

### 2. ReAct Agent（标准范式）

```python
# 伪代码：典型 ReAct Agent 主循环
def react_agent(query, tools, max_steps=10):
    messages = [{"role": "user", "content": query}]
    for step in range(max_steps):
        response = llm.invoke(messages, tools=tools)
        if response.is_final:
            return response.content
        # 执行工具调用
        for tool_call in response.tool_calls:
            result = execute_tool(tool_call)
            messages.append({"role": "tool", "content": result})
    return "达到最大步数限制"
```

### 3. Plan-and-Execute Agent

适用于任务复杂、需要长期规划的场景：

```text
Planner: "完成市场调研报告"
  → 子任务 1: 收集行业数据
  → 子任务 2: 分析竞品
  → 子任务 3: 撰写报告

Executor: 逐步执行每个子任务
Replanner: 根据执行结果动态调整计划
```

### 4. Multi-Agent 架构

复杂系统通过智能体分工协作解决，详见 [LangGraph 多智能体框架实战](/posts/agent-multi-agent-framework)。常见模式：

- **Supervisor**：一个主控 Agent 调度其他子 Agent
- **Hierarchical**：层次化分工，类似公司组织架构
- **Network**：Agent 之间自由通信协作
- **Handoff**：Agent 之间传递控制权（OpenAI Swarm 模式）

## 关键技术与框架

### 框架对比

| 框架 | 特点 | 适用场景 |
|------|------|---------|
| LangChain | 工具链丰富、生态成熟 | 快速原型、教学 |
| LangGraph | 显式状态图、可控性强 | 生产级多智能体系统 |
| AutoGen | 对话式多智能体 | 研究探索、对话协作 |
| CrewAI | 角色化协作、易上手 | 业务流程自动化 |
| OpenAI Swarm | 轻量、Handoff 模式 | 中等复杂度任务 |

### LangGraph 核心概念

LangGraph 通过显式图结构定义 Agent 行为，是当前生产环境的主流选择：

```python
from langgraph.graph import StateGraph, END

# 定义状态
class AgentState(TypedDict):
    messages: list
    plan: list
    current_step: int

# 构建图
graph = StateGraph(AgentState)
graph.add_node("planner", plan_task)
graph.add_node("executor", execute_step)
graph.add_node("reflector", reflect_on_result)

graph.set_entry_point("planner")
graph.add_edge("planner", "executor")
graph.add_conditional_edges(
    "executor",
    lambda s: "reflector" if s["current_step"] < len(s["plan"]) else END
)
graph.add_edge("reflector", "executor")

app = graph.compile()
```

## Agent 的工程挑战

### 1. 可靠性问题

- **幻觉**：Agent 编造不存在的工具或事实
- **错误传播**：单步错误被放大到整个任务
- **死循环**：陷入无效循环无法终止

**应对策略**：
- 工具调用结果校验 + 重试机制
- 设置最大步数与超时
- 关键步骤引入人工审批（Human-in-the-loop）

### 2. 成本与延迟

Agent 的多轮调用显著增加 Token 消耗与延迟：

```text
单次 LLM 调用: ~2s, ~1k tokens
ReAct 5 轮:    ~10s, ~5k tokens
Multi-Agent:   ~30s+, ~20k tokens
```

**优化方向**：模型分级（规划用大模型、执行用小模型）、缓存机制、并行工具调用。

### 3. 可观测性

Agent 行为高度动态，调试困难。必备能力：

- 完整的 Trace 记录（每步输入、输出、耗时）
- 工具调用失败原因分析
- 状态快照与回放

主流工具：LangSmith、Langfuse、Phoenix。

### 4. 安全与对齐

- **Prompt 注入**：恶意输入操纵 Agent 行为
- **越权操作**：Agent 执行了用户未授权的动作
- **数据泄露**：Agent 在日志中暴露敏感信息

## 学习路径建议

### 阶段一：概念建立（1-2 周）

1. 阅读 ReAct 原始论文：[ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
2. 理解 Function Calling 机制，用 OpenAI / Qwen API 实现一个简单工具调用
3. 学习 LangChain 基础，跑通第一个 ReAct Agent

### 阶段二：工程实践（2-3 周）

1. 学习 LangGraph，理解状态图、节点、边、条件路由
2. 实现一个完整 Agent：含规划、工具调用、记忆
3. 集成 LangSmith 进行 Trace 与调试

### 阶段三：进阶主题（3-4 周）

1. 多智能体协作系统设计
2. 长期记忆与 RAG 结合
3. Human-in-the-loop 工作流
4. Agent 评估与对齐方法

### 推荐资源

- 论文：ReAct、Toolformer、Reflexion、Tree of Thoughts
- 项目：LangGraph 官方教程、AutoGen Examples、OpenAI Cookbook
- 博客：Lilian Weng 的《LLM Powered Autonomous Agents》、Andrew Ng 的 Agentic AI 课程

## 常见误区

### 误区 1：Agent = LLM + 工具

**正解**：工具只是手段，**自主决策与反馈循环**才是 Agent 的核心。一个只调用一次工具的程序不是 Agent，只是普通的 LLM 应用。

### 误区 2：Agent 越复杂越好

**正解**：复杂度应当匹配任务。简单 RAG 用单次调用即可，没必要套上多智能体框架。过度工程化会牺牲可靠性、增加成本。

### 误区 3：Prompt 写好就够了

**正解**：Prompt 是基础，但工程实现同样重要——状态管理、错误处理、可观测性、评估闭环，这些才是生产级 Agent 的关键。

## 总结

Agent 的本质是 **LLM 驱动的自主决策系统**，其核心能力包括 ReAct 推理、工具调用、规划与记忆。学习 Agent 应遵循"概念 → 单智能体 → 多智能体 → 工程化"的路径，避免一上来就追逐复杂框架。

下一阶段我计划深入两件事：一是基于 LangGraph 实现一个完整的 Plan-and-Execute Agent，二是研究 Agent 的评估方法（如何量化"Agent 是否做对了"）。相关实战记录将持续整理到本博客。

---

> 本文为个人学习整理，部分观点来自公开论文与博客，如有理解偏差欢迎指正。
