# Overview - AI Life Metaverse

## 프로젝트 개요

AI Life Metaverse는 사용자가 AI 캐릭터와 상호작용하는 웹 기반 메타버스 게임입니다.

### 핵심 기능

1. **실시간 채팅**: Socket.io 기반 멀티유저 채팅
2. **AI 캐릭터**: GLM-4.7 기반 AI 대화 시스템
3. **캐릭터 커스터마이징**: 머리 스타일, 옷 색상, 액세서리
4. **호감도 시스템**: AI와의 상호작용에 따라 호감도 변화
5. **캐릭터 레벨 & 경험치 시스템**: 레벨(1~100), 경험치, 스테이터스 (HP, 친화력, 카리스마, 지능)
6. **방 이동**: 다른 방(공간)으로 이동 가능
7. **건물 시스템**: 건물 입장/퇴장 및 이벤트 기록
8. **퀘스트 시스템**: 퀘스트 수락 및 보상
9. **인벤토리**: 아이템 수집 및 사용
10. **보상 시스템**: 보상 수령 및 기록
11. **날씨 시스템**: 비/눈 애니메이션 효과
12. **소리 관리**: BGM 및 효과음
13. **다국어 지원**: 한국어/영어/일본어

### 기술 스택

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.io
- **AI**: Cerebras zai-glm-4.7
- **Styling**: CSS (Pixel Theme)
- **State Management**: React Hooks

### 파일 구조

```
ai-life-metaverse/
├── backend/
│   ├── server.js          # 메인 서버
│   ├── ai-agent/          # AI Agent 로직
│   ├── data/              # 데이터 파일
│   └── routes/            # API 라우트
├── frontend/
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── hooks/         # Custom Hooks
│   │   ├── i18n/          # 다국어
│   │   ├── styles/        # 스타일
│   │   └── utils/         # 유틸리티
└── spec/                  # 스펙 문서
```

### 개발 진행 상황

**Phase 3: 픽셀아트 레이아웃** (진행 중)
- 캐릭터 픽셀아트 에셋 추가
- 배경 픽셀아트 타일 매핑
- 애니메이션 시스템

### TODO

- [ ] 캐릭터 픽셀아트 에셋 구현
- [ ] 배경 픽셀아트 타일 시스템
- [ ] 날씨 효과 강화 (비/눈 애니메이션 & 사운드)
- [ ] E2E 브라우저 테스트 자동화