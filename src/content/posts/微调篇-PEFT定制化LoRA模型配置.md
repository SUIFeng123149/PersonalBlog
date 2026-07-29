---
title: 微调篇-PEFT定制化LoRA模型配置
published: 2026-07-29
description: ''
image: ''
tags: ['Fine-tuning']
category: 'Fine-tuning'
draft: false
lang: zh-CN
---
## **前言**

如今大型预训练模型规模庞大（通常有数十亿参数），这对训练提出了重大挑战，因为它们需要更多的存储空间和更强大的计算能力来处理所有这些计算。您需要访问强大的 GPU 或 TPU 才能训练这些大型预训练模型，这既昂贵，又没有普及到每个人，也不环保，而且不是很实用。PEFT 方法解决了许多这些挑战。PEFT 方法有几种类型（软提示、矩阵分解、适配器），但它们都专注于同一件事：减少可训练参数的数量。这使得在消费级硬件上训练和存储大型模型变得更容易。

PEFT 库旨在帮助您在免费或低成本的 GPU 上快速训练大型模型。在本教程中，您将学习如何设置配置，以将 PEFT 方法应用于预训练的基础模型进行训练。一旦 PEFT 配置设置完成，您可以使用任何您喜欢的训练框架（Transformer 的 [Trainer](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/trainer#transformers.Trainer) 类、[Accelerate](https://hugging-face.cn/docs/accelerate)、自定义 PyTorch 训练循环）。

## **PEFT 配置**

在各自的 API 参考页面中了解有关您可以为每种 PEFT 方法配置的参数的更多信息。

配置存储了重要的参数，这些参数指定了应如何应用特定的 PEFT 方法。

例如，看看以下用于应用 LoRA 的 [LoraConfig](https://hugging-face.cn/ybelkada/opt-350m-lora/blob/main/adapter_config.json) 和用于应用 p-tuning 的 [PromptEncoderConfig](https://hugging-face.cn/smangrul/roberta-large-peft-p-tuning/blob/main/adapter_config.json)（这些配置文件已经 JSON 序列化）。每当您加载 PEFT 适配器时，最好检查它是否具有关联的 adapter\_config.json 文件，这是必需的。

LoraConfig

PromptEncoderConfig

```plain&#x20;text
{
  "base_model_name_or_path": "facebook/opt-350m", #base model to apply LoRA to
  "bias": "none",
  "fan_in_fan_out": false,
  "inference_mode": true,
  "init_lora_weights": true,
  "layers_pattern": null,
  "layers_to_transform": null,
  "lora_alpha": 32,
  "lora_dropout": 0.05,
  "modules_to_save": null,
  "peft_type": "LORA", #PEFT method type
  "r": 16,
  "revision": null,
  "target_modules": [
    "q_proj", #model modules to apply LoRA to (query and value projection layers)
    "v_proj"
  ],
  "task_type": "CAUSAL_LM" #type of task to train model on
}
```

您可以通过初始化 [LoraConfig](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/lora#peft.LoraConfig) 来创建自己的训练配置。

```plain&#x20;text
from peft import LoraConfig, TaskType

lora_config = LoraConfig(
    r=16,
    target_modules=["q_proj", "v_proj"],
    task_type=TaskType.CAUSAL_LM,
    lora_alpha=32,
    lora_dropout=0.05
)
```

## **PEFT 模型**

有了 PEFT 配置，您现在可以将其应用于任何预训练模型，以创建 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel)。从 [Transformers](https://hugging-face.cn/docs/transformers) 库中的任何最先进的模型、自定义模型，甚至新的和不受支持的 Transformer 架构中进行选择。

在本教程中，加载一个基础模型 [facebook/opt-350m](https://hugging-face.cn/facebook/opt-350m) 以进行微调。

```plain&#x20;text
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("facebook/opt-350m")
```

使用 [get\_peft\_model()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.get_peft_model) 函数从基础 facebook/opt-350m 模型和您之前创建的 `lora_config` 创建 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel)。

```plain&#x20;text
from peft import get_peft_model

lora_model = get_peft_model(model, lora_config)
lora_model.print_trainable_parameters()
"trainable params: 1,572,864 || all params: 332,769,280 || trainable%: 0.472659014678278"
```

当调用 [get\_peft\_model()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.get_peft_model) 时，基础模型将被\_就地\_修改。这意味着，如果在之前以相同方式修改过的模型上调用 [get\_peft\_model()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.get_peft_model)，则此模型将被进一步变异。因此，如果您想在之前调用过 `get_peft_model()` 之后修改您的 PEFT 配置，您首先必须使用 [unload()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/lora#peft.LoraModel.unload) 卸载模型，然后使用您的新配置调用 `get_peft_model()`。或者，您可以重新初始化模型以确保在应用新的 PEFT 配置之前处于全新的、未修改的状态。

现在您可以使用您喜欢的训练框架训练 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel) 了！训练完成后，您可以使用 [save\_pretrained()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel.save_pretrained) 在本地保存您的模型，或使用 [push\_to\_hub](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/model#transformers.PreTrainedModel.push_to_hub) 方法将其上传到 Hub。

```plain&#x20;text
# save locally
lora_model.save_pretrained("your-name/opt-350m-lora")

# push to Hub
lora_model.push_to_hub("your-name/opt-350m-lora")
```

要加载用于推理的 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel)，您需要提供用于创建它的 [PeftConfig](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/config#peft.PeftConfig) 以及训练它的基础模型。

```plain&#x20;text
from peft import PeftModel, PeftConfig

config = PeftConfig.from_pretrained("ybelkada/opt-350m-lora")
model = AutoModelForCausalLM.from_pretrained(config.base_model_name_or_path)
lora_model = PeftModel.from_pretrained(model, "ybelkada/opt-350m-lora")
```

默认情况下，[PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel) 设置为用于推理，但如果您想进一步训练适配器，您可以设置 `is_trainable=True`。

lora\_model = PeftModel.from\_pretrained(model, "ybelkada/opt-350m-lora", is\_trainable=True)

[PeftModel.from\_pretrained()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel.from_pretrained) 方法是加载 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel) 最灵活的方式，因为它与使用的模型框架无关（Transformers、timm、通用 PyTorch 模型）。其他类，如 [AutoPeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/auto_class#peft.AutoPeftModel)，只是基础 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel) 的便捷包装器，并且可以更轻松地直接从 Hub 或本地 PEFT 权重存储位置加载 PEFT 模型。

```plain&#x20;text
from peft import AutoPeftModelForCausalLM

lora_model = AutoPeftModelForCausalLM.from_pretrained("ybelkada/opt-350m-lora")
```

查看 [AutoPeftModel](https://hugging-face.cn/docs/peft/tutorial/package_reference/auto_class) API 参考，以了解有关 [AutoPeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/auto_class#peft.AutoPeftModel) 类的更多信息。
