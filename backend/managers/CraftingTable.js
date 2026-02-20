// CraftingTable - 제작대 시스템

class CraftingTable {
  constructor(redisClient) {
    this.redis = redisClient;
    this.useRedis = !!redisClient;
    this.memoryData = new Map();
  }

  /**
   * 제작대 등록
   * @param {Object} table - 제작대 정보
   * @returns {Promise<string>} 제작대 ID
   */
  async registerTable(table) {
    const tableId = table.id || this._generateId();
    const tableData = {
      id: tableId,
      name: table.name,
      description: table.description,
      location: table.location || 'default', // room_id 또는 location string
      level: table.level || 'beginner', // beginner, intermediate, advanced
      bonusEffects: table.bonusEffects || [], // [expBoost, failRateReduction, qualityBoost]
      maxSlots: table.maxSlots || 1, // 동시 제작 가능 수
      requiredLevel: table.requiredLevel || 1
    };

    try {
      if (this.useRedis) {
        await this.redis.hset('crafting_tables', tableId, JSON.stringify(tableData));
        await this.redis.sadd('crafting_table_ids', tableId);
      } else {
        this.memoryData.set(tableId, tableData);
      }
      return tableId;
    } catch (error) {
      console.error('CraftingTable - 등록 실패:', error);
      this.memoryData.set(tableId, tableData);
      return tableId;
    }
  }

  /**
   * 제작대 조회
   * @param {string} tableId - 제작대 ID
   * @returns {Promise<Object|null>}
   */
  async getTable(tableId) {
    try {
      let tableData;
      if (this.useRedis) {
        tableData = await this.redis.hget('crafting_tables', tableId);
      } else {
        tableData = this.memoryData.get(tableId);
      }
      return tableData ? JSON.parse(tableData) : null;
    } catch (error) {
      console.error('CraftingTable - 조회 실패:', error);
      return null;
    }
  }

  /**
   * 로케이션별 제작대 목록 조회
   * @param {string} location - 로케이션 (room_id)
   * @returns {Promise<Array>}
   */
  async getTablesByLocation(location) {
    try {
      const tables = [];
      if (this.useRedis) {
        const tableIds = await this.redis.smembers('crafting_table_ids');
        for (const id of tableIds) {
          const table = await this.getTable(id);
          if (table && table.location === location) {
            tables.push(table);
          }
        }
      } else {
        for (const [id, table] of this.memoryData) {
          if (table.location === location) {
            tables.push(table);
          }
        }
      }
      return tables;
    } catch (error) {
      console.error('CraftingTable - 로케이션별 조회 실패:', error);
      return [];
    }
  }

  /**
   * 레벨별 제작대 목록 조회
   * @param {string} level - 레벨
   * @returns {Promise<Array>}
   */
  async getTablesByLevel(level) {
    try {
      const tables = [];
      if (this.useRedis) {
        const tableIds = await this.redis.smembers('crafting_table_ids');
        for (const id of tableIds) {
          const table = await this.getTable(id);
          if (table && table.level === level) {
            tables.push(table);
          }
        }
      } else {
        for (const [id, table] of this.memoryData) {
          if (table.level === level) {
            tables.push(table);
          }
        }
      }
      return tables;
    } catch (error) {
      console.error('CraftingTable - 레벨별 조회 실패:', error);
      return [];
    }
  }

  /**
   * 모든 제작대 목록 조회
   * @returns {Promise<Array>}
   */
  async getAllTables() {
    try {
      const tables = [];
      if (this.useRedis) {
        const tableIds = await this.redis.smembers('crafting_table_ids');
        for (const id of tableIds) {
          const table = await this.getTable(id);
          if (table) {
            tables.push(table);
          }
        }
      } else {
        tables.push(...Array.from(this.memoryData.values()));
      }
      return tables;
    } catch (error) {
      console.error('CraftingTable - 전체 조회 실패:', error);
      return [];
    }
  }

  /**
   * 제작대 보너스 효과 적용
   * @param {string} tableId - 제작대 ID
   * @param {Object} craftingResult - 제작 결과
   * @returns {Object} 보너스가 적용된 결과
   */
  applyBonusEffects(tableId, craftingResult) {
    try {
      // 제작대 정보가 없으면 기본값 반환
      const tableData = this.memoryData.get(tableId);
      if (!tableData) {
        return craftingResult;
      }

      const bonusEffects = tableData.bonusEffects || [];
      let result = { ...craftingResult };

      for (const effect of bonusEffects) {
        switch (effect.type) {
          case 'expBoost':
            result.expGain = Math.floor(result.expGain * (1 + effect.value));
            break;
          case 'failRateReduction':
            // 실패 확률은 제작 시에 적용되므로 여기서는 기록만 남김
            result.appliedBonuses = result.appliedBonuses || [];
            result.appliedBonuses.push(effect);
            break;
          case 'qualityBoost':
            // 결과 수량 증가
            if (result.result) {
              result.result.quantity = Math.floor(result.result.quantity * (1 + effect.value));
            }
            break;
        }
      }

      return result;
    } catch (error) {
      console.error('CraftingTable - 보너스 효과 적용 실패:', error);
      return craftingResult;
    }
  }

  /**
   * 제작대 삭제
   * @param {string} tableId - 제작대 ID
   * @returns {Promise<boolean>}
   */
  async deleteTable(tableId) {
    try {
      if (this.useRedis) {
        const result = await this.redis.hdel('crafting_tables', tableId);
        await this.redis.srem('crafting_table_ids', tableId);
        return result > 0;
      } else {
        return this.memoryData.delete(tableId);
      }
    } catch (error) {
      console.error('CraftingTable - 삭제 실패:', error);
      return false;
    }
  }

  _generateId() {
    return `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default CraftingTable;