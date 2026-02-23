/**
 * PetAI 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PetManager } from './pet-manager.js';
import { PetAI } from './pet-ai.js';

describe('PetAI', () => {
  let petManager;
  let petAI;

  beforeEach(() => {
    petManager = new PetManager(null);
    petAI = new PetAI(petManager);
  });

  afterEach(() => {
    petAI.clearAllPositions();
    petManager = null;
    petAI = null;
  });

  describe('updatePetPosition', () => {
    it('펫 위치를 업데이트할 수 있어야 함', () => {
      const petId = 'pet1';
      const characterPosition = { x: 100, y: 200 };

      const petPosition = petAI.updatePetPosition(petId, characterPosition);

      expect(petPosition).toEqual({ x: 100, y: 220 }); // y + 20 offset
    });

    it('여러 펫의 위치를 업데이트할 수 있어야 함', () => {
      const charPos = { x: 50, y: 100 };

      petAI.updatePetPosition('pet1', charPos);
      petAI.updatePetPosition('pet2', charPos);
      petAI.updatePetPosition('pet3', charPos);

      const pos1 = petAI.getPetPosition('pet1');
      const pos2 = petAI.getPetPosition('pet2');
      const pos3 = petAI.getPetPosition('pet3');

      expect(pos1).toEqual({ x: 50, y: 120 });
      expect(pos2).toEqual({ x: 50, y: 120 });
      expect(pos3).toEqual({ x: 50, y: 120 });
    });
  });

  describe('getPetPosition', () => {
    it('펫 위치를 조회할 수 있어야 함', () => {
      const petId = 'pet1';
      petAI.updatePetPosition(petId, { x: 100, y: 200 });

      const position = petAI.getPetPosition(petId);

      expect(position).toEqual({ x: 100, y: 220 });
    });

    it('존재하지 않는 위치 조회 시 null을 반환해야 함', () => {
      const position = petAI.getPetPosition('non-existent');
      expect(position).toBeNull();
    });
  });

  describe('executeAutoAction', () => {
    it('친밀도 0인 펫은 따라다님 행동을 해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 0;
      await petManager._updatePet(pet);

      const action = await petAI.executeAutoAction(pet.id);

      expect(action).toBeDefined();
      expect(action.type).toBe('idle');
      expect(action.message).toContain('무료해');
    });

    it('친밀도 70인 펫은 행복 행동을 해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 70;
      await petManager._updatePet(pet);

      const action = await petAI.executeAutoAction(pet.id);

      expect(action).toBeDefined();
      expect(action.type).toBe('happy');
      expect(action.message).toContain('기분 좋아');
    });

    it('친밀도 90인 펫은 사랑 행동을 해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 90;
      await petManager._updatePet(pet);

      const action = await petAI.executeAutoAction(pet.id);

      expect(action).toBeDefined();
      expect(action.type).toBe('love');
      expect(action.message).toContain('❤️');
    });

    it('존재하지 않는 펫 자동 행동 시 null을 반환해야 함', async () => {
      const action = await petAI.executeAutoAction('non-existent');
      expect(action).toBeNull();
    });
  });

  describe('updateEmotion', () => {
    it('펫 감정을 업데이트할 수 있어야 함', () => {
      const petId = 'pet1';

      const emotion = petAI.updateEmotion(petId, 'happy');

      expect(emotion).toBeDefined();
      expect(emotion.type).toBe('happy');
      expect(emotion.timestamp).toBeGreaterThan(0);
      expect(emotion.duration).toBe(5000);
    });

    it('다양한 감정 타입을 업데이트할 수 있어야 함', () => {
      const emotions = ['happy', 'sad', 'love', 'hungry'];

      emotions.forEach(type => {
        const emotion = petAI.updateEmotion('pet1', type);
        expect(emotion.type).toBe(type);
      });
    });
  });

  describe('getEmotion', () => {
    it('펫 감정을 조회할 수 있어야 함', () => {
      const petId = 'pet1';
      petAI.updateEmotion(petId, 'happy');

      const emotion = petAI.getEmotion(petId);

      expect(emotion).toBeDefined();
      expect(emotion.type).toBe('happy');
    });

    it('감정 지속 시간이 지나면 null을 반환해야 함', { timeout: 10000 }, async () => {
      const petId = 'pet1';
      petAI.updateEmotion(petId, 'happy');

      // 감정 지속 시간보다 긴 시간 대기 (5초 + 1초)
      await new Promise(resolve => setTimeout(resolve, 6000));

      const emotion = petAI.getEmotion(petId);
      expect(emotion).toBeNull();
    });

    it('존재하지 않는 감정 조회 시 null을 반환해야 함', () => {
      const emotion = petAI.getEmotion('non-existent');
      expect(emotion).toBeNull();
    });
  });

  describe('increaseAffinity', () => {
    it('친밀도를 증가시킬 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const newAffinity = await petAI.increaseAffinity(pet.id, 10);

      expect(newAffinity).toBe(10);

      const updated = await petManager.getPet(pet.id);
      expect(updated.affinity).toBe(10);
    });

    it('친밀도 100을 초과할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 95;
      await petManager._updatePet(pet);

      const newAffinity = await petAI.increaseAffinity(pet.id, 20);

      expect(newAffinity).toBe(100);

      const emotion = petAI.getEmotion(pet.id);
      expect(emotion?.type).toBe('love');
    });

    it('친밀도 80 이상 증가 시 happy 감정을 표시해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 75;
      await petManager._updatePet(pet);

      await petAI.increaseAffinity(pet.id, 10);

      const emotion = petAI.getEmotion(pet.id);
      expect(emotion?.type).toBe('happy');
    });
  });

  describe('decreaseAffinity', () => {
    it('친밀도를 감소시킬 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 50;
      await petManager._updatePet(pet);

      const newAffinity = await petAI.decreaseAffinity(pet.id, 10);

      expect(newAffinity).toBe(40);

      const updated = await petManager.getPet(pet.id);
      expect(updated.affinity).toBe(40);
    });

    it('친밀도 0 미만으로 감소할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 5;
      await petManager._updatePet(pet);

      const newAffinity = await petAI.decreaseAffinity(pet.id, 10);

      expect(newAffinity).toBe(0);
    });

    it('친밀도 20 이하 감소 시 sad 감정을 표시해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.affinity = 25;
      await petManager._updatePet(pet);

      await petAI.decreaseAffinity(pet.id, 10);

      const emotion = petAI.getEmotion(pet.id);
      expect(emotion?.type).toBe('sad');
    });
  });

  describe('updateHunger', () => {
    it('배고픔 레벨 80 이상 시 hungry 감정을 표시해야 함', () => {
      petAI.updateHunger('pet1', 80);

      const emotion = petAI.getEmotion('pet1');
      expect(emotion?.type).toBe('hungry');
    });

    it('배고픔 레벨 80 미만시 감정을 표시하지 않아야 함', () => {
      petAI.updateHunger('pet1', 50);

      const emotion = petAI.getEmotion('pet1');
      expect(emotion).toBeNull();
    });
  });

  describe('getActionHistory', () => {
    it('행동 기록을 조회할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      await petAI.executeAutoAction(pet.id);

      const history = petAI.getActionHistory(pet.id);

      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });

    it('기록 수를 제한할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      // 다중 조회
      await petAI.executeAutoAction(pet.id);

      const history = petAI.getActionHistory(pet.id, 1);

      expect(history.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getStats', () => {
    it('시스템 통계를 조회할 수 있어야 함', () => {
      petAI.updatePetPosition('pet1', { x: 100, y: 200 });
      petAI.updateEmotion('pet1', 'happy');

      const stats = petAI.getStats();

      expect(stats).toBeDefined();
      expect(stats.activePets).toBe(1);
      expect(stats.emotionsActive).toBe(1);
    });
  });
});