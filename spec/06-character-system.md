# Character System (거래 시스템 포함)

## 캐릭터 구조

### 기본 속성

```javascript
{
  id: 'player | ai-id',
  name: '플레이어 이름',
  x: 125,        // X 좌표 (0 ~ 1000)
  y: 125,        // Y 좌표 (0 ~ 700)
  color: '#4CAF50',
  emoji: '👤',
  isAi: false    // AI 캐릭터 여부
}
```

### 커스터마이징 속성

```javascript
{
  hairStyle: 'short | medium | long',
  clothingColor: 'blue | red | green | yellow | purple',
  accessory: 'none | glasses | hat | flowers'
}
```

## 픽셀아트 캐릭터 (✅ 구현 완료)

### 사양

- **기본 사이즈:** 32x32 픽셀
- **렌더링 사이즈:** 40x40px (확대)
- **색상 팔레트:** 8비트 레트로 스타일
- **애니메이션 프레임:** 2~4 프레임 / 초

### 감정 애니메이션 시스템 (✅ 구현 완료)

| 감정 | 프레임 | 속도 | 루프 | 설명 | 상태 |
|------|----------|------|------|------|------|
| idle | 1 | 500ms | ✅ | 정지 상태 | ✅ 구현 완료 |
| happy | 2 | 300ms | ✅ | 행복 | ✅ 구현 완료 |
| sad | 2 | 400ms | ✅ | 슬픔 | ✅ 구현 완료 |
| angry | 2 | 200ms | ✅ | 화남 | ✅ 구현 완료 |
| surprised | 2 | 150ms | ✅ | 놀람 | ✅ 구현 완료 |

## 거래 시스템 (Phase 15) - ✅ 완료 (2026-02-21)

### 개요
거래 시스템은 상점, 플레이어 간 거래, 경매, 코인 시스템으로 구성됩니다.

### 완료 상태 (2026-02-21)
- **Backend:** ✅ 완전 구현 (ShopManager, TradeManager, AuctionManager, CoinManager)
- **Frontend:** ✅ 완전 구현 (Shop, Trade, Auction, Coin UI 포함)
- **테스트:** ✅ Backend 101/101 통과

### 상점 시스템 (Shop)

**Backend API:**
- `GET /api/shop/list` - 모든 상점 목록 조회
- `GET /api/shop/:shopId` - 특정 상점 조회
- `POST /api/shop/buy` - 아이템 구매
- `POST /api/shop/sell` - 아이템 판매

**Frontend UI (✅ 완료):**
- `Shop.jsx` - 상점 UI 컴포넌트
- `TradeWindow.jsx` - 거래 창 UI
- `AuctionWindow.jsx` - 경매 창 UI
- `CoinDisplay.jsx` - 코인 표시 UI

**기능:**
- 상점 목록 표시 (다중 상점 탭)
- 아이템 구매/판매 버튼
- 코인 잔액 표시
- 인벤토리 판매 가능 아이템 표시
- 재고 관리 UI
- 플레이어 간 거래 (요청/수락/거절/취소/완료)
- 경매 시스템 (등록/입찰/낙찰/취소/수수료 5%)
- 코인 시스템 (획득/소비/전송/기록)

### GitHub Issue
- **#130:** [feat] Phase 13: 제작 시스템 UI 구현 ✅ 완료 (2026-02-21)
- **#100:** [feat] Phase 15: 거래 시스템 종합 UI 구현 ✅ 완료 (2026-02-21)

---

## 기존 캐릭터 시스템

### 픽셀아트 캐릭터 (✅ 구현 완료)

### 감정 애니메이션 시스템 (✅ 구현 완료)

### 캐릭터 커스터마이징 (✅ 구현 완료)

### 장비 시스템 (✅ 구현 완료)

### 스킬 시스템 (✅ 구현 완료)