---
name: genspark-slides-automation
description: Browser automation for genspark.ai AI slides creation. Workflow includes Google login, accessing AI Slides agent, navigating to My Templates, and template selection for generating slides from YouTube URLs or existing templates.
---

# Genspark Slides Automation

이 스킬은 genspark.ai에서 AI 슬라이드를 생성하는 전체 자동화 워크플로우를 제공합니다. 브라우저 자동화를 사용하여 로그인, 탐색, 템플릿 선택 과정을 수행합니다.

## Workflow Summary

1. **브라우저 시작**: openclaw 브라우저 프로필 시작 (로그인 유지)
2. **genspark 접속**: 메인 페이지 접속 및 로그인 상태 확인
3. **AI 슬라이드 접속**: 새 탭 열림 확인 및 탭 전환
4. **내 템플픽 접속**: "내 템플릿" 탭 클릭
5. **템플릿 선택 또는 슬라이드 생성**: 템플릿 적용 또는 새로운 슬라이드 요청

---

## Step-by-Step Workflow

### Step 1: 브라우저 시작

```bash
# 브라우저 상태 확인 및 시작
browser action=start profile=openclaw
```

**중요**: 이 프로필은 로그인 유지를 위한 `user-data` 디렉토리를 사용합니다. 한 번 로그인하면 세션이 유지됩니다.

---

### Step 2: Genspark 접속

```bash
# Genspark 메인 페이지로 이동
browser action=navigate targetUrl="https://www.genspark.ai/"
```

**로그인 상태 확인:**
- Snapshot 캡쳐 및 `refs=aria`로 화면 구조 파악
- "로그인" 버튼이 없으면 로그인 유지 상태
- "로그인" 버튼이 있으면 다시 로그인 필요

---

### Step 3: AI スライド 접속

**AI 슬라이드 클릭:**
```bash
# 메인 페이지에서 "AI 슬라이드" 버튼 클릭
# ref 예시: e161 (항상 같을 것은 아니므로 snapshot으로 확인)
browser action=act request={"kind": "click", "ref": "<AI_SLIDES_REF>"}
```

**새 탭 확인:**
```bash
# 새 탭 목록 확인
browser action=tabs
```

**새 탭 식별:**
- "AI 슬라이드" 또는 "Genspark AI 슬라이드" 제목의 탭 찾기
- URL: `https://www.genspark.ai/agents?type=slides_agent&ries=<id>`
- type: `page` (iframe 무시)

**새 탭으로 전환:**
```bash
# 찾은 탭의 targetId로 전환
browser action=focus targetId="<SLIDES_TAB_TARGET_ID>"
```

---

### Step 4: 내 템플릿 접속

**"내 템플릿" 버튼 찾기:**
- Snapshot에서 "내 템플릿" 버튼의 ref 찾기
- ref 예시: `e84`
- 또는 "내 템플릿"을 포함한 text로 검색 가능

**클릭:**
```bash
browser action=act request={"kind": "click", "ref": "<MY_TEMPLATES_REF>"}
```

**성공 확인:**
- Snapshot에서 "내 템플릿 [active]" 상태인지 확인
- 저장된 슬라이드들이 보여야 함
- 예: "注目AIニュース24選", "タウンハウジング不動産契約者VoCレポート"

---

### Step 5: 템플릿 선택 또는 슬라이드 생성

**옵션 A: 저장된 템플릿 사용:**
```bash
# 원하는 템플릿을 찾아 "적용" 버튼 클릭
# ref 예시: 템플릿 카드 내 "적용" 버튼
browser action=act request={"kind": "click", "ref": "<APPLY_BUTTON_REF>"}
```

**옵션 B: 새로운 슬라이드 생성:**
```bash
# 입력창에 질문 입력
browser action=act request={"kind": "type", "ref": "<INPUT_TEXTBOX_REF>", "text": "<질문>"}

# 스타일 선택: 프로페셔널 또는 크리에이티브
browser action=act request={"kind": "click", "ref": "<STYLE_BUTTON_REF>"}

# 보내기 버튼 클릭
browser action=act request={"kind": "press", "key": "Enter"}
```

---

## 참고 (References)

### Key Elements & Ref Pattern

새로운 세션에서도 같은 pattern을 찾으면 다음을 참고하세요:

#### Genspark 메인페이지 (https://www.genspark.ai/)

**로그인 상태 식별:**
- 로그인 된 상태: "로그인" 버튼 없음
- 로그인 안 된 상태: "로그인" 버튼 존재

**AI 슬라이드 버튼:**
- text: "AI 슬라이드"
- 위치: "기업 제목/메뉴 섹션" 에이전트 목록
- ref 패턴: `e161` (새로운 session마다 달라질 수 있음)

#### AI 슬라이드 페이지 (https://www.genspark.ai/agents?[요청URL])

**새 탭 확인:**
- Title: "AI 슬라이드" 또는 "Genspark AI 슬라이드"
- URL 패턴: `https://www.genspark.ai/agents?type=slides_agent&...`
- type: `page`

**내 템플릿 버튼:**
- text: "내 테마플릿" 또는 "내 템플릿"
- 위치: "탐색" 버튼 옆
- ref 패�턴: `e84` (활성 상태: "active" 속성)

**입력창:**
- placeholder: "슬라이드 요청을 여기에 입력하세요" 또는 "발표 주제와 요구 사항을 입력하세요..."
- ref: `e32`

**스타일 버튼:**
- 프로페셔널: `e59`
- 크리에이티브: `e66`

---

### 자주 사용하는 명령 패턴

```yaml
# Snapshot 캡쳐 (전체 화면 구조 파악)
action: snapshot
params:
  refs: aria  # aria-ref 사용 (stable)

# 단순 클릭
action: act
params:
  request:
    kind: click
    ref: "<target_ref>"

# 텍스트 입력
action: act
params:
  request:
    kind: type
    ref: "<textbox_ref>"
    text: "<content>"

# 엔터 누르기
action: act
params:
  request:
    kind: press
    key: Enter

# 탭 전환
action: focus
params:
  targetId: "<tab_targetId>"

# 탭 목록
action: tabs

# 이동
action: navigate
params:
  targetUrl: "<URL>"
```

---

## YouTube → Genspark 슬라이드 워크플로우 (Full Workflow)

**YouTube Channel:** `https://www.youtube.com/@iketomo-ch` (いけともch)

### Step 1: YouTube URL 획득 (direct channel access)

**채널로 직접 접속:**
```bash
# いけともch 채널 페이지로 이동
browser action=navigate targetUrl="https://www.youtube.com/@iketomo-ch"
```

**최신 "注目AIニュース" 비디오 찾기:**
```bash
# 스냅샷으로 채널 콘텐츠 확인
browser action=snapshot refs=aria

# 썸네일을 보고 "注目AIニュース" 제목의 최신 비디오 클릭
# ref 패턴: eXXXX (snapshot으로 확인 필요)
browser action=act request={"kind": "click", "ref": "<VIDEO_CARD_REF>"}
```

**비디오 URL 추출:**
- 비디오 페이지 URL 확인: `https://www.youtube.com/watch?v=NGYPONTW5JY`
- 브라우저 URL에서 `v=` 파라미터의 video ID 추출

### Step 2: Genspark 접속

```bash
# Genspark 메인 페이지로 이동
browser action=navigate targetUrl="https://www.genspark.ai/"
```

### Step 3: AI 슬라이드 접속 & 템플릿 선택

```bash
# "AI 슬라이드" 클릭 → 새 탭 열림 확인
browser action=act request={"kind": "click", "ref": "<AI_SLIDES_REF>"}

# 탭 전환
browser action=tabs
browser action=focus targetId="<SLIDES_TAB_TARGET_ID>"

# "注目AIニュース24選" 템플릿 선택 → "적용" 클릭
browser action=act request={"kind": "click", "ref": "<TEMPLATE_CARD_REF>"}
```

### Step 4: YouTube URL & 프롬프트 입력

```bash
# YouTube URL + 일본어 프롬프트 입력
browser action=act request={"kind": "type", "ref": "<INPUT_REF>", "text": "https://www.youtube.com/watch?v=<VIDEO_ID>\n\n1ページ1ニューズになるように日本語で作成"}

# 전송 (Enter 키)
browser action=act inputRef="<INPUT_REF>" request={"kind": "press", "key": "Enter"}
```

### Step 5: 슬라이드 생성 대기 (~15분)

```bash
# 진행 상태 확인 (반복 스냅샷)
browser action=snapshot refs=aria

# 생성 완료 확인: "생성 중..." → 완료된 슬라이드로 변경
# 또는 다운로드 버튼/링크가 나타날 때까지 대기
```

### Step 6: 슬라이드 다운로드

```bash
# 다운로드 버튼/링크 클릭
browser action=act request={"kind": "click", "ref": "<DOWNLOAD_BUTTON_REF>"}

# 파일 다운로드 확인 (~/Downloads/ 폴더 확인)
# 브라우저 종료
browser action=action=stop
```

---

## Download Current Slide (현재 생성 중인 슬라이드 다운로드)

**사용 시나리오:** 이미 생성이 시작된 슬라이드가 있고, 완료 후 다운로드

### Step 1: 브라우저 시작

```bash
browser action=start profile=openclaw
```

### Step 2: Genspark 접속

```bash
# Genspark AI 슬라이드 페이지로 직접 이동
browser action=navigate targetUrl="https://www.genspark.ai/agents?type=slides_agent&tab=my"
```

### Step 3: 현재 생성 상태 확인

```bash
# 스냅샷으로 상태 파악
browser action=snapshot refs=aria

# "生成中..." (생성 중) 텍스트 확인:
# - 존재하면 아직 생성 중 → 폴링 계속
# - 존재하지 않으면 완료 → 다운로드 단계로 이동
```

### Step 4: 완료까지 폴링 (Polling)

```bash
# 30초 간격으로 상태 확인 (반복)
WAIT_TIME=1800  # 30분
CHECK_INTERVAL=30  # 30초

while [ $WAIT_TIME -gt 0 ]; do
    # 스냅샷 확인
    browser action=snapshot refs=aria

    # "生成中..." 텍스트가 없으면 완료
    if ! snapshot에 "生成中..." 포함; then
        echo "슬라이드 생성 완료!"
        echo "다운로드 단계로 이동..."
        break
    fi

    # 진행 상태 표시
    echo "생성 중 - $CHECK_INTERVAL 초 대기... ($WAIT_TIME 초 남음)"
    sleep $CHECK_INTERVAL
    WAIT_TIME=$((WAIT_TIME - CHECK_INTERVAL))
done
```

### Step 5: 다운로드 버튼 찾기 & 클릭

```bash
# 완료된 슬라이드 상태 스냅샷
browser action=snapshot refs=aria

# 다운로드 버튼 찾기
# ref 예시: eXXXX (snapshot으로 확인)
# 대상 요소: "다운로드", "Download", 또는 다운로드 아이콘

# 다운로드 버튼/링크 클릭
browser action=act request={"kind": "click", "ref": "<DOWNLOAD_BUTTON_REF>"}
```

### Step 6: 다운로드 완료 확인

```bash
# 다운로드 상태 확인:
# - 브라우저 다운로드 폴더 (`~/Downloads/`)에 파일 생성 확인
# - 또는 다운로드 완료 메시지/프로그레스바 확인

# 완료 메시지 표시
echo "다운로드 완�료!"
echo "파일 위치: ~/Downloads/<filename>"

# 브라우저 종료
browser action=action=stop
```

---

## 완전 스킬 사용법

### 30분 이상 대기 후 다운로드

이 스킬을 사용하여 30분 후 다운로드:

**Option A:** 手動으로 실행

1. 30분 대기 (sleep 1800)
2. 스킬 실행: `genspark-slides-automation download-current`

**Option B:** Cron Job으로 자동

```bash
# 슬라이드 생성 시작 30분 후에 리마인더 (cron) → 스킬 실행
# cron job에서 실행:
# "genspark-slides-automation download-current" 명령 사용
```

**참고:** 슬라이드 생성이 완료되지 않으면 폴링을 계속해서 다운로드 상태까지 관리

---

## 완전 워크플로우 정리

**전체 Sequence:**
1. YouTube 채널 접속 (`@iketomo-ch`) → 최신 "注目AIニュース" 찾기
2. YouTube URL 추출 (`v=` video ID)
3. Genspark.me 접속 → "AI 슬라이드" 클릭 → 탭 전환
4. "내 템플릿" → "注目AIニュース24選" → "적용" 클릭
5. YouTube URL 입력 + 일본어 프롬프트 추가 (`1ページ1ニューズになるように日本語で作成`)
6. Enter → 슬라이드 생성 시작 (~15분 대기)
7. 완료 확인 → 다운로드

---

## 요약

**YouTube Channel URL:** `https://www.youtube.com/@iketomo-ch`

**Key Requirements:**
- **Direct channel access** (no search required)
- **Template:** "注目AIニュース24選"
- **Prompt (Japanese):** `1ページ1ニューズになるように日本語で作成`
- **Wait time:** ~15 minutes for slide generation
- **Template selection required** before URL input

---

## 완성된 스킬로 만들기

이 SKILL.md는 현재 **진행 중인 워크플로우**를 문서화했습니다. 실제 스킬을 완성하기 EPG/배포하려면:

1. **작업 완료**: YouTube에서 유튜브 URL 검색 및 복사 구현
2. **추가 리소스 필요 시**:
   - **scripts/**: YouTube 크롤링 스크립트 (Python + yt-dlp)
   - **references/**: いけともch channel URL 패턴 문서
3. **패키징**: `python3 /opt/homebrew/lib/node_modules/openclaw/skills/skill-creator/scripts/package_skill.py /Users/clks001/.openclawworkspace/skills/genspark-slides-automation`

---

## 주의사항

- **리소스 관리**: 모든 작업이 끝나면 브라우저 종료: `browser action=stop`
- **로그인 유지**: `openclaw` 프로필은 `user-data` 디렉�토리를 사용하여 로그인 유지
- **Ref 동적 변경**: ref는 페이지 구조에 따라 동적으로 변하므로 매번 snapshot으로 확인 필요
- **시간 지연**: 로그인, 페이지 로딩, 슬라이드 생성에 시간 소요. `wait` 또는 `sleep` 사용 가능

---

## 예제 사용 시나리오

### 시나리오 1: 최신 AI 뉴스 슬라이드 만들기 (全自动)

User: "이번 주 AI 뉴스 슬라이드 만들어줘"

1. 브라우저 시작 (`openclaw` 프로필)
2. YouTube 채널로 이동 (`@iketomo-ch`) → 최신 "注目AIニュース" 비디오 찾기
3. YouTube URL 추출 (`v=` parameter)
4. Genspark 접속 → "AI 슬라이드" 클릭
5. "내 템플릿" → "注目AIニュース24選" → "적용"
6. YouTube URL + `1ページ1ニューズになるように日本語で作成` 입력
7. 15분 대기 → 다운로드

### 시나리오 2: 저장된 템플릿으로 슬라이드 만들기

User: "저장된 템플릿으로 슬라이드 만들어줘"

1. 브라우저 시작 → genspark 접속
2. AI 슬라이드 클릭 → "내 템플릿" 접속
3. 원하는 템플릿 찾기 → "적용" 클릭

### 시나리오 3: 특정 YouTube URL로 슬라이드 만들기

User: "이 URL로 슬라이드 만들어줘: <URL>"

1. 브라우저 시작 → genspark 접속
2. AI 슬라이드 접속 → "내 템플릿" → 템플릿 선택
3. 입력창에 URL + 프롬프트 입력
4. 15분 대기 → 다운로드

---

**현재 완료 상태:**
- ✅ YouTube URL 획득 (direct channel access)
- ✅ Genspark 로그인 → AI 슬라이드 접속
- ✅ 템플릿 선택 ("注目AIニュース24選")
- ✅ YouTube URL + 일본어 프롬프트 입력
- ✅ 슬�라이드 생성 (~15분) 시작
- ⏳ **진행 중**: 슬라이드 생성 완료 후 다운로드 워크플로우 구현 필요

**최신 비디오 URL:** `https://www.youtube.com/watch?v=NGYPONTW5JY` (2026-02-08 기준)
**제목:** 注目AIニュース17選～OpenClaw、Claude Cowork Plugins、Project Genie、MCP Apps、Google AI Plusなど