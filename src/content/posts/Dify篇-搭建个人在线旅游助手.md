---
title: "Dify篇-搭建个人在线旅游助手"
published: 2026-07-29
description: "一、准备 在新建 Agent 之前，请先确保以下步骤已经完成： 注册和登录 ，如果你想要进行本地部署，可以参考 至少配置一个模型供应商（Dify 赠送 200 条 OpenAI 消息额度，但为了确保实验顺利建议自行配置 LLM 的 API Key） 二、配置工具 Google 搭建在线旅游助手需要使用联网的搜索引擎作为参考资料来源，本文中将以 Google 作为示例。 当然，你也可以使用其他的搜索"
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
## 一、准备

在新建 Agent 之前，请先确保以下步骤已经完成：

* 注册和登录 [Dify](https://dify.ai/)，如果你想要进行本地部署，可以参考[社区版-Docker Compose 部署](https://docs.dify.ai/zh-hans/getting-started/install-self-hosted/docker-compose)

* 至少配置一个模型供应商（Dify 赠送 200 条 OpenAI 消息额度，但为了确保实验顺利建议自行配置 LLM 的 API Key）



## 二、配置工具

### Google

搭建在线旅游助手需要使用联网的搜索引擎作为参考资料来源，本文中将以 Google 作为示例。

当然，你也可以使用其他的搜索引擎，例如[必应](https://docs.dify.ai/zh-hans/guides/tools/tool-configuration/bing)，甚至是由 AI 驱动的 [Perplexity](https://docs.dify.ai/zh-hans/guides/tools/tool-configuration/perplexity)。

Dify 提供的 Google 工具基于 SerpAPI，因此需要提前进入 SerpAPI 的 API Key 管理页申请 API Key 并粘贴到  **Dify-工具**的对应位置。

具体操作步骤如下：

1. 新增 SerpAPI 的 API Key：

进入 [SerpAPI-API Key](https://serpapi.com/users/sign_in)，如果你尚未注册，会被跳转至进入注册页。

SerpAP 提供一个月 100 次的免费调用次数，这足够我们完成本次实验了。如果你需要更多的额度，可以增加余额，或者使用其他的开源方案。

点击复制

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B-image-1.png)

* 前往 **Dify-工具-Google**：

点击**去授权**，填入 API Key 并保存。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B-image.png)

### webscraper

本次实验中，我们需要一个爬虫工具从指定的网页中抓取内容，Dify 已提供内置工具，无需额外配置。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B-image-2.png)

### Wikipedia

我们还希望 Agent 能够准确介绍目的地知识，Wikipedia 是一个比较好知识来源，Dify 也内置了该工具，无需额外配置。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B-image-5.png)



## 三、构建 Agent

首先我们选择**创建空白应用-Agent**：

添加工具：`Google`、`webscraper` 和 `wikipedia` 并启用。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B-image-4.png)

**示例输出**

示例输出不是必要的部分，示例输出的目的是为了给 Agent 一个书写格式的参考，以确保 Agent 的输出更接近我们的期望。

以下是旅游助手的示例输出：



* 思考题：如何规范化用户输入？

通常我们输入 Agent 内容都是自然语言，而自然语言的一个缺点是很难规范化，有可能包含了一些 Agent 不需要的信息或者没有价值的信息，这个时候我们可以引入变量来规范化输入。

Dify 目前支持`文本`、`段落`、`下拉选项`、`数字`、`基于 API 的变量`这几种类型的变量。

在本实验中，我们只需要选用`文本`类型的变量即可。

在变量中，选择合适的变量类型，我们可以询问用户目的地、旅行天数、预算。

| **变量Key**   | **&#x20;变量类型** | **字段名称** | **可选** |
| ----------- | -------------- | -------- | ------ |
| destination | 文本             | 目的地      | 是      |
| day         | 文本             | 旅行天数     | 是      |
| budget      | 文本             | 旅行预算     | 是      |

需要注意的是，变量 Key，也就是变量的名称，仅支持大小写英文、数字、下划线。字段名称是用户可以看到的提示内容。

添加变量后，用户可以按照应用开发者的意图向应用提供必要的背景信息，实现的效果如下：

生成提示词

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B_assets/Dify%E7%AF%87-%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%9C%A8%E7%BA%BF%E6%97%85%E6%B8%B8%E5%8A%A9%E6%89%8B-image-3.png)


