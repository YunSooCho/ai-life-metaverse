/**
 * RaidBoss - 레이드 보스 시스템
 * 보스 체력, 스킬, 패턴, 페이즈 전환
 */

export default class RaidBoss {
  constructor(config = {}) {
    this.bossId = config.bossId || 'unknown_boss';
    this.name = config.name || 'Unknown Boss';
    this.maxHp = config.maxHp || 1000000;
    this.currentHp = this.maxHp;
    this.level = config.level || 100;
    this.type = config.type || 'normal'; // normal, elite, legendary, mythic
    this.phases = config.phases || this.createDefaultPhases();
    this.currentPhase = 1;
    this.skills = config.skills || this.createDefaultSkills();
    this.patterns = config.patterns || [];
    this.weaknesses = config.weaknesses || [];
    this.resistances = config.resistances || [];
    this.isEnraged = false;
    this.enrageThreshold = config.enrageThreshold || 0.1; // HP 10% 미만 시 광폭화
  }

  /**
   * 기본 페이즈 생성
   * @returns {Array<Object>} 기본 페이즈 목록
   */
  createDefaultPhases() {
    return [
      {
        phase: 1,
        hpPercent: 1.0,
        skillPool: ['basic_attack', 'aoe_damage'],
        patternInterval: 30000
      },
      {
        phase: 2,
        hpPercent: 0.5,
        skillPool: ['basic_attack', 'aoe_damage', 'debuff_attack'],
        patternInterval: 20000,
        enrageMultiplier: 1.2
      },
      {
        phase: 3,
        hpPercent: 0.2,
        skillPool: ['basic_attack', 'aoe_damage', 'ultimate_skill', 'summon_minions'],
        patternInterval: 15000,
        enrageMultiplier: 1.5
      }
    ];
  }

  /**
   * 기본 스킬 생성
   * @returns {Array<Object>} 기본 스킬 목록
   */
  createDefaultSkills() {
    return [
      {
        skillId: 'basic_attack',
        name: '기본 공격',
        type: 'single',
        damage: 5000,
        cooldown: 3000
      },
      {
        skillId: 'aoe_damage',
        name: '범위 공격',
        type: 'aoe',
        damage: 3000,
        radius: 5,
        cooldown: 15000
      },
      {
        skillId: 'debuff_attack',
        name: '디버프 공격',
        type: 'debuff',
        debuffType: 'slow',
        duration: 5000,
        cooldown: 20000
      },
      {
        skillId: 'ultimate_skill',
        name: '궁극기',
        type: 'ultimate',
        damage: 50000,
        cooldown: 60000
      },
      {
        skillId: 'summon_minions',
        name: '소환',
        type: 'summon',
        minionCount: 3,
        cooldown: 45000
      }
    ];
  }

  /**
   * 데미지 받음
   * @param {number} damage - 데미지
   * @param {Object} attacker - 공격자 정보
   * @returns {Object} 데미지 처리 결과
   */
  takeDamage(damage, attacker = {}) {
    // 저항 확인
    let finalDamage = damage;
    if (attacker.type && this.resistances.includes(attacker.type)) {
      finalDamage = Math.floor(finalDamage * 0.5);
    }

    // 약점 확인
    if (attacker.type && this.weaknesses.includes(attacker.type)) {
      finalDamage = Math.floor(finalDamage * 1.5);
    }

    // 광폭화 상태에서 데미지 증가
    if (this.isEnraged) {
      finalDamage = Math.floor(finalDamage * 1.3);
    }

    this.currentHp = Math.max(0, this.currentHp - finalDamage);

    const result = {
      damage: finalDamage,
      currentHp: this.currentHp,
      maxHp: this.maxHp,
      hpPercent: this.currentHp / this.maxHp,
      phase: this.currentPhase,
      isDead: this.currentHp <= 0
    };

    // 페이즈 체크
    this.checkPhaseTransition();

    // 광폭화 체크
    if (!this.isEnraged && this.currentHp / this.maxHp <= this.enrageThreshold) {
      this.isEnraged = true;
      result.enrageTriggered = true;
    }

    return result;
  }

  /**
   * HP 회복
   * @param {number} amount - 회복량
   */
  heal(amount) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }

  /**
   * 페이즈 전환 확인
   * @returns {number} 현재 페이즈
   */
  checkPhaseTransition() {
    const hpPercent = this.currentHp / this.maxHp;

    for (let i = this.phases.length - 1; i >= 0; i--) {
      if (hpPercent <= this.phases[i].hpPercent && this.currentPhase < this.phases[i].phase) {
        this.currentPhase = this.phases[i].phase;
        return this.currentPhase;
      }
    }

    return this.currentPhase;
  }

  /**
   * 현재 페이즈 정보 조회
   * @returns {Object|null} 현재 페이즈 정보
   */
  getCurrentPhase() {
    return this.phases.find(p => p.phase === this.currentPhase) || null;
  }

  /**
   * 스킬 사용
   * @param {string} skillId - 스킬 ID
   * @returns {Object|null} 스킬 결과
   */
  useSkill(skillId) {
    const skill = this.skills.find(s => s.skillId === skillId);
    if (!skill) return null;

    return {
      skillId: skill.skillId,
      name: skill.name,
      type: skill.type,
      damage: skill.damage,
      debuffType: skill.debuffType,
      debuffDuration: skill.duration,
      minionCount: skill.minionCount,
      cooldown: skill.cooldown,
      timestamp: Date.now()
    };
  }

  /**
   * 스킬 풀에서 랜덤 스킬 선택
   * @returns {Object|null} 스킬 정보
   */
  randomSkill() {
    const phase = this.getCurrentPhase();
    if (!phase || !phase.skillPool) return null;

    const availableSkills = this.skills.filter(s => phase.skillPool.includes(s.skillId));
    if (availableSkills.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableSkills.length);
    return availableSkills[randomIndex];
  }

  /**
   * 패턴 실행
   * @param {number} timestamp - 현재 시간
   * @returns {Object|null} 패턴 결과
   */
  executePattern(timestamp = Date.now()) {
    const phase = this.getCurrentPhase();
    if (!phase || !this.patterns || this.patterns.length === 0) return null;

    // 패턴 중 랜덤 선택
    const randomPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];

    return {
      patternId: randomPattern.patternId,
      name: randomPattern.name,
      description: randomPattern.description,
      timestamp,
      phase: this.currentPhase
    };
  }

  /**
   * 보스 리셋
   */
  reset() {
    this.currentHp = this.maxHp;
    this.currentPhase = 1;
    this.isEnraged = false;
  }

  /**
   * 보스 상태 조회
   * @returns {Object} 보스 상태
   */
  getStatus() {
    const phase = this.getCurrentPhase();
    const hpPercent = this.currentHp / this.maxHp;

    return {
      bossId: this.bossId,
      name: this.name,
      currentHp: this.currentHp,
      maxHp: this.maxHp,
      hpPercent,
      level: this.level,
      type: this.type,
      currentPhase: this.currentPhase,
      phaseName: phase ? `Phase ${phase.phase}` : 'Unknown',
      isEnraged: this.isEnraged,
      isDead: this.currentHp <= 0
    };
  }

  /**
   * 보스 초기화
   */
  initialize() {
    this.currentHp = this.maxHp;
    this.currentPhase = 1;
    this.isEnraged = false;
  }
}