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
});
