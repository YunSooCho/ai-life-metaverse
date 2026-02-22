# Transmission Web UI Info

## Access Details

- **URL:** http://10.76.29.5:9091/transmission/web/
- **URL with Authentication:** http://clks001:Audqkr18@10.76.29.5:9091/transmission/web/
- **NAS:** jiyuNas (10.76.29.5)
- **Port:** 9091
- **Username:** clks001
- **Password:** Audqkr18
- **Protocol:** HTTP (requires authentication in local network)

## Authentication

Transmission now requires authentication. Two methods:

### Method 1: URL-based (Preferred for automation)
```
http://clks001:Audqkr18@10.76.29.5:9091/transmission/web/
```
No popup, works with browser automation.

### Method 2: Browser Auth Prompt
When accessing `http://10.76.29.5:9091` without credentials:
- Browser shows HTTP Basic Authentication popup
- Enter username: `clks001`
- Enter password: `Audqkr18`

## UI Structure

### Main Page Elements

- **Toolbar (top):**
  1. ✚ Open Torrent button
  2. ❌ Remove Selected Torrents button ⭐ (use this for deletion)
  3. ▶ Start Selected Torrents button
  4. ⏸ Pause Selected Torrents button
  5. ⏩ Start All Torrents button
  6. ⏸ Pause All Torrents button
  7. ℹ Toggle Inspector button

- **Torrent List:**
  - Shows all torrents with status and progress
  - Each torrent row: Name, Status, Progress/Size, Upload Speed

- **Status Indicators:**
  - `Queued for download` - Waiting to start
  - `Downloading from X of Y peers` - In progress
  - `Seeding complete` - ✅ Safe to delete
  - `Seeding to X of Y peer` - Actively seeding (keep)
  - `Idle` - Not active

### Removal Dialog Options

When clicking Remove button, dialog shows:
1. **Remove torrent only** - Keeps data files (doesn't free space)
2. **Delete torrent and data** - ✅ Deletes both (frees space)

Buttons:
- Cancel
- Remove/Delete (confirm)

## Deletion Guidelines

### ✅ Safe to Delete

- Status: "Seeding complete"
- Share ratio > 0.5 (minimum)
- Not actively seeding to peers
- Seeding time > 1 hour (give back to community)

**Examples:**
```
CAWD-943: Seeding complete, uploaded 3.03 MB (Ratio 0.00)
FC2-PPV-4826927: Seeding complete, uploaded 15.8 MB (Ratio 0.01)
```

### ⚠️ Use Caution

- Status: "Seeding to X of Y peer" - Still giving back
- Recent completion (<6 hours)
- High value torrents (rare content)

### ❌ Do NOT Delete

- Status: "Downloading" - Not complete yet
- Status: "Queued for download" - Waiting to start
- Recently added (<1 hour)
- Located in protected folders (volume2)

## Data Location

Transmission downloads stored at:
- `/volume1/homes/clks001/transmission/`

This folder is managed by the `nas-manager` skill for capacity cleanup.

## Workflow Summary

```
1. Navigate with auth: http://clks001:Audqkr18@10.76.29.5:9091/transmission/web/
2. Snapshot to identify "Seeding complete" torrents
3. Click each completed torrent row
4. Click "Remove Selected Torrents" button
5. Click "Delete torrent and data" option
6. Click confirm button
7. Close browser
```

---

**Last Updated:** 2026-02-06
**Authentication Status:** Enabled (credentials: clks001/Audqkr18)