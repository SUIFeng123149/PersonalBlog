---
title: "LangChain篇-工作流编排"
published: 2026-07-29
description: "一、LCEL介绍 （LangChain Expression Language）是一种强大的工作流编排工具，可以从基本组件构建复杂任务链条（chain），并支持诸如流式处理、并行处理和日志记录等开箱即用的功能。 LCEL 从第一天起就被设计为 支持将原型投入生产，无需更改代码 ，从最简单的“提示 + LLM”链到最复杂的链（我们已经看到有人成功地在生产中运行了包含数百步的 LCEL 链）。以下是您"
image: ""
tags: ["LangChain"]
category: "LangChain"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
## 一、LCEL介绍

[LCEL](https://python.langchain.com.cn/docs/expression_language/)（LangChain Expression Language）是一种强大的工作流编排工具，可以从基本组件构建复杂任务链条（chain），并支持诸如流式处理、并行处理和日志记录等开箱即用的功能。

LCEL 从第一天起就被设计为**支持将原型投入生产，无需更改代码**，从最简单的“提示 + LLM”链到最复杂的链（我们已经看到有人成功地在生产中运行了包含数百步的 LCEL 链）。以下是您可能想要使用 LCEL 的一些原因的几个亮点：

* **一流的流式支持** 当您使用 LCEL 构建链时，您将获得可能的最佳时间到第一个标记（直到输出的第一块内容出现所经过的时间）。对于某些链，这意味着我们直接从 LLM 流式传输标记到流式输出解析器，您将以与 LLM 提供程序输出原始标记的速率相同的速度获得解析的增量输出块。

* **异步支持** 使用 LCEL 构建的任何链都可以使用同步 API（例如，在您的 Jupyter 笔记本中进行原型设计）以及异步 API（例如，在 [LangServe](http://www.aidoczh.com/langchain/v0.2/docs/langserve/) 服务器中）进行调用。这使得可以在原型和生产中使用相同的代码，具有出色的性能，并且能够在同一服务器中处理许多并发请求。

* **优化的并行执行** 每当您的 LCEL 链具有可以并行执行的步骤时（例如，如果您从多个检索器中获取文档），我们会自动执行，无论是在同步接口还是异步接口中，以获得可能的最小延迟。

* **重试和回退** 为 LCEL 链的任何部分配置重试和回退。这是使您的链在规模上更可靠的好方法。我们目前正在努力为重试/回退添加流式支持，这样您就可以获得额外的可靠性而无需任何延迟成本。

* **访问中间结果** 对于更复杂的链，访问中间步骤的结果通常非常有用，即使在生成最终输出之前。这可以用于让最终用户知道正在发生的事情，甚至只是用于调试您的链。您可以流式传输中间结果，并且在每个 [LangServe](http://www.aidoczh.com/langchain/v0.2/docs/langserve/) 服务器上都可以使用。

* **输入和输出模式** 输入和输出模式为每个 LCEL 链提供了从链的结构推断出的 Pydantic 和 JSONSchema 模式。这可用于验证输入和输出，并且是 LangServe 的一个组成部分。



## 二、Runable interface

为了尽可能简化创建自定义链的过程，我们实现了一个 ["Runnable"](https://api.python.langchain.com/en/stable/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable) 协议。许多 LangChain 组件都实现了 `Runnable` 协议，包括聊天模型、LLMs、输出解析器、检索器、提示模板等等。此外，还有一些有用的基本组件可用于处理可运行对象，您可以在下面了解更多。 这是一个标准接口，可以轻松定义自定义链，并以标准方式调用它们。 [标准接口](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#stream)包括：

* `stream`：返回响应的数据块

* `invoke`：对输入调用链

* `batch`：对输入列表调用链

这些还有相应的异步方法，应该与 [asyncio](https://docs.python.org/3/library/asyncio.html) 一起使用 `await` 语法以实现并发：

* `astream`：异步返回响应的数据块

* `ainvoke`：异步对输入调用链

* `abatch`：异步对输入列表调用链

* `astream_log`：异步返回中间步骤，以及最终响应

* `astream_events`：**beta** 流式传输链中发生的事件（在 `langchain-core` 0.1.14 中引入）

**输入类型** 和 **输出类型** 因组件而异：

所有可运行对象都公开输入和输出 **模式** 以检查输入和输出：

* `input_schema`：从可运行对象结构自动生成的输入 Pydantic 模型

* `output_schema`：从可运行对象结构自动生成的输出 Pydantic 模型

流式运行对于使基于 LLM 的应用程序对最终用户具有响应性至关重要。 重要的 LangChain 原语，如[聊天模型](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#chat-models)、[输出解析器](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#output-parsers)、[提示模板](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#prompt-templates)、[检索器](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#retrievers)和[代理](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#agents)都实现了 LangChain [Runnable 接口](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#interface)。 该接口提供了两种通用的流式内容方法：

1. 同步 `stream` 和异步 `astream` ：流式传输链中的**最终输出**的**默认实现**。

2. 异步 `astream_events` 和异步 `astream_log` ：这些方法提供了一种从链中流式传输**中间步骤**和**最终输出**的方式。 让我们看看这两种方法，并尝试理解如何使用它们。



## 三、Stream（流）

所有 `Runnable` 对象都实现了一个名为 `stream` 的同步方法和一个名为 `astream` 的异步变体。 这些方法旨在以块的形式流式传输最终输出，尽快返回每个块。 只有在程序中的所有步骤都知道如何处理输入流时，才能进行流式传输；即，逐个处理输入块，并产生相应的输出块。 这种处理的复杂性可以有所不同，从简单的任务，如发出 LLM 生成的令牌，到更具挑战性的任务，如在整个 JSON 完成之前流式传输 JSON 结果的部分。 开始探索流式传输的最佳方法是从 LLM 应用程序中最重要的组件开始——LLM 本身！

### 1. LLM 和聊天模型

大型语言模型及其聊天变体是基于 LLM 的应用程序的主要瓶颈。 大型语言模型可能需要**几秒钟**才能对查询生成完整的响应。这比应用程序对最终用户具有响应性的**约 200-300 毫秒**的阈值要慢得多。 使应用程序具有更高的响应性的关键策略是显示中间进度；即，逐个令牌流式传输模型的输出。 我们将展示使用聊天模型进行流式传输的示例。从以下选项中选择一个：

让我们从同步 `stream` API 开始：

```python
#stream_llm.py
chunks = []
for chunk in model.stream("天空是什么颜色？"):
    chunks.append(chunk)print(chunk.content, end="|", flush=True)
```

```txt
天|空|是|什|么|颜|色|？|
```

或者，如果您在异步环境中工作，可以考虑使用异步 `astream` API：

```python
#astream_llm.py
chunks = []
async for chunk in model.astream("天空是什么颜色？"):
    chunks.append(chunk)print(chunk.content, end="|", flush=True)
```

```txt
天|空|是|什|么|颜|色|？|
```

让我们检查其中一个块：

```python
chunks[1]
```

```txt
AIMessageChunk(content='天', id='run-b36bea64-5511-4d7a-b6a3-a07b3db0c8e7')
```

我们得到了一个称为 `AIMessageChunk` 的东西。该块表示 `AIMessage` 的一部分。 消息块是可叠加的——可以简单地将它们相加以获得到目前为止的响应状态！

```python
chunks[0] + chunks[1] + chunks[2] + chunks[3] + chunks[4]
```

```txt
AIMessageChunk(content='天空是什么颜色', id='run-b36bea64-5511-4d7a-b6a3-a07b3db0c8e7')
```

### 2. Chain（链）

几乎所有的 LLM 应用程序都涉及不止一步的操作，而不仅仅是调用语言模型。 让我们使用 `LangChain 表达式语言`（`LCEL`）构建一个简单的链，该链结合了一个提示、模型和解析器，并验证流式传输是否正常工作。 我们将使用 [StrOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html) 来解析模型的输出。这是一个简单的解析器，从 `AIMessageChunk` 中提取 `content` 字段，给出模型返回的 `token`。

LCEL 是一种声明式的方式，通过将不同的 LangChain 原语链接在一起来指定一个“程序”。使用 LCEL 创建的链可以自动实现 `stream` 和 `astream`，从而实现对最终输出的流式传输。事实上，使用 LCEL 创建的链实现了整个标准 Runnable 接口。

```python
#astream_chain.py
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
prompt = ChatPromptTemplate.from_template("给我讲一个关于{topic}的笑话")
parser = StrOutputParser()
chain = prompt | model | parser
async for chunk in chain.astream({"topic": "鹦鹉"}):print(chunk, end="|", flush=True)
    
```

```txt
|一个|人|去|宠|物|店|买|鹦|鹉|。|店|员|说|：“|这|只|鹦|鹉|会|说|话|。”|
|买|回|家|后|，|那|人|发|现|鹦|鹉|只|会|说|一|句|话|：“|我|是|鹦|鹉|。”|
|那|人|就|去|找|店|员|，|说|：“|你|不|是|说|这|只|鹦|鹉|会|说|话|吗|？|它|只|会|说|‘|我|是|鹦|鹉|’|。”|
|店|员|回|答|：“|它|确|实|会|说|话|，|你|想|它|怎|么|可能|知|道|自|己|是|鹦|鹉|呢|？”||
```

请注意，即使我们在上面的链条末尾使用了 `parser`，我们仍然可以获得流式输出。`parser` 会对每个流式块进行操作。许多 LCEL 基元也支持这种转换式的流式传递，这在构建应用程序时非常方便。

自定义函数可以被设计为返回生成器，这样就能够操作流。

某些可运行实体，如提示模板和聊天模型，无法处理单个块，而是聚合所有先前的步骤。这些可运行实体可以中断流处理。

LangChain 表达语言允许您将链的构建与使用模式（例如同步/异步、批处理/流式等）分开。如果这与您构建的内容无关，您也可以依赖于标准的命令式编程方法，通过在每个组件上调用 invoke、batch 或 stream，将结果分配给变量，然后根据需要在下游使用它们。

**使用输入流**

如果您想要在输出生成时从中流式传输 JSON，该怎么办呢？

如果您依赖 `json.loads` 来解析部分 JSON，那么解析将失败，因为部分 JSON 不会是有效的 JSON。

您可能会束手无策，声称无法流式传输 JSON。

事实证明，有一种方法可以做到这一点——解析器需要在**输入流**上操作，并尝试将部分JSON“自动完成”为有效状态。

让我们看看这样一个解析器的运行，以了解这意味着什么。

```python
model = ChatOpenAI(model="gpt-4")
parser = StrOutputParser()
chain = (
        model | JsonOutputParser()
        # 由于Langchain旧版本中的一个错误，JsonOutputParser未能从某些模型中流式传输结果
)
async def async_stream():
    async for text in chain.astream(
        "以JSON 格式输出法国、西班牙和日本的国家及其人口列表。"
        '使用一个带有“countries”外部键的字典，其中包含国家列表。'
        "每个国家都应该有键`name`和`population`"
    ):
        print(text, flush=True)
```

```json
{}
{'countries': []}
{'countries': [{}]}
{'countries': [{'name': ''}]}
{'countries': [{'name': 'France'}]}
{'countries': [{'name': 'France', 'population': 670}]}
{'countries': [{'name': 'France', 'population': 670810}]}
{'countries': [{'name': 'France', 'population': 67081000}]}
{'countries': [{'name': 'France', 'population': 67081000}, {}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain'}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 467}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 467330}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 46733038}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 46733038}, {}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 46733038}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 46733038}, {'name': 'Japan'}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 46733038}, {'name': 'Japan', 'population': 126}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 46733038}, {'name': 'Japan', 'population': 126300}]}
{'countries': [{'name': 'France', 'population': 67081000}, {'name': 'Spain', 'population': 46733038}, {'name': 'Japan', 'population': 126300000}]}
```



## 四、Stream events（事件流）

现在我们已经了解了 `stream` 和 `astream` 的工作原理，让我们进入事件流的世界。

事件流是一个 **beta** API。这个 API 可能会根据反馈略微更改。

本指南演示了 `V2` API，并且需要 langchain-core >= 0.2。对于与旧版本 LangChain 兼容的 `V1` API，请参阅[这里](https://python.langchain.com/v0.1/docs/expression_language/streaming/#using-stream-events)。

```python
import langchain_core
langchain_core.__version__
```

为了使 `astream_events` API正常工作：

* 在代码中尽可能使用 `async`（例如，异步工具等）

* 如果定义自定义函数/可运行项，请传播回调

* 在没有 LCEL 的情况下使用可运行项时，请确保在 LLMs 上调用 `.astream()` 而不是 `.ainvoke` 以强制 LLM流式传输令牌

### 1. 事件参考

下面是一个参考表，显示各种可运行对象可能发出的一些事件。

当流式传输正确实现时，对于可运行项的输入直到输入流完全消耗后才会知道。这意味着 `inputs` 通常仅包括 `end` 事件，而不包括 `start` 事件。



### 2. 聊天模型

让我们首先看一下聊天模型产生的事件。

```python
#astream_event.py
events = []
async for event in model.astream_events("hello", version="v2"):
    events.append(event)
```

```txt
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:87: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

嘿，API中那个有趣的 `version="v2"` 参数是什么意思？这是一个 **beta API**，我们几乎肯定会对其进行一些更改（事实上，我们已经做了！）这个版本参数将允许我们最小化对您代码的破坏性更改。 简而言之，我们现在让您感到烦恼，这样以后就不必再烦恼了。 `v2` 仅适用于 langchain-core>=0.2.0。

让我们看一下一些开始事件和一些结束事件。

```python
events[:3]
```

```json
[{'event': 'on_chat_model_start',
  'data': {'input': 'hello'},
  'name': 'ChatAnthropic',
  'tags': [],
  'run_id': 'a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3',
  'metadata': {}},
  {'event': 'on_chat_model_stream',
  'data': {'chunk': AIMessageChunk(content='Hello', id='run-a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3')},
  'run_id': 'a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {}},
  {'event': 'on_chat_model_stream',
  'data': {'chunk': AIMessageChunk(content='!', id='run-a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3')},
  'run_id': 'a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {}}]
```

```python
events[-2:]
```

```json
[{'event': 'on_chat_model_stream',
  'data': {'chunk': AIMessageChunk(content='?', id='run-a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3')},
  'run_id': 'a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {}},
  {'event': 'on_chat_model_end',
  'data': {'output': AIMessageChunk(content='Hello! How can I assist you today?', id='run-a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3')},
  'run_id': 'a81e4c0f-fc36-4d33-93bc-1ac25b9bb2c3',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {}}]
```


