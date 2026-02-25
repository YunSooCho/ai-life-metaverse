/**
 * ExpShare - 경험치 공유 시스템
 * 
 * 기능:
 * - 파티원 간 경험치 공유
 * - 레벨 차이에 따른 보정
 * - 파티 보너스 (파티원 1인당 +10%, 최대 +50%)
 */

import EventEmitter from 'events';

export class ExpShare extends EventEmitter {
  constructor() {
    super();
    this.baseExpShareRatio = 0.6; // 기본 공유 비율 (60%)
  }

  /**
   * 경험치 공유 계산
   * @param {number} baseExp - 기본 경험치
   * @param {number} partyMemberCount - 파티원 수
   * @param {number} killerLevel - 킬러 레벨
   * @param {number} monsterLevel - 몬스터 레벨
   * @returns {Object} 공유 경험치 정보
   */
  calculateSharedExp(baseExp, partyMemberCount, killerLevel, monsterLevel) {
    // 파티 보너스 계산 (파티원 1인당 +10%, 최대 +50%)
    const partyBonus = Math.min((partyMemberCount - 1) * 0.1, 0.5);
    const partyBonusRate = 1 + partyBonus;

    // 레벨 차이 보정
    const levelDiff = Math.abs(killerLevel - monsterLevel);
    let levelPenalty = 1.0;

    // 레벨 차이가 10 이상이면 경험치 감소
    if (levelDiff > 10) {
      levelPenalty = Math.max(0.1, 1 - (levelDiff - 10) * 0.05);
    }

    // 기본 공유 경험치 계산
    const sharedExp = baseExp * this.baseExpShareRatio * partyBonusRate * levelPenalty;

    return {
      baseExp,
      sharedExp: Math.floor(sharedExp),
      partyBonusRate,
      levelPenalty,
      partyMemberCount
    };
  }

  /**
   * 파티원별 경험치 분배
   * @param {Object} sharedExpInfo - 공유 경험치 정보
   * @param {Array} members - 파티원 목록 [{id, level, isKiller}]
   * @returns {Object} 분배된 경험치 정보
   */
  distributeExpToMembers(sharedExpInfo, members) {
    const { sharedExp } = sharedExpInfo;
    const distributions = [];
    const killer = members.find(m => m.isKiller);

    // 킬러에게 기본 경험치의 40% (개인 몫)
    if (killer) {
      const killerExp = Math.floor(sharedExpInfo.baseExp * 0.4 * sharedExpInfo.levelPenalty);
      distributions.push({
        playerId: killer.id,
        level: killer.level,
        exp: killerExp,
        isKiller: true
      });
    }

    // 나머지 파티원에게 공유 경험치 분배
    const otherMembers = members.filter(m => !m.isKiller);
    const sharedPerMember = Math.floor(sharedExp / otherMembers.length);

    otherMembers.forEach(member => {
      distributions.push({
        playerId: member.id,
        level: member.level,
        exp: sharedPerMember,
        isKiller: false
      });
    });

    this.emit('exp:distributed', { sharedExpInfo, distributions });

    return {
      success: true,
      baseExp: sharedExpInfo.baseExp,
      sharedExp,
      distributions
    };
  }

  /**
   * 레벨에 따른 경험치 보정 계산
   * @param {number} characterLevel - 캐릭터 레벨
   * @param {number} monsterLevel - 몬스터 레벨
   * @returns {number} 보정 계수 (0.0 ~ 1.0)
   */
  calculateLevelPenalty(characterLevel, monsterLevel) {
    const diff = Math.abs(characterLevel - monsterLevel);

    // 레벨 차이가 크면 경험치 감소
    if (diff > 20) {
      return 0.0; // 너무 높은 레벨 차이 - 경험치 없음
    } else if (diff > 10) {
      return Math.max(0.1, 1 - (diff - 10) * 0.05); // 10~20 차이 - 점진적 감소
    }

    return 1.0; // 10 이하 차이 - 100%
  }

  /**
   * 파티 보너스 계산
   * @param {number} partyMemberCount - 파티원 수
   * @returns {Object} 보너스 정보
   */
  calculatePartyBonus(partyMemberCount) {
    // 파티원 1인당 +10%
    const bonusRate = Math.min((partyMemberCount - 1) * 0.1, 0.5);

    return {
      memberCount: partyMemberCount,
      bonusRate,
      bonusMultiplier: 1 + bonusRate,
      maxBonus: bonusRate === 0.5 // 최대 보너스 도달 여부
    };
  }

  /**
   * 기본 공유 비율 설정
   * @param {number} ratio - 공유 비율 (0.0 ~ 1.0)
   */
  setBaseExpShareRatio(ratio) {
    this.baseExpShareRatio = Math.max(0.1, Math.min(1.0, ratio));
  }

  /**
   * 전체 경험치 계산 (통합 함수)
   * @param {Object} params - 계산 파라미터
   * @returns {Object} 전체 계산 결과
   */
  calculateTotalExp(params) {
    const {
      baseExp,
      partyMembers,
      killerId,
      monsterLevel
    } = params;

    const killer = partyMembers.find(m => m.id === killerId);
    if (!killer) {
      return {
        success: false,
        error: 'KILLER_NOT_FOUND',
        message: '킬러를 찾을 수 없습니다.'
      };
    }

    // 공유 경험치 계산
    const sharedExpInfo = this.calculateSharedExp(
      baseExp,
      partyMembers.length,
      killer.level,
      monsterLevel
    );

    // 분배 계산
    const distributionResult = this.distributeExpToMembers(
      sharedExpInfo,
      partyMembers.map(m => ({
        ...m,
        isKiller: m.id === killerId
      }))
    );

    return distributionResult;
  }

  /**
   * 효율성 계산 (개인 사냥 vs 파티 사냥 비교)
   * @param {Object} params - 계산 파라미터
   * @returns {Object} 효율성 비교 결과
   */
  calculateEfficiency(params) {
    const {
      baseExp,
      partyMemberCount,
      killRate = { solo: 1.0, party: 0.8 } // 개인/파티 초당 킬 비율
    } = params;

    // 파티 보너스
    const partyBonus = Math.min((partyMemberCount - 1) * 0.1, 0.5);

    // 기본 공유 경험치 (파티원당)
    const sharedExpPerMember = Math.floor(baseExp * 0.6 * (1 + partyBonus));

    // 초당 경험치 비율
    const soloExpPerSec = baseExp * killRate.solo;
    const partyExpPerSec = sharedExpPerMember * killRate.party;

    // 효율성 (파티 vs 솔로)
    const efficiency = partyExpPerSec / soloExpPerSec;

    return {
      soloPerKill: baseExp,
      partyPerKill: sharedExpPerMember,
      soloPerSec: soloExpPerSec,
      partyPerSec: partyExpPerSec,
      efficiency, // > 1이면 파티가 유리
      isPartyWorthwhile: efficiency > 1
    };
  }
}