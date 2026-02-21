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

## 거래 시스템 (Phase 15) - 📋 개발 중

### 개요
거래 시스템은 상점, 플레이어 간 거래, 경매, 코인 시스템으로 구성됩니다. Backend는 완전 구현되어 있으며, Frontend UI 구현이 진행 중입니다.

### 완료 상태 (2026-02-21)
- **Backend:** ✅ 완전 구현 (ShopManager, TradeManager, AuctionManager, CoinManager)
- **Frontend:** ⏳ 개발 중 (Shop.jsx 완료, 나머지 UI 개발 예정)
- **테스트:** ✅ Backend 101/101 통과, ⏳ Frontend Shop.jsx 5/7 통과

### 상점 시스템 (Shop)

**Backend API:**
- `GET /api/shop/list` - 모든 상점 목록 조회
- `GET /api/shop/:shopId` - 특정 상점 조회
- `POST /api/shop/buy` - 아이템 구매
- `POST /api/shop/sell` - 아이템 판매

**상점 데이터 구조:**
```javascript
{
  shopId: 'general',
  name: '일반 상점',
  description: '기본 아이템 판매',
  items: [
    {
      itemId: 'potion_hp',
      name: 'HP 포션',
      buyPrice: 50,
      sellPrice: 25,
      stock: 100
    }
  ]
}
```

**Frontend UI (✅ 완료):**
- `Shop.jsx` - 상점 UI 컴포넌트 ✅
- 상점 목록 표시 (다중 상점 탭)
- 아이템 구매/판매 버튼
- 코인 잔액 표시
- 인벤토리 판매 가능 아이템 표시
- 재고 관리 UI

**백엔드 API 엔드포인트 (❌ 미구현):**
- `GET /api/shop/list` → 구현 필요
- `GET /api/shop/:shopId` → 구현 필요
- `POST /api/shop/buy` → 구현 필요
- `POST /api/shop/sell` → 구현 필요

### 거래 시스템 (Trade)

**Backend API:**
- `POST /api/trade/request` - 거래 요청
- `POST /api/trade/accept` - 거래 수락
- `POST /api/trade/decline` - 거래 거절
- `POST /api/trade/cancel` - 거래 취소

**Frontend UI (⏳ 개발 예정):**
- `TradeRequest.jsx` - 거래 요청 UI
- `TradeWindow.jsx` - 거래 창
- `TradeSlot.jsx` - 거래 슬롯

### 경매 시스템 (Auction)

**Backend API:**
- `GET /api/auction/list` - 경매 목록
- `POST /api/auction/register` - 경매 등록
- `POST /api/auction/bid` - 입찰

**Frontend UI (⏳ 개발 예정):**
- `AuctionList.jsx` - 경매 목록 UI
- `AuctionBid.jsx` - 입찰 UI
- `AuctionRegister.jsx` - 경매 등록 UI

### 코인 시스템 (Coin)

**Backend API:**
- `GET /api/coin/balance` - 코인 잔액 조회
- `POST /api/coin/transfer` - 코인 전송
- `GET /api/coin/history` - 코인 기록 조회

**Frontend UI (⏳ 개발 예정):**
- `CoinDisplay.jsx` - 코인 표시 UI
- `CoinHistory.jsx` - 코인 기록 UI
- `CoinTransfer.jsx` - 코인 전송 UI

### 기능 연계

- Inventory.jsx ↔ Shop/Trade/Auction (아이템 구매/판매/등록)
- StatusPanel.jsx ↔ CoinDisplay (코인 표시)
- ChatWindow.jsx ↔ TradeRequest (거래 요청)
- CharacterProfile.jsx ↔ TradeTransfer (기타 거래 관련)

---

## 기존 캐릭터 시스템

### 픽셀아트 캐릭터 (✅ 구현 완료)

### 감정 애니메이션 시스템 (✅ 구현 완료)

### 캐릭터 커스터마이징 (✅ 구현 완료)

### 장비 시스템 (✅ 구현 완료)

### 스킬 시스템 (✅ 구현 완료)