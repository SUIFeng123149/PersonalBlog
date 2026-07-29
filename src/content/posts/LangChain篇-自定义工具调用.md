---
title: LangChain篇-自定义工具调用
published: 2026-07-29
description: ''
image: ''
tags: ['LangChain']
category: 'LangChain'
draft: false
lang: zh-CN
---
## 一、自定义工具

在构建代理时，您需要为其提供一个 `Tool` 列表，以便代理可以使用这些工具。除了实际调用的函数之外，`Tool` 由几个组件组成：

LangChain 提供了三种创建工具的方式：

* 使用 [@tool装饰器](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html#langchain_core.tools.tool) -- 定义自定义工具的最简单方式。

* 使用 [StructuredTool.from\_function](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.StructuredTool.html#langchain_core.tools.StructuredTool.from_function) 类方法 -- 这类似于`@tool`装饰器，但允许更多配置和同步和异步实现的规范。

* 通过子类化[BaseTool](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.BaseTool.html) -- 这是最灵活的方法，它提供了最大程度的控制，但需要更多的工作量和代码。`@tool` 或 `StructuredTool.from_function` 类方法对于大多数用例应该足够了。 提示 如果工具具有精心选择的名称、描述和 JSON 模式，模型的性能会更好。

### 1. @tool 装饰器

这个 `@tool` 装饰器是定义自定义工具的最简单方式。该装饰器默认使用函数名称作为工具名称，但可以通过传递字符串作为第一个参数来覆盖。此外，装饰器将使用函数的文档字符串作为工具的描述 - 因此必须提供文档字符串。

```python
#示例：tools_decorator.py
from langchain_core.tools import tool
@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b
# 检查与该工具关联的一些属性
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```plain&#x20;text
multiply
multiply(a: int, b: int) -> int - Multiply two numbers.
{'a': {'title': 'A', 'type': 'integer'}, 'b': {'title': 'B', 'type': 'integer'}}
```

或者创建一个**异步**实现，如下所示：

```python
#示例：tools_async.py
from langchain_core.tools import tool
@tool
async def amultiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b
```

您还可以通过将它们传递给工具装饰器来自定义工具名称和 JSON 参数。

```python
from pydantic import BaseModel, Field
class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")
@tool("multiplication-tool", args_schema=CalculatorInput, return_direct=True)
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b
# 检查与该工具关联的一些属性
print(multiply.name)
print(multiply.description)
print(multiply.args)
print(multiply.return_direct)
```

```plain&#x20;text
multiplication-tool
multiplication-tool(a: int, b: int) -> int - Multiply two numbers.
{'a': {'title': 'A', 'description': 'first number', 'type': 'integer'}, 'b': {'title': 'B', 'description': 'second number', 'type': 'integer'}}
True
```



### 2. StructuredTool

`StructuredTool.from_function` 类方法提供了比 `@tool` 装饰器更多的可配置性，而无需太多额外的代码。

```python
from langchain_core.tools import StructuredTool
import asyncio

def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b

async def amultiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b

async def main():
    calculator = StructuredTool.from_function(func=multiply, coroutine=amultiply)
    print(calculator.invoke({"a": 2, "b": 3}))
    print(await calculator.ainvoke({"a": 2, "b": 5}))

# 运行异步主函数
asyncio.run(main())
```

```plain&#x20;text
6
10
```

可以配置自定义参数

```python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
import asyncio

class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")

def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b

# 创建一个异步包装器函数
async def async_addition(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a + b
async def main():
    calculator = StructuredTool.from_function(
        func=multiply,
        name="Calculator",
        description="multiply numbers",
        args_schema=CalculatorInput,
        return_direct=True,
        #coroutine= async_addition
        # coroutine= ... <- 如果需要，也可以指定异步方法
    )print(calculator.invoke({"a": 2, "b": 3}))
    #print(await calculator.ainvoke({"a": 2, "b": 5}))
    print(calculator.name)
    print(calculator.description)
    print(calculator.args)

# 运行异步主函数
asyncio.run(main())
```

### 处理工具错误

如果您正在使用带有代理的工具，您可能需要一个错误处理策略，以便代理可以从错误中恢复并继续执行。 一个简单的策略是在工具内部抛出 `ToolException`，并使用 `handle_tool_error` 指定一个错误处理程序。 当指定了错误处理程序时，异常将被捕获，错误处理程序将决定从工具返回哪个输出。 您可以将 `handle_tool_error` 设置为 `True`、字符串值或函数。如果是函数，该函数应该以 `ToolException` 作为参数，并返回一个值。 请注意，仅仅抛出 `ToolException` 是不会生效的。您需要首先设置工具的 `handle_tool_error`，因为其默认值是 `False`。

```python
from langchain_core.tools import ToolException
def get_weather(city: str) -> int:
    """获取给定城市的天气。"""
    raise ToolException(f"错误：没有名为{city}的城市。")
```

下面是一个使用默认的 `handle_tool_error=True` 行为的示例。

```python
# 示例：tools_exception.py
get_weather_tool = StructuredTool.from_function(
    func=get_weather,
    handle_tool_error=True,
)
get_weather_tool.invoke({"city": "foobar"})
```

```plain&#x20;text
'错误：没有名为foobar的城市。'
```

我们可以将 `handle_tool_error` 设置为一个始终返回的字符串。

```python
# 示例：tools_exception_handle.py
get_weather_tool = StructuredTool.from_function(
    func=get_weather,
    handle_tool_error="没找到这个城市",
)
get_weather_tool.invoke({"city": "foobar"})
```

```plain&#x20;text
"没有这样的城市，但可能在那里的温度超过0K！"
```

使用函数处理错误：

```python
# 示例：tools_exception_handle_error.py
def _handle_error(error: ToolException) -> str:
    return f"工具执行期间发生以下错误：`{error.args[0]}`"
get_weather_tool = StructuredTool.from_function(
    func=get_weather,
    handle_tool_error=_handle_error,
)
get_weather_tool.invoke({"city": "foobar"})
```

```plain&#x20;text
'工具执行期间发生以下错误：错误：没有名为foobar的城市。'
```





## 二、调用内置工具包和拓展工具

### 1. 工具

工具是代理、链或聊天模型/LLM 用来与世界交互的接口。 一个工具由以下组件组成：

1. 工具的名称

2. 工具的功能描述

3. 工具输入的 JSON 模式

4. 要调用的函数

5. 工具的结果是否应直接返回给用户（仅对代理相关） 名称、描述和 JSON 模式作为上下文提供给 LLM，允许 LLM 适当地确定如何使用工具。 给定一组可用工具和提示，LLM 可以请求调用一个或多个工具，并提供适当的参数。 通常，在设计供聊天模型或 LLM 使用的工具时，重要的是要牢记以下几点：

* 经过微调以进行工具调用的聊天模型将比未经微调的模型更擅长进行工具调用。

* 未经微调的模型可能根本无法使用工具，特别是如果工具复杂或需要多次调用工具。

* 如果工具具有精心选择的名称、描述和 JSON 模式，则模型的性能将更好。

* 简单的工具通常比更复杂的工具更容易让模型使用。

LangChain 拥有大量第三方工具。请访问[工具集成](http://www.aidoczh.com/langchain/v0.2/docs/integrations/tools/)查看可用工具列表。

<https://python.langchain.com/v0.2/docs/integrations/tools/>

在使用第三方工具时，请确保您了解工具的工作原理、权限情况。请阅读其文档，并检查是否需要从安全角度考虑任何事项。请查看[安全](https://python.langchain.com/v0.1/docs/security/)指南获取更多信息。

让我们尝试一下[维基百科集成](http://www.aidoczh.com/langchain/v0.2/docs/integrations/tools/wikipedia/)。

```python
!pip install -qU wikipedia
```

```python
# 示例：tools_wikipedia.py
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
print(tool.invoke({"query": "langchain"}))
```

```plain&#x20;text
Page: LangChain
Summary: LangChain is a framework designed to simplify the creation of applications
```

该工具具有以下默认关联项：

```python
print(f"Name: {tool.name}")
print(f"Description: {tool.description}")
print(f"args schema: {tool.args}")
print(f"returns directly?: {tool.return_direct}")
```

```plain&#x20;text
Name: wikipedia
Description: A wrapper around Wikipedia. Useful for when you need to answer general questions about people, places, companies, facts, historical events, or other subjects. Input should be a search query.
args schema: {'query': {'title': 'Query', 'description': 'query to look up on wikipedia', 'type': 'string'}}
returns directly?: False
```



### 2. 自定义默认工具

我们还可以修改内置工具的名称、描述和参数的 JSON 模式。

在定义参数的 JSON 模式时，重要的是输入保持与函数相同，因此您不应更改它。但您可以轻松为每个输入定义自定义描述。

```python
#示例：tools_custom.py
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from pydantic import BaseModel, Field
class WikiInputs(BaseModel):
    """维基百科工具的输入。"""
    query: str = Field(
        description="query to look up in Wikipedia, should be 3 or less words"
    )
tool = WikipediaQueryRun(
    name="wiki-tool",
    description="look up things in wikipedia",
    args_schema=WikiInputs,
    api_wrapper=api_wrapper,
    return_direct=True,
)
print(tool.run("langchain"))
```

```plain&#x20;text
Page: LangChain
Summary: LangChain is a framework designed to simplify the creation of applications 
```

```python
print(f"Name: {tool.name}")
print(f"Description: {tool.description}")
print(f"args schema: {tool.args}")
print(f"returns directly?: {tool.return_direct}")
```

```plain&#x20;text
Name: wiki-tool
Description: look up things in wikipedia
args schema: {'query': {'title': 'Query', 'description': 'query to look up in Wikipedia, should be 3 or less words', 'type': 'string'}}
returns directly?: True
```



### 3. 如何使用内置工具包

工具包是一组旨在一起使用以执行特定任务的工具。它们具有便捷的加载方法。

要获取可用的现成工具包完整列表，请访问[集成](http://www.aidoczh.com/langchain/v0.2/docs/integrations/toolkits/)。

所有工具包都公开了一个 `get_tools` 方法，该方法返回一个工具列表。

通常您应该这样使用它们：

```python
# 初始化一个工具包
toolkit = ExampleTookit(...)
# 获取工具列表
tools = toolkit.get_tools()
```

***

例如，使用SQLDatabase toolkit 读取 langchain.db 数据库表结构：

```python
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain.agents.agent_types import AgentType

db = SQLDatabase.from_uri("sqlite:///langchain.db")
toolkit = SQLDatabaseToolkit(db=db, llm=ChatOpenAI(temperature=0))
print(toolkit.get_tools())

agent_executor = create_sql_agent(
    llm=ChatOpenAI(temperature=0, model="gpt-4"),
    toolkit=toolkit,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS
)
# %%
agent_executor.invoke("Describe the full_llm_cache table")
```

执行 print(toolkit.get\_tools())

```python
[QuerySQLDataBaseTool(description="Input to this tool is a detailed and correct SQL query, output is a result from the database. If the query is not correct, an error message will be returned. If an error is returned, rewrite the query, check the query, and try again. If you encounter an issue with Unknown column 'xxxx' in 'field list', use sql_db_schema to query the correct table fields.", db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x000001D15C9749B0>), InfoSQLDatabaseTool(description='Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables. Be sure that the tables actually exist by calling sql_db_list_tables first! Example Input: table1, table2, table3', db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x000001D15C9749B0>), ListSQLDatabaseTool(db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x000001D15C9749B0>), QuerySQLCheckerTool(description='Use this tool to double check if your query is correct before executing it. Always use this tool before executing a query with sql_db_query!', db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x000001D15C9749B0>, llm=ChatOpenAI(client=<openai.resources.chat.completions.Completions object at 0x000001D17B4453D0>, async_client=<openai.resources.chat.completions.AsyncCompletions object at 0x000001D17B446D80>, temperature=0.0, openai_api_key=SecretStr('**********'), openai_proxy=''), llm_chain=LLMChain(prompt=PromptTemplate(input_variables=['dialect', 'query'], template='\n{query}\nDouble check the {dialect} query above for common mistakes, including:\n- Using NOT IN with NULL values\n- Using UNION when UNION ALL should have been used\n- Using BETWEEN for exclusive ranges\n- Data type mismatch in predicates\n- Properly quoting identifiers\n- Using the correct number of arguments for functions\n- Casting to the correct data type\n- Using the proper columns for joins\n\nIf there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.\n\nOutput the final SQL query only.\n\nSQL Query: '), llm=ChatOpenAI(client=<openai.resources.chat.completions.Completions object at 0x000001D17B4453D0>, async_client=<openai.resources.chat.completions.AsyncCompletions object at 0x000001D17B446D80>, temperature=0.0, openai_api_key=SecretStr('**********'), openai_proxy='')))]
```

执行：agent\_executor.invoke("Describe the full\_llm\_cache table")

```python
Entering new SQL Agent Executor chain...
Invoking: sql_db_schema with `{'table_names': 'full_llm_cache'}`
CREATE TABLE full_llm_cache (
        prompt VARCHAR NOT NULL,
        llm VARCHAR NOT NULL,
        idx INTEGER NOT NULL,
        response VARCHAR,
        PRIMARY KEY (prompt, llm, idx)
)
/*
3 rows from full_llm_cache table:
prompt        llm        idx        response
[{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs        {"id": ["langchain", "chat_models", "openai", "ChatOpenAI"], "kwargs": {"max_retries": 2, "model_nam        0        {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "output", "ChatGeneration"], "kwargs"
*/The `full_llm_cache` table has the following structure:
- `prompt`: A VARCHAR field that is part of the primary key. It cannot be NULL.
- `llm`: A VARCHAR field that is also part of the primary key. It cannot be NULL.
- `idx`: An INTEGER field that is part of the primary key as well. It cannot be NULL.
- `response`: A VARCHAR field that can contain NULL values.
Here are some sample rows from the `full_llm_cache` table:
| prompt | llm | idx | response |
|--------|-----|-----|----------|
| [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs | {"id": ["langchain", "chat_models", "openai", "ChatOpenAI"], "kwargs": {"max_retries": 2, "model_nam | 0 | {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "output", "ChatGeneration"], "kwargs" |
> Finished chain.
```

