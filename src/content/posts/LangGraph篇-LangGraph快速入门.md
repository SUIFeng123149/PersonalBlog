---
title: "LangGraph篇-LangGraph快速入门"
published: 2026-07-29
description: "LangGraph原理 🦜🕸️LangGraph ⚡ 以图的方式构建语言代理 ⚡ 官方文档地址：<https://langchain ai.github.io/langgraph/ LangGraph 是一个用于构建具有 LLMs 的有状态、多角色应用程序的库，用于创建代理和多代理工作流。与其他 LLM 框架相比，它提供了以下核心优势：循环、可控性和持久性。 LangGraph 允许您定义涉及"
image: ""
tags: ["LangGraph"]
category: "LangGraph"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
## **LangGraph原理**

🦜🕸️LangGraph ⚡ 以图的方式构建语言代理 ⚡

官方文档地址：<https://langchain-ai.github.io/langgraph/>

LangGraph 是一个用于构建具有 LLMs 的有状态、多角色应用程序的库，用于创建代理和多代理工作流。与其他 LLM 框架相比，它提供了以下核心优势：循环、可控性和持久性。

LangGraph 允许您定义涉及循环的流程，这对于大多数代理架构至关重要。作为一种非常底层的框架，它提供了对应用程序的流程和状态的精细控制，这对创建可靠的代理至关重要。此外，LangGraph 包含内置的持久性，可以实现高级的“人机交互”和内存功能。

LangGraph 是 LangChain 的高级库，为大型语言模型（LLM）带来循环[计算能力](https://so.csdn.net/so/search?q=%E8%AE%A1%E7%AE%97%E8%83%BD%E5%8A%9B\&spm=1001.2101.3001.7020)。它超越了 LangChain 的线性工作流，通过循环支持复杂的任务处理。

* **状态**：维护计算过程中的上下文，实现基于累积数据的动态决策。

* **节点**：代表计算步骤，执行特定任务，可定制以适应不同工作流。

* **边**：连接节点，定义计算流程，支持条件逻辑，实现复杂工作流

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/LangGraph%E7%AF%87-LangGraph%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8_assets/LangGraph%E7%AF%87-LangGraph%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8-IaTVb1UZjoUuILxXZ0CcRRcKnIr.jpg)

## **langgraph主要功能**

* **循环和分支**：在您的应用程序中实现循环和条件语句。

* **持久性**：在图中的每个步骤之后自动保存状态。在任何时候暂停和恢复图执行以支持错误恢复、“人机交互”工作流、时间旅行等等。

* **“人机交互”**：中断图执行以批准或编辑代理计划的下一个动作。

* **流支持**：在每个节点产生输出时流式传输输出（包括令牌流式传输）。

* **与 LangChain 集成**：LangGraph 与 [LangChain](https://github.com/langchain-ai/langchain/) 和 [LangSmith](https://docs.smith.langchain.com/) 无缝集成（但不需要它们）。

## **langgraph代码初认识**

### 安装langgraph库

```txt
pip install -U langgraph
```

### **示例代码**

LangGraph 的一个核心概念是状态。每次图执行都会创建一个状态，该状态在图中的节点执行时传递，每个节点在执行后使用其返回值更新此内部状态。图更新其内部状态的方式由所选图类型或自定义函数定义。

让我们看一个可以使用搜索工具的简单代理示例。

```python
pip install langchain-openai
```

```txt
setx OPENAI_BASE_URL "https://api.openai.com/v1"
setx OPENAI_API_KEY "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

可以选择设置 [LangSmith](https://docs.smith.langchain.com/) 以实现最佳的可观察性。

```txt
setx LANGSMITH_TRACING "true"
setx LANGSMITH_API_KEY "xxxxxxxxxxxxxxxx"
```

```python
#示例：langgraph_hello.py
from typing import Literal
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
# pip install langgraph
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph, MessagesState
from langgraph.prebuilt import ToolNode

# 定义工具函数，用于代理调用外部工具
@tool
def search(query: str):
    """模拟一个搜索工具"""
    if "上海" in query.lower() or "Shanghai" in query.lower():
        return "现在30度，有雾."
    return "现在是35度，阳光明媚。"


# 将工具函数放入工具列表
tools = [search]

# 创建工具节点
tool_node = ToolNode(tools)

# 1.初始化模型和工具，定义并绑定工具到模型
model = ChatOpenAI(model="gpt-4o", temperature=0).bind_tools(tools)

# 定义函数，决定是否继续执行
def should_continue(state: MessagesState) -> Literal["tools", END]:
    messages = state['messages']
    last_message = messages[-1]
    # 如果LLM调用了工具，则转到“tools”节点
    if last_message.tool_calls:
        return "tools"
    # 否则，停止（回复用户）
    return END


# 定义调用模型的函数
def call_model(state: MessagesState):
    messages = state['messages']
    response = model.invoke(messages)
    # 返回列表，因为这将被添加到现有列表中
    return {"messages": [response]}

# 2.用状态初始化图，定义一个新的状态图
workflow = StateGraph(MessagesState)
# 3.定义图节点，定义我们将循环的两个节点
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

# 4.定义入口点和图边
# 设置入口点为“agent”
# 这意味着这是第一个被调用的节点
workflow.set_entry_point("agent")

# 添加条件边
workflow.add_conditional_edges(
    # 首先，定义起始节点。我们使用`agent`。
    # 这意味着这些边是在调用`agent`节点后采取的。
    "agent",
    # 接下来，传递决定下一个调用节点的函数。
    should_continue,
)

# 添加从`tools`到`agent`的普通边。
# 这意味着在调用`tools`后，接下来调用`agent`节点。
workflow.add_edge("tools", 'agent')

# 初始化内存以在图运行之间持久化状态
checkpointer = MemorySaver()

# 5.编译图
# 这将其编译成一个LangChain可运行对象，
# 这意味着你可以像使用其他可运行对象一样使用它。
# 注意，我们（可选地）在编译图时传递内存
app = workflow.compile(checkpointer=checkpointer)

# 6.执行图，使用可运行对象
final_state = app.invoke(
    {"messages": [HumanMessage(content="上海的天气怎么样?")]},
    config={"configurable": {"thread_id": 42}}
)
# 从 final_state 中获取最后一条消息的内容
result = final_state["messages"][-1].content
print(result)
final_state = app.invoke(
    {"messages": [HumanMessage(content="我问的那个城市?")]},
    config={"configurable": {"thread_id": 42}}
)
result = final_state["messages"][-1].content
print(result)
```

```txt
上海现在的天气是30度，有雾。
```

现在，当我们传递相同的 `"thread_id"` 时，对话上下文将通过保存的状态（即存储的消息列表）保留下来。

```python
final_state = app.invoke(
    {"messages": [HumanMessage(content="我问的那个城市?")]},
    config={"configurable": {"thread_id": 42}}
)
result = final_state["messages"][-1].content
print(result)
```

```txt
你问的是上海的天气。上海现在的天气是30度，有雾。
```

### **代码逐步分解**

#### **初始化模型和工具**

* 我们使用&#x20;
  `ChatOpenAI
  ` 作为我们的 LLM。\*\*注意：\*\*我们需要确保模型知道可以使用哪些工具。我们可以通过将 LangChain 工具转换为 OpenAI 工具调用格式来完成此操作，方法是使用&#x20;
  `.bind_tools()
  ` 方法。
  我们定义要使用的工具——在本例中是搜索工具。创建自己的工具非常容易——请参阅此处的文档了解如何操作 [此处](http://python.langchain.ac.cn/docs/modules/agents/tools/custom_tools)。

#### **用状态初始化图**

* 我们通过传递状态模式（在本例中为&#x20;
  `MessagesState
  `）来初始化图（
  `StateGraph
  `）。
  `MessagesState` 是一个预构建的状态模式，它具有一个属性，一个 LangChain `Message` 对象列表，以及将每个节点的更新合并到状态中的逻辑。

#### **定义图节点**

我们需要两个主要节点

* `agent
  ` 节点：负责决定采取什么（如果有）行动。
  调用工具的 `tools` 节点：如果代理决定采取行动，此节点将执行该行动。

#### **定义入口点和图边**

首先，我们需要设置图执行的入口点——`agent` 节点。

然后，我们定义一个普通边和一个条件边。条件边意味着目的地取决于图状态（`MessageState`）的内容。在本例中，目的地在代理（LLM）决定之前是未知的。

* 条件边：调用代理后，我们应该要么
  普通边：调用工具后，图应该始终返回到代理以决定下一步操作。

#### **编译图**

* 当我们编译图时，我们将其转换为 LangChain Runnable，这会自动启用使用您的输入调用&#x20;
  `.invoke()
  `、
  `.stream()
  ` 和&#x20;
  `.batch()
  `。
  我们还可以选择传递检查点对象以在图运行之间持久化状态，并启用内存、“人机交互”工作流、时间旅行等等。在本例中，我们使用 `MemorySaver`——一个简单的内存中检查点。

#### **执行图**

1. LangGraph 将输入消息添加到内部状态，然后将状态传递给入口点节点&#x20;
   `"agent"
   `。
   `"agent"
   ` 节点执行，调用聊天模型。
   聊天模型返回&#x20;
   `AIMessage
   `。LangGraph 将其添加到状态中。
   图循环以下步骤，直到&#x20;
   `AIMessage
   ` 上不再有&#x20;
   `tool_calls
   `。
   执行进度到特殊的 `END` 值，并输出最终状态。因此，我们得到所有聊天消息的列表作为输出。

