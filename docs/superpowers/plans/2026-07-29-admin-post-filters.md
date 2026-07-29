# 管理端文章筛选与精选合并 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在管理端文章页统一提供筛选和首页精选维护，移除独立精选页面。

**Architecture:** 文章列表继续从现有 `/api/posts` 取得完整数据集，前端依据关键词、分类、标签、发布日期和精选状态进行组合过滤。精选开关复用现有文章 PUT API，保存后刷新当前筛选结果并保留 6 篇上限。

**Tech Stack:** 原生 HTML/CSS/JavaScript 管理端、Node.js 内置测试框架、现有文章 REST API。

## Global Constraints

- 不改变文章 API、frontmatter 的 `featured` 字段或主站首页读取逻辑。
- 筛选项由已加载文章动态生成，默认值均为“全部”。
- 筛选条件以 AND 关系组合；关键词继续匹配标题、文件名和分类。
- 开启首页精选时最多允许 6 篇。
- 不使用独立“精选文章”视图或侧栏入口。

---

### Task 1: 文章页筛选控件与筛选逻辑

**Files:**
- Modify: `admin/public/index.html:24,48-49`
- Test: `admin/test/post-editor-controls.test.mjs`

**Interfaces:**
- Consumes: 全局 `posts` 数组，条目包含 `slug`、`title`、`category`、`tags`、`published`、`featured`。
- Produces: `populatePostFilters()` 和 `filteredPosts()`，供 `renderPosts()` 使用。

- [ ] **Step 1: Write the failing test**

```js
test("article list exposes composable metadata filters", () => {
  assert.match(page, /id="post-category-filter"/);
  assert.match(page, /id="post-tag-filter"/);
  assert.match(page, /id="post-date-filter"/);
  assert.match(page, /id="post-featured-filter"/);
  assert.match(page, /function filteredPosts\(\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/post-editor-controls.test.mjs`

Expected: FAIL because the four control IDs and `filteredPosts()` do not exist.

- [ ] **Step 3: Write minimal implementation**

```js
function filteredPosts() {
  const query = $("#search").value.trim().toLowerCase();
  const category = $("#post-category-filter").value;
  const tag = $("#post-tag-filter").value;
  const published = $("#post-date-filter").value;
  const featured = $("#post-featured-filter").value;
  return posts.filter((post) =>
    (!query || `${post.title}${post.slug}${post.category}`.toLowerCase().includes(query)) &&
    (!category || post.category === category) &&
    (!tag || (post.tags || []).includes(tag)) &&
    (!published || post.published === published) &&
    (!featured || String(Boolean(post.featured)) === featured),
  );
}
```

Add the four select elements beside the search field. Implement `populatePostFilters()` to build unique, sorted option values from `posts`, retaining the selected value when it remains available. Call it from `loadPosts()`, and bind each control's `change` handler to `renderPosts()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/post-editor-controls.test.mjs`

Expected: PASS including `article list exposes composable metadata filters`.

- [ ] **Step 5: Commit**

```bash
git add -- admin/public/index.html admin/test/post-editor-controls.test.mjs
git commit -m "feat: filter admin article list by metadata"
```

### Task 2: 将精选开关整合进文章列表

**Files:**
- Modify: `admin/public/index.html:49,188,193,196-201`
- Test: `admin/test/post-editor-controls.test.mjs`

**Interfaces:**
- Consumes: `filteredPosts()`、全局 `posts`、`api()`、`showToast()` 和 `featuredLimit = 6`。
- Produces: `setPostFeatured(slug, featured, input)`，由文章列表内的 checkbox 调用。

- [ ] **Step 1: Write the failing test**

```js
test("article list owns featured management without a separate view", () => {
  assert.match(page, /data-post-featured/);
  assert.match(page, /function setPostFeatured\(/);
  assert.match(page, /const featuredLimit=6/);
  assert.doesNotMatch(page, /id="featured-posts"/);
  assert.doesNotMatch(page, /const featuredNav=/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/post-editor-controls.test.mjs`

Expected: FAIL because the current dedicated view and navigation still exist.

- [ ] **Step 3: Write minimal implementation**

```js
const featuredLimit = 6;

async function setPostFeatured(slug, featured, input) {
  const count = posts.filter((post) => post.featured).length;
  if (featured && count >= featuredLimit) {
    input.checked = false;
    showToast("最多 6 篇精选文章", "请先取消一篇已精选文章。", "error");
    return;
  }
  const post = await api(`/api/posts/${encodeURIComponent(slug)}`);
  await api(`/api/posts/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify({ ...post, featured }),
  });
  await loadPosts();
}
```

Render a `data-post-featured` checkbox on each filtered article row, bind it to `setPostFeatured`, and show a visual “精选” marker for selected entries. Delete the `featured-posts` section, its append operation, `featuredNav`, `loadFeaturedPosts`, and its dedicated list/count DOM references.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/post-editor-controls.test.mjs`

Expected: PASS including `article list owns featured management without a separate view`.

- [ ] **Step 5: Commit**

```bash
git add -- admin/public/index.html admin/test/post-editor-controls.test.mjs
git commit -m "feat: manage featured posts from article list"
```

### Task 3: 完整验证与本机服务更新

**Files:**
- Verify: `admin/public/index.html`
- Verify: `admin/server.mjs`
- Verify: `admin/test/*.test.mjs`

**Interfaces:**
- Consumes: 完成后的文章页筛选与精选开关。
- Produces: 已重启且使用新版页面的本机管理服务。

- [ ] **Step 1: Run the complete admin test suite**

Run: `node --test test/*.test.mjs`

Expected: PASS with zero failed tests.

- [ ] **Step 2: Check service syntax**

Run: `node --check server.mjs`

Expected: exit code 0.

- [ ] **Step 3: Restart the local admin service**

```powershell
$adminServer = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.CommandLine -match 'admin[\\/]server\.mjs' }
if ($adminServer) { Stop-Process -Id $adminServer.ProcessId -Force }
Start-Process -FilePath node -ArgumentList 'admin/server.mjs' `
  -WorkingDirectory 'D:\.PersonalBlog\Mizuki' -WindowStyle Hidden
```

- [ ] **Step 4: Verify the service responds**

Run: `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8787 -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode`

Expected: `200`.
