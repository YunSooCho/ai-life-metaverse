/**
 * SkillIntegration - 스킬 시스템 연동
 *
 * 기능:
 * - 장착된 스킬 사용
 * - 스킬 쿨타임 관리
 * - 스킬 효과 적용 (버프/디버프)
 * - 스킬 연계
 */

/**
 * 스킬 효과 타입
 */
const SkillEffectType = {
  DAMAGE: 'damage', // 데미지
  HEAL: 'heal', // 회복
  BUFF: 'buff', // 버프
  DEBUFF: 'debuff', // 디버프
  BUFF_DELETE: 'buff_delete', // 디버프 해제
  COMBO: 'combo' // 연계
};

/**
 * 버프/디버프
 */
class StatusEffect {
  constructor(type, name, duration, value = 0) {
    this.id = `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type; // 'buff' or 'debuff'
    this.name = name;
    this.duration = duration; // 턴 수
    this.value = value; // 효과 값
    this.appliedAt = Date.now();
  }

  reduce() {
    this.duration--;
    return this.duration <= 0;
  }
}

/**
 * SkillIntegration 클래스
 */
class SkillIntegration {
  constructor() {
    this.skillCooldowns = new Map(); // battleId_playerId_skillId -> remaining
    this.activeBuffs = new Map(); // battleId_playerId -> StatusEffect[]
  }

  /**
   * 스킬 쿨타임 초기화
   */
  initializeCooldowns(battle, playerId) {
    const player = battle.players[playerId];
    player.skills.forEach(skill => {
      const key = `${battle.id}_${playerId}_${skill.id}`;
      this.skillCooldowns.set(key, 0);
    });
  }

  /**
   * 스킬 사용 가능 확인
   */
  canUseSkill(battle, playerId, skillId) {
    const key = `${battle.id}_${playerId}_${skillId}`;
    const cooldown = this.skillCooldowns.get(key) || 0;

    return cooldown === 0;
  }

  /**
   * 스킬 사용
   */
  useSkill(battle, attackerId, skillId) {
    const attacker = battle.players[attackerId];
    const defenderId = attackerId === battle.player1Id ? battle.player2Id : battle.player1Id;
    const defender = battle.players[defenderId];

    const skill = attacker.skills.find(s => s.id === skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    // 쿨타임 확인
    if (!this.canUseSkill(battle, attackerId, skillId)) {
      throw new Error('Skill on cooldown');
    }

    // 쿨타임 설정
    const key = `${battle.id}_${attackerId}_${skillId}`;
    this.skillCooldowns.set(key, skill.cooldown || 3);

    // 스킬 효과 적용
    const results = [];

    for (const effect of skill.effects || []) {
      const result = this._applyEffect(attacker, defender, effect);

      results.push({
        type: effect.type,
        target: effect.target,
        value: result.value,
        description: result.description
      });
    }

    // 버프/디버프 턴 감소
    this._reduceStatusEffects(battle, attackerId);
    this._reduceStatusEffects(battle, defenderId);

    // 스킬 로그
    battle._addLog('skill', `${attacker.name} used skill: ${skill.name}`);

    return results;
  }

  /**
   * 효과 적용
   */
  _applyEffect(attacker, target, effect) {
    switch (effect.type) {
      case SkillEffectType.DAMAGE:
        return this._applyDamage(attacker, target, effect);

      case SkillEffectType.HEAL:
        return this._applyHeal(attacker, attacker, effect); // 시전자 회복

      case SkillEffectType.BUFF:
        return this._applyBuff(attacker, attacker, effect); // 시전자 버프

      case SkillEffectType.DEBUFF:
        return this._applyDebuff(attacker, target, effect); // 타겟 디버프

      case SkillEffectType.BUFF_DELETE:
        return this._removeDebuff(target);

      default:
        return { value: 0, description: 'Unknown effect' };
    }
  }

  /**
   * 데미지 효과
   */
  _applyDamage(attacker, target, effect) {
    const baseDamage = effect.value || 1;
    const randomFactor = Math.random() * 0.2 + 0.9; // 0.9~1.1
    const defenseReduction = target.defense * 0.5;

    const damage = Math.floor((baseDamage * randomFactor * attacker.attack / 100) - defenseReduction);
    const finalDamage = Math.max(1, damage);

    target.hp = Math.max(0, target.hp - finalDamage);

    return {
      value: finalDamage,
      description: `${target.name} took ${finalDamage} damage`
    };
  }

  /**
   * 회복 효과
   */
  _applyHeal(caster, target, effect) {
    const healAmount = effect.value || 0;
    target.hp = Math.min(target.maxHp, target.hp + healAmount);

    return {
      value: healAmount,
      description: `${target.name} healed ${healAmount} HP`
    };
  }

  /**
   * 버프 효과
   */
  _applyBuff(caster, target, effect) {
    const buff = new StatusEffect(
      'buff',
      effect.name || 'Unknown Buff',
      effect.duration || 3,
      effect.value || 0
    );

    target.buffs.push(buff);

    return {
      value: buff.value,
      description: `${target.name} gained buff: ${buff.name} (+${buff.value})`
    };
  }

  /**
   * 디버프 효과
   */
  _applyDebuff(caster, target, effect) {
    const debuff = new StatusEffect(
      'debuff',
      effect.name || 'Unknown Debuff',
      effect.duration || 3,
      effect.value || 0
    );

    target.debuffs.push(debuff);

    return {
      value: debuff.value,
      description: `${target.name} gained debuff: ${debuff.name} (-${debuff.value})`
    };
  }

  /**
   * 디버프 제거
   */
  _removeDebuff(target) {
    if (target.debuffs.length === 0) {
      return {
        value: 0,
        description: `${target.name} has no debuffs to remove`
      };
    }

    const removedDebuff = target.debuffs.shift();
    return {
      value: 1,
      description: `${target.name} removed debuff: ${removedDebuff.name}`
    };
  }

  /**
   * 상태 효과 감소
   */
  _reduceStatusEffects(battle, playerId) {
    const player = battle.players[playerId];

    // 버프 감소
    player.buffs = player.buffs.filter(buff => {
      buff.reduce();
      return buff.duration > 0;
    });

    // 디버프 감소
    player.debuffs = player.debuffs.filter(debuff => {
      debuff.reduce();
      return debuff.duration > 0;
    });
  }

  /**
   * 쿨타임 감소
   */
  reduceCooldowns(battle, playerId) {
    const player = battle.players[playerId];

    player.skills.forEach(skill => {
      const key = `${battle.id}_${playerId}_${skill.id}`;
      const cooldown = this.skillCooldowns.get(key) || 0;

      if (cooldown > 0) {
        this.skillCooldowns.set(key, cooldown - 1);
      }
    });
  }

  /**
   * 스킬 쿨타임 가져오기
   */
  getSkillCooldown(battle, playerId, skillId) {
    const key = `${battle.id}_${playerId}_${skillId}`;
    return this.skillCooldowns.get(key) || 0;
  }

  /**
   * 모든 스킬 쿨타임 가져오기
   */
  getAllSkillCooldowns(battle, playerId) {
    const player = battle.players[playerId];
    const cooldowns = {};

    player.skills.forEach(skill => {
      cooldowns[skill.id] = this.getSkillCooldown(battle, playerId, skill.id);
    });

    return cooldowns;
  }

  /**
   * 스킬 연계 검증
   */
  checkCombo(battle, playerId, skillId) {
    const player = battle.players[playerId];
    const skill = player.skills.find(s => s.id === skillId);

    if (!skill || !skill.combo) {
      return { valid: false, reason: 'No combo configured' };
    }

    const lastAction = battle.actions[battle.actions.length - 1];
    if (!lastAction || lastAction.playerId !== playerId) {
      return { valid: false, reason: 'No previous action' };
    }

    const lastSkill = player.skills.find(s => s.id === lastAction.skillId);
    if (!lastSkill) {
      return { valid: false, reason: 'Previous action was not a skill' };
    }

    // 스킬 ID 기반 연계
    const comboValid = skill.combo.requiredSkillIds?.includes(lastSkill.id) || false;

    return {
      valid: comboValid,
      reason: comboValid ? 'Combo valid' : 'Skill sequence not valid'
    };
  }

  /**
   * 전투 정리
   */
  cleanupBattle(battle) {
    // 전투 종료 시 쿨타임/상태 효과 정리
    this.skillCooldowns.forEach((value, key) => {
      if (key.startsWith(battle.id)) {
        this.skillCooldowns.delete(key);
      }
    });

    this.activeBuffs.forEach((value, key) => {
      if (key.startsWith(battle.id)) {
        this.activeBuffs.delete(key);
      }
    });
  }

  /**
   * 통계 가져오기
   */
  getStatistics() {
    return {
      totalCooldowns: this.skillCooldowns.size,
      totalBuffs: this.activeBuffs.size
    };
  }
}

export {
  SkillIntegration,
  SkillEffectType,
  StatusEffect
};