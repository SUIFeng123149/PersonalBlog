import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const site = process.env.VERCEL ? ".vercel/output/static" : "dist";

if (!existsSync(site)) {
	throw new Error(`Missing Pagefind site directory: ${site}`);
}

// Windows 上通过 cmd.exe /c 来运行 pagefind，避免 spawnSync pnpm.cmd 的 EINVAL 问题
if (process.platform === "win32") {
	execFileSync("cmd.exe", ["/c", "pnpm", "exec", "pagefind", "--site", site], {
		stdio: "inherit",
	});
} else {
	execFileSync("pnpm", ["exec", "pagefind", "--site", site], {
		stdio: "inherit",
	});
}
