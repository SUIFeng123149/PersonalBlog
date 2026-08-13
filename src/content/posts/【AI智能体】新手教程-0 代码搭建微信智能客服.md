---
title: "【AI智能体】新手教程-0 代码搭建微信智能客服"
published: 2026-07-29
description: "& x20; 在扣子搭建的客服智能体可以一键发布到微信公众号，作为公众号客服向订阅用户提供智能问答服务。本文档介绍扣子智能体接入微信公众号的详细操作步骤。 场景说明 微信公众号是产品运营的重要信息传播与互动平台，内容创作者和媒体机构可以在微信公众号中向订阅用户群发消息，用于内容传播和粉丝运营，是自媒体、新闻媒体、知识分享等领域的重要运营渠道。基于微信公众号庞大的粉丝量，人工客服往往难以及时响应订阅"
image: ""
tags: ["AI Agent"]
category: "AI Agent"
draft: false
featured: false
lang: ""
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
&#x20;

在扣子搭建的客服智能体可以一键发布到微信公众号，作为公众号客服向订阅用户提供智能问答服务。本文档介绍扣子智能体接入微信公众号的详细操作步骤。

### 场景说明

微信公众号是产品运营的重要信息传播与互动平台，内容创作者和媒体机构可以在微信公众号中向订阅用户群发消息，用于内容传播和粉丝运营，是自媒体、新闻媒体、知识分享等领域的重要运营渠道。基于微信公众号庞大的粉丝量，人工客服往往难以及时响应订阅用户的咨询与答疑。

基于扣子搭建的智能体可以一键发布到微信公众号，作为公众号客服实时响应订阅用户的消息，快速解答常见问题。例如电商行业解答产品咨询、处理售后服务；教育行业提供课程咨询、学习资料查询等等。

本教程将以扣子客服小助手为例，详细演示在扣子搭建智能体并发布为微信公众号客服的详细操作步骤。智能客服具备以下能力：

* **产品答疑**：解答使用扣子过程中遇到的咨询与疑问，帮助用户排查故障。

* **视觉理解**：查看用户发送的图片，基于图片内容回复用户咨询，例如识别用户发送的扣子平台报错信息，并提供对应的处理方式。

### 准备工作

* 已成功申请一个微信公众号，且公众号状态正常。

* 获取公众号开发者 ID。

访问[微信公众平台](https://mp.weixin.qq.com/)并登录你的订阅号。在**设置与开发 > 开发接口管理 > 基本配置**页面，获取**开发者ID(AppID)**。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-UxYmbuPH1oIBvbxuEwccPVgHnzb.png)

### 步骤一：搭建智能体

本教程将以扣子客服小助手为例。我们需要先搭建一个智能体，并为其上传扣子知识库，并设置开场白与提示词。

#### 1 创建智能体

登录[扣子开发平台](https://www.coze.cn/)之后，在左侧导航栏中单击**工作空间**，并在项目开发页面右上角单击**创建**，在弹出页面中单击**创建智能体**。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-YLfIbOCzyoPncjx205JcBxecnIg.png)

根据页面提示设置智能体名称、头像。设置之后自动进入智能体编排页面。

#### 2 设置人设与回复逻辑

用于定义智能体的人设和回复风格，帮助智能体更生成符合当前场景与指定风格的回复。在本教程中，我们需要为客服智能体设置一个扣子平台客服的人设，并规定它的回复风格与范围。

你可以手动设置人设与回复逻辑，也可以直接选择 AI 生成，或者参考扣子提供的提示词模板。

设置后：

#### 3 添加插件

插件用于扩展智能体的功能，使其能够执行特定任务，如搜索、文件处理、日程管理等，增强智能体的实用性。

在本教程中，我们需要为客服智能体添加搜索插件和图片理解插件。

* **搜索插件**：智能体知识库中未命中的问题，尝试联网搜索、生成回复。

* **图片理解**：对于不支持视觉理解的模型，需要借助图片理解插件来识别用户发送的图片内容。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-BhVRbvpvAo34MgxH9gqcQ44jn3f.png)

#### 4 上传知识库

通过知识库为客服智能体添加私有知识。

在本教程中，我们需要为客服智能体添加扣子平台的文档作为知识库，并上传日常沉淀的常见问题。所以需要创建并绑定以下两个知识库：

* **文档知识库**：通过 URL 上传扣子平台的文档。

* **表格知识库**：上传表格形式的常见问题文档。

本教程以上传文档知识库为例，演示通过 URL 上传扣子文档中心作为扣子知识库的操作步骤：

1. 在智能体编排页面的**文本知识库**区域单击添加图标。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-KWaIbG9uxo76ZHxtDPEcgvVgntd.png)

1. 单击**创建知识库**，选择**文本格式**、**在线数据**，并**单击创建并导入**。

1) 选择**自动采集**方式、**批量添加**，并填写扣子文档中心的根目录，根据页面提示完成上传。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-LsoIbVG2aoA0mCxZc5hceJ2lnee.png)

#### 5 设置开场白

为客服智能体设置开场白文案，订阅用户访问公众号时，智能体会先送一段开场白文案，提升客服对话体验。

在本教程中，开场白文案可以设置为：

你好，欢迎来到扣子 🎉

扣子是新一代大模型 AI 应用开发平台。无论你是否有编程基础，都可以快速搭建出各种智能体，并一键发布到各大社交平台，或者轻松部署到自己的网站 🔗

使用扣子过程中有任何问题请随时问我 ⚡

&#x20;很高兴与你交流任何话题，欢迎随时来找我！

#### 6 调试智能体

在调试区与智能体对话，查看它的答疑效果。例如我们输入一段问题“你可以做什么？”或者“什么是扣子？”

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-NneLb4OSIotv22x2v47c2Jxankd.png)

### 步骤二：将智能体发布到微信客服

1. 在扣子在智能体编排页面右上角，单击**发布**。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-KL1BbLlXXoUok6xfphfc7mJqnGf.png)

1. 在发布页面，找到**微信公众号（订阅号）**&#x53D1;布渠道，单击**配置**。

在 **AppID** 输入框内，填写微信订阅号的开发者 ID，并单击**保存**。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-Ju2xbFDTxo5PjCxtYgUcoA3Snad.png)

1. 跳转到**公众平台账号授权**页面，使用公众平台绑定的管理员个人微信号扫描二维码。

1) 在微信移动端，根据页面提示选择订阅号并确认授权。

授权成功的页面提示如下：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-YKfNb2THsoYZOcxru72cwDFdnUc.png)

1. 返回智能体发布页面，选中**微信公众号（订阅号）**&#x53D1;布平台，并设置发布记录后，单击页面右上角的**发布**。

成功发布后，你可以前往微信订阅号与智能体对话。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-O72obaKyxoSjurxfUoCc2NsHnji.png)

### 步骤三：在微信体验智能客服

在发布页面单击立即对话，根据页面提示扫描二维码，即可和微信公众号的客服智能体展开对话。

例如，我们可以咨询“什么是扣子？”，查看智能客服是否能够正常回复。

&#x20;&#x20;

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D_assets/%E3%80%90AI%E6%99%BA%E8%83%BD%E4%BD%93%E3%80%91%E6%96%B0%E6%89%8B%E6%95%99%E7%A8%8B-0%20%E4%BB%A3%E7%A0%81%E6%90%AD%E5%BB%BA%E5%BE%AE%E4%BF%A1%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-image.png)



