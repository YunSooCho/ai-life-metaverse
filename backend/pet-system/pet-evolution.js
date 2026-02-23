/**
 * PetEvolution - 펫 진화 시스템
 * 진화 조건, 외형 변화, 스탯 증가
 */

export class PetEvolution {
  constructor(petManager) {
    this.petManager = petManager;
  }

  /**
   * @typedef {Object} EvolutionCondition
   * @property {number} level - 필요 레벨
   * @property {string[]} requiredItems - 필요 아이템 목록
   * @property {number} requiredAffinity - 필요 친밀도
   */

  /**
   * @typedef {Object} EvolutionResult
   * @property {boolean} success - 진화 성공 여부
   * @property {string} fromStage - 이전 진화 단계
   * @property {string} toStage - 새로운 진화 단계
   * @property {Object} statBonuses - 스탯 보너스
   */

  /**
   * 펫 진화 실행
   * @param {string} petId - 펫 ID
   * @param {string} itemType - 사용 아이템 타입
   * @returns {EvolutionResult} 진화 결과
   */
  async evolvePet(petId, itemType) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    // 현재 진화 단계 확인
    const currentStage = pet.evolutionStage;
    if (currentStage === 'final') {
      throw new Error('Pet is already at final evolution stage');
    }

    // 진화 조건 확인
    const condition = this._getEvolutionCondition(currentStage);
    if (!condition) {
      throw new Error('No evolution available for current stage');
    }

    // 레벨 체크
    if (pet.level < condition.level) {
      throw new Error(`Pet level ${condition.level} required for evolution`);
    }

    // 친밀도 체크
    if (pet.affinity < condition.requiredAffinity) {
      throw new Error(`Affinity ${condition.requiredAffinity} required for evolution`);
    }

    // 아이템 체크
    if (!condition.requiredItems.includes(itemType)) {
      throw new Error('Invalid evolution item');
    }

    // 진화 처리
    const nextStage = this._getNextStage(currentStage);
    const statBonuses = this._calculateStatBonuses(nextStage);

    // 스탯 증가
    pet.stats.health += statBonuses.health;
    pet.stats.attack += statBonuses.attack;
    pet.stats.defense += statBonuses.defense;
    pet.stats.speed += statBonuses.speed;

    // 진화 단계 업데이트
    pet.evolutionStage = nextStage;

    // 저장
    await this.petManager._updatePet(pet);

    return {
      success: true,
      fromStage: currentStage,
      toStage: nextStage,
      statBonuses
    };
  }

  /**
   * 진화 가능 여부 확인
   * @param {string} petId - 펫 ID
   * @returns {Object} {canEvolve: boolean, condition: EvolutionCondition|undefined}
   */
  async canEvolve(petId) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    if (pet.evolutionStage === 'final') {
      return { canEvolve: false, condition: null };
    }

    const condition = this._getEvolutionCondition(pet.evolutionStage);
    if (!condition) {
      return { canEvolve: false, condition: null };
    }

    const canEvolve =
      pet.level >= condition.level &&
      pet.affinity >= condition.requiredAffinity;

    return { canEvolve, condition };
  }

  /**
   * 펫 진화 단계 조회
   * @param {string} petId - 펫 ID
   * @returns {string} 진화 단계
   */
  async getEvolutionStage(petId) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');
    return pet.evolutionStage;
  }

  /**
   * 진화 경로 조회
   * @param {string} petType - 펫 종류
   * @returns {Array} 진화 경로
   */
  getEvolutionPath(petType) {
    return [
      {
        stage: 'basic',
        name: '기본 형태',
        description: '기본 형태의 펫'
      },
      {
        stage: 'evolved1',
        name: '1차 진화',
        description: '진화한 형태'
      },
      {
        stage: 'evolved2',
        name: '2차 진화',
        description: '더 강력해진 형태'
      },
      {
        stage: 'final',
        name: '최종 형태',
        description: '최강의 형태'
      }
    ];
  }

  /**
   * 진화 외형 조회
   * @param {string} petType - 펫 종류
   * @param {string} stage - 진화 단계
   * @returns {Object} 외형 정보
   */
  getEvolutionAppearance(petType, stage) {
    const stages = {
      cat: {
        basic: { emoji: '🐱', size: 1.0, color: 'orange' },
        evolved1: { emoji: '😺', size: 1.2, color: 'gold' },
        evolved2: { emoji: '😸', size: 1.5, color: 'rainbow' },
        final: { emoji: '🦁', size: 2.0, color: 'shiny' }
      },
      dog: {
        basic: { emoji: '🐶', size: 1.0, color: 'brown' },
        evolved1: { emoji: '🐕', size: 1.2, color: 'black' },
        evolved2: { emoji: '🦮', size: 1.5, color: 'silver' },
        final: { emoji: '🐺', size: 2.0, color: 'dark' }
      },
      dragon: {
        basic: { emoji: '🐲', size: 1.0, color: 'green' },
        evolved1: { emoji: '🐉', size: 1.2, color: 'blue' },
        evolved2: { emoji: '🦎', size: 1.5, color: 'red' },
        final: { emoji: '🔥', size: 2.0, color: 'golden' }
      },
      phoenix: {
        basic: { emoji: '🐦', size: 1.0, color: 'red' },
        evolved1: { emoji: '🦅', size: 1.2, color: 'orange' },
        evolved2: { emoji: '🦜', size: 1.5, color: 'yellow' },
        final: { emoji: '🌟', size: 2.0, color: 'shiny' }
      },
      bunny: {
        basic: { emoji: '🐰', size: 1.0, color: 'white' },
        evolved1: { emoji: '🐇', size: 1.2, color: 'pink' },
        evolved2: { emoji: '🐾', size: 1.5, color: 'purple' },
        final: { emoji: '👑', size: 2.0, color: 'golden' }
      },
      fox: {
        basic: { emoji: '🦊', size: 1.0, color: 'orange' },
        evolved1: { emoji: '🐕', size: 1.2, color: 'red' },
        evolved2: { emoji: '🦎', size: 1.5, color: 'silver' },
        final: { emoji: '🌙', size: 2.0, color: 'dark' }
      }
    };

    return stages[petType]?.[stage] || stages.cat.basic;
  }

  // ===== Private Methods =====

  /**
   * 진화 조건 조회
   * @private
   */
  _getEvolutionCondition(stage) {
    const conditions = {
      basic: {
        level: 10,
        requiredItems: ['evolution_stone_1'],
        requiredAffinity: 50
      },
      evolved1: {
        level: 20,
        requiredItems: ['evolution_stone_2'],
        requiredAffinity: 70
      },
      evolved2: {
        level: 30,
        requiredItems: ['evolution_stone_3'],
        requiredAffinity: 90
      },
      final: null // 최종 형태는 진화 불가능
    };

    return conditions[stage];
  }

  /**
   * 다음 진화 단계 조회
   * @private
   */
  _getNextStage(currentStage) {
    const stages = ['basic', 'evolved1', 'evolved2', 'final'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= stages.length - 1) {
      return 'final';
    }
    return stages[currentIndex + 1];
  }

  /**
   * 스탯 보너스 계산
   * @private
   */
  _calculateStatBonuses(stage) {
    const bonuses = {
      evolved1: {
        health: 50,
        attack: 10,
        defense: 10,
        speed: 10
      },
      evolved2: {
        health: 100,
        attack: 20,
        defense: 20,
        speed: 20
      },
      final: {
        health: 200,
        attack: 40,
        defense: 40,
        speed: 40
      }
    };

    return bonuses[stage] || bonuses.evolved1;
  }

  // ===== Utility Methods =====

  /**
   * 시스템 통계
   * @returns {Object} 통계 정보
   */
  getStats() {
    return {
      evolutionStages: 4,
      items: ['evolution_stone_1', 'evolution_stone_2', 'evolution_stone_3']
    };
  }
}