---
name: genspark-slides-create
description: YouTube "いけともch" → 최신 "注目AIニュース" 찾기 → 5일 체크 → Genspark.ai에서 자동 슬라이드 생성 (특정 템플릿 사용)
---

# Genspark 슬라이드 생성

이 스킬은 YouTube 채널 @iketomo-ch에서 최신 "注目AIニュース" 비디오를 찾고 **5일 체크**를 수행한 후, Genspark.ai에서 자동으로 슬�라이드를 생성합니다.

---

## 🚨 CRITICAL: 5일 체크 (필수 철칙!) 🔒

### 체크 조건 (STRICT!)

| 조건 | 체크 내용 | 만족 여부 | 결과 |
|------|-----------|----------|------|
| **①** | 비디오가 있는가? | ❌ 없음 | ⛔ **텔레그램:** "注目AIニュース가 아직 없습니다" |
| **②** | 제목에 "注目AIニュース" 포함? | ❌ 없음 | ⛔ **텔레그램:** "AI 뉴스 비디오가 아직 없습니다" |
| **③** | 업로드 날짜가 **5일 이내**인가? | ❌ 5일 이상 | ⛔ **텔레그램:** "비디오가 5일 이상 전입니다 (x日前)" |
| **④** | **①+②+③ 전체 만족?** | ✅ 전체 만족 | ⏭️ **계속 진행** (Step 2 이동) |

### 업로드 날짜 해석

| YouTube 패턴 | 의미 | 5일 기준 | 결과 |
|-------------|------|----------|------|
| `x日前` | x일 전 | x < 5 | ✅ |
| `x週間前` | x주 전 | x≥1 | ❌ (7~14일) |
| `xヶ月前` | x개월 전 | x≥1 | **❌** (30~90일) |
| `x年前` | x년 전 | x≥1 | **❌** (365+일) |
| `x hours前` | x시간 전 | x < 120 | ✅ |

### 중요 (NOTES)

**5일 체크 2단계 보장:**
1. **YouTube Videos 리스트** → `https://www.youtube.com/@iketomo-ch/videos` ← **이 URL 접근으로 최신 "Videos" 표시**
2. **snapshot → 첫 번째 비디오** → "注目AIニューズ" 검색 | **❌ 없으면** → ⛔ **알림 & 종료**
3. **날짜 확인:** `x日前`, `x週間前`, `xヶ月前` 패턴 파싱 → **❌ 5일 이상** → ⛔ **알림 & 종료**
4. **✅ 5일 이내** → 계속 ✅

**⚠️ URL 접근방식 필수:**
```
❌ X: https://www.youtube.com/@iketomo-ch (→ 홈페이지 로드 → "おすすめ" 섹션 → 오래된 비디오)
✅ O: https://www.youtube.com/@ikippetomo-ch/videos (→ Video 리스트 로드 → 최신)
```

**이전 버전 실수 (2026-02-08 발견):**
- 홈페이지 URL로 접속 → "動畫" 탭 클릭했으나 **캐캇은 "추천" 섹션**
- **결과:** 5일 전 비디오 선택 → **5일 체크 로직 수행되지 않음**
- **왜 발생?**: "추천" 섹션은 "최신"이 아님

**현재 URL 접근 (2026-02-08 수정):**
- **YouTube Videos URL:** `https://www.youtube.com/@iketomo-ch/videos` ← **최초 적용**
- **접속:** ✅ 동영상 탭 로드 ❌ **클릭 ❌** → **최신 비디오 확인** ✅ → **5일 체크** ✅

---

## 📋 사용법

```bash
# 이번 주 AI 뉴스 슬라이드 생성
/Users/clks001/.openclaw/workspace/skills/genspark-slides-create/create.sh
```

---

## 🎯 시나리오

### 시나리오: 최신 AI 뉴스 슬�이드

**사용:** "이번 주 AI 뉴스 슬�라이드 만들어줘!"

1. **Step 1: YouTube Videos 접속 → 5일 체크:** ⏭️ **최중요!**
   - **YouTube Videos URL 접속** (`@iketomo-ch/videos`) ← **videos URL로 직접 로드**
   - **snapshot → 첫 번째 비디오** → "注目AIニューズ" 있는지 확인
   - **업로드 날짜 확인** (`x日前`, `x週間前`, `xヶ月前` 숫자 추출)
   - **5일 체크:**
     - ❌ **없거나 5일 이상 전** → ⛔ **텔레그램:** "동영상이 아직 없습니다" → **종료**
     - ✅ **5일 이내** → ⏭️ **Step 2:** YouTube URL 추출

2. **Step 2:** YouTube URL 추출
   - 비디오 클릭 → `v=` 파라미터 추출

3. **Step 3:** Genspark 접속 → "AI 슬라이드"
   - "내 템플릿" → "注目AIニューズ24選" → "적용"

4. **Step 4:** YouTube URL + 프롬프트 입력
   - 일본어: `1ページ1ニューズになるように日本語で作成`

5. **Step 5:** 생성 (~15-30분)

6. **완료:** Genspark 대시보드에 표시

---

## 🔄 워크플로우 (10단계)

### Step 1: YouTube Videos 접속 → 5일 체크

```bash
# 1. 브라우저 시작
browser action=start profile=openclaw

# 2. YouTube Videos URL 접속 (최신 Video 로드) ← ⚠️ videos 필수!
browser action=navigate targetUrl="https://www.youtube.com/@iketto-ch/videos"
sleep 10

# 3. 최신 비디오 확인
snapshot → 첫 번째 비디오 카드 → 제목 "注目AIニューズ" 확인
- ❌ 없으면: telegram "注目AIニュース가 아직 없습니다" → exit 1

# 4. 업로드 날짜 추출 (x日前 / x時間前 / x週間前 / xヶ月前)
snapshot → "x" 숫자 추출 → 유닛 확인
- ❌ ≥5 (日) → telegram "비디오가 5일 이상 전입니다 (x日前)" → exit 1

# 5. 비디오 클릭 (Step 2로...)
찾은 비디오 ref → click()
```

**5일 체크 상세 구현:**

```bash
# snapshot → 첫 번째 비디오
SNAPSHOT=$(browser snapshot refs=aria)

# "注目AIニューズ" 있는가?
if ! echo "$SNAPSHOT" | grep -q "注目AIニューズ"; then
    telegram "注目AIニュース가 아직 없습니다"
    exit 1
fi

# 업로드 날짜 추출: "x日前", "x時間前", "x週間前", "xヶ月前", "x年前"
DATE_PATTERN=$(echo "$SNAPSHOT" | grep -oE '[0-9]+日前|[0-9]+時間前|[0-9]+週間前|[0-9]+ヶ月前|[0-9]+年前') || "")
UNIT=$(echo "$DATE_PATTERN" | grep -oE '日|時間|週間|ヶ月|年' || "日")
NUM=$(echo "$DATE_PATTERN" | grep -oE '[0-9]+' || "0")

# 5일 체크 (단위 가중치)
case "$UNIT" in
    "日") DAYS_AGO=$NUM ;;
    "時間") DAYS_AGO=$((NUM / 24)) ;;
    "週間") DAYS_AGO=$((NUM * 7)) ;;
    "ヶ月") DAYS_AGO=$((NUM * 30)) ;;
    "年") DAYS_AGO=$((NUM * 365)) ;;
    *) DAYS_AGO=0 ;;
esac

# 5일 체크
if [ "$DAYS_AGO" -ge 5 ]; then
    telegram "비디오가 5일 이상 전입니다 (${DATE_PATTERN})"
    exit 1
fi

# ✅ 5일 이내 → 계속
echo "✅ 5일 이내 비디오 확인: ${DATE_PATTERN}"
```

---

### Step 2: YouTube URL 추출

```bash
# 찾은 비디오 클릭
browser action=act request={"kind": "click", "ref": "<VIDEO_REF>"}
sleep 3

# URL 추출: v=VIDEO_ID
局部
VIDEO_ID=$(current_url | grep -o 'v=[^&]*' | cut -d= -f2)
VIDEO_URL="https://www.youtube.com/watch?v=$VIDEO_ID"

echo "YouTube URL: $VIDEO_URL"
```

---

### Step 3: Genspark 접속 → "AI 슬라이드"

```bash
# Genspark 메인 접속
browser action=navigate targetUrl="https://www.genspark.ai/"

# "AI 슬라이드" 버튼 클릭
snapshot → "AI.*Slides" ref → click()
sleep 2

# 전된 새 탭으로
browser action=tabs → "AI 슬라이드" 탭 → focus()
```

---

### Step 4: "내 템플릿" → "注目AIニュ즈24選" → "적용"

```bash
# "내 템플릿" 탭 클릭
snapshot → "내 템플릿" ref → click()
sleep 2

# "注目AIニューズ24選" 찾기 → 카드 클릭
template_ref ← snapshot: "注目AIニューズ24" → click()
sleep 1

# "적용" / "이 템플릿 사용하기" 버튼 → click()
snapshot → "適用" 또는 "Use" → ref → click()
```

---

### Step 5: YouTube URL + 프롬프트 입력

```bash
# 入력창 ref 찾기
INPUT_REF ← snapshot: textbox / textarea / input → ref

# YouTube URL + 일본어 프롬프트 입력
TEXT="$VIDEO_URL\n\n1ページ1ニューズになるように日本語で作成"
browser action=act request={"kind": "type", "ref": "$INPUT_REF", "text": "$TEXT"}

# Enter 전송
browser action=act inputRef="$INPUT_REF" request={"kind": "press", "key": "Enter"}
```

---

### Step 6: 생성 완료 확인

```bash
# "生成中..." (생성 중) 없는지 확인
SNAPSHOT=$(browser snapshot refs=aria)

if ! echo "$SNAPSHOT" | grep -q -i "生成中"; then
    echo "✅ 생성 완료!"
    telegram "슬라이드 생성 완료!"
else
    echo "⏳ 생성 중 (~15-30분)"
fi
```

---

### Step 7: 브라우저 종료

```bash
browser action=stop
```

---

## ✅ 결과 출력

```
========================================
✅ 완료 상태
========================================
- YouTube URL: https://www.youtube.com/watch?v=<VIDEO_ID>
- Template: "注目AIニューズ24選"
- Prompt: "1ページ1ニューズになるように日本語で作成"
- 업로드 날짜: <x日前> / <x時間前>
- 상태: 생성 완료 (Genspark에 저장됨)
========================================

💡 Download: 'genspark-slides-download' skill
```

---

## 🏁 다운로드

생성 완료 후 슬라이드 다운로드는 **genspark-slides-download** 스킬을 사용하세요.

```bash
/Users/clks001/.openclaw/workspace/skills/genspark-slides-download/download.sh
```

---

## 💻 상수 (Constants)

| 상수 | 값 |
|-----|----|
| **YouTube Videos URL** | `https://www.youtube.com/@iketomo-ch/videos` |
| **비디오 검색 키워드** | `"注目AIニューズ"` |
| **Genspark URL** | `https://www.genspark.ai/` |
| **Template** | `"注目AIニューズ24選"` |
| **일본어 프롬프트** | `"1ページ1ニューズになるように日本語で作成"` |

---

## 🚨 주의 (Notes)

### 5일 체크 (Step 1)

| 체크 |昂 | 설명 | 결과 |
|------|----|----|----|
| "注目AIニューズ" | 제목 포함? | ❌ 없음 | ⛔ "동영상이 아직 없습니다" |
| 업로드 날짜 | 5일 이내? | ❌ 5일+ | ⛔ "비디오가 5일 이상 전입니다" |
| 전체 | 콤보? | ✅ 전체 OK | ✅ 계속 |

### URL 접근 (CRITICAL!!)

| URL로 | 동작 | 최신? |
|--------|----|----|----|
| `@iketetomo-ch` (홈) | home → "추천" 섹션 | ❌ **아님!** |
| `@iketomo-ch/videos` (비디오) | 동영상 리스트 | ✅ ** 최신** |

### 리소스 관리:

| 아이템 | 상태 |
|------|------|
| 브라우저 프로필 | `openclaw` (로그인 유지) |
| user-data | 세션 저장 |
| 종료: 완료 후 | `browser action=stop` |

### 시간 소요)

| Phase | 시간 |
|-------|----|:----|
| YouTube → 5일 체크 | ~1-2분 |
| URL 추출 | ~10초 |
| Genspark → 템플릿 + 입력 | ~2-3분 |
| **생성** | ~15-30분 |

### Ref Dynamic:

| 요인 | 영향 |
|------|----|
| ref | 매번 달라짐 → **snapshot으로 확인 필수** |
| 페이지 | 새로고침 → ref도 변경 |
| 테마 | 언어 설정에 따라 ref 변경 |

---

## 🎯 완료 상태

| 상태 | 설명 |
|-----|-----|
| **5일 체크**: ✅ | "注目AIニューズ" 존재 + 5일 이내 |
| **YouTube URL**: 추출 | `https://www.youtube.com/watch?v=<VIDEO_ID>` |
| **Genspark**: 생성 | 슬라이드 생성 시작 (~15-30분) |
| **저장**: 보존 | 대시보드에 저장 |

---

## 🔗 참고 (References)

### YouTube Videos 캡터

**Videos URL:**
- `https://www.youtube.com/@iketomo-ch/videos`
- **접속:** ✅ 최취 리스트 로드 ✅ **클릭 없이 최신 표시**

**비디오 카드 요소:**
- 제목: "注目AIニューズxx選"
- 썸네일: 이미지
- ref: `eXXXX`
- 날짜: "xx日前" 텍스트

**날짜 패턴:**
- `x日前` → `x일 전`
- `x時間前` → `<x>시간 전`
- `x週間前` → `x주 전`
- `xヶ月前` → `x개월 전`
- `x年前` → `x년 전`

**날짜 체크 구현:**
```
DAYS=`echo "7日前" | grep -o '[0-9]*'` → 7
if [ $DAYS -ge 5 ]; then echo "5일 이상"; fi
``南极
```

### Genspark 요소:

**"AI スライド" 버튼:**
- text: "AI.*Slides"
- ref: `eXXXX`

**"내 テーマプリート" 탭:**
- text: "내 テーマプリート"
- state: `[active]`

**"注目AIニューズ24選" 템플릿:**
- text: "注目AIニューズ24.*"
- ref: `eXXXX`

**"적용" / "Use:"**
- text: "適用" 또는 "Use.*template"

**입력창:**
- placeholder: "슬라이드 요청을 여기에 입력하세요" / "発表テーマと要を入力..." / "発..." / ...
- ref: `eXXX`

---

## 🎓 총정리

**Step 1:** YouTube Videos (`.../videos`) → **5일 체크** ← **최중요!**

**체크:**
- ❌ "注目AIニューズ" 없음 → ⛔ 알림 & 종료
- ❌ 5일 이상 → ⛔ 알림 & 종료
- ✅ **5일 이내** → **Step 2**

**Step 2–7:** Genspark 생성 워크플로우

**완료:**
- ✅ **5일 체크** → YouTube URL → Genspark → 생성
- ❌ **5일 이상** → 종료 → 재수행 (5일 체크)

---

**현재 완료 상태:** ✅ 전체 워크플로우 완료 + **5일 체크 로직 추가** + **YouTube videos URL 접근 (2026-02-08 수정)**