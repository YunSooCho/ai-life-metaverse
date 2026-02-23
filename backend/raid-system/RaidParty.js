/**
 * RaidParty - 레이드 파티 매칭 및 관리
 * 최대 10인 파티 매칭, 역할 배정, 파티 버프
 */

class RaidParty {
  constructor(raidManager) {
    this.raidManager = raidManager;
    this.MAX_PARTY_SIZE = 10;
    this.OPTIMAL_ROLES = {
      tank: 1,    // 탱커
      healer: 2,  // 힐러
      dps: 6,     // 딜러
      support: 1  // 서포터
    };
  }

  /**
   * 파티 역할 배정
   * @param {Array} participants - 참여자 목록
   * @returns {Object} 역할 배정 결과
   */
  assignRoles(participants) {
    const roles = {
      tank: [],
      healer: [],
      dps: [],
      support: []
    };

    // 캐릭터 클래스/역할 기반 배정
    participants.forEach(participant => {
      const assignedRole = this.determineRole(participant);
      roles[assignedRole].push(participant);
    });

    return {
      roles,
      isBalanced: this.isPartyBalanced(roles),
      missingRoles: this.getMissingRoles(roles)
    };
  }

  /**
   * 캐릭터 역할 결정
   * @param {Object} participant - 참여자 정보
   * @returns {string} 역할
   */
  determineRole(participant) {
    // 우선순위: 명시적 역할 > 클래스 > 기본값
    if (participant.role) {
      return participant.role;
    }

    const classMapping = {
      warrior: 'tank',
      knight: 'tank',
      paladin: 'tank',
      priest: 'healer',
      cleric: 'healer',
      mage: 'dps',
      archer: 'dps',
      rogue: 'dps',
      bard: 'support',
      summoner: 'support'
    };

    return classMapping[participant.class] || 'dps';
  }

  /**
   * 파티 밸런스 확인
   * @param {Object} roles - 역할 배정
   * @returns {boolean} 밸런스 확인
   */
  isPartyBalanced(roles) {
    return (
      roles.tank.length >= this.OPTIMAL_ROLES.tank &&
      roles.healer.length >= this.OPTIMAL_ROLES.healer &&
      roles.dps.length >= this.OPTIMAL_ROLES.dps &&
      roles.support.length >= this.OPTIMAL_ROLES.support
    );
  }

  /**
   * 부족한 역할 조회
   * @param {Object} roles - 역할 배정
   * @returns {Array<string>} 부족한 역할
   */
  getMissingRoles(roles) {
    const missing = [];

    if (roles.tank.length < this.OPTIMAL_ROLES.tank) {
      missing.push(`tank (${this.OPTIMAL_ROLES.tank - roles.tank.length}명 부족)`);
    }
    if (roles.healer.length < this.OPTIMAL_ROLES.healer) {
      missing.push(`healer (${this.OPTIMAL_ROLES.healer - roles.healer.length}명 부족)`);
    }
    if (roles.dps.length < this.OPTIMAL_ROLES.dps) {
      missing.push(`dps (${this.OPTIMAL_ROLES.dps - roles.dps.length}명 부족)`);
    }
    if (roles.support.length < this.OPTIMAL_ROLES.support) {
      missing.push(`support (${this.OPTIMAL_ROLES.support - roles.support.length}명 부족)`);
    }

    return missing;
  }

  /**
   * 파티 버프 적용
   * @param {string} raidId - 레이드 ID
   * @returns {Object} 버프 적용 결과
   */
  applyPartyBuffs(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return null;

    const roles = this.assignRoles(raid.participants);
    const buffs = this.calculateBuffs(roles);

    return {
      raidId,
      buffs,
      participantsWithBuffs: raid.participants.map(p => ({
        ...p,
        appliedBuffs: buffs[p.characterId] || {}
      }))
    };
  }

  /**
   * 파티 버프 계산
   * @param {Object} roleAssignment - 역할 배정
   * @returns {Object} 버프 정보
   */
  calculateBuffs(roleAssignment) {
    const buffs = {};

    // 각 역할의 버프 계산
    const participantBuffs = (participants, buffType) => {
      const bonus = participants.length > 0 ? 0.1 * participants.length : 0;
      return {
        type: buffType,
        value: Math.min(bonus, 0.5), // 최대 50% 버프
        source: participants.map(p => p.characterId)
      };
    };

    // 탱커 버프: 방어력 증가
    roleAssignment.roles.tank.forEach(tank => {
      buffs[tank.characterId] = buffs[tank.characterId] || {};
      buffs[tank.characterId].defense = 0.2; // 탱커는 20% 방어력 증가
    });

    // 힐러 버프: 파티 전체 힐 증가
    const healerBuff = participantBuffs(roleAssignment.roles.healer, 'healing');
    [...roleAssignment.roles.tank, ...roleAssignment.roles.dps, ...roleAssignment.roles.support].forEach(p => {
      buffs[p.characterId] = buffs[p.characterId] || {};
      buffs[p.characterId].healing = healerBuff.value;
    });

    // 딜러 버프: 파티 전체 공격력 증가
    const dpsBuff = participantBuffs(roleAssignment.roles.dps, 'damage');
    [...roleAssignment.roles.tank, ...roleAssignment.roles.healer, ...roleAssignment.roles.support].forEach(p => {
      buffs[p.characterId] = buffs[p.characterId] || {};
      buffs[p.characterId].damage = dpsBuff.value;
    });

    // 서포터 버프: 파티 전체 경험치 증가
    const supportBuff = participantBuffs(roleAssignment.roles.support, 'exp');
    [...roleAssignment.roles.tank, ...roleAssignment.roles.healer, ...roleAssignment.roles.dps, ...roleAssignment.roles.support].forEach(p => {
      buffs[p.characterId] = buffs[p.characterId] || {};
      buffs[p.characterId].exp = supportBuff.value;
    });

    return buffs;
  }

  /**
   * 파티 DPS 계산
   * @param {string} raidId - 레이드 ID
   * @returns {Object} DPS 계산 결과
   */
  calculatePartyDPS(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return null;

    const totalDamage = raid.participants.reduce((sum, p) => sum + (p.damage || 0), 0);
    const duration = raid.endTime ? raid.endTime - raid.startTime : 0;

    const dps = duration > 0 ? totalDamage / (duration / 1000) : 0;

    // 개별 DPS
    const individualDPS = raid.participants.map(p => ({
      characterId: p.characterId,
      name: p.name,
      damage: p.damage || 0,
      dps: duration > 0 ? (p.damage || 0) / (duration / 1000) : 0,
      damagePercent: totalDamage > 0 ? ((p.damage || 0) / totalDamage * 100).toFixed(2) : 0
    })).sort((a, b) => b.dps - a.dps);

    return {
      raidId,
      totalDamage,
      duration: duration / 1000, // 초 단위
      dps,
      participantCount: raid.participants.length,
      individualDPS
    };
  }

  /**
   * 파티 통계 조회
   * @param {string} raidId - 레이드 ID
   * @returns {Object} 파티 통계
   */
  getPartyStats(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return null;

    const roles = this.assignRoles(raid.participants);

    return {
      raidId,
      participantCount: raid.participants.length,
      maxParticipants: raid.maxParticipants,
      roles: {
        tank: roles.tank.length,
        healer: roles.healer.length,
        dps: roles.dps.length,
        support: roles.support.length
      },
      isBalanced: roles.isBalanced,
      missingRoles: roles.missingRoles
    };
  }

  /**
   * 파티 유효성 확인 (레이드 시작 전)
   * @param {string} raidId - 레이드 ID
   * @returns {Object} 유효성 확인 결과
   */
  validateParty(raidId) {
    const raid = this.raidManager.getRaid(raidId);
    if (!raid) return { valid: false, reason: 'raid_not_found' };

    if (raid.participants.length < 5) {
      return { valid: false, reason: 'minimum_participants', required: 5 };
    }

    const roles = this.assignRoles(raid.participants);

    if (!roles.isBalanced) {
      return { valid: false, reason: 'unbalanced_party', missing: roles.missingRoles };
    }

    return { valid: true };
  }
}

module.exports = RaidParty;