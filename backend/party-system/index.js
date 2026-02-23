/**
 * Party System - 파티 시스템 통합 모듈
 * 파티 관리, 채팅, 경험치 공유, 보상 분배 통합
 */

import PartyManager from './party-manager.js';
import PartyChat from './party-chat.js';
import ExpShareModule from './exp-share.js';
import RewardDistribution from './reward-distribution.js';

/**
 * PartySystem 클래스
 */
class PartySystem {
  constructor(redisClient = null) {
    this.redis = redisClient;

    // 서브시스템 초기화
    this.partyManager = new PartyManager(redisClient);
    this.partyChat = new PartyChat(redisClient);
    this.expShareModule = new ExpShareModule(); // ExpShare는 Redis/PartyManager 불필요
    this.rewardDistribution = new RewardDistribution(redisClient, this.partyManager, this.expShareModule);
  }

  /**
   * 파티 시스템 초기화
   */
  initialize(io) {
    this.io = io;

    // Socket.io 핸들러 등록 (구현 필요)
    console.log('✅ Party System initialized');
  }

  /**
   * 파티 관리자 접근
   */
  get manager() {
    return this.partyManager;
  }

  /**
   * 파티 채팅 접근
   */
  get chat() {
    return this.partyChat;
  }

  /**
   * 경험치 공유 접근
   */
  get expShare() {
    return this.expShareModule;
  }

  /**
   * 보상 분배 접근
   */
  get rewards() {
    return this.rewardDistribution;
  }
}

// 개별 클래스도 함께 export
export const PartyManagerClass = PartyManager;
export const PartyChatClass = PartyChat;
export const ExpShareClass = ExpShareModule;
export const RewardDistributionClass = RewardDistribution;

export default PartySystem;