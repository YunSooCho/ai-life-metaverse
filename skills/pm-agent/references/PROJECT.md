# Project Template

> **이 파일을 복사하여 사용하세요.** 프로젝트별 설정을 이 파일에 정의합니다.

## GitHub Configuration

```markdown
- Repository: https://github.com/YOUR_USERNAME/YOUR_REPO.git
- Remote: origin
- PAT: ghp_XXXXXXXXXXXXXX
- User: YOUR_USERNAME
- Email: your.email@example.com

# Git Config Examples:
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Service URLs

```markdown
- Backend: http://localhost:4000
- Frontend: http://localhost:3000
- External: http://your-server-ip:port

# Status Check Commands:
curl http://localhost:4000
curl http://localhost:3000
```

## Phase Roadmap

```markdown
### Phase 1: [Phase Name]
**Status:** [진행 중|완료|일시중지]
**목표:** [이 Phase의 목표]
**남은 태스크:**
- [ ] 태스크 1
- [ ] 태스크 2
- [ ] 태스크 3

### Phase 2: [Phase Name]
**Status:** [예정|진행 중|완료]
**목표:** [이 Phase의 목표]

### Phase 3: [Phase Name]
**Status:** [예정]
**목표:** [이 Phase의 목표]
```

## Testing

```markdown
### Unit Tests
- Framework: vitest
- Command: npm test
- Setup: ./test-setup.js (if needed)

### Integration Tests
- Framework: [your framework]
- Command: [your command]

### E2E Tests
- Method: browser automation / manual
- Scenarios: e2e-scenarios.md
- Schedule: 3회에 1회 실행

# Test Commands:
npm test                           # Unit tests
npm run test:integration           # Integration tests
npm run test:e2e                   # E2E tests
```

## Development Workflow

```markdown
### Branch Strategy
- main: 프로덕션
- develop: 개발 중
- feature/*: 기능별 브랜치

### Commit Convention
- [feat]: 새로운 기능
- [fix]: 버그 수정
- [test]: 테스트 추가/수정
- [docs]: 문서 업데이트
- [spec]: spec 업데이트

### Pull Request Process
1. PR 생성
2. 리뷰 요청
3. CI 통과 확인
4. Reviewer 승인
5. Squash & Merge
```

## Cron / Automation

```markdown
### Scheduled Jobs
- Heartbeat: 30분마다
- Backup: 매일 02:00
- Notification: 중요 이벤트 발생 시

### Cron Examples:
# Heartbeat
- name: heartbeat
  schedule:
    kind: every
    everyMs: 1800000  # 30분
  sessionTarget: isolated
```

## Monitoring & Alerts

```markdown
### Status Page
- URL: http://localhost:PORT/status
- Health Checks: backend, frontend, database

### Alert Channels
- Email: devops@example.com
- Slack: #alerts-channel
- Telegram: @your-username

### Critical Alerts
- 서비스 다운
- 에러 발생률 > 5%
- 디스크 용량 > 90%
- API 응답 시간 > 2s
```

## External Services

```markdown
### APIs
- Service A: https://api.example.com
- Service B: https://api.example.com
- API Keys: [Stored in secure secret store]

### Databases
- Primary: PostgreSQL (localhost:5432)
- Cache: Redis (localhost:6379)
- Backup: S3 bucket: your-backup

### Storage
- CDN: https://cdn.example.com
- Static: /var/www/static
- Uploads: /var/www/uploads
```

## Deployment

```markdown
### Environment
- Development: local
- Staging: staging.example.com
- Production: production.example.com

### Deployment Commands
# Development
npm run dev

# Production
npm run build
npm run deploy
```

## Project-Specific Notes

```markdown
### Special Considerations
- 고유한 요구사항이나 제약 조건 기록

### Known Issues
- 알려진 문제 목록

### Dependencies
- 필수 외부 라이브러리
- 버전 제약 사항

### Security
- 인증 방식
- 암호화 요구사항
- 보안 정책
```

---

**이 파일을 프로젝트 홈에 복사하여 사용하세요.**