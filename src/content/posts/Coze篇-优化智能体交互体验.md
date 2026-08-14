---
title: "Coze篇-优化智能体交互体验"
published: 2026-07-29
description: "一、开场白 开场白是用户进入智能体后自动展示的引导信息。它的主要目的是帮助用户理解智能体的用途，以及如何与其进行交互。 说明 开场白功能支持如下平台： 豆包、微信公众号（服务号）、微信订阅号、微信小程序、抖音小程序、飞书、Chat SDK 和 API。 微信小程序和抖音小程序：仅支持展示全部预置问题，不支持展示部分预置问题。 微信公众号（服务号）和微信订阅号：不支持预置问题。 常见的开场白效果如下"
image: ""
tags: ["Coze", "AI Agent"]
category: "Coze"
draft: false
featured: false
lang: ""
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
## 一、开场白

开场白是用户进入智能体后自动展示的引导信息。它的主要目的是帮助用户理解智能体的用途，以及如何与其进行交互。

**说明**

开场白功能支持如下平台：

* 豆包、微信公众号（服务号）、微信订阅号、微信小程序、抖音小程序、飞书、Chat SDK 和 API。

* 微信小程序和抖音小程序：仅支持展示全部预置问题，不支持展示部分预置问题。

* 微信公众号（服务号）和微信订阅号：不支持预置问题。

常见的开场白效果如下：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-ChtdbPPL9oKkztxH0tycw3q4nL3.webp)

### 1. 设置开场白

在智能体编排页面的**开场白**区域，可以设置**开场白文案**和**开场白预置问题**。

### 2. 开场白文案

**开场白文案**用于帮助用户快速理解智能体的能力。用户进入智能体后，智能体会默认发送这段预先设置的开场白文案。**开场白文案**为 Markdown 格式，你可以在 Markdown 编辑器中设计智能体的开场白，调试区域会同步展示开场白的预览效果。你也可以通过 AI 自动生成开场白。

通过 Markdown 编辑器，你可以调整开场白文案样式，例如设置层级、加粗、斜体、删除线等样式效果。也可以添加链接、图片、代码块和 {{user\_name}} 变量。其中，{{user\_name}} 会自动引用扣子用户的昵称。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-GJMwbgzKUo07x9xItgsc8RELngf.webp)

### 3. 开场白预置问题

首次使用智能体的用户往往需要一些对话示例体验智能体的能力和效果，你可以为智能体设置**开场白预置问题**，提供一些推荐问题。这些推荐问题会展示在开场白文案之下，用户单击问题即可发起一次对话，帮助用户快速体验 Bot。如果设置了多个开场白问题，则默认随机显示 3 条预置问题。你也可以开启全部展示，开启后，开场白会默认按顺序显示所有预置问题。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-1.jpg)

### 4. 示例

以[雅思口语专家](https://www.coze.cn/store/bot/7389299390185209892)智能体为例，同时设置开场白文案和预置问题。

开场白配置示例：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-1%20%281%29.jpg)

展示效果：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-TM3PbpqOFo1txXx5LpbcTkghncb.webp)



## 二、快捷指令

扣子支持开发者在搭建智能体时创建一些快捷指令，方便用户在与智能体会话时通过快捷指令快速、准确地输入信息。

### 1. 功能说明

配置快捷指令后，智能体用户在智能体的对话框中可以直接通过指令发起预设的对话。快捷指令的行为可以是发送一段简单的文字、上传文件、使用插件或工作流等。多 Agent 模式下，全局配置中也支持添加快捷指令，默认不指定节点回答，智能体根据用户输入匹配对应的节点处理。

例如在翻译智能体中增加一个快捷指令，即原文输入框和目标语言列表，对话时你只需输入待翻译的内容和语言即可快速下发一条翻译指令。

快捷指令效果：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-DX7bbTfZcoCAAdxxieYc20ZZnql.webp)

配置示例：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-SZ7tbJ5N6ovnOdxlZpbcJfcVnFh.png)

### 2. 创建简单指令

参考以下步骤，创建一个简单快捷指令。

1. 在编排页面，定位到**快捷指令**功能，然后单击 **+**。

2. 在弹出的页面，完成以下配置。

1) 配置完成后，可以在调试区，直接点击快捷指令查看效果。

* 如下图所示（左侧是快捷指令配置截图，右侧是调试截图），当点击**AI新闻**指令时，会自动发送配置好的指令内容。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-NJhrbEtxhol85ZxPQn3cixXunqb.webp)

### 3. 创建组件指令

扣子提供了选择器、上传等组件，通过添加这些组件，可以设计更符合使用场景的快捷指令。

参考以下步骤，创建一个带组件的快捷指令。

1. 在智能体编排页面，定位到**快捷指令**功能，然后单击 **+**。

2. 在弹出的页面，完成以下配置。

3. 配置完成后，可以在调试区，直接点击快捷指令查看效果。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-W3KcbIS3fojnGhxa6NCcOW37nch.png)

### 4. 其他操作

* 拖拽快捷指令卡片调整快捷指令的顺序。

* 单击编辑图标修改快捷指令。

* 单击删除图标删除快捷指令。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C_assets/Coze%E7%AF%87-%E4%BC%98%E5%8C%96%E6%99%BA%E8%83%BD%E4%BD%93%E4%BA%A4%E4%BA%92%E4%BD%93%E9%AA%8C-MLkObNQlroivDaxPinMchi23ntc.png)



