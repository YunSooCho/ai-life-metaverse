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
11. **날씨 시스템 v2.0**: 강화된 비/눈 애니메이션 + 부드러운 날씨 전환
   - 비: 물방울 tear-drop 형태, 바람 각도, 낙하 속도 변화
   - 눈: 눈송이 별형 (6개 꼭지), 좌우 흔들림 (swaying), 회전
   - WeatherState: 3초 페이드 인/아웃으로 부드러운 전환
12. **사운드 시스템**: BGM + 효과음 + 날씨 사운드
   - BGM: 메인 테마, day/night 테마 (fade in/out)
   - 효과음: 버튼 클릭, 이동, 알림, 퀘스트 완료, 아이템 획득
   - 날씨 사운드: 비, 눈 ambient
   - 볼륨 조절: 마스터, BGM, SFX, 날씨
   - 음소거 토GGLE
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
- [ ] 사운드 파일 준비 (audio/ 폴더에 BGM, SFX, 날씨 사운드 배치)
- [ ] 사운드 초기화 oneshot (사용자 interaction 이후)
- [ ] 픽셀아트 캐릭터 애니메이션 시스템 개선 (Issue #88)
- [ ] E2E 브라우저 테스트 자동화 (Issue #59)

### 완료된 작업

- ✅ 날씨 효과 강화 (비/눈 애니메이션, 페이드 전환) - Issue #41 (2026-02-18)
- ✅ 사운드 시스템 구현 (BGM, SFX, 날씨 사운드) - Issue #87 (2026-02-18)