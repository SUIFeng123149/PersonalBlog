---
title: 微调篇--基于P-Tuning微调模型
published: 2026-07-29
description: ''
image: ''
tags: ['Fine-tuning']
category: 'Fine-tuning'
draft: false
lang: zh-CN
---
## 前言

Prompt 可以描述一个任务，或者提供您希望模型学习的任务示例。软提示方法不是手动创建这些 prompt，而是在输入嵌入中添加可学习的参数，这些参数可以针对特定任务进行优化，同时保持预训练模型的参数冻结。这使得为新的下游任务微调大型语言模型 (LLM) 变得更快、更容易。

PEFT 库支持多种类型的 prompt 方法（p-tuning、prefix tuning、prompt tuning），您可以在[软提示](https://hugging-face.cn/docs/peft/conceptual_guides/prompting)指南中了解更多关于这些方法在概念上是如何工作的。如果您有兴趣将这些方法应用于其他任务和用例，请查看我们的[notebook 合集](https://hugging-face.cn/spaces/PEFT/soft-prompting)！

本指南将向您展示如何使用软提示方法训练因果语言模型，以*生成分类*，判断推文是否为投诉。

熟悉训练因果语言模型的一般过程将非常有帮助，并使您能够专注于软提示方法。如果您是新手，我们建议您首先查看 Transformers 文档中的[因果语言建模](https://hugging-face.cn/docs/transformers/tasks/language_modeling)指南。当您准备好后，请返回查看将 PEFT 融入您的训练有多么容易！

在开始之前，请确保您已安装所有必要的库。

pip install -q peft transformers datasets



* `task_type`：要训练的任务类型（在本例中为序列到序列语言建模）条件生成任务，根据给定的输入（可能是文本、图片等）生成符合条件的输出。

**SEQ\_CLS**

> 序列分类（Sequence Classification），对整个句子进行分类。如: 获取评论的情绪，检测电子邮件是否为垃圾邮件，确定句子在语法上是否正确或两个句子在逻辑上是否相关等

**SEQ\_2\_SEQ\_LM**

> 条件生成任务，根据给定的输入（可能是文本、图片等）生成符合条件的输出。
>
> 与因果语言建模任务不同，条件生成不仅仅关注于给定上下文的连贯性，还关注于满足预定的任务要求。因果语言建模仅关注于根据给定的上下文生成文本序列。
>
> 条件生成的应用包括但不限于机器翻译、文本摘要、图像描述等。这些任务通常需要模型在输入和输出之间建立复杂的映射关系。

**CAUSAL\_LM**

> 因果语言建模任务（CLM），在这种建模方法中，模型试图预测给定上下文中的下一个单词，该上下文通常包括在当前单词之前的所有单词。这种建模方法遵循因果原则，即当前单词只受到其前面单词的影响，而不受后面单词的影响。代表模型有 GPT2、Bloom、OPT、GPT-Neo、GPT-J、LLaMA、ChatGLM。

**TOKEN\_CLS**

> Token 分类任务（Token Classification），对句子中的每个词进行分类。如: 识别句子的语法成分（名词、动词、形容词）或命名实体（人、地点、组织）。



## 数据集

在本指南中，您将使用 [RAFT](https://hugging-face.cn/datasets/ought/raft) 数据集的 `twitter_complaints` 子集。`twitter_complaints` 子集包含标记为 `complaint` 和 `no complaint` 的推文，您可以查看[数据集查看器](https://hugging-face.cn/datasets/ought/raft/viewer/twitter_complaints)，以更好地了解数据的外观。

使用 [load\_dataset](https://hugging-face.cn/docs/datasets/v3.4.1/en/package_reference/loading_methods#datasets.load_dataset) 函数加载数据集并创建一个新的 `text_label` 列，以便更容易理解 `Label` 值 `1` 和 `2` 的含义。

```python
from datasets import load_dataset

ds = load_dataset("ought/raft", "twitter_complaints")

classes = [k.replace("_", " ") for k in ds["train"].features["Label"].names]
ds = ds.map(
    lambda x: {"text_label": [classes[label] for label in x["Label"]]},
    batched=True,
    num_proc=1,
)
ds["train"][0]
```

`{"Tweet text": "@HMRCcustomers No this is my first job", "ID": 0, "Label": 2, "text_label": "no complaint"}`

加载分词器，定义要使用的填充 token，并确定分词后标签的最大长度。

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bigscience/bloomz-560m")
if tokenizer.pad_token_id is None:
    tokenizer.pad_token_id = tokenizer.eos_token_id
target_max_length = max([len(tokenizer(class_label)["input_ids"]) for class_label in classes])
print(target_max_length)
```

创建一个预处理函数，该函数对推文文本和标签进行分词，填充每个批次的输入和标签，创建注意力掩码，并将序列截断为 `max_length`。然后将 `input_ids`、`attention_mask` 和 `labels` 转换为 PyTorch 张量。

```python
import torch

max_length = 64

def preprocess_function(examples, text_column="Tweet text", label_column="text_label"):
    batch_size = len(examples[text_column])
    inputs = [f"{text_column} : {x} Label : " for x in examples[text_column]]
    targets = [str(x) for x in examples[label_column]]
    model_inputs = tokenizer(inputs)
    labels = tokenizer(targets)
    classes = [k.replace("_", " ") for k in ds["train"].features["Label"].names]
    for i in range(batch_size):
        sample_input_ids = model_inputs["input_ids"][i]
        label_input_ids = labels["input_ids"][i]
        model_inputs["input_ids"][i] = [tokenizer.pad_token_id] * (
            max_length - len(sample_input_ids)
        ) + sample_input_ids
        model_inputs["attention_mask"][i] = [0] * (max_length - len(sample_input_ids)) + model_inputs[
            "attention_mask"
        ][i]
        labels["input_ids"][i] = [-100] * (max_length - len(label_input_ids)) + label_input_ids
        model_inputs["input_ids"][i] = torch.tensor(model_inputs["input_ids"][i][:max_length])
        model_inputs["attention_mask"][i] = torch.tensor(model_inputs["attention_mask"][i][:max_length])
        labels["input_ids"][i] = torch.tensor(labels["input_ids"][i][:max_length])
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs
```

使用 [map](https://hugging-face.cn/docs/datasets/v3.4.1/en/package_reference/main_classes#datasets.Dataset.map) 函数将预处理函数应用于整个数据集，并删除未处理的列，因为模型不需要它们。

```python
processed_ds = ds.map(
    preprocess_function,
    batched=True,
    num_proc=1,
    remove_columns=ds["train"].column_names,
    load_from_cache_file=False,
    desc="Running tokenizer on dataset",
)
```

最后，创建一个训练和评估 [DataLoader](https://pytorch.ac.cn/docs/stable/data.html#torch.utils.data.DataLoader)。如果数据集中的样本位于 CPU 上，您可以设置 `pin_memory=True` 以加速训练期间数据传输到 GPU 的速度。

```python
from torch.utils.data import DataLoader
from transformers import default_data_collator

train_ds = processed_ds["train"]
eval_ds = processed_ds["test"]

batch_size = 16

train_dataloader = DataLoader(train_ds, shuffle=True, collate_fn=default_data_collator, batch_size=batch_size, pin_memory=True)
eval_dataloader = DataLoader(eval_ds, collate_fn=default_data_collator, batch_size=batch_size, pin_memory=True)
```

## 模型

现在让我们加载一个预训练模型，用作软提示方法的基础模型。本指南使用 [bigscience/bloomz-560m](https://hugging-face.cn/bigscience/bloomz-560m) 模型，但您可以使用任何您想要的因果语言模型。

```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("bigscience/bloomz-560m")
```

### PEFT 配置和模型

对于任何 PEFT 方法，您都需要创建一个配置，其中包含指定应如何应用 PEFT 方法的所有参数。配置设置完成后，将其与基础模型一起传递给 [get\_peft\_model()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.get_peft_model) 函数，以创建一个可训练的 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel)。

调用 [print\_trainable\_parameters()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel.print_trainable_parameters) 方法来比较 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel) 的可训练参数数量与基础模型中的参数数量！

[P-tuning](https://hugging-face.cn/docs/peft/conceptual_guides/prompting#p-tuning) 添加了一个可训练的嵌入张量，其中 prompt tokens 可以添加到输入序列中的任何位置。创建一个 [PromptEncoderConfig](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/p_tuning#peft.PromptEncoderConfig)，其中包含任务类型、要添加和学习的虚拟 token 数量以及用于学习 prompt 参数的编码器隐藏层大小。

```python
from peft import PromptEncoderConfig, get_peft_model

peft_config = PromptEncoderConfig(task_type="CAUSAL_LM", num_virtual_tokens=20, encoder_hidden_size=128)
model = get_peft_model(model, peft_config)
model.print_trainable_parameters()
```

`"trainable params: 300,288 || all params: 559,514,880 || trainable%: 0.05366935013417338"`

### 训练

设置优化器和学习率调度器。

```python
from transformers import get_linear_schedule_with_warmup

lr = 3e-2
num_epochs = 50

optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
lr_scheduler = get_linear_schedule_with_warmup(
    optimizer=optimizer,
    num_warmup_steps=0,
    num_training_steps=(len(train_dataloader) * num_epochs),
)
```

将模型移动到 GPU，并创建一个训练循环，报告每个 epoch 的损失和困惑度。

```python
from tqdm import tqdm

device = "cuda"
model = model.to(device)

for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    for step, batch in enumerate(tqdm(train_dataloader)):
        batch = {k: v.to(device) for k, v in batch.items()}
        outputs = model(**batch)
        loss = outputs.loss
        total_loss += loss.detach().float()
        loss.backward()
        optimizer.step()
        lr_scheduler.step()
        optimizer.zero_grad()

    model.eval()
    eval_loss = 0
    eval_preds = []
    for step, batch in enumerate(tqdm(eval_dataloader)):
        batch = {k: v.to(device) for k, v in batch.items()}
        with torch.no_grad():
            outputs = model(**batch)
        loss = outputs.loss
        eval_loss += loss.detach().float()
        eval_preds.extend(
            tokenizer.batch_decode(torch.argmax(outputs.logits, -1).detach().cpu().numpy(), skip_special_tokens=True)
        )

    eval_epoch_loss = eval_loss / len(eval_dataloader)
    eval_ppl = torch.exp(eval_epoch_loss)
    train_epoch_loss = total_loss / len(train_dataloader)
    train_ppl = torch.exp(train_epoch_loss)
    print(f"{epoch=}: {train_ppl=} {train_epoch_loss=} {eval_ppl=} {eval_epoch_loss=}")
```

## 分享您的模型

训练完成后，您可以使用 [push\_to\_hub](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/model#transformers.PreTrainedModel.push_to_hub) 方法将您的模型上传到 Hub。您需要先登录您的 Hugging Face 帐户，并在提示时输入您的 token。

```python
from huggingface_hub import notebook_login

account = <your-hf-account-name>
peft_model_id = f"{account}/bloomz-560-m-peft-method"
model.push_to_hub(peft_model_id)
```

如果您检查存储库中的模型文件大小，您会发现它比完整大小的模型小得多！

