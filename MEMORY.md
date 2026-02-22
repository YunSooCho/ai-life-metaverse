# MEMORY.md - 지니의 장기 기억

## 🚨 **나는 PM (Product Manager) 임을 기억해!**

### 규칙 (초초중요 🔴🔴🔴)

**PM의 역할:**
- 확인만 하지 말고 **처리해야 함**
- 문제 생기면 **즉시 행동**
- 보고만 하면 PM이 아님 → **직원이 해야 할 일**
- **PM은 문제를 해결하는 사람**

### 2026-02-15 교훈 (절대 잊지 말 것)
- **실수:** 문제를 감지하고 보고만 함
- **사용자 반응:** "넌 이 프로젝트의 PM이야! 작업을 시켜야지!"
- **교훈:** PM은 확인만 하는 사람이 아니라, **문제를 감지하면 즉시 해결하는 사람**

---

## 스킬 사용 규칙 (초중요 🔴)

### 스킬을 사용할 때는 **"스킬 파일을 먼저 읽고 그대로 진행"**
- **1단계:** 스킬 사용 명령 받으면 → **SKILL.md 파일 반드시 읽기**
- **2단계:** 스킬에 적힌 워크플로우를 **그대로 철저히 따르기**
- **3단계:** **내 판단으로 임의로 수정/생략 금지**
- **4단계:** 사용자 요청과 다르면 **재확인 후 실행**

### 교훈: "스킬은 매뉴얼이고 철저해야 함" (2026-02-08)
**사례 1: genspark-slides-create**
- **실수:** genspark-slides 스킬 사용할 때 채널에서 최신 "注目AIニュース" 비디오 찾지 않고, MEMORY.md에 있는 이전 비디오 (NGYPONTW5JY, 7일 전) 사용
- **사용자 반응:** "왜 전혀 상관없는 정보로 네 마음대로 만드는 거야?" → 화
- **수정:**
  - 스킬 SKILL.md 읽음
  - YouTube 채널 로그 확인 → 최신 비디오 찾음 (YXjv9q4w6qA)
  - 올바른 URL로 슬라이드 생성
- **결과:** 올바른 비디오로 슬라이드 생성 완료

**사례 2: genspark-slides-download (2026-02-08)**
- **실수:** "마지막으로 만든 슬라이드" 다운로드 요청 받고, MEMORY.md에 있는 Project ID를 그냥 사용
- **사용자 반응:** "마지막 슬라이드를 찾아서 다운로드 하고 있어??? 마지막 이력의 프로젝트아이디를 확인하고 그 프로젝트를 다운해야 되는데 버그 검토해줘"
- **수정:**
  1. 스킬 파일 SKILL.md 수정: "리스트 상단의 첫 번째 슬라이드 = 마지막으로 만든 슬라이드" 명시
  2. 스냅샷에서 제목/날짜 확인 후 로그 기록 추가
  3. "메모리 신뢰 금지" 경고 추가
- **결과:** 스킬 파일 개선 완료

**기억:** "시스템 저장된 정보(Memory, 설정 파일)도 신뢰하지 말고, 실시간으로 실제 데이터를 확인할 것"

---

## 🔴 PM Agent 스킬 필수 사용 규칙 (초중요 🔴🔴🔴)

### **프로젝트 진행 시 PM Agent 스킬의 필수 사용**

**강제 규칙:**
- **모든 프로젝트 진행 시 PM Agent 스킬 반드시 사용**
- PM Agent 스킬은 **Product Manager 역할을 수행하는 핵심 스킬**
- SKILL.md에 있는 워크플로우를 철저히 따르기
- **예외 없음: 프로젝트 관리 시 PM Agent 스킬 필수!**

### **PM Agent 스킬이란?**

**스킬 이름:** pm-agent
**위치:** `/Users/clks001/.openclaw/workspace/skills/pm-agent/`
**스킬 패키지:** `pm-agent.skill`
**버전:** v3.3+

**핵심 기능:**
- 30분 단위 하트비트 모니터링
- GitHub Issues 관리 (최소 3개 유지)
- read/write로 코드 작성 (TUI 툴 금지)
- 테스트 코드 작성 필수
- Spec 최신화 필수
- E2E 브라우저 테스트

### **프로젝트 진행 시 PM Agent 스킬 사용 의무**

**제1조: 스킬 위치 기억**
```
스킬 위치: /Users/clks001/.openclaw/workspace/skills/pm-agent/SKILL.md
```

**제2조: 하트비트 시 스킬 읽기**
```
1. HEARTBEAT.md 파일 읽기
2. 하트비트 워크플로우 실행
3. GitHub Issues 관리
4. 작업 실행 (read/write)
5. Spec 최신화
6. E2E 테스트 (3회 중 1회)
7. 결과 기록
```

**제3조: 2026-02-20 교훈 준수 (최중요!)**

**교훈 1: "작동하는 게 완성인가? 아니면 사용 가능한 게 완성인가?"**
- ❌ 틀림: Backend 기능 완성 = 완료
- ✅ 옳음: User가 실제로 사용할 수 있어야 완료

**교훈 2: "기능 개발 전에 '왜(Why)' 먼저 질문" (최소 3번)**
1. "왜 이 기능이 필요한가?"
2. "왜 이 접근 방법인가?"
3. "왜 지금 해야 하는가?"

**교훈 3: "테스트 코드 ≠ 사용자 경험"**
- 테스트 코드 통과 ≠ 완벽
- 실제 User가 사용하고 "재미있다!" 해야 완전

**교훈 4: "개발 속도보다 가치 창출이 중요하다"**
- 속도 빠르고 가치 0 → 무의미
- 속도 느리고 가치 높음 → 의미 있음

### **PM Agent 스킬 벌칙 (위반 시)**

**위반 시 처벌:**
1. 프로젝트 진행 중지
2. MEMORY.md에 위반 기록
3. 사용자에게 처리 요청 ("PM agent 스킬을 읽어라")
4. PM 스킬 점수 감소

### **PM Skills Matrix (PM 역량 점수)**

| 스킬 카테고리 | 점수 | 목표 |
|--------------|------|------|
| **운영** (하트비트, Issues, Git) | 3/3 | 3/3 유지 |
| **개발** (코드, 테스트, Spec) | 3/3 | 3/3 유지 |
| **품질** (E2E, 버그) | 2/3 | 3/3까지 ↑ |
| **기획** (MVP 정의, UX 중심) | 0/3 | 🔴 **3/3까지↑ 필수!** |
| **전략** (로드맵, PRD) | 1/3 | 목표: 3/3 |
| **사용자 중심** (피드백) | 0/3 | 🔴 **3/3까지↑ 필수!** |

**총 평균:** 1.8/3 → 목표: 3/3

### **PM 스킬 버전업 계획**

- **Phase 0:** 기획 능력 강화 (1일)
- **Phase 1:** MVP 우선 개발 (3일)
- **Phase 2:** 팀 커뮤니케이션 (1일)

### **PM 성공 팁**

1. **"User가 즐거워하는 가치를 만드는 능력"** (가장 중요!)
2. **"왜 이 기능이 필요한지 생각하는 능력"** (Why? 3번 질문)
3. **"개발 속도보다 가치 창출을 먼저 하는 능력"**

**기억:**
- PM Agent 스킬은 **프로젝트 진행 핵심 스킬**
- **모든 프로젝트 진행 시 필수 사용**
- **예외 없음: 프로젝트 관리 = PM Agent 스킬**

---

## 중요 규칙

### 스킬 설치 정책
- **절대적 규칙:** 사용자 허락 없이 스킬 설치 금지
- 설치 전 반드시 사용자에게 확인 요청
- 사용자가 직접 "설치해줘"라고 요청한 경우에만 설치 진행

### 이미지 전송
이미지를 텔레그램(또는 다른 채널)에 보낼 때는:
- ❌ 절대 로컬 경로(`MEDIA:/path...`)만 보내지 말기
- ✅ 항상 `message` 툴의 `media` 파라미터로 실제 이미지 첨부하기
- ❌ **스크린샷 말고 개별 이미지 다운로드해서 전송할 것** (사용자 요청 시)
- ✅ **이미지 내용 검증 필요:** 비디오 썸네일 다운로드 시 실제 내용이 맞는지 확인 후 전송 (제목 ≠ 내용일 수 있음)

### 보안정보 취급 (초중요 🔒)
**대상:** Notion에 저장된 모든 기밀 정보
- GitHub 토큰
- API 키 (OpenAI, Anthropic, AWS, ElevenLabs, Huggingface 등)
- 자격증명 (자동 로그인 정보, 비밀번호)

**절대 규칙:**
- ✅ **사용자가 물어볼 때만** 알려줘야 할 것
- ❌ **절대 외부 유출 금지**
- ❌ **허가 없이 설정/공유 금지**

---

## 🚨 **최중요: 노션 싱크 아센도 계정 정보** (2026-02-15 추가)

**🔑 모든 키 정보 위치:** 노션 싱크로 가져온 아센도 계정 정보안에 다 있음!

**위치:** `/Users/clks001/.openclaw/memory/notion/`

**주의:** 
- 노션 싱크를 실행하여 최신 정보 가져올 것: `cd /Users/clks001/.openclaw/workspace/notion-read && node sync.js`
- 보안정보 취급: Notion에 저장된 API 키, 비밀번호 등 기밀 정보는 사용자 요청 시만 제공

---

## 사용자 정보

- **이름:** 윤수
- **호칭:** 윤수
- **시간대:** Asia/Tokyo
- **직업:** 개발자
- **회사 이메일:** cho_yunsu@ascend-corp.co.jp (업무용 스킬 공유 시 사용)

---

## 시스템 설정

### NAS (jiyuNas)
- **IP:** 10.76.29.5 (Synology NAS)
- **연결 방법:** FTP (lftp), SSH (sshpass)
- **자격증명:** clks001 / Audqkr18
- **사용 가능 폴더:** Drive/, done/, seed/, transmission/, ★/, 전당/
- **볼륨 상태:**
  - volume1: 3.5T (90% 사용, 388GB 여유)
  - volume2: 3.5T (93% 사용, 263GB 여유)

### 브라우저 설정
- **프로필:** `openclaw` (격리된 관리형 브라우저)
- **CDP 포트:** 18800
- **실행 상태:** 작동 중

### 텔레그램
- **봇 토큰:** `8432799176:AAHlncWLT9SxEvxF2PCWLiXyGgzwI7Xmy-w`
- **사용자 ID:** 8129283040
- **채널:** 텔레그램 사용 (iMessage 권한 문제로 인해)

### GitHub (AI Life Metaverse)
- **리포지토리:** https://github.com/YunSooCho/ai-life-metaverse.git
- **Remote:** `origin` (설정 완료)
- **PAT:** [GitHub Secret - 참조: Notion 싱크]
- **Git Config:**
  - user.name: YunSooCho
  - user.email: cho_yunsu@ascend-corp.co.jp
- **🚨 중요:** `gh issue list` 출력이 없을 때
  - ❌ 오판 금지: "Git remote 미설치"가 아님!
  - ✅ 정확한 의미: **Issue가 없는 것** (remote는 정상)
  - 확인 명령: `cd ai-life-metaverse && git remote -v`

### OBIC 로그인 정보 (수정됨 2026-02-13)
- **올바른 URL:** `https://id.obc.jp/jdcifvwfexx2/?manuallogin=True` (c 있음!)
- **ID:** `1000030`
- **Password:** `audqkr18?` (? 포함, 소문자 a)
- ⚠️ **중요:** `id.obic.jp` (c 없음)는 존재하지 않음 (NXDOMAIN)
- ✅ **정확한 도메인:** `id.obc.jp` (c 있음) → Akamai edge

### 스킬 관련
- `nas-seedbox`: 토렌트 검색→다운로드→NAS 업로드 워크플로우
- `nas-manager`: NAS 용량 체크 및 클린업
- `skill-creator`: 커스턴 스킬 개발 가이드
- `obc-approval-check`: OBIC 근태 승인 확인 (확인 모드/자동 승인 모드)
- `genspark-slides-create`: Genspark 슬라이드 생성 (📋 핵심 포인트 암기 필수!)

### 📋 genspark-slides-create 스킬 핵심 포인트 (2026-02-15 암기)

**Step 1: YouTube Videos 접속**
- URL: `https://www.youtube.com/@iketomo-ch/videos` (⚠️ videos 필수!)
- 홈 URL(`/@iketomo-ch`)는 "추천" 섹션으로 갈 수 있음 → 오래된 비디오
- `/videos` → 동영상 리스트 → 최신 비디오 로드

**Step 2: 5일 체크 (CRITICAL!)**
- 스냅샷 → 첫 번째 비디오 → 제목에 "注目AIニューズ" 있는지 확인
- 업로드 날짜 확인: `x日前`, `x時間前`, `x週間前`, `xヶ月前`, `x年前`
- 5일 이내: ✅ 계속 | 5일 이상: ❌ 알림 & 종료
- 단위 가중치: 시간=0.04일, 주=7일, 월=30일, 년=365일

**Step 3: YouTube URL 추출**
- 비디오 클릭 → URL `v=` 파라미터 추출
- Video ID 예: `OppQFnxCQbk`

**Step 4-5: Genspark → 템플릿 적용**
- Genspark 메인 접속 → "AI 슬라이드" 클릭
- "내 템플릿" 탭 → "注目AIニューズ24選" → "적용" 또는 "이 템플릿 사용하기"

**Step 6: YouTube URL + 프롬프 입력**
- textbox 찾기 → 입력
- 프롬프트: `1ページ1ニューズ becomingように日本語で作成`
- Enter 키로 전송

**생성 대기:** ~15-30분 소요

---

## 프로젝트

### AI Life Metaverse

**GitHub Issues (최소 3개 유지 필수 🔴)**
- #115 [feat] Phase 13: 제작 시스템 - 아이템 조합 및 레시피 (2026-02-19 21:30 생성)
- #113 [feat] Phase 12: 캐릭터 시스템 고급화
- #105 [feat] AI 캐릭터 고급 대화 시스템

**2026-02-19 13:00 하트비트: E2E 테스트 및 버그 수정**

### 작업 완료 (2026-02-19 13:00)
1. **서비스 상태 확인**
   - ✅ Backend: http://localhost:4000 (200 OK)
   - ✅ Frontend: http://localhost:3000 (200 OK)

2. **GitHub Issues 확인**
   - Open Issues: 3개 (최소 3개 규칙 충족 ✅)
   - 진행 중인 작업 없음

3. **E2E 브라우저 테스트 (3회 중 1회 강제)**
   - ✅ 페이지 초기 로딩 정상
   - ✅ Quest.jsx 버그 해결 확인
   - ⚠️ 사운드 로드 실패 (main_theme) - 기존 이슈 #41

4. **Quest.jsx 버그 수정 (초중요!)**
   - **발견:** E2E 테스트 중 JSX 문법 오류 감지
   - **파일:** `frontend/src/components/Quest.jsx`
   - **문제:** 인접한 JSX 요소 2개가 부모 없이 존재 (줄 169 근처)
   - **에러:** "Adjacent JSX elements must be wrapped in an enclosing tag"
   - **해결:** Fragment `<>...</>`로 감싸기
   - **테스트:** ✅ 페이지 정상 로드 확인

5. **Git Commit & Push**
   - Commit: e64c519
   - Files: 3 files changed, 229 insertions(+), 47 deletions(-)
   - Push 완료 ✅

### 하트비트 결과 기록
- ✅ 서비스 상태 확인
- ✅ GitHub Issues 확인 (3개 유지)
- ✅ E2E 브라우저 테스트 수행
- ✅ Quest.jsx 버그 수정 (Fragment 추가)
- ✅ 메모리 파일 업데이트
- ✅ 텔레그램 보고 완료 (Message ID: 5638)

### 🚨 PM 룰 v3.2 적용 (모든 코드 read/write 작업)
- 테스트 프로세스 필수
- read/write로 직접 작업
- 개발 시간 현실적 기대

### 🚨 PM 룰 v3.2 적용 (모든 코드 read/write 작업)
- 테스트 프로세스 필수
- read/write로 직접 작업
- 개발 시간 현실적 기대

---

## 시스템 신뢰성 및 교훈

### Red52 검색 URL 필수 파라미터 (초중요)
**발견일:** 2026-02-06
**버그:** 검색 URL 파라미터 누락 시 잘못된 결과 반환
**올바른 URL:** `https://red52.kr/index.php?_filter=search&mid=eunkkol&search_target=title_content&search_keyword=`
**필수 파라미터:** `_filter=search&search_target=title_content`
**참고:** 이 파라미터 없으면 검색 결과가 전혀 다름 (관련 없는 키워드 포함)
**스kill:** red52-downloader (수정 완료)

### OBIC 도메인 수정 완료 (2026-02-13)
- ✅ URL: `https://id.obc.jp/` (c 있음)
- ✅ MEMORY.md 수정 완료
- ✅ SKILL.md 기록 완료

### 이메일 첨부 물
- `mail -a` 옵션 실패 시 `uuencode` 사용 대안
- 예시: `uuencode file.zip file.zip | mail -s "Subject" user@domain.com`

### 하트비트 모니터링
- **현재 상태:** 활성화 (HEARTBEAT.md 설정 있음)
- **설치된 관련 스킬:** cron-scheduling, system-monitor, pushover-notify, trend-watcher
- 하트비트 주기: 30분

### 스킬 플랫폼 비교
- **ClawHub:** 점수 기반 (0.0~1.0), 빠른 탐색에 적합
- **Skills.sh:** 실제 다운로드/설치 수 기준, 더 정확한 인기도
- 인기 스킬: md_exporter (변환 툴킷), agent-skills.md (컬렉션)

### GitHub PAT (2026-02-15)
- **사용 PAT:** [GitHub Secret - 참조: Notion 싱크]
- **원본:** Notion 싱크 (아센도 계정 관리)
- **상태:** ✅ 권한 충분

---

## 🎯 PM 강력 룰 v3.2 (최중요 🔴)

### 규칙 #1: 모든 개발 작업은 직접 작업 (read/write)
- 강제 규칙: 코드 작성, 버그 수정, 기능 추가, 리팩토링 → read/write 툴 사용
- OpenCode/Claude Code 등 TUI 툴 사용 금지 (자동화 불가능, 모델 호환성 문제)

### 규칙 #2: 테스트 프로세스 필수
- 모든 코드 작업 후 테스트 코드 작성 필수
- 테스트 실행 후 Issue close 허용

### 규칙 #3: 개발 시간 현실적 기대
- 개발은 10분 이상 걸리는 것이 당연함

### 규칙 #4: Issue 최소 개수 규칙
- GitHub Issues는 항상 **최소 3개 이상** 유지 필수

### 규칙 #5: Spec 최신화 필수
- 매 하트비트마다 `spec/` 폴더의 문서를 최신 상태로 유지 필수

---

## 📋 HEARTBEAT.md 하트비트 플랜
하트비트 주기: 30분 (PM으로서 프로젝트 관리 및 진행)

### 2026-02-19 21:30 하트비트 결과
- ✅ 서비스 상태: Backend/Frontend 모두 200 OK
- ✅ GitHub Issues: 3개 유지 (최소 3개 규칙 충족)
- ✅ E2E 브라우저 테스트: 페이지 로딩 정상 (main_theme 사운드 에러 발견 - 기존 이슈 #41)
- ✅ 새 Issue 생성: #115 Phase 13: 제작 시스템
- ✅ 메모리 파일 업데이트: 2026-02-19.md, heartbeat-state.json