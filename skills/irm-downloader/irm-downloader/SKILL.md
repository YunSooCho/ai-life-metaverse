---
name: irm-downloader
description: Search and download top-rated JAV titles from イラマチオ研究所 (irm.avlabo.com). Use when user asks to find or download highly-rated irama/deep throat works, check irm.avlabo.com ratings, or download rated 8/9/10 titles. Workflow covers browsing rating pages, extracting product codes (品番) from DMM image URLs, searching sukebei.nyaa.si for torrents with [Reducing Mosaic] preference, and uploading to NAS seedbox via FTP.
---

# IRM Downloader (イラマチオ研究所)

Automated workflow for browsing イラマチオ研究所 ratings, extracting product codes, and downloading via torrent to NAS.

## Workflow

```
0. Load download history (references/downloaded.txt) → skip already downloaded codes
1. Browse irm.avlabo.com rating pages (★10, ★9, ★8)
2. Extract article data (title, date, product code from image URL)
3. Filter by user criteria (date range, rating)
4. Remove already-downloaded codes from the list
5. Search sukebei.nyaa.si for each NEW product code
6. Prioritize [Reducing Mosaic] (uncensored) versions
7. Download .torrent files and upload to NAS seed/ folder
8. Append newly downloaded codes to references/downloaded.txt
```

## Download History (Duplicate Prevention)

**File:** `references/downloaded.txt` (in this skill directory)

**CRITICAL:** Always read this file BEFORE searching torrents. Skip any product codes already listed.

**Format:** One line per downloaded title:
```
PRODUCT-CODE|★RATING|VERSION|YYYY-MM-DD
```

**After successful download, ALWAYS append new entries:**
```bash
echo "NEW-CODE|★10|Reducing Mosaic|2026-02-10" >> /path/to/skill/references/downloaded.txt
```

**Check example:**
```bash
# Read downloaded list
cat references/downloaded.txt | grep -v "^#"

# Check if specific code already downloaded
grep -q "^MISM-423|" references/downloaded.txt && echo "SKIP" || echo "NEW"
```

## Step 1: Browse Rating Pages

Rating pages by score:
- ★10: `https://irm.avlabo.com/archives/x010level_10.php`
- ★9: `https://irm.avlabo.com/archives/x020level_9.php`
- ★8: `https://irm.avlabo.com/archives/x030level_8.php`

Pagination: `?limit=60&offset=60` for page 2, etc.

Use browser to navigate and extract article data via JavaScript:

```bash
browser action=navigate profile=openclaw targetUrl=https://irm.avlabo.com/archives/x010level_10.php
```

### Extract Article List

Use JavaScript evaluation to get article data efficiently:

```javascript
// Extract titles, dates, and image URLs (contains product code)
() => {
  const articles = document.querySelectorAll('article');
  return Array.from(articles).slice(0, 60).map(a => {
    const link = a.querySelector('a');
    const img = a.querySelector('img');
    return {
      text: a.innerText.substring(0, 200),
      href: link ? link.href : '',
      imgSrc: img ? img.src : ''
    };
  });
}
```

### Extract Product Code (品番)

The product code is embedded in the DMM image URL:
- `https://pics.dmm.co.jp/mono/movie/enki091/enki091ps.jpg` → **ENKI-091**
- `https://pics.dmm.co.jp/mono/movie/mism423/mism423ps.jpg` → **MISM-423**
- `https://pics.dmm.co.jp/digital/video/h_1798kirm00065/h_1798kirm00065ps.jpg` → **KIRM-065**

**Extraction rules:**
1. Take the last path segment before the filename (e.g., `enki091`)
2. Split into alphabetic prefix + numeric suffix
3. Format as `PREFIX-NUMBER` with uppercase (e.g., `enki091` → `ENKI-091`)
4. For paths with `h_XXXX` prefix, strip the prefix: `h_1798kirm00065` → `KIRM-065`

If image URL is unavailable, fetch the individual article page and look for the DMM image URL in the content.

### Filter by Date

Articles show date as `2026.01.27` format in innerText. Filter by user's requested date range (e.g., "최근 한 달", "최근 1주일").

## Step 2: Get Detailed Info (Optional)

For individual article details (full review, scores, purchase links):

```bash
web_fetch url=https://irm.avlabo.com/archives/YYYY/MM/DD_HHMMSS.php maxChars=3000
```

Key info from article page:
- 発売日 (release date)
- 配信日 (streaming date)
- イラマチオ総合評価 (overall irama rating)
- 女優名 (actress name)
- Purchase links with product code confirmation

## Step 3: Search Torrents on sukebei.nyaa.si

For each product code, search on sukebei.nyaa.si:

```bash
browser action=navigate profile=openclaw targetUrl=https://sukebei.nyaa.si/?q=PRODUCT-CODE
```

Extract results via JavaScript:

```javascript
() => {
  const rows = document.querySelectorAll('table.torrent-list tbody tr');
  return Array.from(rows).slice(0, 10).map(r => {
    const cols = r.querySelectorAll('td');
    const nameLink = cols[1]?.querySelector('a:last-of-type');
    const dlLink = cols[2]?.querySelector('a[href*="/download/"]');
    return {
      name: nameLink?.textContent?.trim() || '',
      href: dlLink?.href || '',
      size: cols[3]?.textContent?.trim() || '',
      seeders: cols[5]?.textContent?.trim() || ''
    };
  });
}
```

### Version Priority (Uncensored First)

1. **[Reducing Mosaic]** — Always prefer this (uncensored/mosaic reduced)
2. **[FHDC]** — Full HD censored (fallback if no uncensored)
3. **[FHD]** — Full HD (second fallback)
4. **[HD/720p]** — Smaller size option
5. **[H265 1080p]** — Compressed 1080p

**When [Reducing Mosaic] exists:** Select smallest file size among uncensored options.
**When no uncensored:** Select version with most seeders for fastest download.

### Product Code Search Tips

- Some codes need prefix stripped: `2DFE-110` → search `DFE-110`
- If no results, try without the numeric prefix: `1HAWA-371` → `HAWA-371`
- If still no results, try the full title in Japanese

## Step 4: Download Torrents

Download .torrent files using wget:

```bash
wget -q -O /tmp/PRODUCT-CODE.torrent "https://sukebei.nyaa.si/download/TORRENT_ID.torrent"
```

Download multiple files in sequence (not all at once to avoid timeout):

```bash
wget -q -O /tmp/CODE1.torrent "URL1" && \
wget -q -O /tmp/CODE2.torrent "URL2" && \
echo "ALL OK"
```

## Step 5: Upload to NAS

Upload all .torrent files to NAS seed/ folder via FTP:

```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; \
put /tmp/CODE1.torrent -o seed/CODE1.torrent; \
put /tmp/CODE2.torrent -o seed/CODE2.torrent; \
echo DONE"
```

### Verify Upload

```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; cd seed; ls -la" | grep "CODE"
```

Files renamed to `.torrent.added` = Transmission auto-processing started.

## Step 6: Close Browser

Always close browser when done:

```bash
browser action=stop profile=openclaw
```

## Report Format

After completion, report to user with:

| 품번 | 버전 | 용량 | 평가 |
|------|------|------|------|
| CODE | [Reducing Mosaic] / HD/720p / etc. | X.X GB | ★10 |

Include total count, uncensored count, and total download size.

## Useful URLs

- **홈**: https://irm.avlabo.com/
- **★10**: https://irm.avlabo.com/archives/x010level_10.php
- **★9**: https://irm.avlabo.com/archives/x020level_9.php
- **★8**: https://irm.avlabo.com/archives/x030level_8.php
- **발매일순**: https://irm.avlabo.com/releasedate.php
- **월간랭킹**: https://irm.avlabo.com/ranking/month/
- **여배우별**: https://irm.avlabo.com/actress/
