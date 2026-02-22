#!/bin/bash
# NAS volume1 용량 체크 스크립트
# Usage: ./check_capacity.sh

NAS_HOST="10.76.29.5"
NAS_USER="clks001"
NAS_PASS="Audqkr18"
TARGET_PATH="/volume1/homes/clks001/transmission"

echo "=== NAS Volume 1 용량 체크 ==="
echo ""

sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "df -h /volume1"

echo ""
echo "=== transmission 폴더 크기 ==="
echo ""

sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "du -sh $TARGET_PATH"

echo ""
echo "=== 사용률 상위 폴더 (Top 10) ==="
echo ""

sshpass -p "$NAS_PASS" ssh -o StrictHostKeyChecking=no "$NAS_USER@$NAS_HOST" "du -sh $TARGET_PATH/*/ 2>/dev/null | sort -hr | head -10" | nl

echo ""
echo "=== 완료 ==="