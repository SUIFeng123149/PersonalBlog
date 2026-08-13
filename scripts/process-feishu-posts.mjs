// Node.js script to process FeiShu articles and place them correctly in the blog
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const feishuDir = path.resolve(__dirname, '../src/FeiShu');
const postsDir = path.resolve(__dirname, '../src/content/posts');
const tempDir = path.resolve(process.env.TEMP || '/tmp', 'feishu_extract');

// ---- Alibaba Cloud OSS (blog media storage) ----
function loadOssEnv() {
  const envText = readFileSync(path.resolve(__dirname, '../.env.admin'), 'utf8');
  const env = {};
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !m[2].startsWith('#')) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

function getOssClient() {
  const env = loadOssEnv();
  if (!env.OSS_BUCKET || !env.OSS_ACCESS_KEY_ID || !env.OSS_ACCESS_KEY_SECRET) {
    console.warn('  WARN: OSS 未配置（.env.admin），图片将保留为本地 _assets 目录');
    return null;
  }
  const OSS = require('ali-oss');
  return new OSS({
    region: env.OSS_REGION || 'oss-cn-beijing',
    bucket: env.OSS_BUCKET,
    accessKeyId: env.OSS_ACCESS_KEY_ID,
    accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
  });
}

const ossClient = getOssClient();

async function uploadImageToOss(assetsRelativePath, srcPath) {
  if (!ossClient) return null;
  const env = loadOssEnv();
  const baseUrl = `https://${env.OSS_BUCKET}.${env.OSS_REGION || 'oss-cn-beijing'}.aliyuncs.com`;
  const data = fs.readFileSync(srcPath);
  const ext = path.extname(srcPath).toLowerCase();
  const contentType = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }[ext] || 'application/octet-stream';
  await ossClient.put(assetsRelativePath, data, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
  return `${baseUrl}/${assetsRelativePath}`;
}

// Clean temp
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });

// Helper: determine category from filename
function getCategory(name) {
  // Check for "X篇" pattern
  const match = name.match(/^(.+?)篇/);
  if (match) {
    const prefix = match[1];
    const map = {
      'Agent': 'AI Agent',
      'AutoGen': 'AutoGen',
      'Coze': 'Coze',
      'DeepSeek': 'DeepSeek',
      'Deepseek': 'DeepSeek',
      'Dify': 'Dify',
      'LangChain': 'LangChain',
      'LangGraph': 'LangGraph',
      'MCP': 'MCP',
      'OpenAI': 'OpenAI',
      'Prompt': 'Prompt Engineering',
      'RAG': 'RAG',
      '微调': 'Fine-tuning',
      '大模型': 'LLM Introduction',
      '面试': 'Interview',
    };
    if (map[prefix]) return map[prefix];
  }
  
  if (/大模型介绍|大模型开发/.test(name)) return 'LLM Introduction';
  if (name.includes('LLM') && !name.includes('LangChain') && !name.includes('LangGraph')) return 'AI Agent';
  if (/^(智能体|人人都在学|从0到1|从零开始|AI智能体)/.test(name)) return 'AI Agent';
  if (/^智能客服/.test(name)) return 'Dify';
  if (/^RAG/.test(name)) return 'RAG';
  if (/^面试/.test(name)) return 'Interview';
  if (/^微调/.test(name)) return 'Fine-tuning';
  if (/Lagent/.test(name)) return 'Multi-Agent';
  
  return '';
}

// Helper: get tags from name
function getTags(category, name) {
  const tags = new Set();
  if (category) tags.add(category);
  
  if (/Agent|智能体/.test(name)) tags.add('AI Agent');
  if (/Coze/.test(name)) tags.add('Coze');
  if (/DeepSeek|Deepseek/.test(name)) tags.add('DeepSeek');
  if (/Dify/.test(name)) tags.add('Dify');
  if (/LangChain/.test(name)) tags.add('LangChain');
  if (/LangGraph/.test(name)) tags.add('LangGraph');
  if (/MCP/.test(name)) tags.add('MCP');
  if (/OpenAI/.test(name)) tags.add('OpenAI');
  if (/Prompt/.test(name)) tags.add('Prompt');
  if (/RAG/.test(name)) tags.add('RAG');
  if (/AutoGen|Multi-Agent|Lagent/.test(name)) tags.add('Multi-Agent');
  if (/LLM|大模型/.test(name)) tags.add('LLM');
  
  if (tags.size === 0) tags.add('AI');
  return [...tags];
}

// Helper: sanitize filename
function sanitize(name) {
  return name
    .replace(/\s+$/g, '')
    .replace(/[？！!！,，？]/g, '')
    .trim();
}

// Helper: generate frontmatter
function frontmatter(title, category, tags) {
  const tagsStr = tags.length > 0 
    ? '[' + tags.map(t => `'${t}'`).join(', ') + ']'
    : '[]';
  return `---
title: ${title}
published: 2026-07-29
description: ''
image: ''
tags: ${tagsStr}
category: '${category}'
draft: false
lang: zh-CN
---
`;
}

// Helper: extract zip on Windows
function extractZip(zipPath, destDir) {
  execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, {
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 30000,
  });
}

// Helper: find .md files recursively
function findMdFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findMdFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

let mdCount = 0;
let zipCount = 0;
let successCount = 0;
let errorCount = 0;

// ===== PHASE 1: Process standalone .md files =====
console.log('===== Phase 1: Processing standalone .md files =====');
const mdFiles = fs.readdirSync(feishuDir).filter(f => f.endsWith('.md'));
for (const file of mdFiles) {
  const baseName = path.basename(file, '.md');
  const finalName = sanitize(baseName);
  const outputPath = path.join(postsDir, `${finalName}.md`);
  
  if (fs.existsSync(outputPath)) {
    console.log(`  SKIP (already exists): ${finalName}`);
    continue;
  }
  
  const content = fs.readFileSync(path.join(feishuDir, file), 'utf8');
  const category = getCategory(finalName);
  const tags = getTags(category, finalName);
  const fm = frontmatter(finalName, category, tags);
  
  fs.writeFileSync(outputPath, fm + content, 'utf8');
  mdCount++;
  console.log(`  OK: ${finalName} (category: ${category})`);
}
console.log(`Processed ${mdCount} standalone .md files`);

// ===== PHASE 2: Process .zip files =====
console.log('\n===== Phase 2: Processing .zip files =====');
const zipFiles = fs.readdirSync(feishuDir).filter(f => f.endsWith('.zip'));
for (const file of zipFiles) {
  const baseName = path.basename(file, '.zip');
  const finalName = sanitize(baseName);
  zipCount++;
  console.log(`  [${zipCount}] Processing: ${finalName}`);
  
  const outputPath = path.join(postsDir, `${finalName}.md`);
  if (fs.existsSync(outputPath)) {
    console.log('    SKIP (already exists)');
    continue;
  }
  
  const extractDir = path.join(tempDir, finalName);
  try {
    extractZip(path.join(feishuDir, file), extractDir);
  } catch (e) {
    console.log(`    ERROR extracting: ${e.message}`);
    errorCount++;
    continue;
  }
  
  // Find the markdown file
  const extractedMds = findMdFiles(extractDir);
  if (extractedMds.length === 0) {
    console.log('    ERROR: No markdown file found in zip');
    errorCount++;
    continue;
  }
  
  const mdFilePath = extractedMds[0];
  let content = fs.readFileSync(mdFilePath, 'utf8');
  
  // Process images if images folder exists
  const imagesDir = path.join(extractDir, 'images');
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir).filter(f => {
      const fullPath = path.join(imagesDir, f);
      return fs.statSync(fullPath).isFile();
    });

    let useOss = ossClient !== null;
    let imageMap = {};
    if (useOss) {
      // 上传到 OSS：post-assets/{finalName}_assets/{img}，引用改为 OSS 绝对 URL
      for (const img of imageFiles) {
        const key = `post-assets/${finalName}_assets/${img}`;
        const url = await uploadImageToOss(key, path.join(imagesDir, img));
        if (url) imageMap[img] = url;
        else { useOss = false; break; }
      }
    }

    if (useOss) {
      // 用每个文件名替换引用
      for (const img of imageFiles) {
        content = content.split(`images/${img}`).join(imageMap[img]);
        content = content.split(`images%2F${img}`).join(encodeURI(imageMap[img]));
      }
      console.log(`    Images: ${imageFiles.length} files uploaded to OSS (${finalName}_assets)`);
    } else {
      const assetsDir = path.join(postsDir, `${finalName}_assets`);
      fs.mkdirSync(assetsDir, { recursive: true });
      for (const img of imageFiles) {
        fs.copyFileSync(path.join(imagesDir, img), path.join(assetsDir, img));
      }
      // Update image references in markdown
      // Pattern: ![](<images/filename>) and ![](images/filename) and ![alt](<images/filename>) and ![alt](images/filename)
      content = content.replace(/!\[([^\]]*)\]\(<images\/([^>]+)>\)/g, `![$1](./${finalName}_assets/$2)`);
      content = content.replace(/!\[([^\]]*)\]\(images\/([^)]+)\)/g, `![$1](./${finalName}_assets/$2)`);
      content = content.replace(/!\[\]\(<images\/([^>]+)>\)/g, `![](./${finalName}_assets/$1)`);
      content = content.replace(/!\[\]\(images\/([^)]+)\)/g, `![](./${finalName}_assets/$1)`);
      console.log(`    Images: ${imageFiles.length} files moved to ${finalName}_assets`);
    }
  }
  
  const category = getCategory(finalName);
  const tags = getTags(category, finalName);
  const fm = frontmatter(finalName, category, tags);
  
  fs.writeFileSync(outputPath, fm + content, 'utf8');
  successCount++;
  console.log(`    OK: ${finalName}.md (category: ${category}, tags: ${tags.join(', ')})`);
}

console.log('\n===== SUMMARY =====');
console.log(`Standalone .md files processed: ${mdCount}`);
console.log(`Zip files processed: ${zipCount}`);
console.log(`Successful: ${successCount}`);
console.log(`Errors: ${errorCount}`);
console.log('Done!');
