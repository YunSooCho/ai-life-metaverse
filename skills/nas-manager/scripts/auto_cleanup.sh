#!/bin/bash
# NAS transmission 폴더 자동 정리 (volume1 90% 미만 될 때까지)
# Usage: ./auto_cleanup.sh

NAS_HOST="10.76.29.5"
NAS_USER="clks001"
NAS_PASS="Audqkr18"
TARGET_PATH="/volume1/homes/clks001/transmission"
TARGET_USAGE=90  # 목표: 90% 미만
MIN_SIZE_MB=4096  # 4GB 이상만 삭제

echo "=== NAS 자동 정리 시작 ==="
echo "목표: volume1 사용률 ${TARGET_USAGE}% 미만"
echo "타겟 파일: 4GB 이상"
echo "보호 폴더: volume2 (삭제하지 않음)"
echo ""

# 현재 사용률 확인
get_usage() {
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "df -h /volume1" | grep /volume1 | awk '{print $5}' | tr -d '%'
}

CURRENT_USAGE=$(get_usage)
echo "현재 volume1 사용률: ${CURRENT_USAGE}%"

if [ "$CURRENT_USAGE" -lt "$TARGET_USAGE" ]; then
    echo ""
    echo "✅ 사용률이 ${TARGET_USAGE}% 미만입니다. 정리할 필요 없음."
    echo "=== 종료 ==="
    exit 0
fi

echo "⚠️  사용률이 ${TARGET_USAGE}% 이상입니다. 정리 시작합니다!"
echo ""

# 총 삭제 용량 추적
DELETED_SIZE=0
DELETED_COUNT=0

# 큰 파일 찾기 (반복 루프)
while true; do
    CURRENT_USAGE=$(get_usage)
    echo ""
    echo "현재 사용률: ${CURRENT_USAGE}% (목표: ${TARGET_USAGE}% 미만)"

    if [ "$CURRENT_USAGE" -lt "$TARGET_USAGE" ]; then
        echo ""
        echo "✅ 목표 도달! volume1 사용률 ${CURRENT_USAGE}%"
        break
    fi

    # 4GB+ 파일 찾기 (큰 것 하나)
    NEXT_FILE=$(sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "find $TARGET_PATH -type f -size +${MIN_SIZE_MB}M -exec du -h {} + 2>/dev/null | sort -hr | head -1")

    if [ -z "$NEXT_FILE" ]; then
        echo ""
        echo "⚠️  더 이상 삭제할 4GB+ 파일이 없습니다."
        break
    fi

    # 파일 경로 추출 (du 출력: Size Path)
    FILE_PATH=$(echo "$NEXT_FILE" | awk '{print $2}')
    FILE_SIZE_TEXT=$(echo "$NEXT_FILE" | awk '{print $1}')

    # 경로 보안 검사
    if [[ "$FILE_PATH" != "/volume1/homes/clks001/transmission"* ]]; then
        echo "❌ 경로 오류: $FILE_PATH ( /volume1/homes/clks001/transmission 외 경로 )"
        break
    fi

    if [[ "$FILE_PATH" == *"/volume2"* ]]; then
        echo "❌ 보호된 경로: $FILE_PATH (volume2)"
        break
    fi

    echo ""
    echo "🗑️  다음 삭제 대상:"
    echo "   파일: $FILE_PATH"
    echo "   크기: $FILE_SIZE_TEXT"

    # 용량 숫자 변환 (텍스트 → MB)
    FILE_SIZE_MB=$(echo "$FILE_SIZE_TEXT" | grep -oE '[0-9.]+[GT]' | sed 's/G/*1024/;s/T/*1024*1024/;s/M//' | bc 2>/dev/null || echo "1024")

    # 삭제 실행
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "rm -f '$FILE_PATH'"

    if [ $? -eq 0 ]; then
        DELETED_COUNT=$((DELETED_COUNT + 1))
        DELETED_SIZE=$((DELETED_SIZE + FILE_SIZE_MB))
        echo "   ✅ 삭제 완료"
    else
        echo "   ❌ 삭제 실패"
        break
    fi
done

echo ""
echo "=== 정리 완료 ==="
echo "삭제 파일 수: ${DELETED_COUNT}"
echo "총 삭제 용량: ~$(echo "scale=1; $DELETED_SIZE / 1024" | bc)GB"
echo "최종 사용률: $(get_usage)%"
echo ""
echo "volume1 현재 상태:"
sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "df -h /volume1"