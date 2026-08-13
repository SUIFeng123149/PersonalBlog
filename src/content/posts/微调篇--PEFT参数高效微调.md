---
title: "微调篇--PEFT参数高效微调"
published: 2026-07-29
description: "在微调过程中冻结预训练模型的参数，并在其顶部添加少量可训练参数（adapters）。adapters 被训练以学习特定任务的信息。这种方法已被证明非常节省内存，同时具有较低的计算使用量，同时产生与完全微调模型相当的结果。 使用 PEFT 训练的 adapters 通常比完整模型小一个数量级，使其方便共享、存储和加载。 与完整尺寸的模型权重（约为 700MB）相比，存储在 Hub 上的 OPTFor"
image: ""
tags: ["Fine-tuning"]
category: "Fine-tuning"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---




[参数高效微调（PEFT）方法](https://huggingface.co/blog/peft)在微调过程中冻结预训练模型的参数，并在其顶部添加少量可训练参数（adapters）。adapters 被训练以学习特定任务的信息。这种方法已被证明非常节省内存，同时具有较低的计算使用量，同时产生与完全微调模型相当的结果。

使用 PEFT 训练的 adapters 通常比完整模型小一个数量级，使其方便共享、存储和加载。

与完整尺寸的模型权重（约为 700MB）相比，存储在 Hub 上的 OPTForCausalLM 模型的 adapter 权重仅为\~ 6MB。

如果您对学习更多关于🤗 PEFT 库感兴趣，请查看[文档](https://huggingface.co/docs/peft/index)。

## 设置

首先安装 🤗 PEFT：

如果你想尝试全新的特性，你可能会有兴趣从源代码安装这个库：

`pip install git+https://github.com/huggingface/peft.git`



## 支持的 PEFT 模型

Transformers 原生支持一些 PEFT 方法，这意味着你可以加载本地存储或在 Hub 上的 adapter 权重，并使用几行代码轻松运行或训练它们。以下是受支持的方法：

* [Low Rank Adapters](https://huggingface.co/docs/peft/conceptual_guides/lora)

* [IA3](https://huggingface.co/docs/peft/conceptual_guides/ia3)

* [AdaLoRA](https://arxiv.org/abs/2303.10512)

如果你想使用其他 PEFT 方法，例如提示学习或提示微调，或者关于通用的 🤗 PEFT 库，请参阅[文档](https://huggingface.co/docs/peft/index)。

## 加载 PEFT adapter

要从 huggingface 的 Transformers 库中加载并使用 PEFTadapter 模型，请确保 Hub 仓库或本地目录包含一个`adapter_config.json`文件和 adapter 权重，如上例所示。然后，您可以使用`AutoModelFor`类加载 PEFT adapter 模型。例如，要为因果语言建模加载一个 PEFT adapter 模型：

1. 指定 PEFT 模型 id

2. 将其传递给`AutoModelForCausalLM`类

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

peft_model_id = "ybelkada/opt-350m-lora"
model = AutoModelForCausalLM.from_pretrained(peft_model_id)
```

你可以使用`AutoModelFor`类或基础模型类（如`OPTForCausalLM`或`LlamaForCausalLM`）来加载一个 PEFT adapter。

您也可以通过`load_adapter`方法来加载 PEFT adapter。

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "facebook/opt-350m"
peft_model_id = "ybelkada/opt-350m-lora"

model = AutoModelForCausalLM.from_pretrained(model_id)
model.load_adapter(peft_model_id)
```



## 基于 8bit 或 4bit 进行加载

`bitsandbytes`集成支持 8bit 和 4bit 精度数据类型，这对于加载大模型非常有用，因为它可以节省内存（请参阅`bitsandbytes`[指南](https://huggingface.co/docs/transformers/zh/quantization#bitsandbytes-integration)以了解更多信息）。要有效地将模型分配到您的硬件，请在 [from\_pretrained()](https://huggingface.co/docs/transformers/v4.51.3/zh/main_classes/model#transformers.PreTrainedModel.from_pretrained) 中添加`load_in_8bit`或`load_in_4bit`参数，并将`device_map="auto"`设置为：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

peft_model_id = "ybelkada/opt-350m-lora"
model = AutoModelForCausalLM.from_pretrained(peft_model_id, quantization_config=BitsAndBytesConfig(load_in_8bit=True))
```



## 添加新的 adapter

你可以使用`~peft.PeftModel.add_adapter`方法为一个已有 adapter 的模型添加一个新的 adapter，只要新 adapter 的类型与当前 adapter 相同即可。例如，如果你有一个附加到模型上的 LoRA adapter：

```python
from transformers import AutoModelForCausalLM, OPTForCausalLM, AutoTokenizer
from peft import PeftConfig

model_id = "facebook/opt-350m"
model = AutoModelForCausalLM.from_pretrained(model_id)

lora_config = LoraConfig(
    target_modules=["q_proj", "k_proj"],
    init_lora_weights=False
)

model.add_adapter(lora_config, adapter_)
```

添加一个新的 adapter：

`model.add_adapter(lora_config, adapter_)`



现在您可以使用`~peft.PeftModel.set_adapter`来设置要使用的 adapter。

```python
model.set_adapter("adapter_1")
output = model.generate(**inputs)
print(tokenizer.decode(output_disabled[0], skip_special_tokens=True))


model.set_adapter("adapter_2")
output_enabled = model.generate(**inputs)
print(tokenizer.decode(output_enabled[0], skip_special_tokens=True))
```



## 启用和禁用 adapters

一旦您将 adapter 添加到模型中，您可以启用或禁用 adapter 模块。要启用 adapter 模块：

```python
from transformers import AutoModelForCausalLM, OPTForCausalLM, AutoTokenizer
from peft import PeftConfig

model_id = "facebook/opt-350m"
adapter_model_id = "ybelkada/opt-350m-lora"
tokenizer = AutoTokenizer.from_pretrained(model_id)
text = "Hello"
inputs = tokenizer(text, return_tensors="pt")

model = AutoModelForCausalLM.from_pretrained(model_id)
peft_config = PeftConfig.from_pretrained(adapter_model_id)


peft_config.init_lora_weights = False

model.add_adapter(peft_config)
model.enable_adapters()
output = model.generate(**inputs)
```



要禁用 adapter 模块：

```python
model.disable_adapters()
output = model.generate(**inputs)
```



## 训练一个 PEFT adapter

PEFT 适配器受`Trainer`类支持，因此您可以为您的特定用例训练适配器。它只需要添加几行代码即可。例如，要训练一个 LoRA adapter：

如果你不熟悉如何使用`Trainer`微调模型，请查看[微调预训练模型](https://huggingface.co/docs/transformers/zh/training)教程。

1. 使用任务类型和超参数定义 adapter 配置（参见`~peft.LoraConfig`以了解超参数的详细信息）。

```python
from peft import LoraConfig

peft_config = LoraConfig(
    lora_alpha=16,
    lora_dropout=0.1,
    r=64,
    bias="none",
    task_type="CAUSAL_LM",
)
```



2. 将 adapter 添加到模型中。

`model.add_adapter(peft_config)`



3. 现在可以将模型传递给`Trainer`了！

```python
trainer = Trainer(model=model, ...)
trainer.train()
```

要保存训练好的 adapter 并重新加载它：

```python
model.save_pretrained(save_dir)
model = AutoModelForCausalLM.from_pretrained(save_dir)
```




