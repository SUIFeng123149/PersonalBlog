// 云栖小筑 · Mizuki 管理后台启动器
//
// 特性：
//   - 本脚本可放在任意位置运行（仓库内任意目录、仓库外均可），自动定位博客根目录
//   - 在任何工作目录下均可启动，无需手动 cd
//   - 默认端口（.env.admin 中的 ADMIN_PORT，通常为 8787）被占用时：
//       * 若该端口上已在运行本管理后台，则直接复用并打开浏览器；
//       * 否则自动向后扫描空闲端口，用新端口启动；
//   - 服务就绪后自动打开浏览器访问对应地址（可用 --no-open 关闭）
//
// 根目录定位顺序：
//   1. 环境变量 MIZUKI_ROOT（显式指定，优先级最高）
//   2. 本脚本所在目录向上逐级查找包含 admin/server.mjs 的目录
//   3. 与本脚本同目录的 mizuki-root.txt（脚本放在仓库外时，写入仓库根目录路径即可）
//
// 用法：
//   node scripts/start-admin.mjs [端口] [--no-open]
//   pnpm admin                        # 等同 node scripts/start-admin.mjs

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- 定位博客仓库根目录 ----
function isBlogRoot(dir) {
	return existsSync(path.join(dir, "admin", "server.mjs"));
}

function findBlogRoot(scriptDir) {
	const hint = process.env.MIZUKI_ROOT;
	if (hint && isBlogRoot(path.resolve(hint))) return path.resolve(hint);

	let dir = scriptDir;
	for (;;) {
		if (isBlogRoot(dir)) return dir;
		const parent = path.dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
let root = findBlogRoot(scriptDir);

// 脚本位于仓库外时，依次尝试读取提示文件（脚本同目录 / 用户主目录）
const rootHints = [
	path.join(scriptDir, "mizuki-root.txt"),
	path.join(os.homedir(), ".mizuki-root.txt"),
];
for (const hintFile of rootHints) {
	if (root) break;
	try {
		const hint = readFileSync(hintFile, "utf8")
			.trim()
			.replace(/^['"]|['"]$/g, "");
		if (hint && isBlogRoot(path.resolve(path.dirname(hintFile), hint)))
			root = path.resolve(path.dirname(hintFile), hint);
	} catch {
		// 文件不存在时忽略
	}
}

if (!root) {
	console.error("未找到博客根目录（缺少 admin/server.mjs）。");
	console.error("本脚本可放在博客仓库中任意目录运行；若放在仓库外，请满足其一：");
	console.error("  · 设置环境变量 MIZUKI_ROOT 指向仓库根目录；或");
	console.error("  · 在脚本同目录创建 mizuki-root.txt，内容写入仓库根目录路径；或");
	console.error("  · 在用户主目录创建 .mizuki-root.txt，内容写入仓库根目录路径。");
	process.exit(1);
}

const serverEntry = path.join(root, "admin", "server.mjs");

// ---- 解析命令行参数 ----
let openBrowser = true;
let cliPort = null;
for (const arg of process.argv.slice(2)) {
	if (arg === "--no-open") {
		openBrowser = false;
	} else if (/^\d{1,5}$/.test(arg)) {
		cliPort = Number(arg);
	} else {
		console.error(`未知参数：${arg}`);
		console.error("用法：node scripts/start-admin.mjs [端口] [--no-open]");
		process.exit(1);
	}
}

// ---- 读取 .env.admin（与 admin/config.mjs 相同的优先级：已存在的环境变量优先）----
async function loadEnvFile(filePath) {
	const env = {};
	try {
		const text = await readFile(filePath, "utf8");
		for (const line of text.split(/\r?\n/)) {
			const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
			if (match && !match[2].startsWith("#"))
				env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
		}
	} catch {
		// 文件不存在时使用默认值
	}
	return env;
}

const envFile = await loadEnvFile(path.join(root, ".env.admin"));
const host = process.env.ADMIN_HOST || envFile.ADMIN_HOST || "127.0.0.1";
const envPort = Number(process.env.ADMIN_PORT || envFile.ADMIN_PORT || 8787);
const startPort =
	cliPort ??
	(Number.isInteger(envPort) && envPort > 0 && envPort < 65536 ? envPort : 8787);
// 浏览器无法访问 0.0.0.0 / ::，此时用 127.0.0.1 作为访问地址
const displayHost =
	host === "0.0.0.0" || host === "::" || host === "" ? "127.0.0.1" : host;

// ---- 端口检测 ----
function isPortFree(host, port) {
	return new Promise((resolve) => {
		const probe = net.createServer();
		probe.unref();
		probe.once("error", () => resolve(false));
		probe.once("listening", () => probe.close(() => resolve(true)));
		try {
			probe.listen(port, host);
		} catch {
			resolve(false);
		}
	});
}

// 请求 / 并判断是否为本管理后台（登录页 HTML 中包含「管理后台」）
function isAdminPage(host, port) {
	return new Promise((resolve) => {
		const request = http.get({ host, port, path: "/", timeout: 3000 }, (response) => {
			let body = "";
			response.setEncoding("utf8");
			response.on("data", (chunk) => (body += chunk));
			response.on("end", () => resolve(body.includes("管理后台")));
		});
		request.on("timeout", () => {
			request.destroy();
			resolve(false);
		});
		request.on("error", () => resolve(false));
	});
}

async function findFreePort(host, fromPort) {
	const last = Math.min(fromPort + 100, 65535);
	for (let port = fromPort; port <= last; port++) {
		if (await isPortFree(host, port)) return port;
	}
	return null;
}

// ---- 打开浏览器（跨平台）----
function openBrowserUrl(url) {
	return new Promise((resolve) => {
		const [command, args] =
			process.platform === "win32"
				? ["cmd", ["/c", "start", "", url]]
				: process.platform === "darwin"
					? ["open", [url]]
					: ["xdg-open", [url]];
		const opener = spawn(command, args, { detached: true, stdio: "ignore" });
		opener.on("error", () => resolve(false));
		opener.on("exit", () => resolve(true));
	});
}

// ---- 主流程 ----
console.log("云栖小筑 · Mizuki 管理后台启动器");
console.log(`博客根目录：${root}`);

let port = startPort;
if (!(await isPortFree(host, port))) {
	if (await isAdminPage(host, port)) {
		console.log(`检测到管理后台已在 http://${displayHost}:${port} 运行，直接打开。`);
		if (openBrowser) await openBrowserUrl(`http://${displayHost}:${port}`);
		process.exit(0);
	}
	console.log(`端口 ${port} 已被其他程序占用，正在向后查找空闲端口…`);
	const freePort = await findFreePort(host, port + 1);
	if (freePort === null) {
		console.error(`未找到空闲端口（${port + 1}–${Math.min(port + 101, 65535)} 均被占用），请先释放部分端口。`);
		process.exit(1);
	}
	port = freePort;
}

const child = spawn(process.execPath, [serverEntry], {
	cwd: root,
	env: { ...process.env, ADMIN_PORT: String(port), ADMIN_HOST: host },
	stdio: "inherit",
});

let settled = false;
let stopping = false;
child.once("error", (error) => {
	if (settled) return;
	settled = true;
	console.error(`启动 Node.js 进程失败：${error.message}`);
	process.exit(1);
});

console.log(`管理后台启动中：http://${displayHost}:${port}`);
console.log("服务就绪后将自动打开浏览器，按 Ctrl+C 停止服务。");

// 等待服务就绪（子进程异常退出则快速失败）
async function waitForServer(timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (child.exitCode !== null) return false;
		if (await isAdminPage(host, port)) return true;
		await sleep(250);
	}
	return false;
}

const ready = await waitForServer(10000);
if (!ready) {
	if (child.exitCode !== null)
		console.error(`管理后台异常退出（退出码 ${child.exitCode}），请检查上方输出。`);
	else
		console.error("管理后台在 10 秒内未就绪，请检查上方输出。");
	child.kill();
	process.exit(1);
}

console.log(`管理后台已就绪：http://${displayHost}:${port}`);
if (openBrowser) {
	const opened = await openBrowserUrl(`http://${displayHost}:${port}`);
	console.log(opened ? "已在默认浏览器中打开。" : "无法自动打开浏览器，请手动访问上面的地址。");
}

// 转发 Ctrl+C / 终止信号，并等待子进程退出
for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, () => {
		stopping = true;
		console.log("\n正在停止管理后台…");
		child.kill(signal);
		setTimeout(() => {
			if (child.exitCode === null) child.kill("SIGKILL");
		}, 2000);
	});
}

child.once("exit", (code, signal) => {
	if (settled) return;
	settled = true;
	// 143=SIGTERM、130=SIGINT，或收到信号退出：均视为外部终止而非崩溃
	const terminatedExternally = signal !== null || code === 143 || code === 130;
	if (stopping || terminatedExternally || code === 0) {
		console.log("管理后台已停止。");
		process.exit(0);
	}
	console.error(`管理后台异常退出（退出码 ${code}）。`);
	process.exit(code ?? 1);
});
