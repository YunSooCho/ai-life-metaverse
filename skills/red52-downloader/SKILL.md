---
name: red52-downloader
description: Download BJ images from red52.kr. Use when you need to search for BJ content from red52.kr, download images from BJ posts, or extract image URLs. Supports keyword search and downloads protected images using Referer headers.
---

# red52.kr Image Downloader

This skill enables downloading BJ images and content from red52.kr (빨간오이).

## ⚠️ CRITICAL: Search URL Bug

### Correct Search Format
```
https://red52.kr/index.php?_filter=search&mid=eunkkol&search_target=title_content&search_keyword="[KEYWORD]"
```

### ❌ Wrong Format (Produces Incorrect Results)
```
https://red52.kr/index.php?mid=eunkkol&search_keyword="[KEYWORD]"
```

**Always include**: `_filter=search&search_target=title_content` in search URLs.

## Quick Start

### Basic Download (Current Page Images)

1. **Open red52.kr**: Use browser tool with openclaw profile
   ```
   browser.open profile=openclaw targetUrl=https://red52.kr
   ```

2. **Navigate to post**: Go to desired post URL
   ```
   browser.navigate targetUrl=https://red52.kr/eunkkol/[POST_ID]
   ```

3. **Extract image URL**:
   ```
   browser.act kind=evaluate targetId=[TAB_ID] ref="fn=document.querySelector('article img[src*="cdn.red52.kr"]')?.src"
   ```

4. **Download image**: Use curl with Referer header (critical)
   ```
   curl -L -A "Mozilla/5.0" -e "https://red52.kr/eunkkol/[POST_ID]" -o /output/image.jpg "[IMAGE_URL]"
   ```

### Search and Download

1. **Search by keyword**:
   - Direct URL method (correct format):
     ```
     browser.navigate targetUrl=https://red52.kr/index.php?_filter=search&mid=eunkkol&search_target=title_content&search_keyword="[KEYWORD]"
     ```
   - Or use search UI: Click search button at bottom → Type keyword → Press Enter

   ⚠️ **IMPORTANT**: The `_filter=search&search_target=title_content` parameters are required for accurate search results. Without these, results will be incorrect.

2. **Get search results**: Snapshot shows list of posts with IDs

3. **Download thumbnails from search results**:
   - Extract thumbnail URLs:
     ```
     browser.act kind=evaluate targetId=[TAB_ID] ref="fn=Array.from(document.querySelectorAll('article img[src*=\"cdn.red52.kr\"]')).map(img => img.src)"
     ```
   - Download with search page Referer:
     ```
     curl -L -A "Mozilla/5.0" -e "https://red52.kr/index.php?_filter=search&mid=eunkkol&search_target=title_content&search_keyword=[KEYWORD]" -o /output/thumb.jpg "[THUMB_URL]"
     ```

4. **Click on post** to view full content

5. **Download images**: Follow basic download steps above

## Key Requirements

### Browser Settings
- **Profile**: Use `openclaw` profile
- **Target ID**: Always capture and reuse targetId for same tab

### Image Download Pattern

**Critical**: red52.kr blocks direct downloads without Referer header.

**Download command format**:
```bash
curl -L \
  -A "Mozilla/5.0" \
  -e "https://red52.kr/eunkkol/[POST_ID]" \
  -o /output/path/image.jpg \
  "[IMAGE_URL]"
```

**Multiple images**: Extract all image URLs first
```
browser.act kind=evaluate targetId=[TAB_ID] ref="fn=Array.from(document.querySelectorAll('img[src*=\"cdn.red52.kr\"]')).map(img => img.src)"
```

### Image URL Patterns

Images on red52.kr follow this pattern:
- Thumbnail: `https://cdn.red52.kr/play/[YYYYMMDD]/[UUID].jpg`
- Direct download works when Referer is set correctly

## Navigation

### Main Sections
- 은꼴 짤방: `https://red52.kr/eunkkol`
- 성인 야짤: `https://red52.kr/nsfw`
- 한국 야동: `https://red52.kr/MIB/`
- 익명 질문: `https://red52.kr/secret`

### Categories within 은꼴 짤방
- BJ: `https://red52.kr/index.php?mid=eunkkol&category=1298230`
- SNS: `https://red52.kr/index.php?mid=eunkkol&category=1298231`
- AV: `https://red52.kr/index.php?mid=eunkkol&category=1309115`

## URL Encoding for Search

Korean search keywords must be URL-encoded:
- Use `browser.navigate` for direct search (handles encoding automatically)
- Or manually encode: `ㅇㅎ디` → `%E3%85%87%E3%85%8E%EB%94%94`

### Correct Search URL Format
```
https://red52.kr/index.php?_filter=search&mid=eunkkol&search_target=title_content&search_keyword=%E3%85%87%E3%85%8E%EB%94%94
```

### ❌ Wrong Format (causes incorrect results)
```
https://red52.kr/index.php?mid=eunkkol&search_keyword=%E3%85%87%E3%85%8E%EB%94%94
```

**Always include**: `_filter=search&search_target=title_content`

## Video Limitations

⚠️ **Videos cannot be directly downloaded** from red52.kr:
- Videos use blob URLs (`blob:https://red52.kr/...`), browser-internal only
- Original video URLs (.mp4) are DRM-protected and not exposed
- Workaround: Use screen recording or browser extension

Only images (.jpg thumbnails are fully downloadable).

## Best Practices

### Always Include Referer
Without Referer header, downloads fail with 403 Forbidden:
- Set `-e "https://red52.kr/eunkkol/[POST_ID]"`
- Also include User-Agent `-A "Mozilla/5.0"`

### Reuse Browser Sessions
Don't open multiple browser instances unnecessarily:
- Reuse same targetId for consecutive operations
- Stop browser when done: `browser.stop`

### Search Workflow
1. Start from section page (eunkkol, nsfw, etc.)
2. Use direct URL search for efficiency
3. Snapshot to see results
4. Click first post or navigate by ID
5. Extract and download images

## Common Commands Reference

### Browser Operations
```bash
# Open site
browser.open profile=openclaw targetUrl=https://red52.kr/eunkkol

# Search by keyword (correct format)
browser.navigate targetId=[TAB_ID] targetUrl=https://red52.kr/index.php?_filter=search&mid=eunkkol&search_target=title_content&search_keyword="[KEYWORD]"

# Navigate to post
browser.navigate targetId=[TAB_ID] targetUrl=https://red52.kr/eunkkol/1569733

# Snap current view
browser.snapshot targetId=[TAB_ID]

# Extract first image URL
browser.act ref="fn=document.querySelector('article img[src*=\"cdn.red52.kr\"]')?.src"

# Extract all image URLs
browser.act ref="fn=Array.from(document.querySelectorAll('img[src*=\"cdn.red52.kr\"]')).map(img => img.src)"

# Stop browser (always do this when done)
browser.stop
```

### Download Operations
```bash
# Single image
curl -L -A "Mozilla/5.0" -e "https://red52.kr/eunkkol/1569733" -o /tmp/img1.jpg "https://cdn.red52.kr/play/20260206/780371ce-8db4-4c64-a191-11e708bdfa7d.jpg"

# Multiple images (bash loop)
for url in "${URL_ARRAY[@]}"; do
  curl -L -A "Mozilla/5.0" -e "https://red52.kr/eunkkol/1569733" -o "/tmp/img_$(date +%s).jpg" "$url"
done
```

## Troubleshooting

### 403 Forbidden Error
**Cause**: Missing Referer header
**Fix**: Always include `-e "https://red52.kr/eunkkol/[POST_ID]"` in curl command

### blank image URLs
**Cause**: Using wrong selector or iframe content
**Fix**: Use selector `img[src*="cdn.red52.kr"]` to match CDN images only

### Search shows no results
**Cause**: Keyword not found, wrong section
**Fix**: Try different section (eunkkol, nsfw, MIB) or refine search term