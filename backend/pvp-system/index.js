/**
 * PvP System - 플레이어 간 대전 시스템
 *
 * Module Index
 */

import { BattleManager, Battle, BattleStatus } from './battle-manager.js';
import { SkillIntegration, SkillEffectType, StatusEffect } from './skill-integration.js';
import { PvPRanking, BattleRecord, PlayerPvPStats, BattleResult } from './pvp-ranking.js';
import { BattleRewards, RewardResult, RewardConfig } from './battle-rewards.js';

/**
 * PvPSystem - 메인 시스템 클래스
 */
class PvPSystem {
  constructor() {
    this.battleManager = new BattleManager();
    this.skillIntegration = new SkillIntegration();
    this.pvPRanking = new PvPRanking();
    this.battleRewards = new BattleRewards();
  }

  /**
   * 전투 생성
   */
  createBattle(player1, player2) {
    const battle = this.battleManager.createBattle(player1, player2);

    // 쿨타임 초기화
    this.skillIntegration.initializeCooldowns(battle, player1.id);
    this.skillIntegration.initializeCooldowns(battle, player2.id);

    return battle;
  }

  /**
   * 전투 시작
   */
  startBattle(battleId) {
    return this.battleManager.startBattle(battleId);
  }

  /**
   * 공격 수행
   */
  executeAction(battleId, action) {
    const battle = this.battleManager.activeBattles.get(battleId);

    if (!battle) {
      throw new Error('Battle not found');
    }

    // 스킬 사용인 경우 SkillIntegration 처리
    if (action.type === 'skill') {
      this.skillIntegration.useSkill(battle, action.playerId, action.skillId);
    }

    // BattleManager에서 공격 수행
    const result = this.battleManager.executeAction(battleId, action);

    // 쿨타임 감소 (상대방)
    const opponentId = action.playerId === battle.player1Id ? battle.player2Id : battle.player1Id;

    if (opponentId) {
      this.skillIntegration.reduceCooldowns(battle, opponentId);
    }

    // 전투 완료 시
    if (result.status === 'completed') {
      return this._handleBattleCompletion(result);
    }

    return result;
  }

  /**
   * 전투 완료 처리
   */
  _handleBattleCompletion(battle) {
    // 승/패 기록
    const battleData = {
      id: battle.id,
      winner: battle.winner,
      loser: battle.winner === battle.player1Id ? battle.player2Id : battle.player1Id,
      player1Id: battle.player1Id,
      player2Id: battle.player2Id,
      players: battle.players,
      endedAt: battle.endedAt
    };

    // 랭킹 기록
    const rankingResult = this.pvPRanking.recordBattle(battleData);

    // 보상 지급
    const rewards = this.battleRewards.distributeRewards(battleData);

    return {
      battle,
      rankingResult,
      rewards
    };
  }

  /**
   * 전투 취소
   */
  cancelBattle(battleId) {
    return this.battleManager.cancelBattle(battleId);
  }

  /**
   * 플레이어 전투 가져오기
   */
  getPlayerBattle(playerId) {
    return this.battleManager.getPlayerBattle(playerId);
  }

  /**
   * 스킬 사용 가능 확인
   */
  canUseSkill(battleId, playerId, skillId) {
    const battle = this.battleManager.activeBattles.get(battleId);
    if (!battle) {
      return false;
    }

    return this.skillIntegration.canUseSkill(battle, playerId, skillId);
  }

  /**
   * 스킬 쿨타임 가져오기
   */
  getSkillCooldown(battleId, playerId, skillId) {
    const battle = this.battleManager.activeBattles.get(battleId);
    if (!battle) {
      return 0;
    }

    return this.skillIntegration.getSkillCooldown(battle, playerId, skillId);
  }

  /**
   * 모든 스킬 쿨타임 가져오기
   */
  getAllSkillCooldowns(battleId, playerId) {
    const battle = this.battleManager.activeBattles.get(battleId);
    if (!battle) {
      return {};
    }

    return this.skillIntegration.getAllSkillCooldowns(battle, playerId);
  }

  /**
   * 스킬 연계 검증
   */
  checkCombo(battleId, playerId, skillId) {
    const battle = this.battleManager.activeBattles.get(battleId);
    if (!battle) {
      return { valid: false, reason: 'Battle not found' };
    }

    return this.skillIntegration.checkCombo(battle, playerId, skillId);
  }

  /**
   * 랭킹 정보 가져오기
   */
  getRanking(limit = 100) {
    return this.pvPRanking.getRanking(limit);
  }

  /**
   * 플레이어 랭킹 가져오기
   */
  getPlayerRanking(playerId) {
    return this.pvPRanking.getPlayerRanking(playerId);
  }

  /**
   * 플레이어 최근 전투 가져오기
   */
  getPlayerRecentBattles(playerId, limit = 10) {
    return this.pvPRanking.getPlayerRecentBattles(playerId, limit);
  }

  /**
   * 플레이어 보상 기록 가져오기
   */
  getPlayerRewardHistory(playerId, limit = 10) {
    return this.battleRewards.getPlayerRewardHistory(playerId, limit);
  }

  /**
   * 플레이어 총 수익 가져오기
   */
  getPlayerTotalRewards(playerId, days = 7) {
    return this.battleRewards.getPlayerTotalRewards(playerId, days);
  }

  /**
   * 수익 리더보드
   */
  getRewardLeaderboard(days = 7, limit = 50) {
    return this.battleRewards.getRewardLeaderboard(days, limit);
  }

  /**
   * 모든 활성 전투 가져오기
   */
  getAllActiveBattles() {
    return this.battleManager.getAllActiveBattles();
  }

  /**
   * 시스템 통계
   */
  getStatistics() {
    return {
      battleManager: this.battleManager.getStatistics(),
      skillIntegration: this.skillIntegration.getStatistics(),
      pvPRanking: this.pvPRanking.getStatistics(),
      battleRewards: this.battleRewards.getStatistics()
    };
  }
}

// 단일 인스턴스 생성 (Singleton 패턴)
const pvpSystemInstance = new PvPSystem();

export {
  PvPSystem,
  pvpSystemInstance,

  // Battle Manager
  BattleManager,
  Battle,
  BattleStatus,

  // Skill Integration
  SkillIntegration,
  SkillEffectType,
  StatusEffect,

  // PvP Ranking
  PvPRanking,
  BattleRecord,
  PlayerPvPStats,
  BattleResult,

  // Battle Rewards
  BattleRewards,
  RewardResult,
  RewardConfig
};

// 기본 내보내기: 단일 인스턴스
export default pvpSystemInstance;