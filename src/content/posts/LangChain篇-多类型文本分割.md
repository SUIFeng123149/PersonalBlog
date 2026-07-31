---
title: LangChain篇-多类型文本分割
published: 2026-07-29
description: ''
image: ''
tags: ['LangChain']
category: 'LangChain'
draft: false
lang: zh-CN
---
在处理文本数据时，文本分割是一个重要的步骤，尤其是在处理长文本或将文本数据输入到机器学习模型中时。LangChain 是一个用于构建大型语言模型应用程序的库，它提供了多种工具和策略来处理文本分割。下面是一些在LangChain中实现文本分割的常见方法：

## 一、如何递归分割文本

递归分割(recursively)，这个文本分割器是用于通用文本的推荐工具。它接受一个字符列表作为参数。它会按顺序尝试在这些字符上进行分割，直到块足够小。默认的字符列表是 `["\n\n", "\n", " ", ""]`。这样做的效果是尽可能保持所有段落（然后是句子，再然后是单词）在一起，因为这些通常看起来是语义上相关的文本块。

1. 文本如何分割：根据字符列表。

2. 块大小如何衡量：根据字符数量。

下面我们展示一个使用示例。

要直接获取字符串内容，请使用 `.split_text`。

要创建 LangChain [Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html) 对象（例如，用于下游任务），请使用 `.create_documents`。

```python
%pip install -qU langchain-text-splitters
```

```python
# 示例：recursively_split.py
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 加载示例文档
with open("../../resource/knowledge.txt", encoding="utf-8") as f:
    state_of_the_union = f.read()
text_splitter = RecursiveCharacterTextSplitter(
    # 设置一个非常小的块大小，只是为了展示。
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)
texts = text_splitter.create_documents([state_of_the_union])
print(texts[0])
print(texts[1])
```

```txt
page_content='I am honored to be with you today at your commencement from one of the finest universities in the'
page_content='universities in the world. I never graduated from college. Truth be told, this is the closest I've'
```

```python
text_splitter.split_text(knowledge)[:2]
```

```python
['\ufeffI am honored to be with you today at your commencement from one of the finest universities in the', "universities in the world. I never graduated from college. Truth be told, this is the closest I've"]
```

让我们来看看上述 `RecursiveCharacterTextSplitter` 的参数设置：

* `chunk_size`：块的最大大小，大小由 `length_function` 决定。

* `chunk_overlap`：块之间的目标重叠。重叠的块有助于在上下文分割时减少信息丢失。

* `length_function`：确定块大小的函数。

* `is_separator_regex`：分隔符列表（默认为 `["\n\n", "\n", " ", ""]`）是否应被解释为正则表达式。

### 从没有词边界的语言中分割文本

一些书写系统没有[词边界](https://en.wikipedia.org/wiki/Category:Writing_systems_without_word_boundaries)，例如中文、日文和泰文。使用默认分隔符列表 `["\n\n", "\n", " ", ""]` 分割文本可能会导致单词被分割在不同块之间。为了保持单词在一起，您可以覆盖分隔符列表，包括额外的标点符号：

* 添加 ASCII 句号 "`.`"，[Unicode 全角](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_\(Unicode_block\)) 句号 "`．`"（用于中文文本），以及[表意句号](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation) "`。`"（用于日文和中文）

* 添加[零宽空格](https://en.wikipedia.org/wiki/Zero-width_space) 用于泰文、缅甸文、高棉文和日文。

* 添加 ASCII 逗号 "`,`"，Unicode 全角逗号 "`，`"，以及 Unicode 表意逗号 "`、`"

```python
# 示例：recursively_separator.py
text_splitter = RecursiveCharacterTextSplitter(
    separators=[
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",  # 零宽空格
        "\uff0c",  # 全角逗号
        "\u3001",  # 表意逗号
        "\uff0e",  # 全角句号
        "\u3002",  # 表意句号"",
    ],
    # 已有的参数
)
```



## 二、按照语义块分割文本

下面介绍如何根据语义相似性拆分文本块(semantic chunks)。如果嵌入足够远，文本块将被拆分。

在高层次上，这将文本拆分成句子，然后分组为每组 3 个句子，最后合并在嵌入空间中相似的句子。

### 1. 安装依赖项

```python
#pip install --quiet langchain_experimental langchain_openai
```

### 2. 载入示例数据

```python
# 示例：semantic_split.py
# 这是一个长文档，我们可以将其拆分。
with open("../../resource/knowledge.txt", encoding="utf-8") as f:
    knowledge = f.read()
```

### 3. 创建文本拆分器

要实例化一个 [SemanticChunker](https://api.python.langchain.com/en/latest/text_splitter/langchain_experimental.text_splitter.SemanticChunker.html)，我们必须指定一个嵌入模型。下面我们将使用 [OpenAIEmbeddings](https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.openai.OpenAIEmbeddings.html)。

```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai.embeddings import OpenAIEmbeddings
text_splitter = SemanticChunker(OpenAIEmbeddings())
```

### 4. 拆分文本

我们按照通常的方式拆分文本，例如，通过调用 `.create_documents` 来创建 LangChain [Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html) 对象：

```python
docs = text_splitter.create_documents([knowledge])
print(docs[0].page_content)
```

```txt
I am honored to be with you today at your commencement from one of the finest universities in the world. I never graduated from college. Truth be told, this is the closest I've ever gotten to a college graduation. Today I want to tell you three stories from my life. That's it. No big deal.
```

### 5. 断点

这个拆分器的工作原理是确定何时“断开”句子。这是通过查找任意两个句子之间的嵌入差异来完成的。当该差异超过某个阈值时，它们就会被拆分。

有几种方法可以确定该阈值，这由 `breakpoint_threshold_type` 关键字参数控制。

#### 百分位数

拆分的默认方式是基于百分位数。在此方法中，计算所有句子之间的差异，然后任何大于X百分位数的差异都会被拆分。

```python
# 示例：semantic_split_percentile.py
text_splitter = SemanticChunker(
    OpenAIEmbeddings(), breakpoint_threshold_type="percentile", breakpoint_threshold_amount=50
)
```

```python
docs = text_splitter.create_documents([knowledge])
print(docs[0].page_content)
```

```txt
I am honored to be with you today at your commencement from one of the finest universities in the world. I never graduated from college.
```

```python
print(len(docs))
```

```txt
71
```



## 三、如何按标题拆分 Markdown

### 1. 动机

许多聊天或问答应用程序在嵌入和向量存储之前需要对输入文档进行分块。

Pinecone 的这些[笔记](https://www.pinecone.io/learn/chunking-strategies/)提供了一些有用的提示：

```txt
当嵌入整个段落或文档时，嵌入过程会考虑文本中句子和短语之间的整体上下文和关系。这可能会导致更全面的向量表示，捕捉到文本的更广泛的含义和主题。
```

正如上面提到的，分块通常旨在将具有共同上下文的文本保持在一起。考虑到这一点，我们可能希望特别尊重文档本身的结构。例如，Markdown 文件是按标题组织的。在特定标题组中创建分块是一个直观的想法。为了解决这个挑战，我们可以使用 [MarkdownHeaderTextSplitter](https://api.python.langchain.com/en/latest/markdown/langchain_text_splitters.markdown.MarkdownHeaderTextSplitter.html)。它可以根据指定的一组标题来拆分 Markdown 文件。

例如，如果我们想要拆分这个 Markdown：

```txt
md = '# Foo\n\n ## Bar\n\nHi this is Jim  \nHi this is Joe\n\n ## Baz\n\n Hi this is Molly'
```

我们可以指定要拆分的标题：

```txt
[("#", "Header 1"),("##", "Header 2")]
```

内容将根据共同的标题进行分组或拆分：

```txt
{'content': 'Hi this is Jim  \nHi this is Joe', 'metadata': {'Header 1': 'Foo', 'Header 2': 'Bar'}}
{'content': 'Hi this is Molly', 'metadata': {'Header 1': 'Foo', 'Header 2': 'Baz'}}
```

让我们看一些下面的示例。

### 2. 基本用法

```python
%pip install -qU langchain-text-splitters
```

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter
```

```python
markdown_document = "# Foo\n\n    ## Bar\n\nHi this is Jim\n\nHi this is Joe\n\n ### Boo \n\n Hi this is Lance \n\n ## Baz\n\n Hi this is Molly"
headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]
markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)
md_header_splits = markdown_splitter.split_text(markdown_document)
md_header_splits
```

```txt
[Document(page_content='Hi this is Jim  \nHi this is Joe', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='Hi this is Lance', metadata={'Header 1': 'Foo', 'Header 2': 'Bar', 'Header 3': 'Boo'}),
 Document(page_content='Hi this is Molly', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'})]
```

```python
type(md_header_splits[0])
```

```txt
<class 'langchain_core.documents.base.Document'>
```

默认情况下，`MarkdownHeaderTextSplitter` 会从输出块的内容中删除正在拆分的标题。可以通过设置 `strip_headers = False` 来禁用此功能。

```python
markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on, strip_headers=False)
md_header_splits = markdown_splitter.split_text(markdown_document)
md_header_splits
```

```txt
[Document(page_content='# Foo  \n## Bar  \nHi this is Jim  \nHi this is Joe', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='### Boo  \nHi this is Lance', metadata={'Header 1': 'Foo', 'Header 2': 'Bar', 'Header 3': 'Boo'}),
 Document(page_content='## Baz  \nHi this is Molly', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'})]
```



## 四、如何按 token 来分割文本

语言模型有一个标记限制。您不应超过标记限制。因此，当您将文本分成块时，最好计算标记数。有许多标记器。在计算文本中的标记数时，应使用与语言模型中使用的相同的标记器。

### tiktoken

[tiktoken](https://github.com/openai/tiktoken) 是由 OpenAI 创建的快速 `BPE` 标记器。

我们可以使用 `tiktoken` 来估算使用的标记数。对于 OpenAI 模型，这可能会更准确。

1. 文本如何分割：按传入的字符进行分割。

2. 如何测量块大小：通过 `tiktoken` 标记器。

[CharacterTextSplitter](https://api.python.langchain.com/en/latest/character/langchain_text_splitters.character.CharacterTextSplitter.html)、[RecursiveCharacterTextSplitter](https://api.python.langchain.com/en/latest/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html) 和 [TokenTextSplitter](https://api.python.langchain.com/en/latest/base/langchain_text_splitters.base.TokenTextSplitter.html) 可以直接与 `tiktoken` 一起使用。

```python
%pip install --upgrade --quiet langchain-text-splitters tiktoken
```

```python
from langchain_text_splitters import CharacterTextSplitter
# 这是一个长文档，我们可以将其分割。
with open("../../resource/knowledge.txt", encoding="utf-8")as f:
    knowledge = f.read()
```

要使用 [CharacterTextSplitter](https://api.python.langchain.com/en/latest/character/langchain_text_splitters.character.CharacterTextSplitter.html) 进行分割，然后使用 `tiktoken` 合并块，请使用其 `.from_tiktoken_encoder()` 方法。请注意，此方法生成的分割可能比 `tiktoken` 标记器测量的块大小要大。

`.from_tiktoken_encoder()` 方法接受 `encoding_name`（例如 `cl100k_base`）或 `model_name`（例如 `gpt-4`）作为参数。所有额外的参数，如 `chunk_size`、`chunk_overlap` 和 `separators`，都用于实例化 `CharacterTextSplitter`：

```python
text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    encoding_name="cl100k_base", chunk_size=100, chunk_overlap=0
)
texts = text_splitter.split_text(knowledge)
```

```python
print(texts[0])
```

```txt
I am honored to be with you today at your commencement from one of the finest universities in the world. I never graduated from college. Truth be told, this is the closest I've ever gotten to a college graduation. Today I want to tell you three stories from my life. That's it. No big deal. Just three stories.
我今天很荣幸能和你们一起参加毕业典礼，斯坦福大学是世界上最好的大学之一。我从来没有从大学中毕业。说实话,今天也许是在我的生命中离大学毕业最近的一天了。今天我想向你们讲述我生活中的三个故事。不是什么大不了的事情,只是三个故事而已。
The first story is about connecting the dots.
第一个故事是关于如何把生命中的点点滴滴串连起来。
I dropped out of Reed College after the first 6 months, but then stayed around as a drop-in for another 18 months or so before I really quit. So why did I drop out?
我在Reed大学读了六个月之后就退学了，但是在十八个月以后——我真正的作出退学决定之前，我还经常去学校。我为什么要退学呢？
```

要对块大小实施硬约束，我们可以使用 `RecursiveCharacterTextSplitter.from_tiktoken_encoder`，如果块大小较大，则会递归分割每个块：

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    model_name="gpt-4",
    chunk_size=100,
    chunk_overlap=0,
)
```

我们还可以加载一个 `TokenTextSplitter` 分割器，它直接与 `tiktoken` 一起使用，并确保每个分割块都比块大小小。

```python
from langchain_text_splitters import TokenTextSplitter
text_splitter = TokenTextSplitter(chunk_size=10, chunk_overlap=0)
texts = text_splitter.split_text(knowledge)
print(texts[0])
```

```txt
I am honored to be with you
```

一些书面语言（例如中文和日文）的字符编码为 2 个或更多个标记。直接使用 `TokenTextSplitter` 可能会导致字符的标记在两个块之间分割，从而导致不正确的 Unicode 字符。请使用 `RecursiveCharacterTextSplitter.from_tiktoken_encoder` 或 `CharacterTextSplitter.from_tiktoken_encoder` 来确保块包含有效的 Unicode 字符。
