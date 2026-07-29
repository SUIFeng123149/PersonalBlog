import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
	getContentSection,
	getPostsForContentSection,
} from "../src/utils/content-sections";

describe("content sections", () => {
	it("classifies configured technical categories as technical", () => {
		expect(getContentSection("AI Agent")).toBe("technical");
		expect(getContentSection("JavaSE")).toBe("technical");
	});

	it("classifies configured diary and game categories", () => {
		expect(getContentSection("随笔")).toBe("notes");
		expect(getContentSection("游戏")).toBe("games");
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
			{ data: { category: "游戏" } },
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

	it("uses bold text for section descriptions and post tags", async () => {
		const [sections, postCard] = await Promise.all([
			readFile("src/components/ContentSectionCards.astro", "utf8"),
			readFile("src/components/PostCard.astro", "utf8"),
		]);

		expect(sections).toContain('class="text-sm font-bold leading-6 text-60"');
		expect(postCard).toContain("btn-regular h-6 text-xs font-bold");
	});

	it("uses an installed icon for the game section", async () => {
		const sections = await readFile("src/utils/content-sections.ts", "utf8");
		expect(sections).toContain("material-symbols:sports-esports-rounded");
		expect(sections).not.toContain("material-symbols:stadia-controller-rounded");
	});

	it("defines a section route that filters posts before pagination", async () => {
		const route = await readFile(
			"src/pages/category/[section]/[...page].astro",
			"utf8",
		);
		expect(route).toContain("getPostsForContentSection(allBlogPosts, section.slug)");
		expect(route).toContain("paginate(sectionPosts");
		expect(route).toContain("basePath={`/category/${section}/`}");
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
