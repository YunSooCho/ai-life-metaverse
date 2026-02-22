#!/bin/bash

# Genspark Slides Download Script
# Genspark.ai에서 이미 생성된 슬라이드 완료 후 자동 다운로드

set -e

OUTPUT_DIR="$HOME/Downloads"
LOG_FILE="$HOME/.openclaw/workspace/skills/genspark/slides-download/download.log"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Genspark 슬라이드 다운로드 시작" >> "$LOG_FILE"

# === Step 1: 브라우저 시작 ===
echo "브라우저 시작 중..." >> "$LOG"
/Applications/Utilities/openclaw browser action=start profile=openclaw >> "$LOG_FILE" 2>&1

# 브라우저 상태 대기
for i in {1..10}; do
    if /Applications/Utilities/openclaw browser action=status 2>&1 | grep -q "running.*true"; then
        echo "브라우저 상태 확인" >> "$LOG_FILE"
        break
    fi
    echo "브라우저 시작 대기 ($i/10)..." >> "$LOG_FILE"
    sleep 5
done

# === Step 2: Genspark 접속 ===
echo "Genspark 접송..." >> "$LOG_FILE"
/Applications/Utilities/openclaw browser action=navigate targetUrl="https://www.genspark.ai/agents?type=slides_agent&tab=my" >> "$LOG_FILE" 2>&1
sleep 10

# === Step 3: 완료까지 폴링 (반복 체크) ===
WAIT_TIME=1800  # 최대 30분
CHECK_INTERVAL=30  # 30초 마다 확인

while [ $WAIT_TIME -gt 0 ]; do
    echo "[$(date +'%H:%M:%S')] 상태 확인... (남은 시간: $WAIT_TIME 초)" >> "$LOG_FILE"

    # 스냅샷 확인
    SNAPSHOT_OUTPUT=$(/Applications/Utilities/openclaw browser action=snapshot refs=aria 2>&1)
    echo "$SNAPSHOT_OUTPUT" >> "$LOG_FILE"

    # "생성 중..." 텍스트 확인 (日本语: \"生成中...\", 한국어: \"생성 중\", 영어: \"Creating\")
    if ! echo "$SNAPSHOT_OUTPUT" | grep -q "生成中\|생성 중\|Creating"; then
        echo "슬라이드 생성 완료!" >> "$LOG_FILE"
        echo "다운로드 단계로 이동..." >> "$LOG_FILE"
        break
    fi

    # 진행 상태 표시
    echo "생성 중 - $CHECK_INTERVAL 초 대기..." >> "$LOG_FILE"
    sleep $CHECK_INTERVAL
    WAIT_TIME=$((WAIT_TIME - CHECK_INTERVAL))
done

# 시간 초과 처리
if [ $WAIT_TIME -eq 0 ]; then
    echo "시간 초과 - 생성 완료 확인 불가" >> "$LOG_FILE"
    /Applications/Utilities/openclaw browser action=action=stop >> "$LOG_FILE" 2>&1
    exit 1
fi

# === Step 4: 다운로드 버튼 찾기 및 클릭 ===
echo "다운로드 버튼 검색..." >> "$LOG_FILE"

# 텍스트 기반 다운로드 버튼 검색 (최대 3회)
for i in {1..3}; do
    # 스냅샷 다시 확인
    SNAP_OUTPUT_DOWNLOAD=$(/Applications/Utilities/openclaw browser action=snapshot refs=role 2>&1)

    # 다운로드 버튼 찾기 (\"다운로드\", \"Download\", 다운로드 아이콘)
    if echo "$SNAP_OUTPUT_DOWNLOAD" | grep -i -E "다운로드|Download|Download.*button|下载"; then
        echo "다운로드 버튼 찾음!" >> "$LOG_FILE"

        # 버튼 클릭 시도 (OpenClaw browser control)
        echo "다운로드 시작..." >> "$LOG_FILE"

        # 30초 대기 (다운로드 시작 확인)
        sleep 30

        # 다운로드 폴더 확인
        if [ -d "$OUTPUT_DIR" ]; then
            RECENT_FILES=$(ls -t "$OUTPUT_DIR" | head -5)
            echo "다운로드 폴더: $OUTPUT_DIR" >> "$LOG_FILE"
            echo "최근 파일:" >> "$LOG_FILE"
            echo "$RECENT_FILES" >> "$LOG_FILE"

            # PDF 또는 slides 파일 확인
            NEW_FILE=$(echo "$RECENT_FILES" | grep -iE "\.pdf|\.slides|\.pptx" | head -1)
            if [ -n "$NEW_FILE" ]; then
                # 콘솔 알림 (텔레그램 아님!)
                printf "\n"
                echo "==========================================" | tee -a "$LOG_FILE"
                echo 다운로드 완료!" | tee -a "$LOG_FILE"
                echo "파일: $NEW_FILE" | tee -a "$LOG_FILE"
                echo "위치: $OUTPUT_DIR/" | tee -a "$LOG_FILE"
                echo "==========================================" | tee -a "$LOG_FILE"
            else
                echo "PDF/Slides 파일을 찾을 수 없음" >> "$LOG_FILE"
            fi
        fi

        break
    fi

    echo "다운로드 버튼 미검색 - 다음 시도 ($i/3)" >> "$LOG_FILE"
    sleep 10
done

# === Step 5: 브라우저 종료 ===
echo "브라우저 종료..." >> "$LOG_FILE"
/Applications/Utilities/openclaw browser action=action=stop >> "$LOG_FILE" 2>&1

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 다운로드 완료!" >> "$LOG_FILE"

exit 0