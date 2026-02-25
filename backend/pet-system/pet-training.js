/**
 * PetTraining - 펫 훈련 시스템
 * 훈련 경험치, 레벨업, 스킬 획득
 */

export class PetTraining {
  constructor(petManager) {
    this.petManager = petManager;
    this.trainingCount = new Map(); // 오늘 훈련 횟수: Map<petId, number>
    this.nextResetTime = this._getNextResetTime(); // 다음 리셋 시간
  }

  /**
   * @typedef {Object} TrainingResult
   * @property {boolean} success - 훈련 성공 여부
   * @property {number} expGain - 경험치 획득량
   * @property {number} levelUp - 레벨업 여부 (0: 없음, 1: 레벨업)
   * @property {string|null} skillLearned - 습득한 스킬 ID
   * @property {number} remaining - 남은 훈련 횟수
   */

  /**
   * 펫 훈련 실행
   * @param {string} petId - 펫 ID
   * @param {string} trainingType - 훈련 타입 (basic, intensive, special)
   * @returns {TrainingResult} 훈련 결과
   */
  async trainPet(petId, trainingType = 'basic') {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    // 하루 리셋 확인
    this._checkDailyReset();

    // 훈련 횟수 체크 (일일 최대 5회)
    const maxDaily = 5;
    const usedToday = this.trainingCount.get(petId) || 0;
    if (usedToday >= maxDaily) {
      throw new Error('Daily training limit reached');
    }

    // 훈련 경험치 계산
    const expGain = this._calculateExpGain(trainingType, pet.level);

    // 경험치 추가
    const levelUpResult = await this._addExp(pet, expGain);

    // 훈련 횟수 증가
    this.trainingCount.set(petId, usedToday + 1);

    // 스킬 획득 (레벨업 시)
    let skillLearned = null;
    if (levelUpResult.levelUp && levelUpResult.newLevel && this._shouldLearnSkill(levelUpResult.newLevel)) {
      skillLearned = await this._learnSkill(pet, levelUpResult.newLevel);
    }

    const remaining = maxDaily - (usedToday + 1);

    // levelUp을 0/1로 변환
    const levelUpInt = levelUpResult.levelUp ? 1 : 0;

    return {
      success: true,
      expGain,
      levelUp: levelUpInt,
      newLevel: levelUpResult.newLevel || pet.level,
      skillLearned,
      remaining
    };
  }

  /**
   * 경험치 추가 및 레벨업 처리
   * @private
   */
  async _addExp(pet, expGain) {
    pet.exp += expGain;
    let levelUp = false;
    let newLevel = null;

    // 레벨업 체크
    while (pet.exp >= pet.maxExp) {
      pet.exp -= pet.maxExp;
      pet.level++;
      newLevel = pet.level;

      // 최대 경험치 증가 (레벨 * 50, 최소 100)
      pet.maxExp = Math.max(100, pet.level * 50);
      levelUp = true;

      // 스탯 증가
      pet.stats.health += 10;
      pet.stats.attack += 2;
      pet.stats.defense += 2;
      pet.stats.speed += 2;
    }

    await this.petManager._updatePet(pet);

    return { levelUp, newLevel };
  }

  /**
   * 훈련 경험치 계산
   * @private
   */
  _calculateExpGain(trainingType, petLevel) {
    const baseExp = {
      basic: 20,
      intensive: 40,
      special: 80
    };

    // 레벨에 따른 보정 (레벨이 높을수록 더 많은 경험치 필요)
    const levelBonus = Math.floor(petLevel / 5) * 5;
    const exp = baseExp[trainingType] || baseExp.basic;

    return exp + levelBonus;
  }

  /**
   * 스킬 획득 여부 결정
   * @private
   */
  _shouldLearnSkill(level) {
    // 레벨 5, 10, 15, 20, 25... 에 스킬 획득
    return level > 0 && level % 5 === 0;
  }

  /**
   * 스킬 획득
   * @private
   */
  async _learnSkill(pet, level) {
    const skillPool = this._getSkillPool(pet.type, level);
    if (skillPool.length === 0) return null;

    // 랜덤 스킬 선택
    const randomIndex = Math.floor(Math.random() * skillPool.length);
    const skill = skillPool[randomIndex];

    // 이미 갖고 있는 스킬이면 스킵
    if (pet.skills.includes(skill.id)) return null;

    // 스킬 추가
    pet.skills.push(skill.id);
    await this.petManager._updatePet(pet);

    return skill.id;
  }

  /**
   * 펫 종류별 스킬 풀
   * @private
   */
  _getSkillPool(type, level) {
    const skillPools = {
      cat: [
        { id: 'pounce', name: '스매쉬' },
        { id: 'clawStrike', name: '클로우 스트라이크' },
        { id: 'agility', name: '민첩함' }
      ],
      dog: [
        { id: 'bite', name: '물기' },
        { id: 'bark', name: '짖기' },
        { id: 'loyalty', name: '충성심' }
      ],
      dragon: [
        { id: 'fireBreath', name: '파이어 브레스' },
        { id: 'tailWhip', name: '테일 휩' },
        { id: 'dragonRoar', name: '드래곤 로어' }
      ],
      phoenix: [
        { id: 'flame', name: '화염' },
        { id: 'rebirth', name: '재생' },
        { id: 'heal', name: '힐' }
      ],
      bunny: [
        { id: 'hop', name: '점프' },
        { id: 'kick', name: '킥' },
        { id: 'speed', name: '스피드' }
      ],
      fox: [
        { id: 'illusion', name: '환영' },
        { id: 'stealth', name: '스텔스' },
        { id: 'bite', name: '물기' }
      ]
    };

    const pool = skillPools[type] || skillPools.cat;
    // 레벨에 따라 스킬 개수 제한
    const maxSkills = Math.floor(level / 5);
    return pool.slice(0, maxSkills);
  }

  /**
   * 남은 훈련 횟수 조회
   * @param {string} petId - 펫 ID
   * @returns {number} 남은 횟수
   */
  getRemainingTraining(petId) {
    const maxDaily = 5;
    const usedToday = this.trainingCount.get(petId) || 0;
    return Math.max(0, maxDaily - usedToday);
  }

  /**
   * 오늘의 훈련 모두 완료 여부 확인
   * @param {string} petId - 펫 ID
   * @returns {boolean} 완료 여부
   */
  isTrainingComplete(petId) {
    const usedToday = this.trainingCount.get(petId) || 0;
    return usedToday >= 5;
  }

  /**
   * 펫 레벨 정보 조회
   * @param {string} petId - 펫 ID
   * @returns {Object} 레벨 정보 {level, exp, maxExp, progress}
   */
  async getPetLevelInfo(petId) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    const progress = (pet.exp / pet.maxExp) * 100;

    return {
      level: pet.level,
      exp: pet.exp,
      maxExp: pet.maxExp,
      progress: progress.toFixed(1)
    };
  }

  /**
   * 펫 스킬 목록 조회
   * @param {string} petId - 펫 ID
   * @returns {Array} 스킬 목록
   */
  async getPetSkills(petId) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');
    return pet.skills;
  }

  // ===== Private Methods =====

  /**
   * 하루 리셋 체크
   * @private
   */
  _checkDailyReset() {
    const now = Date.now();
    if (now >= this.nextResetTime) {
      // 새로운 날, 리셋
      this.trainingCount.clear();
      this.nextResetTime = this._getNextResetTime();
    }
  }

  /**
   * 다음 리셋 시간 계산 (매일 자정)
   * @private
   */
  _getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  // ===== Utility Methods =====

  /**
   * 모든 훈련 횟수 초기화
   */
  resetAll() {
    this.trainingCount.clear();
  }

  /**
   * 펫 데이터 초기화
   * @param {string} petId - 펫 ID
   */
  clearPetData(petId) {
    this.trainingCount.delete(petId);
  }

  /**
   * 시스템 통계
   * @returns {Object} 통계 정보
   */
  getStats() {
    return {
      totalTrainedToday: this.trainingCount.size,
      nextResetTime: new Date(this.nextResetTime).toISOString()
    };
  }
}