---
title: "LLM为什么需要agent化"
published: 2026-07-29
description: "虽然大语言模型的能力很强大，但是Llm仅限于用于训练的知识，这些知识很快会过时，所以llm有以下缺点 幻觉 结果并不总是真实的 对时事的了解有限或一无所知 难以应对复杂推理和计算 例如：买高铁票 & x20; 可以利用外部工具来克服以上缺点。 打个招聘广告 作者目前的公司正在热招，后端（包括大模型）、前端、Android，产品、运营都有岗！ 📍Base：上海/成都 💰薪资：绝对香（BAT对标）"
image: ""
tags: ["AI Agent", "LLM"]
category: "AI Agent"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
虽然大语言模型的能力很强大，但是Llm仅限于用于训练的知识，这些知识很快会过时，所以llm有以下缺点

* 幻觉

* 结果并不总是真实的

* 对时事的了解有限或一无所知

* 难以应对复杂推理和计算

例如：买高铁票 &#x20;

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/LLM%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81agent%E5%8C%96_assets/LLM%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81agent%E5%8C%96-MNlUb0iXho7C58xzAKgcbG2Lnuf.png)

(虽然LLM完全理解了买票的行为，但是它本身并不知道“我”所处的城市，列车的时刻表，价格等等信息）  而基于大模型的Agent (LLM based Agent) 可以利用外部工具来克服以上缺点。

## 打个招聘广告

作者目前的公司正在热招，后端（包括大模型）、前端、Android，产品、运营都有岗！  📍Base：上海/成都  💰薪资：绝对香（BAT对标）  内推不卡简历，直达Team Leader!

岗位和投递链接: <https://construct.jobs.feishu.cn/s/3aAep9X0K7I>

## ReAct Agent

[ReAct Agent 论文](https://arxiv.org/abs/2210.03629)

### LLM Agent 的升级之路：

Standard IO(直接回答) -> COT(chain-of-thought)(思维链) -> Action-Only (Function calling) -> Reason + Action  ReAct = Reasoning(推理) + Action(行动) &#x20;

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/LLM%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81agent%E5%8C%96_assets/LLM%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81agent%E5%8C%96-X8NSb1F8zonjOrxC3UtcYEPRnMb.png)

### ReAct Agent 的组成部分 （通过LangChain实现）

* Models：LLM

* Prompts：对Agent的指令、约束

* Memory : 记录Action执行状态 & 缓存已知信息

* Indexes : 用于结构化文档，以便和模型交互

* Chains ：Langchain的核心（链）

* Agent

### ReAct Agent 的prompt 模板



## 代码

手写一个能帮忙买火车票的智能Agent  注：火车票相关API均为mock



### 结果

#### 第一轮思考

Agent根据要求，选择了需要使用的Tool，组装了请求参数并完成了调用。  （还可以多定义一些Tools，比如获取当前位置的，获取今天日期的工具等等，这样这里的查询火车票的参数可以更智能）

#### 第二轮思考

根据查询出的车票信息去调用购票的Tool

#### 第三轮思考

LLM识别到任务已完成，输出了结果


