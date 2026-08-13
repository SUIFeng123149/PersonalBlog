---
title: "Lagent：从零搭建你的 Multi-Agent_lagent从零搭建你的 multi-agent"
published: 2026-07-29
description: "1.1 环境配置 首先来为 Lagent 配置一个可用的环境 等待安装完成\\ 接下来，我们通过源码安装的方式安装 lagent。 1.2 Lagent框架中Agent的使用 首先，需要 申请 API 授权令牌 ，请前往 申请并获取 Authorization 令牌，将其填入后续代码的 YOUR TOKEN HERE 变量中。 创建一个代码example，创建 agent api web demo."
image: ""
tags: ["Multi-Agent", "AI Agent"]
category: "Multi-Agent"
draft: false
featured: false
lang: "zh-CN"
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---
#### 1.1 环境配置

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-EOrAbNBSaotfhLxdFXMcri8KnWh.png)

首先来为 Lagent 配置一个可用的环境

```python

# 创建环境
conda create -n lagent python=3.10 -y
# 激活环境
conda activate lagent
# 安装 torch
conda install pytorch==2.1.2 torchvision==0.16.2 torchaudio==2.1.2 pytorch-cuda=12.1 -c pytorch -c nvidia -y
# 安装其他依赖包
pip install termcolor==2.4.0
pip install streamlit==1.39.0
pip install class_registry==2.1.2
```

等待安装完成\~

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-Mj5tb5rJnoMRvexggXPcXfHAngh.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-Pnt0baMSuo4A3qxCDimcrToRn9g.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-IzO1bqKI3ocfkRxQesrcPbRUn4b.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-R0tvbc0FboJk6XxlzKyc0cdSnDg.png)

接下来，我们通过源码安装的方式安装 lagent。

```bash
# 创建目录以存放代码
mkdir -p /root/agent_camp4
cd /root/agent_camp4
git clone https://github.com/InternLM/lagent.git
cd lagent && git checkout e304e5d && pip install -e . && cd ..
pip install griffe==0.48.0
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-Qgznb5wCnoVWwMxTunccKLiJnng.png)

#### 1.2 Lagent框架中Agent的使用

首先，需要**申请 API 授权令牌** ，请前往 [书生·浦语 API 文档](https://internlm.intern-ai.org.cn/api/document) 申请并获取 `Authorization` 令牌，将其填入后续代码的 `YOUR_TOKEN_HERE` 变量中。

创建一个代码example，创建`agent_api_web_demo.py`，在里面实现我们的Web Demo：

```python
conda activate lagent
cd /root/agent_camp4/lagent/examples
touch agent_api_web_demo.py
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-RnNUbxPBioVIgPxk8H7cid1tn0c.png)

Action，也称为工具，Lagent中集成了很多好用的工具，提供了一套LLM驱动的智能体用来与真实世界交互并执行复杂任务的函数，包括谷歌文献检索、Arxiv文献检索、Python编译器等。具体可以查看[文档](https://lagent.readthedocs.io/zh-cn/latest/tutorials/action.html#id2)

让我们来体验一下，让LLM调用Arxiv文献检索这个工具：

在`agent_api_web_demo.py`中写入下面的代码，这里利用 `GPTAPI` 类，该类继承自 `BaseAPILLM`，封装了对 API 的调用逻辑，然后利用`Streamlit`启动Web服务

```python
import copy
import os
from typing import List
import streamlit as st
from lagent.actions import ArxivSearch
from lagent.prompts.parsers import PluginParser
from lagent.agents.stream import INTERPRETER_CN, META_CN, PLUGIN_CN, AgentForInternLM, get_plugin_prompt
from lagent.llms import GPTAPI

class SessionState:
    """管理会话状态的类。"""

    def init_state(self):
        """初始化会话状态变量。"""
        st.session_state['assistant'] = []  # 助手消息历史
        st.session_state['user'] = []  # 用户消息历史
        # 初始化插件列表
        action_list = [
            ArxivSearch(),
        ]
        st.session_state['plugin_map'] = {action.name: action for action in action_list}
        st.session_state['model_map'] = {}  # 存储模型实例
        st.session_state['model_selected'] = None  # 当前选定模型
        st.session_state['plugin_actions'] = set()  # 当前激活插件
        st.session_state['history'] = []  # 聊天历史
        st.session_state['api_base'] = None  # 初始化API base地址

    def clear_state(self):
        """清除当前会话状态。"""
        st.session_state['assistant'] = []
        st.session_state['user'] = []
        st.session_state['model_selected'] = None


class StreamlitUI:
    """管理 Streamlit 界面的类。"""

    def __init__(self, session_state: SessionState):
        self.session_state = session_state
        self.plugin_action = []  # 当前选定的插件
        # 初始化提示词
        self.meta_prompt = META_CN
        self.plugin_prompt = PLUGIN_CN
        self.init_streamlit()

    def init_streamlit(self):
        """初始化 Streamlit 的 UI 设置。"""
        st.set_page_config(
            layout='wide',
            page_title='lagent-web',
            page_icon='./docs/imgs/lagent_icon.png'
        )
        st.header(':robot_face: :blue[Lagent] Web Demo ', divider='rainbow')

    def setup_sidebar(self):
        """设置侧边栏，选择模型和插件。"""
        # 模型名称和 API Base 输入框
        model_name = st.sidebar.text_input('模型名称：', value='internlm2.5-latest')
        # ================================== 硅基流动的API ==================================
        # 注意，如果采用硅基流动API，模型名称需要更改为：internlm/internlm2_5-7b-chat 或者 internlm/internlm2_5-20b-chat
        # api_base = st.sidebar.text_input(
        #     'API Base 地址：', value='https://api.siliconflow.cn/v1/chat/completions'
        # )
        # ================================== 浦语官方的API ==================================
        api_base = st.sidebar.text_input(
            'API Base 地址：', value='https://internlm-chat.intern-ai.org.cn/puyu/api/v1/chat/completions'
        )
        # ==================================================================================
        # 插件选择
        plugin_name = st.sidebar.multiselect(
            '插件选择',
            options=list(st.session_state['plugin_map'].keys()),
            default=[],
        )

        # 根据选择的插件生成插件操作列表
        self.plugin_action = [st.session_state['plugin_map'][name] for name in plugin_name]

        # 动态生成插件提示
        if self.plugin_action:
            self.plugin_prompt = get_plugin_prompt(self.plugin_action)

        # 清空对话按钮
        if st.sidebar.button('清空对话', key='clear'):
            self.session_state.clear_state()

        return model_name, api_base, self.plugin_action

    def initialize_chatbot(self, model_name, api_base, plugin_action):
        """初始化 GPTAPI 实例作为 chatbot。"""
        token = os.getenv("token")
        if not token:
            st.error("未检测到环境变量 token，请设置环境变量，例如 export token='your_token_here' 后重新运行 X﹏X")
            st.stop()  # 停止运行应用
        # 创建完整的 meta_prompt，保留原始结构并动态插入侧边栏配置
        meta_prompt = [
            {"role": "system", "content": self.meta_prompt, "api_role": "system"},
            {"role": "user", "content": "", "api_role": "user"},
            {"role": "assistant", "content": self.plugin_prompt, "api_role": "assistant"},
            {"role": "environment", "content": "", "api_role": "environment"}
        ]

        api_model = GPTAPI(
            model_type=model_name,
            api_base=api_base,
            key=token,  # 从环境变量中获取授权令牌
            meta_template=meta_prompt,
            max_new_tokens=512,
            temperature=0.8,
            top_p=0.9
        )
        return api_model

    def render_user(self, prompt: str):
        """渲染用户输入内容。"""
        with st.chat_message('user'):
            st.markdown(prompt)

    def render_assistant(self, agent_return):
        """渲染助手响应内容。"""
        with st.chat_message('assistant'):
            content = getattr(agent_return, "content", str(agent_return))
            st.markdown(content if isinstance(content, str) else str(content))


def main():
    """主函数，运行 Streamlit 应用。"""
    if 'ui' not in st.session_state:
        session_state = SessionState()
        session_state.init_state()
        st.session_state['ui'] = StreamlitUI(session_state)
    else:
        st.set_page_config(
            layout='wide',
            page_title='lagent-web',
            page_icon='./docs/imgs/lagent_icon.png'
        )
        st.header(':robot_face: :blue[Lagent] Web Demo ', divider='rainbow')

    # 设置侧边栏并获取模型和插件信息
    model_name, api_base, plugin_action = st.session_state['ui'].setup_sidebar()
    plugins = [dict(type=f"lagent.actions.{plugin.__class__.__name__}") for plugin in plugin_action]

    if (
        'chatbot' not in st.session_state or
        model_name != st.session_state['chatbot'].model_type or
        'last_plugin_action' not in st.session_state or
        plugin_action != st.session_state['last_plugin_action'] or
        api_base != st.session_state['api_base']    ):
        # 更新 Chatbot
        st.session_state['chatbot'] = st.session_state['ui'].initialize_chatbot(model_name, api_base, plugin_action)
        st.session_state['last_plugin_action'] = plugin_action  # 更新插件状态
        st.session_state['api_base'] = api_base  # 更新 API Base 地址

        # 初始化 AgentForInternLM
        st.session_state['agent'] = AgentForInternLM(
            llm=st.session_state['chatbot'],
            plugins=plugins,
            output_format=dict(
                type=PluginParser,
                template=PLUGIN_CN,
                prompt=get_plugin_prompt(plugin_action)
            )
        )
        # 清空对话历史
        st.session_state['session_history'] = []

    if 'agent' not in st.session_state:
        st.session_state['agent'] = None

    agent = st.session_state['agent']
    for prompt, agent_return in zip(st.session_state['user'], st.session_state['assistant']):
        st.session_state['ui'].render_user(prompt)
        st.session_state['ui'].render_assistant(agent_return)

    # 处理用户输入
    if user_input := st.chat_input(''):
        st.session_state['ui'].render_user(user_input)

        # 调用模型时确保侧边栏的系统提示词和插件提示词生效
        res = agent(user_input, session_id=0)
        st.session_state['ui'].render_assistant(res)

        # 更新会话状态
        st.session_state['user'].append(user_input)
        st.session_state['assistant'].append(copy.deepcopy(res))

    st.session_state['last_status'] = None


if name == '__main__':
    main()
```

在终端中记得先将获取的API密钥写入环境变量，然后再输入启动命令：

```python
export token='your_token_here'
streamlit run agent_api_web_demo.py
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-PaBDb26QiouuhIxIF8bcwCPXnth.png)

在等待server启动成功后，我们在 **本地** 的 PowerShell 或win键+CMD中输入如下指令来进行端口映射：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image.png)

ssh -CNg -L 8501:127.0.0.1:8501 root@ssh.intern-ai.org.cn -p <你的 SSH 端口号>

接下来，在本地浏览器中打开 <http://localhost:8501/>： &#x20;

如果正确输入密钥，可以看到页面如下。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-1.png)

页面的侧边栏有三个内容，分别是**模型名称、API Base地址和插件选择**，其中如果采用浦语的API，模型名称可以选择internlm2.5-latest，默认指向最新发布的 InternLM2.5 系列模型，当前指向`internlm2.5-20b-0719`，窗口长度是32K，最大输出4096Tokens。

**备注：** 如果采用硅基流动API，模型名称需要更改为：`internlm/internlm2_5-7b-chat` 或者 `internlm/internlm2_5-20b-chat`。

可以尝试进行几轮简单的对话，并让其搜索文献，会发现大模型现在尽管有比较好的对话能力，但是并不能帮我们准确的找到文献，**例如输入指令“帮我搜索一下最新版本的MindSearch论文”**，会提示没有这方面的能力：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-Svc6bHCLioxRZ6xty1KcElRtnuD.png)

现在**将ArxivSearch插件选择上**，再次输入指令“帮我搜索一下最新版本的MindSearch论文”，可以看到，通过调用外部工具，大模型成功理解了我们的任务，得到了我们需要的文献：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-EJC9bHOOhoSInsxaRdCcnklGnZc.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-2.png)

#### 1.3 制作一个属于自己的Agent

在完成了上面的内容后，可能就会同学好奇了，**那么我应该如何基于Lagent框架实现一个自己的工具，赋予LLM额外的能力？** 本节将会以实时天气查询为例子，通过调用和风天气API，介绍如何自定义一个自己的Agent。

Lagent 框架的工具部分文档可以在此处查看：[Lagent 工具文档](https://lagent.readthedocs.io/zh-cn/latest/tutorials/action.html)。

使用 Lagent 自定义工具主要分为以下3步：

（1）继承 `BaseAction` 类

（2）实现简单工具的 `run` 方法；或者实现工具包内每个子工具的功能

（3）简单工具的 `run` 方法可选被 `tool_api` 装饰；工具包内每个子工具的功能都需要被 `tool_api` 装饰

首先，为了使用和风天气的 API 服务，你**需要获取一个 API Key**。请按以下步骤操作：

（1）访问 [和风天气 API 文档](https://dev.qweather.com/docs/api/)（需要注册账号）。

（2）点击页面右上角的“控制台”。

（3）在控制台中，点击左侧的“项目管理”，然后点击右上角“创建项目”。

（4）输入项目名称（可以使用“Lagent”），选择免费订阅，并在凭据设置中创建新的凭据。

（5）创建后，回到“项目管理”页面，找到你的 API Key 并复制保存。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-XHVvbhNVdo4lmfxUL0zcuUVanae.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-FpnEbOog7o3Ttdx8NJLcTNvhnYd.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-Fj4jbSxokod0JMx0l9kcVIPtnTh.png)

接着，我们需要在`laegnt/actions`文件夹下面创建一个天气查询的工具程序。

```python
conda activate lagent
cd /root/agent_camp4/lagent/lagent/actions
touch weather_query.py
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-3.png)

将下面的代码复制进去，**注意要将刚刚申请的API Key在终端中输入进去：**

```python
export weather_token='your_token_here'
```

```python
import os
import requests
from lagent.actions.base_action import BaseAction, tool_api
from lagent.schema import ActionReturn, ActionStatusCode

class WeatherQuery(BaseAction):
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv("weather_token")
        print(self.api_key)
        if not self.api_key:
            raise EnvironmentError("未找到环境变量 'token'。请设置你的和风天气 API Key 到 'weather_token' 环境变量中，比如export weather_token='xxx' ")

    @tool_api
    def run(self, location: str) -> dict:
        """
        查询实时天气信息。

        Args:
            location (str): 要查询的地点名称、LocationID 或经纬度坐标（如 "101010100" 或 "116.41,39.92"）。

        Returns:
            dict: 包含天气信息的字典
                * location: 地点名称
                * weather: 天气状况
                * temperature: 当前温度
                * wind_direction: 风向
                * wind_speed: 风速（公里/小时）
                * humidity: 相对湿度（%）
                * report_time: 数据报告时间
        """
        try:
            # 如果 location 不是坐标格式（例如 "116.41,39.92"），则调用 GeoAPI 获取 LocationID
            if not ("," in location and location.replace(",", "").replace(".", "").isdigit()):
                # 使用 GeoAPI 获取 LocationID
                geo_url = f"https://geoapi.qweather.com/v2/city/lookup?location={location}&key={self.api_key}"
                geo_response = requests.get(geo_url)
                geo_data = geo_response.json()

                if geo_data.get("code") != "200" or not geo_data.get("location"):
                    raise Exception(f"GeoAPI 返回错误码：{geo_data.get('code')} 或未找到位置")

                location = geo_data["location"][0]["id"]

            # 构建天气查询的 API 请求 URL
            weather_url = f"https://devapi.qweather.com/v7/weather/now?location={location}&key={self.api_key}"
            response = requests.get(weather_url)
            data = response.json()

            # 检查 API 响应码
            if data.get("code") != "200":
                raise Exception(f"Weather API 返回错误码：{data.get('code')}")

            # 解析和组织天气信息
            weather_info = {
                "location": location,
                "weather": data["now"]["text"],
                "temperature": data["now"]["temp"] + "°C",
                "wind_direction": data["now"]["windDir"],
                "wind_speed": data["now"]["windSpeed"] + " km/h",                "humidity": data["now"]["humidity"] + "%",
                "report_time": data["updateTime"]
            }

            return {"result": weather_info}

        except Exception as exc:
            return ActionReturn(
                errmsg=f"WeatherQuery 异常：{exc}",
                state=ActionStatusCode.HTTP_ERROR
            )
```

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-G943b6uodohJutxbXejcVaymngf.png)

修改actions文件夹里的\_\_init\_\_.py文件，时期初始化可以导入weather\_query里的WeatherQuery类

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-W0x0b5scYoq3V5xDwJgc7u2OnQg.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-GpN3b4p0Eo2emyx6VQAcsHaonse.png)

接下来，我们将修改 Web Demo 脚本来集成自定义的 `WeatherQuery` 插件。

打开`agent_api_web_demo.py`, 修改内容如下，目的是将该工具注册进大模型的插件列表中，使得其可以知道。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-SDrqbwd2Lo1rEuxRt0ZcSQrvnHe.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-4.png)

**再次启动Web程序，`streamlit run agent_api_web_demo.py`**

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-NhmGbWUrwo7pLExIj9FcPGxenMe.png)

现在可以查询天气

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-5.png)

现在，我们**将2个插件同时勾选上**，用以说明模型具备识别调用不同工具的能力，什么任务对应什么工具来解决。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-Ke9HbicwXoDneVxRLShcd9yInqc.png)

#### 1.4 Multi-Agents博客写作系统的搭建

首先，创建一个新的 Python 文件 `multi_agents_api_web_demo.py`，并进入 `lagent` 环境：

```python
conda activate lagent
cd /root/agent_camp4/lagent/examples
touch multi_agents_api_web_demo.py
```

将下面的代码填入`multi_agents_api_web_demo.py`:

```python
import os
import asyncio
import json
import re
import requests
import streamlit as st

from lagent.agents import Agent
from lagent.prompts.parsers import PluginParser
from lagent.agents.stream import PLUGIN_CN, get_plugin_prompt
from lagent.schema import AgentMessage
from lagent.actions import ArxivSearch
from lagent.hooks import Hook
from lagent.llms import GPTAPI

YOUR_TOKEN_HERE = os.getenv("token")
if not YOUR_TOKEN_HERE:
    raise EnvironmentError("未找到环境变量 'token'，请设置后再运行程序。")

# Hook类，用于对消息添加前缀
class PrefixedMessageHook(Hook):
    def __init__(self, prefix, senders=None):
        """
        初始化Hook
        :param prefix: 消息前缀
        :param senders: 指定发送者列表
        """
        self.prefix = prefix
        self.senders = senders or []

    def before_agent(self, agent, messages, session_id):
        """
        在代理处理消息前修改消息内容
        :param agent: 当前代理
        :param messages: 消息列表
        :param session_id: 会话ID
        """
        for message in messages:
            if message.sender in self.senders:
                message.content = self.prefix + message.content

class AsyncBlogger:
    """博客生成类，整合写作者和批评者。"""

    def __init__(self, model_type, api_base, writer_prompt, critic_prompt, critic_prefix='', max_turn=2):
        """
        初始化博客生成器
        :param model_type: 模型类型
        :param api_base: API 基地址
        :param writer_prompt: 写作者提示词
        :param critic_prompt: 批评者提示词
        :param critic_prefix: 批评消息前缀
        :param max_turn: 最大轮次
        """
        self.model_type = model_type
        self.api_base = api_base
        self.llm = GPTAPI(
            model_type=model_type,
            api_base=api_base,
            key=YOUR_TOKEN_HERE,
            max_new_tokens=4096,
        )
        self.plugins = [dict(type='lagent.actions.ArxivSearch')]
        self.writer = Agent(
            self.llm,
            writer_prompt,
            name='写作者',
            output_format=dict(
                type=PluginParser,
                template=PLUGIN_CN,
                prompt=get_plugin_prompt(self.plugins)
            )
        )
        self.critic = Agent(
            self.llm,
            critic_prompt,
            name='批评者',
            hooks=[PrefixedMessageHook(critic_prefix, ['写作者'])]
        )
        self.max_turn = max_turn

    async def forward(self, message: AgentMessage, update_placeholder):
        """
        执行多阶段博客生成流程
        :param message: 初始消息
        :param update_placeholder: Streamlit占位符
        :return: 最终优化的博客内容
        """
        step1_placeholder = update_placeholder.container()
        step2_placeholder = update_placeholder.container()
        step3_placeholder = update_placeholder.container()

        # 第一步：生成初始内容
        step1_placeholder.markdown("**Step 1: 生成初始内容...**")
        message = self.writer(message)
        if message.content:
            step1_placeholder.markdown(f"**生成的初始内容**:\n\n{message.content}")
        else:
            step1_placeholder.markdown("**生成的初始内容为空，请检查生成逻辑。**")

        # 第二步：批评者提供反馈
        step2_placeholder.markdown("**Step 2: 批评者正在提供反馈和文献推荐...**")
        message = self.critic(message)
        if message.content:
            # 解析批评者反馈
            suggestions = re.search(r"1\. 批评建议：\n(.?)2\. 推荐的关键词：", message.content, re.S)
            keywords = re.search(r"2\. 推荐的关键词：\n- (.)", message.content)
            feedback = suggestions.group(1).strip() if suggestions else "未提供批评建议"
            keywords = keywords.group(1).strip() if keywords else "未提供关键词"

            # Arxiv 文献查询
            arxiv_search = ArxivSearch()
            arxiv_results = arxiv_search.get_arxiv_article_information(keywords)

            # 显示批评内容和文献推荐
            message.content = f"**批评建议**:\n{feedback}\n\n**推荐的文献**:\n{arxiv_results}"
            step2_placeholder.markdown(f"**批评和文献推荐**:\n\n{message.content}")
        else:
            step2_placeholder.markdown("**批评内容为空，请检查批评逻辑。**")

        # 第三步：写作者根据反馈优化内容
        step3_placeholder.markdown("**Step 3: 根据反馈改进内容...**")
        improvement_prompt = AgentMessage(
            sender="critic",
            content=(
                f"根据以下批评建议和推荐文献对内容进行改进：\n\n"
                f"批评建议：\n{feedback}\n\n"
                f"推荐文献：\n{arxiv_results}\n\n"
                f"请优化初始内容，使其更加清晰、丰富，并符合专业水准。"
            ),
        )
        message = self.writer(improvement_prompt)
        if message.content:
            step3_placeholder.markdown(f"**最终优化的博客内容**:\n\n{message.content}")
        else:
            step3_placeholder.markdown("**最终优化的博客内容为空，请检查生成逻辑。**")

        return message

def setup_sidebar():
    """设置侧边栏，选择模型。"""
    model_name = st.sidebar.text_input('模型名称：', value='internlm2.5-latest')
    api_base = st.sidebar.text_input(
        'API Base 地址：', value='https://internlm-chat.intern-ai.org.cn/puyu/api/v1/chat/completions'
    )
    return model_name, api_base
    
def main():
    """
    主函数：构建Streamlit界面并处理用户交互
    """
    st.set_page_config(layout='wide', page_title='Lagent Web Demo', page_icon='🤖')
    st.title("多代理博客优化助手")

    model_type, api_base = setup_sidebar()
    topic = st.text_input('输入一个话题：', 'Self-Supervised Learning')
    generate_button = st.button('生成博客内容')

    if (
        'blogger' not in st.session_state or
        st.session_state['model_type'] != model_type or
        st.session_state['api_base'] != api_base
    ):
        st.session_state['blogger'] = AsyncBlogger(
            model_type=model_type,
            api_base=api_base,
            writer_prompt="你是一位优秀的AI内容写作者，请撰写一篇有吸引力且信息丰富的博客内容。",
            critic_prompt="""
                作为一位严谨的批评者，请给出建设性的批评和改进建议，并基于相关主题使用已有的工具推荐一些参考文献，推荐的关键词应该是英语形式，简洁且切题。
                请按照以下格式提供反馈：
                1. 批评建议：
                - （具体建议）
                2. 推荐的关键词：
                - （关键词1, 关键词2, ...）
            """,
            critic_prefix="请批评以下内容，并提供改进建议：\n\n"
        )
        st.session_state['model_type'] = model_type
        st.session_state['api_base'] = api_base

    if generate_button:
        update_placeholder = st.empty()

        async def run_async_blogger():
            message = AgentMessage(
                sender='user',
                content=f"请撰写一篇关于{topic}的博客文章，要求表达专业，生动有趣，并且易于理解。"
            )
            result = await st.session_state['blogger'].forward(message, update_placeholder)
            return result

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_async_blogger())

if name == '__main__':
    main()
```

运行`streamlit run multi_agents_api_web_demo.py`，启动Web服务 输入话题，比如`Semi-Supervised Learning`：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-6.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-7.png)

可以看到，Multi-Agents博客写作系统正在按照下面的3步骤，生成、批评和完善内容。

**Step 1**：写作者根据用户输入生成初稿。

**Step 2**：批评者对初稿进行评估，提供改进建议和文献推荐（通过关键词触发 Arxiv 文献搜索）。

**Step 3**：写作者根据批评意见对内容进行改进。

输入一个感兴趣的话题：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-image-8.png)

批评和文献检索的结果：

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-UPjvb0usCoBDhKxIiz0cpnB2nac.png)

最后完善的内容，可以看到其中包括了检索得到的文献，使得博客内容更加具有可信度。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-OHAnbEhLOouTOexBNLFcwMZWnEf.png)

#### 1.5在HF上部署agent

下面将上面做好的模型，部署到HF上。

1.在HF上新建空间

[`https://huggingface.co/spaces/quentinrobot/lagent_weatherreport_ArxivSearch`](https://huggingface.co/spaces/quentinrobot/lagent_weatherreport_ArxivSearch)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-NYfBb0wHLoTeXExJ6rKcp0lcnpe.png)

2.在codespace上克隆仓库

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-I2ZIblDv1oPGhaxIpTAcLGPonoc.png)

创建lagent环境，安装所需包，具体参考 1.2内容。

激活环境如遇到问题，参考下面内容

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-AIkCbABXeoqnNtx7r9HctQG9nFe.png)

在actions文件夹中创建文件weather\_query.py，输入对应token。

在examples文件夹中创建文件agent\_api\_web\_demo.py，输入对应token。

进入examples文件夹，在终端运行

**`运行下面命令：`**

`streamlit run agent_api_web_demo.py`

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-J0kcb0rg2o3ZdlxH0SncR3yenEh.png)

运行正常

执行上传模型文件

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-UpGkb0xwSo2A0VxFTjBcR2nInSg.png)

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-OJ1wbWIddou84ix0dM3cQUeHnhg.png)

可能会提示需要输入，我这里是提前输入

```python
# git remote set-url origin https://<user_name>:<token>@huggingface.co/<repo_path>

# 如 git remote set-url origin https://blank:hf_xxxxxxxxxxx@huggingface.co/blank/intern_study_L0_4

# 这里blank和hf_xxxxxxxxxxxx只是示例 请替换为你的username和之前申请的access token
```

进入HF SPACE ，模型需要创建及启动一会儿

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-CGxpbR4e9o0whYxsPDLcdnk5n6b.png)

进入模型app界面，点击生成博客内容

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-TCygbSTe4o1OC1xvjL5cey3OnUh.png)

至此完成模型部署

需要设置这类的token，将你申请的书生api\_key及和风天气的api\_key粘贴进去。名称要与app.py代码中的一致，你自己定。

![](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent_assets/Lagent%EF%BC%9A%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20Multi-Agent_lagent%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E4%BD%A0%E7%9A%84%20multi-agent-XZuSbDRm1ocvJ8xHBtbc1K1Fnle.png)

[Lagent 20250109 - a Hugging Face Space by quentinrobot](https://huggingface.co/spaces/quentinrobot/Lagent_20250109)

<https://huggingface.co/spaces/quentinrobot/Lagent_20250109>

部署完成，感谢🤝🤝🤝

&#x20;&#x20;


