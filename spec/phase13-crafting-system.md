# Phase 13: 제작 시스템 (Crafting System)

## 개요

AI Life Metaverse의 제작 시스템을 구현합니다. 플레이어는 제작 레벨을 올리고, 다양한 아이템을 제작할 수 있습니다.

## 구현 날짜
- **Backend:** 2026-02-20 21:00
- **UI:** TBD

## 구현 목표

### Backend Manager System

1. **RecipeManager** - 레시피 관리 시스템
   - 레시피 등록/삭제/조회/검색
   - 레벨별/카테고리별 레시피 목록
   - Redis 기반 영속화 + 메모리 fallback

2. **CraftingManager** - 제작 로직 시스템
   - 제작 레벨 및 경험치 시스템 (1~100)
   - 제작 가능 여부 확인 (레벨/재료)
   - 제작 수행 (성공/실패 확률)
   - 제작 실패 시 일부 재료 손실
   - 제작 기록 저장

3. **CraftingTable** - 제작대 시스템
   - 제작대 등록/삭제/조회
   - 로케이션별 제작대 목록
   - 레벨별 제작대 목록 (beginner/intermediate/advanced)
   - 보너스 효과 (expBoost, failRateReduction, qualityBoost)
   - 동시 제작 슬롯

### Socket.io Event Handlers

- `getRecipes` - 레시피 목록 조회 (레벨/카테고리 필터링)
- `getCraftingLevel` - 제작 레벨 조회
- `craft` - 제작 수행
- `getCraftingHistory` - 제작 기록 조회
- `getCraftingTables` - 제작대 목록 조회

## 시스템 구조

### RecipeManager

```javascript
{
  id: 'recipe_xxx',
  name: '레시피 이름',
  description: '설명',
  requiredLevel: 1,
  materials: [
    { itemId: 'wood', quantity: 2 }
  ],
  result: {
    itemId: 'wooden_sword',
    quantity: 1,
    minQuantity: 1,
    maxQuantity: 3
  },
  craftingTime: 1000,
  difficulty: 'normal', // easy, normal, hard, expert
  category: 'equipment', // equipment, consumable, material
  maxFailureRate: 0.2
}
```

### Crafting Level System

- 레벨: 1~100
- 경험치: 0 ~ expToNext
- 레벨업 공식: expToNext = 100 * 1.5^(level-1)
- 경험치 획득: 20 * difficultyMultiplier * recipe.requiredLevel

### 제작 시스템 논리

1. 레벨 확인: 캐릭터 레벨 >= requiredLevel
2. 재료 확인: 인벤토리에 재료 충분한지
3. 실패 확률 계산:
   - baseFailureRate = recipe.maxFailureRate
   - levelDiff = recipe.requiredLevel - playerLevel
   - adjustedFailureRate = max(0, baseFailureRate - (levelDiff * -0.05))
4. 제작 시도:
   - 성공: 재료 전체 소비, 결과 아이템 생성, 경험치 획득
   - 실패: 재료 50% 손실

### 제작대 Bonus Effects

- `expBoost`: 경험치 증가 (value = 배수, 예: 0.5 = 50% 증가)
- `failRateReduction`: 실패 확률 감소
- `qualityBoost`: 결과 수량 증가 (value = 배수)

## 테스트

- **Location:** `backend/__tests__/crafting-system.test.js`
- **Test Count:** 29 tests
  - RecipeManager: 8 tests
  - CraftingManager: 9 tests
  - CraftingTable: 12 tests
- **Status:** ✅ All passed

## 관련 파일

- `backend/managers/RecipeManager.js` (5914 bytes)
- `backend/managers/CraftingManager.js` (8805 bytes)
- `backend/managers/CraftingTable.js` (5758 bytes)
- `backend/__tests__/crafting-system.test.js` (14461 bytes)
- `backend/server.js` (수정 - import 및 Socket.io 이벤트 핸들러 추가)

## GitHub Issues

- #130 [ui] 제작 시스템 UI (높은 우선순위) - Frontend UI 구현 필요

## 다음 단계

1. ✅ Backend 시스템 구현 완료
2. ⏳ Frontend UI 구현 (CraftingPanel, RecipeList, CraftingTableUI)
3. ⏳ 기본 레시피 데이터 등록
4. ⏳ 기본 제작대 데이터 등록
5. ⏳ Web UI 스펙 업데이트

## 완료 체크리스트

- [x] RecipeManager 구현
- [x] CraftingManager 구현
- [x] CraftingTable 구현
- [x] Socket.io 이벤트 핸들러 추가
- [x] 테스트 코드 작성 (29 tests)
- [x] 테스트 실행 및 통과 확인
- [x] Spec 문서 작성
- [ ] Frontend UI 구현
- [ ] 기본 데이터 등록
- [ ] Git commit & push