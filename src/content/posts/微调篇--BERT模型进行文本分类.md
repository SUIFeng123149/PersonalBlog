---
title: "微调篇--BERT模型进行文本分类"
published: 2026-07-29
description: "前言 在自然语言处理（NLP）领域中，情感分析是一项非常常见的任务。它的目标是判断文本的情感倾向，例如在社交媒体上的评论、产品评价、电影评论等数据中，识别文本是正面的、负面的，还是中性的。与传统的二分类情感分析不同，许多应用场景下需要将情感分为更多类别，例如正面、负面和中性，这就是所谓的多分类情感分析。 本次分享将带你一步步使用 BERT（Bidirectional Encoder Represe"
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


## 前言



> 在自然语言处理（NLP）领域中，情感分析是一项非常常见的任务。它的目标是判断文本的情感倾向，例如在社交媒体上的评论、产品评价、电影评论等数据中，识别文本是正面的、负面的，还是中性的。与传统的二分类情感分析不同，许多应用场景下需要将情感分为更多类别，例如正面、负面和中性，这就是所谓的多分类情感分析。
> 本次分享将带你一步步使用 BERT（Bidirectional Encoder Representations from Transformers）进行中文多分类情感分析。BERT 是目前最强大的预训练语言模型之一，能够处理复杂的自然语言任务。通过 BERT 的预训练模型，我们可以快速上手并进行模型微调，来完成情感分析任务。
>
>
> 本次我们将使用开源的 ChnSentiCorp 数据集进行中文情感分析的多分类任务，包括数据清洗、模型训练、准确度评估以及模型导出等步骤。



## 中文情感分析的多分类任务简介



### **情感分析的分类**



情感分析旨在分析文本中的情感倾向。在传统的情感分析任务中，通常是将情感分类为 “正面” 和“负面”两类。多分类情感分析则需要分类更多的情感类别，比如 “正面”、“负面”、“中性” 三类，甚至可以细化为不同的情感等级（如非常满意、满意、一般、差、非常差）。

多分类任务的复杂性较高，因为情感的表达形式和种类多样，模型需要能够从文本的上下文中理解更细腻的情感差异。



### **BERT 的优势**



BERT 模型通过预训练在大规模文本语料上学习到了丰富的语言表示，能够在许多 [<span style="color: rgb(36,91,219); background-color: inherit">NLP</span>](https://so.csdn.net/so/search?q=NLP\&spm=1001.2101.3001.7020) 任务中达到顶尖水平。BERT 的双向特性使得它能够同时从句子的左右两边理解语义，这使它在情感分析任务中表现出色。



## 步骤概览



1. **环境准备**：安装所需的 Python 库和工具。

2. **加载中文 BERT 预训练模型**：使用 Huggingface 提供的 <span style="color: inherit; background-color: rgb(242,243,245)">bert-base-chinese</span> 模型。

3. **加载开源数据集 ChnSentiCorp**：并进行数据清洗和预处理。

4. **数据预处理**：对文本进行分词、编码，并处理多分类标签。

5. **训练模型**：对 BERT 进行微调，训练多分类情感分析模型。

6. **评估模型性能**：在测试集上评估模型的准确度。

7. **导出模型**：保存训练好的模型，供以后使用或部署。



## 步骤 1：环境准备

首先，确保你的 Python 环境已经准备好。我们需要安装以下必要的库：

`pip install torch transformers datasets scikit-learn`

* **<span style="color: inherit; background-color: rgb(242,243,245)">torch</span>**：PyTorch 库，用于深度学习模型的构建和训练。

* **<span style="color: inherit; background-color: rgb(242,243,245)">transformers</span>**：Huggingface 的 Transformers 库，包含了 BERT 等多种预训练模型。

* **<span style="color: inherit; background-color: rgb(242,243,245)">datasets</span>**：Huggingface 的数据集库，方便加载开源数据集。

* **<span style="color: inherit; background-color: rgb(242,243,245)">scikit-learn</span>**：用于模型评估和准确度计算。



## 步骤 2：加载中文 BERT 预训练模型



Huggingface 提供了多个 BERT 预训练模型，我们可以直接使用 <span style="color: inherit; background-color: rgb(242,243,245)">bert-base-chinese</span> 模型，它已经在大量中文语料上进行了预训练，并且可以进一步微调来处理我们的情感分析任务。



```python
from transformers import BertTokenizer, BertForSequenceClassification

# 步骤 2：加载中文 BERT 预训练模型
tokenizer = BertTokenizer.from_pretrained('bert-base-chinese')
model = BertForSequenceClassification.from_pretrained('bert-base-chinese', num_labels=3)
```

* **<span style="color: inherit; background-color: rgb(242,243,245)">num_labels=3</span>**：表示我们要进行三类情感的分类（正面、负面、中性）。



## 步骤 3：加载 ChnSentiCorp 数据集并进行清洗



**ChnSentiCorp 数据集简介**

**ChnSentiCorp** 是一个常用的中文[<span style="color: rgb(36,91,219); background-color: inherit">情感分析数据集</span>](https://so.csdn.net/so/search?q=%E6%83%85%E6%84%9F%E5%88%86%E6%9E%90%E6%95%B0%E6%8D%AE%E9%9B%86\&spm=1001.2101.3001.7020)，包含了大量的中文评论数据。每条评论都有一个情感标签，标签可以是正面（1）、负面（0）或中性（2）。这个数据集非常适合情感分析任务的训练和评估。



**加载数据集**

我们可以通过 Huggingface 的 <span style="color: inherit; background-color: rgb(242,243,245)">datasets</span> 库直接加载该数据集：

```python
# 步骤 3：加载 ChnSentiCorp 数据集并进行清洗
from datasets import load_dataset

# 加载 ChnSentiCorp 数据集
# 数据集地址：https://huggingface.co/datasets/lansinuote/ChnSentiCorp
dataset = load_dataset('lansinuote/ChnSentiCorp')
```

加载后的数据集通常包括三个部分：<span style="color: inherit; background-color: rgb(242,243,245)">train</span>（训练集）、<span style="color: inherit; background-color: rgb(242,243,245)">validation</span>（验证集）和 <span style="color: inherit; background-color: rgb(242,243,245)">test</span>（测试集）。

以下是它们的区别：

* **训练集（Training Set）**

  * 用途：用于训练模型，即调整模型参数以最小化损失函数。

  * 特点：包含大量标注数据，模型通过学习这些数据中的模式来做出预测。

* **验证集（Validation Set）**

  * 用途：用于调整模型的超参数（如学习率、正则化强度等），并监控模型在未见过的数据上的表现，防止过拟合。

  * 特点：通常从训练集中划分出来的一部分数据，不参与模型参数的更新，但用于选择最佳模型或停止训练的最佳时机（如早停法）。

* **测试集（Test Set）**

  * 用途：用于最终评估模型的性能，提供一个无偏见的评估结果，反映模型在新数据上的泛化能力。

  * 特点：在整个训练和验证过程结束后才使用，确保模型没有见过这些数据，从而得到真实的性能指标。



* 训练集 (<span style="color: inherit; background-color: rgb(187,191,196)">encoded_dataset[&#39;train&#39;]</span>)：用于训练BERT模型。

* 验证集 (<span style="color: inherit; background-color: rgb(187,191,196)">encoded_dataset[&#39;validation&#39;]</span>)：用于在每个epoch后评估模型性能，帮助调整训练参数。

* 测试集 (<span style="color: inherit; background-color: rgb(187,191,196)">encoded_dataset[&#39;test&#39;]</span>)：用于最终评估模型的准确性和损失值，如代码中显示的<span style="color: inherit; background-color: rgb(187,191,196)">eval_loss: 0.2</span>和<span style="color: inherit; background-color: rgb(187,191,196)">eval_accuracy: 0.85</span>。



**数据清洗**

为了确保数据的质量，我们可以清洗文本，去除不必要的标点符号和空格。

```python
import re
# 定义数据清洗函数
def clean_text(text):
    text = re.sub(r'[^\w\s]', '', text)  # 去除标点符号
    text = text.strip()  # 去除前后空格
    return text

# 对数据集中的文本进行清洗
dataset = dataset.map(lambda x: {'text': clean_text(x['text'])})
```

## 步骤 4：数据预处理

BERT 模型需要特定格式的输入。我们需要将每条文本数据通过 BERT 的分词器进行分词，并转换为适合模型输入的格式。

```python
# 步骤 4：数据预处理
def tokenize_function(examples):
    return tokenizer(examples['text'], padding='max_length', truncation=True, max_length=128)

# 对数据集进行分词和编码
encoded_dataset = dataset.map(tokenize_function, batched=True)
```

* **<span style="color: inherit; background-color: rgb(242,243,245)">padding=&#39;max_length&#39;</span>**：将所有句子填充到最大长度，确保输入大小一致。

* **<span style="color: inherit; background-color: rgb(242,243,245)">truncation=True</span>**：对于超长的句子进行截断，最大长度为 128。

接下来，我们确保数据集中的标签已被正确编码为整数形式。ChnSentiCorp 数据集中通常只有正面和负面标签，如果需要中性情感，可以扩展数据集或进行数据增强。

## 步骤 5：训练模型

使用 Huggingface 的 <span style="color: inherit; background-color: rgb(242,243,245)">Trainer</span> 接口，我们可以快速训练模型。首先，我们定义训练参数并开始训练。

```python
# 步骤 5：训练模型
from transformers import Trainer, TrainingArguments

# 定义训练参数
# 定义训练参数，创建一个TrainingArguments对象
training_args = TrainingArguments(
    output_dir='./results',  # 指定训练输出的目录，用于保存模型和其他输出文件
    num_train_epochs=1,  # 设置训练的轮数，这里设置为1轮
    per_device_train_batch_size=1,  # 每个设备（如GPU）上的训练批次大小，这里设置为1
    per_device_eval_batch_size=1,  # 每个设备上的评估批次大小，这里设置为1
    evaluation_strategy="epoch",  # 设置评估策略为每个epoch结束后进行评估
    logging_dir='./logs',  # 指定日志保存的目录，用于记录训练过程中的日志信息
)

# 使用 Trainer 进行训练
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset['train'],
    eval_dataset=encoded_dataset['validation'],
)

# 开始训练
trainer.train()
```

* **<span style="color: inherit; background-color: rgb(242,243,245)">num_train_epochs=3</span>**：模型将在数据集上训练 3 个轮次。

* **<span style="color: inherit; background-color: rgb(242,243,245)">per_device_train_batch_size=16</span>**：每个设备的训练批次大小为 16。

```python
{'loss': 0.7493, 'grad_norm': 31.590713500976562, 'learning_rate': 1.3541666666666666e-05, 'epoch': 0.73}
```

在训练机器学习模型时，通常会输出一些指标来帮助我们理解模型的训练过程和性能。以下是你提到的几个参数的通俗解释：

1. **loss（损失）**

   1. **含义**：损失值是一个衡量模型预测与实际标签之间差异的指标。损失值越小，表示模型的预测结果越接近真实值。

   2. **例子**：假设我们在训练一个猫狗分类器，损失值为0.7493表示模型在当前训练状态下，预测结果与实际标签之间的差异程度。损失值越小，说明模型的预测越准确。

2. **grad\_norm（梯度范数）**

   1. **含义**：梯度范数是一个衡量模型参数更新幅度的指标。它反映了模型在当前训练步骤中，参数调整的大小。过大的梯度可能导致训练不稳定。

   2. **例子**：在训练过程中，如果grad\_norm为31.5907，说明模型参数在这一轮训练中调整的幅度较大。通常，我们希望梯度范数适中，以确保模型稳定收敛。

3. **learning\_rate（学习率）**：

   1. **含义**：学习率是一个超参数，决定了模型在每次更新时，参数调整的步长。学习率过大可能导致模型不收敛，过小则可能导致训练速度过慢。

   2. **例子**：学习率为1.354e-05表示每次参数更新时，模型的调整步长非常小。这通常用于精细调整模型参数，以提高模型的精度。

4. **epoch（轮次）**：

   1. **含义**：一个epoch表示模型已经完整地遍历了一遍训练数据集。通常，训练需要多个epoch以确保模型充分学习数据特征。

   2. **例子**：epoch为0.73表示模型已经完成了73%的第一轮训练。通常，我们会设置多轮训练以提高模型的性能。

这些参数帮助我们监控和调整模型的训练过程，以便获得更好的预测性能。

## 步骤 6：评估模型性能



训练完成后，我们在测试集上评估模型的表现，计算模型的准确度。

```python
# 步骤 6：评估模型性能
from sklearn.metrics import accuracy_score

# 定义评估函数
def compute_metrics(p):
    preds = p.predictions.argmax(-1)
    return {"accuracy": accuracy_score(p.label_ids, preds)}

# 在测试集上评估模型
trainer.evaluate(encoded_dataset['test'], metric_key_prefix="eval")
```

通过这个过程，我们可以查看模型在测试集上的准确度，通常会输出如下结果：

```python
{'eval_loss': 0.2, 'eval_accuracy': 0.85}
#eval_loss: 0.2：这是模型在测试集上的损失值。
#损失值是一个衡量模型预测与实际标签之间差异的指标。
#较低的损失值通常表示模型的预测更接近于真实标签。
```

在这个例子中，模型的准确度为 85%，表明它在多分类情感分析任务中表现良好。



## 步骤 7：导出模型

为了方便将来使用，我们可以将训练好的模型保存下来，并将分词器一并保存：

```python
# 步骤 7：导出模型
# 保存模型和分词器
model.save_pretrained('./sentiment_model')
tokenizer.save_pretrained('./sentiment_model')
```

保存后的模型可以在未来的情感分析任务中重新加载并使用。

## 总结

> 本文详细介绍了如何使用 BERT 模型进行中文情感分析的多分类任务。通过加载 BERT 预训练模型、加载开源数据集 **ChnSentiCorp**、进行数据清洗和预处理，我们训练了一个中文多分类情感分析模型，并在测试集上评估了模型的准确度。最后，我们将训练好的模型导出，供未来的使用或部署。
> 通过本次分享，新手能够掌握如何使用 BERT 进行中文情感分析，并可以根据自己的需要进一步微调模型。未来还可以尝试使用更大规模的数据集、数据增强技术和更复杂的模型架构（如 RoBERTa、ALBERT 等）来优化模型性能。



尽管我们使用了 BERT 完成了多分类情感分析任务，以下几个方面可以进一步优化模型的表现：

1. **扩展数据集**：使用更多的中文情感数据集进行训练，提升模型的泛化能力。

2. **数据增强**：使用数据增强技术（如同义词替换、文本生成等）丰富训练数据，提升模型在不同场景下的表现。

3. **调参实验**：调整训练过程中的超参数（如学习率、批次大小、训练轮次等）以获得最佳性能。

4. **更复杂的模型**：尝试使用其他预训练模型（如 RoBERTa、ALBERT）以获得更好的表现。


