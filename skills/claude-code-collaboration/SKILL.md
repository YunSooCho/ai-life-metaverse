---
name: claude-code-collaboration
description: Claude Code CLI와 협업하여 복잡한 개발 작업을 효율적으로 처리. 코드 생성, 리팩토링, 디버깅, 코드 리뷰 등 복잡한 작업은 Claude Code에 위임하고, 간단한 작업은 직접 수행.
author: Genie (OpenClaw AI)
---

# Claude Code Collaboration

Claude Code CLI(Agentic Coding Tool)와 협업하는 전략을 제공합니다. 복잡한 작업은 Claude Code에 위임하고, 간단한 작업은 직접 실행하여 효율성을 극대화합니다.

## Role Definition

당신은 OpenClaw Agent로서 Claude Code(Anthropic 공식 CLI 툴)와 협업하여 개발 작업을 처리합니다. 복잡한 비즈니스 로직, 대규모 리팩토링, 디버깅은 Claude Code에 위임하고, 간단한 파일 작업은 직접 실행합니다.

## When to Use This Skill

- **복잡한 작업 위임 필요:** 복잡한 비즈니스 로직 구현, 대규모 리팩토링
- **코드 리뷰 및 디버깅:** 깊이 있는 코드 리뷰, 에러 해결
- **Claude Code CLI 설치 필요:** Claude Code 설치 및 설정 과정
- **협업 전략 필요:** 언제 직접 작업하고 언제 위임할지 결정해야 할 때

## Claude Code 설치

### macOS/Linux (Recommended)
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Homebrew (macOS)
```bash
brew install --cask claude-code
```

### 로그인
```bash
claude
/login
```

## 협업 전략

### ✅ Claude Code에게 위임하기 (복잡한 작업)

**다음 작업은 Claude Code에 위임하세요:**

1. **복잡한 비즈니스 로직** - 인증, 권한, 데이터 처리 등
2. **대규모 리팩토링** - 코드 패턴 재구성, 성능 최적화
3. **디버깅 및 버그 수정** - 에러 분석, 루트 원인 찾기
4. **코드 리뷰** - 보안, 성능, 품질 검토
5. **테스트 코드 작성** - 단위/통합 테스트
6. **Git 복잡 작업** - 병합 충돌 해결, 복잡 커밋

### ❌ 직접 작업하기 (간단한 작업)

**다음 작업은 직접 실행하세요:**

1. **프로젝트 초기화** - `mkdir`, `npm init`, basic setup
2. **단순 파일 생성** - `write()`로 직접 생성
3. **명백한 단일 작업** - `package.json` 수정, config 파일
4. **빠른 튜닝** - 한 줄 수정, 간단한 변수 변경
5. **간단한 스크립트** - bash 스크립트 파일

## 워크플로우

### Workflow 1: 하이브리드 개발 (추천)

```
1. 사용자 요청 수신
   ↓
2. 작업 복잡도 판단
   - 간단: 직접 작업 (exec, write)
   - 복잡: Claude Code 위임
   ↓
3a. 간단 작업:
   - exec("npm init -y")
   - write("./src/index.ts", code)
   - exec("npm install express")
   ↓
3b. 복잡 작업:
   - claude -p "Implement complex logic" --output-format json
   - result = JSON.parse(stdout)
   - write(result.files)
   - exec(result.commands)
   ↓
4. 테스트 및 확인
   - exec("npm test")
   - exec("npm start")
   ↓
5. 사용자에게 결과 보고
```

### Workflow 2: 리팩토링

```
1. 리팩토링 범위 확인
   ↓
2. Claude Code에 위임:
   claude -p "Refactor authentication module to use async/await" \
     --output-format json \
     --append-system-prompt "Maintain backward compatibility"
   ↓
3. 결과 적용:
   - write(result.refactored_code)
   - exec(result.tests)
   ↓
4. 테스트 확인:
   exec("npm test")
   ↓
5. 버전 변경 후 commit
```

### Workflow 3: 디버깅

```
1. 에러 로그 수집
   ↓
2. 파이프로 Claude Code에 전달:
   cat app.log | claude -p "Find anomalies and explain causes"
   ↓
3. 해결책 요청:
   claude -p "Fix the bug: [에러 설명]" \
     --append-system-prompt "Add error handling"
   ↓
4. 코드 적용 및 테스트
```

## 주요 명령어

### 기본 명령
```bash
# 대화형 모드 시작
claude

# 즉시 질문 (프린트 모드)
claude -p "Explain this function"

# 마지막 대화 계속
claude -c -p "Add edge case handling"

# 특정 세션 재개
claude -r "auth-implementation" "Add MFA support"
```

### 옵션 활용
```bash
# JSON 출력 (자동화에 적합)
claude -p "Task" --output-format json

# 시스템 프롬프트 추가
claude -p "Task" --append-system-prompt "Use TypeScript and include tests"

# 모델 선택 (복잡한 작업에 Opus)
claude -p "Complex task" --model opus --output-format json

# 최대 회전 제한 (무한 루프 방지)
claude -p "Task" --max-turns 5 --output-format json

# 예산 제한 (안전장치)
claude -p "Large task" --max-budget-usd 5.00 --output-format json
```

### 파이프 사용
```bash
# 로그 분석
tail -f app.log | claude -p "Alert if you see errors"

# Git diff 리뷰
git diff HEAD~1 | claude -p "Review changes" --output-format json

# 여러 파일 요약
cat *.md | claude -p "Summarize all documentation"
```

## 옵션 레퍼런스

| 옵션 | 목적 | 예시 |
|-----|------|------|
| `-p "query"` | 질문 후 바로 나감 | `claude -p "Task"` |
| `--output-format json` | JSON 결과 | 결과 파싱용 |
| `--output-format stream-json` | 스트리밍 JSON | 대규모 작업 실시간 |
| `--append-system-prompt` | 추가 지시 | Type safety 보장 |
| `--system-prompt` | 전체 프롬프트 교체 | 완전 제어 필요 시 |
| `--model` | 모델 선택 | `opus` vs `sonnet` |
| `--max-turns` | 최대 회전 | 무한 루프 방지 |
| `--max-budget-usd` | 예산 제한 | 비용 제어 |
| `--dangerously-skip-permissions` | 권한 스킵 | ⚠️ 위험, 자동화 시만 |

## 실전 예제

### 예제 1: REST API 생성 (하이브리드)
```javascript
// 1. 프로젝트 셋업 (직접)
exec("mkdir my-api && cd my-api && npm init -y");
write("./package.json", JSON.stringify({...}));

// 2. 코드 생성 (Claude Code 위임)
exec("claude -p 'Build REST API with Express + TypeScript' \
  --append-system-prompt 'Include authentication swagger docs' \
  --output-format json", function(err, stdout) {
    const result = JSON.parse(stdout);
    result.files_created.forEach(f => write(f.path, f.content));
    result.commands.forEach(c => exec(c));
  });

// 3. 테스트 및 실행
exec("npm test && npm start");
```

### 예제 2: 코드 리뷰
```javascript
exec("git diff HEAD~1 | claude -p 'Review security and performance' \
  --output-format json", function(err, stdout) {
  const result = JSON.parse(stdout);
  if (result.blockers) {
    console.log("❌ 취약점 발견:");
    result.blockers.forEach(b => console.log(`- ${b}`));
  } else {
    console.log("✅ 리뷰 통과:");
    result.suggestions.forEach(s => console.log(`• ${s}`));
  }
});
```

### 예제 3: 리팩토링 (모델 선택)
```javascript
exec("claude -p 'Refactor entire codebase to use async/await pattern' \
  --model opus \
  --append-system-prompt 'Preserve all existing functionality' \
  --max-turns 10 \
  --output-format json", function(err, stdout) {
  const result = JSON.parse(stdout);
  result.files_modified.forEach(f => write(f.path, f.content));
});
```

## 안전 가이드라인

### 🚨 위험한 옵션

```bash
# ❌ 파일을 직접 수정 (수동 검토 불가)
claude -p "Task" --dangerously-skip-permissions

# ✅ 안전한 방법 (결과만 받음, 직접 검토 후 적용)
claude -p "Task" --output-format json
# → 결과 검토 후 write()로 직접 적용
```

### 💰 비용 제어

```bash
# 예산 제한 설정 (안전장치)
claude -p "Large refactoring" \
  --max-budget-usd 5.00 \
  --max-turns 10 \
  --output-format json
```

## 성능 비교

| 작업 | 직접 작업 | Claude Code 위임 | 추천 |
|------|----------|-----------------|------|
| 프로젝트 셋업 | ✅ 빠름 | ⚠️ 느림 | 직접 |
| 복잡 로직 | ⚠️ 느림/실수 | ✅ 빠름/정확 | 위임 |
| 리팩토링 | ⚠️ 실수 가능 | ✅ 정확 | 위임 |
| 파일 생성 | ✅ 빠름 | ⚠️ 오버헤드 | 직접 |
| 디버깅 | ⚠️ 한정적 | ✅ 강력 | 위임 |
| 코드 리뷰 | ⚠️ 표면적 | ✅ 심층적 | 위임 |

## 학습 곡선

### Level 1 (기본)
```bash
# 기본 사용
claude
claude -p "Explain code"
claude -c -p "Continue task"
```

### Level 2 (옵션)
```bash
# JSON 출력 및 시스템 프롬프트
claude -p "Task" --output-format json
claude -p "Task" --append-system-prompt "Use TypeScript"
claude -p "Task" --model opus
```

### Level 3 (고급)
```bash
# 파이프 및 제어
cat file.json | claude -p "Analyze"
claude -p "Task" --max-turns 5 --max-budget-usd 5.00
# JSON 결과 파싱 후 프로그램 적용
```

## 제한 사항

### Claude Code 한계
- **계정 필요:** Pro/Max/Teams/Enterprise 또는 Claude Console
- **비용 발생:** 사용량 청구 (프로모션 무료 크레딧 있음)
- **퍼미션 필요:** 파일 수정 허용 필요 (대화형 모드)
- **인터넷 연결:** 요청 시 원격 API 호출

### 사용자 한계
- **사용 환경:** macOS, Linux, WSL 지원
- **계정 요건:** Claude 구독 필요 (Pro 이상)

## 관련 스킬

- **cursor-agent** - Cursor CLI 대안
- **cli-developer** - CLI 툴 개발 가이드
- **github** - GitHub CLI 사용법

## 팁

1. **시뮬레이션 먼저:** 복잡한 작업 전에 `--output-format text`로 결과 확인
2. **백업 필수:** 리팩토링 전에 git stash로 백업
3. **테스트 자동화:** Claude Code가 생성한 코드는 항상 테스트 실행
4. **비용 모니터링:** `--max-budget-usd`로 예산 초과 방지
5. **점진적 적용:** 대규모 리팩토링은 여러 단계로 분리

## 출처

- Claude Code 공식 문서: https://code.claude.com/docs
- GitHub 리포지토리: https://github.com/anthropics/claude-code
- 설치 스크립트: https://claude.ai/install.sh