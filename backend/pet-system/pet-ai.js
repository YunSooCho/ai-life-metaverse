/**
 * PetAI - 펫 AI 행동 시스템
 * 캐릭터 따라다님, 자동 행동, 감정 표현, 친밀도 시스템
 */

export class PetAI {
  /**
   * @typedef {Object} PetAction
   * @property {string} type - 행동 타입 (follow, idle, happy, sad, love, hungry)
   * @property {string} message - 행동 메시지
   * @property {number} timestamp - 타임스탬프
   */

  constructor(petManager) {
    this.petManager = petManager;
    this.petPositions = new Map(); // 펫 위치: Map<petId, {x, y}>
    this.petActions = new Map(); // 펫 행동 기록
    this.emotions = new Map(); // 펫 감정 상태
  }

  /**
   * 펫 위치 업데이트 (캐릭터 따라다님)
   * @param {string} petId - 펫 ID
   * @param {Object} characterPosition - 캐릭터 위치 {x, y}
   * @returns {Object} 펫 위치 {x, y}
   */
  updatePetPosition(petId, characterPosition) {
    // 캐릭터 뒤에 위치 (약 -20px)
    const offset = 20;
    const petPosition = {
      x: characterPosition.x,
      y: characterPosition.y + offset
    };

    this.petPositions.set(petId, petPosition);
    return petPosition;
  }

  /**
   * 펫 위치 조회
   * @param {string} petId - 펫 ID
   * @returns {Object|null} 펫 위치 {x, y}
   */
  getPetPosition(petId) {
    return this.petPositions.get(petId) || null;
  }

  /**
   * 펫 자동 행동 실행
   * @param {string} petId - 펫 ID
   * @returns {PetAction} 펫 행동
   */
  async executeAutoAction(petId) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) return null;

    // 친밀도 기반 행동 결정
    const behavior = this._determineBehavior(pet);
    const action = this._createAction(pet, behavior);

    this.petActions.set(petId, action);
    return action;
  }

  /**
   * 펫 감정 업데이트 (친밀도 기반)
   * @param {string} petId - 펫 ID
   * @param {string} emotionType - 감정 타입 (happy, sad, love, hungry)
   * @returns {Object} 감정 상태
   */
  updateEmotion(petId, emotionType) {
    const petEmotion = {
      type: emotionType,
      timestamp: Date.now(),
      duration: 5000 // 5초 지속
    };

    this.emotions.set(petId, petEmotion);
    return petEmotion;
  }

  /**
   * 펫 감정 조회
   * @param {string} petId - 펫 ID
   * @returns {Object|null} 감정 상태
   */
  getEmotion(petId) {
    const emotion = this.emotions.get(petId);
    if (!emotion) return null;

    // 감정 지속 시간 확인
    const elapsed = Date.now() - emotion.timestamp;
    if (elapsed > emotion.duration) {
      this.emotions.delete(petId);
      return null;
    }

    return emotion;
  }

  /**
   * 친밀도 증가
   * @param {string} petId - 펫 ID
   * @param {number} amount - 증가량
   * @returns {number} 새로운 친밀도
   */
  async increaseAffinity(petId, amount) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    pet.affinity = Math.min(100, pet.affinity + amount);
    this.petManager._updatePet(pet);

    // 친밀도에 따른 감정 표현
    if (pet.affinity >= 100) {
      this.updateEmotion(petId, 'love');
    } else if (pet.affinity >= 80) {
      this.updateEmotion(petId, 'happy');
    }

    return pet.affinity;
  }

  /**
   * 친밀도 감소
   * @param {string} petId - 펫 ID
   * @param {number} amount - 감소량
   * @returns {number} 새로운 친밀도
   */
  async decreaseAffinity(petId, amount) {
    const pet = await this.petManager.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    pet.affinity = Math.max(0, pet.affinity - amount);
    this.petManager._updatePet(pet);

    // 친밀도가 낮으면 슬픔 표현
    if (pet.affinity <= 20) {
      this.updateEmotion(petId, 'sad');
    }

    return pet.affinity;
  }

  /**
   * 펫 배고픔 상태 업데이트
   * @param {string} petId - 펫 ID
   * @param {number} hungerLevel - 배고픔 레벨 (0-100, 높을수록 배고픔)
   */
  updateHunger(petId, hungerLevel) {
    if (hungerLevel >= 80) {
      this.updateEmotion(petId, 'hungry');
    }
  }

  /**
   * 펫 행동 기록 조회
   * @param {string} petId - 펫 ID
   * @param {number} limit - 최대 기록 수
   * @returns {PetAction[]} 행동 기록
   */
  getActionHistory(petId, limit = 10) {
    const actions = this.petActions.get(petId);
    return actions ? [actions].slice(-limit) : [];
  }

  // ===== Private Methods =====

  /**
   * 친밀도 기반 행동 결정
   * @private
   */
  _determineBehavior(pet) {
    const affinity = pet.affinity;

    if (affinity >= 90) {
      // 매우 친함: 사랑 행동
      return { type: 'love', message: `${pet.name}이(가) ${this._getLoveMessage(pet.type)}` };
    } else if (affinity >= 70) {
      // 친함: 행복 행동
      return { type: 'happy', message: `${pet.name}이(가) ${this._getHappyMessage(pet.type)}` };
    } else if (affinity >= 50) {
      // 보통: 따라다님
      return { type: 'follow', message: `${pet.name}이(가) 당신을 따라오고 있습니다` };
    } else {
      // 낮음: 무료함
      return { type: 'idle', message: `${pet.name}이(가) 무료해하고 있습니다` };
    }
  }

  /**
   * 펫 행동 생성
   * @private
   */
  _createAction(pet, behavior) {
    return {
      type: behavior.type,
      message: behavior.message,
      timestamp: Date.now()
    };
  }

  /**
   * 펫 종류별 사랑 메시지
   * @private
   */
  _getLoveMessage(type) {
    const messages = {
      cat: '꼬리 살랑살랑이며 애교를 부립니다 ❤️',
      dog: '꼬리를 격렬하게 흔들며 당신을 바라봅니다 ❤️',
      dragon: '여러분을 숭배하듯 바라봅니다 ❤️',
      phoenix: '빛나는 날개로 당신을 감쌉니다 ❤️',
      bunny: '가슴에 얼굴을 비벼입니다 ❤️',
      fox: '당신을 둘러싸고 논니다 ❤️'
    };
    return messages[type] || '사랑을 표현합니다 ❤️';
  }

  /**
   * 펫 종류별 행복 메시지
   * @private
   */
  _getHappyMessage(type) {
    const messages = {
      cat: '귀를 세우고 기분 좋아합니다 😺',
      dog: '재주를 넘며 기뻐합니다 🐕',
      dragon: '불멸의 쾌감에 빠집니다 🐉',
      phoenix: '빛나는 날개를 펼칩니다 🔥',
      bunny: '점프하며 기뻐합니다 🐰',
      fox: '꼬리를 흔들며 춤춥니다 🦊'
    };
    return messages[type] || '기분 좋아합니다 😊';
  }

  // ===== Utility Methods =====

  /**
   * 모든 펫의 위치 초기화
   */
  clearAllPositions() {
    this.petPositions.clear();
  }

  /**
   * 펫 데이터 초기화
   * @param {string} petId - 펫 ID
   */
  clearPetData(petId) {
    this.petPositions.delete(petId);
    this.petActions.delete(petId);
    this.emotions.delete(petId);
  }

  /**
   * 시스템 통계
   * @returns {Object} 통계 정보
   */
  getStats() {
    return {
      activePets: this.petPositions.size,
      emotionsActive: this.emotions.size
    };
  }
}