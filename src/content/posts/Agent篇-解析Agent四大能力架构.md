---
title: "Agent篇-解析Agent四大能力架构"
published: 2026-07-29
description: "Agent 架构 一个基于大模型的 AI Agent 系统可以拆分为大模型、规划、记忆与工具使用四个组件部分 。6 月，OpenAI 的应用研究主管 Lilian Weng 撰写了一篇博客，认为 AI Agent 可能会成为新时代的开端。她提出了 Agent=LLM + 规划技能 + 记忆 + 工具使用的基础架构，其中 LLM 扮演了 Agent 的 “大脑”，在这个系统中提供推理、规划等能力。 "
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
## **Agent 架构**

**一个基于大模型的 AI Agent 系统可以拆分为大模型、规划、记忆与工具使用四个组件部分**。6 月，OpenAI 的应用研究主管 Lilian Weng 撰写了一篇博客，认为 AI Agent 可能会成为新时代的开端。她提出了 Agent=LLM + 规划技能 + 记忆 + 工具使用的基础架构，其中 LLM 扮演了 Agent 的 “大脑”，在这个系统中提供推理、规划等能力。

LLM Powered Autonomous Agents：<https://lilianweng.github.io/posts/2023-06-23-agent/>

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-Gl0obgxHaozEDgxtdvZcvOtsnSd.png)

## **Agent 案例**

### **AI 虚拟小镇**

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-ZAtdbaWQroIwuIx82pxc7Mgunmt.png)

* 论文链接：[https://arxiv.org/pdf/2304.03442v1.pdf](https://link.zhihu.com/?target=https%3A//arxiv.org/pdf/2304.03442v1.pdf)

* Demo 地址：[https://reverie.herokuapp.com/arXiv\_Demo/](https://link.zhihu.com/?target=https%3A//reverie.herokuapp.com/arXiv_Demo/)

临近情人节，生活在名为 “Smallville” 小镇上的咖啡店长[伊莎贝拉](https://zhida.zhihu.com/search?content_id=245390916\&content_type=Article\&match_order=1\&q=%E4%BC%8A%E8%8E%8E%E8%B4%9D%E6%8B%89\&zhida_source=entity)试图举办一场情人节派对，她邀请了自己的闺蜜[玛利亚](https://zhida.zhihu.com/search?content_id=245390916\&content_type=Article\&match_order=1\&q=%E7%8E%9B%E5%88%A9%E4%BA%9A\&zhida_source=entity)一起布置派对，而玛利亚得知有这么一场派对后，偷偷邀请了暗恋对象[克劳斯](https://zhida.zhihu.com/search?content_id=245390916\&content_type=Article\&match_order=1\&q=%E5%85%8B%E5%8A%B3%E6%96%AF\&zhida_source=entity)一同前往…… 在小镇的同一时间线上，年近六旬的汤姆对小镇即将举办的市长选举有着强烈的兴趣，作为一名对政治格外关心的已婚中年男人，他拒绝了伊莎贝拉的情人节派对邀请。以上情节并未发生在现实世界，但也不是人类编造的虚构剧情，它来自一个由 25 名 AI 角色组成的虚拟小镇。而这个小镇上发生的任何事件，都是 AI 之间通过互动随机生成的结果，目前这个小镇已经井井有条地运转了两天。

## **Agent 架构之规划能力设计**

大模型 + 规划： Agent 的 “大脑”， 通过思维链能力实现任务分解

LLM 具备逻辑推理能力，Agent 可以将 LLM 的逻辑推理能力激发出来。当模型规模足够大的时候，LLM 本身是具备推理能力的。在简单推理问题上，LLM 已经达到了很好的能力；但在复杂推理问题上，LLM 有时还是会出现错误。事实上，很多时候用户无法通过 LLM 获得理想的回答，原因在于 prompt 不够合适，无法激发 LLM 本身的推理能力，通过追加辅助推理的 prompt，可以大幅提升 LLM 的推理效果。在《Large language models are zero-shot reasoners》这篇论文的测试中，在向 LLM 提问的时候追加 “Let’s think step by step” 后，在数学推理测试集 GSM8K 上的推理准确率从 10.4% 提升到了 40.7%。而 Agent 作为智能体代理，能够根据给定的目标自己创建合适的 prompt，可以更好地激发大模型的推理能力。

通常情况下，一项复杂的任务往往涉及许多步骤。AI Agent 需要首先拆解这些步骤，并提前做好计划。任务的分解的环节可以由三种方式完成：1）在大模型输入简单的提示，比如 “XYZ 的步骤”，或者 “实现 XYZ 的子目标是什么？”；2）使用特定任务的指令，比如在需要写小说的时候要求大模型 “写一个故事大纲”；3）通过人工提供信息。当下普遍的技术模式包括思维链和思维树：

### **思维链（Chain of Thoughts）**

思维链（Chain of Thoughts）已成为一种标准的提示技术，用于提高模型在复杂任务中的表现。模型被要求 “一步一步地思考”，将艰巨的任务分解为更小更简单的步骤。思维链将大任务转化为多个可管理的任务，并帮助人们理解模型的思维过程。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-F0kdbmhiXolYquxnqNNcrUzenme.png)

以一个数学题为例，标准 Prompting，模型输入：

```txt
问：罗杰有5个网球，他又买了两盒网球，每盒有3个网球。他现在有多少网球？
答：答案是11
问：食堂有23个苹果，如果他们用掉20个后又买了6个。他们现在有多少个苹果？
模型输出：
答：答案是27
```

可以看到模型无法做出正确的回答。但如果说，我们给模型一些关于解题的思路，就像我们数学考试，都会把解题过程写出来再最终得出答案，不然无法得分。CoT 做的就是这件事，示例如下：CoT Prompting，模型输入：

```txt
问：罗杰有5个网球，他又买了两盒网球，每盒有3个网球。他现在有多少网球？
答：罗杰一开始有5个网球，2盒3个网球，一共就是2*3=6个网球，5+6=11。答案是11.
问：食堂有23个苹果，如果他们用掉20个后又买了6个。他们现在有多少个苹果？
模型输出：
答：食堂原来有23个苹果，他们用掉20个，所以还有23-20=3个。他们又买了6个，所以现在有6+3=9。答案是9
```

可以看到，类似的算术题，思维链提示会在给出答案之前，还会自动给出推理步骤。思维链提示，**就是把一个多步骤推理问题，分解成很多个中间步骤，分配给更多的计算量，生成更多的 token，再把这些答案拼接在一起进行求解**。

### **思维树（Tree of Thoughts）**

思维树（Tree of Thoughts）通过在任务的每一步探索多种推理可能性来扩展思维链。它首先将问题分解为多个思考步骤，并在每个步骤中生成多个想法，从而创建一个树状结构。搜索过程可以是 BFS（广度优先搜索）或 DFS（深度优先搜索）。ToT 做 4 件事：**思想分解、思想生成器、状态评估器和搜索算法**。

ToT Prompt 的例子如下:

```txt
假设三位不同的专家来回答这个问题。所有专家都写下他们思考这个问题的第一个步骤，然后与大家分享。然后，所有专家都写下他们思考的下一个步骤并分享。以此类推，直到所有专家写完他们思考的所有步骤。只要大家发现有专家的步骤出错了，就让这位专家离开。请问...复制
```

另一方面，试错和纠错在现实世界的任务决策中是不可避免且至关重要的步骤。自我反思帮助 AI Agent 完善过去的行动决策、纠正以前的错误、从而不断改进。当下的技术包括 ReAct、Reflexion、后见链（Chain of Hindsight）等

### **ReAct**

ReAct：将任务中单独的行为和语言空间组合在一起，从而使大模型的推理和行动融为一体。该模式帮助大模型与环境互动（例如使用维基百科搜索 API），并以自然语言留下推理的痕迹。

React 论文《ReAct: Synergizing Reasoning and Acting in Language Models》:[https://react-lm.github.io](https://link.zhihu.com/?target=https%3A//react-lm.github.io/)/

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-FOEqbb769owscOxZrlqcaO4gn3g.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-Cs3ebVUFToZzeRxqfATcJjkyncb.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-HiS5bVzTqolAxvxD2lJcGssqnZf.png)

```txt
问题：除了Apple遥控器，还有什么其他设备可以控制相关软件？相关软件指的是Apple遥控器最早可以控制的软件。
说明：
1.Apple遥控器最早只能控制Front Row软件。
2.Front Row软件可以被两种设备控制，Apple遥控器和键盘的功能键。
3.所以，正确答案是键盘的功能键。

传统方式1，直接问LLM。得到结果：
iPod。
答案错误，显然是在胡言乱语。因为LLM的内容生成，是根据之前所有的字预测后续内容，所以，我推测，出现这个结果很可能因为，LLM其实并不知道相关答案，只是Apple遥控器和iPod的语义很接近，所以才得出iPod这个结论。

传统方法2，思维链。得到结果：
想法：让我们一步一步思考这个问题。Apple遥控器可以控制Apple电视。Apple电视可以被iPhone、iPad和iPod Touch控制。
答案：iPhone、iPad和iPod Touch控制。
答案错误，思维链范式，其实也是在胡编，因为它不知道答案。

传统方法3，动作范式。得到结果：
动作1：搜索【Apple 遥控器】
结果1：Apple遥控器是一种遥控器……最早可以控制“Front Row”……

动作2：搜索【Front Row】
结果2：无结果

动作3：搜索【Front Row软件】
结果3：FrontRow是一种过时软件……

动作4：完成【是的】
答案错误，动作范式，即隐式推理，也没有得到正确答案。不难理解，隐式推理对LLM的推理能力要求很高，因为他会隐去思考过程。我觉得当LLM推理能力达到一定程度时，应该也能得出正确答案。

ReAct方法，即推理+动作。得到结果：
想法1：我需要搜索Apple遥控器，并找到Apple遥控器最早可以控制的软件。
动作1：搜索【Apple 遥控器】
结果1：Apple遥控器是一种遥控器……最早可以控制“Front Row”……

想法2：Apple遥控器最早可以控制Front Row。我需要搜索Front Row下一步，找出还有什么其他设备可以控制他
动作2：搜索【Front Row】
结果2：无结果，可以试试“Front Row Seat to Earth”和“Front Row软件”

想法3：Front Row没有找到，我可以搜索“Front Row软件”
动作3：搜索【Front Row软件】
结果3：FrontRow是一种过时软件……可以被Apple遥控器和键盘功能键控制。

想法4：现在我知道答案了。
动作4：完成【键盘功能键】
答案正确。通过显式推理，加上动作，LLM Agent自主找到了答案。整个过程感觉就像是个不是特别聪明的孩子，要把想法写出来，然后去综合所有想法和观察，接着再做出相应的动作。但显然这个方法很有效，它最终找到了答案。
```

### **Reflexion**

Reflexion：一个让 AI Agent 具备动态记忆和自我反思能力以提高推理能力的框架。沿用了 ReAct 中的设置，并提供简单的二进制奖励。每次行动后，AI Agent 都会计算一个启发式函数，并根据自我反思的结果决定是否重置环境以开始新的试验。这个启发式的函数可以判断是否当下的路径效率低下（耗时过长却没有成功）或包含幻觉（在环境中遇到一连串导致相同观察结果的相同行动），并在出现这两种情况下终止函数。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-Q4vqbOiYmocMdKxQYTJcMp2On5e.png)

## **Agent 架构之长期记忆设计**

记忆，即信息存储与回忆。智能体模拟人类，设短期记忆存会话上下文，助多轮对话，任务毕则清；长期记忆存用户特征、业务数据，向量数据库速存速查。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-H51zbghtuomoAixdLSxc1s1mn7g.png)

**记忆：用有限的上下文长度实现更多的记忆**

**记忆模块负责存储信息，包括过去的交互、学习到的知识，甚至是临时的任务信息**。对于一个智能体来说，有效的记忆机制能够保障它在面对新的或复杂的情况时，调用以往的经验和知识。例如，一个具备记忆功能的聊天机器人可以记住用户的偏好或先前的对话内容，从而提供更个性化和连贯的交流体验。

**对 AI 智能体系统的输入会成为系统的记忆，与人类的记忆模式可实现一一映射**。记忆可以定义为用于获取、存储、保留以及随后检索信息的过程。人脑中有多种记忆类型，如感觉记忆、短期记忆和长期记忆。而对于 AI Agent 系统而言，用户在与其交互过程中产生的内容都可以认为是 Agent 的记忆，和人类记忆的模式能够产生对应关系。感觉记忆就是作为学习嵌入表示的原始输入，包括文本、图像或其他模态；短期记忆就是上下文，受到有限的上下文窗口长度的限制；长期记忆则可以认为是 Agent 在工作时需要查询的外部向量数据库，可通过快速检索进行访问。目前 Agent 主要是利用外部的长期记忆，来完成很多的复杂任务，比如阅读 PDF、联网搜索实时新闻等。任务与结果会储存在记忆模块中，当信息被调用时，储存在记忆中的信息会回到与用户的对话中，由此创造出更加紧密的上下文环境。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-PvCebqyWQobNpQxt6MMcJmOTnEg.png)

**为了解决有限记忆时间的限制，通常会用到外部存储器。常见的做法是将信息的嵌入表示保存到可支持快速的最大内积搜索（MIPS）的向量存储数据库中。向量数据库通过将数据转化为向量存储，解决大模型海量知识的存储、检索、匹配问题**。向量是 AI 理解世界的通用数据形式，大模型需要大量的数据进行训练，以获取丰富的语义和上下文信息，导致了数据量的指数级增长。向量数据库利用人工智能中的 Embedding 方法，将图像、音视频等[非结构化数据](https://zhida.zhihu.com/search?content_id=245390916\&content_type=Article\&match_order=1\&q=%E9%9D%9E%E7%BB%93%E6%9E%84%E5%8C%96%E6%95%B0%E6%8D%AE\&zhida_source=entity)抽象、转换为多维向量，由此可以结构化地在向量数据库中进行管理，从而实现快速、高效的数据存储和检索过程，赋予了 Agent“长期记忆”。同时，将高维空间中的[多模态](https://zhida.zhihu.com/search?content_id=245390916\&content_type=Article\&match_order=1\&q=%E5%A4%9A%E6%A8%A1%E6%80%81\&zhida_source=entity)数据映射到低维空间的向量，也能大幅降低存储和计算的成本，向量数据库的存储成本比存到神经网络的成本要低 2 到 4 个数量级。

**Embedding 技术和向量相似度计算是向量数据库的核心**。Embedding 技术是一种将图像、音视频等非结构化数据转化为计算机能够识别的语言的方法，例如常见的地图就是对于现实地理的 Embedding，现实的地理地形的信息其实远远超过三维，但是地图通过颜色和等高线等来最大化表现现实的地理信息。在通过 Embedding 技术将非结构化数据例如文本数据转化为向量后，就可以通过数学方法来计算两个向量之间的相似度，即可实现对文本的比较。向量数据库强大的检索功能就是基于向量相似度计算而达成的，通过相似性检索特性，针对相似的问题找出近似匹配的结果，是一种模糊匹配的检索，没有标准的准确答案，进而更高效地支撑更广泛的应用场景。

## **Agent 架构之执行能力设计**

### **协作执行**

行动模块负责将代理的决策转化为具体的结果。该模块位于最下游位置，直接与环境交互。行动模块受到角色、记忆和规划模块的影响。

**行动目标**：

* **任务完成**：代理的行动旨在完成特定任务。例如，Voyager和ChatDev中的代理完成任务。

* **沟通**：代理的行动旨在与其他代理或真实人类沟通。例如，ChatDev和Inner Monologue中的代理进行沟通。

* **环境探索**：代理的行动旨在探索不熟悉的环境。例如，Voyager中的代理探索未知技能。

**行动生成**：

* **通过记忆回忆行动**：行动是根据当前任务从代理记忆中提取信息生成的。例如，Generative Agent和GITM使用记忆信息指导行动。

* **通过计划跟随行动**：代理按照其预先生成的计划采取行动。例如，DEPS和GITM中的代理遵循计划。

**行动空间**：

* **外部工具**：利用外部API、数据库和外部模型扩展行动空间。例如，HuggingGPT、ChatDB和ChemCrow使用外部工具。

* **内部知识**：依赖LLMs的内部知识指导行动。例如，DEPS、ChatDev和Generative Agent使用LLMs的规划、对话和常识理解能力。

**行动影响**：

* **改变环境**：代理通过行动直接改变环境状态。例如，GITM和Voyager中的代理改变环境。

* **改变内部状态**：代理采取的行动改变代理本身。例如，Generative Agent和SayCan中的代理更新记忆。

* **触发新行动**：一个代理行动触发另一个行动。例如，Voyager中的代理在收集到所有必要资源后建造建筑物。

通过上述模块的协同作用，基于LLM的自主代理能够模拟人类行为，有效执行多样化任务。

在我们之前的示例 (智能体监督) 中，我们介绍了单个监督节点的概念，用于在不同的工作节点之间路由工作。

但是，如果单个工作节点的任务变得过于复杂？如果工作节点的数量变得过大？

对于某些应用程序，如果工作以*分层*方式进行分配，系统可能会更有效。

您可以通过组合不同的子图并创建一个顶层监督节点以及中间层监督节点来实现这一点。

为此，让我们构建一个简单的研究助手！该图将类似于以下内容

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-OToRb0ewpo9ddqx1lgncsZvVnFf.png)

此笔记本受 Wu 等人发表的论文 [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155) 的启发。在本笔记本的其余部分，您将

1. 定义智能体的工具以访问网络和写入文件

2. 定义一些实用程序来帮助创建图和智能体

3. 创建并定义每个团队（网络研究 + 文档撰写）

4. 将所有内容组合在一起。

智能体依规划与记忆，执行具体行动，包括与外部互动或工具调用，实现输入至输出的转化。比如：智能客服回复、查询天气预报、AI 机器人抓起物体等等。

## **Agent 架构之工具能力设计**

智能体依据“工具”感知环境、执行决策。工具比如：神经感官，助其获取信息、执行任务。配备多样工具并赋权，比如：API 调用业务信息，插件扩展大模型能力，比如：ChatPDF 解析文档、Midjourey 文生图。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-Hk4zbRMvWoKgZtx6ABbcSd06nTh.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84_assets/Agent%E7%AF%87-%E8%A7%A3%E6%9E%90Agent%E5%9B%9B%E5%A4%A7%E8%83%BD%E5%8A%9B%E6%9E%B6%E6%9E%84-WmDBbJEO1oMMFOxbOsQc3Tsan1D.png)

工具：懂得使用工具才会更像人类

**AI Agent 与大模型的一大区别在于能够使用外部工具拓展模型能力**。懂得使用工具是人类最显著和最独特的地方，同样地，也可以为大模型配备外部工具来让模型完成原本无法完成的工作。ChatGPT 的一大缺点在于，其训练数据只截止到了 2021 年底，对于更新一些的知识内容它无法直接做出回答。虽然后续 OpenAI 为 ChatGPT 更新了插件功能，能够调用[浏览器插件](https://zhida.zhihu.com/search?content_id=245390916\&content_type=Article\&match_order=1\&q=%E6%B5%8F%E8%A7%88%E5%99%A8%E6%8F%92%E4%BB%B6\&zhida_source=entity)来访问最新的信息，但是需要用户来针对问题指定是否需要使用插件，无法做到完全自然的回答。AI Agent 则具备了自主调用工具的能力，在获取到每一步子任务的工作后，Agent 都会判断是否需要通过调用外部工具来完成该子任务，并在完成后获取该外部工具返回的信息提供给 LLM，进行下一步子任务的工作。OpenAI 也在 6 月为 GPT-4 和 GPT-3.5 更新了函数调用的功能，开发者现在可以向这两个大模型描述函数，并让模型智能地选择输出包含调用这些函数的参数的 JSON 对象。这是一种更可靠地将 GPT 的功能与外部工具和 API 相连的新方法，允许开发者更可靠地从模型中获得结构化的数据，为 AI 开发者提供了方便。实现调用工具的方法就是编写大量的工具调用数据集来进行模型的微调。

总结一下 **AI Agent 的原理主要包括感知、分析、决策和执行四大能力**。这些能力相互协同，构成了 AI Agent 的基本工作原理。首先是感知能力，通过传感器获取外部环境的信息，使 AI Agent 能够对周围的情况有所了解。其次是分析能力，通过对感知到的信息进行分析和处理，提取有用的特征和模式。然后是决策能力，AI Agent 基于分析结果进行决策，制定相应的行动计划。最后是执行能力，将决策转化为具体的行动，实现任务的完成。这四大能力相互配合，使得 AI Agent 能够在复杂的环境中高效地运行和执行任务。



## **主流Agent框架**

### **AutoGPT**

* 开源项目地址：<https://github.com/Significant-Gravitas/AutoGPT>

**介绍**：
AutoGPT是一款自动生成文本的人工智能工具，基于生成式预训练语言模型，通过大规模语料库的预训练，学习语言的基本结构和语义关系，生成与上下文相关的新句子或段落。

**优点**：

1. 高效性：快速生成大量文本，提高内容生产效率。

2. 多样性：根据不同关键词和上下文生成多样化文本。

3. 可定制性：可根据需求进行定制化训练，符合特定领域的语言风格。

**缺点**：

1. 复杂性：实现原理复杂，定义了多种角色和prompt模板，增加学习和使用难度。

2. 学习曲线：对于新用户来说门槛较高。

**适用场景**：
机器翻译、摘要生成、对话生成等自然语言处理任务。

### **MetaGPT**

* 开源项目地址：<https://github.com/geekan/MetaGPT>

**介绍**：
MetaGPT采用多智能体框架，强调全面项目执行方法，包括生成产品需求规格和技术设计的能力，以及API界面生成。

**优点**：

1. 降低编程门槛：采用自然语言编程，允许用户使用自然语言指令进行编程。

2. 多智能体协作：基于多智能体框架，智能体能够协同工作，完成复杂任务。

3. 自动化与效率提升：结合人类社会的最佳实践，自动将复杂任务分解为不同角色处理的详细可行性组件。

**缺点**：

1. 实现原理复杂：相比于传统编程语言，MetaGPT的实现原理较为复杂。

2. 学习曲线陡峭：需要用户具备一定的技术背景和对AI技术的理解。

**适用场景**：
低成本低门槛开发简易软件项目，特别是在快速API设计原型场景中提供了显著优势。

### **FastGPT**

* 开源项目地址：<https://github.com/labring/FastGPT>

**介绍**：
FastGPT支持用户加载自有模型或开源模型，提供对底层推理框架的优化支持，内置RAG流程支持，提供更强的数据融合能力。

**优点**：

1. 模型自主权强：支持自定义模型加载和开源框架适配。

2. 知识集成能力：内置RAG流程支持，提供更强的数据融合能力。

3. 性能优化：支持针对不同硬件环境进行推理优化，支持本地化部署。

**缺点**：
技术要求高，面向开发者，使用门槛相对较高。

**适用场景**：
复杂NLP任务、多数据源的知识管理任务，隐私保护、行业定制和高性能推理场景，如金融、医疗或科研领域。

### **dify**

* 开源项目地址：<https://github.com/langgenius/dify>

**介绍**：
dify.ai主要依赖第三方大模型API，内置基础AI功能，减少对开发者工具链的依赖。

**优点**：

1. 快速部署：适合企业快速部署客服系统、内容生成工具。

2. 低门槛：面向业务人员，无需配置复杂的基础设施即可完成部署。

**缺点**：

1. 依赖外部生态：数据流动通常经过云端，可能面临隐私问题。

2. 性能受限：模型推理性能取决于第三方API提供商的能力，优化空间有限。

**适用场景**：
标准化业务场景，低复杂度的需求，如固定模板类任务或简单的生成需求。面向B端

### **coze**

* 开源项目地址：<https://github.com/deanxv/coze-discord-proxy>

**介绍**：
Coze是一个无代码AI机器人构建平台，允许用户创建聊天机器人，无需任何编程经验，提供知识集成、工作流定制和多渠道部署的功能。

**优点**：

1. 无代码机器人构建：使用直观的界面创建AI聊天机器人。

2. 知识集成：上传外部数据和文档，增强机器人的知识库和响应能力。

3. 多渠道部署：将机器人发布到多种消息平台。

**缺点**：
学习曲线较高，插件数量建议不超过4个。

**适用场景**：
客户支持、产品咨询、新闻聚合、员工协助等。面向C端

以上是对AutoGPT、MetaGPT、FastGPT、dify、coze的详细介绍、优缺点以及适用场景的对比。希望这些信息能帮助您更好地了解这些工具，并选择适合您需求的平台。


