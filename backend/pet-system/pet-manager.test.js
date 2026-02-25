/**
 * PetManager 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PetManager } from './pet-manager.js';

describe('PetManager', () => {
  let petManager;

  beforeEach(() => {
    petManager = new PetManager(null); // 메모리 모드
  });

  afterEach(() => {
    petManager = null;
  });

  describe('createPet', () => {
    it('새로운 펫을 생성해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      expect(pet).toBeDefined();
      expect(pet.id).toBeDefined();
      expect(pet.ownerId).toBe('player1');
      expect(pet.name).toBe('나비');
      expect(pet.type).toBe('cat');
      expect(pet.level).toBe(1);
      expect(pet.exp).toBe(0);
      expect(pet.affinity).toBe(0);
      expect(pet.evolutionStage).toBe('basic');
      expect(pet.isEquipped).toBe(false);
    });

    it('펫 ID는 고유해야 함', async () => {
      const pet1 = await petManager.createPet('player1', '나비', 'cat');
      const pet2 = await petManager.createPet('player1', '바둑이', 'dog');
      expect(pet1.id).not.toBe(pet2.id);
    });

    it('여러 타입의 펫을 생성할 수 있어야 함', async () => {
      const cat = await petManager.createPet('player1', '나비', 'cat');
      const dog = await petManager.createPet('player1', '바둑이', 'dog');
      const dragon = await petManager.createPet('player1', '드래곤', 'dragon');

      expect(cat.type).toBe('cat');
      expect(dog.type).toBe('dog');
      expect(dragon.type).toBe('dragon');
    });
  });

  describe('getPet', () => {
    it('펫 ID로 펫을 조회할 수 있어야 함', async () => {
      const created = await petManager.createPet('player1', '나비', 'cat');
      const retrieved = await petManager.getPet(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('나비');
    });

    it('존재하지 않는 펫 조회 시 null을 반환해야 함', async () => {
      const retrieved = await petManager.getPet('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('deletePet', () => {
    it('펫을 삭제할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      const result = await petManager.deletePet(pet.id);

      expect(result).toBe(true);

      const deleted = await petManager.getPet(pet.id);
      expect(deleted).toBeNull();
    });

    it('존재하지 않는 펫 삭제 시 에러를 던져야 함', async () => {
      await expect(petManager.deletePet('non-existent-id')).rejects.toThrow('Pet not found');
    });
  });

  describe('getPlayerPets', () => {
    it('플레이어의 모든 펫을 조회할 수 있어야 함', async () => {
      const pet1 = await petManager.createPet('player1', '나비', 'cat');
      const pet2 = await petManager.createPet('player1', '바둑이', 'dog');
      await petManager.createPet('player2', '또다른 펫', 'cat');

      const player1Pets = await petManager.getPlayerPets('player1');

      expect(player1Pets).toHaveLength(2);
      expect(player1Pets.map(p => p.id)).toContain(pet1.id);
      expect(player1Pets.map(p => p.id)).toContain(pet2.id);
    });

    it('펫이 없는 플레이어 조회 시 빈 배열을 반환해야 함', async () => {
      const pets = await petManager.getPlayerPets('player1');
      expect(pets).toHaveLength(0);
    });
  });

  describe('equipPet', () => {
    it('펫을 장착할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      const result = await petManager.equipPet('player1', pet.id);

      expect(result).toBe(true);

      const updated = await petManager.getPet(pet.id);
      expect(updated.isEquipped).toBe(true);
    });

    it('다른 사람의 펫을 장착할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      await expect(petManager.equipPet('player2', pet.id)).rejects.toThrow('Not your pet');
    });

    it('장착된 펫을 다시 장착할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      await petManager.equipPet('player1', pet.id);

      await expect(petManager.equipPet('player1', pet.id)).rejects.toThrow('Pet already equipped');
    });

    it('새 펫 장착 시 이전 펫은 해제되어야 함', async () => {
      const pet1 = await petManager.createPet('player1', '나비', 'cat');
      const pet2 = await petManager.createPet('player1', '바둑이', 'dog');

      await petManager.equipPet('player1', pet1.id);
      await petManager.equipPet('player1', pet2.id);

      const pet1Updated = await petManager.getPet(pet1.id);
      const pet2Updated = await petManager.getPet(pet2.id);

      expect(pet1Updated.isEquipped).toBe(false);
      expect(pet2Updated.isEquipped).toBe(true);
    });
  });

  describe('unequipPet', () => {
    it('펫을 해제할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      await petManager.equipPet('player1', pet.id);

      const result = await petManager.unequipPet('player1');

      expect(result).toBe(true);

      const updated = await petManager.getPet(pet.id);
      expect(updated.isEquipped).toBe(false);
    });

    it('장착된 펫이 없으면 에러를 던져야 함', async () => {
      await expect(petManager.unequipPet('player1')).rejects.toThrow('No pet equipped');
    });
  });

  describe('getEquippedPet', () => {
    it('장착된 펫을 조회할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      await petManager.equipPet('player1', pet.id);

      const equipped = await petManager.getEquippedPet('player1');

      expect(equipped).toBeDefined();
      expect(equipped.id).toBe(pet.id);
    });

    it('장착된 펫이 없으면 null을 반환해야 함', async () => {
      const equipped = await petManager.getEquippedPet('player1');
      expect(equipped).toBeNull();
    });
  });

  describe('getPetCount', () => {
    it('플레이어의 펫 수를 조회할 수 있어야 함', async () => {
      await petManager.createPet('player1', '나비', 'cat');
      await petManager.createPet('player1', '바둑이', 'dog');
      await petManager.createPet('player2', '또다른 펫', 'cat');

      const count = await petManager.getPetCount('player1');

      expect(count).toBe(2);
    });

    it('펫이 없는 플레이어는 0을 반환해야 함', async () => {
      const count = await petManager.getPetCount('player1');
      expect(count).toBe(0);
    });
  });

  describe('renamePet', () => {
    it('펫 이름을 변경할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      const result = await petManager.renamePet(pet.id, '새 이름');

      expect(result).toBe(true);

      const updated = await petManager.getPet(pet.id);
      expect(updated.name).toBe('새 이름');
    });

    it('존재하지 않는 펫 이름 변경 시 에러를 던져야 함', async () => {
      await expect(petManager.renamePet('non-existent-id', '새 이름')).rejects.toThrow('Pet not found');
    });
  });

  describe('getPetCapacity', () => {
    it('펫 보유 수를 조회할 수 있어야 함', async () => {
      await petManager.createPet('player1', '나비', 'cat');
      await petManager.createPet('player1', '바둑이', 'dog');

      const capacity = await petManager.getPetCapacity('player1');

      expect(capacity.count).toBe(2);
      expect(capacity.max).toBe(10);
    });
  });
});