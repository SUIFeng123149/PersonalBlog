# 🌸 云栖小筑 · Mizuki

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-5.14-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

一个基于 [Astro](https://astro.build) 构建的现代化静态博客，拥有丰富的功能与美观的设计。本项目基于 [Mizuki](https://github.com/matsuzaka-yuki/mizuki) / [Fuwari](https://github.com/saicaca/fuwari) 模板二次开发，并针对个人使用场景做了大量定制。

- 在线站点：<https://mizuki.mysqil.com/>
- 个人博客：<https://blog.followthewind.fun/>
- 源码仓库：<https://github.com/SUIFeng123149/PersonalBlog>

## ✨ 功能特性

### 🎨 界面与体验
- Astro 5 + Tailwind CSS + Svelte，纯静态输出，性能优秀
- [Swup](https://swup.js.org/) 无刷新页面切换动画
- 亮 / 暗主题切换，跟随系统偏好，可自定义主题色相
- 全屏背景图轮播、模糊与透明度效果
- 樱花飘落、Live2D 看板娘等趣味装饰
- 全设备响应式布局

### 📝 内容与写作
- [Pagefind](https://pagefind.app/) 站内全文搜索
- [Expressive Code](https://expressive-code.com/) 增强代码块（行号、折叠、复制、语言徽章）
- KaTeX 数学公式、Mermaid 图表、GitHub 仓库卡片
- 呼叫块（Callout）、可折叠区块、PhotoSwipe 图片画廊
- 自动目录、阅读时长估算、文章分类与标签系统
- RSS / Atom 订阅、Sitemap、SEO 优化

### 🗂️ 特色页面
- **技术资料 / 个人随笔 / 游戏记录** 分区内容流
- **番剧**：Bangumi 追番进度与评分
- **日记**：生活记录分享
- **友链**、**项目**、**技能**、**时间线**、**相册**、**关于**
- 首页精选文章、置顶文章

## 📁 目录结构

```
.
├── admin/                  # 管理后台（独立仓库，见下方「管理后台」章节）
├── scripts/                # 构建辅助脚本
├── src/
│   ├── content/
│   │   ├── config.ts       # 内容 schema 定义
│   │   ├── posts/          # Markdown 文章（含 .assets 附件目录）
│   │   └── spec/           # 关于、友链等页面内容
│   ├── data/               # 项目、技能、时间线、日记等结构化数据
│   ├── pages/              # 页面路由
│   ├── components/         # 组件
│   ├── config.ts           # 站点全局配置
│   └── utils/              # 工具函数（含内容分区分类逻辑）
├── public/                 # 静态资源
├── astro.config.mjs
└── vercel.json
```

## 🚀 快速开始

### 环境要求
- Node.js ≥ 20
- pnpm ≥ 9（`npm install -g pnpm`）

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 修改站点配置
#    编辑 src/config.ts：站点标题、语言、主题色、横幅、特色页开关、导航等

# 3. 启动开发服务器（默认 http://localhost:4321）
pnpm dev
```

### 写一篇文章

在 `src/content/posts/` 下新建 `.md` 文件，或使用命令创建：

```bash
pnpm new-post 我的新文章
```

文章 Frontmatter 格式（完整字段见 `src/content/config.ts`）：

```yaml
---
title: "文章标题"
published: 2026-08-14
description: "文章摘要，用于 SEO 与卡片展示"
tags: ["标签A", "标签B"]
category: "SpringBoot"
draft: false
contentSection: "technical"  # 可选：technical | notes | games | other
featured: true               # 可选：首页精选
series: "系列名"             # 可选：系列
seriesOrder: 1
status: verified             # 可选：verified | maintenance | outdated
---
```

#### 内容分区（首页分类）

文章所属分区由 `category` 自动推断（映射来源于 `src/data/sections.ts`，可用管理后台「分区管理」维护），也可用 `contentSection` 字段显式指定：

| 分区 | category 自动识别 | contentSection 值 |
|------|------------------|-------------------|
| 技术资料 | AI Agent、JavaSE、Spring、SpringBoot、MySQL 等 | `technical` |
| 个人随笔 | 随笔、生活、思考 | `notes` |
| 游戏记录 | 明日方舟、原神、崩坏：星穹铁道 等 | `games` |
| 其他 | 未匹配的分类 | `other` |

> 新增分类时在管理后台「分区管理」中维护，前端卡片顺序与分类页随之更新（新增分类即使暂无文章也会显示）。

#### 图片与附件

- 图片可放在 `public/` 或文章的 `.assets/` 目录（如 `1.MyBatisPlus 课件.assets/`）
- 文章内以相对路径引用（如 `./xxx.assets/image.webp`）
- 管理后台上传的图片会自动压缩为 WebP

## ⚡ 常用命令

| 命令 | 说明 |
|:-----|:-----|
| `pnpm dev` | 启动本地开发服务器（localhost:4321） |
| `pnpm build` | 构建生产站点到 `./dist/`（含 Pagefind 索引） |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm check` | Astro 类型与内容 schema 检查 |
| `pnpm test` | 运行 Vitest 测试 |
| `pnpm type-check` | TypeScript 类型检查 |
| `pnpm new-post 文章名` | 新建文章 |
| `pnpm format` / `pnpm lint` | Biome 格式化 / 代码检查 |
| `pnpm admin` | 启动管理后台（见下文） |

## ⚙️ 站点配置

主要配置集中在 `src/config.ts`：

- `siteConfig`：站点标题、语言、主题色相、横幅轮播、文章列表布局
- `featurePages`：番剧、日记、友链、项目、技能、时间线、相册页面开关
- `navbarTitle`：导航栏标题与图标
- `bangumi` / `anime`：番剧页面数据源
- 其余：评论区（Twikoo）、音乐播放器、樱花特效、全屏壁纸、页脚等

## 🚀 部署

静态站点可部署到任意静态托管平台，本项目默认按 Vercel 配置（`vercel.json` + `@astrojs/vercel`）：

- **Vercel**：导入仓库即自动识别框架，构建命令 `pnpm build`，产物目录 `dist`
- **GitHub Actions**：`.github/workflows/` 内置 build / deploy / biome 工作流
- **Cloudflare Pages / Netlify**：同样支持，需将构建命令与产物目录改为上述值

部署前确认 `astro.config.mjs` 中 `site` 为你的最终域名。`vercel.json` 中已配置部分静态资源（`/assets`、`/pio`、`/js` 等）重定向到阿里云 OSS。

## 🛠️ 管理后台

项目内置一个独立的管理后台（`admin/`），用于图形化编辑文章、管理数据中心与站点设置：

```bash
pnpm admin      # 启动管理后台并自动打开浏览器（http://127.0.0.1:8787）
```

也可以在任意位置运行启动脚本（均可自动定位博客根目录、处理端口冲突并打开浏览器）：

```bash
start-admin.cmd  # Windows（可双击，或在 cmd / PowerShell 中运行）
./start-admin.sh # macOS / Linux / Git Bash
```

脚本的根目录定位顺序：环境变量 `MIZUKI_ROOT` → 脚本所在目录向上逐级查找 → 脚本同目录下的 `mizuki-root.txt` → 用户主目录下的 `.mizuki-root.txt`。因此**把 `start-admin.cmd` / `start-admin.sh` 拷到博客仓库内任意目录都能直接运行**；若放在仓库外（如桌面），任选其一即可：

- 在**用户主目录**（`C:\Users\<你的用户名>`）创建 `.mizuki-root.txt`，内容写入博客仓库根目录路径（如 `D:\.PersonalBlog\Mizuki`）——一次配置，任意位置的脚本副本都可用；
- 在脚本旁边创建 `mizuki-root.txt`（同上内容）；
- 设置环境变量 `MIZUKI_ROOT` 指向仓库根目录（Windows：`setx MIZUKI_ROOT "D:\.PersonalBlog\Mizuki"`，需重开终端生效）。

> 注意：`start-admin.cmd` 必须保持纯 ASCII 编码（全部英文）。cmd.exe 按系统代码页解析批处理文件，若用中文编辑保存为 UTF-8，脚本逻辑会因乱码损坏而无法运行。

启动器特性：默认端口（`ADMIN_PORT`，通常为 8787）被占用时，若该端口已在运行本管理后台则直接复用；否则自动向后查找空闲端口并用新端口启动，服务就绪后自动打开浏览器（`--no-open` 可禁用，`pnpm admin 9000` 可指定端口）。

后台功能包括文章增删改查、Markdown 编辑与预览、图片/视频上传（自动转 WebP）、**PDF 课件一键转 Markdown**、图片批量转 WebP、音频转 MP3、GitHub/Gitee 项目自动拉取等。

> 管理后台源码与文档在独立公开仓库 **[BlogAdmin](https://github.com/SUIFeng123149/BlogAdmin)** 中，使用说明见其 `README.md`。

## 📄 License

[MIT](LICENSE)

## 🙏 致谢

- 模板：[Mizuki](https://github.com/matsuzaka-yuki/mizuki)、[Fuwari](https://github.com/saicaca/fuwari)
- 设计灵感：[Yukina](https://github.com/WhitePaper233/yukina)
- 图标：[Iconify](https://iconify.design/)
