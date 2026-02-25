// RecipeManager - 레시피 관리 시스템

class RecipeManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.memoryData = new Map(); // Redis 연결 실패 시 메모리 fallback
    this.useRedis = !!redisClient;
  }

  /**
   * 레시피 등록
   * @param {Object} recipe - 레시피 정보
   * @returns {Promise<string>} 레시피 ID
   */
  async registerRecipe(recipe) {
    const recipeId = recipe.id || this._generateId();
    const recipeData = {
      id: recipeId,
      name: recipe.name,
      description: recipe.description,
      requiredLevel: recipe.requiredLevel || 1,
      materials: recipe.materials || [], // [ {itemId, quantity} ]
      result: recipe.result || null, // {itemId, quantity, minQuantity, maxQuantity}
      craftingTime: recipe.craftingTime || 0, // 제작 시간 (ms)
      difficulty: recipe.difficulty || 'normal', // easy, normal, hard, expert
      category: recipe.category || 'general', // equipment, consumable, material
      maxFailureRate: recipe.maxFailureRate || 0.2 // 최대 실패 확률
    };

    try {
      if (this.useRedis) {
        await this.redis.hset('recipes', recipeId, JSON.stringify(recipeData));
        await this.redis.sadd('recipe_ids', recipeId);
      } else {
        this.memoryData.set(recipeId, recipeData);
      }
      return recipeId;
    } catch (error) {
      console.error('RecipeManager - 등록 실패:', error);
      // Fallback to memory
      this.memoryData.set(recipeId, recipeData);
      return recipeId;
    }
  }

  /**
   * 레시피 삭제
   * @param {string} recipeId - 레시피 ID
   * @returns {Promise<boolean>}
   */
  async deleteRecipe(recipeId) {
    try {
      if (this.useRedis) {
        const result = await this.redis.hdel('recipes', recipeId);
        await this.redis.srem('recipe_ids', recipeId);
        return result > 0;
      } else {
        return this.memoryData.delete(recipeId);
      }
    } catch (error) {
      console.error('RecipeManager - 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 레시피 조회
   * @param {string} recipeId - 레시피 ID
   * @returns {Promise<Object|null>}
   */
  async getRecipe(recipeId) {
    try {
      let recipeData;
      if (this.useRedis) {
        recipeData = await this.redis.hget('recipes', recipeId);
      } else {
        recipeData = this.memoryData.get(recipeId);
      }

      return recipeData ? JSON.parse(recipeData) : null;
    } catch (error) {
      console.error('RecipeManager - 조회 실패:', error);
      return null;
    }
  }

  /**
   * 레벨별 레시피 목록 조회
   * @param {number} level - 제작 레벨
   * @returns {Promise<Array>}
   */
  async getRecipesByLevel(level = 1) {
    try {
      const recipes = [];
      if (this.useRedis) {
        const recipeIds = await this.redis.smembers('recipe_ids');
        for (const id of recipeIds) {
          const recipe = await this.getRecipe(id);
          if (recipe && recipe.requiredLevel <= level) {
            recipes.push(recipe);
          }
        }
      } else {
        for (const [id, recipe] of this.memoryData) {
          if (recipe.requiredLevel <= level) {
            recipes.push(recipe);
          }
        }
      }
      return recipes;
    } catch (error) {
      console.error('RecipeManager - 레벨별 조회 실패:', error);
      return [];
    }
  }

  /**
   * 카테고리별 레시피 목록 조회
   * @param {string} category - 카테고리
   * @returns {Promise<Array>}
   */
  async getRecipesByCategory(category) {
    try {
      const recipes = [];
      if (this.useRedis) {
        const recipeIds = await this.redis.smembers('recipe_ids');
        for (const id of recipeIds) {
          const recipe = await this.getRecipe(id);
          if (recipe && recipe.category === category) {
            recipes.push(recipe);
          }
        }
      } else {
        for (const [id, recipe] of this.memoryData) {
          if (recipe.category === category) {
            recipes.push(recipe);
          }
        }
      }
      return recipes;
    } catch (error) {
      console.error('RecipeManager - 카테고리별 조회 실패:', error);
      return [];
    }
  }

  /**
   * 모든 레시피 목록 조회
   * @returns {Promise<Array>}
   */
  async getAllRecipes() {
    try {
      const recipes = [];
      if (this.useRedis) {
        const recipeIds = await this.redis.smembers('recipe_ids');
        for (const id of recipeIds) {
          const recipe = await this.getRecipe(id);
          if (recipe) {
            recipes.push(recipe);
          }
        }
      } else {
        recipes.push(...Array.from(this.memoryData.values()));
      }
      return recipes;
    } catch (error) {
      console.error('RecipeManager - 전체 조회 실패:', error);
      return [];
    }
  }

  /**
   * 레시피 검색
   * @param {string} keyword - 검색 키워드
   * @returns {Promise<Array>}
   */
  async searchRecipes(keyword) {
    try {
      const allRecipes = await this.getAllRecipes();
      const lowerKeyword = keyword.toLowerCase();
      return allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(lowerKeyword) ||
        recipe.description.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      console.error('RecipeManager - 검색 실패:', error);
      return [];
    }
  }

  /**
   * 레시피 업데이트
   * @param {string} recipeId - 레시피 ID
   * @param {Object} updates - 업데이트할 데이터
   * @returns {Promise<boolean>}
   */
  async updateRecipe(recipeId, updates) {
    try {
      const recipe = await this.getRecipe(recipeId);
      if (!recipe) return false;

      const updatedRecipe = { ...recipe, ...updates };
      
      if (this.useRedis) {
        await this.redis.hset('recipes', recipeId, JSON.stringify(updatedRecipe));
      } else {
        this.memoryData.set(recipeId, updatedRecipe);
      }
      return true;
    } catch (error) {
      console.error('RecipeManager - 업데이트 실패:', error);
      return false;
    }
  }

  _generateId() {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default RecipeManager;