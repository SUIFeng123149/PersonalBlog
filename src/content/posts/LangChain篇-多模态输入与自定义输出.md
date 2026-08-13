---
title: "LangChain篇-多模态输入与自定义输出"
published: 2026-07-29
description: "一、多模态数据输入 这里我们演示如何将多模态输入直接传递给模型。我们目前期望所有输入都以与 期望的格式相同的格式传递。对于支持多模态输入的其他模型提供者，我们在类中添加了逻辑以转换为预期格式。 在这个例子中，我们将要求模型描述一幅图像。 API 参考： | 最常支持的传入图像的方式是将其作为字节字符串传入。这应该适用于大多数模型集成。 我们可以在“image\\ url”类型的内容块中直接提供图像 "
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
## 一、多模态数据输入

这里我们演示如何将多模态输入直接传递给模型。我们目前期望所有输入都以与 [OpenAI](https://platform.openai.com/docs/guides/vision) 期望的格式相同的格式传递。对于支持多模态输入的其他模型提供者，我们在类中添加了逻辑以转换为预期格式。

在这个例子中，我们将要求模型描述一幅图像。

```python
image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
```

```python
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")
```

**API 参考：**[HumanMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html) | [ChatOpenAI](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html)

最常支持的传入图像的方式是将其作为字节字符串传入。这应该适用于大多数模型集成。

```python
import base64
import httpx

image_data = base64.b64encode(httpx.get(image_url).content).decode("utf-8")
```

```python
message = HumanMessage(
    content=[
        {"type": "text", "text": "用中文描述这张图片中的天气"},
        {"type": "image_url","image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
        },
    ],
)
response = model.invoke([message])
print(response.content)
```

```txt
这张图片展示了一个晴朗的天气。天空中有一些淡淡的云，阳光明媚，照亮了图中的草地和木板路。天空呈现出明亮的蓝色，与绿色的草地形成了鲜明的对比。整体感觉是非常清新和舒适的，适合户外活动和散步。
```

我们可以在“image\_url”类型的内容块中直接提供图像 URL。请注意，只有部分模型提供商支持此功能。

```python
message = HumanMessage(
    content=[
        {"type": "text", "text": "用中文描述这张图片中的天气"},
        {"type": "image_url", "image_url": {"url": image_url}},
    ],
)
response = model.invoke([message])
print(response.content)
```

```txt
图片中的天气晴朗，天空中有一些稀薄的白云，整体呈现出蓝色。阳光明媚，光线充足，草地和树木显得非常绿意盎然。这种天气非常适合户外活动，比如散步或野餐。总的来说，天气非常舒适宜人。
```

我们还可以传入多幅图像。

```python
message = HumanMessage(
    content=[
        {"type": "text", "text": "这两张图片是一样的吗？"},
        {"type": "image_url", "image_url": {"url": image_url}},
        {"type": "image_url", "image_url": {"url": image_url}},
    ],
)
response = model.invoke([message])
print(response.content)
```

```txt
这两张图片不一样。第一张是一个晴天的草地景色，有一条木板小路通向远方；第二张是一个覆盖着雪的村庄，有多栋房屋和一些红色灯笼。两张图片显示的是完全不同的场景。
```

### [工具调用](https://python.langchain.com/v0.2/docs/how_to/multimodal_inputs/#tool-calls)

一些多模态模型也支持[工具调用功能。要使用此类模型调用工具，只需以](https://python.langchain.com/v0.2/docs/concepts/#functiontool-calling) [通常的方式](https://python.langchain.com/v0.2/docs/how_to/tool_calling/)将工具绑定到它们，然后使用所需类型的内容块（例如，包含图像数据）调用模型。

```python
from typing import Literalfrom langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def weather_tool(weather: Literal["晴朗的", "多云的", "多雨的","下雪的"]) -> None:
    """Describe the weather"""
    pass
    
model = ChatOpenAI(model="gpt-4o")
model_with_tools = model.bind_tools([weather_tool])
image_url_1 = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
image_url_2 = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Morning_in_China_Snow_Town.jpg/1280px-Morning_in_China_Snow_Town.jpg"

message = HumanMessage(
    content=[
        {"type": "text", "text": "用中文描述两张图片中的天气"},
        {"type": "image_url", "image_url": {"url": image_url_1}},
        {"type": "image_url", "image_url": {"url": image_url_2}},
    ],
)
response = model_with_tools.invoke([message])
print(response.tool_calls)
```

**API 参考：**[工具](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html)

```python
[{'name': 'weather_tool', 'args': {'weather': '晴朗的'}, 'id': 'call_7vbVxf7xnHvBqpO5SkVCt5xq', 'type': 'tool_call'}, {'name': 'weather_tool', 'args': {'weather': '下雪的'}, 'id': 'call_zm5zOZgSTd8R57N23aBbIfwX', 'type': 'tool_call'}]
```





## 二、自定义输出: JSON, XML, YAML

### 1. 如何解析 JSON 输出

虽然一些模型提供商支持内置的方法返回结构化输出，但并非所有都支持。我们可以使用输出解析器来帮助用户通过提示指定任意的 JSON 模式，查询符合该模式的模型输出，最后将该模式解析为 JSON。

请记住，大型语言模型是有泄漏的抽象！您必须使用具有足够容量的大型语言模型来生成格式良好的 JSON。

JsonOutputParser 是一个内置选项，用于提示并解析 JSON 输出。虽然它在功能上类似于 [PydanticOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html)，但它还支持流式返回部分 JSON 对象。

以下是如何将其与 [Pydantic](https://docs.pydantic.dev/) 一起使用以方便地声明预期模式的示例：

```python
%pip install -qU langchain langchain-openai
```

```python
#json_output_parser.pyfrom langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
model = ChatOpenAI(temperature=0)
# 定义您期望的数据结构。class Joke(BaseModel):
    setup: str = Field(description="设置笑话的问题")
    punchline: str = Field(description="解决笑话的答案")
# 还有一个用于提示语言模型填充数据结构的查询意图。
joke_query = "告诉我一个笑话。"# 设置解析器 + 将指令注入提示模板。
parser = JsonOutputParser(pydantic_object=Joke)
prompt = PromptTemplate(
    template="回答用户的查询。\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
chain = prompt | model | parser
chain.invoke({"query": joke_query})
```

```txt
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有很好的防火墙！'}
```

请注意，我们将解析器中的 `format_instructions` 直接传递到提示中。您可以并且应该尝试在提示的其他部分中添加自己的格式提示，以增强或替换默认指令：

```python
parser.get_format_instructions()
```

````json
'输出应格式化为符合以下 JSON 模式的 JSON 实例。\n\n例如，对于模式 {"properties": {"foo": {"title": "Foo", "description": "字符串列表", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}，对象 {"foo": ["bar", "baz"]} 是该模式的格式良好实例。对象 {"properties": {"foo": ["bar", "baz"]}} 不是格式良好的。\n\n这是输出模式：\n```\n{"properties": {"setup": {"title": "Setup", "description": "设置笑话的问题", "type": "string"}, "punchline": {"title": "Punchline", "description": "解决笑话的答案", "type": "string"}}, "required": ["setup", "punchline"]}\n```'
````

#### 流式处理

如上所述，`JsonOutputParser` 和 `PydanticOutputParser` 之间的一个关键区别是 `JsonOutputParser` 输出解析器支持流式处理部分块。以下是其示例：

```python
#json_output_parser_stream.py
for s in chain.stream({"query": joke_query}):
    print(s)
```

```txt
{}
{'setup': ''}
{'setup': '为什么'}
{'setup': '为什么计算'}
{'setup': '为什么计算机'}
{'setup': '为什么计算机不能'}
{'setup': '为什么计算机不能得'}
{'setup': '为什么计算机不能得感'}
{'setup': '为什么计算机不能得感冒'}
{'setup': '为什么计算机不能得感冒？'}
{'setup': '为什么计算机不能得感冒？', 'punchline': ''}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有很'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有很好的'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有很好的防'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有很好的防火'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有很好的防火墙'}
{'setup': '为什么计算机不能得感冒？', 'punchline': '因为它们有很好的防火墙！'}'
```

你也可以在没有 Pydantic 的情况下使用 `JsonOutputParser`。这将提示模型返回 JSON，但不提供关于模式应该是什么的具体信息。

```txt
#json_output_parser_no_pydantic.py
joke_query = "Tell me a joke."
parser = JsonOutputParser()
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
chain = prompt | model | parser
chain.invoke({"query": joke_query})
```

```txt
{'joke': '为什么数学书总是很难过？因为它有太多的问题！'}
```



### 2. 如何解析 XML 输出

下面使用 [XMLOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html) 来提示模型生成 XML 输出，然后将该输出解析为可用的格式。

我们可以使用 `XMLOutputParser` 将默认的格式指令添加到提示中，并将输出的 XML 解析为字典：

```python
#xml_output_parser.py
parser = XMLOutputParser()
# 我们将在下面的提示中添加这些指令
parser.get_format_instructions()
```

```txt
The output should be formatted as a XML file.
1.Output should conform to the tags below. 
2.If tags are not given, make them on your own.
3.Remember to always open and close all the tags.

As an example, for the tags ["foo", "bar", "baz"]:
1.String "<foo>
  <bar>
    <baz></baz>
  </bar>
</foo>" is a well-formatted instance of the schema. 
2.String "<foo>
  <bar>
  </foo>" is a badly-formatted instance.
3.String "<foo>
  <tag>
  </tag>
</foo>" is a badly-formatted instance.
```

```python
from langchain_openai import ChatOpenAI
# pip install -qU langchain langchain-openaifrom langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import XMLOutputParser
# pip install defusedxml

model = ChatOpenAI(model="gpt-4o", temperature=0)

# 还有一个用于提示语言模型填充数据结构的查询意图。
actor_query = "生成周星驰的简化电影作品列表，按照最新的时间降序"# 设置解析器 + 将指令注入提示模板。
parser = XMLOutputParser()
prompt = PromptTemplate(
    template="回答用户的查询。\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
# print(parser.get_format_instructions())
chain = prompt | model
response = chain.invoke({"query": actor_query})
xml_output = parser.parse(response.content)
print(response.content)
```

```xml
<movies><movie><title>美人鱼</title><year>2016</year></movie><movie><title>西游降魔篇</title><year>2013</year></movie><movie><title>长江七号</title><year>2008</year></movie><movie><title>功夫</title><year>2004</year></movie><movie><title>少林足球</title><year>2001</year></movie><movie><title>喜剧之王</title><year>1999</year></movie><movie><title>大话西游之大圣娶亲</title><year>1995</year></movie><movie><title>大话西游之月光宝盒</title><year>1995</year></movie><movie><title>唐伯虎点秋香</title><year>1993</year></movie><movie><title>逃学威龙</title><year>1991</year></movie></movies>
```

我们还可以添加一些标签以根据我们的需求定制输出。您可以在提示的其他部分中尝试添加自己的格式提示，以增强或替换默认指令：

```python
#xml_output_parser_enhance.py
parser = XMLOutputParser(tags=["movies", "actor", "film", "name", "genre"])
# 我们将在下面的提示中添加这些指令
parser.get_format_instructions()
```

```txt
The output should be formatted as a XML file.
1.Output should conform to the tags below. 
2.If tags are not given, make them on your own.
3.Remember to always open and close all the tags.

As an example, for the tags ["foo", "bar", "baz"]:
1.String "<foo>
  <bar>
      <baz></baz>
  </bar>
</foo>" is a well-formatted instance of the schema. 
2.String "<foo>
  <bar>
  </foo>" is a badly-formatted instance.
3.String "<foo>
  <tag>
  </tag>
</foo>" is a badly-formatted instance.

Here are the output tags:
['movies', 'actor', 'film', 'name', 'genre']
```

```txt
prompt = PromptTemplate(
    template="""{query}\n{format_instructions}""",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
chain = prompt | model | parser
output = chain.invoke({"query": actor_query})
print(output)
```

```xml
<movies><actor><name>周星驰</name><film><name>美人鱼</name><genre>喜剧, 奇幻</genre></film><film><name>西游降魔篇</name><genre>喜剧, 奇幻</genre></film><film><name>长江七号</name><genre>喜剧, 科幻</genre></film><film><name>功夫</name><genre>喜剧, 动作</genre></film><film><name>少林足球</name><genre>喜剧, 运动</genre></film></actor></movies>
```

这个输出解析器还支持部分数据流的处理。以下是一个示例：

```python
#xml_output_parser_stream.py
for s in chain.stream({"query": actor_query}):print(s)
```

```xml
{'movies': [{'actor': [{'name': '周星驰'}]}]}
{'movies': [{'actor': [{'film': [{'name': '美人鱼'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 奇幻'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': '西游·降魔篇'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 奇幻'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': '长江七号'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 科幻'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': '功夫'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 动作'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': '少林足球'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 运动'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': '喜剧之王'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 剧情'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': '大话西游之大圣娶亲'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 奇幻'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': '大话西游之月光宝盒'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': '喜剧, 奇幻'}]}]}]}
```



### 3. 如何解析 YAML 输出

来自不同提供商的大型语言模型（LLMs）通常根据它们训练的具体数据具有不同的优势。这也意味着有些模型在生成 JSON 以外的格式输出方面可能更“优秀”和可靠。

这个输出解析器允许用户指定任意模式，并查询符合该模式的 LLMS 输出，使用 YAML 格式化他们的响应。

```python
%pip install -qU langchain langchain-openai
```

我们使用 [Pydantic](https://docs.pydantic.dev/) 与 [YamlOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html#langchain.output_parsers.yaml.YamlOutputParser) 来声明我们的数据模型，并为模型提供更多关于应生成何种类型 YAML 的上下文信息：

```python
#yaml_output_parser.py
# pip install -qU langchain langchain-openai
from langchain.output_parsers import YamlOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

# 定义您期望的数据结构。class Joke(BaseModel):
    setup: str = Field(description="设置笑话的问题")
    punchline: str = Field(description="解答笑话的答案")
    
model = ChatOpenAI(temperature=0)
# 创建一个查询，旨在提示语言模型填充数据结构。
joke_query = "告诉我一个笑话。"# 设置一个解析器 + 将指令注入到提示模板中。
parser = YamlOutputParser(pydantic_object=Joke)
prompt = PromptTemplate(
    template="回答用户的查询。\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
chain = prompt | model
print(parser.get_format_instructions())
response = chain.invoke({"query": joke_query})
print(response.content)
#print(parser.parse(response))
```

```yaml
setup: 为什么程序员总是在深夜工作？
punchline: 因为那时候比较安静，没有人会打扰他们的思绪。
```

解析器将自动解析输出的 YAML，并创建一个带有数据的 Pydantic 模型。我们可以看到解析器的 `format_instructions`，这些指令被添加到提示中：

```python
parser.get_format_instructions()
```

```markdown
# Examples
## Schema
```

{"title": "Players", "description": "A list of players", "type": "array", "items": {"$ref": "#/definitions/Player"}, "definitions": {"Player": {"title": "Player", "type": "object", "properties": {"name": {"title": "Name", "description": "Player name", "type": "string"}, "avg": {"title": "Avg", "description": "Batting average", "type": "number"}}, "required": \["name", "avg"]}}}

```txt
## Well formatted instance
```

* name: John Doe avg: 0.3

* name: Jane Maxfield avg: 1.4

```txt
## Schema
```

{"properties": {"habit": { "description": "A common daily habit", "type": "string" }, "sustainable\_alternative": { "description": "An environmentally friendly alternative to the habit", "type": "string"}}, "required": \["habit", "sustainable\_alternative"]}

```txt
## Well formatted instance
```

habit: Using disposable water bottles for daily hydration. sustainable\_alternative: Switch to a reusable water bottle to reduce plastic waste and decrease your environmental footprint.

```txt
Please follow the standard YAML formatting conventions with an indent of 2 spaces and make sure that the data types adhere strictly to the following JSON schema: 
```

{"properties": {"setup": {"title": "Setup", "description": "\u8bbe\u7f6e\u7b11\u8bdd\u7684\u95ee\u9898", "type": "string"}, "punchline": {"title": "Punchline", "description": "\u89e3\u7b54\u7b11\u8bdd\u7684\u7b54\u6848", "type": "string"}}, "required": \["setup", "punchline"]}

````txt
Make sure to always enclose the YAML output in triple backticks (```). Please do not add anything other than valid YAML output!
````

```txt
可以尝试在提示的其他部分中添加自己的格式提示，以增强或替换默认指令。
```


