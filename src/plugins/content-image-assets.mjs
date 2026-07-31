import path from "node:path";
import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";

const postsDirectory = path.resolve("src/content/posts");
const markdownExtensions = new Set([".md", ".mdx"]);

function isLocalRelativeUrl(url) {
	return (
		url &&
		!url.startsWith("/") &&
		!url.startsWith("#") &&
		!url.startsWith("//") &&
		!url.startsWith("data:") &&
		!(/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url))
	);
}

function isInsidePostsDirectory(filePath) {
	const relativePath = path.relative(postsDirectory, filePath);
	return relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}

/**
 * Makes local Markdown image URLs deployable. Astro renders Markdown links as-is,
 * so source-relative files otherwise point to /src/content/posts in production.
 */
export function remarkContentImageAssets() {
	return (tree, file) => {
		if (!file.path || !isInsidePostsDirectory(file.path)) return;

		visit(tree, "image", (node) => {
			if (!isLocalRelativeUrl(node.url)) return;

			const [pathname, suffix = ""] = node.url.split(/([?#].*)/, 2);
			let decodedPathname;
			try {
				decodedPathname = decodeURIComponent(pathname);
			} catch {
				return;
			}

			const sourcePath = path.resolve(path.dirname(file.path), decodedPathname);
			if (!isInsidePostsDirectory(sourcePath) || !existsSync(sourcePath)) return;

			const publicPath = path.relative(postsDirectory, sourcePath).split(path.sep).join("/");
			node.url = `/post-assets/${encodeURI(publicPath)}${suffix}`;
		});
	};
}

export function contentImageAssets() {
	return {
		name: "content-image-assets",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				const outputDirectory = path.join(
					fileURLToPath(dir),
					"post-assets",
				);
				await cp(postsDirectory, outputDirectory, {
					recursive: true,
					filter: (source) => !markdownExtensions.has(path.extname(source).toLowerCase()),
				});
			},
		},
	};
}
