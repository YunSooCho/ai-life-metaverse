---
name: nas-seedbox
description: Complete torrent search-to-seedbox workflow for sukebei.nyaa.si. Use when user needs to search for JAV torrents with uncensored preference, download torrent files, and upload to NAS seedbox via FTP. Covers browser automation, results filtering prioritizing [Reducing Mosaic] tags, wget downloads, and lftp FTP uploads to jiyuNas 10.76.29.5 seed folder.
---

# NAS Seedbox

Automated workflow for searching JAV torrents on sukebei.nyaa.si and uploading to NAS seedbox.

## Workflow Decision Tree

```
User Request
    ↓
Step 1: Search sukebei.nyaa.si
    ↓
Step 2: Analyze results → Look for [Reducing Mosaic] tag
    ↓
Step 3: Download preferred .torrent file
    ↓
Step 4: Upload to NAS via FTP (seed/ folder)
    ↓
Complete
```

## Step 1: Search sukebei.nyaa.si

Use browser automation with `profile=openclaw`:

1. Navigate to `https://sukebei.nyaa.si/`
2. Locate search textbox (usually `Search...`)
3. Type search term and press Enter
4. Take snapshot to review results

**Example:**
```bash
browser action=navigate targetUrl=https://sukebei.nyaa.si/ profile=openclaw
browser action=act request='{"kind":"type","ref":"<searchbox-ref>","text":"MIDA-512"}'
browser action=act request='{"kind":"press","key":"Enter"}'
browser action=snapshot refs=aria
```

## Step 2: Analyze Results & Filter for Uncensored

Scan results for specific quality tags and apply filtering logic:

**Priority Logic:**
1. **If [Reducing Mosaic] exists:** Select smallest file size first (efficient download)
2. **If no [Reducing Mosaic]:** Select highest quality version:

**Quality/Tag Priority (when uncensored not available):**
1. `[FHDC]`, `[FHD]` - High quality but censored
2. `[HD/720p]`, `[H265 1080p]` - Compressed but censored

**Uncensored Selection Rule:**
When `[Reducing Mosaic]` results are available:
- Compare file sizes across all `[Reducing Mosaic]` options
- Select the smallest file (most efficient without losing uncensored content)
- Consider seeders/leechers ratio as secondary factor (more seeders = faster)

**Check details:**
- Click on result name to view details
- Verify file list contains expected video files
- Note info hash for magnet link reference

## Step 3: Download .torrent File

Using browser's download button or `wget` command:

**Option A: Browser download (click)**
```bash
browser action=act request='{"kind":"click","ref":"<download-link-ref>"}'
```

**Option B: wget (if URL known)**
```bash
wget -O /tmp/<name>.torrent <download-url>
```

Download URLs follow pattern: `https://sukebei.nyaa.si/download/<torrent-id>.torrent`

## Step 4: Upload to NAS via FTP

Use lftp to upload to jiyuNas:

**NAS Connection:**
- IP: 10.76.29.5
- Protocol: FTP (lftp)
- Credentials: clks001 / Audqkr18
- Target folder: seed/

**Upload Command:**
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; put /tmp/<torrent-file> -o seed/<torrent-file>"
```

**Verification:**
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; cd seed; ls -la <torrent-file>"
```

Note: Transmission on NAS may automatically rename uploaded files with `.torrent.added` extension upon processing.

## Complete Example Workflow

```bash
# 1. Open sukebei.nyaa.si
browser action=navigate profile=openclaw targetUrl=https://sukebei.nyaa.si/

# 2. Search
browser action=act request='{"kind":"type","ref":"<search-ref>","text":"MIDA-512"}'
browser action=act request='{"kind":"press","key":"Enter"}'
browser action=snapshot refs=aria

# 3. Click uncensored result
browser action=act request='{"kind":"click","ref":"<uncensored-result-ref>"}'
browser action=snapshot refs=aria

# 4. Download torrent
wget -O /tmp/MIDA-512.torrent https://sukebei.nyaa.si/download/4506821.torrent

# 5. Upload to NAS
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; put /tmp/MIDA-512.torrent -o seed/MIDA-512.torrent"

# 6. Verify
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; cd seed; ls -la | grep MIDA-512"
```

## Resources

### references/nas-info.md
NAS connection details, folder structure, and troubleshooting for jiyuNas.

---

This skill eliminates manual browsing, torrent downloading, and FTP uploading through a streamlined workflow.