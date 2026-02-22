# OpenCode 하트비트 자동화 가이드 (2026-02-15 검증 완료)

## ✅ 하트비트에서 OpenCode 실행 방법

**2026-02-15 하트비트에서 검증 완료한 자동화 방법입니다!**

### TMUX + OPENCODE 절차

```bash
# 1. tmux session 생성
tmux kill-session -t opencode 2>/dev/null || true
tmux new-session -d -s opencode

# 2. 프로젝트 폴더로 이동 + OpenCode 실행
tmux send-keys -t opencode "cd /Users/clks001/.openclaw/workspace/ai-life-metaverse && clear" Enter
sleep 1
tmux send-keys -t opencode "opencode" Enter
sleep 5

# 3. Prompt 입력
tmux send-keys -t opencode "작업 설명" Enter

# 4. 결과 대기 및 확인
sleep 30  # 작업 복잡도에 따라 30~60초 조절
tmux capture-pane -t opencode -p -S -100
```

### 성공 사례 (2026-02-15)

**작업:** AI Agent chatMessage 이벤트 수신 + GLM-4.7 응답 생성

**Prompt:**
```
ai-agent/agent.js에서 Socket.io 연결과 GLM-4.7 응답 코드 작성해. 
Backend의 chatMessage 이벤트 수신하고 GLM-4.7 API로 응답 생성 후 다시 전송해.
```

**결과:**
- ✅ generateChatResponse 함수 구현 완료
- ✅ chatMessage 이벤트 수신 로직 구현 완료
- ✅ 응답 재전송 기능 구현 완료

**실행 환경:**
- Models: Cerebras zai-glm-4.7
- 소요 시간: 16.8초 (OpenCode 작업)
- 토큰: 18,769 tokens (14%)
- 비용: $0.00

### 기억할 것 (초중요!)

1. **tmux session 깨끗하게 관리**
   - 작업 시작할 때 항상 `tmux kill-session -t opencode`
   - 중복 방지

2. **sleep 시간 중요**
   - OpenCode 실행 후 최소 5초 대기 필요
   - `sleep 5` 절대 생략 금지

3. **prompt 대기**
   - 복잡도에 따라 30~60초 대기
   - GLM-4.7 응답 생성이 완료될 때까지

4. **결과 확인**
   - `tmux capture-pane`으로 결과 텍스트화
   - 작업 완료 확인 필수

### 하트비트 적용

이 방법은 HEARTBEAT.md "단계 6: 작업 실행"에 적용 가능합니다:

**하트비트 단계 6에서:**
```bash
# tmux session 생성
tmux kill-session -t opencode 2>/dev/null || true
tmux new-session -d -s opencode

# OpenCode 실행 및 작업 전송
tmux send-keys -t opencode "cd /Users/clks001/.openclaw/workspace/ai-life-metaverse && clear" Enter
sleep 1
tmux send-keys -t opencode "opencode" Enter
sleep 5
tmux send-keys -t opencode "이번 하트비트에서 할 작업 설명" Enter

# 결과 대기
sleep 60  # 복잡도에 따라 조절
tmux capture-pane -t opencode -p -S -100

# Session 정리
tmux kill-session -t opencode
```

## 🎯 이젠 하트비트마다 OpenCode로 작업 가능!

**검증 완료! 이제 하트비트마다 OpenCode를 사용해서 개발 작업을 자동화할 수 있습니다!** 🎉