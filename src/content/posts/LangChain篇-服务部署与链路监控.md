---
title: "LangChain篇-服务部署与链路监控"
published: 2026-07-29
description: "一、LangServe 服务部署 1. 概述 帮助开发者将 LangChain 部署为 REST API。 该库集成了 并使用 进行数据验证。 Pydantic 是一个在 Python 中用于数据验证和解析的第三方库，现在是 Python 中使用广泛的数据验证库。 它利用声明式的方式定义数据模型和 Python 类型提示的强大功能来执行数据验证和序列化，使您的代码更可靠、更可读、更简洁且更易于调试"
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
## 一、LangServe 服务部署

### 1. 概述

[LangServe](https://github.com/langchain-ai/langserve) 帮助开发者将 `LangChain` [可运行和链](https://python.langchain.com/docs/expression_language/)部署为 REST API。

该库集成了 [FastAPI](https://fastapi.tiangolo.com/) 并使用 [pydantic](https://docs.pydantic.dev/latest/) 进行数据验证。

**Pydantic** 是一个在 Python 中用于数据验证和解析的第三方库，现在是 Python 中使用广泛的数据验证库。

* 它利用声明式的方式定义数据模型和 Python 类型提示的强大功能来执行数据验证和序列化，使您的代码更可靠、更可读、更简洁且更易于调试。

* 它还可以从模型生成 JSON 架构，提供了自动生成文档等功能，从而轻松与其他工具集成。

此外，它提供了一个客户端，可用于调用部署在服务器上的可运行对象。JavaScript 客户端可在 [LangChain.js](https://js.langchain.com/docs/ecosystem/langserve) 中找到。



### 2. 特性

* 从 LangChain 对象自动推断输入和输出模式，并在每次 API 调用中执行，提供丰富的错误信息

* 带有 JSONSchema 和 Swagger 的 API 文档页面（插入示例链接）

* 高效的 `/invoke`、`/batch` 和 `/stream` 端点，支持单个服务器上的多个并发请求

* `/stream_log` 端点，用于流式传输链/代理的所有（或部分）中间步骤

* **新功能** 自 0.0.40 版本起，支持 `/stream_events`，使流式传输更加简便，无需解析 `/stream_log` 的输出

* 使用经过严格测试的开源 Python 库构建，如 FastAPI、Pydantic、uvloop 和 asyncio

* 使用客户端 SDK 调用 LangServe 服务器，就像本地运行可运行对象一样（或直接调用 HTTP API）



### 3. 限制

* 目前不支持服务器发起的事件的客户端回调。

* 当使用 Pydantic V2 时，将不会生成 OpenAPI 文档。FastAPI 支持[混合使用 pydantic v1 和 v2 命名空间](https://github.com/tiangolo/fastapi/issues/10360)。更多细节请参见下面的章节。



### 4. 安装

对于客户端和服务器：

```bash
pip install --upgrade "langserve[all]" 
```

或者对于客户端代码，`pip install "langserve[client]"`；对于服务器代码，`pip install "langserve[server]"`。



### 5. LangChain CLI 🛠️

使用 `LangChain` CLI 快速启动 `LangServe` 项目。

要使用 langchain CLI，请确保已安装最新版本的 `langchain-cli`。

```json
pip install -U langchain-cli
```



### 6. 设置

**注意**：我们使用 `poetry` 进行依赖管理。请参阅 poetry [文档](https://python-poetry.org/docs/) 了解更多信息。

1. 使用 langchain cli 命令创建新应用

```txt
langchain app new [project_name]
```

* 在 add\_routes 中定义可运行对象，转到 server.py 并编辑

```txt
add_routes(app. NotImplemented)
```

* 使用 `poetry` 添加第三方包（例如 langchain-openai、langchain-anthropic、langchain-mistral 等）

```powershell
# 安装pipx，参考：https://pipx.pypa.io/stable/installation/
pip install pipx 
# 加入到环境变量，需要重启PyCharm 
pipx ensurepath

# 安装poetry，参考：https://python-poetry.org/docs/
pipx install poetry

# 安装 langchain-openai 库，例如：poetry add [package-name]
poetry add langchain
poetry add langchain-openai 
```

* 设置相关环境变量。例如，

```txt
export OPENAI_API_KEY="sk-..."
```

* 启动您的应用

```txt
poetry run langchain serve --port=8000
```



### 7. 服务器

以下是一个部署 OpenAI 聊天模型，讲述有关特定主题笑话的链的服务器。

```python
#!/usr/bin/env pythonfrom fastapi import FastAPI
from langchain_openai import ChatOpenAI
from langserve import add_routes
app = FastAPI(
    title="LangChain 服务器",
    version="1.0",
    description="使用 Langchain 的 Runnable 接口的简单 API 服务器",
)
add_routes(
    app,
    ChatOpenAI(model="gpt-4"),
    path="/openai",
)
if name == "__main__":import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
```

如果您打算从浏览器调用您的端点，您还需要设置 CORS 头。

您可以使用 FastAPI 的内置中间件来实现：

```python
from fastapi.middleware.cors import CORSMiddleware
# 设置所有启用 CORS 的来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```



### 8. 文档

如果您已部署上述服务器，可以使用以下命令查看生成的 OpenAPI 文档：

文档地址：<http://localhost:8000/docs>

```txt
curl localhost:8000/docs
```

请确保**添加** `/docs` 后缀。

⚠️ 首页 `/` 没有被**设计**定义，因此 `curl localhost:8000` 或访问该 URL 将返回 404。如果您想在 `/` 上有内容，请定义一个端点 `@app.get("/")`。



### 9. 客户端

Python SDK

```python
from langchain.schema.runnable import RunnableMap
from langchain_core.prompts import ChatPromptTemplate
from langserve import RemoteRunnable

openai = RemoteRunnable("http://localhost:8000/openai/")
prompt = ChatPromptTemplate.from_messages(
    [("system", "你是一个喜欢写故事的助手"), ("system", "写一个故事，主题是： {topic}")]
)
# 可以定义自定义链
chain = prompt | RunnableMap({"openai": openai
})
response = chain.batch([{"topic": "猫"}])
print(response)
#[{'openai': AIMessage(content='从前，有一个叫做肖恩的男孩，他在一个宁静的乡村里生活。一天，他在家的后院发现了一个小小的，萌萌的猫咪。这只猫咪有一双大大的蓝色眼睛，毛色如同朝霞般的粉色，看起来非常可爱。\n\n肖恩把这只猫咪带回了家，他给她取名为“樱花”，因为她的毛色让他联想到春天盛开的樱花。肖恩非常喜欢樱花，他用心照顾她，每天都会为她准备新鲜的食物和清水，还会陪她玩耍，带她去散步。\n\n樱花也非常喜欢肖恩，她会在肖恩读书的时候躺在他的脚边，会在他伤心的时候安慰他，每当肖恩回家的时候，她总是第一个跑出来迎接他。可是，樱花有一个秘密，她其实是一只会说人话的猫。\n\n这个秘密是在一个月圆的夜晚被肖恩发现的。那天晚上，肖恩做了一个噩梦，他从梦中惊醒，发现樱花正坐在他的床边，用人的语言安慰他。肖恩一开始以为自己在做梦，但是当他清醒过来，樱花还在继续讲话，他才知道这是真的。\n\n樱花向肖恩解释，她是一只来自神秘的猫咪国度的使者，她的任务是保护和帮助那些善良和爱护动物的人。肖恩因为对她的善良和照顾，使她决定向他展现真实的自我。\n\n肖恩虽然感到惊讶，但他并没有因此而害怕或者排斥樱花。他觉得这只使得他更加喜欢樱花，觉得这是他们之间的特殊纽带。\n\n从那天开始，肖恩和樱花的关系变得更加亲密，他们像最好的朋友一样，分享彼此的秘密，一起度过快乐的时光。樱花也用她的智慧和力量，帮助肖恩解决了许多困扰他的问题。\n\n许多年过去了，肖恩长大了，他离开了乡村，去了城市上大学。但是，无论他走到哪里，都会带着樱花。他们的友情和互相的陪伴，让他们无论在哪里，都能感到家的温暖。\n\n最后，肖恩成为了一名作家，他写下了自己和樱花的故事，这个故事被人们广为传播，让更多的人知道了这个关于善良、友情和勇气的故事。而樱花，也永远陪伴在肖恩的身边，成为他生活中不可或缺的一部分。\n\n这就是肖恩和樱花的故事，一个关于男孩和他的猫的故事，充满了奇迹、温暖和爱。', response_metadata={'token_usage': {'completion_tokens': 1050, 'prompt_tokens': 33, 'total_tokens': 1083}, 'model_name': 'gpt-4-0613', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-c44f1624-ea75-424b-ba3d-e741baf44bda-0', usage_metadata={'input_tokens': 33, 'output_tokens': 1050, 'total_tokens': 1083})}]
```

在 TypeScript 中（需要 LangChain.js 版本 0.0.166 或更高）：

```typescript
import { RemoteRunnable } from "@langchain/core/runnables/remote";
const chain = new RemoteRunnable({
    url: `http://localhost:8000/openai/`,
});
const result = await chain.invoke({
    topic: "cats",
});
```

使用 `requests` 的 Python 代码：

```python
import requests
response = requests.post("http://localhost:8000/openai",
    json={'input': {'topic': 'cats'}}
)
response.json()
```

您也可以使用 `curl`：

```powershell
curl --location --request POST 'http://localhost:8000/openai/stream' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "input": {
            "topic": "狗"
        }
    }'
```



### 10. 端点

以下代码：

```python
...
add_routes(
    app,
    runnable,
    path="/my_runnable",
)
```

将以下端点添加到服务器：

* `POST /my_runnable/invoke` - 对单个输入调用可运行项

* `POST /my_runnable/batch` - 对一批输入调用可运行项

* `POST /my_runnable/stream` - 对单个输入调用并流式传输输出

* `POST /my_runnable/stream_log` - 对单个输入调用并流式传输输出，包括生成的中间步骤的输出

* `POST /my_runnable/astream_events` - 对单个输入调用并在生成时流式传输事件，包括来自中间步骤的事件

* `GET /my_runnable/input_schema` - 可运行项的输入的 JSON 模式

* `GET /my_runnable/output_schema` - 可运行项的输出的 JSON 模式

* `GET /my_runnable/config_schema` - 可运行项的配置的 JSON 模式

这些端点与 [LangChain 表达式语言接口](https://python.langchain.com/docs/expression_language/interface)相匹配 。





## 二、LangChain 服务监控

与构建任何类型的软件一样，使用 LLM 构建时，总会有调试的需求。模型调用可能会失败，模型输出可能格式错误，或者可能存在一些嵌套的模型调用，不清楚在哪一步出现了错误的输出。 有三种主要的调试方法：

* 详细模式（Verbose）：为你的链中的“重要”事件添加打印语句。

* 调试模式（Debug）：为你的链中的所有事件添加日志记录语句。

* LangSmith 跟踪：将事件记录到 [LangSmith](https://docs.smith.langchain.com/)，以便在那里进行可视化。

### 1. LangSmith Tracing（跟踪）

使用 LangChain 构建的许多应用程序将包含多个步骤，其中包含多次 LLM 调用。 随着这些应用程序变得越来越复杂，能够检查链或代理内部发生了什么变得至关重要。 这样做的最佳方式是使用 [LangSmith](https://smith.langchain.com/)。 在上面的链接上注册后，请确保设置你的环境变量以开始记录跟踪：

LangSmith 官网：<https://smith.langchain.com/>

tavily 官网：<https://tavily.com/>

```powershell
#windows导入环境变量
#配置LangSmith 监控开关，true开启，false关闭
setx LANGCHAIN_TRACING_V2 "true"
#配置 LangSmith api key
setx LANGCHAIN_API_KEY "..."
#配置 taily api key
setx TAVILY_API_KEY "..."

#mac 导入环境变量
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
export TAVILY_API_KEY="..."
```

假设我们有一个代理，并且希望可视化它所采取的操作和接收到的工具输出。在没有任何调试的情况下，这是我们看到的：

```python
import os
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain.globals import set_verbose

llm = ChatOpenAI(model="gpt-4o")
tools = [TavilySearchResults(max_results=1)]
prompt = ChatPromptTemplate.from_messages(
    [
        ("system","你是一位得力的助手。",),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)
# 构建工具代理
agent = create_tool_calling_agent(llm, tools, prompt)
set_verbose(True)
# 通过传入代理和工具来创建代理执行器
agent_executor = AgentExecutor(agent=agent, tools=tools)
agent_executor.invoke(
    {"input": "谁执导了2023年的电影《奥本海默》，他多少岁了？"}
)
```

```json
{'input': '谁执导了2023年的电影《奥本海默》，他多少岁了？', 'output': '克里斯托弗·诺兰（Christopher Nolan）出生于1970年7月30日。截至2023年，他53岁。'}
```

我们没有得到太多输出，但由于我们设置了 LangSmith，我们可以轻松地看到发生了什么： <https://smith.langchain.com/public/a89ff88f-9ddc-4757-a395-3a1b365655bf/r>



### 2. Verbose（详细日志打印）

如果你在 Jupyter 笔记本中进行原型设计或运行 Python 脚本，打印出链运行的中间步骤可能会有所帮助。 有许多方法可以以不同程度的详细程度启用打印。 注意：即使启用了 LangSmith，这些仍然有效，因此你可以同时打开并运行它们。

`set_verbose(True)`

设置 `verbose` 标志将以稍微更易读的格式打印出输入和输出，并将跳过记录某些原始输出（例如 LLM 调用的令牌使用统计信息），以便您可以专注于应用程序逻辑。

```python
from langchain.globals import set_verbose
set_verbose(True)
agent_executor = AgentExecutor(agent=agent, tools=tools)
agent_executor.invoke(
    {"input": "Who directed the 2023 film Oppenheimer and what is their age in days?"}
)
```

```powershell
Entering new AgentExecutor chain...
Invoking: tavily_search_results_json with `{'query': '2023 movie Oppenheimer director'}`
[{'url': 'https://www.imdb.com/title/tt15398776/fullcredits/', 'content': 'Oppenheimer (2023) cast and crew credits, including actors, actresses, directors, writers and more. Menu. ... director of photography: behind-the-scenes Jason Gary ... best boy grip ... film loader Luc Poullain ... aerial coordinator'}]
Invoking: `tavily_search_results_json` with `{'query': 'Christopher Nolan age'}`
[{'url': 'https://www.nme.com/news/film/christopher-nolan-fans-are-celebrating-his-54th-birthday-youve-changed-things-forever-3779396', 'content': "Christopher Nolan is 54 Still my fave bit of Nolan trivia: Joey Pantoliano on creating Ralph Cifaretto's look in The Sopranos: 'The wig I had them build as an homage to Chris Nolan, I like ..."}]2023年的电影《奥本海默》由克里斯托弗·诺兰（Christopher Nolan）执导。他目前54岁。
> Finished chain.
```

```json
{'input': '谁执导了2023年的电影《奥本海默》，他多少岁了？', 'output': '克里斯托弗·诺兰（Christopher Nolan）出生于1970年7月30日。截至2023年，他53岁。'}
```



### 3. Debug（调试日志打印）

`set_debug(True)`

设置全局的 `debug` 标志将导致所有具有回调支持的 LangChain 组件（链、模型、代理、工具、检索器）打印它们接收的输入和生成的输出。这是最详细的设置，将完全记录原始输入和输出。

```python
from langchain.globals import set_debug
# 构建工具代理
agent = create_tool_calling_agent(llm, tools, prompt)
# 打印调试日志
set_debug(True)
# 不输出详细日志
set_verbose(False)
# 通过传入代理和工具来创建代理执行器
agent_executor = AgentExecutor(agent=agent, tools=tools)
agent_executor.invoke(
    {"input": "谁执导了2023年的电影《奥本海默》，他多少岁了？"}
)
```

```powershell
[chain/start] [chain:AgentExecutor] Entering Chain run with input:
{"input": "谁执导了2023年的电影《奥本海默》，他多少岁了？"
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad>] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad>] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad> > chain:RunnableLambda] Entering Chain run with input:
{"input": ""
}
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad> > chain:RunnableLambda] [1ms] Exiting Chain run with output:
{"output": []
}
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad>] [4ms] Exiting Chain run with output:
{"agent_scratchpad": []
}
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad>] [10ms] Exiting Chain run with output:
{"input": "谁执导了2023年的电影《奥本海默》，他多少岁了？","intermediate_steps": [],"agent_scratchpad": []
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > prompt:ChatPromptTemplate] Entering Prompt run with input:
{"input": "谁执导了2023年的电影《奥本海默》，他多少岁了？","intermediate_steps": [],"agent_scratchpad": []
}
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > prompt:ChatPromptTemplate] [1ms] Exiting Prompt run with output:
[outputs]
[llm/start] [chain:AgentExecutor > chain:RunnableSequence > llm:ChatOpenAI] Entering LLM run with input:
{"prompts": ["System: 你是一位得力的助手。\nHuman: 谁执导了2023年的电影《奥本海默》，他多少岁了？"
  ]
}
[llm/end] [chain:AgentExecutor > chain:RunnableSequence > llm:ChatOpenAI] [1.81s] Exiting LLM run with output:
{"generations": [
    [
      {"text": "","generation_info": {"finish_reason": "tool_calls","model_name": "gpt-4o-2024-05-13","system_fingerprint": "fp_4e2b2da518"
        },"type": "ChatGenerationChunk","message": {"lc": 1,"type": "constructor","id": ["langchain","schema","messages","AIMessageChunk"
          ],"kwargs": {"content": "","additional_kwargs": {"tool_calls": [
                {"index": 0,"id": "call_Rhv2KLzFTU0XhJso5F79EiUp","function": {"arguments": "{\"query\":\"2023年电影《奥本海默》导演\"}","name": "tavily_search_results_json"
                  },"type": "function"
                }
              ]
            },"response_metadata": {"finish_reason": "tool_calls","model_name": "gpt-4o-2024-05-13","system_fingerprint": "fp_4e2b2da518"
            },"type": "AIMessageChunk","id": "run-cbeb35e8-b4ee-4c78-b663-e338ef90382d","tool_calls": [
              {"name": "tavily_search_results_json","args": {"query": "2023年电影《奥本海默》导演"
                },"id": "call_Rhv2KLzFTU0XhJso5F79EiUp","type": "tool_call"
              }
            ],"tool_call_chunks": [
              {"name": "tavily_search_results_json","args": "{\"query\":\"2023年电影《奥本海默》导演\"}","id": "call_Rhv2KLzFTU0XhJso5F79EiUp","index": 0,"type": "tool_call_chunk"
              }
            ],"invalid_tool_calls": []
          }
        }
      }
    ]
  ],"llm_output": null,"run": null
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > parser:ToolsAgentOutputParser] Entering Parser run with input:
[inputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > parser:ToolsAgentOutputParser] [2ms] Exiting Parser run with output:
[outputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence] [1.85s] Exiting Chain run with output:
[outputs]
[tool/start] [chain:AgentExecutor > tool:tavily_search_results_json] Entering Tool run with input:
"{'query': '2023年电影《奥本海默》导演'}"
[tool/end] [chain:AgentExecutor > tool:tavily_search_results_json] [2.06s] Exiting Tool run with output:
"[{'url': 'https://baike.baidu.com/item/奥本海默/58802734', 'content': '《奥本海默》是克里斯托弗·诺兰自编自导的，由基里安·墨菲主演的传记电影，该片于2023年7月21日在北美上映，8月30日在中国内地上映，2024年3月29日在日本上映。该片改编自Kai Bird、Martin J. Sherwin的《美国普罗米修斯：奥本海默的胜与悲》，影片《奥本海默》讲述了美国"原子弹之父"罗伯特· ...'}]"
[chain/start] [chain:AgentExecutor > chain:RunnableSequence] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad>] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad>] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad> > chain:RunnableLambda] Entering Chain run with input:
{"input": ""
}
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad> > chain:RunnableLambda] [1ms] Exiting Chain run with output:
[outputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad>] [4ms] Exiting Chain run with output:
[outputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad>] [10ms] Exiting Chain run with output:
[outputs]
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > prompt:ChatPromptTemplate] Entering Prompt run with input:
[inputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > prompt:ChatPromptTemplate] [1ms] Exiting Prompt run with output:
[outputs]
[llm/start] [chain:AgentExecutor > chain:RunnableSequence > llm:ChatOpenAI] Entering LLM run with input:
{"prompts": ["System: 你是一位得力的助手。\nHuman: 谁执导了2023年的电影《奥本海默》，他多少岁了？\nAI: \nTool: [{\"url\": \"https://baike.baidu.com/item/奥本海默/58802734\", \"content\": \"《奥本海默》是克里斯托弗·诺兰自编自导的，由基里安·墨菲主演的传记电影，该片于2023年7月21日在北美上映，8月30日在中国内地上映，2024年3月29日在日本上映。该片改编自Kai Bird、Martin J. Sherwin的《美国普罗米修斯：奥本海默的胜与悲》，影片《奥本海默》讲述了美国\\\"原子弹之父\\\"罗伯特· ...\"}]"
  ]
}
[llm/end] [chain:AgentExecutor > chain:RunnableSequence > llm:ChatOpenAI] [1.39s] Exiting LLM run with output:
{"generations": [
    [
      {"text": "2023年电影《奥本海默》的导演是克里斯托弗·诺兰。接下来我将查询他的年龄。","generation_info": {"finish_reason": "tool_calls","model_name": "gpt-4o-2024-05-13","system_fingerprint": "fp_4e2b2da518"
        },"type": "ChatGenerationChunk","message": {"lc": 1,"type": "constructor","id": ["langchain","schema","messages","AIMessageChunk"
          ],"kwargs": {"content": "2023年电影《奥本海默》的导演是克里斯托弗·诺兰。接下来我将查询他的年龄。","additional_kwargs": {"tool_calls": [
                {"index": 0,"id": "call_QuKQUKd6YLsgTgZeYcWpk2lN","function": {"arguments": "{\"query\":\"克里斯托弗·诺兰年龄\"}","name": "tavily_search_results_json"
                  },"type": "function"
                }
              ]
            },"response_metadata": {"finish_reason": "tool_calls","model_name": "gpt-4o-2024-05-13","system_fingerprint": "fp_4e2b2da518"
            },"type": "AIMessageChunk","id": "run-b7ee6125-1af5-4073-b81e-076a859755bd","tool_calls": [
              {"name": "tavily_search_results_json","args": {"query": "克里斯托弗·诺兰年龄"
                },"id": "call_QuKQUKd6YLsgTgZeYcWpk2lN","type": "tool_call"
              }
            ],"tool_call_chunks": [
              {"name": "tavily_search_results_json","args": "{\"query\":\"克里斯托弗·诺兰年龄\"}","id": "call_QuKQUKd6YLsgTgZeYcWpk2lN","index": 0,"type": "tool_call_chunk"
              }
            ],"invalid_tool_calls": []
          }
        }
      }
    ]
  ],"llm_output": null,"run": null
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > parser:ToolsAgentOutputParser] Entering Parser run with input:
[inputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > parser:ToolsAgentOutputParser] [1ms] Exiting Parser run with output:
[outputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence] [1.43s] Exiting Chain run with output:
[outputs]
[tool/start] [chain:AgentExecutor > tool:tavily_search_results_json] Entering Tool run with input:
"{'query': '克里斯托弗·诺兰年龄'}"
[tool/end] [chain:AgentExecutor > tool:tavily_search_results_json] [2.89s] Exiting Tool run with output:
"[{'url': 'https://baike.baidu.com/item/克里斯托弗·诺兰/5306405', 'content': '克里斯托弗·诺兰（Christopher Nolan），1970年7月30日出生于英国伦敦，导演、编剧、制片人。1998年4月24日克里斯托弗·诺兰拍摄的首部故事片《追随》在旧金山电影节上映。2000年，克里斯托弗·诺兰凭借着他的《记忆碎片》为他获得第74届奥斯卡的提名。2005年，执导《蝙蝠侠》三部曲系列首部电影 ...'}]"
[chain/start] [chain:AgentExecutor > chain:RunnableSequence] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad>] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad>] Entering Chain run with input:
{"input": ""
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad> > chain:RunnableLambda] Entering Chain run with input:
{"input": ""
}
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad> > chain:RunnableLambda] [1ms] Exiting Chain run with output:
[outputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad> > chain:RunnableParallel<agent_scratchpad>] [4ms] Exiting Chain run with output:
[outputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > chain:RunnableAssign<agent_scratchpad>] [9ms] Exiting Chain run with output:
[outputs]
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > prompt:ChatPromptTemplate] Entering Prompt run with input:
[inputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > prompt:ChatPromptTemplate] [2ms] Exiting Prompt run with output:
[outputs]
[llm/start] [chain:AgentExecutor > chain:RunnableSequence > llm:ChatOpenAI] Entering LLM run with input:
{"prompts": ["System: 你是一位得力的助手。\nHuman: 谁执导了2023年的电影《奥本海默》，他多少岁了？\nAI: \nTool: [{\"url\": \"https://baike.baidu.com/item/奥本海默/58802734\", \"content\": \"《奥本海默》是克里斯托弗·诺兰自编自导的，由基里安·墨菲主演的传记电影，该片于2023年7月21日在北美上映，8月30日在中国内地上映，2024年3月29日在日本上映。该片改编自Kai Bird、Martin J. Sherwin的《美国普罗米修斯：奥本海默的胜与悲》，影片《奥本海默》讲述了美国\\\"原子弹之父\\\"罗伯特· ...\"}]\nAI: 2023年电影《奥本海默》的导演是克里斯托弗·诺兰。接下来我将查询他的年龄。\nTool: [{\"url\": \"https://baike.baidu.com/item/克里斯托弗·诺兰/5306405\", \"content\": \"克里斯托弗·诺兰（Christopher Nolan），1970年7月30日出生于英国伦敦，导演、编剧、制片人。1998年4月24日克里斯托弗·诺兰拍摄的首部故事片《追随》在旧金山电影节上映。2000年，克里斯托弗·诺兰凭借着他的《记忆碎片》为他获得第74届奥斯卡的提名。2005年，执导《蝙蝠侠》三部曲系列首部电影 ...\"}]"
  ]
}
[llm/end] [chain:AgentExecutor > chain:RunnableSequence > llm:ChatOpenAI] [885ms] Exiting LLM run with output:
{"generations": [
    [
      {"text": "克里斯托弗·诺兰（Christopher Nolan）出生于1970年7月30日。根据当前时间（2023年），他53岁。","generation_info": {"finish_reason": "stop","model_name": "gpt-4o-2024-05-13","system_fingerprint": "fp_4e2b2da518"
        },"type": "ChatGenerationChunk","message": {"lc": 1,"type": "constructor","id": ["langchain","schema","messages","AIMessageChunk"
          ],"kwargs": {"content": "克里斯托弗·诺兰（Christopher Nolan）出生于1970年7月30日。根据当前时间（2023年），他53岁。","response_metadata": {"finish_reason": "stop","model_name": "gpt-4o-2024-05-13","system_fingerprint": "fp_4e2b2da518"
            },"type": "AIMessageChunk","id": "run-0cc2156a-5a9d-41c2-b8bc-ecb2a291f408","tool_calls": [],"invalid_tool_calls": []
          }
        }
      }
    ]
  ],"llm_output": null,"run": null
}
[chain/start] [chain:AgentExecutor > chain:RunnableSequence > parser:ToolsAgentOutputParser] Entering Parser run with input:
[inputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence > parser:ToolsAgentOutputParser] [1ms] Exiting Parser run with output:
[outputs]
[chain/end] [chain:AgentExecutor > chain:RunnableSequence] [914ms] Exiting Chain run with output:
[outputs]
[chain/end] [chain:AgentExecutor] [9.25s] Exiting Chain run with output:
{"output": "克里斯托弗·诺兰（Christopher Nolan）出生于1970年7月30日。根据当前时间（2023年），他53岁。"
}
```

```json
{'input': '谁执导了2023年的电影《奥本海默》，他多少岁了？', 'output': '克里斯托弗·诺兰（Christopher Nolan）出生于1970年7月30日。根据当前时间（2023年），他53岁。'}
```


