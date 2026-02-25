// 제작 데이터 초기화 - 기본 레시피 및 제작대 데이터 등록
// 사용자가 게임을 시작할 때 즉시 사용할 수 있는 기본 제작 데이터 제공

import RecipeManager from '../managers/RecipeManager.js';
import CraftingTable from '../managers/CraftingTable.js';
import { defaultRecipes } from '../constants/defaultRecipes.js';

// 기본 제작대 데이터 정의
const defaultCraftingTables = [
  {
    id: 'table_beginner_main',
    name: '초급 제작대',
    nameEn: 'Beginner Crafting Table',
    description: '초보자를 위한 기본 제작대입니다.',
    descriptionEn: 'A basic crafting table for beginners.',
    location: 'main',
    level: 'beginner',
    bonusEffects: [
      { type: 'expBoost', value: 0.1 }, // 경험치 10% 증가
      { type: 'failRateReduction', value: 0.05 } // 실패 확률 5% 감소
    ],
    maxSlots: 1,
    requiredLevel: 1,
    sprite: 'crafting_table_beginner',
    position: {
      x: 50,
      y: 50
    }
  },
  {
    id: 'table_intermediate_main',
    name: '중급 제작대',
    nameEn: 'Intermediate Crafting Table',
    description: '중급 제작자를 위한 강화된 제작대입니다.',
    descriptionEn: 'An enhanced crafting table for intermediate crafters.',
    location: 'main',
    level: 'intermediate',
    bonusEffects: [
      { type: 'expBoost', value: 0.2 }, // 경험치 20% 증가
      { type: 'failRateReduction', value: 0.1 }, // 실패 확률 10% 감소
      { type: 'qualityBoost', value: 0.1 } // 수량 10% 증가
    ],
    maxSlots: 2,
    requiredLevel: 10,
    sprite: 'crafting_table_intermediate',
    position: {
      x: 100,
      y: 100
    }
  },
  {
    id: 'table_advanced_main',
    name: '고급 제작대',
    nameEn: 'Advanced Crafting Table',
    description: '고급 제작자를 위한 특별한 제작대입니다.',
    descriptionEn: 'A special crafting table for advanced crafters.',
    location: 'main',
    level: 'advanced',
    bonusEffects: [
      { type: 'expBoost', value: 0.4 }, // 경험치 40% 증가
      { type: 'failRateReduction', value: 0.2 }, // 실패 확률 20% 감소
      { type: 'qualityBoost', value: 0.25 } // 수량 25% 증가
    ],
    maxSlots: 3,
    requiredLevel: 20,
    sprite: 'crafting_table_advanced',
    position: {
      x: 150,
      y: 150
    }
  },
  {
    id: 'table_beginner_shop',
    name: '상점 제작대',
    nameEn: 'Shop Crafting Table',
    description: '상점에서 사용할 수 있는 기본 제작대입니다.',
    descriptionEn: 'A basic crafting table available in the shop.',
    location: 'shop',
    level: 'beginner',
    bonusEffects: [
      { type: 'expBoost', value: 0.1 }
    ],
    maxSlots: 1,
    requiredLevel: 1,
    sprite: 'crafting_table_shop',
    position: {
      x: 200,
      y: 200
    }
  }
];

/**
 * 기본 제작 데이터 초기화
 * @param {Object} redis - Redis 클라이언트
 * @param {Object} options - 옵션
 * @param {boolean} options.force - 강제 재등록 (기본값: false)
 * @returns {Promise<Object>} 초기화 결과
 */
export async function initializeCraftingData(redis, options = {}) {
  const { force = false } = options;

  const recipeManager = new RecipeManager(redis);
  const craftingTable = new CraftingTable(redis);

  const results = {
    recipes: {
      registered: 0,
      skipped: 0,
      failed: 0,
      errors: []
    },
    tables: {
      registered: 0,
      skipped: 0,
      failed: 0,
      errors: []
    }
  };

  // 기본 레시피 등록
  for (const recipe of defaultRecipes) {
    try {
      // 레시피가 이미 있는지 확인
      const existing = await recipeManager.getRecipe(recipe.id);

      if (existing && !force) {
        results.recipes.skipped++;
        continue;
      }

      if (existing && force) {
        // 기존 레시피 삭제 후 재등록
        await recipeManager.deleteRecipe(recipe.id);
        results.recipes.skipped++;
      }

      // 레시피 등록
      await recipeManager.registerRecipe(recipe);
      results.recipes.registered++;
    } catch (error) {
      results.recipes.failed++;
      results.recipes.errors.push({
        id: recipe.id,
        error: error.message
      });
    }
  }

  // 기본 제작대 등록
  for (const table of defaultCraftingTables) {
    try {
      // 제작대가 이미 있는지 확인
      const existing = await craftingTable.getTable(table.id);

      if (existing && !force) {
        results.tables.skipped++;
        continue;
      }

      if (existing && force) {
        // 기존 제작대 삭제 후 재등록
        await craftingTable.deleteTable(table.id);
        results.tables.skipped++;
      }

      // 제작대 등록
      await craftingTable.registerTable(table);
      results.tables.registered++;
    } catch (error) {
      results.tables.failed++;
      results.tables.errors.push({
        id: table.id,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * 기본 레시피 데이터 조회
 * @returns {Array} 기본 레시피 목록
 */
export function getDefaultRecipes() {
  return defaultRecipes;
}

/**
 * 기본 제작대 데이터 조회
 * @returns {Array} 기본 제작대 목록
 */
export function getDefaultCraftingTables() {
  return defaultCraftingTables;
}