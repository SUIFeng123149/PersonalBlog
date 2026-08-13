import type {
	AnnouncementConfig,
	CommentConfig,
	ExpressiveCodeConfig,
	FooterConfig,
	FullscreenWallpaperConfig,
	LicenseConfig,
	MusicPlayerConfig,
	NavBarConfig,
	ProfileConfig,
	SakuraConfig,
	SidebarLayoutConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

// 站点多语言配置

// 当前语言设置
const SITE_LANG = "zh_CN"; // 语言设置，可选 'en', 'zh_CN', 'ja' 等

export const siteConfig: SiteConfig = {
	title: "云栖小筑",
	subtitle: "",

	lang: SITE_LANG,

	themeColor: {
		hue: 250, // 主题色色调值，范围 0 到 360，暖色调（如橙色）约 35-50，冷色调（如蓝色）约 200-230，紫色约 270-300，粉色约 330-345
		fixed: false, // 是否固定色调值，若为 false 则根据时间或用户偏好自动调整
	},

	// 特色页面开关配置
	featurePages: {
		anime: true, // 番剧页面开关
		diary: true, // 日记页面开关
		friends: true, // 友链页面开关
		projects: true, // 项目页面开关
		skills: true, // 技能页面开关
		timeline: true, // 时间线页面开关
		albums: true, // 相册页面开关
	},

	// 导航栏标题
	navbarTitle: {
		// 导航栏标题文本
		text: "SuifengFlying",
		// 导航栏标题图标路径，相对于 public 目录
		icon: "assets/home/home.png",
	},

	bangumi: {
		userId: "1268791", // Bangumi 用户 ID
	},

	anime: {
		mode: "bangumi", // 番剧页面模式："bangumi" 使用 bangumi API，"local" 使用本地数据
	},

	// 文章列表布局
	postListLayout: {
		// 默认布局模式："list" 为列表模式，"grid" 为网格模式
		defaultMode: "grid",
		// 是否允许用户切换布局
		allowSwitch: true,
	},

	banner: {
		enable: true, // 是否启用 Banner

		// 图片源路径数组（数量 > 1 时会启用轮播）
		src: {
			desktop: [
				"/assets/desktop-banner/d1.webp",
				"/assets/desktop-banner/d2.webp",
				"/assets/desktop-banner/d3.webp",
				"/assets/desktop-banner/d4.webp",
				"/assets/desktop-banner/d5.webp",
				"/assets/desktop-banner/d6.webp",
				"/assets/desktop-banner/d7.webp",
				"/assets/desktop-banner/d8.webp",
			], // 桌面端图片
			mobile: [
				"/assets/mobile-banner/m1.webp",
				"/assets/mobile-banner/m2.webp",
				"/assets/mobile-banner/m3.webp",
				"/assets/mobile-banner/m4.webp",
				"/assets/mobile-banner/m5.webp",
				"/assets/mobile-banner/m6.webp",
				"/assets/mobile-banner/m7.webp",
				"/assets/mobile-banner/m8.webp",
			], // 移动端图片
		}, // 支持本地图片路径

		position: "center", // 图片定位方式，对应 object-position：'top', 'center', 'bottom'，默认 'center'

		carousel: {
			enable: true, // 设为 true 启用轮播，false 则只显示第一张图

			interval: 2.5, // 轮播切换间隔（秒）
		},

		waves: {
			enable: true, // 是否启用水波纹效果
			performanceMode: false, // 性能模式（动画复杂度降低 50%）
			mobileDisable: false, // 移动端禁用
		},

		// PicFlow API 配置（获取外部图片 API）
		imageApi: {
			enable: false, // 启用图片 API
			url: "http://domain.com/api_v2.php?format=text&count=4", // API 地址，返回每行一个图片链接的文本
		},
		// 更多关于 PicFlow API 的说明：
		// 该 API 需要返回 format=text 格式的数据
		// 项目地址：https://github.com/matsuzaka-yuki/PicFlow-API
		// 自建 API

		homeText: {
			enable: true, // 是否在首页显示文字
			title: "欢迎来到 SuifengFlying!", // 主标题

			subtitle: [
				"一个简洁的个人博客",
				"记录生活与技术",
				"分享思考与成长",
				"探索未知，保持热爱",
			],
			typewriter: {
				enable: true, // 是否启用打字机效果

				speed: 100, // 打字速度（毫秒）
				deleteSpeed: 50, // 删除速度（毫秒）
				pauseTime: 2000, // 完整显示后的暂停时间（毫秒）
			},
		},

		credit: {
			enable: false, // 是否在 Banner 中显示图片来源信息

			text: "Describe", // 图片描述文字
			url: "", // 图片来源链接 URL
		},

		navbar: {
			transparentMode: "semifull", // 导航栏透明模式："semi" 为半透明，"full" 为全透明，"semifull" 为混合模式
		},
	},
	toc: {
		enable: true, // 启用目录
		depth: 3, // 目录深度 1-6，1 表示只显示 h1，2 表示显示 h1 到 h2，以此类推
	},
	generateOgImages: true, // 是否生成 OpenGraph 图片，请先确认已正确配置相关插件后再启用
	favicon: [
		// 在此处添加 favicon
		// {
		//   src: '/favicon/icon.png',    // 图标路径
		//   theme: 'light',              // 主题模式：'light' | 'dark'
		//   sizes: '32x32',              // 图标尺寸
		// }
	],

	// 字体设置
	font: {
		zenMaruGothic: {
			enable: false, // 是否使用 ZenMaruGothic 作为全局字体
		},
		hanalei: {
			enable: false, // 是否使用 Hanalei 作为全局字体（覆盖 ZenMaruGothic）
		},
	},
	showLastModified: true, // 在文章底部显示"上次编辑"卡片
};
export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
	enable: true, // 启用全屏壁纸功能，仅在 Banner 关闭时生效
	src: {
		desktop: [
			"/assets/desktop-banner/d1.webp",
			"/assets/desktop-banner/d2.webp",
			"/assets/desktop-banner/d3.webp",
			"/assets/desktop-banner/d4.webp",
			"/assets/desktop-banner/d5.webp",
			"/assets/desktop-banner/d6.webp",
			"/assets/desktop-banner/d7.webp",
			"/assets/desktop-banner/d8.webp",
		], // 桌面端图片
		mobile: [
			"/assets/mobile-banner/m1.webp",
			"/assets/mobile-banner/m2.webp",
			"/assets/mobile-banner/m3.webp",
			"/assets/mobile-banner/m4.webp",
			"/assets/mobile-banner/m5.webp",
			"/assets/mobile-banner/m6.webp",
			"/assets/mobile-banner/m7.webp",
			"/assets/mobile-banner/m8.webp",
		], // 移动端图片
	}, // 支持本地图片路径
	position: "center", // 壁纸定位方式，对应 object-position
	carousel: {
		enable: true, // 启用轮播
		interval: 1, // 轮播间隔时间（秒）
	},
	zIndex: -1, // 层级，确保壁纸在合适的层级显示
	opacity: 0.8, // 壁纸透明度
	blur: 1, // 背景模糊程度
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		// 如需添加自定义链接，可参考以下示例，3.1 版本已支持子菜单
		{
			name: "Links",
			url: "/links/",
			icon: "material-symbols:link",
			children: [
				{
					name: "GitHub",
					url: "https://github.com/SUIFeng123149",
					external: true,
					icon: "fa6-brands:github",
				},
				{
					name: "Bilibili",
					url: "https://space.bilibili.com/392509776",
					external: true,
					icon: "fa6-brands:bilibili",
				},
				{
					name: "Gitee",
					url: "https://gitee.com/with-the-wind1/",
					external: true,
					icon: "mdi:git",
				},
			],
		},
		{
			name: "My",
			url: "/content/",
			icon: "material-symbols:person",
			children: [
				LinkPreset.Anime,
				LinkPreset.Diary,
				{
					name: "Now",
					url: "/now/",
					icon: "material-symbols:today",
				},
				{
					name: "Gallery",
					url: "/albums/",
					icon: "material-symbols:photo-library",
				},
			],
		},
		LinkPreset.Friends,
		{
			name: "Others",
			url: "#",
			icon: "material-symbols:more-horiz",
			children: [
				{
					name: "Projects",
					url: "/projects/",
					icon: "material-symbols:work",
				},
				{
					name: "Skills",
					url: "/skills/",
					icon: "material-symbols:psychology",
				},
				{
					name: "Timeline",
					url: "/timeline/",
					icon: "material-symbols:timeline",
				},
			],
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.webp", // 头像路径，相对于 /src 目录用 '/' 开头，相对于 /public 目录
	name: "SuifengFlying",
	bio: "美好的事物总是短暂,有一瞬的绽放,总好过默默无闻的凋零",
	typewriter: {
		enable: true, // 是否启用打字机效果
		speed: 80, // 打字速度（毫秒）
	},
	links: [
		{
			name: "Bilibli",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/392509776",
		},
		{
			name: "Gitee",
			icon: "mdi:git",
			url: "https://gitee.com/with-the-wind1/",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/SUIFeng123149",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 主题配置已迁移至 astro.config.mjs 中统一管理
	// 如需修改代码高亮主题，请前往 astro.config.mjs 中配置
	theme: "github-dark",
};

export const commentConfig: CommentConfig = {
	enable: false, // 是否启用评论功能，设为 false 则评论区域完全隐藏
	twikoo: {
		envId: "https://twikoo.vercel.app",
		lang: "en", // Twikoo 评论系统语言设置
	},
};

export const announcementConfig: AnnouncementConfig = {
	title: "公告", // 公告标题
	content: "欢迎来到我的博客，这里记录生活与技术。", // 公告内容
	closable: true, // 是否可关闭
	link: {
		enable: true, // 是否启用链接
		text: "了解更多", // 链接文字
		url: "/about/", // 链接 URL
		external: false, // 是否外部链接
	},
};

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true, // 启用音乐播放器功能
};

export const footerConfig: FooterConfig = {
	enable: false, // 是否启用 Footer HTML 注入功能
};

// 可在 FooterConfig.customHtml 中自定义 HTML 内容，用于添加备案号等信息

/**
 * 侧边栏布局配置
 * 可自定义侧边栏的组件顺序、位置和样式
 */
export const sidebarLayoutConfig: SidebarLayoutConfig = {
	// 是否启用侧边栏
	enable: true,

	// 侧边栏位置：左侧或右侧
	position: "left",

	// 侧边栏组件列表
	components: [
		{
			// 个人资料组件
			type: "profile",
			// 是否启用该组件
			enable: true,
			// 显示顺序
			order: 1,
			// 组件位置："top" 为顶部固定区域
			position: "top",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间（毫秒）
			animationDelay: 0,
		},
		{
			// 公告栏组件
			type: "announcement",
			// 是否启用该组件（使用 sidebarLayoutConfig 统一控制）
			enable: true,
			// 显示顺序
			order: 2,
			// 组件位置："top" 为顶部固定区域
			position: "top",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间（毫秒）
			animationDelay: 50,
		},
		{
			// 分类列表组件
			type: "categories",
			// 是否启用该组件
			enable: true,
			// 显示顺序
			order: 3,
			// 组件位置："sticky" 为粘性区域
			position: "sticky",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间（毫秒）
			animationDelay: 150,
			// 响应式配置
			responsive: {
				// 折叠阈值，分类数量超过此值时折叠显示
				collapseThreshold: 5,
			},
		},
		{
			// 标签列表组件
			type: "tags",
			// 是否启用该组件
			enable: true,
			// 显示顺序
			order: 5,
			// 组件位置："sticky" 为粘性区域
			position: "sticky",
			// CSS 类名
			class: "onload-animation",
			// 动画延迟时间（毫秒）
			animationDelay: 250,
			// 响应式配置
			responsive: {
				// 折叠阈值，标签数量超过此值时折叠显示，设为 0 表示始终折叠
				collapseThreshold: 20,
			},
		},
	],

	// 默认动画配置
	defaultAnimation: {
		// 是否启用默认动画
		enable: true,
		// 基础延迟时间（毫秒）
		baseDelay: 0,
		// 每个组件递增的延迟时间（毫秒），从第二个组件开始累加
		increment: 50,
	},

	// 响应式配置
	responsive: {
		// 屏幕断点
		breakpoints: {
			// 移动端断点：小于 768px
			mobile: 768,
			// 平板端断点：小于 1024px
			tablet: 1024,
			// 桌面端断点：小于 1280px
			desktop: 1280,
		},
		// 各设备布局模式
		// hidden: 隐藏侧边栏   drawer: 抽屉式（从侧边滑出）   sidebar: 固定侧边栏
		layout: {
			// 移动端布局模式
			mobile: "sidebar",
			// 平板端布局模式
			tablet: "sidebar",
			// 桌面端布局模式
			desktop: "sidebar",
		},
	},
};

export const sakuraConfig: SakuraConfig = {
	enable: false, // 是否启用樱花特效
	sakuraNum: 21, // 樱花数量
	limitTimes: -1, // 樱花越界限制次数，-1 为无限循环
	size: {
		min: 0.5, // 樱花最小尺寸倍数
		max: 1.1, // 樱花最大尺寸倍数
	},
	opacity: {
		min: 0.3, // 樱花最小透明度
		max: 0.9, // 樱花最大透明度
	},
	speed: {
		horizontal: {
			min: -1.7, // 水平移动速度最小值
			max: -1.2, // 水平移动速度最大值
		},
		vertical: {
			min: 1.5, // 垂直移动速度最小值
			max: 2.2, // 垂直移动速度最大值
		},
		rotation: 0.03, // 旋转速度
		fadeSpeed: 0.03, // 消失速度
	},
	zIndex: 100, // 层级，确保樱花在合适的层级显示
};

// Pio 看板娘配置
export const pioConfig: import("./types/config").PioConfig = {
	enable: true, // 是否启用看板娘
	models: ["/pio/models/pio/model.json"], // 模型文件路径数组
	position: "left", // 看板娘位置
	width: 280, // 看板娘宽度
	height: 250, // 看板娘高度
	mode: "draggable", // 展现模式
	hiddenOnMobile: true, // 是否在移动设备上隐藏
	dialog: {
		touch: [
			"What are you doing?",
			"Stop touching me!",
			"HENTAI!",
			"Don't bully me like that!",
		], // 触摸提示
		home: "Click here to go back to homepage!", // 首页提示
		skin: ["Want to see my new outfit?", "The new outfit looks great~"], // 换装提示
		close: "QWQ See you next time~", // 关闭提示
		link: "https://github.com/matsuzaka-yuki/Mizuki", // 关于链接
	},
};

// 组件配置集
export const widgetConfigs = {
	sakura: sakuraConfig, // 樱花特效
} as const;

export const umamiConfig = {
	enabled: false, // 是否启用 Umami 统计
	apiKey: import.meta.env.UMAMI_API_KEY || "api_xxxxxxxx", // API 密钥，优先使用环境变量，回退至默认值
	baseUrl: "https://api.umami.is", // Umami Cloud API 基础地址
	scripts: `
<script defer src="XXXX.XXX" data-website-id="ABCD1234"></script>
  `.trim(), // 统计脚本，需自行替换网站 ID，会自动注入 Layout 中
} as const;
