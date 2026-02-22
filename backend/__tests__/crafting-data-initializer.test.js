// 제작 데이터 초기화 테스트
// 기본 레시피 및 제작대 데이터 등록 테스트

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeCraftingData, getDefaultRecipes, getDefaultCraftingTables } from '../utils/craftingDataInitializer.js';

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
}

describe('craftingDataInitializer', () => {
  let redis;

  beforeEach(() => {
    redis = new MemoryRedis();
  });

  describe('initializeCraftingData', () => {
    it('기본 레시피를 등록해야 함', async () => {
      const result = await initializeCraftingData(redis);

      expect(result).toBeDefined();
      expect(result.recipes).toBeDefined();
      expect(result.recipes.registered).toBeGreaterThan(0);
      expect(result.recipes.failed).toBe(0);
    });

    it('기본 제작대를 등록해야 함', async () => {
      const result = await initializeCraftingData(redis);

      expect(result).toBeDefined();
      expect(result.tables).toBeDefined();
      expect(result.tables.registered).toBe(4); // 4개 제작대
      expect(result.tables.failed).toBe(0);
    });

    it('이미 등록된 레시피는 건너뛰어야 함', async () => {
      const result1 = await initializeCraftingData(redis);
      const result2 = await initializeCraftingData(redis);

      expect(result2.recipes.registered).toBe(0);
      expect(result2.recipes.skipped).toBeGreaterThan(0);
    });

    it('이미 등록된 제작대는 건너뛰어야 함', async () => {
      const result1 = await initializeCraftingData(redis);
      const result2 = await initializeCraftingData(redis);

      expect(result2.tables.registered).toBe(0);
      expect(result2.tables.skipped).toBe(4);
    });

    it('force 옵션으로 강제 재등록이 가능해야 함', async () => {
      const result1 = await initializeCraftingData(redis);
      const result2 = await initializeCraftingData(redis, { force: true });

      expect(result2.recipes.registered).toBeGreaterThan(0);
      expect(result2.tables.registered).toBe(4);
    });
  });

  describe('getDefaultRecipes', () => {
    it('기본 레시피 목록을 반환해야 함', () => {
      const recipes = getDefaultRecipes();

      expect(Array.isArray(recipes)).toBe(true);
      expect(recipes.length).toBeGreaterThan(0);
    });

    it('모든 레시피 필수 필드를 가져야 함', () => {
      const recipes = getDefaultRecipes();

      for (const recipe of recipes) {
        expect(recipe.id).toBeDefined();
        expect(recipe.name).toBeDefined();
        expect(recipe.requiredLevel).toBeDefined();
        expect(Array.isArray(recipe.materials)).toBe(true);
        expect(recipe.result).toBeDefined();
        expect(recipe.difficulty).toBeDefined();
        expect(recipe.category).toBeDefined();
      }
    });

    it('장비 레시피를 포함해야 함', () => {
      const recipes = getDefaultRecipes();
      const equipmentRecipes = recipes.filter(r => r.category === 'equipment');

      expect(equipmentRecipes.length).toBeGreaterThan(0);

      const woodSword = recipes.find(r => r.id === 'recipe_wooden_sword');
      expect(woodSword).toBeDefined();
      expect(woodSword.name).toBe('나무 검');
    });

    it('소비품 레시피를 포함해야 함', () => {
      const recipes = getDefaultRecipes();
      const consumableRecipes = recipes.filter(r => r.category === 'consumable');

      expect(consumableRecipes.length).toBeGreaterThan(0);

      const healthPotion = recipes.find(r => r.id === 'recipe_health_potion');
      expect(healthPotion).toBeDefined();
      expect(healthPotion.name).toBe('체력 포션');
    });

    it('재료 레시피를 포함해야 함', () => {
      const recipes = getDefaultRecipes();
      const materialRecipes = recipes.filter(r => r.category === 'material');

      expect(materialRecipes.length).toBeGreaterThan(0);

      const woodenPlank = recipes.find(r => r.id === 'recipe_wooden_plank');
      expect(woodenPlank).toBeDefined();
      expect(woodenPlank.name).toBe('나무판');
    });
  });

  describe('getDefaultCraftingTables', () => {
    it('기본 제작대 목록을 반환해야 함', () => {
      const tables = getDefaultCraftingTables();

      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBe(4);
    });

    it('모든 제작대 필수 필드를 가져야 함', () => {
      const tables = getDefaultCraftingTables();

      for (const table of tables) {
        expect(table.id).toBeDefined();
        expect(table.name).toBeDefined();
        expect(table.location).toBeDefined();
        expect(table.level).toBeDefined();
        expect(Array.isArray(table.bonusEffects)).toBe(true);
        expect(table.maxSlots).toBeDefined();
        expect(table.requiredLevel).toBeDefined();
      }
    });

    it('초급 제작대를 포함해야 함', () => {
      const tables = getDefaultCraftingTables();
      const beginnerTables = tables.filter(t => t.level === 'beginner');

      expect(beginnerTables.length).toBe(2); // main + shop

      const beginnerMain = tables.find(t => t.id === 'table_beginner_main');
      expect(beginnerMain).toBeDefined();
      expect(beginnerMain.name).toBe('초급 제작대');
      expect(beginnerMain.bonusEffects.length).toBe(2); // expBoost + failRateReduction
    });

    it('중급 제작대를 포함해야 함', () => {
      const tables = getDefaultCraftingTables();
      const intermediateTables = tables.filter(t => t.level === 'intermediate');

      expect(intermediateTables.length).toBe(1);

      const intermediateMain = tables.find(t => t.id === 'table_intermediate_main');
      expect(intermediateMain).toBeDefined();
      expect(intermediateMain.name).toBe('중급 제작대');
      expect(intermediateMain.bonusEffects.length).toBe(3);
      expect(intermediateMain.maxSlots).toBe(2);
    });

    it('고급 제작대를 포함해야 함', () => {
      const tables = getDefaultCraftingTables();
      const advancedTables = tables.filter(t => t.level === 'advanced');

      expect(advancedTables.length).toBe(1);

      const advancedMain = tables.find(t => t.id === 'table_advanced_main');
      expect(advancedMain).toBeDefined();
      expect(advancedMain.name).toBe('고급 제작대');
      expect(advancedMain.bonusEffects.length).toBe(3);
      expect(advancedMain.maxSlots).toBe(3);
      expect(advancedMain.requiredLevel).toBe(20);
    });

    it('보너스 효과가 올바른 형식이어야 함', () => {
      const tables = getDefaultCraftingTables();

      for (const table of tables) {
        for (const bonus of table.bonusEffects) {
          expect(bonus.type).toBeDefined();
          expect(typeof bonus.value).toBe('number');
          expect(['expBoost', 'failRateReduction', 'qualityBoost']).toContain(bonus.type);
        }
      }
    });
  });
});