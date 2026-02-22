---
name: nas-manager
description: NAS storage capacity check and cleanup for volume1 /home/transmission. Delete large files to free space. Volume2 is protected. Use when checking disk usage, cleaning up transmission folder, or deleting large files.
---

# NAS Manager

## Overview

jiyuNas (10.76.29.5) volume1의 /home/transmission 폴더를 타겟으로 용량 체크 및 파일 정리를 수행합니다. 큰 파일 (GB 단위) 위주로 정리하여 여유 공간을 확보합니다. volume2는 중요한 파일이 포함되어 있으므로 절대 건드리지 않습니다.

## Connection Details

**NAS (jiyuNas):**
- IP: 10.76.29.5
- SSH Port: 22
- Username: clks001
- Password: Audqkr18
- Target: volume1 → /volume1/homes/clks001/transmission

**SSH Tool:**
- Required: `sshpass` (installed via brew)
- Command: `sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5`

## Workflow

### 1. 용량 체크 (Check Capacity)

SSH 접속하여 transmission 폴더 및 볼륨 정보 확인:

```bash
sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5 "df -h | grep volume1"
sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5 "du -sh /volume1/homes/clks001/transmission"
```

출력 예시:
```
/dev/vg1000/lv  3.5T  3.4T  152G  96% /volume1
3.2T    /home/transmission
```

### 2. 큰 파일 찾기 (Find Large Files)

/volume1/homes/clks001/transmission 폴더에서 4GB 이상 파일 목록 (크기순 정렬):

```bash
sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5 "find /volume1/homes/clks001/transmission -type f -size +4096M -exec du -h {} + | sort -hr | head -50"
```

대상: 4GB 이상 파일 (특히 큰 것 위주)

참고: 4GB 미만은 용량 효율이 낮아서 타겟에서 제외

### 3. 삭제 후보 목록 생성 (Generate Cleanup List)

삭제 우선순위 (높은 순):

1. **uncensored-HD 폴더 전체** (일반적으로 용량 큼)
2. **1GB+ 개별 파일** (크기순 정렬)
3. **3개월+ 오래된 파일**

uncensored-HD 폴더 확인:

```bash
sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5 "ls -lh /volume1/homes/clks001/transmission/ | grep -i uncensored-hd"
```

### 4. 삭제 실행 (Execute Deletion)

경로 검증 완료 후 SSH로 직접 삭제 (YES 승인 없음):

```bash
sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5 "rm -f /volume1/homes/clks001/transmission/video.mp4"
sshpass -p 'Audqkr18' ssh -o StrictHostKeyChecking=no clks001@10.76.29.5 "rm -rf /volume1/homes/clks001/transmission/uncensored-HD/"
```

### 4-1. 자동 정리 (Auto Cleanup to 90%)

volume1 사용률이 90% 미만 될 때까지 4GB+ 파일 자동 삭제:

```bash
./auto_cleanup.sh
```

**작동 과정:**
1. 현재 volume1 사용률 확인 (`df -h /volume1`)
2. 90% 이상이면 정리 시작
3. 4GB+ 파일 크기순으로 찾기
4. 가장 큰 파일부터 하나씩 삭제
5. 삭제 후 사용률 재확인
6. 90% 미만 도달 시 자동 종료
7. 4GB+ 파일 없으면 종료

**추적 정보:**
- 현재 사용률 vs 목표 (90% 미만)
- 삭제 파일 수
- 총 삭제 용량 (GB)
- 최종 사용률
```

**⚠️ 경고:**
- `rm -rf` 명령은 되돌릴 수 없음
- **반드시** 사용자 승인 후 실행
- volume2 절대 건드리지 않음 (경로 명확히 /home/transmission으로)
- 전체 경로 지정 실수 방지 (절대 경로 사용)

## Safety Guidelines

1. **특정 폴더 타겟:** /home/transmission만 타겟 (절대 경로 검증 필수)
2. **volume2 보호:** 모든 명령어 절대 경로 `/home/transmission` 사용
3. **경로 검증:** 스크립트에서 경로 접두사 확인 (/home/transmission 외 차단)
4. **자동 삭제:** YES 승인 없음 (경로 검증 후 직접 삭제)
5. **4GB+ 타겟:** 작은 파일은 삭제 효율 낮음 → 4GB+만 대상
6. **복구 불가:** 삭제는 되돌릴 수 없음 - 주의 필요

## Cleanup Strategy

**높은 우선순위 (좋은 정리 대상):**
- 4GB+ 단일 파일 (크기순 삭제 → 용량 효율 높음)
- uncensored-HD 폴더 (일반적으로 재다운 가능)
- 10GB+ 컬렉션 폴더
- FC2-PPV 대용량 파일들 (4GB+)

**낮은 우선순위 (주의 필요):**
- 4GB 미만 파일 삭제 비효율
- 최근 다운로드 (7일 이내)
- 사용자 명시 요청 파일들

## Volume Information

**volume1 (타겟):** 3.5 TB 총량, 현재 3.4T 사용 (96%) → **정리 필요**
**volume2 (보호):** 3.5 TB 총량, 중요 파일 포함, **건드리지 않음**

## Scripts Available

- `check_capacity.sh`: volume1 용량 및 transmission 폴더 크기 체크
- `find_large_files.sh`: 큰 파일 목록 생성 (100MB+)
- `cleanup_largest.sh`: 사용자 승인 후 큰 파일 삭제
- `backup_check.sh`: 삭제 전 복구 여부 확인 (선택)

자세한 사용법은 각 스크립트를 참조하세요.