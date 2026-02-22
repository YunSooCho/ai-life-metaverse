#!/bin/bash
# NAS transmission 폴더 큰 파일 삭제 (자동)
# Usage: ./cleanup_largest.sh <file_path_or_folder>

NAS_HOST="10.76.29.5"
NAS_USER="clks001"
NAS_PASS="Audqkr18"
TARGET_PATH="/volume1/homes/clks001/transmission"

if [ -z "$1" ]; then
    echo "사용법: ./cleanup_largest.sh <file_path_or_folder>"
    echo "예: ./cleanup_largest.sh /volume1/homes/clks001/transmission/uncensored-HD"
    echo "예: ./cleanup_largest.sh /volume1/homes/clks001/transmission/video.mp4"
    exit 1
fi

TARGET="$1"

# 경로 보안 검사 - /volume1/homes/clks001/transmission로 시작하는지 확인
if [[ "$TARGET" != "/volume1/homes/clks001/transmission"* ]]; then
    echo "❌ 오류: /volume1/homes/clks001/transmission 외의 경로를 삭제할 수 없습니다!"
    echo "   입력 경로: $TARGET"
    echo "   허용된 접두사: /volume1/homes/clks001/transmission"
    exit 1
fi

# 추가 보안 - volume2 포함 여부 체크
if [[ "$TARGET" == *"/volume2"* ]]; then
    echo "❌ 오류: volume2는 보호되어 있으며 삭제할 수 없습니다!"
    exit 1
fi

echo "=== 삭제 정보 ==="
echo "Target: $TARGET"
echo ""

# 파일/폴더 정보 확인
FILE_TYPE=$(sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "test -d '$TARGET' && echo 'folder' || echo 'file'")

if [ "$FILE_TYPE" = "folder" ]; then
    echo "📁 폴더 삭제"
    echo "폴더 크기:"
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "du -sh '$TARGET'"
    echo ""
    echo "폴더 내용 (Top 5):"
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "du -sh '$TARGET'/* 2>/dev/null | sort -hr | head -5" | nl
else
    echo "📄 파일 삭제"
    echo "파일 크기:"
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "du -h '$TARGET'"
fi

echo ""
echo "🚀 삭제 실행 중..."

if [ "$FILE_TYPE" = "folder" ]; then
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "rm -rf '$TARGET'"
else
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "rm -f '$TARGET'"
fi

if [ $? -eq 0 ]; then
    echo "✅ 삭제 완료"
    echo ""
    echo "삭제 후 용량 (volume1):"
    sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "df -h | grep volume1"
else
    echo "❌ 삭제 실패"
    exit 1
fi

echo ""
echo "=== 완료 ==="