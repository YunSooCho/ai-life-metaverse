/**
 * ExpShare - 경험치 공유 시스템
 * - 파티원 간 경험치 공유
 * - 레벨 차이에 따른 보정
 * - 파티 보너스 (파티원 1인당 +10%, 최대 +50%)
 */

export default class ExpShare {
  constructor() {
    this.baseShareRate = 0.6; // 기본 공유율 60%
    this.partyBonusRate = 0.1; // 파티원 1인당 +10%
    this.maxBonus = 0.5; // 최대 보너스 +50%
    this.levelDifferencePenalty = 0.05; // 레벨 차이 1당 -5%
  }

  /**
   * 경험치 분배 계산
   * @param {Array} partyMembers - 파티원 배열 [{id, level}]
   * @param {number} baseExp - 기초 경험치
   * @param {string} rewardedPlayerId - 보상받는 플레이어 ID (킬러)
   * @returns {Object} 분배된 경험치 {playerId: {...}}
   */
  calculateExpDistribution(partyMembers, baseExp, rewardedPlayerId = null) {
    const distribution = {};

    // 파티 보너스 계산
    const partySize = partyMembers.length;
    const partyBonus = Math.min(
      partySize * this.partyBonusRate,
      this.maxBonus
    );

    // 보너스가 적용된 총 경험치
    const totalExp = baseExp * (1 + partyBonus);

    // 각 파티원에게 분배
    partyMembers.forEach(member => {
      const levelPenalty = this._calculateLevelPenalty(member.level, partyMembers);
      const adjustedExp = this._applyPenalty(totalExp, levelPenalty);

      distribution[member.id] = {
        totalExp: adjustedExp,
        penalty: levelPenalty,
        bonus: partyBonus
      };
    });

    return distribution;
  }

  /**
   * 퀘스트 경험치 분배 계산
   * @param {Array} partyMembers - 파티원 배열 [{id, level}]
   * @param {number} baseQuestExp - 기초 퀘스트 경험치
   * @returns {Object} 분배된 경험치 {playerId: {...}}
   */
  calculateQuestExp(partyMembers, baseQuestExp) {
    return this.calculateExpDistribution(partyMembers, baseQuestExp, null);
  }

  /**
   * 몬스터 처치 경험치 분배
   * @param {Array} partyMembers - 파티원 배열 [{id, level}]
   * @param {number} baseExp - 기초 경험치
   * @param {string} killerId - 몬스터를 처치한 플레이어 ID
   * @returns {Object} 분배된 경험치 {playerId: {...}}
   */
  calculateKillExp(partyMembers, baseExp, killerId) {
    const distribution = this.calculateExpDistribution(partyMembers, baseExp, killerId);

    // 킬러에게 추가 보너스 (+20%)
    if (distribution[killerId]) {
      distribution[killerId].killBonus = 0.2;
      distribution[killerId].totalExp *= 1.2;
    }

    return distribution;
  }

  /**
   * 협동 보너스 계산 (파티원이 근처에 있을 때)
   * @param {number} nearbyMembers - 근처에 있는 파티원 수
   * @param {number} totalMembers - 총 파티원 수
   * @returns {number} 보너스 비율 (0~1)
   */
  calculateCoopBonus(nearbyMembers, totalMembers) {
    if (nearbyMembers === 0 || totalMembers === 0) {
      return 0;
    }

    const ratio = nearbyMembers / totalMembers;
    return ratio * 0.3; // 최대 +30%
  }

  /**
   * 레벨 차이에 따른 페널티 계산
   * @private
   * @param {number} playerLevel - 플레이어 레벨
   * @param {Array} partyMembers - 파티원 배열
   * @returns {number} 페널티 비율 (0~1)
   */
  _calculateLevelPenalty(playerLevel, partyMembers) {
    if (partyMembers.length <= 1) {
      return 1; // 페널티 없음
    }

    // 파티원들의 평균 레벨 계산
    const totalLevel = partyMembers.reduce((sum, m) => sum + m.level, 0);
    const avgLevel = totalLevel / partyMembers.length;

    // 레벨 차이 계산
    const levelDiff = Math.abs(playerLevel - avgLevel);
    const penalty = 1 - (levelDiff * this.levelDifferencePenalty);

    // 최소 페널티 10%
    return Math.max(0.1, penalty);
  }

  /**
   * 페널티 적용
   * @private
   * @param {number} exp - 경험치
   * @param {number} penalty - 페널티 비율 (0~1)
   * @returns {number} 페널티가 적용된 경험치
   */
  _applyPenalty(exp, penalty) {
    return Math.floor(exp * penalty);
  }

  /**
   * 파티 보너스 정보 반환
   * @param {number} partySize - 파티원 수
   * @returns {Object} 보너스 정보
   */
  getPartyBonusInfo(partySize) {
    const rawBonus = partySize * this.partyBonusRate;
    const actualBonus = Math.min(rawBonus, this.maxBonus);

    return {
      partySize,
      rawBonus,
      actualBonus,
      capped: rawBonus > this.maxBonus
    };
  }
}