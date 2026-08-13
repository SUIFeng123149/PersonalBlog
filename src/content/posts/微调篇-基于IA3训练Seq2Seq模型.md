---
title: "微调篇-基于IA3训练Seq2Seq模型"
published: 2026-07-29
description: "前言 通过三个学习到的向量来乘模型的激活值（自注意力机制和编码器 解码器注意力模块中的键和值，以及逐位置前馈网络的中间激活值）。这种 PEFT 方法引入的可训练参数数量甚至比 LoRA 更少，LoRA 引入的是权重矩阵而不是向量。原始模型的参数保持冻结，只有这些向量会被更新。因此，为新的下游任务进行微调更快、更便宜、更高效。 本指南将向您展示如何使用 IA3 训练序列到序列模型，以 生成给定财经新"
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

[IA3](https://hugging-face.cn/docs/peft/conceptual_guides/ia3) 通过三个学习到的向量来乘模型的激活值（自注意力机制和编码器-解码器注意力模块中的键和值，以及逐位置前馈网络的中间激活值）。这种 PEFT 方法引入的可训练参数数量甚至比 LoRA 更少，LoRA 引入的是权重矩阵而不是向量。原始模型的参数保持冻结，只有这些向量会被更新。因此，为新的下游任务进行微调更快、更便宜、更高效。

本指南将向您展示如何使用 IA3 训练序列到序列模型，以*生成给定财经新闻的情感*。

熟悉训练序列到序列模型的一般过程将非常有帮助，并使您能够专注于如何应用 IA3。如果您是新手，我们建议您首先查看 Transformers 文档中的 [翻译](https://hugging-face.cn/docs/transformers/tasks/translation) 和 [摘要](https://hugging-face.cn/docs/transformers/tasks/summarization) 指南。当您准备好后，再回来看看将 PEFT 融入您的训练有多么容易！

一般任务类型有以下几种

##### **SEQ\_CLS**

> 序列分类（Sequence Classification），对整个句子进行分类。如: 获取评论的情绪，检测电子邮件是否为垃圾邮件，确定句子在语法上是否正确或两个句子在逻辑上是否相关等

##### **SEQ\_2\_SEQ\_LM**

> 条件生成任务，根据给定的输入（可能是文本、图片等）生成符合条件的输出。
>
> 与因果语言建模任务不同，条件生成不仅仅关注于给定上下文的连贯性，还关注于满足预定的任务要求。因果语言建模仅关注于根据给定的上下文生成文本序列。
>
> 条件生成的应用包括但不限于机器翻译、文本摘要、图像描述等。这些任务通常需要模型在输入和输出之间建立复杂的映射关系。

##### **CAUSAL\_LM**

> 因果语言建模任务（CLM），在这种建模方法中，模型试图预测给定上下文中的下一个单词，该上下文通常包括在当前单词之前的所有单词。这种建模方法遵循因果原则，即当前单词只受到其前面单词的影响，而不受后面单词的影响。代表模型有 GPT2、Bloom、OPT、GPT-Neo、GPT-J、LLaMA、ChatGLM。

##### **TOKEN\_CLS**

> Token 分类任务（Token Classification），对句子中的每个词进行分类。如: 识别句子的语法成分（名词、动词、形容词）或命名实体（人、地点、组织）。

## **数据集**

您将使用 [financial\_phrasebank](https://hugging-face.cn/datasets/financial_phrasebank) 数据集的 sentences\_allagree 子集。此子集包含财经新闻，其中情感标签的标注者一致性为 100%。查看 [数据集查看器](https://hugging-face.cn/datasets/financial_phrasebank/viewer/sentences_allagree)，以更好地了解您将使用的数据和句子。

使用 [load\_dataset](https://hugging-face.cn/docs/datasets/v3.4.1/en/package_reference/loading_methods#datasets.load_dataset) 函数加载数据集。数据集的此子集仅包含训练拆分，因此使用 `train_test_split` 函数创建训练和验证拆分。创建一个新的 `text_label` 列，以便更容易理解 `label` 值 `0`、`1` 和 `2` 的含义。

```python
from datasets import load_dataset

ds = load_dataset("financial_phrasebank", "sentences_allagree")
ds = ds["train"].train_test_split(test_size=0.1)
ds["validation"] = ds["test"]
del ds["test"]

classes = ds["train"].features["label"].names
ds = ds.map(
    lambda x: {"text_label": [classes[label] for label in x["label"]]},
    batched=True,
    num_proc=1,
)

ds["train"][0]
{'sentence': 'It will be operated by Nokia , and supported by its Nokia NetAct network and service management system .',
 'label': 1,
 'text_label': 'neutral'}
```

加载分词器并创建一个预处理函数，该函数将

1. 对输入进行分词，将序列填充和截断到 `max_length`

2. 将相同的分词器应用于标签，但使用与标签对应的较短的 `max_length`

3. 掩码填充 tokens

```python
from transformers import AutoTokenizer

text_column = "sentence"
label_column = "text_label"
max_length = 128

tokenizer = AutoTokenizer.from_pretrained("bigscience/mt0-large")

def preprocess_function(examples):
    inputs = examples[text_column]
    targets = examples[label_column]
    model_inputs = tokenizer(inputs, max_length=max_length, padding="max_length", truncation=True, return_tensors="pt")
    labels = tokenizer(targets, max_length=3, padding="max_length", truncation=True, return_tensors="pt")
    labels = labels["input_ids"]
    labels[labels == tokenizer.pad_token_id] = -100
    model_inputs["labels"] = labels
    return model_inputs
```

使用 [map](https://hugging-face.cn/docs/datasets/v3.4.1/en/package_reference/main_classes#datasets.Dataset.map) 函数将预处理函数应用于整个数据集。

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

创建训练和评估 [DataLoader](https://pytorch.ac.cn/docs/stable/data.html#torch.utils.data.DataLoader)，并设置 `pin_memory=True` 以加快数据传输到 GPU 的速度（如果在 CPU 上有数据集样本）。

```python
from torch.utils.data import DataLoader
from transformers import default_data_collator

train_ds = processed_ds["train"]
eval_ds = processed_ds["validation"]

batch_size = 8

train_dataloader = DataLoader(
    train_ds, shuffle=True, collate_fn=default_data_collator, batch_size=batch_size, pin_memory=True
)
eval_dataloader = DataLoader(eval_ds, collate_fn=default_data_collator, batch_size=batch_size, pin_memory=True)
```

## **模型**

现在您可以加载一个预训练模型，用作 IA3 的基础模型。本指南使用 [bigscience/mt0-large](https://hugging-face.cn/bigscience/mt0-large) 模型，但您可以使用任何您喜欢的序列到序列模型。

```python
from transformers import AutoModelForSeq2SeqLM

model = AutoModelForSeq2SeqLM.from_pretrained("bigscience/mt0-large")
```

### **PEFT 配置和模型**

所有 PEFT 方法都需要一个配置，其中包含并指定 PEFT 方法应如何应用的所有参数。创建一个 [IA3Config](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/ia3#peft.IA3Config)，其中包含任务类型并将推理模式设置为 `False`。您可以在 [API 参考](https://hugging-face.cn/docs/peft/package_reference/ia3#ia3config) 中找到此配置的其他参数。

调用 [print\_trainable\_parameters()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel.print_trainable_parameters) 方法来比较 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel) 的可训练参数数量与基础模型中的参数数量！

配置设置完成后，将其与基础模型一起传递给 [get\_peft\_model()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.get_peft_model) 函数，以创建一个可训练的 [PeftModel](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/peft_model#peft.PeftModel)。

```python
from peft import IA3Config, get_peft_model

peft_config = IA3Config(task_type="SEQ_2_SEQ_LM")
model = get_peft_model(model, peft_config)
model.print_trainable_parameters()
"trainable params: 282,624 || all params: 1,229,863,936 || trainable%: 0.022980103060766553"
```

### **训练**

设置优化器和学习率调度器。

```python
import torch
from transformers import get_linear_schedule_with_warmup

lr = 8e-3
num_epochs = 3

optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
lr_scheduler = get_linear_schedule_with_warmup(
    optimizer=optimizer,
    num_warmup_steps=0,
    num_training_steps=(len(train_dataloader) * num_epochs),
)
```

将模型移动到 GPU 并创建一个训练循环，该循环报告每个 epoch 的损失和困惑度。

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

## **分享您的模型**

训练完成后，您可以使用 [push\_to\_hub](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/model#transformers.PreTrainedModel.push_to_hub) 方法将您的模型上传到 Hub。您需要先登录您的 Hugging Face 帐户，并在提示时输入您的令牌。

```python
from huggingface_hub import notebook_login

account = <your-hf-account-name>
peft_model_id = f"{account}/mt0-large-ia3"
model.push_to_hub(peft_model_id)
```

## **推理**

要加载模型进行推理，请使用 [from\_pretrained()](https://hugging-face.cn/docs/peft/v0.15.0/en/package_reference/auto_class#peft.AutoPeftModel.from_pretrained) 方法。让我们还从数据集中加载一句财经新闻，以生成情感。

```python
from peft import AutoPeftModelForSeq2SeqLM

model = AutoPeftModelForSeq2SeqLM.from_pretrained("<your-hf-account-name>/mt0-large-ia3").to("cuda")
tokenizer = AutoTokenizer.from_pretrained("bigscience/mt0-large")

i = 15
inputs = tokenizer(ds["validation"][text_column][i], return_tensors="pt")
print(ds["validation"][text_column][i])
"The robust growth was the result of the inclusion of clothing chain Lindex in the Group in December 2007 ."
```

调用 [generate](https://hugging-face.cn/docs/transformers/v4.49.0/en/main_classes/text_generation#transformers.GenerationMixin.generate) 方法来生成预测的情感标签。

```python
with torch.no_grad():
    inputs = {k: v.to(device) for k, v in inputs.items()}
    outputs = model.generate(input_ids=inputs["input_ids"], max_new_tokens=10)
    print(tokenizer.batch_decode(outputs.detach().cpu().numpy(), skip_special_tokens=True))
['positive']
```


