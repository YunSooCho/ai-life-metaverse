/**
 * RaidCombat - 레이드 전투 시스템
 * 협동 보스전, 데미지 계산, 라운드 관리
 */

class RaidCombat {
  constructor(raidManager, raidBoss) {
    this.raidManager = raidManager;
    this.raidBoss = raidBoss;
    this.combatTurn = 0;
    this.combatLog = [];
    this.lastBossActionTime = 0;
  }

  /**
   * 전투 시작
   * @param {string} raidId - 레이드 ID
   * @returns {Object} 전투 시작 결과
   */
  startCombat(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return { error: 'raid_not_found' };

    this.combatTurn = 0;
    this.combatLog = [];
    this.lastBossActionTime = Date.now();

    // 보스 초기화
    if (this.raidBoss) {
      this.raidBoss.reset();
    }

    const logEntry = {
      type: 'combat_start',
      turn: this.combatTurn,
      timestamp: Date.now(),
      message: '레이드 전투가 시작되었습니다.'
    };

    this.combatLog.push(logEntry);

    return {
      raidId,
      bossStatus: this.raidBoss ? this.raidBoss.getStatus() : null,
      combatLog: [logEntry]
    };
  }

  /**
   * 플레이어 공격 처리
   * @param {string} raidId - 레이드 ID
   * @param {string} characterId - 캐릭터 ID
   * @param {number} damage - 데미지
   * @param {Object} attackInfo - 공격 정보
   * @returns {Object} 공격 결과
   */
  processAttack(raidId, characterId, damage, attackInfo = {}) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid || raid.status !== 'in_progress') {
      return { error: 'raid_not_active' };
    }

    const participant = raid.participants.find(p => p.characterId === characterId);
    if (!participant) return { error: 'not_participating' };

    // 보스 데미지 처리
    const damageResult = this.raidBoss ? this.raidBoss.takeDamage(damage, attackInfo) : { damage: 0, isDead: false };

    // 참여자 데미지 기록
    participant.damage = (participant.damage || 0) + damage;

    // 전투 로그
    const logEntry = {
      type: 'player_attack',
      turn: ++this.combatTurn,
      timestamp: Date.now(),
      attackerId: characterId,
      attackerName: participant.name,
      damage: damageResult.damage,
      bossHp: damageResult.currentHp,
      bossMaxHp: damageResult.maxHp,
      bossHpPercent: damageResult.hpPercent,
      phase: damageResult.phase,
      skill: attackInfo.skill || 'basic_attack',
      crit: attackInfo.crit || false
    };

    this.combatLog.push(logEntry);

    // 레이드 업데이트
    this.raidManager.raids.set(raidId, raid);

    // 보스 사망 확인
    if (damageResult.isDead) {
      return {
        ...damageResult,
        raidCompleted: true,
        victory: true,
        combatLog: [logEntry]
      };
    }

    // 보스 전투 처리 (AI)
    const bossAction = this.processBossAction(raid);

    return {
      ...damageResult,
      bossAction,
      combatLog: [logEntry]
    };
  }

  /**
   * 보스 액션 처리
   * @param {Object} raid - 레이드 정보
   * @returns {Object|null} 보스 액션 결과
   */
  processBossAction(raid) {
    if (!this.raidBoss) return null;

    const now = Date.now();
    const phase = this.raidBoss.getCurrentPhase();

    if (!phase) return null;

    // 스킬 사용
    const skill = this.raidBoss.randomSkill();
    let action = null;

    if (skill) {
      const targets = this.selectBossTargets(raid, skill.type);

      action = {
        type: 'boss_skill',
        skillId: skill.skillId,
        name: skill.name,
        skillType: skill.type,
        damage: skill.damage,
        targets: targets.map(t => t.characterId),
        timestamp: now
      };

      // 데미지 적용
      targets.forEach(target => {
        const participant = raid.participants.find(p => p.characterId === target.characterId);
        if (participant) {
          const damage = this.calculateBossDamage(skill, target);
          this.applyBossDamage(raid, participant, damage);

          // 전투 로그
          this.combatLog.push({
            type: 'boss_attack',
            turn: this.combatTurn,
            timestamp: now,
            bossName: this.raidBoss.name,
            skillId: skill.skillId,
            skillName: skill.name,
            targetId: participant.characterId,
            targetName: participant.name,
            damage,
            isDead: participant.currentHp <= 0
          });
        }
      });

      // 레이드 업데이트
      this.raidManager.raids.set(raid.raidId, raid);
    }

    this.lastBossActionTime = now;
    return action;
  }

  /**
   * 보스 타겟 선택
   * @param {Object} raid - 레이드 정보
   * @param {string} skillType - 스킬 타입
   * @returns {Array<Object>} 타겟 목록
   */
  selectBossTargets(raid, skillType) {
    const aliveParticipants = raid.participants.filter(p => (p.currentHp || p.level || 100) > 0);

    switch (skillType) {
      case 'single':
        // 단일 타겟: 가장 높은 딜러
        return [aliveParticipants.sort((a, b) => (b.damage || 0) - (a.damage || 0))[0] || aliveParticipants[0]];
      case 'aoe':
        // 광역: 모든 참여자
        return aliveParticipants;
      case 'debuff':
        // 디버프: 랜덤 3명
        const shuffled = [...aliveParticipants].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(3, shuffled.length));
      case 'summon':
        // 소환: 타겟 없음
        return [];
      default:
        return [aliveParticipants[0] || null].filter(Boolean);
    }
  }

  /**
   * 보스 데미지 계산
   * @param {Object} skill - 스킬 정보
   * @param {Object} target - 타겟 정보
   * @returns {number} 데미지
   */
  calculateBossDamage(skill, target) {
    let baseDamage = skill.damage || 0;

    // 레벨 보정
    const levelFactor = 1 + (target.level || 1) * 0.01;

    // 페이즈 보정
    const phase = this.raidBoss.getCurrentPhase();
    const phaseMultiplier = phase ? (phase.enrageMultiplier || 1) : 1;

    // 광폭화 보정
    const enrageMultiplier = this.raidBoss.isEnraged ? 1.5 : 1;

    return Math.floor(baseDamage * levelFactor * phaseMultiplier * enrageMultiplier);
  }

  /**
   * 보스 데미지 적용
   * @param {Object} raid - 레이드 정보
   * @param {Object} participant - 참여자 정보
   * @param {number} damage - 데미지
   */
  applyBossDamage(raid, participant, damage) {
    // 현재 HP 계산 (없으면 레벨 * 10)
    const maxHp = (participant.level || 1) * 100;
    participant.currentHp = (participant.currentHp || maxHp) - damage;

    if (participant.currentHp <= 0) {
      participant.currentHp = 0;
      participant.deaths = (participant.deaths || 0) + 1;
    }
  }

  /**
   * 전투 종료
   * @param {string} raidId - 레이드 ID
   * @param {boolean} victory - 승리 여부
   * @returns {Object} 전투 종료 결과
   */
  endCombat(raidId, victory) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return { error: 'raid_not_found' };

    const logEntry = {
      type: 'combat_end',
      turn: this.combatTurn,
      timestamp: Date.now(),
      victory,
      message: victory ? '레이드 전투 승리!' : '레이드 전투 패배...'
    };

    this.combatLog.push(logEntry);

    // 레이드 완료
    this.raidManager.completeRaid(raidId, victory);

    return {
      raidId,
      victory,
      totalTurns: this.combatTurn,
      combatLog: [logEntry],
      bossStatus: this.raidBoss ? this.raidBoss.getStatus() : null,
      participantResults: raid.participants.map(p => ({
        characterId: p.characterId,
        name: p.name,
        damage: p.damage || 0,
        deaths: p.deaths || 0
      }))
    };
  }

  /**
   * 전투 로그 조회
   * @param {string} raidId - 레이드 ID
   * @param {number} offset - 오프셋
   * @param {number} limit - 제한
   * @returns {Array<Object>} 전투 로그
   */
  getCombatLog(raidId, offset = 0, limit = 100) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return [];

    raid.combatLog = raid.combatLog || [];
    return raid.combatLog.slice(offset, offset + limit);
  }

  /**
   * 전투 상태 조회
   * @param {string} raidId - 레이드 ID
   * @returns {Object} 전투 상태
   */
  getCombatStatus(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return null;

    return {
      raidId,
      isActive: raid.status === 'in_progress',
      turn: this.combatTurn,
      bossStatus: this.raidBoss ? this.raidBoss.getStatus() : null,
      participants: raid.participants.map(p => ({
        characterId: p.characterId,
        name: p.name,
        damage: p.damage || 0,
        deaths: p.deaths || 0,
        isAlive: (p.currentHp || (p.level || 1) * 100) > 0
      }))
    };
  }
}

module.exports = RaidCombat;