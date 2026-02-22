# Genspark Slides Automation Script

**이 스크립트는 Genspark.ai에서 슬라이드 생성부터 다운로드까지 전체 자동화를 담당합니다.**

---

## 사용법

### 방법 1: 현재 생성 중인 슬라이드 다운로드

```bash
# 현재 진행 중인 슬라이드 생성 상태 확인 후 완료 시 다운로드
# 30분 이후 실행 권장 (생성 시간)
genspark-slides-automation download-current
```

### 방법 2: 새로운 AI 뉴스 슬라이드 생성

```bash
# YouTube 최신 "注目AIニュース" → Genspark 슬라이드 생성 → 다운로드
genspark-slides-automation create-new-news-slides
```

---

## Workflow 1: 현재 슬라이드 다운로드 (Download Current)

### Step 1: 브라우저 시작

```bash
# openclaw 프로필로 브라우저 시작 (로그인 유지)
browser action=start profile=openclaw
```

### Step 2: Genspark 접속

```bash
# Genspark 접속
browser action=navigate targetUrl="https://www.youtube.com/@iketomo-ch接着 점 접속"
```

**중요:** YouTube 채널 접속이 아니라 **Genspark 접속**!

```bash
browser action=navigate targetUrl="https://www.genspark.ai/agents?type=slides_agent&tab=my"
```

### Step 3: 현재 슬라이드 생성 상태 확인

```bash
# 슬라이드 페이지 스냅샷
browser action=snapshot refs=aria

# "생성 중..." 또는 "완료" 상태 확인
# "生成中..." → 아직 생성 중
# 다른 텍스트 → 완료 후 다운로드 가능
```

### Step 4: 완료까지 폴링 (Polling Until Complete)

```bash
# 30초마다 반복 체크
while true; do
    browser action=snapshot refs=aria
    
    # "生成中..." 텍스트가 더 이상 보이지 않으면 완료
    if ! snapshot에 "生成中..." 포함; then
        echo "슬라이드 생성 완료!"
        break
    fi
    
    echo "생성 중 - 30초 대기..."
    sleep 30
done
```

### Step 5: 다운로드 버튼 클릭

```bash
# 슬라이드 완료 후 다운로드 버튼/링크 찾기
browser action=snapshot refs=aria

# 다운로드 버튼 클릭 (ref 예시: eXXXX)
browser action=act request={"kind": "click", "ref": "<DOWNLOAD_BUTTON_REF>"}

# 또는 다운로드 링크 직접 클릭
browser action=act request={"kind": "click", "ref": "<DOWNLOAD_LINK_REF>"}

# 파일 다운로드 시작됨...
```

### Step 6: 다운로드 완료 확인

```bash
# 다운로드 상태 확인:
# - 브라우저 다운로드 폴더에 파일 생성 확인
# - 또는 "완료" 메시지 확인
echo "다운로드 완료!"

# 브라우저 종료
browser action=stop
```

---

## Workflow 2: 새로운 AI 뉴스 슬라이드 생성 (Create New)

### Step 1: 브라우저 시작

```bash
browser action=start profile=openclaw
```

### Step 2: YouTube 최신 "注目AIニュース" 찾기

```bash
# いけともch 채널 접속
browser action=navigate targetUrl="https://www.youtube.com/@iketomo-ch"

# 스냅샷
browser action=snapshot refs=aria

# 가장 최신의 "注目AIニュース" 비디오 찾기 (썸네일 확인 후 클릭)
browser action=act request={"kind": "click", "ref": "<VIDEO_CARD_REF>"}

# 비디오 URL 획득 (브라우저 URL에서 v= 파라미터 확인)
# 예: https://www.youtube.com/watch?v=NGYPONTW5JY
```

### Step 3: Genspark 접속 및 템플릿 선택

```bash
# Genspark 접속
browser action=navigate targetUrl="https://www.genspark.ai/"

# "AI 슬라이드" 클릭
browser action=act request={"kind": "click", "ref": "<AI_SLIDES_REF>"}

# 새 탭 전환
browser action=tabs
browser action=focus targetId="<SLIDES_TAB_TARGET_ID>"

# "내 템플릿" → "注目AIニュース24選" → "적용"
browser action=act request={"kind": "click", "ref": "<TEMPLATE_CARD_REF>"}
```

### Step 4: YouTube URL + 프롬프트 입력

```bash
# YouTube URL + 일본어 프롬프트 입력
browser action=act request={"kind": "type", "ref": "<INPUT_REF>", "text": "https://www.youtube.com/watch?v=<VIDEO_ID>\n\n1ページ1ニューズになるように日本語で作成"}

# 전송 (Enter)
browser action=act inputRef="<INPUT_REF>" request={"kind": "press", "key": "Enter"}
```

### Step 5: 생성 완료 대기

```bash
# 30분 대기 (좀 더 안전하게:
echo "30분 동안 슬라이드 생성 진행..."
sleep 1800  # 30분 = 1800초

# 또는 폴링으로 더 신축성:
WAIT_TIME=1800  # 30분
CHECK_INTERVAL=30  # 30초 마다 확인

while [ $WAIT_TIME -gt 0 ]; do
    browser action=snapshot refs=aria
    
    # "生成中..." 텍스트 없으면 완료 로 간주
    if ! snapshot에 "生成中..." 포함; then
        echo "슬라이드 생성 조기 완료!"
        break
    fi
    
    echo "생성 중 - $CHECK_INTERVAL 초 대기... ($WAIT_TIME seconds remaining)"
    sleep $CHECK_INTERVAL
    WAIT_TIME=$((WAIT_TIME - CHECK_INTERVAL))
done

echo "슬라이드 생성 완료!"
```

### Step 6: 다운로드

```bash
# Workflow 1의 Step 5-6 동일
# 다운로드 버튼 클릭 → 완료 확인 → 브라우저 종료
```

---

## 다운로드 위치

**기본 다운로드 폴더:** 
- macOS: `~/Downloads/` 또는 브라우저 설정에 따라 다름
- 다운로드된 파일을 `~/Downloads/` 폴더에서 찾을 수 있음

**파일명:** Genspark 자동 생성. 예: `注目AIニュース.pdf` 또는 `.slides` 파일

---

## 에러 처리

### 에러: 슬라이드 생성 완료 후 다운로드 버튼 없음

**대안:**
1. URL로 직접 다운로드 시도
2. API 엔드포인트 직접 호출 (존재 시)
3. PDF로 변환 → 다운로드

### 에러: 30분 초과

**대안:**
1. 생성 상태 확인 (Genspark 서버 측 문제일 수 있음)
2. 재시도: 페이지 새로고침 후 다운로드 버튼 찾기
3. 지원 문의

---

전체 스크립트는 Shell + Python (yt-dlp)으로 자동화 가능.
OpenClaw skill으로 배포 시 `SCRIPT.sh` 파일로 제공.