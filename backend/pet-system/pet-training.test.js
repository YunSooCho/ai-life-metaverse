/**
 * PetTraining 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PetManager } from './pet-manager.js';
import { PetTraining } from './pet-training.js';

describe('PetTraining', () => {
  let petManager;
  let petTraining;

  beforeEach(() => {
    petManager = new PetManager(null);
    petTraining = new PetTraining(petManager);
  });

  afterEach(() => {
    petTraining.resetAll();
    petManager = null;
    petTraining = null;
  });

  describe('trainPet', () => {
    it('기본 훈련을 실행할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const result = await petTraining.trainPet(pet.id, 'basic');

      expect(result.success).toBe(true);
      expect(result.expGain).toBeGreaterThan(0);
      expect(result.levelUp).toBe(0);
      expect(result.remaining).toBe(4);
    });

    it('집중 훈련은 더 많은 경험치를 주어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const basicResult = await petTraining.trainPet(pet.id, 'basic');
      await petTraining._checkDailyReset(); // 훈련 카운터 초기화
      const intensiveResult = await petTraining.trainPet(pet.id, 'intensive');

      expect(intensiveResult.expGain).toBeGreaterThan(basicResult.expGain);
    });

    it('특별 훈련은 가장 많은 경험치를 주어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const intensiveResult = await petTraining.trainPet(pet.id, 'intensive');
      petTraining.resetAll(); // 훈련 카운터 초기화
      const specialResult = await petTraining.trainPet(pet.id, 'special');

      expect(specialResult.expGain).toBeGreaterThan(intensiveResult.expGain);
    });

    it('경험치가 충분하면 레벨업해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      // 훈련 카운터 초기화
      petTraining.resetAll();

      // 레벨업 경험치까지 훈련 (레벨 1은 100 경험치 필요)
      for (let i = 0; i < 3; i++) {
        petTraining.trainingCount = new Map(); // 일일 리셋 우회
        await petTraining.trainPet(pet.id, 'special');
      }

      const updated = await petManager.getPet(pet.id);
      expect(updated.level).toBeGreaterThan(1);
    });

    it('레벨업 시 스탯이 증가해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const level1Health = pet.stats.health;
      const level1Attack = pet.stats.attack;

      // 레벨업 유도
      pet.exp = pet.maxExp;
      await petTraining.trainPet(pet.id, 'basic');

      const level2Pet = await petManager.getPet(pet.id);
      expect(level2Pet.stats.health).toBeGreaterThan(level1Health);
      expect(level2Pet.stats.attack).toBeGreaterThan(level1Attack);
    });

    it('일일 훈련 횟수 제한을 초과할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      // 5회 훈련
      for (let i = 0; i < 5; i++) {
        await petTraining.trainPet(pet.id, 'basic');
      }

      // 6회 시도
      await expect(petTraining.trainPet(pet.id, 'basic')).rejects.toThrow('Daily training limit reached');
    });

    it('존재하지 않는 펫 훈련 시 에러를 던져야 함', async () => {
      await expect(petTraining.trainPet('non-existent', 'basic')).rejects.toThrow('Pet not found');
    });
  });

  describe('getRemainingTraining', () => {
    it('남은 훈련 횟수를 조회할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const before = petTraining.getRemainingTraining(pet.id);
      expect(before).toBe(5);

      await petTraining.trainPet(pet.id, 'basic');

      const after = petTraining.getRemainingTraining(pet.id);
      expect(after).toBe(4);
    });

    it('훈련하지 않은 펫은 5회를 반환해야 함', () => {
      const remaining = petTraining.getRemainingTraining('non-existent-pe');
      expect(remaining).toBe(5);
    });
  });

  describe('isTrainingComplete', () => {
    it('훈련 완료 여부를 확인할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      expect(petTraining.isTrainingComplete(pet.id)).toBe(false);

      // 5회 훈련
      for (let i = 0; i < 5; i++) {
        await petTraining.trainPet(pet.id, 'basic');
      }

      expect(petTraining.isTrainingComplete(pet.id)).toBe(true);
    });

    it('훈련하지 않은 펫은 완료 상태가 아님을 반환해야 함', () => {
      expect(petTraining.isTrainingComplete('non-existent-pet')).toBe(false);
    });
  });

  describe('getPetLevelInfo', () => {
    it('펫 레벨 정보를 조회할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const levelInfo = await petTraining.getPetLevelInfo(pet.id);

      expect(levelInfo).toBeDefined();
      expect(levelInfo.level).toBe(1);
      expect(levelInfo.exp).toBe(0);
      expect(levelInfo.maxExp).toBe(100);
      expect(levelInfo.progress).toBe('0.0');
    });

    it('진행도를 백분율로 계산해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.exp = 50;
      await petManager._updatePet(pet);

      const levelInfo = await petTraining.getPetLevelInfo(pet.id);

      expect(parseFloat(levelInfo.progress)).toBe(50.0);
    });

    it('존재하지 않는 펫 시 에러를 던져야 함', async () => {
      await expect(petTraining.getPetLevelInfo('non-existent')).rejects.toThrow('Pet not found');
    });
  });

  describe('getPetSkills', () => {
    it('펫 스킬 목록을 조회할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const skills = await petTraining.getPetSkills(pet.id);

      expect(skills).toBeDefined();
      expect(Array.isArray(skills)).toBe(true);
    });

    it('레벨 5 이상에서 스킬을 획득할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      // 레벨 5로 설정
      pet.level = 5;
      pet.exp = 50; // 경험치 일부 추가
      await petManager._updatePet(pet);

      // 레벨업 유도
      petTraining._checkDailyReset(); // 리셋 방지
      const result = await petTraining.trainPet(pet.id, 'special');

      expect(result.skillLearned).toBeDefined();
    });

    it('존재하지 않는 펫 시 에러를 던져야 함', async () => {
      await expect(petTraining.getPetSkills('non-existent')).rejects.toThrow('Pet not found');
    });
  });

  describe('_addExp', () => {
    it('경험치를 추가하고 레벨업 여부를 반환해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      const initialLevel = pet.level;

      const result = await petTraining._addExp(pet, 100);

      expect(result.levelUp).toBe(true);
      expect(result.newLevel).toBeGreaterThan(initialLevel);
    });

    it('불충분한 경험치는 레벨업하지 않아야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const result = await petTraining._addExp(pet, 50);

      expect(result.levelUp).toBe(false);
      expect(result.newLevel).toBeNull();
    });

    it('레벨업 시 최대 경험치가 증가해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      // 레벨 2로 레벨업
      pet.exp = 100;
      await petManager._updatePet(pet);

      const level1MaxExp = pet.maxExp; // 레벨 2일 때 maxExp = 100
      await petTraining._addExp(pet, 100); // 레벨 3으로 레벨업 (maxExp = 150)

      const updated = await petManager.getPet(pet.id);
      expect(updated.maxExp).toBeGreaterThan(level1MaxExp);
    });
  });

  describe('_calculateExpGain', () => {
    it('훈련 타입에 따라 다른 경험치를 계산해야 함', () => {
      const basic = petTraining._calculateExpGain('basic', 1);
      const intensive = petTraining._calculateExpGain('intensive', 1);
      const special = petTraining._calculateExpGain('special', 1);

      expect(special).toBeGreaterThan(intensive);
      expect(intensive).toBeGreaterThan(basic);
    });

    it('레벨이 높을수록 더 많은 경험치가 필요해야 함', () => {
      const level1Exp = petTraining._calculateExpGain('basic', 1);
      const level10Exp = petTraining._calculateExpGain('basic', 10);

      expect(level10Exp).toBeGreaterThan(level1Exp);
    });
  });

  describe('getStats', () => {
    it('시스템 통계를 조회할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      await petTraining.trainPet(pet.id, 'basic');

      const stats = petTraining.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalTrainedToday).toBeGreaterThan(0);
      expect(stats.nextResetTime).toBeDefined();
    });
  });
});