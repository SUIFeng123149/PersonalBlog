---
title: "LangChain篇-自定义Callback组件"
published: 2026-07-29
description: "一、回调概念 LangChain 提供了一个回调系统，允许您连接到 LLM 应用程序的各个阶段。这对于日志记录、监控、流式处理和其他任务非常有用。 您可以通过使用 API 中的 callbacks 参数订阅这些事件。这个参数是处理程序对象的列表，这些处理程序对象应该实现下面更详细描述的一个或多个方法。 二、回调事件 三、回调处理程序 CallbackHandlers 是实现了 接口的对象，该接口对"
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
## 一、回调概念

LangChain 提供了一个回调系统，允许您连接到 LLM 应用程序的各个阶段。这对于日志记录、监控、流式处理和其他任务非常有用。 您可以通过使用 API 中的 `callbacks` 参数订阅这些事件。这个参数是处理程序对象的列表，这些处理程序对象应该实现下面更详细描述的一个或多个方法。



## 二、回调事件(Callback Events)



## 三、回调处理程序

`CallbackHandlers` 是实现了 [CallbackHandler](https://api.python.langchain.com/en/latest/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html#langchain-core-callbacks-base-basecallbackhandler) 接口的对象，该接口对应于可以订阅的每个事件都有一个方法。 当事件触发时，`CallbackManager` 将在每个处理程序上调用适当的方法。

参考：<https://api.python.langchain.com/en/latest/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html#langchain-core-callbacks-base-basecallbackhandler>

```python
#示例：callback_run.py
class BaseCallbackHandler:
    """可以用来处理langchain回调的基本回调处理程序。"""
    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> Any:
        """LLM开始运行时运行。"""
    def on_chat_model_start(
        self, serialized: Dict[str, Any], messages: List[List[BaseMessage]], **kwargs: Any
    ) -> Any:
        """聊天模型开始运行时运行。"""
    # 其他方法省略...
```



## 四、传递回调函数

`callbacks` 属性在 API 的大多数对象（模型、工具、代理等）中都可用，在两个不同的位置上：

* **构造函数回调**：在构造函数中定义，例如 `ChatOpenAI;(callbacks=[handler], tags=['a-tag'])`。在这种情况下，回调函数将用于该对象上的所有调用，并且仅限于该对象。 例如，如果你使用构造函数回调初始化了一个聊天模型，然后在链式调用中使用它，那么回调函数只会在对该模型的调用中被调用。

* **请求回调**：传递给用于发出请求的 `invoke` 方法。在这种情况下，回调函数仅用于该特定请求，以及它包含的所有子请求（例如，调用触发对模型的调用的序列的调用，该模型使用在 `invoke()` 方法中传递的相同处理程序）。 在 `invoke()` 方法中，通过 `config` 参数传递回调函数。



## 五、在运行时传递回调函数

许多情况下，当运行对象时，传递处理程序而不是回调函数会更有优势。当我们在执行运行时使用 `callbacks` 关键字参数传递 [CallbackHandlers](https://api.python.langchain.com/en/latest/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html#langchain-core-callbacks-base-basecallbackhandler) 时，这些回调函数将由执行中涉及的所有嵌套对象发出。例如，当通过一个处理程序传递给一个代理时，它将用于与代理相关的所有回调以及代理执行中涉及的所有对象，即工具和 LLM。

这样可以避免我们手动将处理程序附加到每个单独的嵌套对象上。以下是一个示例：

```python
# 示例：callback_run.py
# 导入所需的类型提示和类
from typing import Any, Dict, Listfrom langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import BaseMessage
from langchain_core.outputs import LLMResult
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# 定义一个日志处理器类，继承自BaseCallbackHandler
class LoggingHandler(BaseCallbackHandler):
    # 当聊天模型开始时调用的方法
    def on_chat_model_start(
            self, serialized: Dict[str, Any], messages: List[List[BaseMessage]], **kwargs
    ) -> None:
        print("Chat model started")  # 打印“Chat model started”
    
    # 当LLM结束时调用的方法
    def on_llm_end(self, response: LLMResult, **kwargs) -> None:
        print(f"Chat model ended, response: {response}")  # 打印“Chat model ended, response: {response}”
        
    # 当链开始时调用的方法
    def on_chain_start(
            self, serialized: Dict[str, Any], inputs: Dict[str, Any], **kwargs) -> None:
        print(f"Chain started, inputs:{inputs}")  # 打印“Chain {serialized.get('name')} started”
        
    # 当链结束时调用的方法
    def on_chain_end(
            self, outputs: Dict[str, Any], **kwargs) -> None:
        print(f"Chain ended, outputs: {outputs}")  # 打印“Chain ended, outputs: {outputs}”
        
# 创建一个包含LoggingHandler实例的回调列表
callbacks = [LoggingHandler()]

# 实例化一个ChatOpenAI对象，使用gpt-4模型
llm = ChatOpenAI(model="gpt-4")

# 创建一个聊天提示模板，模板内容为“What is 1 + {number}?”
prompt = ChatPromptTemplate.from_template("What is 1 + {number}?")

# 将提示模板和LLM组合成一个链
chain = prompt | llm

# 调用链的invoke方法，传入参数number为"2"，并配置回调
chain.invoke({"number": "2"}, config={"callbacks": callbacks})
```

```python
Chain started, inputs:{'number': '2'}
Chain started, inputs:{'number': '2'}
Chain ended, outputs: messages=[HumanMessage(content='What is 1 + 2?', additional_kwargs={}, response_metadata={})]
Chat model started
Chat model ended, response: generations=[[ChatGeneration(text='3', generation_info={'finish_reason': 'stop', 'logprobs': None}, message=AIMessage(content='3', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 15, 'total_tokens': 16, 'completion_tokens_details': {'audio_tokens': None, 'reasoning_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': None, 'cached_tokens': 0}}, 'model_name': 'gpt-4-0613', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-48925f3f-9bbf-4f13-8d48-b76757ffac32-0', usage_metadata={'input_tokens': 15, 'output_tokens': 1, 'total_tokens': 16, 'input_token_details': {'cache_read': 0}, 'output_token_details': {'reasoning': 0}}))]] llm_output={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 15, 'total_tokens': 16, 'completion_tokens_details': {'audio_tokens': None, 'reasoning_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': None, 'cached_tokens': 0}}, 'model_name': 'gpt-4-0613', 'system_fingerprint': None} run=None type='LLMResult'
Chain ended, outputs: content='3' additional_kwargs={'refusal': None} response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 15, 'total_tokens': 16, 'completion_tokens_details': {'audio_tokens': None, 'reasoning_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': None, 'cached_tokens': 0}}, 'model_name': 'gpt-4-0613', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None} id='run-48925f3f-9bbf-4f13-8d48-b76757ffac32-0' usage_metadata={'input_tokens': 15, 'output_tokens': 1, 'total_tokens': 16, 'input_token_details': {'cache_read': 0}, 'output_token_details': {'reasoning': 0}}
```



## 六、自定义 callback handlers 自定义 Chat model

LangChain 具有一些内置的回调处理程序，但通常您会希望创建具有自定义逻辑的自定义处理程序。

要创建自定义回调处理程序，我们需要确定我们希望处理的 [event(s)](https://api.python.langchain.com/en/latest/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html#langchain-core-callbacks-base-basecallbackhandler)，以及在触发事件时我们希望回调处理程序执行的操作。然后，我们只需将回调处理程序附加到对象上，例如通过[构造函数](http://www.aidoczh.com/langchain/v0.2/docs/how_to/callbacks_constructor/)或[运行时](http://www.aidoczh.com/langchain/v0.2/docs/how_to/callbacks_runtime/)。

在下面的示例中，我们将使用自定义处理程序实现流式处理。

在我们的自定义回调处理程序 `MyCustomHandler` 中，我们实现了 `on_llm_new_token` 处理程序，以打印我们刚收到的令牌。然后，我们将自定义处理程序作为构造函数回调附加到模型对象上。

```python
# 示例：callback_process.py
from langchain_openai import ChatOpenAI
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.prompts import ChatPromptTemplate

class MyCustomHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs) -> None:
        print(f"My custom handler, token: {token}")
        
prompt = ChatPromptTemplate.from_messages(["给我讲个关于{animal}的笑话，限制20个字"])
# 为启用流式处理，我们在ChatModel构造函数中传入`streaming=True`
# 另外，我们将自定义处理程序作为回调参数的列表传入
model = ChatOpenAI(
    model="gpt-4", streaming=True, callbacks=[MyCustomHandler()]
)
chain = prompt | model
response = chain.invoke({"animal": "猫"})
print(response.content)
```

```txt
My custom handler, token: 
My custom handler, token: 猫
My custom handler, token: 对
My custom handler, token: 主
My custom handler, token: 人
My custom handler, token: 说
My custom handler, token: ："
My custom handler, token: 你
My custom handler, token: 知
My custom handler, token: 道
My custom handler, token: 我
My custom handler, token: 为
My custom handler, token: 什
My custom handler, token: 么
My custom handler, token: 不
My custom handler, token: 笑
My custom handler, token: 吗
My custom handler, token: ？
My custom handler, token: "
My custom handler, token:  主
My custom handler, token: 人
My custom handler, token: 摇
My custom handler, token: 头
My custom handler, token: ，
My custom handler, token: 猫
My custom handler, token: 说
My custom handler, token: ："
My custom handler, token: 因
My custom handler, token: 为
My custom handler, token: 我
My custom handler, token: 是
My custom handler, token: '
My custom handler, token: 喵
My custom handler, token: '
My custom handler, token: 星
My custom handler, token: 人
My custom handler, token: ，
My custom handler, token: 不
My custom handler, token: 是
My custom handler, token: 笑
My custom handler, token: 星
My custom handler, token: 人
My custom handler, token: 。
My custom handler, token: "
My custom handler, token: 
猫对主人说："你知道我为什么不笑吗？" 主人摇头，猫说："因为我是'喵'星人，不是笑星人。"
```

可以查看[此参考页面](https://api.python.langchain.com/en/latest/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html#langchain-core-callbacks-base-basecallbackhandler)以获取您可以处理的事件列表。请注意，`handle_chain_*` 事件适用于大多数 LCEL 可运行对象。

<https://api.python.langchain.com/en/latest/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html#langchain-core-callbacks-base-basecallbackhandler>


