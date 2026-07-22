---
title: LLM 推理优化实战：从模型量化到部署加速
date: 2026-07-19
description: 深入探讨 LLM 推理优化技术，包括模型量化、推理加速和部署策略。
categories:
  - AI
tags:
  - LLM
  - AI Infra
  - 推理优化
  - PyTorch
readingTime: 10
---

## 引言

随着大语言模型规模的不断增大，推理成本和延迟成为实际应用中的关键挑战。本文介绍多种 LLM 推理优化技术，帮助开发者在有限资源下实现高效推理。

## 模型量化

### 1. 量化基础

量化是将模型参数从高精度（FP32）转换为低精度（INT8、INT4）的过程：

```python
import torch
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("model-name")
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8
)
```

### 2. GPTQ 量化

GPTQ 是一种高效的后训练量化方法：

```python
from auto_gptq import AutoGPTQForCausalLM

model = AutoGPTQForCausalLM.from_quantized(
    "model-name",
    quantize_config=QuantizeConfig(
        bits=4,
        group_size=128,
        desc_act=False
    )
)
```

## 推理加速

### 1. FlashAttention

FlashAttention 通过重计算和分块技术优化注意力计算：

```python
from flash_attn import flash_attn_func

output = flash_attn_func(
    q, k, v,
    causal=True,
    dropout_p=0.1
)
```

### 2. vLLM

vLLM 提供高吞吐量的 LLM 推理服务：

```python
from vllm import LLM, SamplingParams

llm = LLM(model="model-name")
sampling_params = SamplingParams(
    temperature=0.7,
    max_tokens=512
)
outputs = llm.generate(["Hello!"], sampling_params)
```

## 部署策略

### 1. 模型并行

将模型分布到多个 GPU：

```python
model = AutoModelForCausalLM.from_pretrained(
    "model-name",
    device_map="auto",
    offload_folder="offload"
)
```

### 2. 流式输出

通过 SSE 实现实时响应：

```python
@app.get("/stream")
async def stream_completion(prompt: str):
    async for token in model.generate_stream(prompt):
        yield f"data: {token}\n\n"
```

## 性能对比

| 优化方法 | 加速比 | 精度损失 |
|---------|-------|---------|
| FP16 | 1.5x | 极小 |
| INT8 量化 | 2x | 小 |
| INT4 量化 | 3-4x | 中等 |
| FlashAttention | 1.3-2x | 无 |

## 总结

推理优化是 LLM 落地的关键环节，需要根据具体场景选择合适的优化策略，在性能和精度之间取得平衡。