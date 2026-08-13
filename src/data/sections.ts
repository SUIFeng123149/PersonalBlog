/**
 * 内容分区配置（浏览内容页的 4 张顶级卡片）
 * - 由管理后台「分区管理」维护，可通过 admin 集合管线读写
 * - categories 顺序即前端卡片显示顺序，新增分类即使暂无文章也会显示
 */
export const contentSections = [
  {
    "slug": "technical",
    "title": "技术资料",
    "description": "开发教程、工具实践与技术沉淀",
    "icon": "material-symbols:code-rounded",
    "categories": [
      "AI Agent",
      "AutoGen",
      "BigData",
      "Coze",
      "DeepSeek",
      "Dify",
      "Fine-tuning",
      "Interview",
      "JavaSE",
      "LangChain",
      "LangGraph",
      "LLM Introduction",
      "MCP",
      "Multi-Agent",
      "MyBatisPlus",
      "MySQL",
      "OpenAI",
      "Prompt Engineering",
      "RAG",
      "Spring",
      "SpringBoot",
      "SpringMVC",
      "SpringSecurity",
      "Web"
    ]
  },
  {
    "slug": "notes",
    "title": "个人随笔",
    "description": "日常记录、思考与生活片段",
    "icon": "material-symbols:edit-note-rounded",
    "categories": [
      "随笔",
      "生活",
      "思考"
    ]
  },
  {
    "slug": "games",
    "title": "游戏记录",
    "description": "游戏体验、攻略与进度记录",
    "icon": "material-symbols:sports-esports-rounded",
    "categories": [
      "明日方舟终末地",
      "原神",
      "崩坏：星穹铁道",
      "创世战车",
      "碧蓝航线",
      "极限竞速：地平线",
      "明日方舟"
    ]
  },
  {
    "slug": "other",
    "title": "其他",
    "description": "尚未归入以上主题的内容",
    "icon": "material-symbols:category-rounded",
    "categories": []
  }
];
