# NAS Connection Info - jiyuNas

## Network Details

- **Name:** jiyuNas
- **IP:** 10.76.29.5
- **Mac Mini IP:** 10.76.29.87

## SSH Connection

- **Port:** 22
- **Username:** clks001
- **Password:** Audqkr18
- **Status:** ✅ Working (tested with sshpass)

**SSH Command:**
```bash
sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5
```

## FTP Connection (Alternative)

- **Port:** 21
- **Protocol:** FTP (lftp)
- **Status:** ✅ Working

**FTP Command:**
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; ls"
```

## Storage Volumes

| Volume | Total | Used | Available | Usage % | Notes |
|--------|-------|------|-----------|---------|-------|
| /volume1 | 3.5 TB | 3.4 TB | 152 GB | 96% | **Target for cleanup** - contains /home/transmission |
| /volume2 | 3.5 TB | 3.3 TB | 263 GB | 93% | ⚠️ Protected - contains important files |

### Volume 1 (/volume1)

**Path:** /home/transmission

**Current Size:** 3.2 TB

**Status:** 96% usage - cleanup needed

**Contents:**
- Individual video files (GB-GB sizes)
- Folders by genre (uncensored-HD, etc.)
- Collection folders

**Cleanup Target:** Yes (prioritize large files >100MB)

### Volume 2 (/volume2)

**Status:** ⚠️ PROTECTED - Do not touch

**Reason:** Contains critical/important files

## Transmission Setup

### Web UI

- **URL:** http://10.76.29.5:9091/transmission/web/
- **Status:** Requires authentication

### Auto-processing

- **Seed Folder:** /seed (FTP upload target)
- **Transmission Folder:** /transmission (completed downloads)
- **Auto-rename:** .torrent → .torrent.added (when processed)

### Usage Pattern

1. Upload .torrent to /seed via FTP
2. Transmission auto-creates .torrent.added
3. Download starts automatically
4. Completed files go to /transmission

## Security Notes

1. **Volume 2 Protection:** Never include /volume2 in deletion commands
2. **Path Validation:** Always use absolute paths starting with /home/transmission
3. **Sudo/Admin:** Not required (clks001 user has write access)
4. **SSH Keys:** Using sshpass (no key-based auth)

## Troubleshooting

### SSH Connection Issues

If SSH stops working:
1. Check port 22: `nc -zv 10.76.29.5 22`
2. Verify password correct (Audqkr18)
3. Test manual connection: `ssh clks001@10.76.29.5`

### FTP vs SSH Preference

- **SSH:** Preferred for capacity checks, file deletion
- **FTP:** Preferred for .torrent uploads, file listing
- Both work reliably

## Scripts Location

Path on Mac mini: `/Users/clks001/.openclaw/workspace/skills/nas-manager/scripts/`

Available scripts:
- `check_capacity.sh` - Check volume1 usage
- `find_large_files.sh` - Find files >=100MB
- `cleanup_largest.sh` - Delete files (with safety checks)