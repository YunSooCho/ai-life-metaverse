---
name: nas-cleanup-transmission
description: Transmission web UI automation for removing seed-complete torrent metadata. Use when you need to remove completed torrents' metadata (not data files) from Transmission on NAS (10.76.29.5:9091).
---

# Transmission Cleanup (Metadata Removal)

Automated workflow for removing seed-complete torrent metadata from Transmission web UI on NAS.

## Workflow

```
1. Access Transmission web UI with authentication
2. Identify seed-complete torrents (Status: "Seeding complete")
3. Select each completed torrent and remove metadata
4. Close browser
```

## Step 1: Access Transmission Web UI

Navigate to Transmission web interface with credentials in URL:

```bash
browser action=navigate profile=openclaw targetUrl=http://clks001:Audqkr18@10.76.29.5:9091/transmission/web/
browser action=snapshot refs=aria depth=3
```

## Step 2: Identify Seed-Complete Torrents

Scan the torrent list and filter by status:

**Target status:** "Seeding complete"
- These are fully downloaded and have completed seeding
- Safe to remove metadata (data files kept in NAS storage)

## Step 3: Remove Torrent Metadata

**Process for EACH completed torrent:**

1. Click on torrent row with "Seeding complete" status
2. Click "Remove Selected Torrents" button
3. Click "Remove" in confirmation dialog
4. Repeat for next torrent

**Example workflow:**
```bash
# For each completed torrent:
browser action=act request='{"kind":"click","ref":"e<torrent-listitem-ref>"}'
browser action=act request='{"kind":"click","ref":"e<remove-button-ref>"}'
browser action=act request='{"kind":"click","ref":"e<remove-confirm-ref>"}'
```

## Step 4: Close Browser

Always close browser when done to free resources:

```bash
browser action=stop
```

## Important Notes

✅ **What gets removed:**
- Torrent metadata (.torrent file)
- Tracker info
- Seeding status
- Queue position

✅ **What stays intact:**
- Downloaded data files on NAS
- All video/audio/content files
- Data stored in `/volume1/homes/clks001/transmission/`

### Safe to Delete Metadata When:

- Status is "Seeding complete"
- Not actively seeding to peers
- Data files are confirmed on NAS storage

### DO NOT Remove Metadata When:

- Still downloading (Status: "Downloading")
- Actively seeding to peers (uploading)
- Recently completed (<1 hour)
- Data verification needed

## Example Complete Workflow

```bash
# 1. Open Transmission UI with authentication
browser action=navigate profile=openclaw targetUrl=http://clks001:Audqkr18@10.76.29.5:9091/transmission/web/

# 2. Take snapshot to identify completed torrents
browser action=snapshot refs=aria depth=3

# 3. For each torrent with "Seeding complete" status:
#    a. Select torrent
browser action=act request='{"kind":"click","ref":"e<listitem-ref>"}'

#    b. Click Remove button
browser action=act request='{"kind":"click","ref":"e<remove-button-ref>"}'

#    c. Click Remove in dialog
browser action=act request='{"kind":"click","ref":"e<remove-confirm-ref>"}'

#    d. Repeat for next completed torrent...

# 4. Close browser
browser action=stop
```

## Usage Example (Manual Process)

In manual execution:
1. Access http://clks001:Audqkr18@10.76.29.5:9091/transmission/web/
2. Scroll through torrent list
3. Look for "Seeding complete" status
4. Click each completed torrent row
5. Click Remove → Remove
6. Repeat until all completed torrents removed

## Resources

### references/transmission-info.md
NAS Transmission access details, authentication, and UI guide.

---

**Authentication:** Built into URL (http://clks001:Audqkr18@...)
**Removal Type:** Metadata only (data files preserved)