---
title: MiniMind 复现学习：2小时从零训练自己的语言模型
date: 2026-07-24
description: 复现 MiniMind 超小型语言模型训练全流程，深入理解 Transformer、MoE、DPO 等核心技术原理与实践。
categories:
  - AI
  - LLM
tags:
  - MiniMind
  - Transformer
  - MoE
  - DPO
  - 模型训练
readingTime: 15
draft: true
---

> **声明**：本文为 MiniMind 项目的学习框架，文中涉及的文件路径、命令参数、代码片段均为基于公开信息的示意性内容。实际复现时请以 [MiniMind GitHub 仓库](https://github.com/jingyaogong/minimind) 的最新代码为准。

## 引言

在大模型时代，训练一个语言模型似乎是遥不可及的事情——庞大的参数量、昂贵的算力成本、复杂的工程实现，这些门槛让很多开发者望而却步。然而，MiniMind 的出现打破了这一局面。

MiniMind 是由 jingyaogong 开源的超小型语言模型项目，以极低的成本帮助个人开发者从零开始构建自己的语言模型。最小版本仅包含 **25.8M 参数**，在普通 NVIDIA 3090 GPU 上仅需 **2 小时**即可完成完整训练，总成本约 **3 元人民币**。

本文将带你从零开始复现 MiniMind 的训练全流程，深入理解：
- Transformer Decoder-Only 架构的核心实现
- 混合专家（MoE）技术如何提升小模型性能
- 从预训练到 DPO 的完整训练流水线
- 轻量化训练的工程实践技巧

## 项目概述

### 核心特性

MiniMind 的设计理念可以概括为"**极致轻量化，完整全流程**"：

| 特性 | 描述 | 技术亮点 |
|------|------|---------|
| 模型规模 | 25.8M / 64M 参数 | 仅为 GPT-3 的 1/7000，适合个人设备 |
| 训练成本 | NVIDIA 3090，约 3 元 | 极低的硬件门槛 |
| 训练时长 | 2 小时从零训练 | 高效的训练流水线 |
| 技术栈 | PyTorch 原生实现 | 无第三方封装，便于学习和扩展 |
| 支持技术 | 预训练、SFT、LoRA、DPO、MoE、蒸馏 | 覆盖现代 LLM 训练全流程 |
| 多模态 | MiniMind-V 视觉语言模型 | 支持图文对话和图像理解 |

### 项目结构

```
minimind/
├── configs/              # 配置文件目录
│   ├── pretrain.yaml     # 预训练配置
│   ├── sft.yaml          # 监督微调配置
│   ├── lora.yaml         # LoRA 微调配置
│   └── dpo.yaml          # DPO 优化配置
├── model/                # 模型定义
│   ├── minimind.py       # 核心模型架构
│   └── moe.py            # MoE 模块实现
├── trainer/              # 训练器实现
│   ├── pretrainer.py     # 预训练逻辑
│   ├── sft_trainer.py    # SFT 训练器
│   └── dpo_trainer.py    # DPO 训练器
├── utils/                # 工具函数
│   ├── data.py           # 数据处理
│   ├── tokenizer.py      # 自定义分词器
│   └── logger.py         # 日志工具
├── data/                 # 数据集目录
├── train.py              # 训练入口脚本
└── infer.py              # 推理脚本
```

### 技术路线图

```
数据准备 → 预训练(Pretrain) → 监督微调(SFT) → LoRA微调 → DPO优化 → 模型蒸馏 → 推理部署
     ↓           ↓              ↓              ↓           ↓           ↓           ↓
  清洗过滤    语言建模        对话对齐       领域适配     偏好优化     知识压缩     应用落地
```

## 环境搭建

### 依赖安装

```bash
git clone https://github.com/jingyaogong/minimind.git
cd minimind

conda create -n minimind python=3.10
conda activate minimind

pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install transformers datasets accelerate peft bitsandbytes evaluate
pip install sentencepiece protobuf tensorboard
```

### 关键依赖版本

| 依赖 | 版本 | 用途 |
|------|------|------|
| torch | 2.1+ | 深度学习框架 |
| transformers | 4.35+ | 模型与训练工具 |
| datasets | 2.15+ | 数据集处理 |
| accelerate | 0.25+ | 分布式训练 |
| peft | 0.7+ | 参数高效微调 |
| bitsandbytes | 0.41+ | 量化训练 |

### 配置文件解析

`config.yaml` 是训练的核心配置，以下是关键参数说明：

```yaml
model:
  name: minimind-25m
  hidden_size: 512
  num_layers: 6
  num_heads: 8
  vocab_size: 32000
  moe:
    enabled: true
    num_experts: 4
    expert_capacity: 64

training:
  batch_size: 128
  gradient_accumulation_steps: 4
  learning_rate: 3e-4
  num_epochs: 3
  max_steps: -1
  fp16: true
  gradient_checkpointing: true

data:
  train_path: data/train.txt
  val_path: data/val.txt
  max_seq_len: 512
```

## 模型架构解析

### Transformer Decoder-Only 架构

MiniMind 采用经典的 Transformer Decoder-Only 架构，与 GPT 系列模型类似：

```
MiniMind 模型架构
├── Embedding 层
│   ├── Token Embedding
│   └── Position Embedding (RoPE)
├── N 层 Transformer Block
│   ├── Pre-Norm (RMSNorm)
│   ├── Multi-Head Self-Attention
│   ├── SwiGLU Feed-Forward Network
│   │   └── MoE 模块（可选）
│   └── Residual Connection
└── LM Head (Linear + Softmax)
```

### RMSNorm 归一化

相比于 LayerNorm，RMSNorm 只对输入的均方根进行归一化，不减去均值：

$$
\text{RMSNorm}(x) = \frac{x}{\sqrt{\mathbb{E}[x^2] + \epsilon}} \odot \gamma
$$

```python
class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        norm = x.float().pow(2).mean(-1, keepdim=True).sqrt() + self.eps
        return (x / norm) * self.weight.type_as(x)
```

### RoPE 位置编码

旋转位置编码（RoPE）将位置信息编码到注意力机制中，支持外推到更长的序列：

$$
\begin{align*}
R(\theta, m) &= \begin{bmatrix} \cos(m\theta) & -\sin(m\theta) \\ \sin(m\theta) & \cos(m\theta) \end{bmatrix} \\
\tilde{\mathbf{q}}_m &= R(\theta, m) \cdot \mathbf{q}_m \\
\tilde{\mathbf{k}}_m &= R(\theta, m) \cdot \mathbf{k}_m
\end{align*}
$$

### SwiGLU 激活函数

SwiGLU 结合了 Swish 和 Gated Linear Unit，在保持表达能力的同时提升训练效率：

$$
\text{SwiGLU}(x) = x_1 \cdot \sigma(\beta x_2)
$$

```python
class SwiGLU(nn.Module):
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x, gate = x.chunk(2, dim=-1)
        return x * F.silu(gate)
```

### 混合专家（MoE）模块

MoE 在前馈网络中引入多个"专家"，动态分配计算资源：

```python
class MoE(nn.Module):
    def __init__(self, dim: int, num_experts: int, expert_capacity: int):
        super().__init__()
        self.num_experts = num_experts
        self.expert_capacity = expert_capacity
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(dim, dim * 4),
                SwiGLU(),
                nn.Linear(dim * 4, dim)
            ) for _ in range(num_experts)
        ])
        self.gate = nn.Linear(dim, num_experts)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        gate_logits = self.gate(x)
        expert_weights = F.softmax(gate_logits, dim=-1)
        
        expert_indices = torch.argmax(expert_weights, dim=-1)
        results = torch.zeros_like(x)
        
        for i in range(self.num_experts):
            mask = expert_indices == i
            if mask.any():
                results[mask] = self.experts[i](x[mask])
        
        return results * expert_weights.sum(dim=-1, keepdim=True)
```

## 训练流程复现

### 阶段一：预训练

预训练是模型学习语言知识的基础阶段，使用大量无标注文本进行语言建模任务。

```bash
python train.py \
  --stage pretrain \
  --config configs/pretrain.yaml \
  --output_dir models/pretrain
```

**预训练核心代码**：

```python
def pretrain_step(model, batch, optimizer, scheduler):
    input_ids = batch['input_ids']
    labels = batch['labels']
    
    outputs = model(input_ids=input_ids, labels=labels)
    loss = outputs.loss
    
    loss.backward()
    optimizer.step()
    scheduler.step()
    optimizer.zero_grad()
    
    return loss.item()
```

**预训练目标**：

$$
\mathcal{L}_{\text{pretrain}} = -\frac{1}{N} \sum_{i=1}^{N} \log p(x_i \mid x_{<i})
$$

### 阶段二：监督微调（SFT）

SFT 使用对话数据对模型进行微调，使其适应对话场景。

```bash
python train.py \
  --stage sft \
  --config configs/sft.yaml \
  --checkpoint models/pretrain \
  --output_dir models/sft
```

**对话模板**：

```
<|user|>你好<|end|>
<|assistant|>你好！我是 MiniMind，很高兴为你服务。<|end|>
```

**SFT 训练代码**：

```python
def sft_step(model, batch, optimizer, scheduler):
    input_ids = batch['input_ids']
    labels = batch['labels']
    
    mask = (input_ids != tokenizer.pad_token_id) & \
           (input_ids != tokenizer.user_token_id)
    
    outputs = model(input_ids=input_ids, labels=labels)
    loss = (outputs.loss * mask).sum() / mask.sum()
    
    loss.backward()
    optimizer.step()
    scheduler.step()
    optimizer.zero_grad()
    
    return loss.item()
```

### 阶段三：LoRA 微调

LoRA 通过低秩分解更新少量参数，快速适应特定领域。

```bash
python train.py \
  --stage lora \
  --config configs/lora.yaml \
  --checkpoint models/sft \
  --output_dir models/lora
```

**LoRA 配置**：

```yaml
lora:
  r: 8
  lora_alpha: 16
  lora_dropout: 0.05
  target_modules:
    - q_proj
    - v_proj
```

### 阶段四：DPO 优化

直接偏好优化（DPO）无需奖励模型，直接根据人类偏好优化模型输出。

```bash
python train.py \
  --stage dpo \
  --config configs/dpo.yaml \
  --checkpoint models/lora \
  --output_dir models/dpo
```

**DPO 损失函数**：

$$
\mathcal{L}_{\text{DPO}} = -\frac{1}{2} \log \sigma(\beta \log \pi_{\theta}(y_w \mid x) - \beta \log \pi_{\theta}(y_l \mid x))
$$

```python
def dpo_loss(policy_logps, reference_logps, chosen_mask, beta=0.1):
    log_ratio = policy_logps - reference_logps
    chosen_logps = log_ratio[chosen_mask]
    rejected_logps = log_ratio[~chosen_mask]
    
    losses = -F.logsigmoid(beta * chosen_logps) - F.logsigmoid(-beta * rejected_logps)
    return losses.mean()
```

## 关键代码解读

### 模型定义

```python
class MiniMind(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config
        
        self.embeddings = nn.Embedding(config.vocab_size, config.hidden_size)
        self.rotary_emb = RotaryEmbedding(config.hidden_size // config.num_heads)
        
        self.layers = nn.ModuleList([
            TransformerBlock(config) for _ in range(config.num_layers)
        ])
        
        self.norm = RMSNorm(config.hidden_size)
        self.lm_head = nn.Linear(config.hidden_size, config.vocab_size, bias=False)
    
    def forward(self, input_ids, labels=None):
        x = self.embeddings(input_ids)
        x = x + self.rotary_emb(x)
        
        for layer in self.layers:
            x = layer(x)
        
        x = self.norm(x)
        logits = self.lm_head(x)
        
        loss = None
        if labels is not None:
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)),
                labels.view(-1),
                ignore_index=-100
            )
        
        return ModelOutput(logits=logits, loss=loss)
```

### 数据处理

```python
class TextDataset(Dataset):
    def __init__(self, file_path, tokenizer, max_seq_len):
        self.tokenizer = tokenizer
        self.max_seq_len = max_seq_len
        
        with open(file_path, 'r', encoding='utf-8') as f:
            self.texts = f.readlines()
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        encoding = self.tokenizer(
            text,
            max_length=self.max_seq_len,
            truncation=True,
            padding='max_length',
            return_tensors='pt'
        )
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': encoding['input_ids'].flatten()
        }
```

### 训练器封装

```python
class Trainer:
    def __init__(self, model, train_dataloader, val_dataloader, config):
        self.model = model
        self.train_dataloader = train_dataloader
        self.val_dataloader = val_dataloader
        self.config = config
        
        self.optimizer = AdamW(model.parameters(), lr=config.lr)
        self.scheduler = get_cosine_schedule_with_warmup(
            self.optimizer,
            num_warmup_steps=config.warmup_steps,
            num_training_steps=config.total_steps
        )
    
    def train(self):
        self.model.train()
        for epoch in range(self.config.num_epochs):
            for batch in self.train_dataloader:
                loss = self.training_step(batch)
                
                if self.global_step % self.config.log_interval == 0:
                    self.log(loss)
                
                if self.global_step % self.config.eval_interval == 0:
                    self.evaluate()
                
                self.global_step += 1
```

## 推理与部署

### 加载模型

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained('models/dpo')
model = AutoModelForCausalLM.from_pretrained('models/dpo')
```

### 生成文本

```python
def generate(text, max_new_tokens=100):
    inputs = tokenizer(text, return_tensors='pt')
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            do_sample=True
        )
    
    return tokenizer.decode(outputs[0], skip_special_tokens=True)
```

### 量化部署

```python
from peft import PeftModel
from bitsandbytes import load_in_4bit

model = AutoModelForCausalLM.from_pretrained(
    'models/dpo',
    load_in_4bit=True,
    device_map='auto'
)

model = PeftModel.from_pretrained(model, 'models/lora')
model = model.merge_and_unload()
```

## 常见问题与解决方案

### GPU 显存不足

| 解决方案 | 操作 | 效果 |
|---------|------|------|
| 梯度累积 | `gradient_accumulation_steps: 4` | 等效增大 batch_size |
| 混合精度 | `fp16: true` | 显存占用减半 |
| 梯度检查点 | `gradient_checkpointing: true` | 以计算换显存 |
| 4-bit 量化 | `load_in_4bit=True` | 显存占用降低 75% |

### 训练不稳定

```python
# 调整学习率
optimizer = AdamW(model.parameters(), lr=2e-4, weight_decay=0.01)

# 使用梯度裁剪
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 预热学习率
scheduler = get_cosine_schedule_with_warmup(
    optimizer,
    num_warmup_steps=1000,
    num_training_steps=total_steps
)
```

### 过拟合

| 方法 | 实现 |
|------|------|
| 数据增强 | 随机裁剪、掩码替换 |
| 正则化 | weight_decay、dropout |
| 早停 | `patience=3` |
| 数据扩充 | 使用更大的数据集 |

## 总结与思考

通过复现 MiniMind 的训练流程，我深刻体会到了现代 LLM 训练技术的演进：

1. **轻量化是趋势**：随着硬件成本的降低和算法的优化，个人开发者也能训练自己的语言模型
2. **工程化能力关键**：训练流程的自动化、分布式训练、量化部署等工程实践至关重要
3. **MoE 是小模型的利器**：混合专家架构在不增加推理成本的前提下提升模型性能
4. **DPO 简化了对齐流程**：无需训练奖励模型，直接根据偏好优化，大幅降低了对齐门槛

**未来方向**：
- 尝试在不同领域数据集上微调，探索 MiniMind 的泛化能力
- 结合 RLHF 进一步提升模型的对话质量
- 探索 MiniMind-V 视觉语言模型的多模态能力
- 优化推理速度，实现低延迟部署

---

**参考资料**：
- MiniMind GitHub: [https://github.com/jingyaogong/minimind](https://github.com/jingyaogong/minimind)
- MiniMind 官方网站: [https://jingyaogong.github.io/minimind/](https://jingyaogong.github.io/minimind/)
- HuggingFace 模型库: [https://huggingface.co/collections/jingyaogong/minimind](https://huggingface.co/collections/jingyaogong/minimind)
