# 管理后台完整内容与站点配置管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让本机管理后台完整管理博客内容、站点展示配置和本地资源。

**Architecture:** 在现有 `admin/server.mjs` 中为文章元数据、相册、资源、站点配置建立白名单 API；通用数据集合继续复用已有 TypeScript 数组读取/写回机制。`admin/public/index.html` 扩展为按“内容 / 站点 / 资源与发布”分组的单页工作区，复用统一表单、上传、确认与提示组件。

**Tech Stack:** Node.js 内置 HTTP/文件系统、Astro 内容集合、原生 HTML/CSS/JavaScript、Vitest、Astro build。

## Global Constraints

- 后台只支持 `127.0.0.1` 本机访问，沿用密码会话。
- 所有文件写入必须限制在仓库根目录下的声明路径，并在写入前生成 `.backup`。
- 不更改前台的数据格式、TypeScript 类型或现有 Astro 扫描规则。
- 图片上传仅允许明确列出的图片 MIME 类型与扩展名，禁止路径穿越。
- 保存失败不得写入部分数据；删除操作必须二次确认。

---

### Task 1: 为后台文件操作建立可测试的安全边界

**Files:**
- Create: `admin/lib/storage.mjs`
- Create: `admin/test/storage.test.mjs`
- Modify: `admin/server.mjs:1-230`

**Interfaces:**
- Produces: `assertPathInside(root, target)`, `writeTextWithBackup(file, content)`, `decodeImageDataUrl(data, allowedMimes)`。
- Consumes: `root` and existing image-upload callers in `server.mjs`。

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { assertPathInside, decodeImageDataUrl } from "../lib/storage.mjs";

test("rejects a path outside the declared root", () => {
  assert.throws(() => assertPathInside("C:/blog", "C:/other/file.jpg"), /outside/i);
});

test("decodes only allowed image data URLs", () => {
  assert.throws(() => decodeImageDataUrl("data:text/plain;base64,SGk=", ["image/webp"]), /type/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test admin/test/storage.test.mjs`

Expected: FAIL because `admin/lib/storage.mjs` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
export function assertPathInside(root, target) {
  const relative = relative(root, target);
  if (relative.startsWith("..") || isAbsolute(relative)) throw new Error("Path is outside the allowed root");
  return target;
}

export function decodeImageDataUrl(data, allowedMimes) {
  const match = String(data).match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match || !allowedMimes.includes(match[1].toLowerCase())) throw new Error("Unsupported file type");
  return { mime: match[1].toLowerCase(), bytes: Buffer.from(match[2], "base64") };
}
```

Replace the duplicated data-URL parsing in `savePostAsset` and `saveCollectionMedia` with these functions, retaining their WebP signature checks.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test admin/test/storage.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add admin/lib/storage.mjs admin/test/storage.test.mjs admin/server.mjs
git commit -m "refactor: secure admin file storage"
```

### Task 2: 补齐文章状态与首页内容控制

**Files:**
- Create: `admin/test/posts.test.mjs`
- Modify: `admin/server.mjs:listPosts, readPost, writePost, handleApi`
- Modify: `admin/public/index.html:post form, list rendering, submit handler`
- Modify: `src/content/config.ts` only if the collection schema lacks `featured` and `contentSection`

**Interfaces:**
- Produces: post payload fields `featured:boolean`, `contentSection:"technical"|"notes"|"games"|"other"|""`, `status`, `testedOn`, `lastVerified`.
- Consumes: `CONTENT_SECTIONS` in `src/utils/content-sections.ts` and current article status values.

- [ ] **Step 1: Write the failing test**

```js
test("serializes featured and section metadata when saving a post", async () => {
  const saved = serializePost({ title: "A", featured: true, contentSection: "technical", status: "verified" });
  assert.match(saved, /featured:\s*true/);
  assert.match(saved, /contentSection:\s*technical/);
  assert.match(saved, /status:\s*verified/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test admin/test/posts.test.mjs`

Expected: FAIL because `serializePost` and the new metadata are not exposed.

- [ ] **Step 3: Write minimal implementation**

Extract frontmatter serialization from the post writer into `serializePost(data, body)`. Validate status against `verified`, `maintenance`, `outdated`, and validate `contentSection` against the four homepage sections. Add a featured checkbox and section select to the article form; show status/featured badges in article lists.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test admin/test/posts.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add admin/server.mjs admin/public/index.html admin/test/posts.test.mjs src/content/config.ts
git commit -m "feat: manage article status and homepage placement"
```

### Task 3: 完整化通用内容集合与相册管理

**Files:**
- Create: `admin/lib/albums.mjs`
- Create: `admin/test/albums.test.mjs`
- Modify: `admin/server.mjs:dataCollections, handleApi`
- Modify: `admin/public/index.html:data collection schemas, collection navigation, upload controls`

**Interfaces:**
- Produces: `readAlbums()`, `writeAlbumInfo(id, info)`, `saveAlbumImage(id, body)`, and collection schemas for `projects`, `skills`, `timeline`.
- Consumes: `public/images/albums/<id>/info.json` and the existing `projectsData`, `skillsData`, `timelineData` arrays.

- [ ] **Step 1: Write the failing test**

```js
test("writes album metadata only below the albums root", async () => {
  await assert.rejects(() => writeAlbumInfo("../outside", { title: "x" }), /invalid/i);
});

test("normalizes a local album info object", () => {
  assert.deepEqual(normalizeAlbumInfo({ title: "旅行", columns: 9 }), { title: "旅行", description: "", date: "", location: "", tags: [], layout: "grid", columns: 3, hidden: false });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test admin/test/albums.test.mjs`

Expected: FAIL because the album module does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement album ID validation and metadata normalization. Add `/api/albums` list/create and `/api/albums/:id` read/update/delete endpoints, plus a narrow image-upload endpoint. Add an “相册” collection tab with metadata form, image thumbnail list, cover replacement, and explicit hidden toggle. Ensure existing project, skill and timeline schemas expose every field in their data interfaces, including nested arrays and project links.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test admin/test/albums.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add admin/lib/albums.mjs admin/test/albums.test.mjs admin/server.mjs admin/public/index.html
git commit -m "feat: manage albums and complete content collections"
```

### Task 4: 扩展白名单站点设置与高级 JSON 编辑

**Files:**
- Create: `admin/lib/settings.mjs`
- Create: `admin/test/settings.test.mjs`
- Modify: `admin/server.mjs:readSettings, writeSettings, handleApi`
- Modify: `admin/public/index.html:settings view and settings handlers`

**Interfaces:**
- Produces: `readManagedSettings(source)`, `applyManagedSettings(source, data)`, `managedSettingGroups`.
- Consumes: named exports in `src/config.ts`; only groups listed in `managedSettingGroups` are writable.

- [ ] **Step 1: Write the failing test**

```js
test("updates only a whitelisted setting", () => {
  const source = 'export const announcementConfig = { enable: false, content: "old" };\nexport const secret = "keep";';
  const next = applyManagedSettings(source, { announcement: { enable: true, content: "new" } });
  assert.match(next, /content: "new"/);
  assert.match(next, /secret = "keep"/);
});

test("rejects invalid advanced JSON", () => {
  assert.throws(() => parseAdvancedJson("{bad}"), /JSON/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test admin/test/settings.test.mjs`

Expected: FAIL because the settings module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create setting groups for identity, navigation, homepage, announcement, feature toggles, profile/social, footer, sidebar, theme, comments and music. The API must return only these groups and reject unknown keys. Build grouped settings forms and an “高级 JSON” drawer that previews changed keys before save; retain the existing backup behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test admin/test/settings.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add admin/lib/settings.mjs admin/test/settings.test.mjs admin/server.mjs admin/public/index.html
git commit -m "feat: manage site configuration groups"
```

### Task 5: 增加资源与发布工作台并完成验证

**Files:**
- Create: `admin/lib/resources.mjs`
- Create: `admin/test/resources.test.mjs`
- Modify: `admin/server.mjs:handleApi`
- Modify: `admin/public/index.html:navigation, resource view, publish view`
- Modify: `admin/README.md`

**Interfaces:**
- Produces: `listManagedResources()`, `findResourceReferences(path)`, `getWorkspaceStatus()`.
- Consumes: declared image roots and existing `triggerDeploy()`.

- [ ] **Step 1: Write the failing test**

```js
test("does not delete a referenced resource without force confirmation", async () => {
  await assert.rejects(() => removeResource("assets/images/used.webp", { force: false }), /referenced/i);
});

test("workspace status returns changed file paths without shell interpolation", async () => {
  const result = await getWorkspaceStatus();
  assert.ok(Array.isArray(result.changed));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test admin/test/resources.test.mjs`

Expected: FAIL because the resource module does not exist.

- [ ] **Step 3: Write minimal implementation**

List only configured resource roots, return safe public paths, and scan supported content files for references before deletion. Add a workspace status endpoint that invokes fixed Git arguments through `spawn` (never a shell string), a build trigger with fixed `pnpm build` arguments, and an explicit deploy-hook action. Add grouped navigation and compact cards for resources/build/deploy outcomes. Document local-only operation and backup behavior in `admin/README.md`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test admin/test/resources.test.mjs && pnpm test && pnpm build`

Expected: all admin tests, existing Vitest tests, and the static build pass.

- [ ] **Step 5: Commit**

```bash
git add admin/lib/resources.mjs admin/test/resources.test.mjs admin/server.mjs admin/public/index.html admin/README.md
git commit -m "feat: add admin resource and publish workspace"
```

## Plan Self-Review

- Spec coverage: Tasks 2–3 cover content; Task 4 covers all configured site settings and advanced JSON; Task 5 covers resources and publishing; Task 1 applies the required local-write safety boundary.
- Placeholder scan: no unresolved scope or implementation placeholders remain.
- Type consistency: all task interfaces are defined before consumption; filesystem writes flow through Task 1 helpers.
