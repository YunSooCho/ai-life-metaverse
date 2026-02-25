// test/backend/crafting-system.test.js
// 제작 시스템 테스트 (RecipeManager, CraftingManager, CraftingTable)

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

// 메모리 Redis 클라이언트 스텁
class MemoryRedis {
  constructor() {
    this.data = new Map();
    this.sets = new Map();
  }

  hget(key, field) {
    const hash = this.data.get(key);
    if (!hash) return null;
    return hash.get(field) || null;
  }

  hset(key, field, value) {
    if (!this.data.has(key)) {
      this.data.set(key, new Map());
    }
    this.data.get(key).set(field, value);
  }

  hdel(key, field) {
    const hash = this.data.get(key);
    if (!hash) return 0;
    return hash.delete(field) ? 1 : 0;
  }

  sadd(key, ...values) {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key).add(...values);
  }

  smembers(key) {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  srem(key, ...values) {
    const set = this.sets.get(key);
    if (!set) return 0;
    let count = 0;
    for (const v of values) {
      if (set.delete(v)) count++;
    }
    return count;
  }

  lpush(key, value) {
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    this.data.get(key).unshift(value);
  }

  lrange(key, start, stop) {
    const list = this.data.get(key);
    if (!list) return [];
    if (stop < 0) stop = list.length + stop + 1;
    return list.slice(start, stop + 1);
  }

  ltrim(key, start, stop) {
    const list = this.data.get(key);
    if (!list) return;
    if (stop < 0) stop = list.length + stop + 1;
    this.data.set(key, list.slice(start, stop + 1));
  }
}

describe('RecipeManager', () => {
  let redis;

  beforeAll(() => {
    redis = new MemoryRedis();
  });

  beforeEach(() => {
    redis.data.clear();
    redis.sets.clear();
  });

  it('레시피 등록에 성공해야 함', async () => {
    const RecipeManager = (await import('../managers/RecipeManager.js')).default;
    const manager = new RecipeManager(redis);

    const recipe = {
      name: '나무 검',
      description: '기본 검',
      requiredLevel: 1,
      materials: [
        { itemId: 'wood', quantity: 2 }
      ],
      result: {
        itemId: 'wooden_sword',
        quantity: 1
      },
      craftingTime: 1000,
      difficulty: 'easy',
      category: 'equipment',
      maxFailureRate: 0.1
    };

    const result = await manager.registerRecipe(recipe);
    expect(result).toBeDefined();
    expect(result.startsWith('recipe_')).toBe(true);
  });

  it('레시피 조회에 성공해야 함', async () => {
    const RecipeManager = (await import('../managers/RecipeManager.js')).default;
    const manager = new RecipeManager(redis);

    const recipe = {
      name: '나무 검',
      description: '기본 검',
      requiredLevel: 1,
      materials: [
        { itemId: 'wood', quantity: 2 }
      ],
      result: {
        itemId: 'wooden_sword',
        quantity: 1
      }
    };

    const recipeId = await manager.registerRecipe(recipe);
    const found = await manager.getRecipe(recipeId);

    expect(found).toBeDefined();
    expect(found.name).toBe('나무 검');
    expect(found.requiredLevel).toBe(1);
  });

  it('레벨별 레시피 목록을 조회해야 함', async () => {
    const RecipeManager = (await import('../managers/RecipeManager.js')).default;
    const manager = new RecipeManager(redis);

    await manager.registerRecipe({
      name: '나무 검',
      requiredLevel: 1,
      materials: [{ itemId: 'wood', quantity: 2 }],
      result: { itemId: 'wooden_sword', quantity: 1 }
    });

    await manager.registerRecipe({
      name: '강철 검',
      requiredLevel: 5,
      materials: [{ itemId: 'steel', quantity: 3 }],
      result: { itemId: 'steel_sword', quantity: 1 }
    });

    await manager.registerRecipe({
      name: '다이아몬드 검',
      requiredLevel: 10,
      materials: [{ itemId: 'diamond', quantity: 3 }],
      result: { itemId: 'diamond_sword', quantity: 1 }
    });

    const level1Recipes = await manager.getRecipesByLevel(1);
    expect(level1Recipes.length).toBe(1);

    const level5Recipes = await manager.getRecipesByLevel(5);
    expect(level5Recipes.length).toBe(2);

    const level10Recipes = await manager.getRecipesByLevel(10);
    expect(level10Recipes.length).toBe(3);
  });

  it('카테고리별 레시피 목록을 조회해야 함', async () => {
    const RecipeManager = (await import('../managers/RecipeManager.js')).default;
    const manager = new RecipeManager(redis);

    await manager.registerRecipe({
      name: '나무 검',
      category: 'equipment',
      materials: [{ itemId: 'wood', quantity: 2 }],
      result: { itemId: 'wooden_sword', quantity: 1 }
    });

    await manager.registerRecipe({
      name: '체력 포션',
      category: 'consumable',
      materials: [{ itemId: 'herb', quantity: 1 }],
      result: { itemId: 'health_potion', quantity: 1 }
    });

    const equipmentRecipes = await manager.getRecipesByCategory('equipment');
    expect(equipmentRecipes.length).toBe(1);
    expect(equipmentRecipes[0].category).toBe('equipment');

    const consumableRecipes = await manager.getRecipesByCategory('consumable');
    expect(consumableRecipes.length).toBe(1);
    expect(consumableRecipes[0].category).toBe('consumable');
  });

  it('레시피 검색이 가능해야 함', async () => {
    const RecipeManager = (await import('../managers/RecipeManager.js')).default;
    const manager = new RecipeManager(redis);

    await manager.registerRecipe({
      name: '나무 검',
      description: '기본 검',
      materials: [{ itemId: 'wood', quantity: 2 }],
      result: { itemId: 'wooden_sword', quantity: 1 }
    });

    await manager.registerRecipe({
      name: '체력 포션',
      description: 'HP를 회복합니다',
      materials: [{ itemId: 'herb', quantity: 1 }],
      result: { itemId: 'health_potion', quantity: 1 }
    });

    const searchResults = await manager.searchRecipes('검');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].name).toBe('나무 검');

    const searchResults2 = await manager.searchRecipes('HP');
    expect(searchResults2.length).toBe(1);
    expect(searchResults2[0].name).toBe('체력 포션');
  });

  it('레시피 삭제가 가능해야 함', async () => {
    const RecipeManager = (await import('../managers/RecipeManager.js')).default;
    const manager = new RecipeManager(redis);

    const recipeId = await manager.registerRecipe({
      name: '나무 검',
      materials: [{ itemId: 'wood', quantity: 2 }],
      result: { itemId: 'wooden_sword', quantity: 1 }
    });

    const deleted = await manager.deleteRecipe(recipeId);
    expect(deleted).toBe(true);

    const found = await manager.getRecipe(recipeId);
    expect(found).toBeNull();
  });

  it('레시피 업데이트가 가능해야 함', async () => {
    const RecipeManager = (await import('../managers/RecipeManager.js')).default;
    const manager = new RecipeManager(redis);

    const recipeId = await manager.registerRecipe({
      name: '나무 검',
      description: '기본 검',
      materials: [{ itemId: 'wood', quantity: 2 }],
      result: { itemId: 'wooden_sword', quantity: 1 }
    });

    const updated = await manager.updateRecipe(recipeId, {
      description: '강화된 나무 검',
      maxFailureRate: 0.05
    });

    expect(updated).toBe(true);

    const found = await manager.getRecipe(recipeId);
    expect(found.description).toBe('강화된 나무 검');
    expect(found.maxFailureRate).toBe(0.05);
  });
});

describe('CraftingManager', () => {
  let redis;
  let recipeManager;
  let craftingManager;

  beforeAll(async () => {
    redis = new MemoryRedis();
    recipeManager = new RecipeManager(redis);
    craftingManager = new CraftingManager(redis);
  });

  beforeEach(async () => {
    redis.data.clear();
    redis.sets.clear();

    // 기본 레시피 등록
    await recipeManager.registerRecipe({
      id: 'recipe_wooden_sword',
      name: '나무 검',
      requiredLevel: 1,
      materials: [{ itemId: 'wood', quantity: 2 }],
      result: { itemId: 'wooden_sword', quantity: 1 },
      difficulty: 'easy',
      maxFailureRate: 0.1
    });
  });

  it('제작 레벨을 조회해야 함', async () => {
    const levelData = await craftingManager.getCraftingLevel('char1');
    expect(levelData).toBeDefined();
    expect(levelData.level).toBe(1);
    expect(levelData.exp).toBe(0);
    expect(levelData.expToNext).toBe(100);
  });

  it('제작 경험치를 추가하고 레벨업해야 함', async () => {
    const result = await craftingManager.addCraftingExp('recipe_wooden_sword', 'char1');
    expect(result).toBeDefined();
    expect(result.expGain).toBeGreaterThan(0);
    expect(result.level).toBeGreaterThanOrEqual(1);
  });

  it('제작 가능 여부를 확인해야 함', async () => {
    const inventory = new Map([
      ['wood', 5]
    ]);

    const canCraft = await craftingManager.canCraft('recipe_wooden_sword', 'char1', inventory);
    expect(canCraft).toBeDefined();
    expect(canCraft.canCraft).toBe(true);
  });

  it('레벨이 부족하면 제작 불가해야 함', async () => {
    // 레벨 5 레시피 등록
    await recipeManager.registerRecipe({
      id: 'recipe_steel_sword',
      name: '강철 검',
      requiredLevel: 5,
      materials: [{ itemId: 'steel', quantity: 3 }],
      result: { itemId: 'steel_sword', quantity: 1 },
      difficulty: 'normal',
      maxFailureRate: 0.2
    });

    const inventory = new Map([
      ['steel', 5]
    ]);

    const canCraft = await craftingManager.canCraft('recipe_steel_sword', 'char1', inventory);
    expect(canCraft.canCraft).toBe(false);
    expect(canCraft.error).toContain('제작 레벨이 부족합니다');
  });

  it('재료가 부족하면 제작 불가해야 함', async () => {
    const inventory = new Map([
      ['wood', 1]
    ]);

    const canCraft = await craftingManager.canCraft('recipe_wooden_sword', 'char1', inventory);
    expect(canCraft.canCraft).toBe(false);
    expect(canCraft.error).toContain('재료가 부족합니다');
  });

  it('제작이 성공하고 재료가 소비되어야 함', async () => {
    const inventory = new Map([
      ['wood', 10]
    ]);

    const result = await craftingManager.craft('recipe_wooden_sword', 'char1', inventory);
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
    expect(result.result.itemId).toBe('wooden_sword');
    expect(result.consumedMaterials.length).toBe(1);
    expect(result.result.quantity).toBe(1);
  });

  it('제작 실패 시 일부 재료가 손실되어야 함', async () => {
    // 실패 확률 높은 레시피
    await recipeManager.registerRecipe({
      id: 'recipe_hard_item',
      name: '어려운 아이템',
      requiredLevel: 1,
      materials: [{ itemId: 'wood', quantity: 10 }],
      result: { itemId: 'hard_item', quantity: 1 },
      difficulty: 'expert',
      maxFailureRate: 1.0 // 항상 실패
    });

    const inventory = new Map([
      ['wood', 10]
    ]);

    const result = await craftingManager.craft('recipe_hard_item', 'char1', inventory);
    expect(result.success).toBe(false);
    expect(result.error).toContain('제작에 실패했습니다');
    expect(result.consumedMaterials.length).toBe(1);
    // 50% 손실 = 5개
    expect(result.consumedMaterials[0].quantity).toBe(5);
  });

  it('제작 기록을 조회해야 함', async () => {
    const inventory = new Map([
      ['wood', 10]
    ]);

    await craftingManager.craft('recipe_wooden_sword', 'char1', inventory);

    const history = await craftingManager.getCraftingHistory('char1', 10);
    expect(history.length).toBe(1);
    expect(history[0]).toBeDefined();
    expect(history[0].success).toBe(true);
  });
});

describe('CraftingTable', () => {
  let redis;
  let craftingTable;

  beforeAll(() => {
    redis = new MemoryRedis();
    craftingTable = new CraftingTable(redis);
  });

  beforeEach(() => {
    redis.data.clear();
    redis.sets.clear();
  });

  it('제작대 등록에 성공해야 함', async () => {
    const table = {
      name: '초급 제작대',
      description: '기본 제작대',
      location: 'main',
      level: 'beginner',
      bonusEffects: [],
      maxSlots: 1,
      requiredLevel: 1
    };

    const tableId = await craftingTable.registerTable(table);
    expect(tableId).toBeDefined();
    expect(tableId.startsWith('table_')).toBe(true);
  });

  it('제작대를 조회해야 함', async () => {
    await craftingTable.registerTable({
      name: '초급 제작대',
      location: 'main',
      level: 'beginner'
    });

    const tables = await craftingTable.getAllTables();
    expect(tables.length).toBe(1);
    expect(tables[0].name).toBe('초급 제작대');
  });

  it('로케이션별 제작대를 조회해야 함', async () => {
    await craftingTable.registerTable({
      name: '메인 제작대',
      location: 'main',
      level: 'beginner'
    });

    await craftingTable.registerTable({
      name: '상점 제작대',
      location: 'shop',
      level: 'intermediate'
    });

    const mainTables = await craftingTable.getTablesByLocation('main');
    expect(mainTables.length).toBe(1);
    expect(mainTables[0].location).toBe('main');

    const shopTables = await craftingTable.getTablesByLocation('shop');
    expect(shopTables.length).toBe(1);
    expect(shopTables[0].location).toBe('shop');
  });

  it('레벨별 제작대를 조회해야 함', async () => {
    await craftingTable.registerTable({
      name: '초급 제작대',
      level: 'beginner'
    });

    await craftingTable.registerTable({
      name: '중급 제작대',
      level: 'intermediate'
    });

    await craftingTable.registerTable({
      name: '고급 제작대',
      level: 'advanced'
    });

    const beginnerTables = await craftingTable.getTablesByLevel('beginner');
    expect(beginnerTables.length).toBe(1);
    expect(beginnerTables[0].level).toBe('beginner');

    const intermediateTables = await craftingTable.getTablesByLevel('intermediate');
    expect(intermediateTables.length).toBe(1);
    expect(intermediateTables[0].level).toBe('intermediate');
  });

  it('보너스 효과를 적용해야 함', async () => {
    const tableId = await craftingTable.registerTable({
      name: '보너스 제작대',
      level: 'intermediate',
      bonusEffects: [
        { type: 'expBoost', value: 0.5 }, // 경험치 50% 증가
        { type: 'qualityBoost', value: 0.2 } // 수량 20% 증가
      ]
    });

    const craftingResult = {
      success: true,
      result: { itemId: 'item1', quantity: 1 },
      expGain: 20
    };

    const resultWithBonus = craftingTable.applyBonusEffects(tableId, craftingResult);

    expect(resultWithBonus.expGain).toBe(30); // 20 * 1.5
    expect(resultWithBonus.result.quantity).toBe(1); // Math.floor(1 * 1.2) = 1
    expect(resultWithBonus.appliedBonuses.length).toBe(2);
  });

  it('제작대를 삭제해야 함', async () => {
    const tableId = await craftingTable.registerTable({
      name: '삭제용 제작대'
    });

    const deleted = await craftingTable.deleteTable(tableId);
    expect(deleted).toBe(true);

    const found = await craftingTable.getTable(tableId);
    expect(found).toBeNull();
  });
});