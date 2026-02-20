// CraftingManager - 제작 로직 시스템

const RecipeManager = require('./RecipeManager');

class CraftingManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.useRedis = !!redisClient;
    this.recipeManager = new RecipeManager(redisClient);
    this.memoryData = new Map(); // Redis 연결 실패 시 메모리 fallback
  }

  /**
   * 제작 레벨 및 경험치 관리
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Object>} { level, exp, expToNext }
   */
  async getCraftingLevel(characterId) {
    try {
      let data;
      if (this.useRedis) {
        data = await this.redis.hget('crafting_levels', characterId);
      } else {
        data = this.memoryData.get(`level_${characterId}`);
      }

      if (!data) {
        // 기본 데이터 초기화
        const initialData = { level: 1, exp: 0, expToNext: 100 };
        if (this.useRedis) {
          await this.redis.hset('crafting_levels', characterId, JSON.stringify(initialData));
        } else {
          this.memoryData.set(`level_${characterId}`, initialData);
        }
        return initialData;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('CraftingManager - 레벨 조회 실패:', error);
      return { level: 1, exp: 0, expToNext: 100 };
    }
  }

  /**
   * 제작 경험치 추가
   * @param {string} recipeId - 레시피 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Object>} { level, exp, expToNext, leveledUp }
   */
  async addCraftingExp(recipeId, characterId) {
    try {
      const recipe = await this.recipeManager.getRecipe(recipeId);
      if (!recipe) throw new Error('레시피를 찾을 수 없습니다.');

      const levelData = await this.getCraftingLevel(characterId);
      const difficultyMultiplier = {
        'easy': 0.5,
        'normal': 1.0,
        'hard': 1.5,
        'expert': 2.0
      }[recipe.difficulty] || 1.0;

      const expGain = Math.floor(20 * difficultyMultiplier * recipe.requiredLevel);
      const newExp = levelData.exp + expGain;
      let leveledUp = false;
      let newLevel = levelData.level;
      let newExpToNext = this._calculateExpToNext(levelData.level);

      // 레벨업 체크
      if (newExp >= newExpToNext) {
        newExp -= newExpToNext;
        newLevel++;
        leveledUp = true;
        newExpToNext = this._calculateExpToNext(newLevel);
      }

      const updatedData = {
        level: newLevel,
        exp: newExp,
        expToNext: newExpToNext
      };

      if (this.useRedis) {
        await this.redis.hset('crafting_levels', characterId, JSON.stringify(updatedData));
      } else {
        this.memoryData.set(`level_${characterId}`, updatedData);
      }

      return { ...updatedData, leveledUp, expGain };
    } catch (error) {
      console.error('CraftingManager - 경험치 추가 실패:', error);
      return { level: 1, exp: 0, expToNext: 100, leveledUp: false, expGain: 0 };
    }
  }

  /**
   * 제작 가능 여부 확인
   * @param {string} recipeId - 레시피 ID
   * @param {string} characterId - 캐릭터 ID
   * @param {Map} inventory - 인벤토리 (itemId -> quantity)
   * @returns {Promise<Object>} { canCraft, missingMaterials, levelRequired }
   */
  async canCraft(recipeId, characterId, inventory) {
    try {
      const recipe = await this.recipeManager.getRecipe(recipeId);
      if (!recipe) {
        return { canCraft: false, error: '레시피를 찾을 수 없습니다.' };
      }

      const levelData = await this.getCraftingLevel(characterId);
      
      // 레벨 확인
      if (levelData.level < recipe.requiredLevel) {
        return {
          canCraft: false,
          error: `제작 레벨이 부족합니다. (필요: ${recipe.requiredLevel}, 현재: ${levelData.level})`
        };
      }

      // 재료 확인
      const missingMaterials = [];
      for (const material of recipe.materials) {
        const hasQuantity = inventory.get(material.itemId) || 0;
        if (hasQuantity < material.quantity) {
          missingMaterials.push({
            itemId: material.itemId,
            needed: material.quantity,
            has: hasQuantity
          });
        }
      }

      if (missingMaterials.length > 0) {
        return {
          canCraft: false,
          error: '재료가 부족합니다.',
          missingMaterials
        };
      }

      return { canCraft: true, recipe };
    } catch (error) {
      console.error('CraftingManager - 제작 가능 여부 확인 실패:', error);
      return { canCraft: false, error: '오류가 발생했습니다.' };
    }
  }

  /**
   * 제작 수행
   * @param {string} recipeId - 레시피 ID
   * @param {string} characterId - 캐릭터 ID
   * @param {Map} inventory - 인벤토리 (itemId -> quantity)
   * @returns {Promise<Object>} { success, result, consumedMaterials, expGain, leveledUp }
   */
  async craft(recipeId, characterId, inventory) {
    try {
      // 제작 가능 여부 확인
      const canCraftResult = await this.canCraft(recipeId, characterId, inventory);
      if (!canCraftResult.canCraft) {
        return {
          success: false,
          error: canCraftResult.error,
          missingMaterials: canCraftResult.missingMaterials
        };
      }

      const recipe = canCraftResult.recipe;
      const levelData = await this.getCraftingLevel(characterId);

      // 실패 확률 계산 (레벨이 높을수록 실패 확률 감소)
      const levelDiff = recipe.requiredLevel - levelData.level;
      const baseFailureRate = recipe.maxFailureRate;
      const adjustedFailureRate = Math.max(0, baseFailureRate - (levelDiff * -0.05));
      const isSuccess = Math.random() > adjustedFailureRate;

      // 재료 소비
      const consumedMaterials = [];
      if (isSuccess) {
        for (const material of recipe.materials) {
          const currentQty = inventory.get(material.itemId) || 0;
          inventory.set(material.itemId, currentQty - material.quantity);
          consumedMaterials.push({ itemId: material.itemId, quantity: material.quantity });
        }

        // 결과 아이템 생성
        const resultItem = {
          itemId: recipe.result.itemId,
          quantity: this._calculateQuantity(recipe.result)
        };

        // 경험치 추가
        const expResult = await this.addCraftingExp(recipeId, characterId);

        // 제작 기록 저장
        await this._recordCraftingHistory(characterId, recipeId, isSuccess, resultItem, consumedMaterials);

        return {
          success: true,
          result: resultItem,
          consumedMaterials,
          expGain: expResult.expGain,
          leveledUp: expResult.leveledUp,
          newLevel: expResult.level
        };
      } else {
        // 실패 시 재료 소비 (일부 손실)
        const partialConsumed = [];
        for (const material of recipe.materials) {
          const lossQty = Math.ceil(material.quantity * 0.5); // 50% 손실
          const currentQty = inventory.get(material.itemId) || 0;
          inventory.set(material.itemId, currentQty - lossQty);
          partialConsumed.push({ itemId: material.itemId, quantity: lossQty });
        }

        // 실패 기록 저장
        await this._recordCraftingHistory(characterId, recipeId, false, null, partialConsumed);

        return {
          success: false,
          error: '제작에 실패했습니다.',
          consumedMaterials: partialConsumed
        };
      }
    } catch (error) {
      console.error('CraftingManager - 제작 수행 실패:', error);
      return {
        success: false,
        error: '오류가 발생했습니다.'
      };
    }
  }

  /**
   * 제작 기록 조회
   * @param {string} characterId - 캐릭터 ID
   * @param {number} limit - 조회 수
   * @returns {Promise<Array>}
   */
  async getCraftingHistory(characterId, limit = 10) {
    try {
      let history;
      if (this.useRedis) {
        history = await this.redis.lrange(`crafting_history:${characterId}`, 0, limit - 1);
      } else {
        const list = this.memoryData.get(`history_${characterId}`) || [];
        history = list.slice(-limit);
      }

      return history.map(h => JSON.parse(h));
    } catch (error) {
      console.error('CraftingManager - 기록 조회 실패:', error);
      return [];
    }
  }

  _calculateQuantity(result) {
    if (result.minQuantity && result.maxQuantity) {
      return Math.floor(Math.random() * (result.maxQuantity - result.minQuantity + 1)) + result.minQuantity;
    }
    return result.quantity || 1;
  }

  _calculateExpToNext(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  async _recordCraftingHistory(characterId, recipeId, success, result, consumedMaterials) {
    const record = {
      timestamp: Date.now(),
      recipeId,
      success,
      result,
      consumedMaterials
    };

    if (this.useRedis) {
      await this.redis.lpush(`crafting_history:${characterId}`, JSON.stringify(record));
      await this.redis.ltrim(`crafting_history:${characterId}`, 0, 49); // 최근 50개만 유지
    } else {
      const key = `history_${characterId}`;
      const list = this.memoryData.get(key) || [];
      list.unshift(record);
      this.memoryData.set(key, list.slice(0, 50));
    }
  }
}

module.exports = CraftingManager;