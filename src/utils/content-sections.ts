import { contentSections } from "../data/sections";

export type ContentSectionSlug = "technical" | "notes" | "games" | "other";

export interface ContentSection {
	slug: ContentSectionSlug;
	title: string;
	description: string;
	icon: string;
	categories: string[];
}

export const CONTENT_SECTIONS: ContentSection[] = contentSections;

// 分类 → 分区映射（由分区配置推导，可由管理后台维护）
const sectionCategoryMap = new Map<string, ContentSectionSlug>();
for (const section of contentSections) {
	for (const category of section.categories) {
		sectionCategoryMap.set(category, section.slug);
	}
}

export function getContentSection(
	category: string | null | undefined,
): ContentSectionSlug {
	const normalized = category?.trim() ?? "";
	return sectionCategoryMap.get(normalized) ?? "other";
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

/**
 * 某分区的分类列表：配置分类（按配置顺序，含暂无文章的空分类）
 * + 文章实际出现但未配置的分类（追加在后）。
 * 用于分类卡片与分类详情页的静态路径生成。
 */
export function getCategoriesForContentSection<
	T extends {
		data: {
			category?: string | null;
			contentSection?: ContentSectionSlug;
		};
	},
>(posts: T[], section: ContentSectionSlug): string[] {
	const configured =
		contentSections.find((item) => item.slug === section)?.categories ?? [];
	const fromPosts = [
		...new Set(
			posts
				.filter(
					(post) =>
						(post.data.contentSection ??
							getContentSection(post.data.category)) === section,
				)
				.map((post) => String(post.data.category || "").trim())
				.filter(Boolean),
		),
	];
	const seen = new Set(configured);
	const extra = fromPosts.filter((category) => !seen.has(category));
	return [...configured, ...extra];
}

export function getFeaturedPosts<T extends { data: { featured?: boolean } }>(
	posts: T[],
	limit = 6,
): T[] {
	return posts.filter((post) => post.data.featured === true).slice(0, limit);
}
