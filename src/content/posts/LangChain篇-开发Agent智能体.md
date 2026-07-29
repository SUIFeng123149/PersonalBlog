---
title: LangChain篇-开发Agent智能体
published: 2026-07-29
description: ''
image: ''
tags: ['LangChain', 'AI Agent']
category: 'LangChain'
draft: false
lang: zh-CN
---
# 创建和运行 Agent

单独来说，语言模型无法采取行动 - 它们只能输出文本。

LangChain 的一个重要用例是创建**代理**。

代理是使用 LLM 作为推理引擎的系统，用于确定应采取哪些行动以及这些行动的输入应该是什么。

然后可以将这些行动的结果反馈给代理，并确定是否需要更多行动，或者是否可以结束。

在本次课程中，我们将构建一个可以与多种不同工具进行交互的代理：一个是本地数据库，另一个是搜索引擎。您将能够向该代理提问，观察它调用工具，并与它进行对话。

下面将介绍使用 LangChain 代理进行构建。LangChain 代理适合入门，但在一定程度之后，我们可能希望拥有它们无法提供的灵活性和控制性。要使用更高级的代理，我们建议查看 LangGraph。



## 一、概念

我们将涵盖的概念包括：

* 使用[语言模型](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#chat-models)，特别是它们的工具调用能力

* 创建[检索器](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#retrievers)以向我们的代理公开特定信息

* 使用搜索[工具](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#tools)在线查找信息

* [聊天历史](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#chat-history)，允许聊天机器人“记住”过去的交互，并在回答后续问题时考虑它们。

* 使用[LangSmith](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#langsmith)调试和跟踪您的应用程序



## 二、安装

要安装 LangChain，请运行：

```bash
pip install langchain
```

### LangSmith

使用 LangChain 构建的许多应用程序将包含多个步骤，其中会多次调用 LLM。

随着这些应用程序变得越来越复杂，能够检查链或代理内部发生了什么变得至关重要。

这样做的最佳方式是使用 [LangSmith](https://smith.langchain.com/)。

在上面的链接注册后，请确保设置您的环境变量以开始记录跟踪：

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
```



## 三、定义工具

我们首先需要创建我们想要使用的工具。我们将使用两个工具：[Tavily](http://www.aidoczh.com/langchain/v0.2/docs/integrations/tools/tavily_search/)（用于在线搜索），然后是我们将创建的本地索引上的检索器。

### 1. [Tavily](http://www.aidoczh.com/langchain/v0.2/docs/integrations/tools/tavily_search/)

LangChain 中有一个内置工具，可以轻松使用 Tavily 搜索引擎作为工具。

请注意，这需要一个 API 密钥 - 他们有一个免费的层级，但如果您没有或不想创建一个，您可以忽略这一步。

创建 API 密钥后，您需要将其导出为：

```bash
export TAVILY_API_KEY="..."
```

```python
from langchain_community.tools.tavily_search import TavilySearchResults
```

```python
search = TavilySearchResults(max_results=2)
```

```python
print(search.invoke("今天上海天气怎么样"))
```

```python
[{'url': 'http://sh.cma.gov.cn/sh/tqyb/jrtq/', 'content': '上海今天气温度30℃～38℃，偏南风风力4-5级，有多云和雷阵雨的可能。生活气象指数显示，气温高，人体感觉不舒适，不适宜户外活动。'}]
```

### 2. Retriever

Retriever 是 langchain 库中的一个模块，用于检索工具。检索工具的主要用途是从大型文本集合或知识库中找到相关信息。它们通常用于问答系统、对话代理和其他需要从大量文本数据中提取信息的应用程序。

我们还将在自己的一些数据上创建一个 Retriever。有关每个步骤的更深入解释，请参阅此教程。

```python
#示例：tools_retriever.pyfrom langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
loader = WebBaseLoader("https://zh.wikipedia.org/wiki/%E7%8C%AB")
docs = loader.load()
documents = RecursiveCharacterTextSplitter(#chunk_size 参数在 RecursiveCharacterTextSplitter 中用于指定每个文档块的最大字符数。它的作用主要有以下几个方面：#chunk_overlap 参数用于指定每个文档块之间的重叠字符数。这意味着，当文档被拆分成较小的块时，每个块的末尾部分会与下一个块的开头部分有一定数量的重叠字符。#第一个块包含字符 1 到 1000。第二个块包含字符 801 到 1800。第三个块包含字符 1601 到 2600。
    chunk_size=1000, chunk_overlap=200
).split_documents(docs)
vector = FAISS.from_documents(documents, OpenAIEmbeddings())
retriever = vector.as_retriever()
```

```python
retriever.invoke("猫的特征")[0]
```

```python
page_content='聽覺[编辑]
貓每隻耳各有32條獨立的肌肉控制耳殼轉動，因此雙耳可單獨朝向不同的音源轉動，使其向獵物移動時仍能對周遭其他音源保持直接接觸。[50] 除了蘇格蘭折耳貓這類基因突變的貓以外，貓極少有狗常見的「垂耳」，多數的貓耳向上直立。當貓忿怒或受驚時，耳朵會貼向後方，並發出咆哮與「嘶」聲。
貓與人類對低頻聲音靈敏度相若。人類中只有極少數的調音師能聽到20 kHz以上的高頻聲音（8.4度的八度音），貓則可達64kHz（10度的八度音），比人類要高1.6個八度音，甚至比狗要高1個八度；但是貓辨別音差須開最少5度，比起人類辨別音差須開最少0.5度來得粗疏。[51][47]
嗅覺[编辑]
家貓的嗅覺較人類靈敏14倍。[52]貓的鼻腔內有2億個嗅覺受器，數量甚至超過某些品種的狗（狗嗅覺細胞約1.25億～2.2億）。
味覺[编辑]
貓早期演化時由於基因突變，失去了甜的味覺，[53]但貓不光能感知酸、苦、鹹味，选择适合自己口味的食物，还能尝出水的味道，这一点是其他动物所不及的。不过总括来说猫的味觉不算完善，相比一般人類平均有9000個味蕾，貓一般平均僅有473個味蕾且不喜好低於室溫之食物。故此，貓辨認食物乃憑嗅覺多於味覺。[47]
觸覺[编辑]
貓在磨蹭時身上會散發出特別的費洛蒙，當這些獨有的費洛蒙留下時，目的就是在宣誓主權，提醒其它貓這是我的，其實這種行為算是一種標記地盤的象徵，會讓牠們有感到安心及安全感。
被毛[编辑]
主条目：貓的毛色遺傳和顏色
長度[编辑]
貓主要可以依據被毛長度分為長毛貓，短毛貓和無毛貓。' metadata={'source': 'https://zh.wikipedia.org/wiki/%E7%8C%AB', 'title': '猫 - 维基百科，自由的百科全书', 'language': 'zh'}
```

现在，我们已经填充了我们将要进行Retriever的索引，我们可以轻松地将其转换为一个工具（代理程序正确使用所需的格式）。

```python
from langchain.tools.retriever import create_retriever_tool
```

```python
retriever_tool = create_retriever_tool(
    retriever,"wiki_search","搜索维基百科",
)
```

### 3. 工具

既然我们都创建好了，我们可以创建一个工具列表，以便在下游使用。

```python
tools = [search, retriever_tool]
```



## 四、使用语言模型

接下来，让我们学习如何使用语言模型来调用工具。LangChain 支持许多可以互换使用的不同语言模型 - 选择您想要使用的语言模型！

```python
from langchain_openai import ChatOpenAI
model = ChatOpenAI(model="gpt-4")
```

您可以通过传入消息列表来调用语言模型。默认情况下，响应是一个 `content` 字符串。

```python
from langchain_core.messages import HumanMessage
response = model.invoke([HumanMessage(content="hi!")])
response.content
```

```plain&#x20;text
'Hello! How can I assist you today?'
```

现在，我们可以看看如何使这个模型能够调用工具。为了使其具备这种能力，我们使用 `.bind_tools` 来让语言模型了解这些工具。

```python
model_with_tools = model.bind_tools(tools)
```

现在我们可以调用模型了。让我们首先用一个普通的消息来调用它，看看它的响应。我们可以查看 `content` 字段和 `tool_calls` 字段。

```python
response = model_with_tools.invoke([HumanMessage(content="你好")])
print(f"ContentString: {response.content}")
print(f"ToolCalls: {response.tool_calls}")
```

```plain&#x20;text
ContentString: 你好！有什么可以帮助你的吗？
ToolCalls: []
```

现在，让我们尝试使用一些期望调用工具的输入来调用它。

```python
response = model_with_tools.invoke([HumanMessage(content="今天上海天气怎么样")])
print(f"ContentString: {response.content}")
print(f"ToolCalls: {response.tool_calls}")
```

```plain&#x20;text
ContentString: 
ToolCalls: [{'name': 'tavily_search_results_json', 'args': {'query': '今天上海天气'}, 'id': 'call_EOxYscVIVjttlbztWoR1CvTm', 'type': 'tool_call'}]
```

我们可以看到现在没有内容，但有一个工具调用！它要求我们调用 Tavily Search 工具。

这并不是在调用该工具 - 它只是告诉我们要调用。为了实际调用它，我们将创建我们的代理程序。



## 五、创建代理程序

既然我们已经定义了工具和 LLM，我们可以创建代理程序。我们将使用一个工具调用代理程序 - 有关此类代理程序以及其他选项的更多信息，请参阅[此指南](http://www.aidoczh.com/langchain/v0.2/docs/concepts/#agent_types/)。

我们可以首先选择要用来指导代理程序的提示。

如果您想查看此提示的内容并访问LangSmith，您可以转到：

<https://smith.langchain.com/hub/hwchase17/openai-functions-agent>

```python
#示例：agent_tools_create.py
from langchain import hub
# 获取要使用的提示 - 您可以修改这个！
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```

```python
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')), MessagesPlaceholder(variable_name='chat_history', optional=True), HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')), MessagesPlaceholder(variable_name='agent_scratchpad')]
```

现在，我们可以使用 LLM、提示和工具初始化代理。代理负责接收输入并决定采取什么行动。关键的是，代理不执行这些操作 - 这是由 AgentExecutor（下一步）完成的。

请注意，我们传递的是 `model`，而不是 `model_with_tools`。这是因为 `create_tool_calling_agent` 会在幕后调用 `.bind_tools`。

```python
from langchain.agents import create_tool_calling_agent
agent = create_tool_calling_agent(model, tools, prompt)
```

最后，我们将代理（大脑）与 AgentExecutor 中的工具结合起来（AgentExecutor 将重复调用代理并执行工具）。

```python
from langchain.agents import AgentExecutor
agent_executor = AgentExecutor(agent=agent, tools=tools)
```



## 六、运行代理

现在，我们可以在几个查询上运行代理！请注意，目前这些都是**无状态**查询（它不会记住先前的交互）。

首先，让我们看看当不需要调用工具时它如何回应：

```python
#示例：agent_tools_run.pyprint(agent_executor.invoke({"input": "你好"}))
```

```plain&#x20;text
{'input': '你好', 'output': '你好！有什么我可以帮助你的吗？'}
```

为了确切了解底层发生了什么（并确保它没有调用工具），我们可以查看 [LangSmith](https://smith.langchain.com/public/8441812b-94ce-4832-93ec-e1114214553a/r) 跟踪。

现在让我们尝试一个应该调用检索器的示例：&#x20;

```python
print(agent_executor.invoke({"input": "猫的特征"}))
```

```plain&#x20;text
{'input': '猫的特征', 'output': '猫有许多显著的特征，包括以下几点：\n\n**听觉**：猫每只耳朵都有32条独立的肌肉控制耳壳转动。它们可以单独朝向不同的音源转动，使得在向猎物移动时仍能对周围其他音源保持直接接触。猫的听觉比人类和狗更敏锐，能听到更高的频率。\n\n**嗅觉**：家猫的嗅觉比人类灵敏14倍，鼻腔内有2亿个嗅觉受器，数量甚至超过某些品种的狗。\n\n**味觉**：由于早期的演化，猫失去了甜的味觉，但它们能感知酸、苦、咸味，并选择适合自己口味的食物。不过总的来说，猫的味觉并不算完善，相比一般人类平均有9000个味蕾，猫一般平均只有473个味蕾，且不喜欢低于室温的食物。\n\n**触觉**：猫在磨蹭时身上会散发出特别的费洛蒙，当这些独有的费洛蒙留下时，目的就是在宣誓主权，提醒其他猫这是我的。\n\n**被毛**：猫的被毛长度可以根据成为长毛猫，短毛猫和无毛猫。\n\n**视觉**：猫的夜视能力和追踪视觉活动物体相当出色，夜视能力是人类的六倍。猫的眼睛具有微光观察能力，即使只有微弱的月光也能分辨物体。\n\n**骨骼**：猫的骨骼共有230块，其中脊椎骨占了30块。\n\n**爪子**：猫的爪子尖锐且具有伸缩作用，能向外张开或向内收缩藏起来。\n\n**地域性攻击**：猫是很有地域性的动物，会在自己的地盤留下气味，利用下巴、耳朵及尾部的皮脂腺磨蹭物体以标记领地。\n\n**与狗的关系**：一般认为猫和狗互相厌恶，但经过训练和适应，猫和狗可能理解同一种“语言”并和睦相处。\n\n以上是猫的一些主要特征，但每只猫都有其个性和独特之处。'}
```

让我们查看 LangSmith 跟踪以确保它实际上在调用该工具。

现在让我们尝试一个需要调用搜索工具的示例：

```python
print(agent_executor.invoke({"input": "今天上海天气怎么样"}))
```

```plain&#x20;text
{'input': '今天上海天气怎么样', 'output': '很抱歉，我无法获取实时的天气信息。你可以访问上海市气象局的网站这里来查询今天的气象状况、预警信息、生活指数等。同时，该网站还提供了未来几天的天气趋势和空气质量状况，以及气象科普、气象视频、气候变化等其他相关服务和信息。'}
```



## 七、添加记忆

如前所述，此代理是无状态的。这意味着它不会记住先前的交互。要给它记忆，我们需要传递先前的 `chat_history`。注意：由于我们使用的提示，它需要被称为 `chat_history`。如果我们使用不同的提示，我们可以更改变量名

```python
# 示例：agent_tools_memory.py
# 这里我们为chat_history传入了一个空消息列表，因为这是对话中的第一条消息
agent_executor.invoke({"input": "hi! my name is bob", "chat_history": []})
```

```plain&#x20;text
{'input': '你好，我的名字是Cyber', 'chat_history': [], 'output': '你好，Cyber，很高兴见到你！有什么我可以帮助你的吗？'}
```

```python
from langchain_core.messages import AIMessage, HumanMessage
```

```python
agent_executor.invoke(
    {"chat_history": [
            HumanMessage(content="hi! my name is bob"),
            AIMessage(content="你好Bob！我今天能帮你什么？"),
        ],"input": "我的名字是什么?",
    }
)
```

如果我们想要自动跟踪这些消息，我们可以将其包装在一个 RunnableWithMessageHistory 中。

```python
# 示例：agent_tools_memory_store.py
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]
```

因为我们有多个输入，我们需要指定两个事项：

* `input_messages_key`：用于将输入添加到对话历史记录中的键。

* `history_messages_key`：用于将加载的消息添加到其中的键。

```python
agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

```python
response = agent_with_chat_history.invoke(
    {"input": "Hi，我的名字是Cyber"},
    config={"configurable": {"session_id": "123"}},
)
```

```plain&#x20;text
{'input': 'Hi，我的名字是Cyber', 'chat_history': [], 'output': '你好，Cyber！很高兴认识你。有什么我可以帮助你的吗？'}
```

```python
response = agent_with_chat_history.invoke(
    {"input": "我叫什么名字?"},
    config={"configurable": {"session_id": "123"}},
)
```

```plain&#x20;text
{'input': '我叫什么名字?', 'chat_history': [HumanMessage(content='Hi，我的名字是Cyber'), AIMessage(content='你好，Cyber！很高兴认识你。有什么我可以帮助你的吗？')], 'output': '你的名字是Cyber。'}
```

LangSmith 示例跟踪：<https://smith.langchain.com/public/98c8d162-60ae-4493-aa9f-992d87bd0429/r>
