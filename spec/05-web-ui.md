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

### 1. GameCanvas - 스프라이트/타일맵 렌더링
- **Canvas API:** `image-rendering: pixelated` (픽셀 선명 유지)
- **맵 배경:** 타일맵 스프라이트 (잔디/흙/길/물 등 16x16 프레임)
- **건물:** 픽셀아트 건물 스프라이트 (64x64)
  - 상점: 빨강 픽셀 아이콘 + "SHOP" 텍스트 (픽셀 폰트)
  - 카페: 갈색 컵 아이콘 + "CAFE"
  - 공원: 초록 나무 아이콘 + "PARK"
  - 도서관: 파랑 책 아이콘 + "LIBRARY"
  - 체육관: 주황 덤벨 아이콘 + "GYM"
- **캐릭터:** 32x32 픽셀아트 스프라이트
  - idle 애니메이션 (4 프레임, 200ms)
  - walk 애니메이션 (4 프레임, 150ms)
- **감정 이모지:** 16x16 픽셀 이모지 스프라이트 (캐릭터 위 표시)
- **클릭 이펙트:** 도트 리플 스프라이트 (ripple.png)

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

---

---

## 반응형 디자인

- **모바일 대응:** 터치 이벤트 지원
- **외부 접속:** `host: 0.0.0.0` (vite.config.js)
- **스마트폰:** handleCanvasClick (마우스/터치 동일 처리)

---

*마지막 업데이트: 2026-02-16*
