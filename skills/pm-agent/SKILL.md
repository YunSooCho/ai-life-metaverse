---
name: pm-agent
description: A product management skill for automated project oversight. Use when working as a Product Manager that needs to manage GitHub Issues, set up heartbeat processes, enforce development standards (code + tests), maintain specifications, track project phases, and continuously learn from project lessons. Intended for continuous project management and automated development workflows.
---

# PM Agent

## Overview

PM Agent는 개발 프로젝트의 Product Manager 역할을 수행하기 위한 스킬이다. 자동화된 하트비트 프로세스, GitHub Issue 관리, 개발 표준 강제, Spec 최신화, 교훈 레지스트리를 통해 프로젝트를 지속적으로 발전시킨다.

## Project Integration

### HEARTBEAT.md 연동

프로젝트에서 PM Agent 스킬을 활성화하려면 `HEARTBEAT.md` 파일에 다음 헤더를 추가하세요:

```markdown
# AI Life Metaverse 하트비트 플랜

> **📦 사용 스킬:** [pm-agent](../skills/pm-agent/) - PM Agent 활성화 시 이 하트비트 플랜이 사용됩니다
```

### 활성화 방법

1. **HEARTBEAT.md** 파일 생성 (프로젝트 root)
2. 위 헤더 추가
3. PM Agent 하트비트 플랜 추가
4. **HEARTBEAT.md** 파일에 이 스킬 레퍼런스 추가 (선택):

```markdown
## PM Agent 레퍼런스
- **스킬 위치:** `/Users/clks001/.openclaw/workspace/skills/pm-agent/`
- **스킬 패키지:** `pm-agent.skill`
- **버전:** v3.3+
```

### Workspace Context

PM Agent 스킬이 **workspace context**에 포함되어 있으면 하트비트 실행 시 자동으로 로드됩니다. AGENTS.md의 하트비트 규칙을 따르세요:

```
Before doing anything else:
1. Read `SOUL.md`
2. Read `USER.md`
3. Read `HEARTBEAT.md` → PM Agent 하트비트 수행
4. **If in MAIN SESSION:** Read `MEMORY.md`
```

## Workflow

PM Agent는 주기적인 하트비트를 통해 프로젝트를 관리한다:

### Heartbeat Process (30분 주기)

**1. 서비스 상태 확인 (2분)**
- Backend/Frontend 상태 체크
- AI Agent 프로세스 확인
- 로그 파일에서 에러 확인

**2. GitHub Issues 확인 (3분)**
- 오픈된 Issues 리스트 확인
- **최소 개수 규칙:** 3개 이상 유지 (강제)
- Issue 3개 미만 시 즉시 새 Issue 생성

**3. 기획&설계 (8-10분)**
- 시스템에 필요한 것 고민
- 새로운 기능 아이디어 브레인스토밍
- 기능 설계 (새로운 기능일 때만)
- GitHub Issue 생성 (새로운 기능/새로운 계획일 때)

**4. 기능&테스트 상태 확인 (3분)**
- 기능 레지스트리 확인
- 테스트 요구사항 확인

**5. 프로젝트 관리 & 우선순위 결정 (5분)**
- 진행 중인 Phase 확인
- 현재 Phase의 남은 태스크 목록화
- 우선순위: 버그 > 성능 개선 > 새로운 기능

**6. 작업 실행 (15-20분)**
- 버그 수정 우선
- read/write로 코드 작성 (강제)
- read/write로 테스트 코드 작성
- 테스트 실행
- Issue close (코드 + 테스트 통과 시)

**7. Spec 최신화 (3-5분) - 강제!**
- 코드 변경이 있으신지 확인
- 관련 spec/ 파일 식별
- 불일치 부분 업데이트
- 새로운 기능이 spec에 없으면 추가

**8. E2E 브라우저 테스트 (5-8분) - 3회에 1회**
- 브라우저 접속 → 기능 테스트 → 콘솔 에러 → Issue 등록

**9. 결과 기록 (2-3분)**
- 수행한 작업 기록
- 수정한 파일 목록
- 다음 하트비트 계획

## Core Capabilities

### 1. GitHub Issue Management

**최소 개수 규칙 (최중요 🔴🔴🔴):**
- GitHub Issues는 항상 **최소 3개 이상** 유지 필수
- Issue가 3개 미만일 경우: 즉시 새 Issue 생성 강제

**Issue 개수 규칙:**
- ✅ **최소:** 3개 (항상 3개 이상 유지)
- ~~~~최대: 10개 (상한 초과 시 new Issue 금지)~~ (v3.3에서 제거)
- ✅ **상한 없음** (v3.3에서 추가)

**Issue 생성 전 확인:**
1. 이미 있는 Issue인지 확인
2. 중복인지 확인
3. 우선순위 결정 (높음 > 중간 > 낮음)

**Issue 작성 포맷:**
```
제목: [타입] [기능/버그] 제목

## 목표
무엇을 구현/수정할지

## 작업 항목
- [ ] 코드 작성 (read/write)
- [ ] 테스트 코드 작성 (read/write)
- [ ] 테스트 실행
- [ ] Issue close

## 우선순위
높음/중간/낮음

## 예상 소요
X분/Y시간 (테스트 포함)

## 관련 파일
file1.js, file2.jsx
```

### 2. Development Standards

**강제 규칙 #1: read/write로 직접 작업 (초중요 🔴🔴🔴):**
- 코드 작성, 버그 수정, 기능 추가, 리팩토링 → read/write 툴 사용
- OpenCode/Claude Code 등 TUI 툴 사용 금지 (자동화 불가능)
- GLM-4.7 모델 사용을 위해서는 직접 작업 필요

**강제 규칙 #2: 테스트 프로세스 필수 (초중요 🔴🔴🔴):**
- 모든 코드 작업 후 테스트 코드 작성 필수
- 테스트 실행 후 Issue close 허용

**강제 규칙 #3: 개발 시간 현실적 기대 (초중요 🔴):**
- 개발은 10분 이상 걸리는 것이 당연함
- "빨리 결과를 내려고 무리하지 말 것"

**개발 시간 예상:**
- read/write 코드 작성: 5~10분
- read/write 테스트 코드 작성: 5~10분
- 테스트 실행: 2~5분
- **총 소요: 13~27분 (당연!)**

**테스트 프로세스:**
1. ✅ read/write로 코드 작성
2. ✅ read/write로 테스트 코드 작성
3. ✅ 테스트 실행
4. ✅ 테스트 결과 확인
5. ✅ Issue close (코드 + 테스트 통과 시)

### 3. Specification Maintenance

**강제 규칙 #5: Spec 최신화 필수 (초중요 🔴🔴🔴):**
- 매 하트비트마다 `spec/` 폴더의 문서를 최신 상태로 유지 필수
- 기능 추가/변경 시 관련 spec 문서 즉시 업데이트
- spec과 실제 코드가 불일치하면 **spec을 코드에 맞춰 업데이트**

**Spec 파일 목록 (`spec/` 폴더):**
- `01-overview.md` - 프로젝트 개요
- `02-system-architecture.md` - 시스템 아키텍처
- `03-customer-types.md` - 캐릭터 타입
- `04-agent-api.md` - Agent API
- `05-web-ui.md` - Web UI
- `06-character-system.md` - 캐릭터 시스템
- `07-conversation-system.md` - 대화 시스템
- `08-data-model.md` - 데이터 모델
- `tech-stack.md` - 기술 스택

**Spec 최신화 절차:**
1. 이번 하트비트에서 코드 변경이 있었는지 확인
2. 변경된 기능과 관련된 spec 파일 식별
3. spec 파일을 읽고 현재 코드와 비교
4. 불일치 부분을 최신 코드에 맞게 업데이트
5. 새로운 기능이 spec에 없으면 해당 spec에 추가

### 4. Project Setup (사용자 오버라이드)

프로젝트마다 다른 설정을 `PROJECT.md`에 정의:

```markdown
# Project Configuration

## GitHub
- Repository: https://github.com/username/repo
- PAT: ghp_XXXXXXXXXXXXX

## Services
- Backend: http://localhost:4000
- Frontend: http://localhost:3000

## Phase Roadmap
- **Phase 1:** 기초 인프라 (완료)
- **Phase 2:** 핵심 기능 (진행 중)
- **Phase 3:** 고급 기능 (예정)

## Testing
- Framework: vitest
- Command: npm test
- E2E: manual/browser automation
```

### 5. Lessons Registry

**교훈 레지스트리 (LESSONS.md) 구조:**
- 배운 교훈 기록
- 버전 히스토리
- 카테고리별 정리

**교훈 기록 포맷:**
```markdown
## [YYYY-MM-DD] 교훈명

**상황:**
어떤 상황에서 발생했는지

**실수:**
실수한 내용

**사용자 반응:**
사용자의 피드백

**수정:**
수정한 내용

**결과:**
최종 결과
```

**강제 교훈 (기본 포함):**
- PM은 확인만 하지 말고 해결해야 함 (2026-02-15)
- 테스트 프로세스 필수
- read/write로 직접 작업
- 개발 시간 현실적 기대

## Resources

### references/
프로젝트별 설정과 상세 가이드를 포함:

- **PROJECT.md** - 프로젝트별 설정 (사용자 작성 필요)
- **LESSONS.md** - 교훈 레지스트리 (버전 히스토리 포함)

## Workflow Decision Tree

```
Start Heartbeat
├── 서비스 상태 확인 (정상?)
│   ├── 아니오 → 에러 Issue 생성
│   └── 예
├── GitHub Issues 확인 (3개 이상?)
│   ├── 아니오 → 즉시 새 Issue 생성 (강제!)
│   └── 예
├── 기획&설계 (새로운 것 필요?)
│   ├── 예 → 설계 후 Issue 생성
│   └── 아니오
├── 우선순위 결정 (버그 > 성능 > 기능)
├── 작업 실행 (read/write + 테스트 필수)
├── Spec 최신화 (코드 변경 있을 시 - 강제!)
├── E2E 테스트 (3회에 1회)
└── 결과 기록
```

## PM's Golden Rules

1. **PM은 확인만 하지 말고 해결해야 함**
   - 문제 생기면 즉시 행동
   - 보고만 하면 PM이 아님 → 직원이 해야 할 일

2. **모든 코드 작업은 read/write로**
   - OpenCode/Claude Code TUI 금지
   - 자동화 불가능 + 모델 호환성 문제

3. **테스트 코드 없으면 작업 미완료**
   - 코드만 작성 후 close 금지
   - 테스트 통과 후에만 close 허용

4. **GitHub Issues 최소 3개 유지**
   - 3개 미만 시 즉시 새 Issue 생성 (강제!)
   - 다음 하트비트에서 반드시 3개 이상 확인
   - **Issue 개수 상한 없음** (v3.3에서 추가)

5. **Spec 최신화 필수**
   - 코드 변경 시 관련 spec/ 파일 즉시 업데이트
   - 기능 추가 후 spec 미업데이트 → 작업 미완료

---

**PM Agent는 지속적으로 발전합니다. 매 하트비트에서 배운 교훈을 LESSONS.md에 기록하고, 스킬을 업데이트하세요.**