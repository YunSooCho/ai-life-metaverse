/**
 * PetManager - 펫 관리 시스템
 * 펫 데이터 구조, 생성/삭제, 장착/해제, 정보 조회
 */
import crypto from 'crypto';

export class PetManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.pets = new Map(); // 메모리 모드용
    this.playerPets = new Map(); // 플레이어별 펫 목록: Map<playerId, Array<petId>>
    this.equippedPets = new Map(); // 장착된 펫: Map<playerId, petId>
  }

  // 펫 데이터 구조
  /**
   * @typedef {Object} Pet
   * @property {string} id - 펫 고유 ID
   * @property {string} ownerId - 소유자 플레이어 ID
   * @property {string} name - 펫 이름
   * @property {string} type - 펫 종류 (cat, dog, dragon, phoenix, etc.)
   * @property {number} level - 펫 레벨 (default: 1)
   * @property {number} exp - 경험치 (default: 0)
   * @property {number} maxExp - 최대 경험치
   * @property {number} affinity - 친밀도 (0-100)
   * @property {string[]} skills - 펫 스킬 목록
   * @property {Object} stats - 펫 스탯 {health, attack, defense, speed}
   * @property {string} evolutionStage - 진화 단계 (basic, evolved1, evolved2, final)
   * @property {number} createdAt - 생성 시간 (timestamp)
   * @property {boolean} isEquipped - 장착 여부
   */

  /**
   * 펫 생성
   * @param {string} ownerId - 플레이어 ID
   * @param {string} name - 펫 이름
   * @param {string} type - 펫 종류
   * @returns {Pet} 생성된 펫 객체
   */
  async createPet(ownerId, name, type) {
    const petId = crypto.randomUUID();
    const now = Date.now();

    const pet = {
      id: petId,
      ownerId,
      name,
      type,
      level: 1,
      exp: 0,
      maxExp: 100,
      affinity: 0,
      skills: [],
      stats: {
        health: 100,
        attack: 10,
        defense: 10,
        speed: 10
      },
      evolutionStage: 'basic',
      createdAt: now,
      isEquipped: false
    };

    // Redis 저장 (TTL: 7일)
    const key = `pet:${petId}`;
    if (this.redis) {
      await this.redis.setEx(key, 604800, JSON.stringify(pet));
    } else {
      this.pets.set(petId, pet);
    }

    // 플레이어 펫 목록에 추가
    await this._addToPlayerPets(ownerId, petId);

    return pet;
  }

  /**
   * 펫 삭제
   * @param {string} petId - 펫 ID
   * @returns {boolean} 삭제 성공 여부
   */
  async deletePet(petId) {
    const key = `pet:${petId}`;
    let pet;

    if (this.redis) {
      const data = await this.redis.get(key);
      if (!data) throw new Error('Pet not found');
      pet = JSON.parse(data);
      await this.redis.del(key);
    } else {
      pet = this.pets.get(petId);
      if (!pet) throw new Error('Pet not found');
      this.pets.delete(petId);
    }

    // 플레이어 펫 목록에서 제거
    await this._removeFromPlayerPets(pet.ownerId, petId);

    // 장착 상태 제거
    if (pet.isEquipped) {
      this.equippedPets.delete(pet.ownerId);
    }

    return true;
  }

  /**
   * 펫 정보 조회
   * @param {string} petId - 펫 ID
   * @returns {Pet} 펫 객체
   */
  async getPet(petId) {
    const key = `pet:${petId}`;

    if (this.redis) {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    }

    return this.pets.get(petId) || null;
  }

  /**
   * 플레이어의 모든 펫 조회
   * @param {string} ownerId - 플레이어 ID
   * @returns {Pet[]} 펫 목록
   */
  async getPlayerPets(ownerId) {
    const key = `player_pets:${ownerId}`;
    let petIds;

    if (this.redis) {
      const data = await this.redis.get(key);
      if (!data) return [];
      petIds = JSON.parse(data);
    } else {
      petIds = this.playerPets.get(ownerId) || [];
    }

    const pets = [];
    for (const petId of petIds) {
      const pet = await this.getPet(petId);
      if (pet) pets.push(pet);
    }

    return pets;
  }

  /**
   * 펫 장착
   * @param {string} playerId - 플레이어 ID
   * @param {string} petId - 펫 ID
   * @returns {boolean} 장착 성공 여부
   */
  async equipPet(playerId, petId) {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error('Pet not found');
    if (pet.ownerId !== playerId) throw new Error('Not your pet');
    if (pet.isEquipped) throw new Error('Pet already equipped');

    // 이전 장착 펫 해제
    const currentEquippedId = this.equippedPets.get(playerId);
    if (currentEquippedId) {
      const currentPet = await this.getPet(currentEquippedId);
      if (currentPet) {
        currentPet.isEquipped = false;
        await this._updatePet(currentPet);
      }
    }

    // 새 펫 장착
    pet.isEquipped = true;
    await this._updatePet(pet);
    this.equippedPets.set(playerId, petId);

    return true;
  }

  /**
   * 펫 해제
   * @param {string} playerId - 플레이어 ID
   * @returns {boolean} 해제 성공 여부
   */
  async unequipPet(playerId) {
    const petId = this.equippedPets.get(playerId);
    if (!petId) throw new Error('No pet equipped');

    const pet = await this.getPet(petId);
    if (pet) {
      pet.isEquipped = false;
      await this._updatePet(pet);
    }

    this.equippedPets.delete(playerId);
    return true;
  }

  /**
   * 장착된 펫 조회
   * @param {string} playerId - 플레이어 ID
   * @returns {Pet|null} 장착된 펫 객체
   */
  async getEquippedPet(playerId) {
    const petId = this.equippedPets.get(playerId);
    if (!petId) return null;
    return await this.getPet(petId);
  }

  /**
   * 플레이어가 가지고 있는 펫 수 확인
   * @param {string} ownerId - 플레이어 ID
   * @returns {number} 펫 수
   */
  async getPetCount(ownerId) {
    const key = `player_pets:${ownerId}`;
    if (this.redis) {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data).length : 0;
    }
    return (this.playerPets.get(ownerId) || []).length;
  }

  /**
   * 펫 이름 변경
   * @param {string} petId - 펫 ID
   * @param {string} newName - 새 이름
   * @returns {boolean} 변경 성공 여부
   */
  async renamePet(petId, newName) {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error('Pet not found');

    pet.name = newName;
    await this._updatePet(pet);
    return true;
  }

  // ===== Private Methods =====

  /**
   * 플레이어 펫 목록에 펫 ID 추가
   * @private
   */
  async _addToPlayerPets(ownerId, petId) {
    const key = `player_pets:${ownerId}`;
    let petIds;

    if (this.redis) {
      const data = await this.redis.get(key);
      petIds = data ? JSON.parse(data) : [];
      petIds.push(petId);
      await this.redis.setEx(key, 604800, JSON.stringify(petIds));
    } else {
      petIds = this.playerPets.get(ownerId) || [];
      petIds.push(petId);
      this.playerPets.set(ownerId, petIds);
    }
  }

  /**
   * 플레이어 펫 목록에서 펫 ID 제거
   * @private
   */
  async _removeFromPlayerPets(ownerId, petId) {
    const key = `player_pets:${ownerId}`;
    let petIds;

    if (this.redis) {
      const data = await this.redis.get(key);
      if (!data) return;
      petIds = JSON.parse(data);
      petIds = petIds.filter(id => id !== petId);
      await this.redis.setEx(key, 604800, JSON.stringify(petIds));
    } else {
      petIds = this.playerPets.get(ownerId) || [];
      this.playerPets.set(ownerId, petIds.filter(id => id !== petId));
    }
  }

  /**
   * 펫 데이터 업데이트
   * @private
   */
  async _updatePet(pet) {
    const key = `pet:${pet.id}`;
    if (this.redis) {
      await this.redis.setEx(key, 604800, JSON.stringify(pet));
    } else {
      this.pets.set(pet.id, pet);
    }
  }

  // ===== Utility Methods =====

  /**
   * 플레이어의 펫 최대 보유 수 확인
   * @param {string} ownerId - 플레이어 ID
   * @returns {Object} {count: 현재 수, max: 최대 수}
   */
  async getPetCapacity(ownerId) {
    const count = await this.getPetCount(ownerId);
    // 기본 10마리, 레벨당 추가 +1 (최대 50마리)
    // TODO: 플레이어 레벨 조회 로직 필요
    const max = 10;
    return { count, max };
  }
}