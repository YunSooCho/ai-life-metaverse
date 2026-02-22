#!/bin/bash

# Genspark Slides Creation Script
# YouTube "いけともch" → 최신 "注目AIニュース" (5일 체크) → Genspark 슬라이드 생성

set -e

# ===== 변수 =====
YOUTUBE_CHANNEL="https://www.youtube.com/@iketomo-ch"
SEARCH_KEYWORD="注目AIニュース"
GENSPARK_URL="https://www.genspark.ai/"
TEMPLATE_NAME="注目AIニュース24選"
PROMPT="1ページ1ニューズになるように日本語で作成"
LOG_FILE="$HOME/.openclaw/workspace/skills/genspark-slides-create/create.log"
TELEGRAM_USER_ID="8129283040"
VIDEO_URL=""

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Genspark 슬라이드 생성 시작" >> "$LOG_FILE"

# ===== Step 0: 브라우저 시작 =====
echo "Step 0: 브라우저 시작 중..." >> "$LOG_FILE"
/Applications/Utilities/openclaw browser action=start profile=openclaw >> "$LOG_FILE" 2>&1

# 브라우저 상태 대기
for i in {1..10}; do
    if /Applications/Utilities/openclaw browser action=status 2>&1 | grep -q "running.*true"; then
        echo "브라우저 시작 완료" >> "$LOG_FILE"
        break
    fi
    echo "브라우저 시작 대기 ($i/10)..." >> "$LOG_FILE"
    sleep 5
done

# ===== Step 0.5: YouTube 채널 접속 =====
echo "Step 0.5: YouTube 채널 접속 중..." >> "$LOG_FILE"
/Applications/Utilities/Utilities/openclaw browser action=navigate targetUrl="$YOUTUBE_CHANNEL" >> "$LOG_FILE" 2>&1
sleep 10

# ===== Step 0.6: "動画" 탭 클릭 =====
echo "Step 0.6: '動画' 탭 클릭 중..." >> "$LOG_FILE"

SNAPSHOT_OUTPUT=$(/Applications/Utilities/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"

# "動画" 탭 ref 찾기
VIDEOS_TAB_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -iE '"動画"' -B 2 -A 2 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)

if [ -z "$VIDEOS_TAB_REF" ]; then
    # 대안: "動画" 텍스트가 있는 tab 찾기
    VIDEOS_TAB_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -A 3 'tab' | grep -E '"動.*画"' -A 3 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)
fi

if [ -n "$VIDEOS_TAB_REF" ]; then
    echo "'動画' 탭 찾음: $VIDEOS_TAB_REF" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=act request='{"kind": "click", "ref": "'"$VIDEOS_TAB_REF"'"}' >> "$LOG_FILE" 2>&1
    sleep 10
    echo "'動画' 탭 전환 완료" >> "$LOG_FILE"
else
    echo "⚠️ '動画' 탭 찾지 못함, 현재 화면 사용" >> "$LOG_FILE"
fi

# ===== Step 1: 5일 체크 - 최신 "注目AIニュース" 찾기 =====
echo "Step 1: 5일 체크 - '$SEARCH_KEYWORD' 비디오 검색..." >> "$LOG_FILE"

# 3회 반복 검색
VIDEO_REF=""
SEARCH_ATTEMPTS=3

for attempt in $(seq 1 $SEARCH_ATTEMPTS); do
    # 스냅샷 확인
    SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
    echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"

    # "注目AIニュース" 텍스트 검색
    if echo "$SNAPSHOT_OUTPUT" | grep -q "$SEARCH_KEYWORD"; then
        echo "'$SEARCH_KEYWORD' 찾음! (시도 $attempt)" >> "$LOG_FILE"

        # 첫 번째 비디오 카드 ref 찾기
        VIDEO_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -o 'videoId.*href=.*watch' -m 1 | grep -o '"/watch[^"]*"' | head -1 | tr -d '"')

        if [ -z "$VIDEO_REF" ]; then
            # 대안: role="video"인 element
            VIDEO_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -A 10 'role="video"' -m 1 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)
        fi

        if [ -n "$VIDEO_REF" ]; then
            echo "비디오 ref 찾음: $VIDEO_REF" >> "$LOG_FILE"
            break
        fi
    else
        echo "'$SEARCH_KEYWORD' 미검색 ($attempt/$SEARCH_ATTEMPTS)" >> "$LOG_FILE"
    fi

    sleep 5
done

# 비디오가 없으면 텔레그램 알림 후 종료
if [ -z "$VIDEO_REF" ]; then
    echo "⚠️  5일 이내에 '$SEARCH_KEYWORD' 비디오 없음!" >> "$LOG_FILE"
    
    # 텔레그램 알림
    echo "텔레그램 알림 전송 중..." >> "$LOG_FILE"
    /Applications/Utilities/openclaw message action=send channel=telegram to="$TELEGRAM_USER_ID" message="📢 Genspark 슬라이드 생성

⚠️  동영상이 아직 없습니다

최근 5일 이내에 '注目AIニュース' 비디오가 없습니다.
나중에 다시 시도해주세요." >> "$LOG_FILE" 2>&1
    
    echo "알림 전송 완료" >> "$LOG_FILE"
    
    # 브라우저 종료
    echo "브라우저 종료 중..." >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=stop >> "$LOG_FILE" 2>&1
    
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 종료 - 비디오 없음" >> "$LOG_FILE"
    exit 0
fi

# ===== Step 2: 비디오 클릭 및 날짜 확인 =====
echo "Step 2: 비디오 클릭 중..." >> "$LOG_FILE"
/Applications/Utilities/openclaw browser action=act request='{"kind": "click", "ref": "'"$VIDEO_REF"'"}' >> "$LOG_FILE" 2>&1
sleep 10

# 5일 체크: 업로드 날짜 확인
echo "Step 2.5: 업로드 날짜 확인 (5일 체크)..." >> "$LOG_FILE"

CHECK_ATTEMPTS=3
VIDEO_WITHIN_5_DAYS=false

for attempt in $(seq 1 $CHECK_ATTEMPTS); do
    SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
    echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"
    
    # 날짜 텍스트 추출 (일본어/영어)
    DATE_TEXT=$(echo "$SNAPSHOT_OUTPUT" | grep -oE '[0-9]+日前|[0-9]+ day[s]? ago|[0-9]+ week[s]? ago|[0-9]+ヶ月前|202[0-9]-[0-9]{2}-[0-9]{2}' -m 1)
    
    if [ -n "$DATE_TEXT" ]; then
        echo "날짜 텍스트: $DATE_TEXT" >> "$LOG_FILE"
        
        # 5일 이내인지 체크
        if echo "$DATE_TEXT" | grep -qE '^[0-4]日前|^[0-4] day[s]? ago|^[0-4]ヶ月前'; then
            VIDEO_WITHIN_5_DAYS=true
            echo "✅ 5일 이내 비디오 확인!" >> "$LOG_FILE"
            break
        else
            echo "⚠️  5일 이상 지난 비디오: $DATE_TEXT" >> "$LOG_FILE"
        fi
    fi
    
    sleep 3
done

# 5일 이내에 없으면 텔레그램 알림 후 종료
if [ "$VIDEO_WITHIN_5_DAYS" == false ]; then
    echo "⚠️  비디오가 5일 이상 전에 업로드됨!" >> "$LOG_FILE"
    
    # 텔레그램 알림
    /Applications/Utilities/openclaw message action=send channel=telegram to="$TELEGRAM_USER_ID" message="📢 Genspark 슬라이드 생성

⚠️  동영상이 아직 없습니다

최근 비디오가 5일 이상 전에 업로드되었습니다.
새로운 '注目AIニュース'를 기다려주세요." >> "$LOG_FILE" 2>&1
    
    echo "알림 전송 완료" >> "$LOG_FILE"
    
    # 브라우저 종료
    /Applications/Utilities/openclaw browser action=stop >> "$LOG_FILE" 2>&1
    
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 종료 - 5일 이상 전 비디오" >> "$LOG_FILE"
    exit 0
fi

# ===== Step 3: YouTube URL 추출 =====
echo "Step 3: YouTube URL 추출 중..." >> "$LOG_FILE"

for i in {1..5}; do
    # 브라우저 URL 가져오기
    SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot 2>&1)
    BROWSER_URL=$(echo "$SNAPSHOT_OUTPUT" | grep -o 'url:"[^"]*"' | cut -d: -f2 | tr -d '"')

    if [ -n "$BROWSER_URL" ]; then
        # v= parameter 추출
        VIDEO_ID=$(echo "$BROWSER_URL" | grep -o 'v=[^&]*' | cut -d= -f2 | head -1)
        
        if [ -n "$VIDEO_ID" ]; then
            VIDEO_URL="https://www.youtube.com/watch?v=$VIDEO_ID"
            echo "비디오 ID: $VIDEO_ID" >> "$LOG_FILE"
            echo "비디오 URL: $VIDEO_URL" >> "$LOG_FILE"
            break
        fi
    fi

    sleep 3
done

if [ -z "$VIDEO_URL" ]; then
    echo "❌ 비디오 URL 추출 실패!" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=stop >> "$LOG_FILE" 2>&1
    exit 1
fi

# ===== Step 4: Genspark 접속 =====
echo "Step 4: Genspark 접속 중..." >> "$LOG_FILE"
/Applications/Utilities/openclaw browser action=navigate targetUrl="$GENSPARK_URL" >> "$LOG_FILE" 2>&1
sleep 10

# ===== Step 5: "AI 슬라이드" 클릭 =====
echo "Step 5: 'AI 슬라이드' 찾는 중..." >> "$LOG_FILE"

SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"

# "AI 슬라이드" 또는 "AI Slides" 버튼 찾기
AI_SLIDES_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -iE 'AI.*Slides|AI.*スライド' -A 5 -m 1 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)

if [ -z "$AI_SLIDES_REF" ]; then
    AI_SLIDES_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -o 'ref="[^"]*"' | head -5 | grep -o 'ref="[^"]*"' | cut -d'"' -f2 | head -1)
fi

if [ -n "$AI_SLIDES_REF" ]; then
    echo "'AI 슬라이드' 버튼 찾음: $AI_SLIDES_REF" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=act request='{"kind": "click", "ref": "'"$AI_SLIDES_REF"'"}' >> "$LOG_FILE" 2>&1
    sleep 5
else
    echo "❌ 'AI 슬라이드' 버튼 찾지 못함!" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=stop >> "$LOG_FILE" 2>&1
    exit 1
fi

# ===== Step 6: 새 탭으로 전환 =====
echo "Step 6: 새 탭으로 전환 중..." >> "$LOG_FILE"

# 탭 목록 확인
TABS_INFO=$(/Applications/Utilities/openclaw browser action=tabs 2>&1)
echo "$TABS_INFO" >> "$LOG_FILE"

# 첫 번째 "page" 탭 전환
SLIDES_TAB=$(echo "$TABS_INFO" | grep -A 2 '"type": "page"' -m 1 | grep -o '"targetId": *"[^"]*"' | cut -d: -f2 | tr -d '" ' | head -1)

if [ -n "$SLIDES_TAB" ]; then
    echo "탭 전환: $SLIDES_TAB" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=focus targetId="$SLIDES_TAB" >> "$LOG_FILE" 2>&1
    sleep 5
else
    echo "⚠️  탭 찾지 못함, 현재 탭 사용" >> "$LOG_FILE"
fi

# ===== Step 7: "내 템플릿" → "注目AIニュース24選" 찾기 =====
echo "Step 7: 템플릿 '$TEMPLATE_NAME' 찾는 중..." >> "$LOG_FILE"

SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"

TEMPLATE_REF=""
TEMPLATE_ATTEMPTS=3

for attempt in $(seq 1 $TEMPLATE_ATTEMPTS); do
    SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
    
    # 템플릿 텍스트 검색
    TEMPLATE_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -E "$TEMPLATE_NAME" -A 10 -m 1 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)
    
    if [ -n "$TEMPLATE_REF" ]; then
        echo "템플릿 찾음: $TEMPLATE_REF (시도 $attempt)" >> "$LOG_FILE"
        break
    fi
    
    sleep 5
done

if [ -z "$TEMPLATE_REF" ]; then
    echo "❌ 템플릿 찾기 실패!" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=stop >> "$LOG_FILE" 2>&1
    exit 1
fi

# 템플릿 클릭
echo "템플릿 클릭 중..." >> "$LOG_FILE"
/Applications/Utilities/openclaw browser action=act request='{"kind": "click", "ref": "'"$TEMPLATE_REF"'"}' >> "$LOG_FILE" 2>&1
sleep 5

# ===== Step 8: "이 템플릿 사용하기" 버튼 클릭 =====
echo "Step 8: '이 템플릿 사용하기' 버튼 찾는 중..." >> "$LOG_FILE"

SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"

# 버튼 찾기 (한국어/영어/일본어)
APPLY_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -iE '이.*템플릿.*사용하기|Use.*template|適用' -A 5 -m 1 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)

if [ -z "$APPLY_REF" ]; then
    APPLY_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -iE 'button' -A 3 -m 1 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)
fi

if [ -n "$APPLY_REF" ]; then
    echo "버튼 찾음: $APPLY_REF" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=act request='{"kind": "click", "ref": "'"$APPLY_REF"'"}' >> "$LOG_FILE" 2>&1
    sleep 3
else
    echo "⚠️  버튼 찾지 못함, 기본 입력창으로 진행" >> "$LOG_FILE"
fi

# ===== Step 9: YouTube URL + 프롬프트 입력 =====
echo "Step 9: 프롬프트 입력 중..." >> "$LOG_FILE"

SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"

# 입력창 ref 찾기
INPUT_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -iE 'textbox|textarea|input.*type.*text' -A 3 -m 1 | grep -o 'ref="[^"]*"' -m 1 | cut -d'"' -f2 | head -1)

if [ -z "$INPUT_REF" ]; then
    INPUT_REF=$(echo "$SNAPSHOT_OUTPUT" | grep -o 'ref="[^"]*"' | head -5 | grep -o 'ref="[^"]*"' | cut -d'"' -f2 | head -1)
fi

if [ -n "$INPUT_REF" ]; then
    # YouTube URL + 일본어 프롬프트 입력
    echo "입력: YouTube URL + 프롬프트" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=act request='{"kind": "type", "ref": "'"$INPUT_REF"'", "text": "'"$VIDEO_URL"'\n\n'"$PROMPT"'"}' >> "$LOG_FILE" 2>&1
    sleep 5
    
    # Enter 전송
    echo "Enter 전송 중..." >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=act inputRef="$INPUT_REF" request='{"kind": "press", "key": "Enter"}' >> "$LOG_FILE" 2>&1
    sleep 3
else
    echo "❌ 입력창 찾지 못함!" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=stop >> "$LOG_FILE" 2>&1
    exit 1
fi

# ===== Step 10: 생성 완료 확인 =====
echo "Step 10: 생성 완료 확인 중..." >> "$LOG_FILE"

COMPLETED_FOUND=false
for i in {1..3}; do
    SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
    echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"
    
    if ! echo "$SNAPSHOT_OUTPUT" | grep -qE '生成中|Creating|Generating'; then
        COMPLETED_FOUND=true
        break
    fi
    
    sleep 10
done

if [ "$COMPLETED_FOUND" == true ]; then
    echo "✅ 슬라이드 생성 완료!" >> "$LOG_FILE"
else
    echo "⏳ 생성 중 - 최대 3회 확인 완료" >> "$LOG_FILE"
fi

# ===== Step 11: 완료 알림 (콘솔) =====
echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "✅ 완료 상태" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "- YouTube URL: $VIDEO_URL" >> "$LOG_FILE"
echo "- 템플릿: \"$TEMPLATE_NAME\"" >> "$LOG_FILE"
echo "- 일본어 프롬프트: \"$PROMPT\"" >> "$LOG_FILE"
echo "- 상태: 생성 완료 (Genspark에 저장됨)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "💡 다운로드: 'genspark-slides-download' 스킬 사용하세요" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# ===== Step 12: 브라우저 종료 =====
echo "브라우저 종료 중..." >> "$LOG_FILE"
/Applications/Utilities/openclaw browser action=stop >> "$LOG_FILE" 2>&1

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 슬라이드 생성 완료!" >> "$LOG_FILE"

exit 0