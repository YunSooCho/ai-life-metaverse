# 기술 스택 (Technology Stack)

## 프론트엔드

### 웹 프레임워크
- **React 18** - UI 구성
- **TypeScript** - 타입 안정성
- **React Router** - 페이지 네비게이션
- **Socket.io Client** - 실시간 통신

### UI 라이브러리
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 애니메이션
- **React-Leaflet** - 2D 맵 (또는 Canvas 기반 커스텀)
- **Phaser 3** - 2D 맵 렌더링 (선택)

### 상태 관리
- **Zustand** - 클라이언트 상태
- **React Query** - 서버 데이터 가져오기/캐싱

### 빌드 도구
- **Vite** - 빠른 개발 빌드

---

## 백엔드

### 서버 프레임워크
- **Node.js 20+**
- **Express.js** - HTTP API
- **Socket.io** - WebSocket 실시간 통신

### 데이터베이스
- **PostgreSQL 15** - 영구 저장 (SQLite로 시작 가능)
- **Redis 7** - 실시간 상태 캐싱

### 인증
- **JWT (jsonwebtoken)** - 인증 토큰
- **bcrypt** - 비밀번호 해시
- **OAuth 2.0** - Google/GitHub 로그인

### LLM 통합
- **OpenAI SDK** - GPT-4o 통합
- **Anthropic SDK** - Claude 통합 (선택적)

### API 라우팅
- **REST API** - `/api/*`
- **WebSocket** - Socket.io 이벤트

---

## AI 에이전트 (CLI/API Client)

### 런타임
- **Node.js 20+** 또는 **Python 3.11+**

### 핵심 모듈
- **axios** - HTTP API 통신
- **socket.io-client** - WebSocket 연결 (선택적)
- **openai** 또는 **anthropic** SDK - LLM 호출
- **dotenv** - 설정 관리

### 아키텍처
- **Periodic Task Runner (30초마다)** - 상황 확인 후 행동 결정
- **LLM Decision Engine** - 페르소나 + 상황 → 행동/대사 생성
- **State Manager** - 자신의 상태(에너지, 기분) 관리

---

## 인프라

### 배포
- **Docker** - 컨테이너화
- **Docker Compose** - 개발 환경 설정
- **GitHub Actions** - CI/CD

### 호스팅
- **Vercel** / **Netlify** - 프론트엔드
- **Railway** / **Render** / **AWS ECS** - 백엔드 (소규모)

### 데이터베이스 호스팅
- **Neon PostgreSQL** - 서버리스 PostgreSQL
- **Upstash Redis** - 서버리스 Redis

### 모니터링/로깅
- **Sentry** - 에러 트래킹
- **LogRocket** - 사용자 세션 리플레이 (선택적)

---

## 개발 도구

### 코드 품질
- **ESLint** - 코드 린트
- **Prettier** - 코드 포맷팅
- **Husky** - Git hooks (pre-commit)

### API 테스트
- **Postman** / **Thunder Client** - API 테스트
- **Jest** - 단위 테스트

### 데이터베이스 마이그레이션
- **Prisma** - ORM (선택적, DB 스키마 관리)

---

## 최소 스펙

### 개발 환경
- Node.js 20.11+
- npm 10+
- PostgreSQL 15+
- Redis 7+

### 프로덕션
- 1 vCPU, 1GB RAM (소규모)
- PostgreSQL: 5GB 저장소
- Redis: 256MB 메모리

---

## 향후 확장 가능성

- **Microservices** - 서버 스케일 시 분리 가능
- **GraphQL** - 복잡한 쿼리 시 사용
- **Kubernetes** - 대규모 스케일 시 사용
- **CDN** - 아바타/일러스트 이미지 전달

---

*마지막 업데이트: 2026-02-15*