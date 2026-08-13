---
title: "LangChain篇-提示词工程应用实践"
published: 2026-07-29
description: "一、Prompt templates（提示词模板） 语言模型以文本作为输入，这个文本通常被称为提示词（prompt）。在开发过程中，对于提示词通常不能直接硬编码，不利于提示词管理，而是通过提示词模板进行维护，类似开发过程中遇到的短信模板、邮件模板等等。 1. 什么是提示词模板？ 提示词模板本质上跟平时大家使用的邮件模板、短信模板没什么区别，就是一个字符串模板，模板可以包含一组模板参数，通过模板参数"
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
## 一、Prompt templates（提示词模板）

语言模型以文本作为输入，这个文本通常被称为提示词（prompt）。在开发过程中，对于提示词通常不能直接硬编码，不利于提示词管理，而是通过提示词模板进行维护，类似开发过程中遇到的短信模板、邮件模板等等。

### 1. 什么是提示词模板？

提示词模板本质上跟平时大家使用的邮件模板、短信模板没什么区别，就是一个字符串模板，模板可以包含一组模板参数，通过模板参数值可以替换模板对应的参数。

一个提示词模板可以包含下面内容：

* 发给大语言模型（LLM）的指令。

* 一组问答示例，以提醒 AI 以什么格式返回请求。

* 发给语言模型的问题。



### 2. 创建一个提示词模板（prompt template）

可以使用 `PromptTemplate` 类创建简单的提示词。提示词模板可以内嵌任意数量的模板参数，然后通过参数值格式化模板内容。

```python
from langchain.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    "给我讲一个关于{content}的{adjective}笑话。"
)

result = prompt_template.format(adjective="冷", content="猴子")
print(result)
```



### 3. 聊天消息提示词模板（chat prompt template）

聊天模型（Chat Model）以聊天消息列表作为输入，这个聊天消息列表的消息内容也可以通过提示词模板进行管理。这些聊天消息与原始字符串不同，因为每个消息都与“角色（role）”相关联。

例如，在通义千问的框架下，聊天模型支持为聊天消息指定特定的角色类型，以便更好地指导对话流程和内容生成。具体来说，这些角色类型包括：

* 系统（System）：这类消息通常用于设置 AI 的行为准则或者提供背景信息，帮助确定AI回复的风格、限制等。

* 用户（User）：代表由用户发出的消息内容，即输入给AI的问题或陈述。

* 助手（Assistant）：指当前消息是由 AI 助手生成的回答内容。

```makefile
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一位人工智能助手，你的名字是{name}。"),
        ("human", "你好"),
        ("ai", "我很好，谢谢！"),
        ("human", "{user_input}"),
    ]
)

messages = chat_template.format_messages(name="Bob", user_input="你的名字叫什么？")
print(messages)
```

另外一种消息格式：

```python
from langchain.prompts import HumanMessagePromptTemplate
from langchain_core.messages import SystemMessage
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=("你是一个乐于助人的助手，可以润色内容，使其看起来起来更简单易读。"
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

messages = chat_template.format_messages(text="我不喜欢吃好吃的东西")
print(messages)
```

通常我们不会直接使用 format\_messages 函数格式化提示模板（prompt templae）内容, 而是交给 Langchain 框架自动处理。



### 4. MessagesPlaceholder

这个提示模板负责在特定位置添加消息列表。如果希望将用户传入的一个消息列表插入到特定位置，可以使用 MessagesPlaceholder 的方式。

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage

prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant"),
    MessagesPlaceholder("msgs")
])

messages = prompt_template.invoke({"msgs": [HumanMessage(content="hi!")]})
print(messages)
```

&#x20;另一种实现相同效果的替代方法是，不直接使用 `MessagesPlaceholder` 类，而是：

```python
prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant"),
    ("placeholder", "{msgs}")
])
```





## 二、提示词追加示例（Few-shot prompt templates）

在与大语言模型交互时，我们常常会遇到这样的问题：模型不能准确理解我们的任务意图，或者输出格式不一致。这时，我们可以在提示词中加入样本，帮助模型更好地理解用户的意图，从而更好地回答问题或执行任务。

小样本提示模板是指使用一组少量的示例来指导模型处理新的输入。这些示例可以用来训练模型，以便模型可以更好地理解和回答类似的问题。

例子：

```python
Q: 什么是蝙蝠侠？
A: 蝙蝠侠是一个虚构的漫画人物。

Q: 什么是torsalplexity？
A: 未知。

Q: 什么是语言模型？
A:
```

### 1. 使用示例集

* **创建示例集**

定义一个 examples 示例数组，里面包含一组问答样例。

```python
from langchain.prompts.few_shot import FewShotPromptTemplate
from langchain.prompts.prompt import PromptTemplate

examples = [
  {"question": "谁的寿命更长，穆罕默德·阿里还是艾伦·图灵？","answer":
"""
这里需要跟进问题吗：是的。
跟进：穆罕默德·阿里去世时多大？
中间答案：穆罕默德·阿里去世时74岁。
跟进：艾伦·图灵去世时多大？
中间答案：艾伦·图灵去世时41岁。
所以最终答案是：穆罕默德·阿里
"""
  },
  {"question": "craigslist的创始人是什么时候出生的？","answer":
"""
这里需要跟进问题吗：是的。
跟进：craigslist的创始人是谁？
中间答案：craigslist由Craig Newmark创立。
跟进：Craig Newmark是什么时候出生的？
中间答案：Craig Newmark于1952年12月6日出生。
所以最终答案是：1952年12月6日
"""
  },
  {"question": "乔治·华盛顿的祖父母中的母亲是谁？","answer":
"""
这里需要跟进问题吗：是的。
跟进：乔治·华盛顿的母亲是谁？
中间答案：乔治·华盛顿的母亲是Mary Ball Washington。
跟进：Mary Ball Washington的父亲是谁？
中间答案：Mary Ball Washington的父亲是Joseph Ball。
所以最终答案是：Joseph Ball
"""
  },
  {"question": "《大白鲨》和《皇家赌场》的导演都来自同一个国家吗？","answer":
"""
这里需要跟进问题吗：是的。
跟进：《大白鲨》的导演是谁？
中间答案：《大白鲨》的导演是Steven Spielberg。
跟进：Steven Spielberg来自哪里？
中间答案：美国。
跟进：《皇家赌场》的导演是谁？
中间答案：《皇家赌场》的导演是Martin Campbell。
跟进：Martin Campbell来自哪里？
中间答案：新西兰。
所以最终答案是：不是
"""
  }
]
```

* **创建小样本示例的格式化程序**

通过 `PromptTemplate` 对象，简单的在提示词模板中插入样例。

```python
example_prompt = PromptTemplate(input_variables=["question", "answer"], template="问题：{question}\\n{answer}")

print(example_prompt.format(**examples[0]))
```

* **将示例和格式化程序提供给 `FewShotPromptTemplate`**

通过 `FewShotPromptTemplate` 对象，批量插入示例内容。

```python
prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    suffix="问题：{input}",
    input_variables=["input"]
)

print(prompt.format(input="乔治·华盛顿的父亲是谁？"))
```



### 2. 使用示例选择器

* **将示例提供给 `ExampleSelector`**

这里重用前一部分中的示例集和提示词模板，但是不会将示例直接提供给 `FewShotPromptTemplate` 对象，把全部示例插入到提示词中，而是将它们提供给一个 `ExampleSelector` 对象，插入部分示例。

这里我们使用 `SemanticSimilarityExampleSelector` 类。该类根据与输入的相似性选择小样本示例。它使用嵌入模型计算输入和小样本示例之间的相似性，然后使用向量数据库执行相似搜索，获取跟输入相似的示例。

```python
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.vectorstores import Chroma

example_selector = SemanticSimilarityExampleSelector.from_examples(
    # 可供选择的示例列表
    examples,
    # 用于生成向量的嵌入类，该向量用于衡量语义相似性
    DashScopeEmbeddings(),
    # 用于存储向量和执行相似性搜索的VectorStore类
    Chroma,
    # 要生成的示例数
    k=1
)
```

* **将示例选择器提供给 `FewShotPromptTemplate`**

最后，创建一个 `FewShotPromptTemplate` 对象。根据前面的 example\_selector 示例选择器，选择一个跟问题相似的例子。

```lua
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    suffix="问题：{input}",
    input_variables=["input"]
)

print(prompt.format(input="乔治·华盛顿的父亲是谁？"))
```


