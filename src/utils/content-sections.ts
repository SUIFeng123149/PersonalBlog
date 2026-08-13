export type ContentSectionSlug = "technical" | "notes" | "games" | "other";

export interface ContentSection {
	slug: ContentSectionSlug;
	title: string;
	description: string;
	icon: string;
}

export const CONTENT_SECTIONS: ContentSection[] = [
	{
		slug: "technical",
		title: "技术资料",
		description: "开发教程、工具实践与技术沉淀",
		icon: "material-symbols:code-rounded",
	},
	{
		slug: "notes",
		title: "个人随笔",
		description: "日常记录、思考与生活片段",
		icon: "material-symbols:edit-note-rounded",
	},
	{
		slug: "games",
		title: "游戏记录",
		description: "游戏体验、攻略与进度记录",
		icon: "material-symbols:sports-esports-rounded",
	},
	{
		slug: "other",
		title: "其他",
		description: "尚未归入以上主题的内容",
		icon: "material-symbols:category-rounded",
	},
];

const TECHNICAL_CATEGORIES = new Set([
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
	"Web",
]);

const NOTES_CATEGORIES = new Set(["随笔", "日记", "生活", "思考"]);
const GAMES_CATEGORIES = new Set(["游戏", "游戏记录", "游戏攻略"]);

export function getContentSection(
	category: string | null | undefined,
): ContentSectionSlug {
	const normalized = category?.trim() ?? "";
	if (TECHNICAL_CATEGORIES.has(normalized)) return "technical";
	if (NOTES_CATEGORIES.has(normalized)) return "notes";
	if (GAMES_CATEGORIES.has(normalized)) return "games";
	return "other";
}

export function getPostsForContentSection<
	T extends {
		data: {
			category?: string | null;
			contentSection?: ContentSectionSlug;
		};
	},
>(posts: T[], section: ContentSectionSlug): T[] {
	return posts.filter(
		(post) =>
			(post.data.contentSection ?? getContentSection(post.data.category)) ===
			section,
	);
}

export function getFeaturedPosts<T extends { data: { featured?: boolean } }>(
	posts: T[],
	limit = 6,
): T[] {
	return posts.filter((post) => post.data.featured === true).slice(0, limit);
}
