/**
 * SkillIntegration 테스트
 */

import { SkillIntegration, SkillEffectType, StatusEffect } from '../skill-integration.js';
import { Battle, BattleStatus } from '../battle-manager.js';

describe('SkillIntegration', () => {
  let skillIntegration;
  let battle;

  beforeEach(() => {
    skillIntegration = new SkillIntegration();

    const player1 = {
      id: 'p1',
      name: 'Player 1',
      stats: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 20,
        defense: 10,
        speed: 10
      },
      skills: [
        {
          id: 'skill_fireball',
          name: 'Fireball',
          cooldown: 3,
          effects: [
            { type: SkillEffectType.DAMAGE, target: 'enemy', value: 30 }
          ]
        },
        {
          id: 'skill_heal',
          name: 'Heal',
          cooldown: 2,
          effects: [
            { type: SkillEffectType.HEAL, target: 'self', value: 25 }
          ]
        }
      ]
    };

    const player2 = {
      id: 'p2',
      name: 'Player 2',
      stats: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 18,
        defense: 12,
        speed: 8
      },
      skills: [
        {
          id: 'skill_lightning',
          name: 'Lightning',
          cooldown: 3,
          effects: [
            { type: SkillEffectType.DAMAGE, target: 'enemy', value: 25 }
          ]
        }
      ]
    };

    battle = new Battle(player1, player2);
    battle.start();

    skillIntegration.initializeCooldowns(battle, player1.id);
    skillIntegration.initializeCooldowns(battle, player2.id);
  });

  describe('initializeCooldowns', () => {
    it('should initialize cooldowns for all player skills', () => {
      skillIntegration.initializeCooldowns(battle, 'p1');

      const cooldowns = skillIntegration.getAllSkillCooldowns(battle, 'p1');

      expect(cooldowns['skill_fireball']).toBe(0);
      expect(cooldowns['skill_heal']).toBe(0);
    });
  });

  describe('canUseSkill', () => {
    it('should return true if skill is not on cooldown', () => {
      const canUse = skillIntegration.canUseSkill(battle, 'p1', 'skill_fireball');

      expect(canUse).toBe(true);
    });

    it('should return false if skill is on cooldown', () => {
      // 쿨타임 3 턴으로 설정
      const key = `${battle.id}_p1_skill_fireball`;
      skillIntegration.skillCooldowns.set(key, 3);

      const canUse = skillIntegration.canUseSkill(battle, 'p1', 'skill_fireball');

      expect(canUse).toBe(false);
    });
  });

  describe('useSkill', () => {
    it('should use skill and apply damage effect', () => {
      const initialHp = battle.players[battle.player2Id].hp;

      const results = skillIntegration.useSkill(battle, battle.player1Id, 'skill_fireball');

      const newHp = battle.players[battle.player2Id].hp;

      expect(newHp).toBeLessThan(initialHp);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe(SkillEffectType.DAMAGE);
    });

    it('should use skill and apply heal effect', () => {
      const initialHp = battle.players[battle.player1Id].hp;

      // 먼저 데미지를 입음
      battle.players[battle.player1Id].hp = 50;

      const results = skillIntegration.useSkill(battle, battle.player1Id, 'skill_heal');

      const newHp = battle.players[battle.player1Id].hp;

      expect(newHp).toBeGreaterThan(50);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe(SkillEffectType.HEAL);
    });

    it('should throw error if skill is on cooldown', () => {
      // 쿨타임 설정
      const key = `${battle.id}_p1_skill_fireball`;
      skillIntegration.skillCooldowns.set(key, 3);

      expect(() => {
        skillIntegration.useSkill(battle, battle.player1Id, 'skill_fireball');
      }).toThrow('Skill on cooldown');
    });

    it('should throw error if skill not found', () => {
      expect(() => {
        skillIntegration.useSkill(battle, battle.player1Id, 'skill_nonexistent');
      }).toThrow('Skill not found');
    });
  });

  describe('reduceCooldowns', () => {
    it('should reduce cooldowns for all player skills', () => {
      // 쿨타임 3 턴으로 설정
      const key = `${battle.id}_p1_skill_fireball`;
      skillIntegration.skillCooldowns.set(key, 3);

      skillIntegration.reduceCooldowns(battle, 'p1');

      const cooldowns = skillIntegration.getAllSkillCooldowns(battle, 'p1');

      expect(cooldowns['skill_fireball']).toBe(2);
    });
  });

  describe('getSkillCooldown', () => {
    it('should return remaining cooldown', () => {
      const key = `${battle.id}_p1_skill_fireball`;
      skillIntegration.skillCooldowns.set(key, 3);

      const cooldown = skillIntegration.getSkillCooldown(battle, 'p1', 'skill_fireball');

      expect(cooldown).toBe(3);
    });

    it('should return 0 if skill has no cooldown', () => {
      const cooldown = skillIntegration.getSkillCooldown(battle, 'p1', 'skill_fireball');

      expect(cooldown).toBe(0);
    });
  });

  describe('getAllSkillCooldowns', () => {
    it('should return cooldowns for all player skills', () => {
      const cooldowns = skillIntegration.getAllSkillCooldowns(battle, 'p1');

      expect(cooldowns['skill_fireball']).toBeDefined();
      expect(cooldowns['skill_heal']).toBeDefined();
    });
  });

  describe('checkCombo', () => {
    it('should return valid if combo sequence is correct', () => {
      // 콤보 스킬 설정
      battle.players[battle.player1Id].skills.push({
        id: 'skill_combo',
        name: 'Combo Skill',
        cooldown: 3,
        combo: {
          requiredSkillIds: ['skill_fireball']
        },
        effects: [
          { type: SkillEffectType.DAMAGE, target: 'enemy', value: 50 }
        ]
      });

      // 첫 번째 스킬 사용 후 action 추가 (BattleManager 역할 대신)
      skillIntegration.useSkill(battle, battle.player1Id, 'skill_fireball');

      // battle.actions에 action 추가 (BattleManager의 executeAction처럼)
      battle.actions.push({
        turn: battle.turn,
        playerId: battle.player1Id,
        type: 'skill',
        skillId: 'skill_fireball',
        targetId: battle.player2Id,
        damage: 0
      });

      // 콤보 스킬
      const comboCheck = skillIntegration.checkCombo(battle, battle.player1Id, 'skill_combo');

      expect(comboCheck.valid).toBe(true);
    });

    it('should return invalid if combo sequence is wrong', () => {
      const comboCheck = skillIntegration.checkCombo(battle, battle.player1Id, 'skill_fireball');

      expect(comboCheck.valid).toBe(false);
    });
  });
});

describe('StatusEffect', () => {
  it('should create a status effect', () => {
    const buff = new StatusEffect('buff', 'Attack Up', 3, 10);

    expect(buff.type).toBe('buff');
    expect(buff.name).toBe('Attack Up');
    expect(buff.duration).toBe(3);
    expect(buff.value).toBe(10);
  });

  it('should reduce duration', () => {
    const buff = new StatusEffect('buff', 'Attack Up', 3, 10);

    const expired = buff.reduce();

    expect(buff.duration).toBe(2);
    expect(expired).toBe(false);
  });

  it('should return true when expired', () => {
    const buff = new StatusEffect('buff', 'Attack Up', 1, 10);

    const expired = buff.reduce();

    expect(expired).toBe(true);
  });
});