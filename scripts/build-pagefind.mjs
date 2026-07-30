import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const site = process.env.VERCEL ? ".vercel/output/static" : "dist";

if (!existsSync(site)) {
	throw new Error(`Missing Pagefind site directory: ${site}`);
}

execFileSync(
	process.platform === "win32" ? "pnpm.cmd" : "pnpm",
	["exec", "pagefind", "--site", site],
	{ stdio: "inherit" },
);
