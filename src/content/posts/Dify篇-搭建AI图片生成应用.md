---
title: "Dify篇-搭建AI图片生成应用"
published: 2026-07-29
description: "随着图像生成技术的兴起，涌现了许多优秀的图像生成产品，比如 Dall e、Flux、StableDiffusion 等。 本文将使用图像生成模型，指导你使用 Dify 快速开发一个 AI 图片生成应用。 一、Agent 的基本概念 1. 什么是 Agent Agent 是一种模拟人类行为和能力的AI系统，它通过自然语言处理与环境交互，能够理解输入信息并生成相应的输出。Agent 还具有“感知”能力"
image: ""
tags: ["Dify"]
category: "Dify"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
随着图像生成技术的兴起，涌现了许多优秀的图像生成产品，比如 Dall-e、Flux、StableDiffusion 等。

本文将使用图像生成模型，指导你使用 Dify 快速开发一个 AI 图片生成应用。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-11.png)



## 一、Agent 的基本概念

### 1. 什么是 Agent

Agent 是一种模拟人类行为和能力的AI系统，它通过自然语言处理与环境交互，能够理解输入信息并生成相应的输出。Agent 还具有“感知”能力，可以处理和分析各种形式的数据。此外，Agent 能够调用和使用各种外部工具和 API 来完成任务，扩展其功能范围。这种设计使 Agent 能够更灵活地应对复杂情况，在一定程度上模拟人类的思考和行为模式。因此，很多人都会将 Agent 称为“智能体”。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-10.png)

AI Agent（人工智能代理）是一种能够感知环境、进行决策和执行动作的智能实体。不同于传统的人工智能，AI Agent 具备通过独立思考、调用工具去逐步完成给定目标的能力。比如，告诉 AI Agent 帮忙下单一份外卖，它就可以直接调用 APP 选择外卖，再调用支付程序下单支付，无需人类去指定每一步的操作。Agent 的概念由 Minsky 在其 1986 年出版的《思维的社会》一书中提出，Minsky 认为社会中的某些个体经过协商之后可求得问题的解，这些个体就是 Agent。他还认为 Agent 应具有社会交互性和智能性。Agent 的概念由此被引入人工智能和计算机领域，并迅速成为研究热点。但苦于数据和算力限制，想要实现真正智能的 AI Agents 缺乏必要的现实条件。

大语言模型和 AI Agent 的区别在于 AI Agent 可以独立思考并做出行动，和 RPA 的区别在于它能够处理未知环境信息。ChatGPT 诞生后，AI 从真正意义上具备了和人类进行多轮对话的能力，并且能针对相应问题给出具体回答与建议。随后各个领域的“Copilot”推出，如 Microsoft365Copilot、MicrosoftSecurityCopilot、GitHubCopilot和AdobeFirefly 等，让 Al 成为了办公、代码、设计等场景的“智能副驾驶”。Al Agent 和大模型的区别在于：

* 大模型与人类之间的交互是基于 prompt 实现的，用户 prompt 是否清晰明确会影响大模型回答的效果，例如 ChatGPT 和这些 Copilot 都需要明确任务才能得到有用的回答。

* Al Agent的工作仅需给定一个目标，它就能够针对目标独立思考并做出行动，它会根据给定任务详细拆解出每一步的计划步骤，依靠来自外界的反馈和自主思考，自己给自己创建 prompt，来实现目标。如果说 Copilot 是“副驾驶”，那么 Agent 则可以算得上一个初级的“主驾驶”。

和传统的 RPA 相比，RPA 只能在给定的情况条件下，根据程序内预设好的流程来进行工作的处理，在出现大量未知信息、难以预测的环境中时，RPA 是无法进行工作的，AI Agent 则可以通过和环境进行交互，感知信息并做出对应的思考和行动。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-13.png)

我们看见的 AI Agent 往往以问答机器人作为交互入口，通过自然语言触发全自动的工作流，中间没有人工介入。由于人只负责发送指令，并不参与对 AI 结果的反馈。



### 2. 为什么需要 AI Agent

LLM 的一些缺点：

* 会产生幻觉

* 结果并不总是真实的

* 对时事的了解有限或一无所知

* 很难应对复杂的计算

* 没有行动能力

* 没有长期记忆能力

比如让 ChatGPT 买一杯咖啡，ChatGPT 给出的反馈一般类似“无法购买咖啡，它只是一个文字 AI 助手”之类的回答。但你要告知基于 ChatGPT 的 AI Agent 工具让它买一杯咖啡，它会首先拆解如何才能为你购买一杯咖啡并拟定代用某 APP 下单以及支付等若干步骤，然后按照这些步骤调用 APP 选择外卖，再调用支付程序下单支付，过程无需人类去指定每一步操作。这就是 AI Agent 的用武之地，它可以利用外部工具来克服这些限制。这里的工具是什么呢？工具就是代理用它来完成特定任务的一个插件、一个集成 API、一个代码库等等，例如：

* Google 搜索：获取最新信息

* Python REPL：执行代码

* Wolfram：进行复杂的计算

* 外部 API：获取特定信息

而 LangChain 则是提供一种通用的框架通过大语言模型的指令来轻松地实现这些工具的调用。我们都知道在执行一个复杂的任务时，我们需要考虑多方面的影响因素，将复杂任务拆分为细小的子任务去执行。AI Agent 的诞生就是为了处理各种复杂任务的，就复杂任务的处理流程而言，AI Agent 主要分为两大类：**行动类**、**规划执行类**。总而言之，AI Agent 就是结合大模型能去自动思考、规划、效验和执行的一个计算体，以完成特定的任务目标，如果把大模型比作大脑，那 AI Agent 可以理解为小脑+手脚。



### 3. AI Agent 对比人类与其它 Al 协同的区别

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-14.png)

Al Agent 较日前广泛使用的 Copilot 模式更加独立。对比 Al 与人类的交互模式，目前己从过去的嵌入式工具型 Al （例如 siri）向助理型 AI 发展。目前的各类 Al Copilot 不再是机械地完成人类指令，而是可以参与人类工作流，为诸如编写代码、策划活动、优化流程等事项提供建议，与人类协同完成。而 AI Agent 的工作仅需给定一个目标，它就能够针对目标独立思考并做出行动，它会根据给定任务详细拆解出每一步的计划步骤，依靠来自外界的反馈和自主思考，自己给自己创建 prompt，来实现目标。如果说 Copilot 是“副驾驶”，那么 Agent 则可以算得上一个初级的“主驾驶”。



### 4. Al Agent 的框架

上面介绍了 Al Agent 是什么以及一些案例演示，下面的内容将对 Al Agent 背后的技术进行分析。**一个基于大模型的 Al Agent 系统可以拆分为大模型、规划、记忆与工具使用四个组件部分**。2024 年 6月，OpenAl 的应用研究主管 LilianWeng 撰写了一篇博客，认为 AI Agent 可能会成为新时代的开端。她提出了 Agent=LLM+规划技能+记忆+工具使用的基础架构，其中 LLM 扮演了 Agent 的“大脑”，在这个系统中提供推理、规划等能力。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-9.png)





## 二、获取和填入 Stability API 密钥

[点击这里](https://stabilityai.us.auth0.com/u/login?state=hKFo2SBCdEVJTzM4YUk5Wks2ZTNQQlF3LTVOMkcwNF9zWDNqMqFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIFNvTjFDV2dmVWdWc0tlOEd5NWpwTHVjZ19SUllRbWdno2NpZNkgN1JTSU1helVScW9VbkQ4YmQ1cHYxMXE4Z3NDRFVUaTc)即可跳转至 Stability 的 API 密钥管理页。

如果你尚未注册，会被要求先注册再进入管理页，进入管理页后，点击复制密钥即可。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-12.png)

接下来，你需要通过以下步骤把密钥填入 **Dify-工具-Stability** 中：

* 登录 Dify

* 进入工具

* 选择 Stability

* 点击授权

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-7.png)

* 填入密钥并保存





## 三、配置模型供应商

为了优化交互，我们需要 LLM 来将用户的指令具体化，也就是让 LLM 来撰写生成图片的提示词（Prompt）。接下来，我们按照如下的步骤在 Dify 配置模型供应商。

Free 版本的 Dify 提供了免费 200 条 OpenAl 的消息额度，如果消息额度不够用，你可以参考下图步骤，自定义其它模型供应商：

点击**右上角头像-设置-模型供应商**

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-8.png)

如果尚未找到合适的模型供应商，groq 平台提供了 Llama 等 LLM 的免费调用额度。

登录 groqAPI 管理页

点击 Create API Key，设置一个想要的名称并且复制 API Key。

回到 Dify-模型供应商，选择 groqcloud，点击设置。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-6.png)

粘贴 API Key并保存。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-5.png)





## 四、构建 Agent

回到 **Dify-工作室**，选择**创建空白应用**。

在本实验中，我们只需要了解 Agent 的基础用法即可。

选择 Agent，填写名称即可。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-4.png)

接下来你就会进入到如下图的 Agent 编排界面：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-3.png)

我们选择 LLM，本篇教程中我们使用 groq 提供的 Llama-3.1-70B 为例：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-2.png)

在**工具**中添加 Al 绘图工具 Stability：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-1.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image.png)

**撰写提示词**

提示词（Prompt）是 Agent 的灵魂，直接影响到输出的效果。通常来说越具体的提示词输出的效果越好，但是过长的提示词也会导致一些负面效果。

调整提示词的工程，我们称之为提示词工程（Prompt Engineering）

在本次实验中，你不必担心没有掌握提示词工程，我们会在后面循序渐进地学习它。

让我们从最简单的提示词开始：

用户每次输入命令的时候，Agent 都会知晓这样的系统级的指令，从而了解要执行用户绘画的任务的时候需要调用一个叫 stability 的工具。

例如：画一个女孩，手中拿着一本打开的书。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-21.png)

**不想撰写提示词？也可以！**

在**指令**中输入你的需求，点击**生成**，右侧生成的提示词中会出现由 AI 生成的提示词。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-18.png)

提示词：一个生成图像的机器人，使用工具 dalle3 绘画指定内容

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-19.png)

不过，为了养成对提示词良好的理解，我们在初期最好不要依赖这一项功能。





## 五、发布

点击右上角的发布按钮，发布后选择**运行**就可以获得一个在线运行的 Agent 的网页。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-20.png)

复制这个网页的 URL，可以分享给其他好友使用。



* 思考题 1：如何指定生成图片的画风？

我们可以在用户输入的命令中加上画风的指令，例如：二次元风格，画一个女孩，手中拿着一本打开的书

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-15.png)

但是如果我们希望风格默认都是二次元风格呢，那么我们加在系统提示词里就行了，因为我们之前了解到系统提示词是每次执行用户命令都会知晓的，优先级更高，



* 思考题2：如何拒绝部分用户的某些请求？

在许多业务场景中，我们需要避免输出一些不合理的内容，但是 LLM 很多时候比较“傻”，用户下指令时会照做不误，即使输出的内容是错的，这种模型为了努力回答用户而编造虚假内容的现象称为模型幻觉（Hallucinations），那么我们需要让模型必要的时候拒绝用户的请求。

此外，用户也可能提一些和业务无关的内容，我们也需要让 Agent 这个时候拒绝请求。

我们可以使用 markdown 格式给不同的提示词进行划分，将上述教 Agent 拒绝不合理内容的提示词写到“约束”标题下。当然，这样的格式仅仅是为了规范化，你可以有自己的格式。

例如，我们尝试提问：今晚吃什么

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-16.png)

在一些更正式的业务场景中，我们可以调用敏感词库来拒绝用户的请求。

在**添加功能-内容审查**中添加关键词“晚饭”，当用户输入关键词时，则 Agent 应用输出“对不起，我不明白你在说什么”。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BAAI%E5%9B%BE%E7%89%87%E7%94%9F%E6%88%90%E5%BA%94%E7%94%A8-image-17.png)


