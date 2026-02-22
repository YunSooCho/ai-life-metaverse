#!/bin/bash
echo "--- CPU & RAM ---"
# CPU 사용률 (macOS)
# CPU 사용률 (macOS) - 평균 사용률
CPU_USAGE=$(ps -A -o %cpu | awk '{s+=$1} END {printf "%.1f", s}')
# 코어 수 대략 8개로 나눠서 평균 추정
CPU_AVG=$(echo "scale=1; $CPU_USAGE / 8 / 100" | bc | sed 's/^\./0./')
echo "CPU Usage: ${CPU_AVG}% (total: ${CPU_USAGE}%, 8 cores)"

# RAM 사용률 (macOS)
RAM_STATS=$(vm_stat | perl -ne '/page size of (\d+)/ and $ps=$1; /Pages free:\s+(\d+)/ and $pf=$1; /Pages active:\s+(\d+)/ and $pa=$1; /Pages inactive:\s+(\d+)/ and $pi=$1; /Pages speculative:\s+(\d+)/ and $psp=$1; /Pages wired down:\s+(\d+)/ and $pw=$1; END {printf "%.1fG / %.1fG", (($pa+$pi+$psp+$pw)*$ps)/1073741824, (($pf+$pa+$pi+$psp+$pw)*$ps)/1073741824 }')
echo "RAM Usage: ${RAM_STATS}"

echo "--- GPU ---"
echo "GPU: Not available (Mac mini M-series - System Neural Engine)"