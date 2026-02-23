/**
 * PetEvolution 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PetManager } from './pet-manager.js';
import { PetEvolution } from './pet-evolution.js';

describe('PetEvolution', () => {
  let petManager;
  let petEvolution;

  beforeEach(() => {
    petManager = new PetManager(null);
    petEvolution = new PetEvolution(petManager);
  });

  afterEach(() => {
    petManager = null;
    petEvolution = null;
  });

  describe('evolvePet', () => {
    it('조건 충족 시 펫을 진화시킬 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 10;
      pet.affinity = 50;
      await petManager._updatePet(pet);

      const result = await petEvolution.evolvePet(pet.id, 'evolution_stone_1');

      expect(result.success).toBe(true);
      expect(result.fromStage).toBe('basic');
      expect(result.toStage).toBe('evolved1');
      expect(result.statBonuses).toBeDefined();
    });

    it('진화 후 스탯이 증가해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      const beforeHealth = pet.stats.health;
      const beforeAttack = pet.stats.attack;

      pet.level = 10;
      pet.affinity = 50;
      await petManager._updatePet(pet);

      await petEvolution.evolvePet(pet.id, 'evolution_stone_1');

      const evolved = await petManager.getPet(pet.id);
      expect(evolved.stats.health).toBeGreaterThan(beforeHealth);
      expect(evolved.stats.attack).toBeGreaterThan(beforeAttack);
    });

    it('레벨 부족 시 진화할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 5; // 레벨 부족
      pet.affinity = 50;
      await petManager._updatePet(pet);

      await expect(
        petEvolution.evolvePet(pet.id, 'evolution_stone_1')
      ).rejects.toThrow('Pet level 10 required for evolution');
    });

    it('친밀도 부족 시 진화할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 10;
      pet.affinity = 20; // 친밀도 부족
      await petManager._updatePet(pet);

      await expect(
        petEvolution.evolvePet(pet.id, 'evolution_stone_1')
      ).rejects.toThrow('Affinity 50 required for evolution');
    });

    it('잘못된 아이템 시 진화할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 10;
      pet.affinity = 50;
      await petManager._updatePet(pet);

      await expect(
        petEvolution.evolvePet(pet.id, 'wrong_item')
      ).rejects.toThrow('Invalid evolution item');
    });

    it('최종 형태 펫은 진화할 수 없어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 40;
      pet.affinity = 100;
      pet.evolutionStage = 'final';
      await petManager._updatePet(pet);

      await expect(
        petEvolution.evolvePet(pet.id, 'evolution_stone_1')
      ).rejects.toThrow('Pet is already at final evolution stage');
    });

    it('존재하지 않는 펫 진화 시 에러를 던져야 함', async () => {
      await expect(
        petEvolution.evolvePet('non-existent', 'evolution_stone_1')
      ).rejects.toThrow('Pet not found');
    });

    it('여러 단계로 진화할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      // 1차 진화
      pet.level = 10;
      pet.affinity = 50;
      await petManager._updatePet(pet);
      const result1 = await petEvolution.evolvePet(pet.id, 'evolution_stone_1');
      expect(result1.toStage).toBe('evolved1');

      // 2차 진화
      pet.level = 20;
      pet.affinity = 70;
      await petManager._updatePet(pet);
      const result2 = await petEvolution.evolvePet(pet.id, 'evolution_stone_2');
      expect(result2.toStage).toBe('evolved2');

      // 최종 진화
      pet.level = 30;
      pet.affinity = 90;
      await petManager._updatePet(pet);
      const result3 = await petEvolution.evolvePet(pet.id, 'evolution_stone_3');
      expect(result3.toStage).toBe('final');
    });
  });

  describe('canEvolve', () => {
    it('진화 가능 여부를 확인할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 10;
      pet.affinity = 50;
      await petManager._updatePet(pet);

      const result = await petEvolution.canEvolve(pet.id);

      expect(result.canEvolve).toBe(true);
      expect(result.condition).toBeDefined();
    });

    it('조건 불충족 시 진화 불가능해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 5; // 레벨 부족
      await petManager._updatePet(pet);

      const result = await petEvolution.canEvolve(pet.id);

      expect(result.canEvolve).toBe(false);
    });

    it('최종 형태는 진화 불가능해야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.evolutionStage = 'final';
      await petManager._updatePet(pet);

      const result = await petEvolution.canEvolve(pet.id);

      expect(result.canEvolve).toBe(false);
      expect(result.condition).toBeNull();
    });

    it('존재하지 않는 펫 시 에러를 던져야 함', async () => {
      await expect(petEvolution.canEvolve('non-existent')).rejects.toThrow('Pet not found');
    });
  });

  describe('getEvolutionStage', () => {
    it('진화 단계를 조회할 수 있어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');

      const stage = await petEvolution.getEvolutionStage(pet.id);

      expect(stage).toBe('basic');
    });

    it('진화 후 단계가 변경되어야 함', async () => {
      const pet = await petManager.createPet('player1', '나비', 'cat');
      pet.level = 10;
      pet.affinity = 50;
      await petManager._updatePet(pet);

      await petEvolution.evolvePet(pet.id, 'evolution_stone_1');

      const stage = await petEvolution.getEvolutionStage(pet.id);
      expect(stage).toBe('evolved1');
    });

    it('존재하지 않는 펫 시 에러를 던져야 함', async () => {
      await expect(petEvolution.getEvolutionStage('non-existent')).rejects.toThrow('Pet not found');
    });
  });

  describe('getEvolutionPath', () => {
    it('진화 경로를 조회할 수 있어야 함', () => {
      const path = petEvolution.getEvolutionPath('cat');

      expect(path).toBeDefined();
      expect(Array.isArray(path)).toBe(true);
      expect(path).toHaveLength(4);

      expect(path[0].stage).toBe('basic');
      expect(path[1].stage).toBe('evolved1');
      expect(path[2].stage).toBe('evolved2');
      expect(path[3].stage).toBe('final');
    });

    it('모든 진화 단계에 정보를 포함해야 함', () => {
      const path = petEvolution.getEvolutionPath('cat');

      path.forEach(stage => {
        expect(stage.stage).toBeDefined();
        expect(stage.name).toBeDefined();
        expect(stage.description).toBeDefined();
      });
    });
  });

  describe('getEvolutionAppearance', () => {
    it('진화 외형을 조회할 수 있어야 함', () => {
      const appearance = petEvolution.getEvolutionAppearance('cat', 'basic');

      expect(appearance).toBeDefined();
      expect(appearance.emoji).toBe('🐱');
      expect(appearance.size).toBe(1.0);
      expect(appearance.color).toBeDefined();
    });

    it('모든 타입의 펫에 대해 외형이 정의되어야 함', () => {
      const types = ['cat', 'dog', 'dragon', 'phoenix', 'bunny', 'fox'];

      types.forEach(type => {
        const basic = petEvolution.getEvolutionAppearance(type, 'basic');
        expect(basic).toBeDefined();
        expect(basic.emoji).toBeDefined();
      });
    });

    it('진화 단계별로 외형이 달라져야 함', () => {
      const basic = petEvolution.getEvolutionAppearance('cat', 'basic');
      const evolved1 = petEvolution.getEvolutionAppearance('cat', 'evolved1');
      const final = petEvolution.getEvolutionAppearance('cat', 'final');

      expect(basic.size).toBeLessThan(evolved1.size);
      expect(evolved1.size).toBeLessThan(final.size);
    });

    it('존재하지 않는 타입은 기본 형태를 반환해야 함', () => {
      const unknown = petEvolution.getEvolutionAppearance('unknown', 'basic');

      expect(unknown).toBeDefined();
      expect(unknown.emoji).toBeDefined();
    });
  });

  describe('_calculateStatBonuses', () => {
    it('진화 단계에 따른 스탯 보너스를 계산해야 함', () => {
      const evolved1 = petEvolution._calculateStatBonuses('evolved1');
      const evolved2 = petEvolution._calculateStatBonuses('evolved2');
      const final = petEvolution._calculateStatBonuses('final');

      expect(final.health).toBeGreaterThan(evolved2.health);
      expect(evolved2.health).toBeGreaterThan(evolved1.health);

      expect(final.attack).toBeGreaterThan(evolved2.attack);
      expect(evolved2.attack).toBeGreaterThan(evolved1.attack);
    });

    it('모든 스탯이 포함되어야 함', () => {
      const bonuses = petEvolution._calculateStatBonuses('evolved1');

      expect(bonuses.health).toBeDefined();
      expect(bonuses.attack).toBeDefined();
      expect(bonuses.defense).toBeDefined();
      expect(bonuses.speed).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('시스템 통계를 조회할 수 있어야 함', () => {
      const stats = petEvolution.getStats();

      expect(stats).toBeDefined();
      expect(stats.evolutionStages).toBe(4);
      expect(stats.items).toBeDefined();
      expect(stats.items.length).toBeGreaterThan(0);
    });
  });
});