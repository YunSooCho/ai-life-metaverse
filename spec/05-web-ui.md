# 웹 UI 설계 (Web UI Design) - 픽셀아트 스타일 (2026-02-16 업데이트)

## 전체 레이아웃

```
┌─────────────────────────────────────────────────┐
│  [방 메뉴] [캐릭터 목록]              [미니맵]   │
│  (픽셀 탭)    (픽셀 리스트)          (도트 맵)   │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │           GameCanvas (타일맵 스프라이트)     ││
│  │         (잔디/흙 타일 + 스프라이트 캐릭터)   ││
│  │                                             ││
│  │    [도트 말풍선]  [픽셀 하트]                ││
│  │    [픽셀 건물]                               ││
│  │                                             ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────┐│
│  │  ChatInput   │ │Inventory │ │   Quest      ││
│  │ (픽셀 입력창) │ │(도트 그리드)│ │ (RPG 로그)   ││
│  └──────────────┘ └──────────┘ └──────────────┘│
│                                                  │
│  [도트 이벤트 로그] [픽셀 보상] [레트로 토스트]    │
└─────────────────────────────────────────────────┘
```

---

## 🎨 픽셀아트 UI 테마 시스템 (Pixel Art UI Theme)

### 픽셀 폰트

**추천 폰트:**
- **Press Start 2P** - 스타일이 레트로/아케이드 느낌
- **DungGeunMo** - 한글 지원 (무료), 픽셀 스타일
- **VT323** - 8비트 스타일 (영어만)

**CSS 폰트 로딩:**
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.pixel-font {
  font-family: 'Press Start 2P', 'DungGeunMo', monospace;
  font-size: 12px;
}
```

### 색상 팔레트 (128색)

```css
/* pixel-theme.css (2026-02-16) */
:root {
  /* ===== 배경색 (8색) ===== */
  --bg-dark: #1a1a2e;
  --bg-panel: #16213e;
  --bg-light: #0f3460;
  --bg-overlay: rgba(0, 0, 0, 0.8);
  --bg-transparent: rgba(22, 33, 62, 0.95);
  --bg-success: #2a9d8f;
  --bg-warning: #e9c46a;
  --bg-danger: #e63946;

  /* ===== 텍스트색 (12색) ===== */
  --text-primary: #ffffff;
  --text-secondary: #f1faee;
  --text-muted: #a8dadc;
  --text-dim: #457b9d;
  --text-accent: #e94560;
  --text-link: #4cc9f0;
  --text-success: #2a9d8f;
  --text-warning: #e9c46a;
  --text-danger: #e63946;
  --text-highlight: #ffd700;
  --text-shadow: rgba(0, 0, 0, 0.8);
  --text-glow: rgba(76, 201, 240, 0.5);

  /* ===== 보더색 (픽셀 스타일, 10색) ===== */
  --border-light: #a8dadc;
  --border-medium: #457b9d;
  --border-dark: #1d3557;
  --border-highlight: #ffffff;
  --border-accent: #e94560;
  --border-success: #2a9d8f;
  --border-warning: #e9c46a;
  --border-danger: #e63946;
  --border-gold: #ffd700;
  --border-purple: #9370db;

  /* ===== 버튼색 (12색) ===== */
  --btn-primary: #e94560;
  --btn-primary-hover: #ff6b6b;
  --btn-primary-active: #c1121f;
  --btn-secondary: #1d3557;
  --btn-secondary-hover: #457b9d;
  --btn-success: #2a9d8f;
  --btn-success-hover: #48cae4;
  --btn-warning: #e9c46a;
  --btn-warning-hover: #f4a261;
  --btn-danger: #e63946;
  --btn-danger-hover: #f77f00;
  --btn-disabled: #6c757d;

  /* ===== 건물색 (20색 - 5개 건물 각 4색) ===== */
  /* 상점 - 빨강 계열 */
  --building-shop: #e63946;
  --building-shop-light: #f4a261;
  --building-shop-dark: #6d2e2e;
  --building-shop-text: #ffffff;
  /* 카페 - 갈색/커피 계열 */
  --building-cafe: #8d99ae;
  --building-cafe-light: #cbb6a8;
  --building-cafe-dark: #454b5e;
  --building-cafe-text: #fff;
  /* 공원 - 초록/자연 계열 */
  --building-park: #2a9d8f;
  --building-park-light: #48cae4;
  --building-park-dark: #1d4e5f;
  --building-park-text: #ffffff;
  /* 도서관 - 파랑/지식 계열 */
  --building-library: #457b9d;
  --building-library-light: #a8dadc;
  --building-library-dark: #1d3557;
  --building-library-text: #ffffff;
  /* 체육관 - 주황/활동 계열 */
  --building-gym: #ff6b6b;
  --building-gym-light: #ffd700;
  --building-gym-dark: #c1121f;
  --building-gym-text: #ffffff;

  /* ===== 감정색 (16 감정 각 3색 = 48색) ===== */
  /* happy - 금색/노랑 */
  --emotion-happy: #ffd700;
  --emotion-happy-light: #ffed4e;
  --emotion-happy-dark: #b8860b;
  /* sad - 하늘/슬픔 */
  --emotion-sad: #87ceeb;
  --emotion-sad-light: #b0e0e6;
  --emotion-sad-dark: #4682b4;
  /* angry - 빨강/화남 */
  --emotion-angry: #dc143c;
  --emotion-angry-light: #ff6b6b;
  --emotion-angry-dark: #8b0000;
  /* surprised - 오렌지/놀라움 */
  --emotion-surprised: #ff8c00;
  --emotion-surprised-light: #ffa500;
  --emotion-surprised-dark: #ff4500;
  /* neutral - 회색/중립 */
  --emotion-neutral: #d3d3d3;
  --emotion-neutral-light: #f0f0f0;
  --emotion-neutral-dark: #a9a9a9;
  /* love - 핑크/사랑 */
  --emotion-love: #ff69b4;
  --emotion-love-light: #ffb6c1;
  --emotion-love-dark: #c71585;
  /* hate - 진회/혐오 */
  --emotion-hate: #2f4f4f;
  --emotion-hate-light: #696969;
  --emotion-hate-dark: #1a1a1a;
  /* fear - 보라/두려움 */
  --emotion-fear: #9370db;
  --emotion-fear-light: #ba55d3;
  --emotion-fear-dark: #4b0082;
  /* excited - 밝은 분홍/흥분 */
  --emotion-excited: #ff1493;
  --emotion-excited-light: #ff69b4;
  --emotion-excited-dark: #c71585;
  /* tired - 어두운 회색/피로 */
  --emotion-tired: #778899;
  --emotion-tired-light: #b0c4de;
  --emotion-tired-dark: #2f4f4f;
  /* confused - 회갈색/혼란 */
  --emotion-confused: #cd853f;
  --emotion-confused-light: #deb887;
  --emotion-confused-dark: #8b4513;
  /* proud - 밝은 녹색/자부심 */
  --emotion-proud: #32cd32;
  --emotion-proud-light: #90ee90;
  --emotion-proud-dark: #228b22;
  /* shy - 연분홍/수줍음 */
  --emotion-shy: #ffb6c1;
  --emotion-shy-light: #ffc0cb;
  --emotion-shy-dark: #db7093;
  /* embarrassed - 주황/민망 */
  --emotion-embarrassed: #ffa07a;
  --emotion-embarrassed-light: #ff6347;
  --emotion-embarrassed-dark: #cd5c5c;
  /* curious - 보라/호기심 */
  --emotion-curious: #da70d6;
  --emotion-curious-light: #ee82ee;
  --emotion-curious-dark: #ba55d3;
  /* disgusted - 연두색/역겨움 */
  --emotion-disgusted: #90ee90;
  --emotion-disgusted-light: #98fb98;
  --emotion-disgusted-dark: #006400;

  /* ===== 타일맵 색상 (20색) ===== */
  --tile-grass: #567d46;
  --tile-grass-light: #8fbc8f;
  --tile-grass-dark: #2e4e36;
  --tile-dirt: #8b7355;
  --tile-dirt-light: #d2b48c;
  --tile-dirt-dark: #583826;
  --tile-water: #4682b4;
  --tile-water-light: #87ceeb;
  --tile-water-dark: #191970;
  --tile-road: #696969;
  --tile-road-light: #a9a9a9;
  --tile-road-dark: #2f4f4f;
  --tile-stone: #696969;
  --tile-stone-light: #808080;
  --tile-stone-dark: #2f4f4f;
  --tile-wood: #8b4513;
  --tile-wood-light: #deb887;
  --tile-wood-dark: #583826;
  --tile-sand: #f4a460;
  --tile-sand-light: #faebd7;
  --tile-sand-dark: #d2691e;

  /* ===== FX/이펙트 색상 (16색) ===== */
  --fx-heart: #ff69b4;
  --fx-skull: #2f4f4f;
  --fx-dust: #d2b48c;
  --fx-ripple: #87ceeb;
  --fx-sparkle: #ffd700;
  --fx-glow: #fff8dc;
  --fx-fire: #ff4500;
  --fx-ice: #00bfff;
  --fx-poison: #32cd32;
  --fx-burn: #ff8c00;
  --fx-freeze: #4169e1;
  --fx-shock: #ffff00;
  --fx-heal: #00ff7f;
  --fx-curse: #4b0082;
  --fx-bless: #ffd700;
  --fx-teleport: #00ffff;
}
```

### 픽셀 스타일 컴포넌트

```css
/* 도트 보더 */
.pixel-border {
  border: 2px solid var(--border-light);
  box-shadow:
    2px 0 0 var(--border-dark),
    0 2px 0 var(--border-dark),
    2px 2px 0 var(--border-dark),
    inset 1px 1px 0 var(--border-highlight);
}

/* 레트로 버튼 */
.pixel-button {
  font-family: 'Press Start 2P';
  background: var(--btn-primary);
  color: var(--text-primary);
  border: 3px solid;
  border-color: #a00 #500 #500 #a00;  /* 픽셀 돌출 효과 */
  padding: 8px 16px;
  cursor: pointer;
}
.pixel-button:active {
  border-color: #500 #a00 #a00 #500;  /* 픽셀 눌림 효과 */
}

/* 도트 그리드 (인벤토리) */
.pixel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* 4x4 그리드 */
  gap: 8px;
}
.pixel-grid-item {
  width: 48px;
  height: 48px;
  border: 2px solid var(--border-light);
  background: var(--bg-panel);
  image-rendering: pixelated;  /* 픽셀 렌더링 */
}
```

---

---

## 컴포넌트 트리

```
App.jsx
├── RoomMenu.jsx          - 방 선택/생성 메뉴
├── CharacterList.jsx     - 접속 중인 캐릭터 목록
├── GameCanvas.jsx        - 메인 2D Canvas
│   ├── 맵 그리드 렌더링
│   ├── 건물 렌더링 (5개 건물)
│   ├── 캐릭터 렌더링
│   └── 클릭 감지 (이동, 건물 입장, 인터랙션)
├── MiniMap.jsx           - 미니맵 (우측 상단)
│   ├── 건물 위치 표시
│   ├── 플레이어 위치 (흰색)
│   └── AI 캐릭터 위치 (노란색)
├── Character.jsx         - 캐릭터 렌더링
├── ChatBubble.jsx        - Speech bubble
├── ChatInput.jsx         - 채팅 입력 (textarea)
│   ├── Enter → 전송
│   └── Shift+Enter → 줄바꿈
├── InteractionMenu.jsx   - 인터랙션 메뉴
├── AffinityDisplay.jsx   - 호감도 표시
├── CharacterProfile.jsx  - 캐릭터 프로필 카드 UI
├── Inventory.jsx         - 인벤토리 UI
│   ├── 아이템 목록
│   └── 아이템 사용 버튼
├── Reward.jsx            - 보상 UI
│   ├── 보상 목록
│   └── 수령 완료 표시
├── Quest.jsx             - 퀘스트 UI
│   ├── 활성 퀘스트 목록
│   ├── 목표 진행률
│   └── 보상 정보
├── EventLog.jsx          - 이벤트 로그 (건물 입장 등)
└── Toast.jsx             - 토스트 알림
```

---

## Custom Hooks

### useSocketEvent.js
- Socket.io 이벤트 리스너 등록/해제 관리
- 컴포넌트 마운트/언마운트 시 자동 정리

### useCharacter.js
- 캐릭터 상태 관리 (위치, 호감도, 감정)
- 캐릭터 데이터 페칭

---

## 주요 UI 기능 (픽셀아트 스타일)

### 1. GameCanvas - 스프라이트/타일맵 렌더링 (Phase 2 완료 2026-02-16)
- **Canvas API:** `image-rendering: pixelated` (픽셀 선명 유지)
- **맵 배경:** 타일맵 스프라이트 (잔디/흙/길/물 등 16x16 프레임)
  - 잔디 (#4CAF50), 흙길 (#8D6E63), 돌바닥 (#757575)
  - 물, 모래, 나무바닥, 벽돌 등 총 16개 타일
- **건물:** 픽셀아트 건물 스프라이트 (SVG)
  - 상점: 빨간 지붕 + "상점" 텍스트 (128x128px)
  - 카페: 파라솔 지붕 + "카페" 텍스트 (128x128px)
  - 공원: 나무 2개 + 화단 + "공원" 텍스트 (200x160px)
  - 도서관: 기둥 3개 + 책 선반 + "도서관" 텍스트 (150x140px)
  - 체육관: 빨간 지붕 + "체육관" 텍스트 (160x140px)
- **입구 하이라이트:** 점선 테두리 (entrance_highlight.svg)
- **캐릭터:** 픽셀아트 캐릭터 스프라이트 (SVG, 4x4 그리드)
  - 블루 캐릭터 (idle, walk_up/down/left/right)
  - 레드, 그린, 퍼플 캐릭터 (idle)
- **감정 이모지:** 16x16 픽셀 이모지 스프라이트 (캐릭터 위 표시)
- **클릭 이펙트:** 도트 리플 스플래시 (하트 이모지)

**파일 구조 (2026-02-17 업데이트):**
```
frontend/public/images/sprites/
├── buildings/
│   └── buildings.svg (모든 건물 통합, viewBox 0 0 800 200)
├── character/
│   └── RPGCharacterSprites32x32.svg (32x32 캐릭터 스프라이트)
├── tiles/
│   └── tilemap.svg (타일맵)
├── effects/
│   └── entrance_highlight.svg (입구 하이라이트)
└── emojis/
    └── 16emotions.svg (16개 감정 이모지)
```

**건물 소스 좌표 (buildings.svg):**
```javascript
const buildingSources = {
  shop: { x: 0, y: 0, width: 128, height: 128 },
  cafe: { x: 128, y: 0, width: 128, height: 128 },
  park: { x: 256, y: 0, width: 200, height: 160 },
  library: { x: 464, y: 0, width: 150, height: 140 },
  gym: { x: 620, y: 0, width: 160, height: 140 }
}
```

**spriteLoader.js:**
- 경로: `/images/{path}` (public/images/sprites/ 폴더 기준)
- 캐싱 시스템: Map-based 캐시
- preloadAssets(): 여러 스프라이트 미리 로드
- **중요 (2026-02-17):** 모든 스프라이트 파일은 `.svg` 포맷

### 2. ChatBubble - 도트 말풍선
- 스타일: RPG 말풍선 (점선 테두리, 돌출 꼬리)
- 폰트: 'Press Start 2P', 10px
- 배경: rgba(22, 33, 62, 0.95)
- 보더: 2px solid var(--border-light)
- 텍스트: var(--text-primary)
- **CSS:**
  ```css
  .pixel-chat-bubble {
    background: var(--bg-panel);
    border: 2px solid var(--border-light);
    border-radius: 0;  /* 픽셀 스타일 (둥글지 않음) */
    padding: 8px;
    font-family: 'Press Start 2P';
    font-size: 10px;
    color: var(--text-primary);
    box-shadow: 2px 2px 0 var(--border-dark);
  }
  ```

### 3. ChatInput - 픽셀 입력창
- 픽셀 폰트: 'Press Start 2P', 12px
- 스타일: 레트로 텍스트 박스
  - 배경: var(--bg-panel)
  - 보더: 3px solid var(--border-light)
  - 돌출 효과: `box-shadow: 2px 2px 0 var(--border-dark)`
- 버튼: 픽셀 버튼 (전송)
  - "SEND" 텍스트 (Press Start 2P)
  - 색상: var(--btn-primary)
  - 돌출/눌림 효과

### 4. InteractionMenu - RPG 메뉴
- 스타일: RPG 대화 선택 메뉴 (화살표 커서)
- 리스트:
  - 인터랙션 옵션들 (대화, 선물, 악수 등)
  - 화살표 `►` 커서 (픽셀 폰트)
- 색상:
  - 옵션: var(--text-primary)
  - 선택된 옵션: var(--text-secondary)
- 전환: 키보드 방향키 (위/아래)

### 5. MiniMap - 도트 미니맵
- Canvas: 3픽셀 dot 맵
  - 플레이어: 흰색 dot
  - AI 캐릭터: 노란색 dot
  - 건물: 각 건물색 (빨강/갈색/초록/파랑/주황) 4x4 dot
- 배경: 투명 (어두운 반원)
- 스케일: 1/4 배율

### 6. Inventory - 도트 그리드
- 스타일: 4x4 픽셀 그리드
- 각 셀: 32x32 픽셀
- 아이템: 16x16 픽셀 아이콘
- 선택된 셀: 밝은 하이라이트 보더
- 사용 버튼: 픽셀 버튼 하단에 표시
- **CSS:**
  ```css
  .pixel-inventory-grid {
    display: grid;
    grid-template-columns: repeat(4, 32px);
    gap: 4px;
  }
  .pixel-inventory-item {
    width: 32px;
    height: 32px;
    border: 2px solid var(--border-dark);
    background: var(--bg-panel);
    image-rendering: pixelated;
  }
  .pixel-inventory-item.selected {
    border-color: var(--border-highlight);
    box-shadow: inset 2px 2px 0 var(--btn-primary);
  }
  ```

### 7. Reward - 픽셀 보상 팝업
- 스타일: 레트로 RPG 보상 화면
- 보더: 돌출 3D 효과
- 배경: var(--bg-panel)
- 각 보상 아이템:
  - 아이콘: 16x16 픽셀
  - 이름: 픽셀 폰트
  - 수량: "+N" 텍스트
- "닫기" 버튼: 픽셀 버튼

### 8. Quest - RPG 퀘스트 로그
- 스타일: RPG 퀘스트 로그
- 리스트:
  - 각 퀘스트: 도트 아이콘 + 제목 + 진행률
  - 제목: 픽셀 폰트 (14px)
  - 진행률: "[3/5]" 스타일
- 상태:
  - 활성: var(--text-primary)
  - 완료: var(--emotion-happy) (금색)
- 보상 정보: 하단에 도트 아이콘으로 표시

### 9. RoomMenu - 레트로 탭 메뉴
- 스타일: 픽셀 탭 메뉴 (상단)
- 각 탭:
  - 비선택: 어두운 배경
  - 선택된 탭: 하이라이트 보더
- 내용: 방 이름 (픽셀 폰트 14px)
- "방 만들기" 버튼: 픽셀 버튼

**Props (2026-02-17 업데이트):**
- `show` (boolean): 표시 여부
- `rooms` (array): 방 목록
- `currentRoom` (object): 현재 방 `{ id, name }` - **타입 변경: string → object**
- `onJoinRoom` (func): 방 입장 핸들러
- `onCreateRoom` (func): 방 생성 핸들러
- `onClose` (func): 닫기 핸들러

**버그 수정 (2026-02-17, Issue #39):**
- currentRoom 타입: PropTypes.string → PropTypes.shape({ id, name })
- defaultProps 제거 → JavaScript default parameters 사용 (React 18 호환성)
- isActive 계산: `room.id === currentRoom` → `room.id === currentRoom.id`

### 10. AffinityDisplay - 픽셀 하트/호감도
- 하트: 16x16 픽셀 하트 스프라이트
- 색상:
  - 0-30: 회색 하트
  - 31-60: 하얀 하트
  - 61-80: 핑크 하트
  - 81-100: 빨강 하트
- 호감도 텍스트: "❤️ 72" (픽셀 이모지 + 숫자)

### 11. Toast - 레트로 토스트 알림
- 스타일: 레트로 RPG 알림
- 배경: var(--bg-panel)
- 보더: 돌출 3D
- 아이콘: 16x16 픽셀 (check, info, warning)
- 텍스트: 픽셀 폰트 (10px)
- 애니메이션: slide-down (200ms)

### 12. EventLog - 도트 이벤트 로그
- 스타일: RPG 이벤트 로그 (우측)
- 각 이벤트:
  - 도트 아이콘 (입장/퇴장/대화 등)
  - 시간: "[HH:MM]" 스타일
  - 메시지: 픽셀 폰트 (10px)
- 배경: 반투명 어두운
- 스크롤: 픽셀 스크롤바

### 13. CharacterProfile - 캐릭터 프로필 카드 UI (2026-02-17 완료)
- **목표:** 캐릭터 클릭 시 상세 프로필 카드 표시
- **위치:** `frontend/src/components/CharacterProfile.jsx`
- **스타일:** 픽셀아트 레트로 스타일
- **프로필 내용:**
  - 캐릭터 이모지 (48px, 상단 중앙)
  - 이름 (Press Start 2P 폰트, 16px)
  - 감정 이모지 (있을 경우)
  - 호감도 바 (0-10 척도, 색상별 표시)
    - 0-2: 빨강 (#ff4444) - "낯설음"
    - 3-7: 오렌지 (#ff8800) - "친근"
    - 8+: 초록 (#00cc44) - "매우 친근"
  - 현재 활동 상태:
    - 대화 중: "대화 중..."
    - 건물 내: "건물에 있음"
    - 이동 중: "이동 중"
  - AI 캐릭터 표시: "🤖 AI 캐릭터"
- **UI 크기:**
  - 카드 너비: 200px × scale
  - 카드 높이: 280px × scale
  - 패딩: 16px × scale
- **스타일:**
  - 배경: #1a1a2e (어두운 네이비)
  - 보더: 3px solid #4a4a6a (회색 테두리)
  - 그림자: 0 4px 16px rgba(0, 0, 0, 0.5)
  - 픽셀 렌더링: imageSmoothingEnabled = false
- **동작:**
  - 캐릭터 클릭 → 프로필 카드 표시 (캐릭터 위치 상단)
  - 닫기 버튼 (✕) 클릭 → 카드 닫기
  - 카드 외부 클릭 → 카드 닫기
- **Props:**
  ```javascript
  {
    character: {
      id: string,
      name: string,
      emoji: string,
      isAi: boolean,
      isConversing: boolean,
      buildingId: string,
      emotion: {
        type: string,
        emoji: string
      }
    },
    affinity: number,  // 0-10
    isVisible: boolean,
    onClose: () => void,
    scale: number  // 기본값 1.0
  }
  ```
- **GameCanvas 통합 (2026-02-17):**
  - `selectedCharacter` 상태 추가
  - `handleCanvasClick` 핸들러에서 캐릭터 클릭 감지
  - 클릭 반경: 25px (맵 좌표 기준)
  - `CharacterProfile` 컴포넌트 렌더링 (캔버스 오버레이)
- **테스트:** `tests/character-profile.test.js` (26개 테스트 통과)
  - 호감도 색상 변환 테스트 (빨강/오렌지/초록)
  - 호감도 라벨 변환 테스트 ("낯설음"/"친근"/"매우 친근")
  - 활동 상태 변환 테스트 ("대화 중..."/"건물에 있음"/"이동 중")
  - 호감도 바 계산 테스트 (0-100%)
  - 스케일 계산 테스트 (cardWidth, cardHeight, fontSize)
  - GameCanvas 클릭 감지 테스트 (좌표 변환, 반경 검사)

---

---

## 반응형 디자인

- **모바일 대응:** 터치 이벤트 지원
- **외부 접속:** `host: 0.0.0.0` (vite.config.js)
- **스마트폰:** handleCanvasClick (마우스/터치 동일 처리)

---

## 🎨 Phase 3: UI 컴포넌트 레트로 스타일링 완료 (2026-02-17 04:35)

### 구현 완료 내용

**1. pixel-theme.css 생성**
- **위치:** `frontend/src/styles/pixel-theme.css` (10,842 bytes)
- **픽셀 폰트:** 'Press Start 2P' (Google Fonts)
- **색상 팔레트:** 32色限定 (CSS Variables)
- **주요 클래스:**
  - `.pixel-font`: 픽셀 폰트 적용
  - `.pixel-border-sm/md/lg`: 도트 보더
  - `.pixel-button`: 레트로 버튼 (돌출/눌림 효과)
  - `.pixel-input`: 픽셀 입력창
  - `.pixel-panel`: 레트로 패널
  - `.pixel-chat-bubble`: 도트 말풍선
  - `.pixel-menu`: RPG 메뉴 스타일
  - `.pixel-toast`: 레트로 토스트 알림
  - `.pixel-grid`: 픽셀 그리드 (인벤토리/퀘스트)
  - `.pixel-badge`: 픽셀 뱃지
  - `.pixel-pop/pop-bounce/shake`: 픽셀 애니메이션

**2. 전역 픽셀 폰트 적용**
- `App.css`에 `body, button, input, textarea, select { font-family: 'Press Start 2P', monospace; }` 추가
- 모든 UI 요소에 픽셀 폰트 전역 적용 완료

**3. 컴포넌트 스타일링 완료**

| 컴포넌트 | 수정 파일 | 적용 스타일 | 상태 |
|---------|----------|----------|------|
| ChatBubble | `ChatBubble.jsx` | 도트 말풍선 (Press Start 2P, rect, path) | ✅ 완료 |
| ChatInput | `ChatInput.jsx` | 픽셀 입력창 + "SEND" 버튼 | ✅ 완료 |
| InteractionMenu | `InteractionMenu.jsx` | RPG 메뉴 (화살표 커서, pixel-badges) | ✅ 완료 |
| Inventory | `Inventory.jsx` | 도트 그리드 (pixel-grid, pixel-icons) | ✅ 완료 |
| Quest | `Quest.jsx` + `Quest.css` | RPG 퀘스트 로그 (pixel-badges, pixel-buttons) | ✅ 완료 |
| RoomMenu | `RoomMenu.jsx` | 레트로 방 메뉴 (pixel-input, pixel-buttons) | ✅ 완료 |
| Toast | `Toast.jsx` | 레트로 토스트 알림 (pixel-toast) | ✅ 완료 |
| Reward | `Reward.jsx` | 레트로 보상 센터 (pixel-grid, pixel-badges) | ✅ 완료 |
| CharacterProfile | `CharacterProfile.jsx` | 캐릭터 프로필 카드 (픽셀 스타일, 호감도 바) | ✅ 완료 (2026-02-17) |

**3. App.jsx import 추가**
```javascript
import './styles/pixel-theme.css'  // Phase 3: 픽셀아트 테마 전역 적용
```

**4. 픽셀 폰트 적용 상태**
- Google Fonts: 'Press Start 2P' → ✅ 로드 완료
- 기본 폰트: Arial/Sans-serif → Press Start 2P로 전환
- 문자 크기: pixel-text-sm (9px) / pixel-text-md (11px) / pixel-text-lg (13px) / pixel-text-xl (16px)

**5. 색상 팔레트 실제 적용**
```css
:root {
  --pixel-bg-primary: #1a1a2e;
  --pixel-bg-secondary: #16213e;
  --pixel-accent-green: #4ade80;
  --pixel-accent-orange: #fb923c;
  --pixel-accent-red: #f87171;
  --pixel-accent-blue: #60a5fa;
  --pixel-accent-cyan: #22d3ee;
  --pixel-accent-purple: #c084fc;
  --pixel-accent-yellow: #fbbf24;
  --pixel-text-primary: #ffffff;
  --pixel-text-secondary: #a3a3a3;
  --pixel-text-muted: #737373;
}
```

**6. 레트로 보더 스타일 적용**
```css
.pixel-border-sm {
  border: 1px solid #ffffff;
  box-shadow: 2px 2px 0 0 #000;
}

.pixel-border-md {
  border: 2px solid #ffffff;
  box-shadow: 4px 4px 0 0 #000;
}
```

**7. 픽셀 버튼 스타일 적용**
```css
.pixel-button {
  font-family: 'Press Start 2P', monospace;
  padding: 12px 20px;
  border: 2px solid #ffffff;
  background: var(--pixel-bg-primary);
  box-shadow: 4px 4px 0 0 #000;
}

.pixel-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 0 #000;
}
```

---

## 테스트 요구사항 (Phase 3)

**테스트 파일:** `frontend/src/components/__tests__/Phase3.spec.js`

**테스트 항목:**
1. pixel-theme.css import 확인
2. ChatBubble 도트 말풍선 렌더링
3. ChatInput 픽셀 입력창 렌더링
4. InteractionMenu RPG 메뉴 렌더링
5. Inventory 도트 그리드 렌더링
6. Quest 퀘스트 로그 렌더링
7. RoomMenu 방 메뉴 렌더링
8. Toast 레트로 알림 렌더링
9. Reward 보상 센터 렌더링
10. 픽셀 폰트 적용 확인 (Press Start 2P)

---

## 📋 Phase 4 다음 단계 (감정 표현 & FX 강화)

**GitHub Issue:** #29

**기능:**
- 16 감정 스프라이트 구현 (happy, sad, angry, surprised, neutral, love, hate, fear, excited, tired, confused, proud, shy, embarrassed, curious, disgusted)
- 감정 변화 애니메이션 (pop-in, bounce)
- FX 스프라이트 (점프 효과 dust particle, 하트/호감도 상승, 데드/감정 하락, 대기/로딩)
- 클릭 시 시각 피드백 (ripple effect)

---

*마지막 업데이트: 2026-02-16 23:30 (Phase 3 완료)*

---

## 국제화 (i18n)

### 지원 언어
- **한국어 (ko)** - 기본 언어
- **일본어 (ja)**
- **영어 (en)**

### 구현 방식
- **Backend:** API 응답에서 `clientLang` 파라미터 기반으로 언어별 텍스트 반환
- **Frontend:** `i18n/` 폴더에 JSON 텍스트 리소스 파일
- **State:** App.jsx에서 `userLang` 상태 관리, `localStorage`에 저장
- **언어 전환:** Settings UI에서 선택 또는 브라우저 자동 감지

### 데이터 구조
```json
// i18n/ko.json
{
  "ui": {
    "title": "AI 라이프",
    "rooms": "방",
    "inventory": "인벤토리",
    "rewards": "보상"
  },
  "character": {
    "player": "플레이어",
    "aiYuri": "AI 유리"
  },
  "quests": {
    "active": "활성 중",
    "available": "수락 가능"
  }
}

// i18n/ja.json
{
  "ui": { "title": "AIライフ" },
  ...
}

// i18n/en.json
{
  "ui": { "title": "AI Life" },
  ...
}
```

### 적용 범위
- ✅ UI 텍스트 (버튼, 헤더, 라벨)
- ✅ 캐릭터 이름
- ✅ 퀘스트 텍스트
- ✅ 시스템 메시지
- ❌ AI 대화 (개별 대화 텍스트는 실시간 번역 사용 고려)

### API 확장
`GET /api/characters?lang=ja` → 일본어 이름 반환
`GET /api/quests?lang=en` → 영어 퀘스트 텍스트 반환

---

## 사운드 시스템

### 구현 방식
- **Web Audio API:** 사운드 파일 없이 프로그래밍 방식으로 사운드 생성
- **오디오 컨텍스트:** 사용자 제스처 후 초기화 필수
- **싱글톤 패턴:** `soundSystem` 모듈로 전역 접근

### BGM 시스템
```javascript
soundSystem.init()  // 제스처 후 초기화
soundSystem.playBgm('day')    // 아침/낮/저녁/밤
soundSystem.setBgmVolume(0.5)
soundSystem.stopBgm('day')
soundSystem.stopAllBgm()
```

### 효과음 (SFX)
```javascript
soundSystem.playClick()         // 클릭
soundSystem.playInteract()      // 인터랙션
soundSystem.playItemUse()       // 아이템 사용
soundSystem.playQuestComplete() // 퀘스트 완료
```

### 날씨 환경음
```javascript
soundSystem.startWeatherSound('RAIN')  // 비/눈 소리
soundSystem.stopWeatherSound()
```

### 볼륨 제어 & 음소거
```javascript
soundSystem.setBgmVolume(0.3)
soundSystem.setSfxVolume(0.5)
soundSystem.toggleMute()  // returns: boolean
```

### 시간대별 BGM
| 시간대 | 주파수 | 파형 | 특징 |
|--------|--------|------|------|
| 아침 (morning) | 440Hz | sine | 밝은 톤 |
| 낮 (day) | 523.25Hz | triangle | 활기 |
| 저녁 (evening) | 392Hz | sine | 차분 |
| 밤 (night) | 330Hz | sine | 어두운 톤 |

### 파일 위치
- `frontend/src/utils/soundSystem.js` - 핵심 로직
