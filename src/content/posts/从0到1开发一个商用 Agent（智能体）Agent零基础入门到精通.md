---
title: "从0到1开发一个商用 Agent（智能体）Agent零基础入门到精通"
published: 2026-07-29
description: "& x20;我的哪些场景可以让 AI 帮我干？ 某个工作场景让 AI 帮我干，如何梳理这个需求流程？ 如何自己手搓一个 AI Agent（智能体）？ 这篇文章，我将带着大家一步一步地手搓一个 AI Agent（智能体）。 全文8000字，可以先收藏，慢慢观看。 不知道这七个步骤的朋友，可以去看一下那篇文章，有助于更好的理解这期实操教程。 这期实操教程重点是给大家演示如何从 0 到 1 手搓一个 A"
image: ""
tags: ["AI Agent"]
category: "AI Agent"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
&#x20;我的哪些场景可以让 AI 帮我干？

某个工作场景让 AI 帮我干，如何梳理这个需求流程？

如何自己手搓一个 AI Agent（智能体）？

这篇文章，我将带着大家一步一步地手搓一个 AI Agent（智能体）。

全文8000字，可以先收藏，慢慢观看。

不知道这七个步骤的朋友，可以去看一下那篇文章，有助于更好的理解这期实操教程。

这期实操教程重点是给大家演示如何从 0 到 1 手搓一个 AI Agent 的搭建过程，而非详细的讲解具体某个工具的操作使用，因此不会用复杂的场景做演示例子。

至于软件选型，我选择的是 Coze，方便大家直接在线操作使用。

在具体动手实操的过程中，我重点为大家展示从需求分析到如何搭建。

需求分析中包含如何识别 AI 提效场景和、梳理提效场景流程。

如何搭建中包含工作流创建、智能体创建、智能体发布。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-image-1.png)

## 需求分析

第一步，我们需要做的工作就是需求分析。

这一步很重要，这部分也属于高价值的知识，这一步学会了，后面不管是用 Coze，还是 Dify，或者其他低代码平台，也都很容易。

在这一步，很多朋友就问过我，我不知道我个人或者我们企业有什么场景可以让 AI 帮我提效？

也有朋友问我，我大概知道什么场景可以提效，但我梳理不出具体的流程来？

其实，这很简单，我们可以借助 AI 啊，下面我们用一位同样不知道自己如何借助 AI 提效的企业营销部的自媒体编辑小莉来举例子，看她如何梳理自己需求的。

### 如何识别哪些场景可以让 AI 帮我提效？

首先，我们需要让小莉找到可以让 AI 帮她提效的场景。

我们让小莉把她每天的工作形成一个流水账，越详细越好，这个流水帐包含了她在公司里所有的工作内容。

如果你是公司的老板，可以让同一个岗位的多位员工把他们每天的工作流水账记录一下，然后在合并在一起，提炼出这个岗位需要干的所有工作内容。

小莉的工作流水账梳理好以后，我们就可以借助 DeepSeek R1 ，让他帮我们分析一下小莉的哪些工作可以做成 AI Agent，从而辅助小莉来提升工作效率。

下面是 DeepSeek R1 的提示词，以及小莉的工作流水账。

> **想创意（提示词模版）**
>
> 介绍：让 AI 为企业的营销、宣传等提供创新的、脑洞大开的内容。
>
> 模版：主题（搞什么）+ 风格/约束（有什么要求）+ 创新方向（怎么与众不同）。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-Vcj9b13PEotBu5xQKNUcfbwqn9Z.png)

然后我们在看看小莉的工作流水账。

可以看到早晨上班打卡签到都写了，在这个工作流水账梳理过程中，不要怕写的啰嗦，一定要写出详细的工作内容，这个流水账不是总结工作内容，而是把上班后涉及到所有的工作内容都写一下，细化到每一步操作都写清楚。

就像小莉整理的一样，上班后会看近期发布的内容浏览情况，具体看哪些内容，例如阅读量、点赞数等要全部写出来；浏览网站找素材，到底浏览的哪些网站？看什么内容？都可以一一列出来。

和团队每天会开会讨论问题，讨论什么问题？也一并梳理出来，可以写出都是哪些类别的问题，然后举出每一个类别的例子。

尽量不要出现“等工作、等操作”字样，这个细化程度的颗粒度，也需要把控好。

然后我们把提示词和工作流水账一并发给 DeepSeek R1，让他来帮我们规划出哪些场景是可以借助 AI 提效的。

我们可以看一下图片中执行的效果，可以看到 DeepSeek R1 帮我们规划了这些场景，每一个场景都可以做成一个 AI Agent，多个 AI Agent 就可以组成一个岗位，一个数字员工了。

对于上面 AI 规划的 AI Agent 场景，大家不能直接使用，我们需要记住一点，在近阶段，我们需要的是让 AI 辅助我们工作，而不是替代我们工作。

因此 AI 帮我规划出来的这些场景，它提供给了我们建议，最终还是需要我们对其研究后，筛选出可以落地的场景。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-CmajbI0snodwqZxUPuLcXiKVn7g.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-O0kVb1QmHoCHT3xDo1Uctyr8nDf.png)

### AI 可以提效的场景，如何梳理流程

接下来，我们选择一个场景，来细化需求，梳理出流程来。

在软件行业，需求调研阶段，干的主要工作就是调研需求，设计业务流程。

如果你是一位产品经理、项目经理，应该轻车熟路了。

如果你从来没有做过也没关系，我们同样可以借助 AI 。

由于文章篇幅的问题，因此，我们选择一个最简单的场景“素材收集”抛砖引玉。

> 场景描述：日常在行业网站 a，网站 b 等上浏览文章，看到浏览量多的或者优质的文章，我会点击进去看一下，如果有不错的文章，就收藏起来，以备后期写作时使用。

#### 粗放的场景梳理

我们需要详细的描述这个素材收集的场景都会做哪些操作，同样列出操作流水账来，如果在工作内容流水账的地方已经描述的很清楚了，那可以直接复制过来。

然后我们把提示词和场景工作流水账一并发给 DeepSeek R1，让它来帮我们梳理详细的流程。

> **如何执行**
>
> 介绍：给出目标，让 AI 协助输出执行过程，例如写代码、画流程图。
>
> 模版：任务（做什么）+ 步骤约束（怎么操作）+ 输出格式（结果长啥样）。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-image.png)

看一下上面图片的 DeepSeek 的输出，可以看到感觉输出的内容非常棒，但是具体落地还是有些困难，例如第一部分“发现目标文章”，这个展开来做的话本身也是一个智能体，例如到不同的站点读取内容、分等级评估是否优质内容、存到指定地方，人工阅读，调整 AI 评估内容优质等级的参数。

我们需要抓住一个重点就是：内容是否优质其实还是需要我们来人为判别的。

看看，完全依靠 AI 直接输出的结果，有时候是无法直接使用，还是需要我们来主导 AI 的思考方向。

#### 精准的场景梳理

接下来，我们聚焦在素材采集中如何把看到的素材快速的保存到飞书表格中，这个过程可以叫它 AI Agent ，也可以叫它 AI 工作流，我们再来看看效果。

大家可以看到，我把素材采集聚焦在如何把文章快速保存到飞书表格中，我描述了素材保存的详细的步骤，我们在看一下效果，这次的效果就非常棒，AI 帮我更加详细的拆解了步骤。

我们看一下它拆解的步骤，这里的每一个步骤，都是 Coze 上流程的一个节点，这个步骤规划的越精准，后期不管用 Coze ，还是 Dify，或者其他的，实操起来也会越简单。

这些知识就是高价值的内容，我们需要学会了这种场景拆解流程的思维能力。

> 梳理如下工作场景的工作流程做成一个 ai 智能体。
>
> 我看到一篇好的文章后，会把 url 发给智能体，智能体可以帮我自动进行总结和打标签，把标题、内容、总结、标签保存到飞书多维表格中，以表格形式输出（工作内容/AI 协助/人工来做），说人话。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-Ux9oboSX7oxkGYx55oEcyAQnnVg.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-DUSVbSUnMohGssxhj0RclWscnRP.png)

#### 绘制场景流程图

在上面 AI 输出的拆解步骤后，我们需要将它绘制成业务流程图，初期建议大家多做做这个流程图的绘制，它可以训练你的流程拆解思维能力，在 Coze 上具体搭建的时候，这种能力相当重要。

在这里我们普及一下什么是“业务流程图”？

业务流程图是一种描述管理系统内各单位、人员之间的业务关系，作业顺序和管理信息流向的图表。

业务流程图的绘制是按照业务的实际处理步骤和过程进行的。

通俗的讲流程图就是用图形和箭头把一件事的步骤和顺序画出来，让人一眼就能看懂。

我们用“购买电影票”这个例子来示范一下。

这是步骤：

**步骤 1**：决定购买哪部电影。

**步骤 2**：选择电影和场次。

**步骤 3**：选择座位。

**步骤 4**：支付票款。

**步骤 5**：支付成功或者失败。

这是流程图：

暂时无法在飞书文档外展示此内容

接下来我们看一下如何将 AI 输出的拆解步骤，绘制成流程图。

AI 输出的步骤：提交 URL 到智能体 -> 抓取文章内容 -> 提取标题和正文 -> 生成 200 字总结 -> 打 3-5 个标签 -> 准备飞书表格数据 -> 写入飞书多维表格。

这是绘制的流程图：

暂时无法在飞书文档外展示此内容

提到过需求梳理结束后的如何选型，结合这个例子，我们一起做一下选型。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-YPobbbzgboYqQRxbprPcxYoBnS0.png)

**开发平台：**

为了演示方便，同时大家实操方便，在这里开发平台我们选择 Coze。

**LLM 大模型：**

从流程图上我们可以分析一下用到 LLM 大模型的地方，是“生成 200 字总结”、“打 3-5 个标签”这两个节点，我们深入再分析一下，这两个节点可以合并为一个节点，即把文章内容发送给大模型，让他输出总结和标签。

这里仅仅是总结内容，因此我们 LLM 大模型选择 DeepSeek V3 就可以，不同的场景，我们可以综合分析，调用不同的大模型。

**工具选择：**

从流程图中，我们在分析一下哪些地方可以用到工具，工具的作用一方面是处理节点上的业务，例如把一篇长文章拆分成多个短文文章（部分大模型还不能处理长文章），另外一方面是与外部系统进行对接。

在流程图中，我们可以看到“抓取文章内容”、“提取标题和正文”是需要用到工具，现在大多数的网页抓取工具都具备了抓取文章内容，直接返回文章内容、标题等信息，那么这两个节点可以合并在一起。

每个工具都有输入和输出，在这里输入是文章 URL，输出是文章的标题和内容。

在流程中的最后一个节点“写入飞书多维表格”，这也是需要与外部系统互通，因此这里也需要用到一个保存内容到飞书的工具，输入是标题、内容、标签、URL，输出的是否保存成功。

每个工具的输入和输出都是有格式的，或者字符串，或者 JSON，或者其他，因此在“写入飞书多维表格”这个节点的前面“准备飞书表格数据”节点输出的数据，就是“写入飞书多维表格”这个工具的输入。

根据刚才的分析，我们将流程图重新调整再看一下，这个流程图就比较清晰了，有流程、有节点、每个节点调用的工具是什么都比较清晰。

用这样的流程图，不管在 Coze 上做还是在 Dify 上，你熟悉一下这些工具的操作，很快就可以在不同智能体平台上开发出来。

暂时无法在飞书文档外展示此内容

#### 借助 AI 智能体做智能体

我们也可以借助 Coze 上的智能体，把场景需求写明白，让 AI 智能体帮我们来规划出在 Coze 上的操作步骤，怎么样，看他输出的各个流程节点还不错，我们可以借鉴一下，然后在平台上搭建。

目前说的是借鉴一下，而不是直接使用，我们还是需要具备流程拆解思维能力，这个输出是提供给我们参考思路。

目前 Coze 在创建工作流的时候，其实也提供了类似的功能。

登录 [www.coze.cn](http://www.coze.cn)，按照下图提示找到“秋水 AI 扣子流程节点生成器”，你可以试一下。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-EPcdbNZmvoIHAjxZqkXcAesKnlf.png)

进入后输入我们前面梳理的需求。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-QaJbb89VOorkf9xIhN1ct2mBnag.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-RYrUbQF2NoO75RxQtNXcve1rn0d.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-FdSBbRh7ZomQpOxp198cpUmOnDc.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-FaSwbbpRHo4Ws9xbaNacOVmun8d.png)

到这里，如何梳理出一个清晰的场景需求和业务流程就介绍完了。

一个企业如果有实际运行的SOP工作手册，那么做这个需求分析其实也是很简单的，这个本身就是一个SOP工作手册。

SOP（Standard Operating Procedure），就是标准作业流程，它告诉员工“在什么情况下，该怎么做，以及做到什么程度”。

留个作业，大家可以把自己的工作 SOP 流程图梳理出来，发在评论区。

## 如何搭建

接下来我们就进入了实操环节，在 Coze 上如何一步步的搭建这个 AI Agent（智能体）。

这篇文章的实操，我会根据素材采集的特点，快速带大家创建一下，不会延展开来讲，目前市面上讲 Coze 的实操文章和视频也很多。

大家也可以看看 Coze 官方的帮助。

整个搭建过程分为工作流搭建、智能体搭建。

先做一个工作流，把我们上一步的流程在工作流中创建。

然后在创建一个智能体，将工作流嵌入进去。

### 创建工作流

首先，我们开始搭建工作流。

我们先打开 <https://www.coze.cn>，注册登录。

先点击“资源库”，鼠标停在右侧的“资源”上，点击“工作流”。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-Lyi5bbPMJo0zoExKO9UcqRJsnjc.png)

在弹出的如下界面中，填写“工作流名称”和“工作流描述”

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-SEi3buJoUoXGi0xMX5Oc9SsnnLb.png)

点击“确认”后，进入一个空白页面，根据我们前面梳理的流程图，开始用 Coze 的组件编辑流程，我编辑好的流程如下：

“开始”和“结束”的节点是必须的，创建的时候默认就有，也不能删除，从“开始”到“结束”之间必须要有连线，没有连线，就相当于现实中两个地方之间没有路，没有路就没法走。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-NdqnbLDUQozcu6xsNAec2HRun5e.png)

在一开始的时候，点击每个流程节点的右侧的圆圈，可以出现下图的窗口，在这个素材采集的流程中，我们会用到大模型、插件（就是前面我们说的工具，用于与其他系统做交互的）、代码（可以在个节点编写代码）。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-HQ6Fbr2zgo5Mk3xudy0cDPQRncg.png)

接下来，我们看一下每个流程节点是怎么做的。

#### 开始

下图中的“开始”节点，在右侧的配置那里是没有输出，它主要是为这个工作启动准备数据，这个例子我们设定了一个变量名 url，智能体在调用这个工作流的时候，会自动从聊天内容中获取到 url ，传给它。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-Syr6bt2h6oQdcgxH0drcI6Pln6e.png)

#### 工具：抓取内容

红框 1：是插件，“工具：抓取内容”是在这个节点我自己定义的名称，它的作用是给它一个 url ，它会把这个 url 页面的内容帮你抓取出来。

红框 2：点击“插件详情”，可以查看这个插件的详细介绍，以及输入和输出的介绍。除了开始结束，每个节点都有输入和输出，输入和输出的参数都不一样。

红框 3：是插件的输入，“\*”是必须要填写的，url 就是我们需要“开始”节点中定义的 url。

红框 4：是插件的输出，每一项都是一个数据变量，在后面的节点中会引用，具体每个变量什么意思，一个是看插件中的说明，此外可以从英文也可以看出大体意思。这个例子可以看到 title 就是 url 中文章中的标题，content 就是 url 中的文章内容。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-WVIQbG7rlopdgzxFPRLcyN1ynrd.png)

#### 大模型：总结文章

这个节点就是大模型的配置，在这里我们需要大模型帮我总结文章内容，提炼文章关键词。

红框 1：此处可以选择不同的模型来处理，不同的提示词在不同的模型下表现有时候是不一致的，所以这里需要注意的是在当前这个场景下根据大模型的特点，选定模型后，再去写系统提示词和用户提示词。

红框 2：输入，可以将上个节点输出的参数标题和内容传到这里。

红框 4：输出，是大模型的返回输出，大模型返回的都是字符串，在这里，输出可以定义格式，这里我选择的是 JSON，因为方便后面来引用，但是输出如果是 JSON，需要我们在红框 3 的提示词中定义输出结构。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-FHT6b2Mc3odagAxL8ZJcnSHWnuh.png)

系统提示词和用户提示词看下面这张图，系统提示词的右上角最右侧的按钮是一个提示词魔法师，输入你要写的提示词内容，系统会自动生成大模型容易理解的提示词。

系统提示词：主要描述的是如果你把大模型看成一个你目前需要它帮助的人，它是什么角色，应该具备什么技能，你需要它按照什么格式回复给你。所以你会看到在提示词中的技能 2，我约定了大模型输出格式是 JSON，并给出了示例，并且 JSON 中的定义的 summary 和 tags 与上面输出格式中定义的名称一样。

用户提示词：就是你需要大模型回答的具体问题了，因为这里我在系统提示词中已经定义了需要大模型帮我们干什么，所以这里我就只把标题和内容放在这里，{{}}中的放的是上面输入中定义的参数。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-J9uIbyYa8oJXUsxQQ9hcYp8Anzh.png)

#### 工具：转为 JSON

在这里的工具我们用的是代码，因为我们需要将前面的标题、内容、标签等转换成一个 JSON 格式，所以只能用代码进行转换。

那么这个 JSON 格式具体内容取决于下一个节点“工具：保存到飞书”用到的插件中的说明。

我们可以看一下这个插件详细说明中的参数 records 类型是一个数组，数组中的 fields 对应的就是飞书表格中每一列的列名。

下图为 add\_records 介绍：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-D0BAb0A0Povxa1xyZWqcTIE2nlV.png)

飞书多维表格：

我们继续看看“工具：转为 JSON”的配置，这是一个“代码”节点。

红框 2：输入区域，可以增加多个参数，每个参数都可以调用前面节点的参数，它也是红框 4 中代码中传入的参数。

红框 3：输出区域，参数设定需要和红框 4 代码中返回的参数保持一致。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-JvJebbF7soFqLqxdyGWc2Mxcned.png)

上图红框 4 中的代码，可以看到具体的传入参数和输出参数在代码中的体现。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-RgLvb55PMoVhjJxVsDjc0tdOn0c.png)

Python 代码片段，类似的需要做数据转换的，都可以采用这个代码片段，只需要替换传入的参数和输出的参数就可以。

#### 工具：保存到飞书

这个节点就是前面已经提到的“飞书多维表格”的保存数据的插件。

红框 2：参数名中 app\_token（打开创建好的飞书多维表格，复制 url 到此处）和 records（选择前面转为 JSON 节点输出的 record\_info）是必须要填写的。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-H5rUb1GtNoRQSSxAhAkcJUImnUi.png)

#### 结束

最后一个节点，主要是返回内容，它分两种方式，一种方式为返回变量，另外一种方式为返回文本。

返回变量模式下，工作流运行结束后会以 JSON 格式输出所有返回参数，适用于工作流绑定卡片或作为子工作流的场景。

返回文本模式下，工作流运行结束后，智能体中的模型将直接使用指定的内容回复对话。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-ONl0b8a7noP2fJxuf5McHkrLnlb.png)

到此，工作流就创建完了。

### 创建智能体

下一步我们来创建智能体，将工作流引入到智能体中。

什么是 AI 智能体，就是给智能体一个目标，它自己会根据当前的认知能力，自主规划，自主调用工具，最终达到目标。

用我们做的这个“素材收集”的智能体例子来说，假如我们还引入了短视频平台的视频收集工作流，那么这个智能体会根据我们发送的内容，自动识别，是调用文章收集的工作流，还是视频收集的工作流。

更复杂的智能体，后面我们在陆续讲解。

回到这个智能体的创建上来，根据下图提示，我们创建智能体。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-S9MHb5Tvgo3H48xucE5cmViznwh.png)

创建后会进到如下页面，我们分别说一下，详细的大家可以看看帮助文档。

**红框 1**：和标题写的一样，人设和回复逻辑，就是定义这个智能体的角色、技能、如何回复等信息，来指导大模型可以干哪些事情，怎么干，不能干哪些等。

**红框 2**：我们只介绍一下这个智能体用到的，就是工作流，我们可以将上面我们创建的工作增加上去，这样我们和智能体聊天的时候，发给它一个链接，他会调用我们上面做的工作流，将内容进行总结，保存到飞书中。

**红框 3**：可以直接与我们做的智能体进行聊天测试了。

到这里，我们智能体也做好，测试没有问题后，可以点击右上角发布了。

发布的时候，AI 会帮我们自动填写这些信息，我们可以根据实际情况进行修改，点击确定，可以选择发布到的平台。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89Agent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A_assets/%E4%BB%8E0%E5%88%B01%E5%BC%80%E5%8F%91%E4%B8%80%E4%B8%AA%E5%95%86%E7%94%A8%20Agent%EF%BC%88%E6%99%BA%E8%83%BD%E4%BD%93%EF%BC%89%EF%BC%8CAgent%E9%9B%B6%E5%9F%BA%E7%A1%80%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A!-InDSbrKmzoOQDexXxJOcAz58nGf.png)

目前发布的平台有很多，这里我们就不一一说了，后续我们在陆续介绍。

###

&#x20;&#x20;


