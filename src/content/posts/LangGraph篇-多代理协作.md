---
title: "LangGraph篇-多代理协作"
published: 2026-07-29
description: "协作 官方文档地址： 中文文档地址： 单个代理通常可以使用少量工具在一个域内有效地运行，但即使使用像 gpt 4 这样的强大模型，它在使用许多工具时也可能效率较低。 解决复杂任务的一种方法是使用“分而治之”的方法：为每个任务或域创建一个专门的代理，并将任务路由到正确的“专家”。 此笔记本（受 Wu 等人撰写的论文 的启发）展示了一种使用 LangGraph 进行此操作的方法。 生成的图将类似于以下"
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
## **协作**

官方文档地址：[<span style="color: rgb(36,91,219); background-color: inherit">https://langchain-ai.github.io/langgraph/how-tos/#multi-agent</span>](https://langchain-ai.github.io/langgraph/how-tos/#multi-agent)

中文文档地址：[<span style="color: rgb(36,91,219); background-color: inherit">https://www.aidoczh.com/langgraph/how-tos/#_9</span>](https://www.aidoczh.com/langgraph/how-tos/#_9)

单个代理通常可以使用少量工具在一个域内有效地运行，但即使使用像`gpt-4`这样的强大模型，它在使用许多工具时也可能效率较低。

解决复杂任务的一种方法是使用“分而治之”的方法：为每个任务或域创建一个专门的代理，并将任务路由到正确的“专家”。

此笔记本（受 Wu 等人撰写的论文 [<span style="color: rgb(36,91,219); background-color: inherit">AutoGen：通过多代理对话实现下一代 LLM 应用</span>](https://arxiv.org/abs/2308.08155) 的启发）展示了一种使用 LangGraph 进行此操作的方法。

生成的图将类似于以下图

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/LangGraph%E7%AF%87-%E5%A4%9A%E4%BB%A3%E7%90%86%E5%8D%8F%E4%BD%9C_assets/LangGraph%E7%AF%87-%E5%A4%9A%E4%BB%A3%E7%90%86%E5%8D%8F%E4%BD%9C-2f0126cdaa50f86b10095918871e4f98_simple_multi_agent_diagram.png)

在我们开始之前，快速说明一下：以下展示*如何*在 LangGraph 中实现某些设计模式。如果模式适合您的需求

```python
%pip install -U langchain langchain_openai langsmith pandas langchain_experimental matplotlib langgraph langchain_core
```

```python
setx TAVILY_API_KEY ""
# Optional, add tracing in LangSmith
setx LANGCHAIN_TRACING_V2 "true"
setx LANGCHAIN_API_KEY ""
```

## **创建代理**

以下辅助函数将帮助创建代理。这些代理将成为图中的节点。

如果您只想查看图的外观，可以跳过此步骤。

```python
# 导入基本消息类、用户消息类和工具消息类
from langchain_core.messages import (
BaseMessage,
HumanMessage,
ToolMessage,
)
# 导入聊天提示模板和消息占位符
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# 导入状态图相关的常量和类
from langgraph.graph import END, StateGraph, START


# 定义一个函数，用于创建代理
def create_agent(llm, tools, system_message: str):
    """创建一个代理。"""
    # 创建一个聊天提示模板
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "你是一个有帮助的AI助手，与其他助手合作。"
                " 使用提供的工具来推进问题的回答。"
                " 如果你不能完全回答，没关系，另一个拥有不同工具的助手"
                " 会接着你的位置继续帮助。执行你能做的以取得进展。"
                " 如果你或其他助手有最终答案或交付物，"
                " 在你的回答前加上FINAL ANSWER，以便团队知道停止。"
                " 你可以使用以下工具: {tool_names}。\n{system_message}",
            ),
            # 消息占位符
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
    # 传递系统消息参数
    prompt = prompt.partial(system_message=system_message)
    # 传递工具名称参数
    prompt = prompt.partial(tool_names=", ".join([tool.name for tool in tools]))
    # 绑定工具并返回提示模板
    return prompt | llm.bind_tools(tools)
```

## **定义工具**

我们还将定义一些代理将在未来使用的工具

````python
# 导入注解类型
from typing import Annotated

# 导入Tavily搜索工具
from langchain_community.tools.tavily_search import TavilySearchResults
# 导入工具装饰器
from langchain_core.tools import tool
# 导入Python REPL工具
from langchain_experimental.utilities import PythonREPL

# 创建Tavily搜索工具实例，设置最大结果数为5
tavily_tool = TavilySearchResults(max_results=5)

# 警告：这会在本地执行代码，未沙箱化时可能不安全
# 创建Python REPL实例
repl = PythonREPL()


# 定义一个工具函数，用于执行Python代码
@tool
def python_repl(
    code: Annotated[str, "要执行以生成图表的Python代码。"],
):
    """使用这个工具来执行Python代码。如果你想查看某个值的输出，
    应该使用print(...)。这个输出对用户可见。"""
    try:
        # 尝试执行代码
        result = repl.run(code)
    except BaseException as e:
        # 捕捉异常并返回错误信息
        return f"执行失败。错误: {repr(e)}"
    # 返回执行结果
    result_str = f"成功执行:\n```python\n{code}\n```\nStdout: {result}"
    return (
        result_str + "\n\n如果你已完成所有任务，请回复FINAL ANSWER。"
    )
````

## **创建图**

现在我们已经定义了工具并创建了一些辅助函数，将在下面创建各个代理，并告诉他们如何使用 LangGraph 相互交流。

### **定义状态**

我们首先定义图的状态。这只是一个消息列表，以及一个用于跟踪最新发送者的键

```python
# 导入操作符和类型注解
import operator
from typing import Annotated, Sequence, TypedDict

# 导入OpenAI聊天模型
from langchain_openai import ChatOpenAI


# 定义一个对象，用于在图的每个节点之间传递
# 我们将为每个代理和工具创建不同的节点
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    sender: str
```

### **定义代理节点**

现在我们需要定义节点。首先，让我们定义代理的节点。

```python
# 导入functools模块
import functools

# 导入AI消息类
from langchain_core.messages import AIMessage


# 辅助函数，用于为给定的代理创建节点
def agent_node(state, agent, name):
    # 调用代理
    result = agent.invoke(state)
    # 将代理输出转换为适合附加到全局状态的格式
    if isinstance(result, ToolMessage):
        pass
    else:
        result = AIMessage(**result.dict(exclude={"type", "name"}), name=name)
    return {
        "messages": [result],
        # 由于我们有一个严格的工作流程，我们可以
        # 跟踪发送者，以便知道下一个传递给谁。
        "sender": name,
    }


# 创建OpenAI聊天模型实例
llm = ChatOpenAI(model="gpt-4o")

# 研究代理和节点
research_agent = create_agent(
    llm,
    [tavily_tool],
    system_message="你应该提供准确的数据供chart_generator使用。",
)
# 创建研究节点
research_node = functools.partial(agent_node, agent=research_agent, name="Researcher")

# 图表生成器
chart_agent = create_agent(
    llm,
    [python_repl],
    system_message="你展示的任何图表都将对用户可见。",
)
# 创建图表生成节点
chart_node = functools.partial(agent_node, agent=chart_agent, name="chart_generator")
```

### **定义工具节点**

我们现在定义一个节点来运行工具

```python
# 导入预构建的工具节点
from langgraph.prebuilt import ToolNode

# 定义工具列表
tools = [tavily_tool, python_repl]
# 创建工具节点
tool_node = ToolNode(tools)
```

### **定义边逻辑**

我们可以定义一些边缘逻辑，这些逻辑需要根据代理的结果来决定要执行的操作

```python
# 任一代理都可以决定结束
from typing import Literal

# 定义路由器函数
def router(state) -> Literal["call_tool", "__end__", "continue"]:
    # 这是路由器
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        # 上一个代理正在调用工具
        return "call_tool"
    if "FINAL ANSWER" in last_message.content:
        # 任何代理决定工作完成
        return "__end__"
    return "continue"
```

### **定义图**

我们现在可以将所有内容整合在一起，并定义图！

```python
# 创建状态图实例
workflow = StateGraph(AgentState)

# 添加研究员节点
workflow.add_node("Researcher", research_node)
# 添加图表生成器节点
workflow.add_node("chart_generator", chart_node)
# 添加工具调用节点
workflow.add_node("call_tool", tool_node)

# 添加条件边
workflow.add_conditional_edges(
    "Researcher",
    router,
    {"continue": "chart_generator", "call_tool": "call_tool", "__end__": END},
)
workflow.add_conditional_edges(
    "chart_generator",
    router,
    {"continue": "Researcher", "call_tool": "call_tool", "__end__": END},
)

# 添加条件边
workflow.add_conditional_edges(
    "call_tool",
    # 每个代理节点更新'sender'字段
    # 工具调用节点不更新，这意味着
    # 该边将路由回调用工具的原始代理
    lambda x: x["sender"],
    {
        "Researcher": "Researcher",
        "chart_generator": "chart_generator",
    },
)
# 添加起始边
workflow.add_edge(START, "Researcher")
# 编译工作流图
graph = workflow.compile()
```

```python
# 将生成的图片保存到文件
graph_png = graph.get_graph().draw_mermaid_png()
with open("collaboration.png", "wb") as f:
    f.write(graph_png)
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/LangGraph%E7%AF%87-%E5%A4%9A%E4%BB%A3%E7%90%86%E5%8D%8F%E4%BD%9C_assets/LangGraph%E7%AF%87-%E5%A4%9A%E4%BB%A3%E7%90%86%E5%8D%8F%E4%BD%9C-Oui2bBAnro4tnzxxeSWcvQN4n5b.jpg)

## **调用**

图创建完毕后，您可以调用它！让我们让它为我们绘制一些统计数据。

```python
# 事件流
events = graph.stream(
    {
        "messages": [
            HumanMessage(
                content="获取过去5年AI软件市场规模，"
                        " 然后绘制一条折线图。"
                        " 一旦你编写好代码，完成任务。"
            )
        ],
    },
    # 图中最多执行的步骤数
    {"recursion_limit": 150},
)
# 打印事件流中的每个状态
for s in events:
    print(s)
    print("----")
```

````python
{'Researcher': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_hxMmPTrjwqFmg6u6lB81c383', 'function': {'arguments': '{"query": "global AI software market size past 5 years"}', 'name': 'tavily_search_results_json'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 42, 'prompt_tokens': 218, 'total_tokens': 260}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_157b3831f5', 'finish_reason': 'tool_calls', 'logprobs': None}, name='Researcher', id='run-350ced4f-9b70-46c1-8fc1-5ab338e520fd-0', tool_calls=[{'name': 'tavily_search_results_json', 'args': {'query': 'global AI software market size past 5 years'}, 'id': 'call_hxMmPTrjwqFmg6u6lB81c383', 'type': 'tool_call'}], usage_metadata={'input_tokens': 218, 'output_tokens': 42, 'total_tokens': 260})], 'sender': 'Researcher'}}
----
{'call_tool': {'messages': [ToolMessage(content='[{"url": "https://www.gartner.com/en/documents/5314863", "content": "Summary. AI software spending will grow to $297.9 billion by 2027. Over the next five years, market growth will accelerate from 17.8% to 20.4% in 2027, with a 19.1% CAGR. Government has the largest spend of over $70 million by 2027, but oil and gas is growing fastest with a 25.2% CAGR."}, {"url": "https://www.abiresearch.com/news-resources/chart-data/report-artificial-intelligence-market-size-global/", "content": "The Artificial Intelligence (AI) software market size will be valued at US$98 billion in 2024. Growing at a Compound Annual Growth Rate (CAGR) of 30%, the AI software market size will reach US$391.43 billion in 2030. Generative AI will be the fastest growing AI framework with a 49.7% CAGR over the market forecast period with foundation models ..."}, {"url": "https://www.statista.com/statistics/607716/worldwide-artificial-intelligence-market-revenues/", "content": "Get in touch with us now. , Jul 27, 2022. The global artificial intelligence (AI) software market is forecast to grow rapidly in the coming years, reaching around 126 billion U.S. dollars by 2025 ..."}, {"url": "https://explodingtopics.com/blog/ai-statistics", "content": "Industry verticals utilizing AI technology include tech-related sales, insurance, banking, telecom, healthcare, manufacturing, retail, and marketing to name a few.\\n$1.5 trillion\\n$489 billion\\n$554 billion\\n$215 billion\\n$453 billion\\n$87 billion\\n$2.76 trillion\\n$520 billion\\n$1.06 trillion\\n$109 billion\\n$3.42 trillion\\n$1.15 trillion\\n$2.26 trillion\\n$461 billion\\n$3.72 trillion\\n$951 billion\\n$8.4 trillion\\n$3.78 trillion\\n$535 billion\\n$95 billion\\n$7.47 trillion\\n$1.85 trillion\\n$3.99 trillion\\n$939 billion\\n$1.08 trillion\\n$216 billion\\n$2.13 trillion\\n$744 billion\\n$962 billion\\n$304 billion\\n$6.18 trillion\\n$2.23 trillion\\nThe self-driving car market is proving to be more than a novelty niche by grossing $173 billion in global revenue.\\n A computer\'s speech recognition capability and a smartphone\'s ability to geotag video content before sharing are each examples of ML.\\n2020\\n2021\\nChange\\n37%\\n50%\\n34%\\n57%\\n29%\\n31%\\n28%\\n48%\\n27%\\n27%\\n27%\\n46%\\n26%\\n22%\\n26%\\n34%\\n20%\\n40%\\n19%\\n44%\\n14%\\n31%\\n15%\\n1%\\n Here\'s a look at global revenue from the NLP market from 2017 to 2025:\\nRevenue\\n$3.18 billion\\n$5.07 billion\\n$8.21 billion\\n$12.4 billion\\n$17.58 billion\\n$24 billion\\n$30.35 billion\\n$37.33 billion\\n$43.29 billion\\n*Projected figures\\nDuring the forecast period of 2017-2025, the NLP market is set to grow by around 14x.\\n 93%\\n89%\\n85%\\n92%\\n68%\\n71%\\n98%\\n86%\\n72%\\n96%\\n76%\\n93%\\n86%\\n93%\\n69%\\n52% of telecommunications organizations utilize chatbots to increase their overall productivity.\\n The AI software market\'s global annual revenue (2018 to 2025):\\nRevenue\\n$10.1 billion\\n$14.69 billion\\n$22.59 billion\\n$34.87 billion\\n$51.27 billion\\n$70.94 billion\\n$94.41 billion\\n$126 billion\\n*Projected figures\\n"}, {"url": "https://www.gartner.com/en/newsroom/press-releases/2021-11-22-gartner-forecasts-worldwide-artificial-intelligence-software-market-to-reach-62-billion-in-2022", "content": "Market Growth Will Accelerate as Organizations Progress Their AI Maturity. Worldwide artificial intelligence (AI) software revenue is forecast to total $62.5 billion in 2022, an increase of 21.3% from 2021, according to a new forecast from Gartner, Inc. \\"The AI software market is picking up speed, but its long-term trajectory will depend on ..."}]', name='tavily_search_results_json', tool_call_id='call_hxMmPTrjwqFmg6u6lB81c383', artifact={'query': 'global AI software market size past 5 years', 'follow_up_questions': None, 'answer': None, 'images': [], 'results': [{'title': 'Forecast Analysis: AI Software Market by Vertical Industry, 2023-2027', 'url': 'https://www.gartner.com/en/documents/5314863', 'content': 'Summary. AI software spending will grow to $297.9 billion by 2027. Over the next five years, market growth will accelerate from 17.8% to 20.4% in 2027, with a 19.1% CAGR. Government has the largest spend of over $70 million by 2027, but oil and gas is growing fastest with a 25.2% CAGR.', 'score': 0.99712163, 'raw_content': None}, {'title': 'Artificial Intelligence (AI) Software Market Size: 2023 to 2030', 'url': 'https://www.abiresearch.com/news-resources/chart-data/report-artificial-intelligence-market-size-global/', 'content': 'The Artificial Intelligence (AI) software market size will be valued at US$98 billion in 2024. Growing at a Compound Annual Growth Rate (CAGR) of 30%, the AI software market size will reach US$391.43 billion in 2030. Generative AI will be the fastest growing AI framework with a 49.7% CAGR over the market forecast period with foundation models ...', 'score': 0.97754294, 'raw_content': None}, {'title': 'Global AI software market size 2018-2025 | Statista', 'url': 'https://www.statista.com/statistics/607716/worldwide-artificial-intelligence-market-revenues/', 'content': 'Get in touch with us now. , Jul 27, 2022. The global artificial intelligence (AI) software market is forecast to grow rapidly in the coming years, reaching around 126 billion U.S. dollars by 2025 ...', 'score': 0.9666632, 'raw_content': None}, {'title': '57 NEW Artificial Intelligence Statistics (Aug 2024) - Exploding Topics', 'url': 'https://explodingtopics.com/blog/ai-statistics', 'content': "Industry verticals utilizing AI technology include tech-related sales, insurance, banking, telecom, healthcare, manufacturing, retail, and marketing to name a few.\n$1.5 trillion\n$489 billion\n$554 billion\n$215 billion\n$453 billion\n$87 billion\n$2.76 trillion\n$520 billion\n$1.06 trillion\n$109 billion\n$3.42 trillion\n$1.15 trillion\n$2.26 trillion\n$461 billion\n$3.72 trillion\n$951 billion\n$8.4 trillion\n$3.78 trillion\n$535 billion\n$95 billion\n$7.47 trillion\n$1.85 trillion\n$3.99 trillion\n$939 billion\n$1.08 trillion\n$216 billion\n$2.13 trillion\n$744 billion\n$962 billion\n$304 billion\n$6.18 trillion\n$2.23 trillion\nThe self-driving car market is proving to be more than a novelty niche by grossing $173 billion in global revenue.\n A computer's speech recognition capability and a smartphone's ability to geotag video content before sharing are each examples of ML.\n2020\n2021\nChange\n37%\n50%\n34%\n57%\n29%\n31%\n28%\n48%\n27%\n27%\n27%\n46%\n26%\n22%\n26%\n34%\n20%\n40%\n19%\n44%\n14%\n31%\n15%\n1%\n Here's a look at global revenue from the NLP market from 2017 to 2025:\nRevenue\n$3.18 billion\n$5.07 billion\n$8.21 billion\n$12.4 billion\n$17.58 billion\n$24 billion\n$30.35 billion\n$37.33 billion\n$43.29 billion\n*Projected figures\nDuring the forecast period of 2017-2025, the NLP market is set to grow by around 14x.\n 93%\n89%\n85%\n92%\n68%\n71%\n98%\n86%\n72%\n96%\n76%\n93%\n86%\n93%\n69%\n52% of telecommunications organizations utilize chatbots to increase their overall productivity.\n The AI software market's global annual revenue (2018 to 2025):\nRevenue\n$10.1 billion\n$14.69 billion\n$22.59 billion\n$34.87 billion\n$51.27 billion\n$70.94 billion\n$94.41 billion\n$126 billion\n*Projected figures\n", 'score': 0.95022655, 'raw_content': None}, {'title': 'Gartner Forecasts Worldwide Artificial Intelligence Software Market to ...', 'url': 'https://www.gartner.com/en/newsroom/press-releases/2021-11-22-gartner-forecasts-worldwide-artificial-intelligence-software-market-to-reach-62-billion-in-2022', 'content': 'Market Growth Will Accelerate as Organizations Progress Their AI Maturity. Worldwide artificial intelligence (AI) software revenue is forecast to total $62.5 billion in 2022, an increase of 21.3% from 2021, according to a new forecast from Gartner, Inc. "The AI software market is picking up speed, but its long-term trajectory will depend on ...', 'score': 0.91535604, 'raw_content': None}], 'response_time': 1.96})]}}
----
{'Researcher': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_dmHbjJBuN6z6H1YhqVa1qT3X', 'function': {'arguments': '{\n  "type": "line",\n  "data": {\n    "labels": ["2018", "2019", "2020", "2021", "2022"],\n    "datasets": [{\n      "label": "AI Software Market Size (in billion USD)",\n      "data": [10.1, 14.69, 22.59, 34.87, 62.5],\n      "borderColor": "blue",\n      "fill": false\n    }]\n  },\n  "options": {\n    "title": {\n      "display": true,\n      "text": "Global AI Software Market Size (2018-2022)"\n    },\n    "scales": {\n      "yAxes": [{\n        "ticks": {\n          "beginAtZero": true\n        },\n        "scaleLabel": {\n          "display": true,\n          "labelString": "Market Size (in billion USD)"\n        }\n      }],\n      "xAxes": [{\n        "scaleLabel": {\n          "display": true,\n          "labelString": "Year"\n        }\n      }]\n    }\n  }\n}', 'name': 'chart_generator'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 235, 'prompt_tokens': 1269, 'total_tokens': 1504}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_157b3831f5', 'finish_reason': 'tool_calls', 'logprobs': None}, name='Researcher', id='run-76d4ceaa-eb77-44c8-a3c2-11c1bb795eab-0', tool_calls=[{'name': 'chart_generator', 'args': {'type': 'line', 'data': {'labels': ['2018', '2019', '2020', '2021', '2022'], 'datasets': [{'label': 'AI Software Market Size (in billion USD)', 'data': [10.1, 14.69, 22.59, 34.87, 62.5], 'borderColor': 'blue', 'fill': False}]}, 'options': {'title': {'display': True, 'text': 'Global AI Software Market Size (2018-2022)'}, 'scales': {'yAxes': [{'ticks': {'beginAtZero': True}, 'scaleLabel': {'display': True, 'labelString': 'Market Size (in billion USD)'}}], 'xAxes': [{'scaleLabel': {'display': True, 'labelString': 'Year'}}]}}}, 'id': 'call_dmHbjJBuN6z6H1YhqVa1qT3X', 'type': 'tool_call'}], usage_metadata={'input_tokens': 1269, 'output_tokens': 235, 'total_tokens': 1504})], 'sender': 'Researcher'}}
----
{'call_tool': {'messages': [ToolMessage(content='Error: chart_generator is not a valid tool, try one of [tavily_search_results_json, python_repl].', name='chart_generator', tool_call_id='call_dmHbjJBuN6z6H1YhqVa1qT3X')]}}
----
{'Researcher': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_r78t4mMNcNzQRFWrTBfGu2uc', 'function': {'arguments': '{"query":"global AI software market size past 5 years"}', 'name': 'tavily_search_results_json'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 26, 'prompt_tokens': 1464, 'total_tokens': 1490}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_157b3831f5', 'finish_reason': 'tool_calls', 'logprobs': None}, name='Researcher', id='run-9b4fb9c7-c8a5-4b91-86b5-de6d83200415-0', tool_calls=[{'name': 'tavily_search_results_json', 'args': {'query': 'global AI software market size past 5 years'}, 'id': 'call_r78t4mMNcNzQRFWrTBfGu2uc', 'type': 'tool_call'}], usage_metadata={'input_tokens': 1464, 'output_tokens': 26, 'total_tokens': 1490})], 'sender': 'Researcher'}}
----
{'call_tool': {'messages': [ToolMessage(content='[{"url": "https://www.gartner.com/en/documents/5314863", "content": "Summary. AI software spending will grow to $297.9 billion by 2027. Over the next five years, market growth will accelerate from 17.8% to 20.4% in 2027, with a 19.1% CAGR. Government has the largest spend of over $70 million by 2027, but oil and gas is growing fastest with a 25.2% CAGR."}, {"url": "https://www.precedenceresearch.com/artificial-intelligence-software-market", "content": "Report Code : 2484. Category : ICT. The global artificial intelligence (AI) software market size was evaluated at USD 138.4 billion in 2022 and is predicted to hit around USD 1,094.52 billion by 2032, growing at a CAGR of 22.97% during the forecast period from 2023 to 2032."}, {"url": "https://www.statista.com/statistics/607716/worldwide-artificial-intelligence-market-revenues/", "content": "Get in touch with us now. , Jul 27, 2022. The global artificial intelligence (AI) software market is forecast to grow rapidly in the coming years, reaching around 126 billion U.S. dollars by 2025 ..."}, {"url": "https://explodingtopics.com/blog/ai-statistics", "content": "Industry verticals utilizing AI technology include tech-related sales, insurance, banking, telecom, healthcare, manufacturing, retail, and marketing to name a few.\\n$1.5 trillion\\n$489 billion\\n$554 billion\\n$215 billion\\n$453 billion\\n$87 billion\\n$2.76 trillion\\n$520 billion\\n$1.06 trillion\\n$109 billion\\n$3.42 trillion\\n$1.15 trillion\\n$2.26 trillion\\n$461 billion\\n$3.72 trillion\\n$951 billion\\n$8.4 trillion\\n$3.78 trillion\\n$535 billion\\n$95 billion\\n$7.47 trillion\\n$1.85 trillion\\n$3.99 trillion\\n$939 billion\\n$1.08 trillion\\n$216 billion\\n$2.13 trillion\\n$744 billion\\n$962 billion\\n$304 billion\\n$6.18 trillion\\n$2.23 trillion\\nThe self-driving car market is proving to be more than a novelty niche by grossing $173 billion in global revenue.\\n A computer\'s speech recognition capability and a smartphone\'s ability to geotag video content before sharing are each examples of ML.\\n2020\\n2021\\nChange\\n37%\\n50%\\n34%\\n57%\\n29%\\n31%\\n28%\\n48%\\n27%\\n27%\\n27%\\n46%\\n26%\\n22%\\n26%\\n34%\\n20%\\n40%\\n19%\\n44%\\n14%\\n31%\\n15%\\n1%\\n Here\'s a look at global revenue from the NLP market from 2017 to 2025:\\nRevenue\\n$3.18 billion\\n$5.07 billion\\n$8.21 billion\\n$12.4 billion\\n$17.58 billion\\n$24 billion\\n$30.35 billion\\n$37.33 billion\\n$43.29 billion\\n*Projected figures\\nDuring the forecast period of 2017-2025, the NLP market is set to grow by around 14x.\\n 93%\\n89%\\n85%\\n92%\\n68%\\n71%\\n98%\\n86%\\n72%\\n96%\\n76%\\n93%\\n86%\\n93%\\n69%\\n52% of telecommunications organizations utilize chatbots to increase their overall productivity.\\n The AI software market\'s global annual revenue (2018 to 2025):\\nRevenue\\n$10.1 billion\\n$14.69 billion\\n$22.59 billion\\n$34.87 billion\\n$51.27 billion\\n$70.94 billion\\n$94.41 billion\\n$126 billion\\n*Projected figures\\n"}, {"url": "https://www.gartner.com/en/newsroom/press-releases/2021-11-22-gartner-forecasts-worldwide-artificial-intelligence-software-market-to-reach-62-billion-in-2022", "content": "Market Growth Will Accelerate as Organizations Progress Their AI Maturity. Worldwide artificial intelligence (AI) software revenue is forecast to total $62.5 billion in 2022, an increase of 21.3% from 2021, according to a new forecast from Gartner, Inc. \\"The AI software market is picking up speed, but its long-term trajectory will depend on ..."}]', name='tavily_search_results_json', tool_call_id='call_r78t4mMNcNzQRFWrTBfGu2uc', artifact={'query': 'global AI software market size past 5 years', 'follow_up_questions': None, 'answer': None, 'images': [], 'results': [{'title': 'Forecast Analysis: AI Software Market by Vertical Industry, 2023-2027', 'url': 'https://www.gartner.com/en/documents/5314863', 'content': 'Summary. AI software spending will grow to $297.9 billion by 2027. Over the next five years, market growth will accelerate from 17.8% to 20.4% in 2027, with a 19.1% CAGR. Government has the largest spend of over $70 million by 2027, but oil and gas is growing fastest with a 25.2% CAGR.', 'score': 0.99712163, 'raw_content': None}, {'title': 'Artificial Intelligence (AI) Software Market Size, Report 2032', 'url': 'https://www.precedenceresearch.com/artificial-intelligence-software-market', 'content': 'Report Code : 2484. Category : ICT. The global artificial intelligence (AI) software market size was evaluated at USD 138.4 billion in 2022 and is predicted to hit around USD 1,094.52 billion by 2032, growing at a CAGR of 22.97% during the forecast period from 2023 to 2032.', 'score': 0.9797065, 'raw_content': None}, {'title': 'Global AI software market size 2018-2025 | Statista', 'url': 'https://www.statista.com/statistics/607716/worldwide-artificial-intelligence-market-revenues/', 'content': 'Get in touch with us now. , Jul 27, 2022. The global artificial intelligence (AI) software market is forecast to grow rapidly in the coming years, reaching around 126 billion U.S. dollars by 2025 ...', 'score': 0.9666632, 'raw_content': None}, {'title': '57 NEW Artificial Intelligence Statistics (Aug 2024) - Exploding Topics', 'url': 'https://explodingtopics.com/blog/ai-statistics', 'content': "Industry verticals utilizing AI technology include tech-related sales, insurance, banking, telecom, healthcare, manufacturing, retail, and marketing to name a few.\n$1.5 trillion\n$489 billion\n$554 billion\n$215 billion\n$453 billion\n$87 billion\n$2.76 trillion\n$520 billion\n$1.06 trillion\n$109 billion\n$3.42 trillion\n$1.15 trillion\n$2.26 trillion\n$461 billion\n$3.72 trillion\n$951 billion\n$8.4 trillion\n$3.78 trillion\n$535 billion\n$95 billion\n$7.47 trillion\n$1.85 trillion\n$3.99 trillion\n$939 billion\n$1.08 trillion\n$216 billion\n$2.13 trillion\n$744 billion\n$962 billion\n$304 billion\n$6.18 trillion\n$2.23 trillion\nThe self-driving car market is proving to be more than a novelty niche by grossing $173 billion in global revenue.\n A computer's speech recognition capability and a smartphone's ability to geotag video content before sharing are each examples of ML.\n2020\n2021\nChange\n37%\n50%\n34%\n57%\n29%\n31%\n28%\n48%\n27%\n27%\n27%\n46%\n26%\n22%\n26%\n34%\n20%\n40%\n19%\n44%\n14%\n31%\n15%\n1%\n Here's a look at global revenue from the NLP market from 2017 to 2025:\nRevenue\n$3.18 billion\n$5.07 billion\n$8.21 billion\n$12.4 billion\n$17.58 billion\n$24 billion\n$30.35 billion\n$37.33 billion\n$43.29 billion\n*Projected figures\nDuring the forecast period of 2017-2025, the NLP market is set to grow by around 14x.\n 93%\n89%\n85%\n92%\n68%\n71%\n98%\n86%\n72%\n96%\n76%\n93%\n86%\n93%\n69%\n52% of telecommunications organizations utilize chatbots to increase their overall productivity.\n The AI software market's global annual revenue (2018 to 2025):\nRevenue\n$10.1 billion\n$14.69 billion\n$22.59 billion\n$34.87 billion\n$51.27 billion\n$70.94 billion\n$94.41 billion\n$126 billion\n*Projected figures\n", 'score': 0.95022655, 'raw_content': None}, {'title': 'Gartner Forecasts Worldwide Artificial Intelligence Software Market to ...', 'url': 'https://www.gartner.com/en/newsroom/press-releases/2021-11-22-gartner-forecasts-worldwide-artificial-intelligence-software-market-to-reach-62-billion-in-2022', 'content': 'Market Growth Will Accelerate as Organizations Progress Their AI Maturity. Worldwide artificial intelligence (AI) software revenue is forecast to total $62.5 billion in 2022, an increase of 21.3% from 2021, according to a new forecast from Gartner, Inc. "The AI software market is picking up speed, but its long-term trajectory will depend on ...', 'score': 0.91535604, 'raw_content': None}], 'response_time': 2.11})]}}
----
{'Researcher': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_t8ZL0IeFIlqLOogieZF9rQLs', 'function': {'arguments': '{"query":"global AI software market size 2018, 2019, 2020, 2021, 2022"}', 'name': 'tavily_search_results_json'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 41, 'prompt_tokens': 2504, 'total_tokens': 2545}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_157b3831f5', 'finish_reason': 'tool_calls', 'logprobs': None}, name='Researcher', id='run-60b2faef-a310-4870-9cc4-fbb4b62c04a0-0', tool_calls=[{'name': 'tavily_search_results_json', 'args': {'query': 'global AI software market size 2018, 2019, 2020, 2021, 2022'}, 'id': 'call_t8ZL0IeFIlqLOogieZF9rQLs', 'type': 'tool_call'}], usage_metadata={'input_tokens': 2504, 'output_tokens': 41, 'total_tokens': 2545})], 'sender': 'Researcher'}}
----
{'call_tool': {'messages': [ToolMessage(content='[{"url": "https://www.statista.com/statistics/607716/worldwide-artificial-intelligence-market-revenues/", "content": "Get in touch with us now. , Jul 27, 2022. The global artificial intelligence (AI) software market is forecast to grow rapidly in the coming years, reaching around 126 billion U.S. dollars by 2025 ..."}, {"url": "https://www.gartner.com/en/newsroom/press-releases/2021-11-22-gartner-forecasts-worldwide-artificial-intelligence-software-market-to-reach-62-billion-in-2022", "content": "Market Growth Will Accelerate as Organizations Progress Their AI Maturity Worldwide artificial intelligence (AI) software revenue is forecast to total $62.5 billion in 2022, an increase of 21.3% from 2021, according to a new forecast from Gartner, Inc."}, {"url": "https://www.gartner.com/en/documents/4007140", "content": "Summary By 2025, the market for artificial intelligence (AI) software will reach almost $134.8 billion. Over the next five years, the market growth will accelerate from 14.4% in 2021 to reach 31.1% in 2025, considerably outpacing the overall software market growth."}, {"url": "https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-ai-market", "content": "Artificial Intelligence Market Report Scope\\nReport Attribute\\nDetails\\nMarket size value in 2023\\nUSD 196.63 billion\\nRevenue forecast in 2030\\nUSD 1,811.75 billion\\nGrowth rate\\nCAGR of 37.3% from 2023 to 2030\\nBase year for estimation\\n2022\\nHistorical data\\n2017 - 2021\\nForecast period\\n2023 - 2030\\nQuantitative units\\nRevenue in USD billion, CAGR from 2023 to 2030\\nReport coverage\\nRevenue forecast, company ranking, competitive landscape, growth factors, and trends\\nSegments covered\\nSolution, technology, end-use, region\\nRegional scope\\nNorth America; Europe; Asia Pacific; South America; MEA\\nCountry scope\\nU.S.; Canada; Mexico; Germany; U.K.; China; Japan; India; Brazil\\nKey companies profiled\\nAdvanced Micro Devices; AiCure; Arm Limited; Atomwise, Inc.; Ayasdi AI LLC; Baidu, Inc.; Clarifai, Inc; Cyrcadia Health; Enlitic, Inc.; Google LLC; H2O.ai.; HyperVerge, Inc.; International Business Machines Corporation; IBM Watson Health; Intel Corporation; Iris.ai AS.; Deep Learning\\nMachine Learning\\nNatural Language Processing (NLP)\\nMachine Vision\\nEnd-use Outlook (Revenue, USD Billion, 2017 - 2030)\\nHealthcare\\nRobot-Assisted Surgery\\nVirtual Nursing Assistants\\nHospital Workflow Management\\nDosage Error Reduction\\nClinical Trial Participant Identifier\\nPreliminary Diagnosis\\nAutomated Image Diagnosis\\nBFSI\\nRisk Assessment\\nFinancial Analysis/Research\\nInvestment/Portfolio Management\\nOthers\\nLaw\\nRetail\\nAdvertising & Media\\nAutomotive & Transportation\\nAgriculture\\nManufacturing\\nOthers\\nRegional Outlook (Revenue, USD Billion, 2017 - 2030)\\n North America\\nU.S.\\nCanada\\nMexico\\nEurope\\nGermany\\nU.K.\\nAsia Pacific\\nChina\\nJapan\\nIndia\\nSouth America\\nBrazil\\nMiddle East and Africa (MEA)\\nFrequently Asked Questions About This Report\\nb.\\n b.\\nKey factors that are driving the artificial intelligence market growth include a rise in the adoption of big data, analytics, and the increasing potential of R&D in developing AI systems and technological innovations across the globe.\\n Artificial Intelligence Market Size, Share & Trends Analysis Report By Solution, By Technology (Deep Learning, Machine Learning), By End-use, By Region, And Segment Forecasts, 2023 - 2030\\nReport Overview\\nThe global artificial intelligence market size was valued at USD 136.55 billion in 2022 and is projected to expand at a compound annual growth rate (CAGR) of 37.3% from 2023 to 2030."}, {"url": "https://www.marketsandmarkets.com/Market-Reports/artificial-intelligence-market-74851580.html", "content": "Get online access to the report on the World\'s First Market Intelligence Cloud\\nEasy to Download Historical Data & Forecast Numbers\\nCompany Analysis Dashboard for high growth potential opportunities\\nResearch Analyst Access for customization & queries\\nCompetitor Analysis with Interactive dashboard\\nLatest News, Updates & Trend analysisRequest Sample\\nClick on image to enlarge\\nGet online access to the report on the World\'s First Market Intelligence Cloud\\nScope of the Report\\nReport Metrics\\nDetails\\nMarket size value in 2023\\nUS $150.2 billion\\nMarket Revenue in 2030\\nUS $1,345.2 billion\\nGrowth Rate\\nCAGR of 36.8% from 2023 to 2030\\nArtificial Intelligence Market Drivers\\nMarket size available for years\\n2017\\u20132030\\nBase year considered\\n2022\\nForecast period\\n2023\\u20132030\\nForecast units\\nUSD (Billion)\\nSegments covered\\nOffering, Technology, Business Function, Verticals, and Region\\nGeographies covered\\nNorth America, Europe, Asia Pacific, Middle East & Africa, and Latin America\\nCompanies covered\\nGoogle (US), Microsoft (US), IBM (US), Oracle (US), AWS (US), Intel (US), Salesforce (US), SAP (Germany), Cisco (US), Meta (US), HPE (US), Siemens (Germany), Huawei (China), NVIDIA (US), Baidu (China), SAS Institute (US), OpenAI (US), H2O.ai (US), iFLYTEK (China), Alibaba Cloud (China), General Vision (US), Darktrace (UK), Blackberry Limited (Canada), DiDi Global (China), Face++ (China), Inbenta (US), Anju Software (US), Butterfly Network (US), Atomwise (US), AIBrain (US), SK Hynix (South Korea), Progress (US), PrecisionHawk (US), AgEagle Aerial System (US), Neurala (US), Twitter (US), Aurea Software (US), Persado (US), 8x8 (US), Appier (Taiwan), GumGum (US), IPRO (US), Graphcore (UK), Preferred Networks (Japan), Applied Brain Research (Canada), Pilot AI (US), Iris Automation (US), Gamaya (Switzerland), ec2ce (Spain), Descartes Labs (US), Mythic (US), Ada (Canada), Mostly AI (Austria), Sentient.io (Singapore), Lumen5 (Canada), AI Superior (Germany), Fosfor (India), Intrinsic (US), Jasper (US), Soundful (US), Writesonic (US), One AI (Israel).\\n The major players in the artificial intelligence market include Google (US), Microsoft (US), IBM (US), Oracle (US), AWS (US), Intel (US), Salesforce (US), SAP (Germany), Cisco (US), Meta (US), HPE (US), Siemens (Germany), Huawei (China), NVIDIA (US), Baidu (China), SAS Institute (US), OpenAI (US), H2O.ai (US), iFLYTEK (China), Alibaba Cloud (China), General Vision (US), Darktrace (UK), Blackberry Limited (Canada), DiDi Global (China), Face++ (China), Inbenta (US), Anju Software (US), Butterfly Network (US), Atomwise (US), AIBrain (US), SK Hynix (South Korea), Progress (US), PrecisionHawk (US), AgEagle Aerial System (US), Neurala (US), Twitter (US), Aurea Software (US), Persado (US), 8x8 (US), Appier (Taiwan), GumGum (US), IPRO (US), Graphcore (UK), Preferred Networks (Japan), Applied Brain Research (Canada), Pilot AI (US), Iris Automation (US), Gamaya (Switzerland), ec2ce (Spain), Descartes Labs (US), Mythic (US), Ada (Canada), Mostly AI (Austria), Sentient.io (Singapore), Lumen5 (Canada), AI Superior (Germany), Fosfor (India), Intrinsic (US), Jasper (US), Soundful (US), Writesonic (US), One AI (Israel).\\n Information & Communications Technology\\nSemiconductor & Electronics\\nMedical Devices\\nChemicals\\nAdvanced Materials\\nEnergy and Power\\nFood and Beverage\\nBiotechnology\\nAerospace & Defence\\nAutomotive & Transportation\\nAutomation & Process Control\\nAgriculture Industry\\nPackaging\\nPharmaceuticals\\nHealthcare IT\\nPayer IT\\nPharmaceutical IT\\nProvider IT\\nAnalytical and Scientific Instrumentation\\nBuilding & Construction\\nMining, Minerals and Metals\\nEngineering Equipment and Devices The following is the breakup of primary profiles:\\nTo know about the assumptions considered for the study, download the pdf brochure\\nMarket Size Estimation\\nTo know about the assumptions considered for the study, Request for Free Sample Report\\nTop-down and bottom-up approaches were adopted for estimating and forecasting the artificial intelligence market. To know about the assumptions considered for the study, Request for Free Sample Report\\nTo know about the assumptions considered for the study, download the pdf brochure\\nArtificial Intelligence Market Growth Dynamics\\nThe increasing adoption of autonomous artificial intelligence (AI) is driving the growth of the Artificial Intelligence Market."}]', name='tavily_search_results_json', tool_call_id='call_t8ZL0IeFIlqLOogieZF9rQLs', artifact={'query': 'global AI software market size 2018, 2019, 2020, 2021, 2022', 'follow_up_questions': None, 'answer': None, 'images': [], 'results': [{'title': 'Global AI software market size 2018-2025', 'url': 'https://www.statista.com/statistics/607716/worldwide-artificial-intelligence-market-revenues/', 'content': 'Get in touch with us now. , Jul 27, 2022. The global artificial intelligence (AI) software market is forecast to grow rapidly in the coming years, reaching around 126 billion U.S. dollars by 2025 ...', 'score': 0.99901885, 'raw_content': None}, {'title': 'Gartner Forecasts Worldwide Artificial Intelligence Software Market to ...', 'url': 'https://www.gartner.com/en/newsroom/press-releases/2021-11-22-gartner-forecasts-worldwide-artificial-intelligence-software-market-to-reach-62-billion-in-2022', 'content': 'Market Growth Will Accelerate as Organizations Progress Their AI Maturity Worldwide artificial intelligence (AI) software revenue is forecast to total $62.5 billion in 2022, an increase of 21.3% from 2021, according to a new forecast from Gartner, Inc.', 'score': 0.99896777, 'raw_content': None}, {'title': 'Forecast Analysis: Artificial Intelligence Software, Worldwide', 'url': 'https://www.gartner.com/en/documents/4007140', 'content': 'Summary By 2025, the market for artificial intelligence (AI) software will reach almost $134.8 billion. Over the next five years, the market growth will accelerate from 14.4% in 2021 to reach 31.1% in 2025, considerably outpacing the overall software market growth.', 'score': 0.9984146, 'raw_content': None}, {'title': 'Artificial Intelligence Market Size, Share, Growth Report 2030', 'url': 'https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-ai-market', 'content': 'Artificial Intelligence Market Report Scope\nReport Attribute\nDetails\nMarket size value in 2023\nUSD 196.63 billion\nRevenue forecast in 2030\nUSD 1,811.75 billion\nGrowth rate\nCAGR of 37.3% from 2023 to 2030\nBase year for estimation\n2022\nHistorical data\n2017 - 2021\nForecast period\n2023 - 2030\nQuantitative units\nRevenue in USD billion, CAGR from 2023 to 2030\nReport coverage\nRevenue forecast, company ranking, competitive landscape, growth factors, and trends\nSegments covered\nSolution, technology, end-use, region\nRegional scope\nNorth America; Europe; Asia Pacific; South America; MEA\nCountry scope\nU.S.; Canada; Mexico; Germany; U.K.; China; Japan; India; Brazil\nKey companies profiled\nAdvanced Micro Devices; AiCure; Arm Limited; Atomwise, Inc.; Ayasdi AI LLC; Baidu, Inc.; Clarifai, Inc; Cyrcadia Health; Enlitic, Inc.; Google LLC; H2O.ai.; HyperVerge, Inc.; International Business Machines Corporation; IBM Watson Health; Intel Corporation; Iris.ai AS.; Deep Learning\nMachine Learning\nNatural Language Processing (NLP)\nMachine Vision\nEnd-use Outlook (Revenue, USD Billion, 2017 - 2030)\nHealthcare\nRobot-Assisted Surgery\nVirtual Nursing Assistants\nHospital Workflow Management\nDosage Error Reduction\nClinical Trial Participant Identifier\nPreliminary Diagnosis\nAutomated Image Diagnosis\nBFSI\nRisk Assessment\nFinancial Analysis/Research\nInvestment/Portfolio Management\nOthers\nLaw\nRetail\nAdvertising & Media\nAutomotive & Transportation\nAgriculture\nManufacturing\nOthers\nRegional Outlook (Revenue, USD Billion, 2017 - 2030)\n North America\nU.S.\nCanada\nMexico\nEurope\nGermany\nU.K.\nAsia Pacific\nChina\nJapan\nIndia\nSouth America\nBrazil\nMiddle East and Africa (MEA)\nFrequently Asked Questions About This Report\nb.\n b.\nKey factors that are driving the artificial intelligence market growth include a rise in the adoption of big data, analytics, and the increasing potential of R&D in developing AI systems and technological innovations across the globe.\n Artificial Intelligence Market Size, Share & Trends Analysis Report By Solution, By Technology (Deep Learning, Machine Learning), By End-use, By Region, And Segment Forecasts, 2023 - 2030\nReport Overview\nThe global artificial intelligence market size was valued at USD 136.55 billion in 2022 and is projected to expand at a compound annual growth rate (CAGR) of 37.3% from 2023 to 2030.', 'score': 0.9953544, 'raw_content': None}, {'title': 'Artificial Intelligence Market Size & Trends, Growth Analysis, Forecast ...', 'url': 'https://www.marketsandmarkets.com/Market-Reports/artificial-intelligence-market-74851580.html', 'content': "Get online access to the report on the World's First Market Intelligence Cloud\nEasy to Download Historical Data & Forecast Numbers\nCompany Analysis Dashboard for high growth potential opportunities\nResearch Analyst Access for customization & queries\nCompetitor Analysis with Interactive dashboard\nLatest News, Updates & Trend analysisRequest Sample\nClick on image to enlarge\nGet online access to the report on the World's First Market Intelligence Cloud\nScope of the Report\nReport Metrics\nDetails\nMarket size value in 2023\nUS $150.2 billion\nMarket Revenue in 2030\nUS $1,345.2 billion\nGrowth Rate\nCAGR of 36.8% from 2023 to 2030\nArtificial Intelligence Market Drivers\nMarket size available for years\n2017–2030\nBase year considered\n2022\nForecast period\n2023–2030\nForecast units\nUSD (Billion)\nSegments covered\nOffering, Technology, Business Function, Verticals, and Region\nGeographies covered\nNorth America, Europe, Asia Pacific, Middle East & Africa, and Latin America\nCompanies covered\nGoogle (US), Microsoft (US), IBM (US), Oracle (US), AWS (US), Intel (US), Salesforce (US), SAP (Germany), Cisco (US), Meta (US), HPE (US), Siemens (Germany), Huawei (China), NVIDIA (US), Baidu (China), SAS Institute (US), OpenAI (US), H2O.ai (US), iFLYTEK (China), Alibaba Cloud (China), General Vision (US), Darktrace (UK), Blackberry Limited (Canada), DiDi Global (China), Face++ (China), Inbenta (US), Anju Software (US), Butterfly Network (US), Atomwise (US), AIBrain (US), SK Hynix (South Korea), Progress (US), PrecisionHawk (US), AgEagle Aerial System (US), Neurala (US), Twitter (US), Aurea Software (US), Persado (US), 8x8 (US), Appier (Taiwan), GumGum (US), IPRO (US), Graphcore (UK), Preferred Networks (Japan), Applied Brain Research (Canada), Pilot AI (US), Iris Automation (US), Gamaya (Switzerland), ec2ce (Spain), Descartes Labs (US), Mythic (US), Ada (Canada), Mostly AI (Austria), Sentient.io (Singapore), Lumen5 (Canada), AI Superior (Germany), Fosfor (India), Intrinsic (US), Jasper (US), Soundful (US), Writesonic (US), One AI (Israel).\n The major players in the artificial intelligence market include Google (US), Microsoft (US), IBM (US), Oracle (US), AWS (US), Intel (US), Salesforce (US), SAP (Germany), Cisco (US), Meta (US), HPE (US), Siemens (Germany), Huawei (China), NVIDIA (US), Baidu (China), SAS Institute (US), OpenAI (US), H2O.ai (US), iFLYTEK (China), Alibaba Cloud (China), General Vision (US), Darktrace (UK), Blackberry Limited (Canada), DiDi Global (China), Face++ (China), Inbenta (US), Anju Software (US), Butterfly Network (US), Atomwise (US), AIBrain (US), SK Hynix (South Korea), Progress (US), PrecisionHawk (US), AgEagle Aerial System (US), Neurala (US), Twitter (US), Aurea Software (US), Persado (US), 8x8 (US), Appier (Taiwan), GumGum (US), IPRO (US), Graphcore (UK), Preferred Networks (Japan), Applied Brain Research (Canada), Pilot AI (US), Iris Automation (US), Gamaya (Switzerland), ec2ce (Spain), Descartes Labs (US), Mythic (US), Ada (Canada), Mostly AI (Austria), Sentient.io (Singapore), Lumen5 (Canada), AI Superior (Germany), Fosfor (India), Intrinsic (US), Jasper (US), Soundful (US), Writesonic (US), One AI (Israel).\n Information & Communications Technology\nSemiconductor & Electronics\nMedical Devices\nChemicals\nAdvanced Materials\nEnergy and Power\nFood and Beverage\nBiotechnology\nAerospace & Defence\nAutomotive & Transportation\nAutomation & Process Control\nAgriculture Industry\nPackaging\nPharmaceuticals\nHealthcare IT\nPayer IT\nPharmaceutical IT\nProvider IT\nAnalytical and Scientific Instrumentation\nBuilding & Construction\nMining, Minerals and Metals\nEngineering Equipment and Devices The following is the breakup of primary profiles:\nTo know about the assumptions considered for the study, download the pdf brochure\nMarket Size Estimation\nTo know about the assumptions considered for the study, Request for Free Sample Report\nTop-down and bottom-up approaches were adopted for estimating and forecasting the artificial intelligence market. To know about the assumptions considered for the study, Request for Free Sample Report\nTo know about the assumptions considered for the study, download the pdf brochure\nArtificial Intelligence Market Growth Dynamics\nThe increasing adoption of autonomous artificial intelligence (AI) is driving the growth of the Artificial Intelligence Market.", 'score': 0.99087435, 'raw_content': None}], 'response_time': 2.13})]}}
----
{'Researcher': {'messages': [AIMessage(content='Here is the data for the global AI software market size over the past five years:\n\n- 2018: $10.1 billion\n- 2019: $14.69 billion\n- 2020: $22.59 billion\n- 2021: $34.87 billion\n- 2022: $62.5 billion\n\n### Python Code to Generate the Line Chart\n\n```python\nimport matplotlib.pyplot as plt\n\n# Data\nyears = ["2018", "2019", "2020", "2021", "2022"]\nmarket_size = [10.1, 14.69, 22.59, 34.87, 62.5]\n\n# Create the plot\nplt.figure(figsize=(10, 6))\nplt.plot(years, market_size, marker=\'o\', linestyle=\'-\', color=\'b\')\n\n# Adding titles and labels\nplt.title("Global AI Software Market Size (2018-2022)")\nplt.xlabel("Year")\nplt.ylabel("Market Size (in billion USD)")\nplt.grid(True)\n\n# Display the plot\nplt.show()\n```\n\nThis script will generate a line chart showing the growth of the global AI software market size from 2018 to 2022.', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 253, 'prompt_tokens': 4562, 'total_tokens': 4815}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_157b3831f5', 'finish_reason': 'stop', 'logprobs': None}, name='Researcher', id='run-9c0880bd-f4fa-40a6-aa5b-0effe7d528e2-0', usage_metadata={'input_tokens': 4562, 'output_tokens': 253, 'total_tokens': 4815})], 'sender': 'Researcher'}}
----
{'chart_generator': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_FuausN6lrQVlOhEPUHyfvJQf', 'function': {'arguments': '{"code":"import matplotlib.pyplot as plt\\n\\n# Data\\nyears = [\\"2018\\", \\"2019\\", \\"2020\\", \\"2021\\", \\"2022\\"]\\nmarket_size = [10.1, 14.69, 22.59, 34.87, 62.5]\\n\\n# Create the plot\\nplt.figure(figsize=(10, 6))\\nplt.plot(years, market_size, marker=\'o\', linestyle=\'-\', color=\'b\')\\n\\n# Adding titles and labels\\nplt.title(\\"Global AI Software Market Size (2018-2022)\\")\\nplt.xlabel(\\"Year\\")\\nplt.ylabel(\\"Market Size (in billion USD)\\")\\nplt.grid(True)\\n\\n# Display the plot\\nplt.show()"}', 'name': 'python_repl'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 176, 'prompt_tokens': 4823, 'total_tokens': 4999}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_a2ff031fb5', 'finish_reason': 'tool_calls', 'logprobs': None}, name='chart_generator', id='run-90f8c5aa-4c1f-41fc-9ae4-dfadd0304c73-0', tool_calls=[{'name': 'python_repl', 'args': {'code': 'import matplotlib.pyplot as plt\n\n# Data\nyears = ["2018", "2019", "2020", "2021", "2022"]\nmarket_size = [10.1, 14.69, 22.59, 34.87, 62.5]\n\n# Create the plot\nplt.figure(figsize=(10, 6))\nplt.plot(years, market_size, marker=\'o\', linestyle=\'-\', color=\'b\')\n\n# Adding titles and labels\nplt.title("Global AI Software Market Size (2018-2022)")\nplt.xlabel("Year")\nplt.ylabel("Market Size (in billion USD)")\nplt.grid(True)\n\n# Display the plot\nplt.show()'}, 'id': 'call_FuausN6lrQVlOhEPUHyfvJQf', 'type': 'tool_call'}], usage_metadata={'input_tokens': 4823, 'output_tokens': 176, 'total_tokens': 4999})], 'sender': 'chart_generator'}}
----
Python REPL can execute arbitrary code. Use with caution.
{'call_tool': {'messages': [ToolMessage(content='成功执行:\n```python\nimport matplotlib.pyplot as plt\n\n# Data\nyears = ["2018", "2019", "2020", "2021", "2022"]\nmarket_size = [10.1, 14.69, 22.59, 34.87, 62.5]\n\n# Create the plot\nplt.figure(figsize=(10, 6))\nplt.plot(years, market_size, marker=\'o\', linestyle=\'-\', color=\'b\')\n\n# Adding titles and labels\nplt.title("Global AI Software Market Size (2018-2022)")\nplt.xlabel("Year")\nplt.ylabel("Market Size (in billion USD)")\nplt.grid(True)\n\n# Display the plot\nplt.show()\n```\nStdout: \n\n如果你已完成所有任务，请回复FINAL ANSWER。', name='python_repl', tool_call_id='call_FuausN6lrQVlOhEPUHyfvJQf')]}}
----
{'chart_generator': {'messages': [AIMessage(content='FINAL ANSWER\n\n以下是全球AI软件市场规模在2018年至2022年的变化折线图：\n\n![Global AI Software Market Size (2018-2022)](attachment://image.png)\n\n图表展示了过去五年全球AI软件市场规模的显著增长。', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 60, 'prompt_tokens': 5175, 'total_tokens': 5235}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_a2ff031fb5', 'finish_reason': 'stop', 'logprobs': None}, name='chart_generator', id='run-c6fd2097-ad78-4a21-b47f-13035931d3af-0', usage_metadata={'input_tokens': 5175, 'output_tokens': 60, 'total_tokens': 5235})], 'sender': 'chart_generator'}}
----
````

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/LangGraph%E7%AF%87-%E5%A4%9A%E4%BB%A3%E7%90%86%E5%8D%8F%E4%BD%9C_assets/LangGraph%E7%AF%87-%E5%A4%9A%E4%BB%A3%E7%90%86%E5%8D%8F%E4%BD%9C-O3HfbDCyBoJ5CKxvS8CcjSqDnGg.png)


