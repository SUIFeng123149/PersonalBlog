---
title: "Coze篇-搭建搜索新闻工作流"
published: 2026-07-29
description: "工作流内可选择丰富的插件节点处理任务。例如，本文将介绍如何使用插件节点构建一个用于搜索新闻的工作流。 效果示例 本文构建的示例工作流节点概览如下图所示，该工作流中添加 getToutiaoNews 工具节点来实现搜索新闻的能力。 下图展示了示例工作流添加到智能体之后，智能体带来的用户任务处理能力。当用户输入内容后，智能体会调用示例工作流处理任务，并向用户返回处理结果。 步骤一：构建工作流 1. 在"
image: ""
tags: ["Coze"]
category: "Coze"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
工作流内可选择丰富的插件节点处理任务。例如，本文将介绍如何使用插件节点构建一个用于搜索新闻的工作流。

## 效果示例

本文构建的示例工作流节点概览如下图所示，该工作流中添加 **getToutiaoNews** 工具节点来实现搜索新闻的能力。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81-WX3DbQAcpoZ1WWxAT71cNh1rn47.png)

下图展示了示例工作流添加到智能体之后，智能体带来的用户任务处理能力。当用户输入内容后，智能体会调用示例工作流处理任务，并向用户返回处理结果。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81-QmqqbozI9or5pmxy0Bpch2Vun5e.png)



## 步骤一：构建工作流

1. 在页面右上角，单击 **+资源** > **工作流**。

本文示例配置如下：

* 工作流名称：输入 getNews\_tasks、

* 工作流描述：输入 搜索新闻

- 在工作流的编辑页面的左侧列表内，单击**插件**右侧的 **+** 图标，查找并选用内置的 **getToutiaoNews** 节点。

该节点将用于搜索新闻。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81-JuhGbWGIYo7FWTxEnhWcDSF4nth.png)

* 连接各节点，并依次配置输入输出参数。

节点连接顺序：**开始 → getToutiaoNews → 结束**。各节点参数配置说明如下表：

* 配置完成后，单击页面右上角的**试运行**，测试工作流。

例如，输入 科技 进行测试，待所有节点都运行成功（节点会展示绿色边框）后，查看指定节点的运行结果。

* 测试工作流无问题后，单击页面右上角的**发布**。

成功发布后，在工作流列表中可以查看到该工作流。



## 步骤二：在智能体添加工作流并测试

1. 前往当前团队的 Develop 页面，创建或进入指定智能体。

2. 在智能体编排页面，找到**技能**区域的**工作流**，在右侧单击加号图标。

3. 在对话框左侧单击**团队工作流**，找到自建的 **getNews\_tasks** 工作流，并在右侧单击**添加**。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81-NHBQbsGWroj7EfxkjIHcC2hsnbc.png)

* 在智能体的**人设与回复逻辑**内，声明智能体使用 **getNews\_tasks** 工作流处理任务。

编写后，你可以单击**优化**，让 AI 帮助你生成结构化的回复逻辑。智能体会分析用户意图，根据系统提示词和工作流的描述信息自行选择执行工作流。

* 在智能体的右侧**预览与调试**区域，输入内容预览智能体实现的效果。

例如输入 科技新闻。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81_assets/Coze%E7%AF%87-%E6%90%AD%E5%BB%BA%E6%90%9C%E7%B4%A2%E6%96%B0%E9%97%BB%E5%B7%A5%E4%BD%9C%E6%B5%81-QiWJbbYxDojyJ0x7m9ScOQOmnVf.png)


