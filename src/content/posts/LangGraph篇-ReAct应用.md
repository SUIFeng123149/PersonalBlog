---
title: "LangGraph篇-ReAct应用"
published: 2026-07-29
description: "ReAct 官方文档地址：<https://langchain ai.github.io/langgraph/how tos/ prebuilt react agent 中文文档地址：<https://www.aidoczh.com/langgraph/how tos/ react 在本操作指南中，我们将创建一个简单的 代理应用程序，该应用程序可以检查天气。该应用程序由一个代理（LLM）和工具组成"
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
## **ReAct**

官方文档地址：<https://langchain-ai.github.io/langgraph/how-tos/#prebuilt-react-agent>

中文文档地址：<https://www.aidoczh.com/langgraph/how-tos/#react>

在本操作指南中，我们将创建一个简单的 [ReAct](https://arxiv.org/abs/2210.03629) 代理应用程序，该应用程序可以检查天气。该应用程序由一个代理（LLM）和工具组成。当我们与应用程序交互时，我们将首先调用代理（LLM）来决定是否应该使用工具。然后我们将运行一个循环

1. 如果代理说要采取行动（即调用工具），我们将运行工具并将结果传递回代理

2. 如果代理没有要求运行工具，我们将结束（响应用户）

**预构建的代理**

请注意，这里我们将使用预构建的代理。LangGraph 的一大优势是你可以轻松创建自己的代理架构。因此，虽然从这里开始快速构建代理是不错的选择，但我们强烈建议你学习如何构建自己的代理，这样你就可以充分利用 LangGraph。

### **设置**

```txt
pip install -U langgraph langchain-openai
```

### **代码**

```python
#示例：create_react_agent.py
# 首先我们初始化我们想要使用的模型。
from langchain_openai import ChatOpenAI

# 使用 gpt-4o 模型，设定温度为 0（温度控制生成内容的随机性，0 表示确定性输出）
model = ChatOpenAI(model="gpt-4o", temperature=0)

# 对于本教程，我们将使用一个自定义工具，该工具返回两个城市（纽约和旧金山）的预定义天气值
from typing import Literal
from langchain_core.tools import tool


# 定义一个工具函数 get_weather，它根据城市名称返回预定义的天气信息
@tool
def get_weather(city: Literal["nyc", "sf"]):
    """Use this to get weather information."""
    if city == "nyc":
        return "It might be cloudy in nyc"
    elif city == "sf":
        return "It's always sunny in sf"
    else:
        raise AssertionError("Unknown city")


# 将工具放入一个列表中
tools = [get_weather]

# 导入 create_react_agent 函数，用于创建 REACT 代理
from langgraph.prebuilt import create_react_agent

# 使用指定的模型和工具创建 REACT 代理
graph = create_react_agent(model, tools=tools)
```

### **使用**

首先，让我们可视化刚刚创建的图

```python
# 将生成的图片保存到文件
graph_png = graph.get_graph().draw_mermaid_png()
with open("create_react_agent.png", "wb") as f:
    f.write(graph_png)
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/LangGraph%E7%AF%87-ReAct%E5%BA%94%E7%94%A8_assets/LangGraph%E7%AF%87-ReAct%E5%BA%94%E7%94%A8-UW4LbYKvoouA07xbr0ScyOuhnPs.jpg)

```python
# 定义一个函数用于打印流数据
def print_stream(stream):
    for s in stream:
        message = s["messages"][-1]
        if isinstance(message, tuple):
            print(message)
        else:
            message.pretty_print()
```

让我们使用需要工具调用的输入运行应用程序

```python
# 使用需要工具调用的输入运行应用程序
inputs = {"messages": [("user", "what is the weather in sf")]}
print_stream(graph.stream(inputs, stream_mode="values"))
```

```python
================================ Human Message =================================

what is the weather in sf
================================== Ai Message ==================================
Tool Calls:
get_weather (call_jgO5OOUnugRkhRi3wAOHl8Et)
Call ID: call_jgO5OOUnugRkhRi3wAOHl8Et
Args:
city: sf
================================= Tool Message =================================
Name: get_weather

It's always sunny in sf
================================== Ai Message ==================================

The weather in San Francisco is currently sunny.
```

现在让我们尝试一个不需要工具的问题

```python
# 尝试一个不需要工具的问题
inputs = {"messages": [("user", "who built you?")]}
print_stream(graph.stream(inputs, stream_mode="values"))
```

```python
================================ Human Message =================================

who built you?
================================== Ai Message ==================================

I was created by OpenAI, a research organization focused on developing and advancing artificial intelligence technology.
```

## **向 ReAct 代理添加记忆**

本教程将展示如何向预构建的 ReAct 代理添加内存。 请查看 [本教程](https://github.langchain.ac.cn/langgraph/how-tos/create-react-agent/) 了解如何开始使用预构建的 ReAct 代理

要启用内存，我们只需要将 checkpointer 传递给 `create_react_agents`

### **设置**

```txt
pip install -U langgraph langchain-openai
```

### **代码**

```python
#示例：create_react_agent_memory.py
# 首先我们初始化我们想要使用的模型。
from langchain_openai import ChatOpenAI
# 使用 gpt-4o 模型，设定温度为 0（温度控制生成内容的随机性，0 表示确定性输出）
model = ChatOpenAI(model="gpt-4o", temperature=0)
# 对于本教程，我们将使用一个自定义工具，该工具返回两个城市（纽约和旧金山）的预定义天气值
from typing import Literal
# 从 langchain_core.tools 导入 tool 装饰器
from langchain_core.tools import tool


# 定义一个工具函数 get_weather，它根据城市名称返回预定义的天气信息
@tool
def get_weather(city: Literal["nyc", "sf"]):
    """Use this to get weather information."""
    if city == "nyc":
        return "It might be cloudy in nyc"
    elif city == "sf":
        return "It's always sunny in sf"
    else:
        raise AssertionError("Unknown city")


# 将工具放入一个列表中
tools = [get_weather]

# 我们可以使用 LangGraph 的检查点器添加“聊天记忆”到图中，以保留交互之间的聊天上下文
from langgraph.checkpoint.memory import MemorySaver

# 初始化 MemorySaver 实例
memory = MemorySaver()

# 定义图
from langgraph.prebuilt import create_react_agent

# 使用指定的模型、工具和检查点器创建 REACT 代理
graph = create_react_agent(model, tools=tools, checkpointer=memory)
```

### **用法**

让我们与它进行多次交互，以表明它可以记住

```python
# 定义一个函数用于打印流数据
def print_stream(stream):
    for s in stream:
        message = s["messages"][-1]
        if isinstance(message, tuple):
            print(message)
        else:
            message.pretty_print()
```

```python
# 配置参数
config = {"configurable": {"thread_id": "1"}}
# 输入参数，包含用户消息
inputs = {"messages": [("user", "What's the weather in NYC?")]}
# 打印流输出
print_stream(graph.stream(inputs, config=config, stream_mode="values"))
```

```python
================================ Human Message =================================

What's the weather in NYC?
================================== Ai Message ==================================
Tool Calls:
get_weather (call_mdovy4yXSSYrmSlnlVSUacVn)
Call ID: call_mdovy4yXSSYrmSlnlVSUacVn
Args:
city: nyc
================================= Tool Message =================================
Name: get_weather

It might be cloudy in nyc
================================== Ai Message ==================================

The weather in NYC might be cloudy.
```

请注意，当我们传递相同的线程 ID 时，聊天历史记录会保留

```python
# 再次输入参数，包含用户消息
inputs = {"messages": [("user", "What's it known for?")]}
# 打印流输出
print_stream(graph.stream(inputs, config=config, stream_mode="values"))
```

```python
================================ Human Message =================================

What's it known for?
================================== Ai Message ==================================

New York City (NYC) is known for many things, including:

1. **Landmarks and Attractions**: The Statue of Liberty, Times Square, Central Park, Empire State Building, and Brooklyn Bridge.
2. **Cultural Institutions**: Broadway theaters, Metropolitan Museum of Art, Museum of Modern Art (MoMA), and the American Museum of Natural History.
3. **Diverse Neighborhoods**: Areas like Chinatown, Little Italy, Harlem, and Greenwich Village.
4. **Financial Hub**: Wall Street and the New York Stock Exchange.
5. **Cuisine**: A melting pot of global cuisines, famous for its pizza, bagels, and street food.
6. **Media and Entertainment**: Home to major media companies, TV networks, and film studios.
    7. **Fashion**: A global fashion capital, hosting New York Fashion Week.
8. **Sports**: Teams like the New York Yankees, New York Mets, New York Knicks, and New York Rangers.
9. **Public Transportation**: An extensive subway system and iconic yellow taxis.
10. **Events**: New Year's Eve celebration in Times Square, Macy's Thanksgiving Day Parade, and various cultural festivals.
```

## **向 ReAct 代理添加系统提示**

本教程将展示如何向预构建的 ReAct 代理添加自定义系统提示。 请查看[本教程](https://github.langchain.ac.cn/langgraph/how-tos/create-react-agent/)，了解如何开始使用预构建的 ReAct 代理

您可以通过将字符串传递给`state_modifier`参数来添加自定义系统提示。

### **设置**

```txt
pip install -U langgraph langchain-openai
```

### **代码**

```python
#示例：create_react_agent_system_prompt.py
# 首先我们初始化我们想要使用的模型。
from langchain_openai import ChatOpenAI
# 使用 gpt-4o 模型，设定温度为 0（温度控制生成内容的随机性，0 表示确定性输出）
model = ChatOpenAI(model="gpt-4o", temperature=0)
# 对于本教程，我们将使用一个自定义工具，该工具返回两个城市（纽约和旧金山）的预定义天气值
from typing import Literal
# 从 langchain_core.tools 导入 tool 装饰器
from langchain_core.tools import tool


# 定义一个工具函数 get_weather，它根据城市名称返回预定义的天气信息
@tool
def get_weather(city: Literal["nyc", "sf"]):
    """Use this to get weather information."""
    if city == "nyc":
        return "It might be cloudy in nyc"
    elif city == "sf":
        return "It's always sunny in sf"
    else:
        raise AssertionError("Unknown city")


# 将工具放入一个列表中
tools = [get_weather]

# 我们可以在这里添加系统提示
prompt = "Respond in Chinese"

# 定义图
from langgraph.prebuilt import create_react_agent

# 使用指定的模型、工具和状态修改器（系统提示）创建 REACT 代理
graph = create_react_agent(model, tools=tools, state_modifier=prompt)
```

### **使用**

```python
# 定义一个函数用于打印流数据
def print_stream(stream):
    for s in stream:
        message = s["messages"][-1]
        if isinstance(message, tuple):
            print(message)
        else:
            message.pretty_print()
```

```python
# 输入参数，包含用户消息
inputs = {"messages": [("user", "What's the weather in NYC?")]}
# 打印流输出
print_stream(graph.stream(inputs, stream_mode="values"))
```

```python
================================ Human Message =================================

What's the weather in NYC?
================================== Ai Message ==================================
Tool Calls:
get_weather (call_b02uzBRrIm2uciJa8zDXCDxT)
Call ID: call_b02uzBRrIm2uciJa8zDXCDxT
Args:
city: nyc
================================= Tool Message =================================
Name: get_weather

It might be cloudy in nyc
================================== Ai Message ==================================

A New York potrebbe essere nuvoloso.
```

## **向 ReAct 代理添加人机交互**

本教程将演示如何向预构建的 ReAct 代理添加人机交互环过程。有关如何开始使用预构建的 ReAct 代理，请参阅[本教程](https://github.langchain.ac.cn/langgraph/how-tos/create-react-agent/)

通过将`interrupt_before=["tools"]`传递给`create_react_agent`，可以在调用工具之前添加断点。请注意，您需要使用检查点才能使其正常工作。

### **设置**

```txt
pip install -U langgraph langchain-openai
```

### **代码**

```python
#示例：create_react_agent-hitl.py
# 首先我们初始化我们想要使用的模型。
from langchain_openai import ChatOpenAI

# 使用 gpt-4o 模型，设定温度为 0（温度控制生成内容的随机性，0 表示确定性输出）
model = ChatOpenAI(model="gpt-4o", temperature=0)

# 对于本教程，我们将使用一个自定义工具，该工具返回两个城市（纽约和旧金山）的预定义天气值
from typing import Literal

# 从 langchain_core.tools 导入 tool 装饰器
from langchain_core.tools import tool


# 定义一个工具函数 get_weather，它根据城市名称返回预定义的天气信息
@tool
def get_weather(city: Literal["nyc", "sf"]):
    """Use this to get weather information."""
    if city == "nyc":
        return "It might be cloudy in nyc"
    elif city == "sf":
        return "It's always sunny in sf"
    else:
        raise AssertionError("Unknown city")


# 将工具放入一个列表中
tools = [get_weather]

# 我们需要一个检查点器来启用人机交互模式
from langgraph.checkpoint.memory import MemorySaver

# 初始化 MemorySaver 实例
memory = MemorySaver()

# 定义图
from langgraph.prebuilt import create_react_agent

# 使用指定的模型、工具和检查点器创建 REACT 代理
graph = create_react_agent(
    model, tools=tools, interrupt_before=["tools"], checkpointer=memory
)
```

### **使用**

```python
# 定义一个函数用于打印流数据
def print_stream(stream):
    for s in stream:
        message = s["messages"][-1]
        if isinstance(message, tuple):
            print(message)
        else:
            message.pretty_print()
```

```python
# 配置参数
config = {"configurable": {"thread_id": "42"}}
# 输入参数，包含用户消息
inputs = {"messages": [("user", "What's the weather in SF?")]}

# 打印流输出
print_stream(graph.stream(inputs, config, stream_mode="values"))
```

```python
================================ Human Message =================================

What's the weather in SF?
================================== Ai Message ==================================
Tool Calls:
get_weather (call_0OMmuTLec9t8kxMVkllZCSxo)
Call ID: call_0OMmuTLec9t8kxMVkllZCSxo
Args:
city: sf
```

```python
# 获取图的状态快照
snapshot = graph.get_state(config)
# 打印下一步信息
print("Next step: ", snapshot.next)
```

```python
Next step:  ('tools',)
```

```python
# 打印后续流输出
print_stream(graph.stream(None, config, stream_mode="values"))
```

```python
================================= Tool Message =================================
Name: get_weather

It's always sunny in sf
================================== Ai Message ==================================

The weather in San Francisco is sunny! 🌞
```


