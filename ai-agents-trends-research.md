# AI Agents & Self-Hosting 최신 트렌드 리포트

**조사 날짜:** 2026년 2월 6일  
**조사 범위:** Hacker News Show HN, Product Hunt, GitHub 트렌드  
**시간대:** 최근 6~12개월 (2025-11 ~ 2026-02)

---

## 🔥 핵심 발견

### 1. **Telegram 기반 셀프 호스팅 AI 에이전트가 급부상**

**PocketPaw** (Show HN: 2026-02-02, ⭐ 1upvote)
- **GitHub:** https://github.com/pocketpaw/pocketpaw
- **컨셉:** "Your laptop에서 사는 AI 에이전트"
- **핵심 특징:**
  - ✅ Telegram 기반 제어 (OpenClaw와 동일)
  - ✅ 30초 설치: `pip install pocketpaw && pocketpaw`
  - ✅ 로컬 실행, 프라이버시 중심
  - ✅ 크로스 플랫폼 (macOS, Windows, Linux)
  - ✅ 브라우저 제어 (Open Interpreter/Claude Code)
  - ✅ 멀티 LLM 지원 (Ollama 100% 로컬, OpenAI, Anthropic)
  - ✅ 단일 사용자 잠금, 파일 감옥, Guardian AI 보안
- **아키텍처:**
  - Config: `~/.pocketclaw/config.json`
  - 에이전트 백엔드: Open Interpreter (default) / Claude Code
  - Telegram 컨트롤: Status, Fetch, Screenshot, Agent Mode, Panic, Settings
- **OpenClaw와의 유사성:** ⭐⭐⭐⭐⭐
  - ✅ 셀프 호스팅 + Telegram 제어 + 로컬 LLM 옵션
  - ✅ 개인 어시스턴트 플랫폼
  - ✅ 보안 강조 (Guardian AI, File Jail)
  - ❌ Python 기반, 스킬 시스템 불명

---

### 2. **연합형 AI 에이전트 앱 스토어 개념 등장**

**AgentSystems** (Show HN: 2025-11-04, ⭐ 2upvotes)
- **GitHub:** https://github.com/agentsystems/agentsystems
- **라이선스:** Apache-2.0
- **컨셉:** "Self-hosted App Store for AI Agents"
- **혁신적인 개념:**
  - 조직들은 모든 에이전트를 직접 만들거나 제3자 서버로 데이터 전송
  - 이메일 클라이언트, 지도 앱을 다운로드하듯 AI 에이전트도 가능해야 됨
  - **핵심 아키텍처:**
    - Git 기반 연합 인덱스 (fork 기반 소유권, 게이트키퍼 없음)
    - 컨테이너 격리 + egress 프록시 (에이전트 URL 접근 제어)
    - Credential injection (API key를 호스트에서, 에이전트 이미지가 아닌 곳에)
    - 모델 추상화 (Ollama 로컬, 클라우드 API, 하이브리드)
    - Hash-chained 감사 로그
- **현재 상태:** 인덱스가 거의 비어있음 (레일이 없으면 열차 못 감)
- **필요한 것:**
  - 에이전트 빌더가 인덱스에 출판
  - 보안 연구자가 아키텍처 검토
  - 셀프 호스팅 AI 인프라 필요 조직

---

### 3. **AI 코딩 에이전트의 진화 & 확장**

**Plandex v2** (Show HN: 2025-04-16, ⭐ 257upvotes)
- **GitHub:** https://github.com/plandex-ai/plandex
- **컨셉:** 오픈 소스 AI 코딩 에이전트 (대형 프로젝트/태스크 전용)
- **핵신 기능:**
  - 효과적인 컨텍스트 윈도우: 2M 토큰
  - 트리-시터 프로젝트 맵으로 20M+ 토큰 인덱싱 (30+ 언어 지원)
  - SQLite, Redis, Git 같은 백만 라인 규모 프로젝트에서 컨텍스트 찾기
  - Diff 리뷰 샌드박스 (버전 관리, 브랜치, 되감기)
  - Full Auto Mode: 계획 → 컨텍스트 로딩 → 상세 계획 → 구현 → 명령 실행 → 디버깅
  - 자율성 레벨 설정 가능
  - 다중 모델 컴비네이션 (Anthropic, OpenAI, Google)
  - 셀프 호스팅 + 로컬 모드 Docker

---

### 4. **MCP (Model Context Protocol) 에코시스템 형성**

**MCP Jungle** (Show HN: 2025-08-06, ⭐ 2upvotes)
- **GitHub:** https://github.com/mcpjungle/MCPJungle
- **컨셉:** 셀프 호스팅 MCP 레지스트리 + 게이트웨이
- **해결 문제:**
  - MCP (Model Context Protocol)가 LLM 도구 호출 표준으로 채택
  - 다중 서버 관리 (인증, 툴 디스커버리, ACL, 관측 가능성)이 악몽
  - 특히 조직 내 팀간에
- **기능:**
  - 모든 MCP 서버를 `/mcp` 엔드포인트 뒤에 노출
  - ACL로 어떤 클라이언트가 어떤 MCP 툴을 보고 호출할지 제어
  - 모든 MCP 클라이언트 & 서버를 중앙에서 관리
- **기술:** Go, 단일 바이너리 배포, Homebrew/Docker

---

### 5. **웹 크롤링 에이전트 고도화**

**Crawl4AI** (Show HN: 2026-01-16, ⭐ 2upvotes)
- **URL:** https://crawl4ai.dev
- **컨셉:** LLM 친화적 오픈 소스 웹 크롤러
- **기능:**
  - Cursor MCP, n8n 자동화, Docker 배포 통합 가이드
  - Firecrawl 같은 상용 대안과 성능 비교
  - AI 에이전트 & RAG 시스템용 확장 가능한 셀프 호스팅 데이터 파이프라인

---

## ⚠️ 보안 이슈

OpenClaw 취약성 사건이 Hacker News에서 논의됨

**보고된 통계:**
- 🚨 **42,665개** OpenClaw 인스턴스가 인터넷에 공개됨
- 🚨 **5,194개**가 시스템 스캔으로 활성 취약성 확인
- 🚨 **93%** 배포가 임계적 취약함

**Medium 기사:** "The Sovereign AI Security Crisis: 42,000+ Exposed OpenClaw Instances"
> "The narrative that 'running AI locally = security and privacy' is significantly undermined when 93% of deployments are critically vulnerable."

**영향:**
- 사용자들이 셀프 호스팅 대안에 대한 신뢰 상실 위험
- 정부/규제 기관이 셀프 호스팅 AI 에이전트 제한 근거로 활용 가능

---

## 📊 트렌드 벤치마킹

| 프로젝트 | 날짜 | 플랫폼 | 유사성 | HN votes | 주요 특징 |
|---------|------|--------|--------|----------|----------|
| **PocketPaw** | 2026-02-02 | GitHub | ⭐⭐⭐⭐⭐ | 1⭐ | Telegram + 로컬 + 30초 설치 |
| **AgentSystems** | 2025-11-04 | GitHub | ⭐⭐⭐ | 2⭐ | 연합 앱 스토어 개념 |
| **MCP Jungle** | 2025-08-06 | GitHub | ⭐⭐ | 2⭐ | MCP 게이트웨이 표준화 |
| **Plandex v2** | 2025-04-16 | GitHub | ⭐⭐⭐ | 257⭐ | 코딩 에이전트 진화 |
| **Crawl4AI** | 2026-01-16 | Web | ⭐⭐ | 2⭐ | 웹 크롤러 고도화 |

---

## 🧬 시장 트렌드 분석

### 1. **Telegram 기반 셀프 호스팅이 표준화되는 듯**

- **OpenClaw**: Telegram + 셀프 호스팅 + Gateway 데몬
- **PocketPaw**: Telegram + 셀프 호스팅 + Python pip 설치
- **공통점:**
  - Telegram이 인터페이스 표준이 됨
  - 셀프 호스팅으로 프라이버시 강조
  - 30초-1분 내 설치 용이성 추구

### 2. **앱 스토어/레지스트리 개념이 부상**

- **AgentSystems**: AI 에이전트의 연합형 앱 스토어
- **MCP Jungle**: MCP 서버 레지스트리 + 게이트웨이
- **추세:** 에이전트를 "앱"처럼 관리, 배포, 제어하려는 흐름
- **미래:** 에이전트 생태계가 마켓플레이스화될 가능성

### 3. **보안 프라이버시가 핵심 차별점**

- **OpenClaw 취약성 사건:** 93% 배포 취약 → 사회적 신뢰 위협
- **솔루션들:**
  - Guardian AI (PocketPaw): 위험 명령 검사
  - File Jail: 허용된 디렉토리 외 제한
  - Single User Lock: 소유자만 제어
  - Hash-chained 감사 로그

### 4. **다중 모델 & 하이브리드 아키텍처**

- 모든 트렌드 프로젝트가 다중 LLM 지원
- 로컬 (Ollama) + 클라우드 (OpenAI, Anthropic) 하이브리드
- 모델 추상화 레이어 필수

### 5. **성능 및 컨텍스트 확장**

- **Plandex v2**: 2M 토큰 컨텍스트 (효과적), 20M+ 인덱싱
- 대형 프로젝트/데이터셋 처리 능력이 경쟁력

---

## 🎯 PocketPaw와 OpenClaw 비교

### 공통점 ✅
| 특징 | OpenClaw | PocketPaw |
|------|----------|-----------|
| Telegram 제어 | ✅ | ✅ |
| 셀프 호스팅 | ✅ | ✅ |
| 브라우저 제어 | ✅ | ✅ |
| 로컬 LLM (Ollama) 옵션 | ✅ | ✅ |
| 보안 강조 | ✅ | ✅ |
| GitHub 오픈 소스 | ✅ | ✅ |

### 차별점 🔴
| 특징 | OpenClaw | PocketPaw |
|------|----------|-----------|
| 언어 | TypeScript/Node.js | Python (uv, pipx) |
| 설치 | Docker 등 복잡 | One-command: `pip install` |
| 스킬 시스템 | ✅ 확장 가능 | ❌ 기본 에이전트 기능만 |
| 다중 채널 | Telegram, Discord, Signal, iMessage | Telegram 전용 |
| 세션/메모리 | 세션 기반 관리 | Agent Mode 제어 |
| 크론 스케줄링 | ✅ | 불명 |
| 아키텍처 | Gateway 데몬 + 에이전트 | 싱글 에이전트 |

### PocketPaw의 전략적 이점 🔥
1. **진입 장벽 최소화:** 30초 설치 (Docker나 YAML 없음)
2. **단순함:** 1 커맨드, Auto-setup
3. **초보자 친화적:** "개발자용"이 아닌 "인간용" 마케팅
4. **Cross-platform:** macOS, Windows, Linux 일관 경험
5. **Guardian AI:** 사용자 안정감 향상

---

## 💡 전략적 제언

### OpenClaw가 고려해야 할 전략

1. **설치 용이성 개선**
   - 현재: Docker 등 복잡한 설정 필요
   - 개선: One-command 설치 (npm install/openclaw init 등)
   - PocketPaw의 "30초" 경험 벤치마크

2. **스킬 시스템 박물관화**
   - 스킬 시스템이 경쟁력이라는 점 강조
   - 에이전트 생태계 구축 (AgentSystems 아이디어)
   - 커뮤니티 스킬 퍼블리시/레지스트리

3. **보안 인증 & 교육**
   - 보안 문서 강화
   - 취약성 스캐너 제공
   - Guardian AI 스킬 배포

4. **Telegram + 다중 채널 우위 활용**
   - PocketPaw는 Telegram 전용
   - OpenClaw는 다중 채널 (Telegram, Discord, Signal, iMessage)
   - 글로벌 사용자 커버리지 강조

5. **커뮤니티 & 마케팅**
   - Show HN 전략적 제출 (PocketPaw 최근 성공 사례)
   - Reddit /r/selfhosted, /r/opensource 커뮤니티 참여
   - 성공 사례 콘텐츠 마케팅

---

## 🔮 미래 전망

### 12~24개월 내 예측

1. **Telegram 표준화 계속**: 더 많은 프로젝트가 Telegram 채택
2. **앱 스토어 에코시스템**: AgentSystems, MCP Jungle 개념 확산
3. **셀프 호스팅 자동화**: 1 커맨드 설치, zero-config
4. **보안/감사 표준**: Guardian AI, hash-chained logs, egress proxy
5. **하이브리드 아키텍처 보편화**: 로컬 + 클라우드

### 6~12개월 내 전망

1. **PocketPaw 커뮤니티 확장**: 30초 설치 초보자 유입
2. **OpenClaw → PocketPaw 마이그레이션**: 일부 사용자 이동 가능
3. **AgentSystems 에이전트 인덱스 확장**: 0 → 100+ 에이전트 출판
4. **MCP 생태계 표준화**: 더 많은 에이전트/도구가 MCP 지원

---

## 📚 추가 조사 필요 항목

1. **PocketPaw GitHub 활동**: Stars, Forks, RecentCommits 커뮤니티 규모
2. **AgentSystems 레포지토리**: 실제 구현, 인덱스 상태, 커뮤니티
3. **Product Hunt 최신 AI 에이전트 프로젝트**: 2025-12 ~ 2026-02 업보트 순위
4. **MCP 프로토콜 채택도**: 실제 생산 환경 사용 사례
5. **OpenClaw 취약성 사건 후속**: 보안 패치, 커뮤니티 반응

---

## 📌 결론

**최신 트렌드는 Telegram 기반 셀프 호스팅이 표준화되고 있음**

1. **PocketPaw가 30초 설치로 진입 장벽 최소화** - 초보자 친화적
2. **AgentSystems가 앱 스토어 개념 도입** - 에이전트 생태계 형성
3. **Plandex v2가 코딩 에이전트 성능 극대화** - 2M 토큰 컨텍스트
4. **보안이 핵심 차별점** - 93% OpenClaw 취약 배포 사건 반면교사

**OpenClaw의 현재 위치:**
- ✅ 다중 채널, 스킬 시스템, Gateway 데몬 아키텍처
- ❌ 설치 장벽, 보안 신뢰, 초보자 친화도

**전략적 우선순위:**
1. One-command 설치로 진입 장벽 해결
2. 보안 강화 및 교육
3. 스킬 시스템 마케핑 및 에이전트 스토어 제도화
4. Telegram 표준화 우위 활용

---

이 리포트는 Hacker News Show HN, GitHub, 및 웹 소스를 기반으로 한 최신 트렌드 분석입니다.