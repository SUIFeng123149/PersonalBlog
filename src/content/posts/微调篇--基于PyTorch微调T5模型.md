---
title: "微调篇--基于PyTorch微调T5模型"
published: 2026-07-29
description: "& x20; 前言 本次分享如何在和中运行示例摘要训练脚本 设置 要成功运行示例脚本的最新版本，您必须在新虚拟环境中 从源代码安装 \\ \\ & xD83E;� Transformers\\ \\ ： 然后切换您clone的 🤗 Transformers 仓到特定的版本，例如v3.5.1： git checkout tags/v3.5.1 在安装了正确的库版本后，进入您选择的版本的 example 文"
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
&#x20;





# 前言

本次分享如何在[PyTorch](https://github.com/huggingface/transformers/tree/main/examples/pytorch/summarization)和中运行示例摘要训练脚本

## 设置

要成功运行示例脚本的最新版本，您必须在新虚拟环境中**从源代码安装 \*\***&#xD83E;� Transformers\*\*：

```python
git clone https://github.com/huggingface/transformers
cd transformers
pip install .
```

然后切换您clone的 🤗 Transformers 仓到特定的版本，例如v3.5.1：

`git checkout tags/v3.5.1`

在安装了正确的库版本后，进入您选择的版本的`example`文件夹并安装例子要求的环境：

`pip install -r requirements.txt`

## 运行脚本

示例脚本从🤗 [Datasets](https://huggingface.co/docs/datasets/)库下载并预处理数据集。然后，脚本通过[Trainer](https://huggingface.co/docs/transformers/main_classes/trainer)使用支持摘要任务的架构对数据集进行微调。以下示例展示了如何在[CNN/DailyMail](https://huggingface.co/datasets/cnn_dailymail)数据集上微调[T5-small](https://huggingface.co/google-t5/t5-small)。由于T5模型的训练方式，它需要一个额外的`source_prefix`参数。这个提示让T5知道这是一个摘要任务。

```sql
python examples/pytorch/summarization/run_summarization.py \
    --model_name_or_path google-t5/t5-small \
    --do_train \
    --do_eval \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --output_dir /tmp/tst-summarization \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --overwrite_output_dir \
    --predict_with_generate
```

示例脚本从 🤗 [Datasets](https://huggingface.co/docs/datasets/) 库下载并预处理数据集。然后，脚本使用 Keras 在支持摘要的架构上微调数据集。以下示例展示了如何在 [CNN/DailyMail](https://huggingface.co/datasets/cnn_dailymail) 数据集上微调 [T5-small](https://huggingface.co/google-t5/t5-small)。T5 模型由于训练方式需要额外的 `source_prefix` 参数。这个提示让 T5 知道这是一个摘要任务。

```sql
python examples/tensorflow/summarization/run_summarization.py  \
    --model_name_or_path google-t5/t5-small \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --output_dir /tmp/tst-summarization  \
    --per_device_train_batch_size 8 \
    --per_device_eval_batch_size 16 \
    --num_train_epochs 3 \
    --do_train \
    --do_eval
```

## 分布式训练和混合精度

[Trainer](https://huggingface.co/docs/transformers/main_classes/trainer) 支持分布式训练和混合精度，这意味着你也可以在脚本中使用它。要启用这两个功能，可以做如下设置：

* 添加 `fp16` 参数以启用混合精度。

* 使用 `nproc_per_node` 参数设置使用的GPU数量。



```sql
torchrun \
    --nproc_per_node 8 pytorch/summarization/run_summarization.py \
    --fp16 \
    --model_name_or_path google-t5/t5-small \
    --do_train \
    --do_eval \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --output_dir /tmp/tst-summarization \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --overwrite_output_dir \
    --predict_with_generate
```

TensorFlow脚本使用`MirroredStrategy`进行分布式训练，您无需在训练脚本中添加任何其他参数。如果可用，TensorFlow脚本将默认使用多个GPU。

## 在TPU上运行脚本

张量处理单元（TPUs）是专门设计用于加速性能的。PyTorch使用[XLA](https://www.tensorflow.org/xla)深度学习编译器支持TPU（更多细节请参见[这里](https://github.com/pytorch/xla/blob/master/README.md)）。要使用TPU，请启动`xla_spawn.py`脚本并使用`num_cores`参数设置要使用的TPU核心数量。

```sql
python xla_spawn.py --num_cores 8 \
    summarization/run_summarization.py \
    --model_name_or_path google-t5/t5-small \
    --do_train \
    --do_eval \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --output_dir /tmp/tst-summarization \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --overwrite_output_dir \
    --predict_with_generate
```

张量处理单元（TPUs）是专门设计用于加速性能的。TensorFlow脚本使用[TPUStrategy](https://www.tensorflow.org/guide/distributed_training#tpustrategy)在TPU上进行训练。要使用TPU，请将TPU资源的名称传递给`tpu`参数。

```sql
python run_summarization.py  \
    --tpu name_of_tpu_resource \
    --model_name_or_path google-t5/t5-small \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --output_dir /tmp/tst-summarization  \
    --per_device_train_batch_size 8 \
    --per_device_eval_batch_size 16 \
    --num_train_epochs 3 \
    --do_train \
    --do_eval
```

## 基于🤗 Accelerate运行脚本

🤗 [Accelerate](https://huggingface.co/docs/accelerate) 是一个仅支持 PyTorch 的库，它提供了一种统一的方法来在不同类型的设置（仅 CPU、多个 GPU、多个TPU）上训练模型，同时保持对 PyTorch 训练循环的完全可见性。如果你还没有安装 🤗 Accelerate，请确保你已经安装了它：

> 注意：由于 Accelerate 正在快速发展，因此必须安装 git 版本的 accelerate 来运行脚本。

`pip install git+https://github.com/huggingface/accelerate`

你需要使用`run_summarization_no_trainer.py`脚本，而不是`run_summarization.py`脚本。🤗 Accelerate支持的脚本需要在文件夹中有一个`task_no_trainer.py`文件。首先运行以下命令以创建并保存配置文件：

`accelerate config`

检测您的设置以确保配置正确：

`accelerate test`

现在您可以开始训练模型了：

```python
accelerate launch run_summarization_no_trainer.py \
    --model_name_or_path google-t5/t5-small \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --output_dir ~/tmp/tst-summarization
```

## 使用自定义数据集

摘要脚本支持自定义数据集，只要它们是CSV或JSON Line文件。当你使用自己的数据集时，需要指定一些额外的参数：

* `train_file` 和 `validation_file` 分别指定您的训练和验证文件的路径。

* `text_column` 是输入要进行摘要的文本。

* `summary_column` 是目标输出的文本。

使用自定义数据集的摘要脚本看起来是这样的：

```sql
python examples/pytorch/summarization/run_summarization.py \
    --model_name_or_path google-t5/t5-small \
    --do_train \
    --do_eval \
    --train_file path_to_csv_or_jsonlines_file \
    --validation_file path_to_csv_or_jsonlines_file \
    --text_column text_column_name \
    --summary_column summary_column_name \
    --source_prefix "summarize: " \
    --output_dir /tmp/tst-summarization \
    --overwrite_output_dir \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --predict_with_generate
```

## 测试脚本

通常，在提交整个数据集之前，最好先在较少的数据集示例上运行脚本，以确保一切按预期工作,因为完整数据集的处理可能需要花费几个小时的时间。使用以下参数将数据集截断为最大样本数：

* `max_train_samples`

* `max_eval_samples`

* `max_predict_samples`

```sql
python examples/pytorch/summarization/run_summarization.py \
    --model_name_or_path google-t5/t5-small \
    --max_train_samples 50 \
    --max_eval_samples 50 \
    --max_predict_samples 50 \
    --do_train \
    --do_eval \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --output_dir /tmp/tst-summarization \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --overwrite_output_dir \
    --predict_with_generate
```

并非所有示例脚本都支持`max_predict_samples`参数。如果您不确定您的脚本是否支持此参数，请添加`-h`参数进行检查：

`examples/pytorch/summarization/run_summarization.py -h`

## 从checkpoint恢复训练

另一个有用的选项是从之前的checkpoint恢复训练。这将确保在训练中断时，您可以从之前停止的地方继续进行，而无需重新开始。有两种方法可以从checkpoint恢复训练。

第一种方法使用`output_dir previous_output_dir`参数从存储在`output_dir`中的最新的checkpoint恢复训练。在这种情况下，您应该删除`overwrite_output_dir`：

```sql
python examples/pytorch/summarization/run_summarization.py
    --model_name_or_path google-t5/t5-small \
    --do_train \
    --do_eval \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --output_dir /tmp/tst-summarization \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --output_dir previous_output_dir \
    --predict_with_generate
```

第二种方法使用`resume_from_checkpoint path_to_specific_checkpoint`参数从特定的checkpoint文件夹恢复训练。

```sql
python examples/pytorch/summarization/run_summarization.py
    --model_name_or_path google-t5/t5-small \
    --do_train \
    --do_eval \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --output_dir /tmp/tst-summarization \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --overwrite_output_dir \
    --resume_from_checkpoint path_to_specific_checkpoint \
    --predict_with_generate
```

## 分享模型

所有脚本都可以将您的最终模型上传到[Model Hub](https://huggingface.co/models)。在开始之前，请确保您已登录Hugging Face：

`huggingface-cli login`

然后，在脚本中添加`push_to_hub`参数。这个参数会创建一个带有您Hugging Face用户名和`output_dir`中指定的文件夹名称的仓库。

为了给您的仓库指定一个特定的名称，使用`push_to_hub_model_id`参数来添加它。该仓库将自动列出在您的命名空间下。

以下示例展示了如何上传具有特定仓库名称的模型：

```sql
python examples/pytorch/summarization/run_summarization.py
    --model_name_or_path google-t5/t5-small \
    --do_train \
    --do_eval \
    --dataset_name cnn_dailymail \
    --dataset_config "3.0.0" \
    --source_prefix "summarize: " \
    --push_to_hub \
    --push_to_hub_model_id finetuned-t5-cnn_dailymail \
    --output_dir /tmp/tst-summarization \
    --per_device_train_batch_size=4 \
    --per_device_eval_batch_size=4 \
    --overwrite_output_dir \
    --predict_with_generate
```


