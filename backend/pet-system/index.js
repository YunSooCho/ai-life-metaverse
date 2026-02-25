/**
 * PetSystem - 애완동물 시스템 통합
 * PetManager + PetAI + PetTraining + PetEvolution
 */
import { PetManager } from './pet-manager.js';
import { PetAI } from './pet-ai.js';
import { PetTraining } from './pet-training.js';
import { PetEvolution } from './pet-evolution.js';

/**
 * 애완동물 시스템 클래스
 */
export class PetSystem {
  static instance = null;

  /**
   * PetSystem 인스턴스 초기화 (Singleton pattern)
   * @param {Object} redisClient - Redis 클라이언트 (optional)
   * @returns {PetSystem} PetSystem 인스턴스
   */
  static initialize(redisClient) {
    if (!PetSystem.instance) {
      PetSystem.instance = new PetSystem(redisClient);
    }
    return PetSystem.instance;
  }

  /**
   * PetSystem 인스턴스 조회
   * @returns {PetSystem|null} PetSystem 인스턴스
   */
  static getInstance() {
    return PetSystem.instance;
  }

  constructor(redisClient) {
    this.petManager = new PetManager(redisClient);
    this.petAI = new PetAI(this.petManager);
    this.petTraining = new PetTraining(this.petManager);
    this.petEvolution = new PetEvolution(this.petManager);
  }

  // ===== PetManager 기능 =====

  /**
   * 펫 생성
   */
  async createPet(playerId, name, type) {
    return await this.petManager.createPet(playerId, name, type);
  }

  /**
   * 펫 삭제
   */
  async deletePet(petId) {
    const pet = await this.petManager.getPet(petId);
    if (pet) {
      this.petAI.clearPetData(petId);
      this.petTraining.clearPetData(petId);
    }
    return await this.petManager.deletePet(petId);
  }

  /**
   * 펫 정보 조회
   */
  async getPet(petId) {
    return await this.petManager.getPet(petId);
  }

  /**
   * 플레이어의 모든 펫 조회
   */
  async getPlayerPets(playerId) {
    return await this.petManager.getPlayerPets(playerId);
  }

  /**
   * 펫 장착
   */
  async equipPet(playerId, petId) {
    return await this.petManager.equipPet(playerId, petId);
  }

  /**
   * 펫 해제
   */
  async unequipPet(playerId) {
    return await this.petManager.unequipPet(playerId);
  }

  /**
   * 장착된 펫 조회
   */
  async getEquippedPet(playerId) {
    return await this.petManager.getEquippedPet(playerId);
  }

  /**
   * 펫 이름 변경
   */
  async renamePet(petId, newName) {
    return await this.petManager.renamePet(petId, newName);
  }

  /**
   * 펫 보유 수 조회
   */
  async getPetCapacity(playerId) {
    return await this.petManager.getPetCapacity(playerId);
  }

  // ===== PetAI 기능 =====

  /**
   * 펫 위치 업데이트 (따라다님)
   */
  updatePetPosition(petId, characterPosition) {
    return this.petAI.updatePetPosition(petId, characterPosition);
  }

  /**
   * 펫 위치 조회
   */
  getPetPosition(petId) {
    return this.petAI.getPetPosition(petId);
  }

  /**
   * 펫 자동 행동 실행
   */
  async executeAutoAction(petId) {
    return await this.petAI.executeAutoAction(petId);
  }

  /**
   * 펫 감정 업데이트
   */
  updateEmotion(petId, emotionType) {
    return this.petAI.updateEmotion(petId, emotionType);
  }

  /**
   * 펫 감정 조회
   */
  getEmotion(petId) {
    return this.petAI.getEmotion(petId);
  }

  /**
   * 친밀도 증가
   */
  async increaseAffinity(petId, amount) {
    return await this.petAI.increaseAffinity(petId, amount);
  }

  /**
   * 친밀도 감소
   */
  async decreaseAffinity(petId, amount) {
    return await this.petAI.decreaseAffinity(petId, amount);
  }

  /**
   * 배고픔 상태 업데이트
   */
  updateHunger(petId, hungerLevel) {
    return this.petAI.updateHunger(petId, hungerLevel);
  }

  /**
   * 펫 행동 기록 조회
   */
  getActionHistory(petId, limit = 10) {
    return this.petAI.getActionHistory(petId, limit);
  }

  // ===== PetTraining 기능 =====

  /**
   * 펫 훈련 실행
   */
  async trainPet(petId, trainingType = 'basic') {
    return await this.petTraining.trainPet(petId, trainingType);
  }

  /**
   * 남은 훈련 횟수 조회
   */
  getRemainingTraining(petId) {
    return this.petTraining.getRemainingTraining(petId);
  }

  /**
   * 훈련 완료 여부 확인
   */
  isTrainingComplete(petId) {
    return this.petTraining.isTrainingComplete(petId);
  }

  /**
   * 펫 레벨 정보 조회
   */
  async getPetLevelInfo(petId) {
    return await this.petTraining.getPetLevelInfo(petId);
  }

  /**
   * 펫 스킬 목록 조회
   */
  async getPetSkills(petId) {
    return await this.petTraining.getPetSkills(petId);
  }

  // ===== PetEvolution 기능 =====

  /**
   * 펫 진화 실행
   */
  async evolvePet(petId, itemType) {
    return await this.petEvolution.evolvePet(petId, itemType);
  }

  /**
   * 진화 가능 여부 확인
   */
  async canEvolve(petId) {
    return await this.petEvolution.canEvolve(petId);
  }

  /**
   * 진화 단계 조회
   */
  async getEvolutionStage(petId) {
    return await this.petEvolution.getEvolutionStage(petId);
  }

  /**
   * 진화 경로 조회
   */
  getEvolutionPath(petType) {
    return this.petEvolution.getEvolutionPath(petType);
  }

  /**
   * 진화 외형 조회
   */
  getEvolutionAppearance(petType, stage) {
    return this.petEvolution.getEvolutionAppearance(petType, stage);
  }

  // ===== 통합 기능 =====

  /**
   * 플레이어의 펫 정보 완전 조회
   */
  async getPlayerPetInfo(playerId) {
    const pets = await this.getPlayerPets(playerId);
    const equipped = await this.getEquippedPet(playerId);

    return {
      pets,
      equipped,
      total: pets.length
    };
  }

  /**
   * 펫 상세 정보 통합 조회
   */
  async getPetDetailedInfo(petId) {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    const position = this.getPetPosition(petId);
    const emotion = this.getEmotion(petId);
    const levelInfo = await this.getPetLevelInfo(petId);
    const trainingRemaining = this.getRemainingTraining(petId);
    const skills = pet.skills;
    const evolutionStage = pet.evolutionStage;

    return {
      ...pet,
      position,
      emotion,
      levelInfo,
      trainingRemaining,
      skills,
      evolutionStage
    };
  }

  /**
   * 펫 케어 (먹이주기 + 친밀도 증가)
   */
  async carePet(petId) {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    // 배고픔 초기화 (감정 제거)
    this.petAI.emotions.delete(petId);

    // 친밀도 증가
    const newAffinity = await this.increaseAffinity(petId, 5);

    return {
      success: true,
      newAffinity
    };
  }

  // ===== 데이터 관리 =====

  /**
   * 플레이어 데이터 초기화
   */
  async clearPlayerData(playerId) {
    const pets = await this.getPlayerPets(playerId);
    for (const pet of pets) {
      this.petAI.clearPetData(pet.id);
      this.petTraining.clearPetData(pet.id);
    }
  }

  /**
   * 시스템 통계
   */
  getSystemStats() {
    return {
      ai: this.petAI.getStats(),
      training: this.petTraining.getStats(),
      evolution: this.petEvolution.getStats()
    };
  }
}