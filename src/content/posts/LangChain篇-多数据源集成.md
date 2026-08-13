---
title: "LangChain篇-多数据源集成"
published: 2026-07-29
description: "LangChain 与各种数据源有数百个集成，可以从中加载数据：Slack、Notion、Google Drive 等。 每个文档加载器都有自己特定的参数，但它们可以通过相同的方式使用 .load 方法调用。 以下是一个示例用法： 一、如何加载 CSV 文件 文件是一种使用逗号分隔值的定界文本文件。文件的每一行是一个数据记录。每个记录由一个或多个字段组成，字段之间用逗号分隔。 LangChain "
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
LangChain 与各种数据源有数百个集成，可以从中加载数据：Slack、Notion、Google Drive 等。 每个文档加载器都有自己特定的参数，但它们可以通过相同的方式使用 `.load` 方法调用。 以下是一个示例用法：

```python
from langchain_community.document_loaders.csv_loader import CSVLoader
loader = CSVLoader(
    ...  # <-- 在这里添加特定于集成的参数
)
data = loader.load()
```

## 一、如何加载 CSV 文件

[逗号分隔值（CSV）](https://zh.wikipedia.org/wiki/%E9%80%97%E5%8F%B7%E5%88%86%E9%9A%94%E5%80%BC)文件是一种使用逗号分隔值的定界文本文件。文件的每一行是一个数据记录。每个记录由一个或多个字段组成，字段之间用逗号分隔。

LangChain 实现了一个 [CSV 加载器](https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html)，可以将 CSV 文件加载为一系列 [Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document) 对象。CSV 文件的每一行都会被翻译为一个文档。

```python
#示例：csv_loader.pyfrom langchain_community.document_loaders.csv_loader import CSVLoader
file_path = ("../../resource/doc_search.csv"
)
loader = CSVLoader(file_path=file_path,encoding="UTF-8")
data = loader.load()
for record in data[:2]:print(record)
```

```python
page_content='名称: 狮子
种类: 哺乳动物
年龄: 8
栖息地: 非洲草原' metadata={'source': '../../resource/doc_search.csv', 'row': 0}
page_content='名称: 大熊猫
种类: 哺乳动物
年龄: 5
栖息地: 中国竹林' metadata={'source': '../../resource/doc_search.csv', 'row': 1}
```

### 自定义 CSV 解析和加载

`CSVLoader` 接受一个 `csv_args` 关键字参数，用于自定义传递给 Python 的 `csv.DictReader` 的参数。有关支持的 csv 参数的更多信息，请参阅 [csv 模块](https://docs.python.org/zh-cn/3/library/csv.html)文档。

```python
# 示例：csv_custom.py
from langchain_community.document_loaders.csv_loader import CSVLoader

file_path = ("../../resource/doc_search.csv"
)
loader = CSVLoader(
    file_path=file_path,
    encoding="UTF-8",
    csv_args={
        "delimiter": ",",
        "quotechar": '"',
        "fieldnames": ["Name", "Species", "Age", "Habitat"],
    },
)
data = loader.load()
for record in data[:2]:
    print(record)
```

```txt
page_content='Name: 名称
Species: 种类
Age: 年龄
Habitat: 栖息地' metadata={'source': '../../resource/doc_search.csv', 'row': 0}
page_content='Name: 狮子
Species: 哺乳动物
Age: 8
Habitat: 非洲草原' metadata={'source': '../../resource/doc_search.csv', 'row': 1}
```



## 二、如何加载 HTML

超文本标记语言（HTML）是用于在 Web 浏览器中显示的文档的标准标记语言。

这里介绍了如何将 HTML 文档加载到 LangChain 的 [Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document) 对象中，以便我们可以在下游使用。

解析 HTML 文件通常需要专门的工具。在这里，我们演示了如何通过 [Unstructured](https://unstructured-io.github.io/unstructured/) 和 [BeautifulSoup4](https://beautiful-soup-4.readthedocs.io/en/latest/) 进行解析，可以通过 pip 安装。

### 1. 使用 Unstructured 加载 HTML

```python
%pip install "unstructured[html]"
```

```python
# 示例：html_loader.py
from langchain_community.document_loaders import UnstructuredHTMLLoader

file_path = "../../resource/content.html"
loader = UnstructuredHTMLLoader(file_path, encodings="UTF-8")
data = loader.load()
print(data)
```

```txt
[Document(metadata={'source': '../../resource/content.html'}, page_content='风景展示\n\n黄山\n\n黄山位于中国安徽省南部，是中国著名的风景名胜区，以奇松、怪石、云海和温泉“四绝”闻名。\n\n大峡谷\n\n大峡谷位于美国亚利桑那州，是世界上最著名的自然景观之一，以其壮观的地质奇观和深邃的峡谷闻名。')]
```

### 2. 使用 BeautifulSoup4 加载 HTML

我们还可以使用 BeautifulSoup4 使用 `BSHTMLLoader` 加载 HTML 文档。这将将 HTML 中的文本提取到 `page_content` 中，并将页面标题提取到 `metadata` 的 `title` 中。

```python
#pip install bs4
```

```python
# 示例：html_bs4.py
from langchain_community.document_loaders import BSHTMLLoader

file_path = "../../resource/content.html"
loader = BSHTMLLoader(file_path, open_encoding="UTF-8")
data = loader.load()
print(data)
```

```txt
[Document(metadata={'source': '../../resource/content.html', 'title': '风景展示'}, page_content='\n\n\n\n风景展示\n\n\n\n风景展示\n\n黄山\n黄山位于中国安徽省南部，是中国著名的风景名胜区，以奇松、怪石、云海和温泉“四绝”闻名。\n\n\n\n大峡谷\n大峡谷位于美国亚利桑那州，是世界上最著名的自然景观之一，以其壮观的地质奇观和深邃的峡谷闻名。\n\n\n\n')]
```



## 三、如何加载 Markdown

[Markdown](https://en.wikipedia.org/wiki/Markdown) 是一种轻量级标记语言，可用于使用纯文本编辑器创建格式化文本。

在这里，我们将介绍如何将 `Markdown` 文档加载到 LangChain [Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document) 对象中，以便在下游使用。

我们将介绍：

* 基本用法；

* 将 Markdown 解析为标题、列表项和文本等元素。

LangChain 实现了一个 [UnstructuredMarkdownLoader](https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html) 对象，它需要使用 [Unstructured](https://unstructured-io.github.io/unstructured/) 包。首先我们需要安装它：

```python
!pip install "unstructured[md]"
```

基本用法将会将一个 Markdown 文件加载到单个文档中。这里我们演示了在 LangChain 的 readme 上的操作：

```python
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_core.documents import Document

markdown_path = "../../resource/langchain.md"
loader = UnstructuredMarkdownLoader(markdown_path)
data = loader.load()
assert len(data) == 1assert isinstance(data[0], Document)
content = data[0].page_content
print(content[:250])
```

```txt
交通概述

交通是指人们和货物在不同地点之间的移动和运输。交通系统包括道路、铁路、航空、水运等多种方式，是现代社会不可或缺的一部分。

NarrativeText

私家车是个人拥有的车辆，方便灵活，但容易造成交通拥堵和环境污染。

ListItem

私家车：个人拥有的车辆，方便灵活，但容易造成交通拥堵和环境污染。

出租车：提供点对点的运输服务，适合短途出行。

公共汽车：城市交通系统的重要组成部分，具有运量大、费用低的特点。

摩托车

摩托车在一些交通拥堵的城市中非常流行，具有灵活、速度
```

### 保留元素

在幕后，Unstructured 为不同的文本块创建了不同的 "元素"。默认情况下，我们将它们组合在一起，但是您可以通过指定 `mode="elements"` 轻松保留这种分离。

```python
markdown_path = "../../resource/langchain.md"
loader = UnstructuredMarkdownLoader(markdown_path, mode="elements")
data = loader.load()
print(f"文档数量：{len(data)}\n")
for document in data[:2]:
    print(f"{document}\n")
```

```txt
文档数量：43

page_content='交通概述' metadata={'source': '../../resource/markdown.md', 'category_depth': 0, 'last_modified': '2024-08-08T16:50:39', 'languages': ['zho'], 'filetype': 'text/markdown', 'file_directory': '../../resource', 'filename': 'markdown.md', 'category': 'Title'}

page_content='交通是指人们和货物在不同地点之间的移动和运输。交通系统包括道路、铁路、航空、水运等多种方式，是现代社会不可或缺的一部分。' metadata={'source': '../../resource/markdown.md', 'category_depth': 0, 'last_modified': '2024-08-08T16:50:39', 'languages': ['zho'], 'filetype': 'text/markdown', 'file_directory': '../../resource', 'filename': 'markdown.md', 'category': 'Title'}
```

请注意，在这种情况下，我们恢复了三种不同的元素类型：

```python
print(set(document.metadata["category"] for document in data))
```

```txt
{'Title', 'ListItem'}
```



## 四、如何加载 PDF文件

[便携式文档格式（PDF）](https://zh.wikipedia.org/wiki/PDF)是由 Adobe 于 1992 年开发的一种文件格式，标准化为 ISO 32000。它以一种与应用软件、硬件和操作系统无关的方式呈现文档，包括文本格式和图像。

本指南介绍了如何将 PDF 文档加载到我们在下游使用的 LangChain [Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document) 格式中。

LangChain 集成了许多 PDF 解析器。有些解析器简单且相对低级，而其他解析器支持 OCR 和图像处理，或进行高级文档布局分析。选择合适的解析器将取决于您的应用程序。下面我们列举了一些可能的选择。

### 1. 使用PyPDF

这里我们使用 `pypdf` 将PDF加载为文档数组，其中每个文档包含页面内容和带有 `page` 编号的元数据。

```python
%pip install pypdf
```

```python
from langchain_community.document_loaders import PyPDFLoader

file_path = ("../../resource/pytorch.pdf")
loader = PyPDFLoader(file_path)
pages = loader.load_and_split()
print(pages[0])
```

```txt
page_content='PyTorch: An Imperative Style, High-Performance
Deep Learning Library
Adam Paszke
University of Warsaw
adam.paszke@gmail.comSam Gross
Facebook AI Research
sgross@fb.comFrancisco Massa
Facebook AI Research
fmassa@fb.com
Adam Lerer
Facebook AI Research
alerer@fb.comJames Bradbury
Google
jekbradbury@gmail.comGregory Chanan
Facebook AI Research
gchanan@fb.com
Trevor Killeen
Self Employed
killeent@cs.washington.eduZeming Lin
Facebook AI Research
zlin@fb.comNatalia Gimelshein
NVIDIA
ngimelshein@nvidia.com
Luca Antiga
Orobix
luca.antiga@orobix.comAlban Desmaison
Oxford University
alban@robots.ox.ac.ukAndreas Köpf
Xamla
andreas.koepf@xamla.com
Edward Yang
Facebook AI Research
ezyang@fb.comZach DeVito
Facebook AI Research
zdevito@cs.stanford.eduMartin Raison
Nabla
martinraison@gmail.com
Alykhan Tejani
Twitter
atejani@twitter.comSasank Chilamkurthy
Qure.ai
sasankchilamkurthy@gmail.comBenoit Steiner
Facebook AI Research
benoitsteiner@fb.com
Lu Fang
Facebook
lufang@fb.comJunjie Bai
Facebook
jbai@fb.comSoumith Chintala
Facebook AI Research
soumith@gmail.com
Abstract
Deep learning frameworks have often focused on either usability or speed, but
not both. PyTorch is a machine learning library that shows that these two goals
are in fact compatible: it provides an imperative and Pythonic programming style
that supports code as a model, makes debugging easy and is consistent with other
popular scientiﬁc computing libraries, while remaining efﬁcient and supporting
hardware accelerators such as GPUs.
In this paper, we detail the principles that drove the implementation of PyTorch
and how they are reﬂected in its architecture. We emphasize that every aspect of
PyTorch is a regular Python program under the full control of its user. We also
explain how the careful and pragmatic implementation of the key components of
its runtime enables them to work together to achieve compelling performance.
We demonstrate the efﬁciency of individual subsystems, as well as the overall
speed of PyTorch on several common benchmarks.
33rd Conference on Neural Information Processing Systems (NeurIPS 2019), Vancouver, Canada.' metadata={'source': '../../resource/pytorch.pdf', 'page': 0}
```

这种方法的优点是可以通过页码检索文档。

#### 对PDF进行向量搜索

一旦我们将 PDF 加载到 LangChain 的 `Document` 对象中，我们可以像通常一样对它们进行索引（例如，RAG 应用程序）。

```python
# 示例：pdf_search.py
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
faiss_index = FAISS.from_documents(pages, OpenAIEmbeddings())
docs = faiss_index.similarity_search("What is PyTorch?", k=2)
for doc in docs:print(str(doc.metadata["page"]) + ":", doc.page_content[:300])
```

```txt
0: PyTorch: An Imperative Style, High-Performance
Deep Learning Library
Adam Paszke
University of Warsaw
adam.paszke@gmail.comSam Gross
Facebook AI Research
sgross@fb.comFrancisco Massa
Facebook AI Research
fmassa@fb.com
Adam Lerer
Facebook AI Research
alerer@fb.comJames Bradbury
Google
jekbradbury@gma
1: 1 Introduction
With the increased interest in deep learning in recent years, there has been an explosion of machine
learning tools. Many popular frameworks such as Caffe [ 1], CNTK [ 2], TensorFlow [ 3], and
Theano [ 4], construct a static dataﬂow graph that represents the computation and which can 
```

从图像中提取文本一些 PDF 包含文本图像，例如扫描文档或图表。使用 `rapidocr-onnxruntime` 软件包，我们也可以将图像提取为文本：

```python
# 示例：pdf_image_text.py
# pip install rapidocr-onnxruntime
file_path = ("../../resource/pytorch.pdf")
loader = PyPDFLoader(file_path, extract_images=True)
pages = loader.load()
# 识别第9页图片文字
print(pages[8].page_content)
```

```txt
6.4 Adoption
The validity of design decisions and their impact on ease-of-use is hard to measure. As a proxy,
we tried to quantify how well the machine learning community received PyTorch by counting how
often various machine learning tools (including Caffe, Chainer, CNTK, Keras, MXNet, PyTorch,
TensorFlow, and Theano) are mentioned on arXiv e-Prints since the initial release of PyTorch in
January 2017. In Figure 3 we report the monthly number of mentions of the word "PyTorch" as a
percentage of all mentions among these deep learning frameworks. We counted tools mentioned
multiple times in a given paper only once, and made the search case insensitive to account for various
spellings.
Figure 3: Among arXiv papers each month that mention common deep learning frameworks, percentage of
them that mention PyTorch.
7 Conclusion and future work
PyTorch has become a popular tool in the deep learning research community by combining a focus
on usability with careful performance considerations. In addition to continuing to support the latest
trends and advances in deep learning, in the future we plan to continue to improve the speed and
scalability of PyTorch. Most notably, we are working on the PyTorch JIT: a suite of tools that
allow PyTorch programs to be executed outside of the Python interpreter where they can be further
optimized. We also intend to improve support for distributed computation by providing efﬁcient
primitives for data parallelism as well as a Pythonic library for model parallelism based around
remote procedure calls.
8 Acknowledgements
We are grateful to the PyTorch community for their feedback and contributions that greatly inﬂuenced
the design and implementation of PyTorch. We thank all the PyTorch core team members, contributors
and package maintainers including Ailing Zhang, Alex Suhan, Alfredo Mendoza, Alican Bozkurt,
Andrew Tulloch, Ansha Yu, Anthony Shoumikhin, Bram Wasti, Brian Vaughan, Christian Puhrsch,
David Reiss, David Riazati, Davide Libenzi, Dmytro Dzhulgakov, Dwaraj Rajagopal, Edward Yang,
Elias Ellison, Fritz Obermeyer, George Zhang, Hao Lu, Hong Xu, Hung Duong, Igor Fedan, Ilia
Cherniavskii, Iurii Zdebskyi, Ivan Kobzarev, James Reed, Jeff Smith, Jerry Chen, Jerry Zhang, Jiakai
Liu, Johannes M. Dieterich, Karl Ostmo, Lin Qiao, Martin Yuan, Michael Suo, Mike Ruberry, Mikhail
Zolothukhin, Mingzhe Li, Neeraj Pradhan, Nick Korovaiko, Owen Anderson, Pavel Belevich, Peter
Johnson, Pritam Damania, Raghuraman Krishnamoorthi, Richard Zou, Roy Li, Rui Zhu, Sebastian
Messmer, Shen Li, Simon Wang, Supriya Rao, Tao Xu, Thomas Viehmann, Vincent Quenneville-
Belair, Vishwak Srinivasan, Vitaly Fedyunin, Wanchao Liang, Wei Yang, Will Feng, Xiaomeng Yang,
Xiaoqiang Zheng, Xintao Chen, Yangqing Jia, Yanli Zhao, Yinghai Lu and Zafar Takhirov.
References
[1]Yangqing Jia, Evan Shelhamer, Jeff Donahue, Sergey Karayev, Jonathan Long, Ross Girshick,
Sergio Guadarrama, and Trevor Darrell. Caffe: Convolutional architecture for fast feature
embedding. arXiv preprint arXiv:1408.5093 , 2014.
[2]Frank Seide and Amit Agarwal. Cntk: Microsoft’s open-source deep-learning toolkit. In
Proceedings of the 22Nd ACM SIGKDD International Conference on Knowledge Discovery
and Data Mining , KDD ’16, pages 2135–2135, New York, NY , USA, 2016. ACM.
950%
40%
30%
20%
10%
0%
Jul2017
Jan2018
Jul2018
Jan2019
```

### 2. 使用 Unstructured

[Unstructured](https://unstructured-io.github.io/unstructured/) 支持一个通用接口，用于处理非结构化或半结构化文件格式，例如 Markdown 或 PDF。LangChain 的 [UnstructuredPDFLoader](https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pdf.UnstructuredPDFLoader.html) 与 Unstructured 集成，将 PDF 文档解析为 LangChain [Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html) 对象。

```python
from langchain_community.document_loaders import UnstructuredPDFLoader

file_path = ("../../resource/pytorch.pdf"
)
loader = UnstructuredPDFLoader(file_path)
data = loader.load()
```

```python
page_content='PyTorch: An Imperative Style, High-Performance Deep Learning Library' metadata={'source': '../../resource/pytorch.pdf', 'coordinates': {'points': ((122.674, 99.42961860000003), (122.674, 136.57001860000003), (489.3275892, 136.57001860000003), (489.3275892, 99.42961860000003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': '../../resource', 'filename': 'pytorch.pdf', 'languages': ['eng'], 'last_modified': '2024-08-08T16:58:53', 'page_number': 1, 'filetype': 'application/pdf', 'category': 'Title'}
{'Footer', 'NarrativeText', 'Title', 'UncategorizedText'}
```

#### 保留元素

在幕后，Unstructured 为不同的文本块创建不同的 "元素"。默认情况下，我们将它们合并在一起，但您可以通过指定 `mode="elements"` 轻松保持分离。

```python
file_path = ("../../resource/pytorch.pdf"
)
loader = UnstructuredPDFLoader(file_path, mode="elements")
data = loader.load()
data[0]
```

```txt
page_content='PyTorch: An Imperative Style, High-Performance Deep Learning Library' metadata={'source': '../../resource/pytorch.pdf', 'coordinates': {'points': ((122.674, 99.42961860000003), (122.674, 136.57001860000003), (489.3275892, 136.57001860000003), (489.3275892, 99.42961860000003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': '../../resource', 'filename': 'pytorch.pdf', 'languages': ['eng'], 'last_modified': '2024-08-08T16:58:53', 'page_number': 1, 'filetype': 'application/pdf', 'category': 'Title'}
```

查看此特定文档的完整元素类型集合：

```python
set(doc.metadata["category"] for doc in data)
```

```txt
{'Footer', 'NarrativeText', 'Title', 'UncategorizedText'}
```

#### 使用 Unstructured 加载远程 PDF

这涵盖了如何将在线 PDF 加载到我们可以在下游使用的文档格式中。这可用于各种在线 PDF 站点，如 <https://open.umn.edu/opentextbooks/textbooks/> 和 <https://arxiv.org/archive/> 注意：所有其他 PDF 加载器也可以用于获取远程 PDF，但 `OnlinePDFLoader` 是一个旧函数，专门与 `UnstructuredPDFLoader` 配合使用。

```python
from langchain_community.document_loaders import OnlinePDFLoader
loader = OnlinePDFLoader("https://arxiv.org/pdf/2302.03803.pdf")
data = loader.load()
```


