---
title: "LangGraph篇-流式处理"
published: 2026-07-29
description: "对于增强基于 LLM 的应用响应性至关重要。通过逐步显示输出，即使在完整响应尚未准备好之前，流式处理显著改善用户体验（UX），尤其是在处理 LLM 的延迟时。 官方文档地址：<https://langchain ai.github.io/langgraph/how tos/ streaming 中文文档地址：<https://www.aidoczh.com/langgraph/how tos/ 3"
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
[流式处理](https://www.aidoczh.com/langgraph/concepts/streaming/) 对于增强基于 LLM 的应用响应性至关重要。通过逐步显示输出，即使在完整响应尚未准备好之前，流式处理显著改善用户体验（UX），尤其是在处理 LLM 的延迟时。

官方文档地址：<https://langchain-ai.github.io/langgraph/how-tos/#streaming>

中文文档地址：<https://www.aidoczh.com/langgraph/how-tos/#_3>

## **流式完整状态**

LangGraph 支持多种流式模式。主要的有

* `values`: 此流式模式流回图的值。这是每个节点调用后图的完整状态。

* `updates`: 此流式模式流回图的更新。这是每个节点调用后图状态的更新。

`stream_mode="values"`

* **行为**: 在 `values` 模式下，数据流会返回每个步骤的完整输出。这意味着每一次迭代都会得到一个完整的结果对象。

* **适用场景**: 适用于需要每一步的完整结果进行进一步处理的场景。

* **示例**: 如果你有一个复杂的计算过程，每一步都需要完整的上下文来进行下一步的计算，那么 `values` 模式是合适的选择。

`stream_mode="updates"`

* **行为**: `updates`模式下，数据流会返回每个步骤的增量更新。这意味着每一次迭代只会得到自上一次迭代以来的变化部分。

* **适用场景**: 适用于需要实时更新或增量更新的场景，比如实时显示处理进度或逐步输出的场景。

* **示例**: 如果你在构建一个实时聊天应用程序，需要逐步显示对话内容，那么 `updates` 模式是合适的选择。



### **设置**

在本指南中，我们将使用一个简单的 ReAct 代理。

```txt
pip install -U langgraph langchain-openai
```

```python
#示例：streaming_complete_state.py
# 导入异步IO模块
import asyncio
# 从类型提示模块中导入Literal
from typing import Literal
# 导入工具装饰器
from langchain_core.tools import tool
# 导入OpenAI聊天模型
from langchain_openai import ChatOpenAI
# 导入创建react代理的函数
from langgraph.prebuilt import create_react_agent


# 定义一个工具函数
@tool
# 定义一个获取天气的函数，参数city只能是"nyc"或"sf"
def get_weather(city: Literal["nyc", "sf"]):
    # 函数的文档字符串，描述函数用途
    """Use this to get weather information."""
    # 如果城市是纽约
    if city == "nyc":
        # 返回纽约的天气信息
        return "It might be cloudy in nyc"
    # 如果城市是旧金山
    elif city == "sf":
        # 返回旧金山的天气信息
        return "It's always sunny in sf"
    # 如果城市不是nyc或sf
    else:
        # 抛出一个断言错误
        raise AssertionError("Unknown city")


# 将get_weather函数放入工具列表
tools = [get_weather]

# 创建一个OpenAI聊天模型实例，使用gpt-4o模型，温度设为0
model = ChatOpenAI(model_name="gpt-4o", temperature=0)
# 使用模型和工具创建一个react代理
graph = create_react_agent(model, tools)
```

### **流值**

```python
# 定义输入消息，询问旧金山的天气
inputs = {"messages": [("human", "what's the weather in sf")]}
# 异步迭代代理的输出流，模式为"values"
async for chunk in graph.astream(inputs, stream_mode="values"):
    # 打印最后一条消息的格式化内容
    chunk["messages"][-1].pretty_print()
```

```python
================================ Human Message =================================
what's the weather in sf
================================== Ai Message ==================================
Tool Calls:
get_weather (call_61VvIzqVGtyxcXi0z6knZkjZ)
Call ID: call_61VvIzqVGtyxcXi0z6knZkjZ
Args:
city: sf
================================= Tool Message =================================
Name: get_weather

It's always sunny in sf
================================== Ai Message ==================================

The weather in San Francisco is currently sunny.
```

如果我们只想获取最终结果，我们可以使用相同的方法，并跟踪我们收到的最后一个值

```python
# 再次定义输入消息，询问旧金山的天气
inputs = {"messages": [("human", "what's the weather in sf")]}
# 异步迭代代理的输出流，模式为"values"
async for chunk in graph.astream(inputs, stream_mode="values"):
    # 将最后一个chunk赋值给final_result
    final_result = chunk
```

```python
final_result
```

```python
{'messages': [HumanMessage(content="what's the weather in sf", id='54b39b6f-054b-4306-980b-86905e48a6bc'),
              AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_avoKnK8reERzTUSxrN9cgFxY', 'function': {'arguments': '{"city":"sf"}', 'name': 'get_weather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 57, 'total_tokens': 71}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_5e6c71d4a8', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-f2f43c89-2c96-45f4-975c-2d0f22d0d2d1-0', tool_calls=[{'name': 'get_weather', 'args': {'city': 'sf'}, 'id': 'call_avoKnK8reERzTUSxrN9cgFxY'}], usage_metadata={'input_tokens': 57, 'output_tokens': 14, 'total_tokens': 71}),
              ToolMessage(content="It's always sunny in sf", name='get_weather', id='fc18a798-c7b2-4f73-84fa-8ffdffb6ddcb', tool_call_id='call_avoKnK8reERzTUSxrN9cgFxY'),
              AIMessage(content='The weather in San Francisco is currently sunny. Enjoy the sunshine!', response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 84, 'total_tokens': 98}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_5e6c71d4a8', 'finish_reason': 'stop', 'logprobs': None}, id='run-21418147-da8e-4738-a076-239377397c40-0', usage_metadata={'input_tokens': 84, 'output_tokens': 14, 'total_tokens': 98})]}
```

```python
# 打印final_result中最后一条消息的格式化内容
print(final_result["messages"][-1].pretty_print())
```

```python
================================== Ai Message ==================================

The weather in San Francisco is currently sunny. Enjoy the sunshine!
```

## **流式状态更新**

LangGraph 支持多种流式模式。主要的有

* `values`: 此流式模式会将图的值流式传输回来。这是每个节点被调用后图的完整状态。

* `updates`: 此流式模式会将图的更新流式传输回来。这是每个节点被调用后图状态的更新。

本指南涵盖 `stream_mode="updates"`。

### **设置**

在本指南中，我们将使用一个简单的 ReAct 代理。

```txt
%pip install -U langgraph langchain-openai
```

```python
#示例：streaming_updates.py
import asyncio
from typing import Literal
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent


# 定义一个工具函数，用于获取天气信息
@tool
def get_weather(city: Literal["nyc", "sf"]):
    """Use this to get weather information."""
    if city == "nyc":
        return "It might be cloudy in nyc"
    elif city == "sf":
        return "It's always sunny in sf"
    else:
        raise AssertionError("Unknown city")


# 创建一个包含工具函数的列表
tools = [get_weather]

# 初始化一个OpenAI的聊天模型，使用gpt-4o模型，温度设为0（生成结果更确定）
model = ChatOpenAI(model_name="gpt-4o", temperature=0)


# 定义一个异步主函数
async def main():
    # 创建一个反应式代理，使用聊天模型和工具
    graph = create_react_agent(model, tools)
    # 定义输入消息，包含一个人类的消息询问sf的天气
    inputs = {"messages": [("human", "what's the weather in sf")]}
    # 异步迭代获取代理的更新流
    async for chunk in graph.astream(inputs, stream_mode="updates"):
        # 遍历每个更新块中的节点和值
        for node, values in chunk.items():
            # 打印接收到更新的节点名称
            print(f"Receiving update from node: '{node}'")
            # 打印节点的值
            print(values)
            print()

# 运行异步函数
asyncio.run(main())
```

### **流更新**

```python
# 定义输入消息，包含一个人类的消息询问sf的天气
inputs = {"messages": [("human", "what's the weather in sf")]}
# 异步迭代获取代理的更新流
async for chunk in graph.astream(inputs, stream_mode="updates"):
    # 遍历每个更新块中的节点和值
    for node, values in chunk.items():
        # 打印接收到更新的节点名称
        print(f"Receiving update from node: '{node}'")
        # 打印节点的值
        print(values)
        print()
```

```python
Receiving update from node: 'agent'
{'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_YXpVnZfYSkoN24AKqS2ntXoJ', 'function': {'arguments': '{"city":"sf"}', 'name': 'get_weather'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 57, 'total_tokens': 71}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-a03f2f71-174f-435e-9866-0b0d72c06868-0', tool_calls=[{'name': 'get_weather', 'args': {'city': 'sf'}, 'id': 'call_YXpVnZfYSkoN24AKqS2ntXoJ', 'type': 'tool_call'}], usage_metadata={'input_tokens': 57, 'output_tokens': 14, 'total_tokens': 71})]}

Receiving update from node: 'tools'
{'messages': [ToolMessage(content="It's always sunny in sf", name='get_weather', tool_call_id='call_YXpVnZfYSkoN24AKqS2ntXoJ')]}

Receiving update from node: 'agent'
{'messages': [AIMessage(content='The weather in San Francisco is currently sunny.', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 10, 'prompt_tokens': 84, 'total_tokens': 94}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'stop', 'logprobs': None}, id='run-f56102b0-6de1-453c-96d0-b0be2d4cac32-0', usage_metadata={'input_tokens': 84, 'output_tokens': 10, 'total_tokens': 94})]}
```


