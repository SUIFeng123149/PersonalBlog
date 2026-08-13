---
title: "OpenAI篇-GPT-4o多模态应用实战"
published: 2026-07-29
description: "演示效果 Streamlit开发文档 官方文档：<https://docs.streamlit.io/ 中文文档：<https://blog.csdn.net/weixin 44458771/article/details/135495928 Streamlit命令行启动 配置Pycharm调试Streamlit应用 开发环境 PyCharm Community Edition 2024 Win1"
image: ""
tags: ["OpenAI"]
category: "OpenAI"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
## **演示效果**

![](./OpenAI篇-GPT-4o多模态应用实战_assets/OpenAI篇-GPT-4o多模态应用实战-image.png)

## **Streamlit开发文档**

官方文档：<https://docs.streamlit.io/>

中文文档：<https://blog.csdn.net/weixin_44458771/article/details/135495928>

## **Streamlit命令行启动**

```powershell
pip install streamlit
streamlit run app.py --server.port 8501
```

## **配置Pycharm调试Streamlit应用**

开发环境

PyCharm Community Edition 2024

Win10/11

Streamlit 1.39.0

### **创建应用**

app.py

```python
import streamlit as st

st.header("hello")
st.write("this is a streamlit demo")
```

### **调试应用**

启动参数

**module**：streamlit

**Script parameters**：run app.py

![](./OpenAI篇-GPT-4o多模态应用实战_assets/OpenAI篇-GPT-4o多模态应用实战-O0S7beTXOo5stNxQdYGcwBFHnYc.png)

再次启动 debug 按钮，报错如下

![](./OpenAI篇-GPT-4o多模态应用实战_assets/OpenAI篇-GPT-4o多模态应用实战-KVTubhEK7ob0bRx6VD4cnDf1n9b.png)

解决如下:

Help | Find Action | Registry | python.debug.asyncio.repl 去掉勾。

![](./OpenAI篇-GPT-4o多模态应用实战_assets/OpenAI篇-GPT-4o多模态应用实战-AWD9bwIzooKWdMxn15KckOjjnCb.png)


