# NAS Connection Reference

## jiyuNas (Synology NAS)

### Connection Details
- **IP Address:** 10.76.29.5
- **Protocol:** FTP (via lftp)
- **Username:** clks001
- **Password:** Audqkr18

### Available Methods

#### FTP (Recommended - Working)
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; ls"
```

**Upload:**
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; put <local-file> -o <remote-path>"
```

**Download:**
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; get <remote-file> -o <local-path>"
```

**Folder listing:**
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; cd <folder>; ls -la"
```

#### SSH/SFTP (Blocked)
- Port 22 open but permission denied
- Likely requires different credentials

#### SMB/CIFS (Available - Not Tested)
- Ports 139/445 open
- Requires smbclient or similar tool (not currently installed)

### Folder Structure

| Folder | Description | Permission |
|--------|-------------|------------|
| Drive/ | General storage | clks001 |
| done/ | Completed downloads | clks001 |
| seed/ | **Torrent seedbox folder** | clks001 |
| transmission/ | Transmission config (root owned, 24KB) | root |
| ★/ | Special content | clks001 |
| 전당/ | Personal storage | clks001 |

### Seedbox Workflow

**Upload torrent file to seedbox:**
```bash
wget -O /tmp/<name>.torrent <torrent-url>
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; put /tmp/<name>.torrent -o seed/<name>.torrent"
```

**Verify upload:**
```bash
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; cd seed; ls -la | grep <name>"
```

**Note:** Transmission automatically processes uploaded torrent files and may rename them with `.torrent.added` extension.

### Common Issues

1. **"No such file" error after upload**
   - Check folder path (use `cd seed; ls` first)
   - Transmission may have already processed the file with `.torrent.added` suffix

2. **Permission errors**
   - Only `clks001` user has write access to seed/, done/, Drive/, ★/, and 전당/
   - `transmission/` folder is root-only, do not use

3. **Connection timeouts**
   - Verify NAS is accessible from network: `ping 10.76.29.5`
   - Check FTP service is running on NAS

### Troubleshooting Commands

```bash
# Test connection
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; ls"

# Check current working directory on NAS
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; pwd"

# View folder contents with details
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; ls -lh seed/"

# Get file size info
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; du -s seed/"
```