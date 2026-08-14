import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
	getContentSection,
	getFeaturedPosts,
	getPostsForContentSection,
} from "../src/utils/content-sections";

describe("content sections", () => {
	it("does not show diary among personal-note category cards", async () => {
		const component = await readFile("src/components/NotesCategoryCards.astro", "utf8");
		expect(component).toContain('getCategoriesForContentSection(posts, "notes")');
		const sections = await readFile("src/data/sections.ts", "utf8");
		expect(sections).not.toContain('"日记"');
	});
	it("uses an explicit article content section before category inference", async () => {
		const source = await readFile("src/utils/content-sections.ts", "utf8");
		expect(source).toContain("post.data.contentSection ??");
	});
	it("classifies configured technical categories as technical", () => {
		expect(getContentSection("AI Agent")).toBe("technical");
		expect(getContentSection("JavaSE")).toBe("technical");
		expect(getContentSection("Spring")).toBe("technical");
		expect(getContentSection("SpringBoot")).toBe("technical");
		expect(getContentSection("SpringMVC")).toBe("technical");
		expect(getContentSection("SpringSecurity")).toBe("technical");
		expect(getContentSection("MyBatisPlus")).toBe("technical");
	});

	it("classifies configured note and game categories", () => {
		expect(getContentSection("随笔")).toBe("notes");
		expect(getContentSection("原神")).toBe("games");
	});

	it("puts unknown and blank categories in other", () => {
		expect(getContentSection("未整理")).toBe("other");
		expect(getContentSection(" ")).toBe("other");
		expect(getContentSection(null)).toBe("other");
	});

	it("filters posts without dropping unmatched content", () => {
		const posts = [
			{ data: { category: "Web" } },
			{ data: { category: "随笔" } },
			{ data: { category: "原神" } },
			{ data: { category: "" } },
		];

		expect(getPostsForContentSection(posts, "technical")).toHaveLength(1);
		expect(getPostsForContentSection(posts, "notes")).toHaveLength(1);
		expect(getPostsForContentSection(posts, "games")).toHaveLength(1);
		expect(getPostsForContentSection(posts, "other")).toHaveLength(1);
	});

	it("renders all four homepage section links", async () => {
		const component = await readFile(
			"src/components/ContentSectionCards.astro",
			"utf8",
		);
		expect(component).toContain("CONTENT_SECTIONS");
		expect(component).toContain("getPostsForContentSection");
		expect(component).toContain("/category/${section.slug}/");
	});

	it("removes the section-card helper copy", async () => {
		const component = await readFile(
			"src/components/ContentSectionCards.astro",
			"utf8",
		);
		expect(component).not.toContain("选择一个主题开始阅读");
	});

	it("shows only explicitly featured posts and limits them to six", () => {
		const posts = [
			{ id: "featured-1", data: { featured: true } },
			{ id: "regular-1", data: { featured: false } },
			{ id: "featured-2", data: { featured: true } },
			{ id: "featured-3", data: { featured: true } },
			{ id: "featured-4", data: { featured: true } },
			{ id: "featured-5", data: { featured: true } },
			{ id: "featured-6", data: { featured: true } },
			{ id: "featured-7", data: { featured: true } },
		];

		const featured = getFeaturedPosts(posts);
		expect(featured).toHaveLength(6);
		expect(featured.map((post) => post.id)).toEqual([
			"featured-1",
			"featured-2",
			"featured-3",
			"featured-4",
			"featured-5",
			"featured-6",
		]);
	});

	it("uses bold text for section descriptions and post tags", async () => {
		const [sections, postCard] = await Promise.all([
			readFile("src/components/ContentSectionCards.astro", "utf8"),
			readFile("src/components/PostCard.astro", "utf8"),
		]);

		expect(sections).toContain('class="text-sm font-bold leading-6 text-60"');
		expect(postCard).toContain("btn-regular h-6 text-xs font-bold");
	});

	it("keeps article card titles bold in the global font", async () => {
		const postCard = await readFile("src/components/PostCard.astro", "utf8");
		expect(postCard).toContain("font-bold mb-3 text-3xl text-90");
		expect(postCard).not.toContain("post-card-title");
	});

	it("does not override the global ZenMaruGothic font for article titles", async () => {
		const [layout, styles] = await Promise.all([
			readFile("src/layouts/Layout.astro", "utf8"),
			readFile("src/styles/main.css", "utf8"),
		]);

		expect(layout).not.toContain('@fontsource/noto-sans-sc/400.css');
		expect(styles).not.toContain(".post-card-title");
	});

	it("generates only the root homepage path", async () => {
		const homepage = await readFile("src/pages/[...page].astro", "utf8");
		expect(homepage).toContain("params: { page: undefined }");
		expect(homepage).not.toContain("Pagination");
	});

	it("renders the My diary page from dedicated diary entries", async () => {
		const diaryPage = await readFile("src/pages/diary.astro", "utf8");
		expect(diaryPage).toContain('from "../data/diary"');
		expect(diaryPage).toContain("diaryEntries");
		expect(diaryPage).not.toContain("const moments =");
	});

	it("adds a matching featured-post heading to the homepage", async () => {
		const homepage = await readFile("src/pages/[...page].astro", "utf8");
		expect(homepage).toContain("FEATURED");
		expect(homepage).toContain("精选文章");
	});

	it("lets collapsed sidebar widgets toggle open and closed", async () => {
		const widgetLayout = await readFile(
			"src/components/widget/WidgetLayout.astro",
			"utf8",
		);
		expect(widgetLayout).toContain("aria-expanded");
		expect(widgetLayout).toContain("classList.toggle('collapsed')");
	});

	it("always renders a clear Chinese maintenance-status badge on article pages", async () => {
		const articlePage = await readFile(
			"src/pages/posts/[...slug].astro",
			"utf8",
		);
  expect(articlePage).toContain('label: "已验证"');
  expect(articlePage).toContain('label: "维护中"');
  expect(articlePage).toContain('label: "可能已过时"');
		expect(articlePage).toContain('"未设置"');
		expect(articlePage).toContain("Article maintenance status");
		expect(articlePage).not.toContain(
			"(entry.data.status || entry.data.testedOn || entry.data.lastVerified) &&",
		);
	});

	it("uses an installed icon for the game section", async () => {
		const sections = await readFile("src/data/sections.ts", "utf8");
		expect(sections).toContain("material-symbols:sports-esports-rounded");
		expect(sections).not.toContain("material-symbols:stadia-controller-rounded");
	});

	it("defines a section route that filters posts before pagination", async () => {
		const route = await readFile(
			"src/pages/category/technical/[category]/[...page].astro",
			"utf8",
		);
		expect(route).toContain('getPostsForContentSection(await getSortedPosts(), "technical")');
		expect(route).toContain("paginate(");
		expect(route).toContain("basePath={`/category/technical/${encodeURIComponent(category)}/`}");
	});

	it("builds numbered pagination links within an optional base path", async () => {
		const pagination = await readFile(
			"src/components/control/Pagination.astro",
			"utf8",
		);
		expect(pagination).toContain("basePath?: string");
		expect(pagination).toContain("`${basePath}${p}/`");
	});
});
