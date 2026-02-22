#!/bin/bash
# NAS transmission 폴더 자동 정리 (FTP 버전)
# Usage: ./auto_cleanup_ftp.sh [max_files]

MAX_FILES=${1:-10}  # 기본 10개 삭제
NAS_HOST="ftp://10.76.29.5"
NAS_USER="clks001"
NAS_PASS="Audqkr18"
TARGET_PATH="/transmission"
MIN_SIZE_MB=4096  # 4GB 이상만 삭제
TEMP_FILE="/tmp/nas_large_files_$$"

echo "=== NAS 자동 정리 시작 (FTP) ==="
echo "최대 삭제 파일 수: ${MAX_FILES}"
echo "타겟: 4GB 이상 파일"
echo "경로: ${TARGET_PATH}"
echo ""

# lftp로 4GB+ 파일 목록 가져오기 (크기 포함)
echo "📍 대상 파일 검색 중..."

# lftp 스크립트로 파일 크기와 경로 찾기
lftp -c "
set ssl:verify-certificate no;
open -u '${NAS_USER}','${NAS_PASS}' ${NAS_HOST};
cls -1R -s --size '${TARGET_PATH}' | awk '\$1 >= ${MIN_SIZE_MB}' | sort -nr > ${TEMP_FILE}
"

if [ ! -s "$TEMP_FILE" ]; then
    echo "❌ 4GB 이상 파일을 찾지 못했습니다."
    rm -f "$TEMP_FILE"
    exit 1
fi

echo "📋 찾은 파일 목록:"
head -20 "$TEMP_FILE"
TOTAL_FILES=$(wc -l < "$TEMP_FILE")
echo ""
echo "총 ${TOTAL_FILES}개 파일 발견"
echo ""

# 삭제 진행
DELETED_COUNT=0
DELETED_SIZE_MB=0

while IFS=' ' read -r size filepath; do
    if [ "$DELETED_COUNT" -ge "$MAX_FILES" ]; then
        echo "⚠️  최대 ${MAX_FILES}개 파일 삭제 완료"
        break
    fi

    echo "🗑️  [$((DELETED_COUNT + 1))] ${filepath} (${size}MB)"

    # 경로 정리 (경로 앞의 './' 제거)
    clean_path="${filepath#./}"
    rm_path="/${TARGET_PATH}/${clean_path}"

    # 삭제 실행
    lftp -c "
set ssl:verify-certificate no;
open -u '${NAS_USER}','${NAS_PASS}' ${NAS_HOST};
rm '${rm_path}'
" 2>&1 | grep -v "cd:"

    if [ $? -eq 0 ]; then
        DELETED_COUNT=$((DELETED_COUNT + 1))
        DELETED_SIZE_MB=$((DELETED_SIZE_MB + size))
        echo "   ✅ 삭제 완료"
    else
        echo "   ❌ 삭제 실패"
    fi

    echo ""
done < "$TEMP_FILE"

# 정리
rm -f "$TEMP_FILE"

# 결과 요약
echo "=== 정리 완료 ==="
echo "삭제 파일 수: ${DELETED_COUNT}"
DELETED_SIZE_GB=$(echo "scale=2; $DELETED_SIZE_MB / 1024" | bc)
echo "총 삭제 용량: ~${DELETED_SIZE_GB}GB"
echo ""
echo "⚠️  중요: NAS 웹 인터페이스(https://10.76.29.5:5001)에서 volume1 사용률 확인 필요"
echo "   사용률이 여전히 90% 이상이면 스크립트를 다시 실행해보세요."