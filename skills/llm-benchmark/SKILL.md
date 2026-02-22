---
name: llm-benchmark
description: LLM benchmark data from Artificial Analysis for performance comparisons and rankings. Use when checking latest LLM performance, searching specific model scores, comparing model performance, or analyzing benchmark trends. Supports GPT/Claude/Gemini/DeepSeek/Chinese models.
---

# LLM Benchmark

## Overview

Artificial Analysis에서 독립적으로 측정한 LLM 벤치마크 데이터를 가져와 최신 성능 순위와 모델 비교를 제공하는 스킬입니다. Intelligence Index v4.0 기준으로 10개의 평가(GDPval-AA, τ²-Bench Telecom, Terminal-Bench Hard, SciCode, AA-LCR, AA-Omniscience, IFBench, Humanity's Last Exam, GPQA Diamond, CritPt)를 통합한 점수를 제공합니다.

## Quick Start

**기본 사용: 실시간 데이터 가져오기**
```
web_fetch로 https://artificialanalysis.ai에서 데이터 가져오기
→ JSON 형식 벤치마크 데이터 추출
→ 모델별 Intelligence Index 정렬
→ TOP N 리스트 표시
```

## Workflows

### 1. 최신 성능 순위 확인 (TOP N 사용자 요청)

데이터 가져오기:
```
web_fetch(url='https://artificialanalysis.ai', extractMode='text', maxChars=20000)
```

JSON 데이터 추출 (페이지 내의 schema.org Dataset 데이터):
```python
# Web Fetch 결과에서 JSON-LD 데이터셋 찾기
# modelName, intelligenceIndex, detailsUrl, isLabClaimedValue 필드 추출
```

성능 순위 정렬 및 표시:
- intelligenceIndex 기준 내림차순
- 사용자 요청 N개 (기본 TOP 20)
- **비주얼 테이블 형식**:
  ```
  🏆 LLM 성능 순위 (TOP N)
  ════════════════════════════════════════════
  
  🥇 #1   GPT-5.2 (xhigh)          51.24 ━━━━━━━━━━━━━━━━━━ 100%
  🥈 #2   Claude Opus 4.5          49.69 ━━━━━━━━━━━━━━━━━━  97%
  🥉 #3   GPT-5.2 Codex            48.98 ━━━━━━━━━━━━━━━━━━  96%
    #4   Gemini 3 Pro (high)       48.44 ━━━━━━━━━━━━━━━━   95%
    #5   GPT-5.1 (high)            47.56 ━━━━━━━━━━━━━━━━   93%
  ...
  
  🏷️ 범례: 🟢 OpenAI | 💜 Anthropic | 🔵 Google | 🟡 DeepSeek | ⚪ 기타
  ```

비주얼 요소:
- 순위 뱃지: 🥇🥈🥉 (TOP 3), #N (일반)
- 점수 바: 실제 점수 비율로 시각화
- 제조사 이모지: OpenAI(🟢), Anthropic(💜), Google(🔵), DeepSeek(🟡), 기타(⚪)
- 테이블 밑줄로 그룹 구분

### 2. 특정 모델 검색

검색 방법:
```
1. 전체 데이터 가져오기 (Workflow 1)
2. 모델 이름 필터링 (대소문자 구분 없이)
3. 해당 모델의 순위와 점수 표시
```

**비주얼 출력 예시:**
```
🔍 Claude Opus 4.5 검색 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💜 Anthropic

  🥈 #2   Claude Opus 4.5 (thinking)    49.69점
  
  성능 분석:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  97% (TOP 2)
  
  💡 평가: 최고 성능 모델 그룹, OpenAI GPT-5.2에 근접
```

사용 예시:
- "Claude Opus 4.5 점수는?"
- "GPT-5.2 몇 위?"
- "DeepSeek 성능 확인"

### 3. 카테고리별 모델 비교

카테고리 분류 기준:
- OpenAI: GPT-5.x, GPT-5 mini, GPT-4.x, o1, o3 (🟢)
- Anthropic: Claude Opus, Claude Sonnet, Claude Haiku (💜)
- Google: Gemini 3.x, Gemini 2.5.x, Gemini 2.0.x (🔵)
- DeepSeek: DeepSeek V3.x, DeepSeek R1 (🟡)
- 기타: GLM, Qwen, Grok, Kimi 등 (⚪)

비교 방법:
```
1. 전체 데이터 가져오기
2. 카테고리별 필터링
3. 카테고리 내에서 평균 점수 및 최고/최저 모델 표시
```

**비주얼 출력 예시:**
```
📊 제조사별 LLM 성능 비교
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 OpenAI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  최고: GPT-5.2 (xhigh)         51.24 🥇
  평균: 38.5점
  모델수: 8개

💜 Anthropic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  최고: Claude Opus 4.5          49.69 🥈
  평균: 34.2점
  모델수: 6개
  
🔵 Google
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  최고: Gemini 3 Pro (high)      48.44
  평균: 35.8점
  모델수: 7개
```

### 4. 최신 모델 트렌드 분석

최근 업데이트 모델 식별:
- GPT-5 시리즈 (OpenAI) 🟢
- Claude 4.5/4 시리즈 (Anthropic) 💜
- Gemini 3 시리즈 (Google) 🔵
- DeepSeek V3 시리즈 🟡

분석 포인트:
- 각 제조사의 최신 모델 순위 변화
- 오픈소스/중국 모델의 성장 추세
- 코딩 특화 모델(Codex) vs 일반 모델 성능 비교

**비주얼 출력 예시:**
```
📈 최신 모델 트렌드 분석 (2026-02)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢🟢🟢 OpenAI: 지속적 우위 maintained
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GPT-5.2 시리즈가 TOP 독점
  가격/성능 비율 최적화

💜💜 Anthropic: 급성장 중
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Claude Opus 4.5 → TOP 2 (49.69점)
  200K+ 컨텍스트, 더 저렴해짐

🟡🟡 중국 모델: 쾌속 성장
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Kimi K2.5 → TOP 6 (46.73점) 🚀
  DeepSeek V3.2 → 41.61점
  GLM-4.7 → 42.05점
  
💡 추세:
  - 중국 모델이 중위권에서 상위권으로 상승
  - 오픈소스 모델 성능 향상
  - 코딩/리즈닝 특화 모델 등장
```

## Data Interpretation

### Intelligence Index v4.0 구성

총 10개 벤치마크 평균:
1. **GDPval-AA**: 개발자 평가 벤치마크
2. **τ²-Bench Telecom**: 통신 도메인 복잡성
3. **Terminal-Bench Hard**: 터미널/CLI 복잡 작업
4. **SciCode**: 과학 코딩 벤치마크
5. **AA-LCR**: LLM 추론 능력
6. **AA-Omniscience**: 지식/사실성 평가
7. **IFBench**: 정보 검색/추론
8. **Humanity's Last Exam**: 극한 난이도 문제
9. **GPQA Diamond**: 과학 PhD 수준 문제
10. **CritPt**: 비판적 사고 평가

### 점수 해석
- 50점 이상: 최고 성능 모델 (GPT-5.2 xhigh 수준)
- 40-50점: 고성능 모델 (Claude Opus, Gemini 3 Pro 등)
- 30-40점: 중상위권 모델 (대부분의 실용 LLM)
- 20-30점: 중위권 모델
- 20점 미만: 하위권 모델

### isLabClaimedValue 필드
- `true`: 연구실에서 공식적으로 발표한 점수
- `false`: Artificial Analysis 독립 측정 점수

## Common Usage Patterns

### 패턴 1: TOP 20 퀵 뷰
```
"최저가 LLM 성능 순위"
"TOP 10 모델 목록"
→ Workflow 1 실행 → 비주얼 테이블 + 순위 뱃지
```

### 패턴 2: 특정 모델 성능 확인
```
"Claude Opus 4.6 점수는?"
"GPT-5 몇 위?"
→ Workflow 2 실행 → 제조사 아이콘 + 점수바 + 평가
```

### 패턴 3: 제조사별 비교
```
"OpenAI vs Anthropic 비교해줘"
→ Workflow 3 실행 → 카테고리별 그룹 + 평균 점수 + 최고 모델
```

### 패턴 4: 최신 트렌드 요약
```
"최근 어떤 모델들이 성장했어?"
→ Workflow 4 실행 → 트렌드 아이콘 + 성장 추세 + 인사이트
```

## Tips

1. **반드시 web_fetch 사용**: 브라우저 스크린샷보다 web_fetch가 텍스트 캡처에 더 효율적
2. **최신성 유지**: 데이터는 실시간으로 가져와서 항상 최신 순위 제공
3. **대소문자 불구분**: 검색시 대소문자 구분 없이 정규화 처리
4. **점수 해석 주의**: 벤치마크에 따라 실제 사용 경험과 다를 수 있음
5. **참고 링크**: detailsUrl로 모델 상세 페이지 제공

### 비주얼 표현 가이드

테이블 스타일:
- 순위: 🥇🥈🥉 (TOP 3), 🟡 #4-#10, ⚪ #11+
- 점수 바: 최고점 51.24기준으로 비율 계산
  ```
  점수바 길이 = (modelScore / 51.24) * 30 문자
  ```
- 제조사 아이콘:
  - 🟢 OpenAI, 💜 Anthropic, 🔵 Google, 🟡 DeepSeek, ⚪ 기타

그리드 옵션 (지원 플랫폼):
- Discord/WhatsApp: 리스트 형식, 이모지만 사용
- Telegram/Slack: 테이블 형식 가능

색상 제안 (마크다운 지원 시):
```
**51.24점** (초고성능) - 최상위권
**40-50점** (고성능) - 상위권  
**30-40점** (중상위) - 실용 모델
**20-30점** (중위) - 일반 모델
**<20점** (하위) - 하위 모델
```

## Example Queries

✓ "최저가 LLM 성능 순위"
✓ "TOP 10 모델 목록"
✓ "GPT-5와 Claude Opus 4.6 비교"
✓ "코딩 특화 모델 중 최고 성능"
✓ "DeepSeek 모델들의 성능 추세"
✓ "오픈소스 LLM 순위"

---

## Resources

이 스킬은 외부 데이터 소스(Artificial Analysis)를 사용하며, 별도의 bundled resources가 필요하지 않습니다. 모든 데이터는 web_fetch 툴을 통해 실시간으로 가져옵니다.

### scripts/
불필요 (web_fetch 툴로 대체)

### references/
불필요 (실시간 데이터 사용)

### assets/
불필요 (텍스트 데이터만 제공)