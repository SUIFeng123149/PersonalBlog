import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

const diaryPage = await readFile(new URL("../src/pages/diary.astro", import.meta.url), "utf8");

test("diary renders uploaded public images from the site root", () => {
	expect(diaryPage).toMatch(/image\.startsWith\("\/"\) \? image : `\/\$\{image\}`/);
});
