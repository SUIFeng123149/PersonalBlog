# PowerShell script to process FeiShu articles and place them correctly in the blog

$feishuDir = "D:\.PersonalBlog\Mizuki\src\FeiShu"
$postsDir = "D:\.PersonalBlog\Mizuki\src\content\posts"
$tempDir = "$env:TEMP\feishu_extract"

# Clean temp directory
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Helper function to determine category from filename
function Get-CategoryFromName {
    param([string]$name)
    
    # Use regex matching instead of switch-wildcard
    if ($name -match '^Agent.篇') { return 'AI Agent' }
    if ($name -match '^AutoGen.篇') { return 'AutoGen' }
    if ($name -match '^Coze.篇') { return 'Coze' }
    if ($name -match '^DeepSeek.篇') { return 'DeepSeek' }
    if ($name -match '^Deepseek.篇') { return 'DeepSeek' }
    if ($name -match '^Dify.篇') { return 'Dify' }
    if ($name -match '^LangChain.篇') { return 'LangChain' }
    if ($name -match '^LangGraph.篇') { return 'LangGraph' }
    if ($name -match '^MCP.篇') { return 'MCP' }
    if ($name -match '^OpenAI.篇') { return 'OpenAI' }
    if ($name -match '^Prompt.篇') { return 'Prompt Engineering' }
    if ($name -match '^RAG.篇') { return 'RAG' }
    if ($name -match '^\u5FAE\u8C03.篇') { return 'Fine-tuning' }   # 微调
    if ($name -match '^\u5927\u6A21\u578B.篇') { return 'LLM Introduction' }  # 大模型
    if ($name -match '^\u9762\u8BD5.篇') { return 'Interview' }  # 面试
    
    if ($name -match '\u5927\u6A21\u578B\u4ECB\u7ECD|\u5927\u6A21\u578B\u5F00\u53D1') { return 'LLM Introduction' }
    if ($name -match '\u667A\u80FD\u5BA2\u670D\u642D\u5EFA\u5B9E\u6218') { return 'Dify' }
    if ($name -match '^LLM') { return 'AI Agent' }
    if ($name -match '^(\u667A\u80FD\u4F53|人人都在学|从0到1|从零开始|AI\u667A\u80FD\u4F53)') { return 'AI Agent' }
    if ($name -match '^\u667A\u80FD\u5BA2\u670D') { return 'Dify' }
    if ($name -match '^RAG') { return 'RAG' }
    if ($name -match '^\u9762\u8BD5') { return 'Interview' }
    if ($name -match '^\u5FAE\u8C03') { return 'Fine-tuning' }
    if ($name -match 'Lagent') { return 'Multi-Agent' }
    
    return ''
}

# Helper function to get tags from category and name
function Get-Tags {
    param([string]$category, [string]$name)
    
    $tags = @()
    
    if ($category -ne '') { $tags += $category }
    
    if ($name -match 'Agent|\u667A\u80FD\u4F53') { $tags += 'AI Agent' }
    if ($name -match 'Coze') { $tags += 'Coze' }
    if ($name -match 'DeepSeek|Deepseek') { $tags += 'DeepSeek' }
    if ($name -match 'Dify') { $tags += 'Dify' }
    if ($name -match 'LangChain') { $tags += 'LangChain' }
    if ($name -match 'LangGraph') { $tags += 'LangGraph' }
    if ($name -match 'MCP') { $tags += 'MCP' }
    if ($name -match 'OpenAI') { $tags += 'OpenAI' }
    if ($name -match 'Prompt') { $tags += 'Prompt' }
    if ($name -match 'RAG') { $tags += 'RAG' }
    if ($name -match 'AutoGen|Multi-Agent|Lagent') { $tags += 'Multi-Agent' }
    if ($name -match 'LLM|\u5927\u6A21\u578B') { $tags += 'LLM' }
    
    # Remove duplicates
    $tags = $tags | Select-Object -Unique
    
    if ($tags.Count -eq 0) { $tags += 'AI' }
    
    return $tags
}

# Helper function to sanitize filename (remove problematic chars)
function Get-SanitizedName {
    param([string]$name)
    $name = $name -replace '\s+$', ''
    $name = $name -replace '[\uFF1F!\uFF01,\uFF0C]', ''
    return $name.Trim()
}

# Helper function to write UTF-8 with BOM for PowerShell 5 compat
function Write-Utf8WithBom {
    param([string]$path, [string]$content)
    $utf8WithBom = New-Object System.Text.UTF8Encoding $true
    [System.IO.File]::WriteAllText($path, $content, $utf8WithBom)
}

# Helper function to generate frontmatter
function Get-Frontmatter {
    param([string]$title, [string]$category, [array]$tags)
    
    $tagsStr = if ($tags.Count -gt 0) { 
        "[" + (($tags | ForEach-Object { "'" + $_ + "'" }) -join ', ') + "]"
    } else { "[]" }
    
    return @"
---
title: $title
published: 2026-07-29
description: ''
image: ''
tags: $tagsStr
category: '$category'
draft: false
lang: zh-CN
---

"@
}

$global:mdCount = 0
$global:zipCount = 0
$global:successCount = 0
$global:errorCount = 0

# ===== PHASE 1: Process standalone .md files directly in FeiShu =====
Write-Output "===== Phase 1: Processing standalone .md files ====="
Get-ChildItem "$feishuDir\*.md" | ForEach-Object {
    $mdFile = $_
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
    $sanitizedName = Get-SanitizedName -name $baseName
    
    $outputPath = Join-Path $postsDir "${sanitizedName}.md"
    if (Test-Path $outputPath) {
        Write-Output "  SKIP (already exists): $sanitizedName"
        return
    }
    
    $content = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
    
    $category = Get-CategoryFromName -name $sanitizedName
    $tags = Get-Tags -category $category -name $sanitizedName
    
    $frontmatter = Get-Frontmatter -title $sanitizedName -category $category -tags $tags
    
    Write-Utf8WithBom -path $outputPath -content ($frontmatter + $content)
    
    $global:mdCount++
    Write-Output "  OK: $sanitizedName (category: $category)"
}

Write-Output "Processed $mdCount standalone .md files"

# ===== PHASE 2: Process .zip files =====
Write-Output "`n===== Phase 2: Processing .zip files ====="
Get-ChildItem "$feishuDir\*.zip" | ForEach-Object {
    $zipFile = $_
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($zipFile.Name)
    $sanitizedName = Get-SanitizedName -name $baseName
    
    $global:zipCount++
    Write-Output "  [$($global:zipCount)] Processing: $sanitizedName"
    
    $outputPath = Join-Path $postsDir "${sanitizedName}.md"
    if (Test-Path $outputPath) {
        Write-Output "    SKIP (already exists)"
        return
    }
    
    $extractDir = Join-Path $tempDir $sanitizedName
    try {
        Expand-Archive -Path $zipFile.FullName -DestinationPath $extractDir -Force
    } catch {
        Write-Output "    ERROR extracting: $_"
        $global:errorCount++
        return
    }
    
    $mdFile = Get-ChildItem "$extractDir\*.md" -File | Select-Object -First 1
    if (-not $mdFile) {
        Write-Output "    ERROR: No markdown file found in zip"
        $global:errorCount++
        return
    }
    
    $content = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
    
    # Process images if images folder exists
    $imagesDir = Join-Path $extractDir "images"
    if (Test-Path $imagesDir) {
        $assetsDir = Join-Path $postsDir "${sanitizedName}_assets"
        New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null
        
        $imageFiles = Get-ChildItem $imagesDir -File
        foreach ($img in $imageFiles) {
            Copy-Item $img.FullName -Destination (Join-Path $assetsDir $img.Name) -Force
        }
        
        # Update image references in markdown - multiple patterns
        # Pattern: ![](<images/filename>) and ![](images/filename) and ![alt](<images/filename>) and ![alt](images/filename)
        $content = $content -replace '!\[([^\]]*)\]\(<images/([^>]+)>\)', "![`$1](./${sanitizedName}_assets/`$2)"
        $content = $content -replace '!\[([^\]]*)\]\(images/([^)]+)\)', "![`$1](./${sanitizedName}_assets/`$2)"
        # Also handle empty alt
        $content = $content -replace '!\[\]\(<images/([^>]+)>\)', "![](./${sanitizedName}_assets/`$1)"
        $content = $content -replace '!\[\]\(images/([^)]+)\)', "![](./${sanitizedName}_assets/`$1)"
        
        Write-Output "    Images: $($imageFiles.Count) files moved to ${sanitizedName}_assets"
    }
    
    $category = Get-CategoryFromName -name $sanitizedName
    $tags = Get-Tags -category $category -name $sanitizedName
    
    $frontmatter = Get-Frontmatter -title $sanitizedName -category $category -tags $tags
    
    Write-Utf8WithBom -path $outputPath -content ($frontmatter + $content)
    
    $global:successCount++
    Write-Output "    OK: ${sanitizedName}.md (category: $category, tags: $($tags -join ', '))"
}

Write-Output "`n===== SUMMARY ====="
Write-Output "Standalone .md files processed: $mdCount"
Write-Output "Zip files processed: $zipCount"
Write-Output "Successful: $successCount"
Write-Output "Errors: $errorCount"
Write-Output "Done!"
