# Phase 13: 제작 시스템 (Crafting System)

## 개요

AI Life Metaverse의 제작 시스템을 구현합니다. 플레이어는 제작 레벨을 올리고, 다양한 아이템을 제작할 수 있습니다.

## 구현 날짜
- **Backend:** 2026-02-20 21:00 ✅
- **UI:** 2026-02-21 01:35 ✅ (버그 수정 완료)

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

### Backend
- `backend/managers/RecipeManager.js` (5914 bytes)
- `backend/managers/CraftingManager.js` (8805 bytes)
- `backend/managers/CraftingTable.js` (5758 bytes)
- `backend/__tests__/crafting-system.test.js` (14461 bytes)
- `backend/server.js` (수정 - import 및 Socket.io 이벤트 핸들러 추가)

### Frontend ✅ (2026-02-21 버그 수정 완료)
- `frontend/src/components/Crafting.jsx` (버그 수정)
  - TypeError: undefined.level 수정 (safe navigation operator)
  - 조건부 렌더링 지원 (socket prop 추가)
  - defaultProps 제거 (React 19 호환)
- `frontend/src/components/RecipeList.jsx` (버그 수정)
  - defaultProps 제거 (React 19 호환)
- `frontend/src/App.jsx` (버그 수정)
  - 조건부 렌더링 추가 (showCrafting && <Crafting />)
- `frontend/src/components/RecipePreview.jsx` (관련 파일)
- `frontend/src/components/Crafting.css` (스타일)

## 버그 수정 이력 (2026-02-21)

### 버그 #1: TypeError: Cannot read properties of undefined (reading 'level')
- **위치:** `frontend/src/components/Crafting.jsx:28`
- **원인:** `levelStats`가 undefined일 때 `.level` 속성 접근 시 에러 발생
- **수정:**
  ```javascript
  // Before
  const expToNext = Math.floor(100 * Math.pow(1.5, levelStats.level - 1));
  const progressPercent = (levelStats.exp / expToNext) * 100;

  // After
  const safeLevel = levelStats?.level ?? 1;
  const safeExp = levelStats?.exp ?? 0;
  const expToNext = Math.floor(100 * Math.pow(1.5, safeLevel - 1));
  const progressPercent = (safeExp / expToNext) * 100;
  ```
- **추가:** `fetchCraftingLevel` 함수에 safety check 추가

### 버그 #2: 제작(Crafting) 패널이 닫지 않음
- **위치:** `frontend/src/App.jsx`, `frontend/src/components/Crafting.jsx`
- **원인:** App.jsx에서 Crafting 컴포넌트가 항상 렌더링됨 (조건부 렌더링 없음)
- **수정:**
  ```javascript
  // Before
  <Crafting show={showCrafting} onClose={...} />

  // After
  {showCrafting && <Crafting onClose={...} />}
  ```
- **추가:** Crafting.jsx에서 로컬 socket 제거, prop socket 사용

### 버그 #3: React PropTypes defaultProps 경고
- **위치:** `frontend/src/components/Crafting.jsx`, `frontend/src/components/RecipeList.jsx`
- **원인:** React 19에서 defaultProps 지원 예정 제거 경고
- **수정:**
  ```javascript
  // Before
  Crafting.defaultProps = { craftingLevel: 1, craftingExp: 0 };

  // After
  const Crafting = ({ craftingLevel = 1, craftingExp = 0, ... }) => { ... }
  ```

## GitHub Issues

- #130 [ui] 제작 시스템 UI (높은 우선순위) - Frontend UI 구현 필요

## 다음 단계

1. ✅ Backend 시스템 구현 완료
2. ✅ Frontend UI 구현 (CraftingPanel, RecipeList, CraftingTableUI) - 버그 수정 완료
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
- [x] Frontend UI 구현 (버그 수정 완료)
  - [x] TypeError: undefined.level 수정 (safe navigation 추가)
  - [x] 조건부 렌더링 추가 (showCrafting)
  - [x] PropTypes defaultProps 경고 해결
- [ ] 기본 데이터 등록
- [ ] Git commit & push