# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## My Local Setup

### Red52 Downloader Skill (새로 설치)
- **위치:** `/Users/clks001/.openclaw/workspace/skills/red52-downloader/SKILL.md`
- **기능:** red52.kr BJ 게시물에서 이미지 다운로드
- **배포 파일:** `/Users/clks001/.openclaw/workspace/red52-downloader.skill`
- **중요:** 검색 URL에 필수 파라미터: `_filter=search&search_target=title_content`
- **특징:**
  - Referer 헤더 필수 (curl -e 옵션)
  - cdn.red52.kr 도메인 이미지만 추출
  - 브라우저 프로필: openclaw (CDP 포트 18800)
- **버그 수정:** 2026-02-06 검색 URL 형식 수정

---

---

### NAS (jiyuNas) - Synology NAS

**Location:** 10.76.29.5 (Local Network)
**Connection Method:** FTP (lftp)

**Credentials:**
- Username: `clks001`
- Password: `Audqkr18`

**Working Commands:**

```bash
# FTP 연결
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; ls"

# 파일 업로드
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; put /local/file.txt"

# 파일 다운로드
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; get remote/file.txt"

# 디렉토리 크기 확인
lftp -c "open -u clks001,Audqkr18 ftp://10.76.29.5; du -s"
```

**Connected Shares (FTP):**
- `Drive/` - 폴더
- `done/` - 폴더
- `seed/` - 폴더 (4KB)
- `transmission/` - 폴더 (root 소유, 24KB)
- `★/` - 폴더
- `전당/` - 폴더

**Available Ports:**
- 21 (FTP) - ✅ Working
- 22 (SSH/SFTP) - ❌ Permission denied
- 139/445 (SMB/CIFS) - ✅ Open (not tested with lftp)
- 80 (HTTP) - ✅ Synology Web Station
- 5001 (HTTPS) - ✅ DSM Web Manager

**Tools Installed:**
- lftp (FTP/HTTP/SMB client)
- wget (web downloader)
- rsync (file sync)

**Note:** FTP works perfectly; SMB/SFTP needs further testing.

---

Add whatever helps you do your job. This is your cheat sheet.