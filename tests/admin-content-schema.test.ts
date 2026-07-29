import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("admin-managed article placement", () => {
	it("accepts featured articles assigned to a homepage content section", async () => {
		const schema = await readFile("src/content/config.ts", "utf8");

		expect(schema).toContain("featured: z.boolean().optional().default(false)");
		expect(schema).toContain("contentSection:");
		expect(schema).toContain('enum(["technical", "notes", "games", "other"])');
	});
});
