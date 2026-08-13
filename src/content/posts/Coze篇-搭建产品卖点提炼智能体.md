---
title: "Coze篇-搭建产品卖点提炼智能体"
published: 2026-07-29
description: ""
image: ""
tags: ["Coze", "AI Agent"]
category: "Coze"
draft: false
featured: false
lang: ""
series: ""
status: verified
testedOn: ""
lastVerified: 2026-07-31
---
**卖点提炼**是扣子官方提供的电商生服类工作流模板。只需上传产品介绍文档，指定任务类型（例如卖点提炼、抽取产品卖点等），即可基于产品介绍自动提炼出产品的核心卖点。

## 一、模板介绍

在电商、快消、3C 等行业的市场、运营、销售场景下，往往需要基于产品的核心卖点定制专属的营销策略及运营推广方向，**卖点提炼**模板可以自动归纳总结产品介绍、生成 PR 稿大纲，还可以输出不同产品的卖点对比，节省了人工分析的时间和成本，有助于制定更加精准有效的营销策略。尤其是在电商销售、直播带货场景下，可以帮助 MCN 机构、带货达人、电商主播快速提炼产品卖点，准备营销话术，提高直播准备工作的效率。

此模板为工作流模板，复制此模板之后，你也可以将其改造为适合自己业务场景的信息提炼工作流，绑定到自己的智能体中使用。

* **卖点提炼**模板是扣子专业版的专属模板，仅专业版扣子用户可复制并使用此模板。

* 体验模板时，请上传 PDF 格式的产品介绍，否则工作流可能运行失败。

单击[此处](https://www.coze.cn/template/workflow/7423727933803511844)，体验卖点提炼模板\*\*。\*\*

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93-RY96bUZ2Po9Yauxw0Y3cdu9Unyg.png)



## 二、实现流程

**卖点提炼**模板为工作流模板，其中使用了大模型、图像流等节点分别生成自媒体文案、文生图 Prompt 和内容配图。整体设计思路如下：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93-XkGmbK2vjoTCrVxRVsFcjenQnvg.png)

各个功能模块的实现方式如下：



## 三、使用模板

你可以直接复制模板，并调整工作流中的大模型节点配置，将其改造为适合其他社交媒体风格的创作助手。

### 步骤一：复制模板

1. 登录扣子专业版账号，并访问[卖点提炼模板页面](https://www.coze.cn/template/workflow/7423727933803511844?)。

2. 选择工作流所属空间，然后单击**复制并继续编辑**。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93-d11155994fd274f56d27c882f28e1fb7.png)

### 步骤二：（可选）修改工作流

如果当前的卖点提炼模板已满足你的业务场景需求，你可以直接将其绑定到智能体中使用。其中，文件解析、卖点提炼、和卖点对比的功能模块建议维持模板中的编排模式。对于大纲生成的功能模块，你可以按需添加 PR 稿件的生成逻辑、也可以简化生成大纲的流程，让工作流的编排更轻量，提高大量文档分析的场景下的运行效率和成本。

#### 降低运行成本

当前工作流的生成大纲节点提示词中输入了原始的产品介绍文档内容、卖点汇总的内容，在产品介绍文档内容量非常大时，可能会消耗大量的模型 Token。如果在你的业务场景中经常需要一次性分析多个产品介绍文档，为了降低成本，你也可以在提示词中删除产品介绍，也就是删除下图中的红框部分，让模型直接参考产品名称及提炼好的卖点来生成 PR 稿件大纲。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93-FR9WbDqC0ovWR6xHa9zcmH7FnIc.png)

#### 生成 PR 稿件

为工作流添加 PR 稿件生成的能力。此功能模块可以作为**大纲生成**的扩展功能，即根据生成的 PR 稿件大纲，扩写一篇 PR 文章，此功能主要依赖大模型节点的能力，由模型基于大纲撰写一篇符合场景要求的 PR 稿件。

* 本文档以模型节点为例，但是为了达到更好的生成效果，推荐你另外搭建一个生成长文的工作流，通过多个节点分别扩写不同的 PR 段落。

* 你也可以按需优化大纲生成节点的模型提示词，例如将示例替换为当前业务场景下的典型 PR 稿件大纲示例，使生成的大纲更符合业务场景的需求。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%BA%A7%E5%93%81%E5%8D%96%E7%82%B9%E6%8F%90%E7%82%BC%E6%99%BA%E8%83%BD%E4%BD%93-KLBSbJvbQo8IJAxfFmlc1ZlCnvg.png)

相关节点说明如下：

### 步骤三：测试并发布工作流

完成工作流修改后，你就可以测试`工作流`效果并发布。

1. 在工作流编排页面右上角单击**试运行**。

2. 右侧调试区域，输入问题进行测试。你也可以单击创建测试集，方便测试调优效果。

3. 完成测试后可单击**发布**，并将工作流绑定到智能体中使用。

