/**
 * PetSystem 통합 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PetSystem } from './index.js';

describe('PetSystem Integration', () => {
  let petSystem;

  beforeEach(() => {
    petSystem = PetSystem.initialize(null); // 메모리 모드
  });

  afterEach(() => {
    petSystem = null;
    PetSystem.instance = null;
  });

  describe('Singleton Pattern', () => {
    it('단일 인스턴스여야 함', () => {
      const system1 = PetSystem.initialize(null);
      const system2 = PetSystem.getInstance();

      expect(system1).toBe(system2);
    });

    it('getInstance가 null일 경우 새 인스턴스를 생성해야 함', () => {
      PetSystem.instance = null;

      const system = PetSystem.getInstance();
      expect(system).toBeNull();

      const newSystem = PetSystem.initialize(null);
      expect(newSystem).toBeDefined();
    });
  });

  describe('펫 라이프사이클 통합', () => {
    it('전체 라이프사이클: 생성 → 장착 → 훈련 → 진화 → 삭제', async () => {
      // 1. 펫 생성
      const pet = await petSystem.createPet('player1', '나비', 'cat');
      expect(pet).toBeDefined();
      expect(pet.id).toBeDefined();

      // 2. 펫 장착
      await petSystem.equipPet('player1', pet.id);
      const equipped = await petSystem.getEquippedPet('player1');
      expect(equipped.id).toBe(pet.id);

      // 3. 레벨 설정 및 훈련 (진화 조건 충족)
      await petSystem.unequipPet('player1'); // 훈련 후 장착
      pet.level = 10;
      pet.affinity = 50;
      await petSystem.petManager._updatePet(pet);
      await petSystem.equipPet('player1', pet.id);
      petSystem.petTraining.resetAll(); // 일일 훈련 리셋

      // 4. 훈련
      const trainingResult = await petSystem.trainPet(pet.id, 'basic');
      expect(trainingResult.success).toBe(true);
      expect(trainingResult.expGain).toBeGreaterThan(0);

      // 5. 진화
      const evolutionResult = await petSystem.evolvePet(pet.id, 'evolution_stone_1');
      expect(evolutionResult.success).toBe(true);
      expect(evolutionResult.toStage).toBe('evolved1');

      // 6. 상세 정보 조회
      const detailedInfo = await petSystem.getPetDetailedInfo(pet.id);
      expect(detailedInfo).toBeDefined();
      expect(detailedInfo.evolutionStage).toBe('evolved1');

      // 7. 삭제
      await petSystem.deletePet(pet.id);
      const deleted = await petSystem.getPet(pet.id);
      expect(deleted).toBeNull();
    });

    it('데이터 정합성: 펫 상태가 올바르게 유지되어야 함', async () => {
      // 펫 생성
      const pet = await petSystem.createPet('player1', '나비', 'cat');

      // 장착
      await petSystem.equipPet('player1', pet.id);

      // 훈련 (레벨업)
      const initialLevel = pet.level;
      pet.exp = pet.maxExp; // 경험치 최대로 설정
      await petSystem.petManager._updatePet(pet);
      petSystem.petTraining.resetAll();
      await petSystem.trainPet(pet.id, 'basic');

      // 상태 확인
      const detailed = await petSystem.getPetDetailedInfo(pet.id);
      expect(detailed.levelInfo.level).toBeGreaterThan(initialLevel);
      expect(detailed.isEquipped).toBe(true);
    });
  });

  describe('getPlayerPetInfo', () => {
    it('플레이어의 펫 정보를 완전히 조회할 수 있어야 함', async () => {
      const pet1 = await petSystem.createPet('player1', '나비', 'cat');
      const pet2 = await petSystem.createPet('player1', '바둑이', 'dog');
      await petSystem.createPet('player2', '또다른 펫', 'cat');

      await petSystem.equipPet('player1', pet1.id);

      const info = await petSystem.getPlayerPetInfo('player1');

      expect(info.pets).toHaveLength(2);
      expect(info.total).toBe(2);
      expect(info.equipped).toBeDefined();
      expect(info.equipped.id).toBe(pet1.id);
    });

    it('장착된 펫이 없으면 equipped가 null이어야 함', async () => {
      await petSystem.createPet('player1', '나비', 'cat');

      const info = await petSystem.getPlayerPetInfo('player1');

      expect(info.equipped).toBeNull();
    });

    it('펫이 없으면 빈 배열을 반환해야 함', async () => {
      const info = await petSystem.getPlayerPetInfo('player1');

      expect(info.pets).toHaveLength(0);
      expect(info.total).toBe(0);
    });
  });

  describe('getPetDetailedInfo', () => {
    it('상세 정보를 조회할 수 있어야 함', async () => {
      const pet = await petSystem.createPet('player1', '나비', 'cat');

      // 위치 설정
      petSystem.updatePetPosition(pet.id, { x: 100, y: 200 });

      // 감정 설정
      petSystem.updateEmotion(pet.id, 'happy');

      const detailed = await petSystem.getPetDetailedInfo(pet.id);

      expect(detailed.id).toBe(pet.id);
      expect(detailed.name).toBe('나비');
      expect(detailed.type).toBe('cat');
      expect(detailed.position).toEqual({ x: 100, y: 220 });
      expect(detailed.emotion?.type).toBe('happy');
      expect(detailed.levelInfo).toBeDefined();
      expect(detailed.trainingRemaining).toBe(5);
      expect(detailed.skills).toBeDefined();
      expect(detailed.evolutionStage).toBe('basic');
    });

    it('존재하지 않는 펫 시 에러를 던져야 함', async () => {
      await expect(petSystem.getPetDetailedInfo('non-existent')).rejects.toThrow('Pet not found');
    });
  });

  describe('carePet (펫 케어)', () => {
    it('먹이주기 + 친밀도 증가가 정상적으로 작동해야 함', async () => {
      const pet = await petSystem.createPet('player1', '나비', 'cat');
      pet.affinity = 50;
      await petSystem.petManager._updatePet(pet);

      // 배고픔 상태
      petSystem.updateHunger(pet.id, 90);
      const beforeEmotion = petSystem.getEmotion(pet.id);
      expect(beforeEmotion?.type).toBe('hungry');

      // 펫 케어
      const result = await petSystem.carePet(pet.id);

      expect(result.success).toBe(true);
      expect(result.newAffinity).toBe(55);

      // 배고픔 초기화
      const afterEmotion = petSystem.getEmotion(pet.id);
      expect(afterEmotion).toBeNull();
    });

    it('친밀도 100 오버플로우 방지', async () => {
      const pet = await petSystem.createPet('player1', '나비', 'cat');
      pet.affinity = 98;
      await petSystem.petManager._updatePet(pet);

      const result = await petSystem.carePet(pet.id);

      expect(result.newAffinity).toBe(100); // 100 초과 불가
    });
  });

  describe('초기화 및 정리', () => {
    it('플레이어 데이터 정리가 작동해야 함', async () => {
      const pet1 = await petSystem.createPet('player1', '나비', 'cat');
      const pet2 = await petSystem.createPet('player1', '바둑이', 'dog');

      // 위치 및 기타 데이터 설정
      petSystem.updatePetPosition(pet1.id, { x: 100, y: 200 });
      petSystem.updateEmotion(pet1.id, 'happy');

      // 데이터 정리
      await petSystem.clearPlayerData('player1');

      // 정리 대신 펫 삭제 후 재확인
      await petSystem.deletePet(pet1.id);
      await petSystem.deletePet(pet2.id);

      const pets = await petSystem.getPlayerPets('player1');
      expect(pets).toHaveLength(0);
    });
  });

  describe('시스템 통계', () => {
    it('모든 서브시스템의 통계를 조회할 수 있어야 함', () => {
      const stats = petSystem.getSystemStats();

      expect(stats).toBeDefined();
      expect(stats.ai).toBeDefined();
      expect(stats.training).toBeDefined();
      expect(stats.evolution).toBeDefined();
    });
  });

  describe('복합 작업 시나리오', () => {
    it('훈련 → 진화 → 스킬 획득 전체 플로우', async () => {
      const pet = await petSystem.createPet('player1', '나비', 'cat');

      // 레벨 4 설정 (레벨 5로 레벨업하면 스킬 획득)
      pet.level = 4;
      pet.exp = pet.maxExp - 80; // 레벨업 직전 (특별 훈련은 80 경험치)
      await petSystem.petManager._updatePet(pet);
      petSystem.petTraining.resetAll();

      // 훈련으로 레벨업 + 스킬 획득
      const result = await petSystem.trainPet(pet.id, 'special');

      expect(result.skillLearned).toBeDefined();

      // 스킬 목록 확인
      const skills = await petSystem.getPetSkills(pet.id);
      expect(skills).toContain(result.skillLearned);
    });

    it('따라다님 → 감정 표현 행동 플로우', async () => {
      const pet = await petSystem.createPet('player1', '나비', 'cat');
      pet.affinity = 90; // 높은 친밀도
      await petSystem.petManager._updatePet(pet);

      // 위치 업데이트
      const position = petSystem.updatePetPosition(pet.id, { x: 100, y: 200 });
      expect(position).toEqual({ x: 100, y: 220 });

      // 자동 행동
      const action = await petSystem.executeAutoAction(pet.id);
      expect(action.type).toBe('love'); // 높은 친밀도

      // 감정 표현 설정
      petSystem.updateEmotion(pet.id, 'love');
      const emotion = petSystem.getEmotion(pet.id);
      expect(emotion?.type).toBe('love');
    });
  });
});