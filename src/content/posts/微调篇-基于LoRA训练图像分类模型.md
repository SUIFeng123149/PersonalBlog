---
title: "微调篇-基于LoRA训练图像分类模型"
published: 2026-07-29
description: "前言 一种有效训练大型模型的常用方法是插入（通常在注意力模块中）较小的可训练矩阵，这些矩阵是在微调期间要学习的增量权重矩阵的低秩分解。预训练模型的原始权重矩阵被冻结，只有较小的矩阵在训练期间更新。这减少了可训练参数的数量，从而减少了内存使用和训练时间，对于大型模型来说，这可能非常昂贵。 有几种不同的方法可以将权重矩阵表示为低秩分解，但是最常用的方法。PEFT 库支持其他几种 LoRA 变体，例如、"
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
## **前言**

一种有效训练大型模型的常用方法是插入（通常在注意力模块中）较小的可训练矩阵，这些矩阵是在微调期间要学习的增量权重矩阵的低秩分解。预训练模型的原始权重矩阵被冻结，只有较小的矩阵在训练期间更新。这减少了可训练参数的数量，从而减少了内存使用和训练时间，对于大型模型来说，这可能非常昂贵。

有几种不同的方法可以将权重矩阵表示为低秩分解，但[低秩自适应 (LoRA)](https://hugging-face.cn/docs/peft/conceptual_guides/adapter#low-rank-adaptation-lora)是最常用的方法。PEFT 库支持其他几种 LoRA 变体，例如[低秩哈达玛积 (LoHa)](https://hugging-face.cn/docs/peft/conceptual_guides/adapter#low-rank-hadamard-product-loha)、[低秩克罗内克积 (LoKr)](https://hugging-face.cn/docs/peft/conceptual_guides/adapter#low-rank-kronecker-product-lokr)和[自适应低秩自适应 (AdaLoRA)](https://hugging-face.cn/docs/peft/conceptual_guides/adapter#adaptive-low-rank-adaptation-adalora)。您可以在[适配器](https://hugging-face.cn/docs/peft/conceptual_guides/adapter)指南中了解有关这些方法在概念上如何工作的更多信息。如果您有兴趣将这些方法应用于其他任务和用例，例如语义分割、token 分类，请查看我们的[notebook 合集](https://hugging-face.cn/collections/PEFT/notebooks-6573b28b33e5a4bf5b157fc1)！

此外，PEFT 支持 [X-LoRA](https://hugging-face.cn/docs/peft/conceptual_guides/adapter#mixture-of-lora-experts-x-lora) LoRA 专家混合方法。

本指南将向您展示如何使用低秩分解方法快速训练图像分类模型，以识别图像中显示的食物类别。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E5%BE%AE%E8%B0%83%E7%AF%87-%E5%9F%BA%E4%BA%8ELoRA%E8%AE%AD%E7%BB%83%E5%9B%BE%E5%83%8F%E5%88%86%E7%B1%BB%E6%A8%A1%E5%9E%8B_assets/%E5%BE%AE%E8%B0%83%E7%AF%87-%E5%9F%BA%E4%BA%8ELoRA%E8%AE%AD%E7%BB%83%E5%9B%BE%E5%83%8F%E5%88%86%E7%B1%BB%E6%A8%A1%E5%9E%8B-SXFqbr1pvoxW1ZxHOCCcT99qn3g.webp)

熟悉图像分类模型训练的一般过程将非常有帮助，并使您能够专注于低秩分解方法。如果您是新手，我们建议您首先查看 Transformers 文档中的[图像分类](https://hugging-face.cn/docs/transformers/tasks/image_classification)指南。当您准备好后，请回来看看将 PEFT 融入您的训练有多么容易！

在开始之前，请确保您已安装所有必要的库。

pip install -q peft transformers datasets

## **数据集**

在本指南中，您将使用包含 101 个食物类别的图像的 [Food-101](https://hugging-face.cn/datasets/food101) 数据集（查看[数据集查看器](https://hugging-face.cn/datasets/food101/viewer/default/train)，以更好地了解数据集的外观）。

使用 [load\_dataset](https://hugging-face.cn/docs/datasets/v3.4.1/en/package_reference/loading_methods#datasets.load_dataset) 函数加载数据集。

```python
from datasets import load_dataset

ds = load_dataset("food101")
```

每个食物类别都用一个整数标记，为了更容易理解这些整数代表什么，您将创建一个 `label2id` 和 `id2label` 字典，将整数映射到其类别标签。

```python
labels = ds["train"].features["label"].names
label2id, id2label = dict(), dict()
for i, label in enumerate(labels):
    label2id[label] = i
    id2label[i] = label

id2label[2]
"baklava"
```

加载图像处理器以正确调整大小并标准化训练和评估图像的像素值。

```python
from transformers import AutoImageProcessor

image_processor = AutoImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k")
```

您还可以使用图像处理器来准备一些用于数据增强和像素缩放的转换函数。

```python
from torchvision.transforms import (
    CenterCrop,
    Compose,
    Normalize,
    RandomHorizontalFlip,
    RandomResizedCrop,
    Resize,
    ToTensor,
)

normalize = Normalize(mean=image_processor.image_mean, std=image_processor.image_std)
train_transforms = Compose(
    [
        RandomResizedCrop(image_processor.size["height"]),
        RandomHorizontalFlip(),
        ToTensor(),
        normalize,
    ]
)

val_transforms = Compose(
    [
        Resize(image_processor.size["height"]),
        CenterCrop(image_processor.size["height"]),
        ToTensor(),
        normalize,
    ]
)

def preprocess_train(example_batch):
    example_batch["pixel_values"] = [train_transforms(image.convert("RGB")) for image in example_batch["image"]]
    return example_batch

def preprocess_val(example_batch):
    example_batch["pixel_values"] = [val_transforms(image.convert("RGB")) for image in example_batch["image"]]
    return example_batch
```

定义训练和验证数据集，并使用 [set\_transform](https://hugging-face.cn/docs/datasets/v3.4.1/en/package_reference/main_classes#datasets.Dataset.set_transform) 函数即时应用转换。

```python
train_ds = ds["train"]
val_ds = ds["validation"]

train_ds.set_transform(preprocess_train)
val_ds.set_transform(preprocess_val)
```

最后，您需要一个数据整理器来创建一批训练和评估数据，并将标签转换为 `torch.tensor` 对象。

```python
import torch

def collate_fn(examples):
    pixel_values = torch.stack([example["pixel_values"] for example in examples])
    labels = torch.tensor([example["label"] for example in examples])
    return {"pixel_values": pixel_values, "labels": labels}
```

## **模型**

现在让我们加载一个预训练模型用作基础模型。本指南使用 [google/vit-base-patch16-224-in21k](https://hugging-face.cn/google/vit-base-patch16-224-in21k) 模型，但您可以使用任何您想要的图像分类模型。将 `label2id` 和 `id2label` 字典传递给模型，以便模型知道如何将整数标签映射到其类别标签，如果您要微调已经微调过的检查点，您可以选择传递 `ignore_mismatched_sizes=True` 参数。

```python
from transformers import AutoModelForImageClassification, TrainingArguments, Trainer

model = AutoModelForImageClassification.from_pretrained(
    "google/vit-base-patch16-224-in21k",
    label2id=label2id,
    id2label=id2label,
    ignore_mismatched_sizes=True,
)
```

### **PEFT 配置和模型**

每个 PEFT 方法都需要一个配置，其中包含指定应如何应用 PEFT 方法的所有参数。配置设置完成后，将其与基础模型一起传递给 [get\_peft\_model()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.get_peft_model) 函数，以创建一个可训练的 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel)。

调用 [print\_trainable\_parameters()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel.print_trainable_parameters) 方法，比较 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel) 的参数数量与基础模型中的参数数量！

[LoRA](https://hugging-face.cn/docs/peft/conceptual_guides/adapter#low-rank-adaptation-lora) 将权重更新矩阵分解为*两个*较小的矩阵。这些低秩矩阵的大小由其*秩*或 `r` 决定。秩越高意味着模型有更多的参数要训练，但也意味着模型具有更强的学习能力。您还需要指定 `target_modules`，它确定较小矩阵的插入位置。在本指南中，您将以注意力模块的*query*和*value*矩阵为目标。其他要设置的重要参数包括 `lora_alpha`（缩放因子）、`bias`（`none`、`all` 还是仅训练 LoRA 偏差参数），以及 `modules_to_save`（除了要训练和保存的 LoRA 层之外的模块）。所有这些参数以及更多参数都可以在 [LoraConfig](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/lora#peft.LoraConfig) 中找到。

```python
from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=16,
    lora_alpha=16,
    target_modules=["query", "value"],
    lora_dropout=0.1,
    bias="none",
    modules_to_save=["classifier"],
)
model = get_peft_model(model, config)
model.print_trainable_parameters()
"trainable params: 667,493 || all params: 86,543,818 || trainable%: 0.7712775047664294"
```

### **训练**

对于训练，让我们使用 Transformers 中的 [Trainer](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/trainer#transformers.Trainer) 类。`Trainer` 包含一个 PyTorch 训练循环，当您准备好后，调用 [train](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/trainer#transformers.Trainer.train) 开始训练。要自定义训练运行，请在 [TrainingArguments](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/trainer#transformers.TrainingArguments) 类中配置训练超参数。使用类似 LoRA 的方法，您可以负担得起使用更高的批量大小和学习率。

AdaLoRA 有一个 [update\_and\_allocate()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/adalora#peft.AdaLoraModel.update_and_allocate) 方法，应在每个训练步骤中调用该方法以更新参数预算和掩码，否则不会执行自适应步骤。这需要编写自定义训练循环或子类化 [Trainer](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/trainer#transformers.Trainer) 以合并此方法。例如，请查看这个 [自定义训练循环](https://github.com/huggingface/peft/blob/912ad41e96e03652cabf47522cd876076f7a0c4f/examples/conditional_generation/peft_adalora_seq2seq.py#L120)。

```python
from transformers import TrainingArguments, Trainer

account = "stevhliu"
peft_model_id = f"{account}/google/vit-base-patch16-224-in21k-lora"
batch_size = 128

args = TrainingArguments(
    peft_model_id,
    remove_unused_columns=False,
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=5e-3,
    per_device_train_batch_size=batch_size,
    gradient_accumulation_steps=4,
    per_device_eval_batch_size=batch_size,
    fp16=True,
    num_train_epochs=5,
    logging_steps=10,
    load_best_model_at_end=True,
    label_names=["labels"],
)
```

使用 [train](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/trainer#transformers.Trainer.train) 开始训练。

```python
trainer = Trainer(
    model,
    args,
    train_dataset=train_ds,
    eval_dataset=val_ds,
    tokenizer=image_processor,
    data_collator=collate_fn,
)
trainer.train()
```

## **分享你的模型**

训练完成后，您可以使用 [push\_to\_hub](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/model#transformers.PreTrainedModel.push_to_hub) 方法将您的模型上传到 Hub。您需要先登录您的 Hugging Face 帐户，并在提示时输入您的令牌。

```python
from huggingface_hub import notebook_login

notebook_login()
```

调用 [push\_to\_hub](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/model#transformers.PreTrainedModel.push_to_hub) 将您的模型保存到您的存储库。

model.push\_to\_hub(peft\_model\_id)

## **推理**

让我们从 Hub 加载模型，并在食物图像上进行测试。

```python
from peft import PeftConfig, PeftModel
from transformers import AutoImageProcessor
from PIL import Image
import requests

config = PeftConfig.from_pretrained("stevhliu/vit-base-patch16-224-in21k-lora")
model = AutoModelForImageClassification.from_pretrained(
    config.base_model_name_or_path,
    label2id=label2id,
    id2label=id2label,
    ignore_mismatched_sizes=True,
)
model = PeftModel.from_pretrained(model, "stevhliu/vit-base-patch16-224-in21k-lora")

url = "https://hugging-face.cn/datasets/sayakpaul/sample-datasets/resolve/main/beignets.jpeg"
image = Image.open(requests.get(url, stream=True).raw)
image
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E5%BE%AE%E8%B0%83%E7%AF%87-%E5%9F%BA%E4%BA%8ELoRA%E8%AE%AD%E7%BB%83%E5%9B%BE%E5%83%8F%E5%88%86%E7%B1%BB%E6%A8%A1%E5%9E%8B_assets/%E5%BE%AE%E8%B0%83%E7%AF%87-%E5%9F%BA%E4%BA%8ELoRA%E8%AE%AD%E7%BB%83%E5%9B%BE%E5%83%8F%E5%88%86%E7%B1%BB%E6%A8%A1%E5%9E%8B-Ki8kb5MaOocfKExDeijcIsbin7c.jpg)

将图像转换为 RGB 并返回底层 PyTorch 张量。

encoding = image\_processor(image.convert("RGB"), return\_tensors="pt")

现在运行模型并返回预测的类别！

```python
with torch.no_grad():
    outputs = model(**encoding)
    logits = outputs.logits

predicted_class_idx = logits.argmax(-1).item()
print("Predicted class:", model.config.id2label[predicted_class_idx])
"Predicted class: beignets"
```


