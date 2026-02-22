#!/bin/bash
# NAS transmission 폴더에서 큰 파일 찾기
# Usage: ./find_large_files.sh [size_min_mb]
# Default: Finds files >= 4096MB (4GB)

NAS_HOST="10.76.29.5"
NAS_USER="clks001"
NAS_PASS="Audqkr18"
TARGET_PATH="/volume1/homes/clks001/transmission"

SIZE_MIN_MB=${1:-4096}  # Default 4GB (4096MB)

echo "=== /volume1/homes/clks001/transmission 큰 파일 검색 (>= ${SIZE_MIN_MB}MB = $((SIZE_MIN_MB / 1024))GB) ==="
echo ""

sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "find $TARGET_PATH -type f -size +${SIZE_MIN_MB}M -exec du -h {} + 2>/dev/null | sort -hr | head -50" | nl

echo ""
echo "=== 10GB+ 파일 ==="
echo ""

sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "find $TARGET_PATH -type f -size +10240M -exec du -h {} + 2>/dev/null | sort -hr | head -20" | nl

echo ""
echo "=== uncensored-HD 폴더 ==="
echo ""

sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "du -sh $TARGET_PATH/uncensored-HD 2>/dev/null | head -5" && echo "uncensored-HD 폴더들:" || echo "uncensored-HD 없음"

echo ""
echo "=== 완료 ==="