# 首页内容分区 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four homepage content-section entry cards and filtered, paginated section pages while retaining the current blog list experience.

**Architecture:** A pure content-section module owns section metadata and category-to-section classification. The homepage derives entry-card counts from that module, while a dynamic Astro route filters the existing sorted posts and feeds them to the existing `PostPage` and `Pagination` components. `Pagination` gains an optional base path so section pages generate local numbered links rather than homepage links.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS, Astro content collections, Vitest.

## Global Constraints

- Keep all current post frontmatter, post URLs, archive filtering, tags, and homepage article stream unchanged.
- The visible sections are exactly: 技术资料, 个人随笔, 游戏记录, 其他.
- “其他” must include every post not matched by the other three section mappings, including empty categories.
- Reuse `MainGridLayout`, `PostPage`, and existing CSS variables; support light/dark themes and mobile layouts.
- Use English route slugs: `technical`, `notes`, `games`, `other`.

---

### Task 1: Establish and test the section-classification contract

**Files:**
- Create: `src/utils/content-sections.ts`
- Create: `tests/content-sections.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `ContentSectionSlug = "technical" | "notes" | "games" | "other"`.
- Produces `CONTENT_SECTIONS`, whose items expose `slug`, `title`, `description`, and `icon`.
- Produces `getContentSection(category: string | null | undefined): ContentSectionSlug` and `getPostsForContentSection<T extends { data: { category?: string | null } }>(posts: T[], section: ContentSectionSlug): T[]`.
- Consumed by the homepage card component and section route in later tasks.

- [ ] **Step 1: Add the Vitest command and configuration**

Add `"test": "vitest run"` to `package.json` scripts and add `vitest` under `devDependencies`. Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Write the failing classification test**

Create `tests/content-sections.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test tests/content-sections.test.ts`

Expected: FAIL because `src/utils/content-sections.ts` does not exist.

- [ ] **Step 4: Implement the minimal classification module**

Create `src/utils/content-sections.ts` with the four-section metadata and explicit sets. Include every current technical category: `AI Agent`, `AutoGen`, `BigData`, `Coze`, `DeepSeek`, `Dify`, `Fine-tuning`, `Interview`, `JavaSE`, `LangChain`, `LangGraph`, `LLM Introduction`, `MCP`, `Multi-Agent`, `MySQL`, `OpenAI`, `Prompt Engineering`, `RAG`, and `Web`. Put `随笔`, `日记`, `生活`, `思考` in the notes set, and `游戏`, `游戏记录`, `游戏攻略` in the games set.

```ts
export type ContentSectionSlug = "technical" | "notes" | "games" | "other";

export function getContentSection(category: string | null | undefined): ContentSectionSlug {
  const normalized = category?.trim() ?? "";
  if (TECHNICAL_CATEGORIES.has(normalized)) return "technical";
  if (NOTES_CATEGORIES.has(normalized)) return "notes";
  if (GAMES_CATEGORIES.has(normalized)) return "games";
  return "other";
}

export function getPostsForContentSection<T extends { data: { category?: string | null } }>(
  posts: T[], section: ContentSectionSlug,
): T[] {
  return posts.filter((post) => getContentSection(post.data.category) === section);
}
```

- [ ] **Step 5: Run the focused test to verify it passes**

Run: `pnpm test tests/content-sections.test.ts`

Expected: PASS with four passing tests.

- [ ] **Step 6: Commit the classification contract**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tests/content-sections.test.ts src/utils/content-sections.ts
git commit -m "feat: add content section classification"
```

### Task 2: Add reusable homepage section cards

**Files:**
- Create: `src/components/ContentSectionCards.astro`
- Modify: `src/pages/[...page].astro`

**Interfaces:**
- Consumes `CONTENT_SECTIONS` and `getPostsForContentSection` from `src/utils/content-sections.ts`.
- Accepts `posts: CollectionEntry<"posts">[]` in `ContentSectionCards.astro`.
- Produces four semantic links to `/category/{slug}/` with title, description, icon, count, and keyboard-visible focus state.

- [ ] **Step 1: Write a failing component-render test**

Extend `tests/content-sections.test.ts` with a file-level source assertion that makes the visual contract explicit:

```ts
import { readFile } from "node:fs/promises";

it("renders all four homepage section links", async () => {
  const component = await readFile("src/components/ContentSectionCards.astro", "utf8");
  expect(component).toContain('href={url(`/category/${section.slug}/`)}');
  expect(component).toContain("CONTENT_SECTIONS");
  expect(component).toContain("getPostsForContentSection");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/content-sections.test.ts`

Expected: FAIL with `ENOENT` for `ContentSectionCards.astro`.

- [ ] **Step 3: Implement the cards and mount them only on page one**

Create `ContentSectionCards.astro`. Render a `section` with heading `浏览内容`, a one-column mobile and two-column desktop card grid, and one `<a>` per `CONTENT_SECTIONS` item. Use `url(`/category/${section.slug}/`)`, `Icon` from `astro-icon/components`, `getPostsForContentSection(posts, section.slug).length`, and existing `card-base`, `btn-card`, `var(--primary)`, and `var(--text-*)` styles.

In `src/pages/[...page].astro`, import the component and insert it before `<PostPage>`, guarded by `page.currentPage === 1`:

```astro
{page.currentPage === 1 && <ContentSectionCards posts={allBlogPosts}></ContentSectionCards>}
```

Move `const allBlogPosts = await getSortedPosts();` to module scope so both `getStaticPaths` and page rendering use the same data.

- [ ] **Step 4: Run the component and classification tests to verify they pass**

Run: `pnpm test tests/content-sections.test.ts`

Expected: PASS with the classification and component-render assertions passing.

- [ ] **Step 5: Commit homepage section cards**

```bash
git add src/components/ContentSectionCards.astro src/pages/[...page].astro tests/content-sections.test.ts
git commit -m "feat: add homepage content section cards"
```

### Task 3: Create filtered, paginated section pages

**Files:**
- Create: `src/pages/category/[section]/[...page].astro`
- Modify: `src/components/control/Pagination.astro`
- Modify: `tests/content-sections.test.ts`

**Interfaces:**
- Consumes `getSortedPosts`, `CONTENT_SECTIONS`, `getPostsForContentSection`, `PostPage`, and `MainGridLayout`.
- Adds optional `basePath?: string` to `Pagination` props.
- Produces static pages for each section at `/category/{slug}/`, with continuation pages at `/category/{slug}/2/` and onward.

- [ ] **Step 1: Write failing assertions for the route and local pagination**

Add to `tests/content-sections.test.ts`:

```ts
it("defines a section route that filters posts before pagination", async () => {
  const route = await readFile("src/pages/category/[section]/[...page].astro", "utf8");
  expect(route).toContain("getPostsForContentSection(allBlogPosts, section)");
  expect(route).toContain("paginate(sectionPosts");
  expect(route).toContain('basePath={`/category/${section}/`}');
});

it("builds numbered pagination links within an optional base path", async () => {
  const pagination = await readFile("src/components/control/Pagination.astro", "utf8");
  expect(pagination).toContain("basePath?: string");
  expect(pagination).toContain("`${basePath}${p}/`");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/content-sections.test.ts`

Expected: FAIL with `ENOENT` for the section route.

- [ ] **Step 3: Implement the static section route**

Create `src/pages/category/[section]/[...page].astro`. Its `getStaticPaths` must iterate `CONTENT_SECTIONS`, call `getPostsForContentSection(await getSortedPosts(), section.slug)`, and return `paginate(sectionPosts, { params: { section: section.slug }, pageSize: PAGE_SIZE })`. Read the current section from `Astro.params.section`, retrieve its metadata, and render `MainGridLayout` with a section-specific title. Inside it, render an accessible title/description panel, `<PostPage page={page}>`, a zero-post message linking to `/`, and `<Pagination page={page} basePath={`/category/${section}/`}>` when there are posts.

- [ ] **Step 4: Update Pagination without changing homepage URLs**

Add `basePath?: string` to `Pagination.astro` props. Replace `getPageUrl` with:

```ts
const getPageUrl = (p: number) => {
  if (!basePath) return p === 1 ? "/" : `/${p}/`;
  return p === 1 ? basePath : `${basePath}${p}/`;
};
```

Keep the existing `page.url.prev` and `page.url.next` links unchanged because Astro supplies them per route.

- [ ] **Step 5: Run tests and type validation to verify the route passes**

Run: `pnpm test tests/content-sections.test.ts && pnpm astro check`

Expected: Tests PASS and Astro check exits successfully.

- [ ] **Step 6: Commit section pages and pagination support**

```bash
git add src/pages/category/[section]/[...page].astro src/components/control/Pagination.astro tests/content-sections.test.ts
git commit -m "feat: add filtered content section pages"
```

### Task 4: Build and inspect generated section output

**Files:**
- Verify only; do not change files unless a command reports an issue.

**Interfaces:**
- Verifies the routes and cards produced by Tasks 1–3.

- [ ] **Step 1: Run the full automated suite**

Run: `pnpm test && pnpm astro check && pnpm build`

Expected: all tests pass, Astro check succeeds, and build creates `dist/category/technical/index.html`, `dist/category/notes/index.html`, `dist/category/games/index.html`, and `dist/category/other/index.html`.

- [ ] **Step 2: Inspect generated route output**

Run: `rg -n "技术资料|个人随笔|游戏记录|其他" dist/index.html dist/category/technical/index.html dist/category/other/index.html`

Expected: homepage contains all four entry labels; each inspected section page contains its title.

- [ ] **Step 3: Inspect mobile-responsive and focus styles**

Run: `rg -n "grid-cols-1|md:grid-cols-2|focus-visible" src/components/ContentSectionCards.astro`

Expected: output includes a single-column mobile class, two-column desktop class, and a visible keyboard-focus class.

- [ ] **Step 4: Confirm no uncommitted verification changes remain**

Run: `git status --short`

Expected: no output. If a prior task required a correction, it must already have been covered by that task’s focused test and commit before this final verification step.
