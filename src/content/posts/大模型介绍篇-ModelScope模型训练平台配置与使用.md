---
title: 大模型介绍篇-ModelScope模型训练平台配置与使用
published: 2026-07-29
description: ''
image: ''
tags: ['LLM Introduction', 'LLM']
category: 'LLM Introduction'
draft: false
lang: zh-CN
---
## 一、快速开始

先熟悉魔搭社区的模型下载和模型推理。设置开发环境，并顺利从魔搭社区开始模型学习，使用和开发。



## 二、环境安装

可以使用魔搭社区已经预安装好的 [Notebook](https://modelscope.cn/my/mynotebook/preset) 环境来使用魔搭社区模型。魔搭社区 Notebook 为新用户提供了 100小时的免费 GPU 算力和不限时长的免费 CPU 算力，并预安装了大部分模型可运行的环境依赖。

如果您希望在本地开发环境使用魔搭社区的模型， 我们推荐使用 ModelScope SDK 下载模型。您可以使用如下命令安装 ModelScope SDK：

```txt
pip install modelscope
```

同时我们推荐您安装 [Git](https://git-scm.com/downloads) 和 [Git LFS](https://git-lfs.com/) ，这是模型管理包括上传所必须的工具。



## 三、模型下载

如果您在高带宽的机器上运行，推荐使用 ModelScope 命令行工具下载模型。该方法支持断点续传和模型高速下载，例如可以通过如下命令，将 Qwen2.5-0.5B-Instruct 模型，下载到当前路径下的"model-dir"目录。

```txt
modelscope download --model="Qwen/Qwen2.5-0.5B-Instruct" --local_dir ./model-dir
```

您也可以使用 ModelScope Python SDK 下载模型，该方法支持断点续传和模型高速下载：

```txt
from modelscope import snapshot_download
model_dir = snapshot_download("Qwen/Qwen2.5-0.5B-Instruct")
```

由于模型都是通过 Git 存储，所以也可以在安装 Git LFS 后，通过 git clone 的方式在本地下载模型，例如：

```txt
git lfs install
git clone https://www.modelscope.cn/Qwen/Qwen2.5-0.5B-Instruct.git
```

关于模型下载的详细说明，可参考[模型下载文档](https://modelscope.cn/docs/models/download)。

同时，如果模型和 ModelScope SDK 绑定，则只需要几行代码即可加载模型，同时 ModelScope 还支持通过 AutoModel 等接口来加载模型。如下是使用 AutoModel 和 pipeline 方式加载模型的示例：

### 1. 使用AutoModel加载模型

```txt
from modelscope import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen2.5-0.5B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)
```

### 2. 使用ModelScope pipeline加载模型

```txt
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation',model='damo/nlp_structbert_word-segmentation_chinese-base')
```



## 四、模型推理

推理不同模态多种任务，pipeline 是最简单、最快捷的方法。您可以使用开箱即用的 pipeline 执行跨不同模式的多种任务，下面是一个 pipeline 完整的运行示例：

```txt
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

inference_pipeline = pipeline(
    task=Tasks.auto_speech_recognition,
    model='iic/speech_paraformer-large-vad-punc_asr_nat-zh-cn-16k-common-vocab8404-pytorch',
    model_revision="v2.0.4")

rec_result = inference_pipeline('https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/asr_vad_punc_example.wav')
print(rec_result)
```

ModelScope 兼容了 Transformers 提供的简单而统一的方法来加载预训练实例和 tokenizer。这意味着您可以使用 ModelScope 加载 AutoModel 和 AutoTokenizer 等类。下面是一个大语言模型的完整的运行示例：

```txt
from modelscope import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen2.5-0.5B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "请简要介绍一下大型语言模型."
messages = [
    {"role": "system", "content": "You are Qwen, created by Alibaba Cloud. You are a helpful assistant."},
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=512
)
generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
```

对于暂时未与 ModelScope SDK 做原生集成的模型，可以先从 ModelScope 上下载模型，然后通过其他的主流库实现模型推理，以 SDXL-Turbo 模型为例，完整的模型推理运行示例如下：

```txt
from diffusers import AutoPipelineForText2Image
import torch
from modelscope import snapshot_download

model_dir = snapshot_download("AI-ModelScope/sdxl-turbo")

pipe = AutoPipelineForText2Image.from_pretrained(model_dir, torch_dtype=torch.float16, variant="fp16")
pipe.to("cuda")
prompt = "cat"

image = pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0]
image.save("image.png")
```



## 五、模型微调

本文以 LLM 为例，使用 MS-Swift 进行模型微调。[MS-Swift](https://github.com/modelscope/ms-swift) 是魔搭社区官方提供的大模型工具箱，支持 300+大语言模型和 80+多模态大模型从微调训练到部署推理的链路。下面是一个 LLM 自我认知微调的示例：

安装依赖：

```txt
pip install ms-swift
```

微调脚本：

```txt
!CUDA_VISIBLE_DEVICES=0  swift sft \
    --model Qwen/Qwen2.5-0.5B-Instruct \
    --train_type lora \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#500' \
    --torch_dtype bfloat16 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 1 \
    --per_device_eval_batch_size 1 \
    --learning_rate 1e-4 \
    --lora_rank 8 \
    --lora_alpha 32 \
    --target_modules all-linear \
    --gradient_accumulation_steps 1 \
    --eval_steps 1 \
    --save_steps 1 \
    --save_total_limit 5 \
    --logging_steps 1 \
    --max_length 2048 \
    --output_dir output \
    --system 'You are a helpful assistant.' \
    --warmup_ratio 0.05 \
    --dataloader_num_workers 4 \
    --model_author swift \
    --model_name swift-robot
```

微调后推理，注意：ckpt\_dir 需要修改为训练生成的 last checkpoint 文件夹。

```txt
!CUDA_VISIBLE_DEVICES=0 swift export \
    --ckpt_dir output/v0-20250130-165127/checkpoint-12 \
    --merge_lora true
```

更多基于 MS-Swift 进行大模型和多模态模型训练与推理的文档，可以参见文档中心的[大模型训练与推理](https://modelscope.cn/docs/large-model-toolchain/swift-intro/quickstart)部分。



## 六、模型部署

您可以使用魔搭社区 [SwingDeploy](https://modelscope.cn/my/modelService/deploy) 来一键部署指定的模型到云资源上。SwingDeploy 除了支持各种任务小模型的部署外，对于部分大语言模型，SwingDeploy 支持部署后直接提供 OpenAI API 兼容的调用接口。

如果您希望在自有的 GPU 环境进行模型部署，我们推荐使用 vLLM 部署大语言模型，首先您需要设置环境变量来指定使用 ModelScope 上的模型：

```txt
export VLLM_USE_MODELSCOPE=True
```

`vllm>=0.6` 支持 vLLM 内置的工具调用功能，部署命令：

```txt
!vllm serve Qwen/Qwen2.5-0.5B-Instruct
```

