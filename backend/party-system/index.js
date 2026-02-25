/**
 * Party System - 파티 시스템 통합
 * 
 * 통합하는 모듈:
 * - PartyManager: 파티 관리
 * - PartyChat: 파티 채팅
 * - ExpShare: 경험치 공유
 * - RewardDistribution: 보상 분배
 * - PartyQuests: 파티 퀘스트
 */

import { PartyManager } from './PartyManager.js';
import { PartyChat } from './PartyChat.js';
import { ExpShare } from './ExpShare.js';
import { RewardDistribution } from './RewardDistribution.js';
import { PartyQuests } from './PartyQuests.js';

class PartySystem {
  constructor() {
    this.partyManager = new PartyManager();
    this.partyChat = new PartyChat();
    this.expShare = new ExpShare();
    this.rewardDistribution = new RewardDistribution();
    this.partyQuests = new PartyQuests();

    // 이벤트 연결
    this.setupEventBindings();
  }

  /**
   * 이벤트 연결 설정
   */
  setupEventBindings() {
    // PartyManager 이벤트 → PartyChat으로 알림
    this.partyManager.on('party:created', ({ partyId, leaderId }) => {
      this.partyChat.initChat(partyId);
      this.partyChat.sendSystemMessage(partyId, 'party_created', { leaderId });
    });

    this.partyManager.on('party:invited', ({ partyId, leaderId, playerId }) => {
      // 초대 시스템 메시지
    });

    this.partyManager.on('party:joined', ({ partyId, playerId, party }) => {
      const memberName = playerId; // 실제로는 플레이어 이름 조회 필요
      this.partyChat.sendSystemMessage(partyId, 'member_joined', { playerId, memberName });
    });

    this.partyManager.on('party:left', ({ partyId, playerId }) => {
      const memberName = playerId;
      this.partyChat.sendSystemMessage(partyId, 'member_left', { playerId, memberName });
    });

    this.partyManager.on('party:kicked', ({ partyId, leaderId, targetId }) => {
      this.partyChat.sendSystemMessage(partyId, 'member_kicked', { targetId });
    });

    this.partyManager.on('party:leaderChanged', ({ partyId, oldLeader, newLeader }) => {
      this.partyChat.sendSystemMessage(partyId, 'leader_changed', { oldLeader, newLeader });
    });

    this.partyManager.on('party:disbanded', ({ partyId, leaderId }) => {
      this.partyChat.sendSystemMessage(partyId, 'party_disbanded', { leaderId });
      this.partyChat.cleanupChat(partyId);
      this.partyQuests.cleanupPartyQuests(partyId);
      this.rewardDistribution.cleanupPartyQuests(partyId);
    });

    // PartyQuests 이벤트 → RewardDistribution으로 연결
    this.partyQuests.on('party:questCompleted', ({ questId, partyId, distributionResult }) => {
      // 퀘스트 완료 시 보상이 이미 분배됨
    });
  }

  // ========== PartyManager 위임 ==========
  createParty(leaderId) {
    return this.partyManager.createParty(leaderId);
  }

  inviteToParty(partyId, leaderId, playerId) {
    return this.partyManager.inviteToParty(partyId, leaderId, playerId);
  }

  acceptInvite(partyId, playerId) {
    const result = this.partyManager.acceptInvite(partyId, playerId);
    
    if (result.success) {
      // 자동 퀘스트 생성 옵션
      // this.generateRandomQuestForParty(partyId);
    }
    
    return result;
  }

  declineInvite(partyId, playerId) {
    return this.partyManager.declineInvite(partyId, playerId);
  }

  leaveParty(playerId) {
    const result = this.partyManager.leaveParty(playerId);
    
    if (result.success) {
      // 필요한 경우 추가 정리 로직
    }
    
    return result;
  }

  kickPlayer(partyId, leaderId, targetId) {
    return this.partyManager.kickPlayer(partyId, leaderId, targetId);
  }

  transferLeadership(partyId, currentLeaderId, newLeaderId) {
    return this.partyManager.transferLeadership(partyId, currentLeaderId, newLeaderId);
  }

  disbandParty(partyId, leaderId) {
    return this.partyManager.disbandParty(partyId, leaderId);
  }

  getPartyInfo(partyId) {
    return this.partyManager.getPartyInfo(partyId);
  }

  getPlayerParty(playerId) {
    return this.partyManager.getPlayerParty(playerId);
  }

  getAllParties() {
    return this.partyManager.getAllParties();
  }

  handlePlayerDisconnect(playerId) {
    return this.partyManager.handlePlayerDisconnect(playerId);
  }

  // ========== PartyChat 위임 ==========
  sendMessage(partyId, playerId, playerName, message) {
    return this.partyChat.sendMessage(partyId, playerId, playerName, message);
  }

  getChatHistory(partyId, limit) {
    return this.partyChat.getChatHistory(partyId, limit);
  }

  // ========== ExpShare 위임 ==========
  calculateSharedExp(baseExp, partyMemberCount, killerLevel, monsterLevel) {
    return this.expShare.calculateSharedExp(baseExp, partyMemberCount, killerLevel, monsterLevel);
  }

  distributeExpToMembers(sharedExpInfo, members) {
    return this.expShare.distributeExpToMembers(sharedExpInfo, members);
  }

  calculateLevelPenalty(characterLevel, monsterLevel) {
    return this.expShare.calculateLevelPenalty(characterLevel, monsterLevel);
  }

  calculatePartyBonus(partyMemberCount) {
    return this.expShare.calculatePartyBonus(partyMemberCount);
  }

  calculateTotalExp(params) {
    return this.expShare.calculateTotalExp(params);
  }

  calculateEfficiency(params) {
    return this.expShare.calculateEfficiency(params);
  }

  // ========== RewardDistribution 위임 ==========
  distributeQuestReward(questId, partyMembers, distributionType) {
    return this.rewardDistribution.distributeQuestReward(questId, partyMembers, distributionType);
  }

  generatePartyQuest(partyId, partyLevel) {
    return this.rewardDistribution.generatePartyQuest(partyId, partyLevel);
  }

  completePartyQuest(questId, partyMembers) {
    return this.rewardDistribution.completePartyQuest(questId, partyMembers);
  }

  createPartyReward(partyId, baseReward, partyBonus) {
    return this.rewardDistribution.createPartyReward(partyId, baseReward, partyBonus);
  }

  getPartyQuests(partyId) {
    return this.rewardDistribution.getPartyQuests(partyId);
  }

  registerQuestReward(questId, reward) {
    return this.rewardDistribution.registerQuestReward(questId, reward);
  }

  cleanupExpiredQuests() {
    return this.rewardDistribution.cleanupExpiredQuests();
  }

  // ========== PartyQuests 위임 ==========
  startQuest(partyId, questId) {
    return this.partyQuests.startQuest(partyId, questId);
  }

  updateQuestProgress(partyId, activeQuestId, playerId, type, amount) {
    return this.partyQuests.updateQuestProgress(partyId, activeQuestId, playerId, type, amount);
  }

  getActiveQuests(partyId) {
    return this.partyQuests.getActiveQuests(partyId);
  }

  registerQuestDefinition(questId, definition) {
    return this.partyQuests.registerQuestDefinition(questId, definition);
  }

  createBossQuest(partyLevel) {
    return this.partyQuests.createBossQuest(partyLevel);
  }

  createCooperationQuest(partyLevel) {
    return this.partyQuests.createCooperationQuest(partyLevel);
  }

  generateRandomQuest(partyLevel) {
    return this.partyQuests.generateRandomQuest(partyLevel);
  }

  abortQuest(partyId, activeQuestId) {
    return this.partyQuests.abortQuest(partyId, activeQuestId);
  }

  // ========== 통합 기능 ==========

  /**
   * 파티 생성 + 자동 퀘스트 생성
   * @param {string} leaderId - 파티장 아이디
   * @param {number} partyLevel - 파티 레벨
   * @returns {Object} 결과
   */
  createPartyWithQuest(leaderId, partyLevel = 1) {
    const partyResult = this.createParty(leaderId);

    if (!partyResult.success) {
      return partyResult;
    }

    // 랜덤 퀘스트 생성
    const quest = this.generateRandomQuest(partyLevel);
    this.partyQuests.registerQuestDefinition(quest.id, quest);
    
    // 퀘스트 시작
    const questResult = this.startQuest(partyResult.partyId, quest.id);

    return {
      success: true,
      party: partyResult.party,
      quest: questResult.activeQuest
    };
  }

  /**
   * 몬스터 처치 + 경험치 분배
   * @param {Object} params - 파라미터
   * @returns {Object} 분배 결과
   */
  processMonsterKill(params) {
    const { killerId, baseExp, monsterLevel, partyId } = params;

    const partyResult = this.getPlayerParty(killerId);

    if (!partyResult.success) {
      // 파티가 없으면 개인 경험치만
      return {
        success: true,
        distributions: [{
          playerId: killerId,
          exp: baseExp,
          isKiller: true
        }]
      };
    }

    const party = partyResult.party;
    
    // 파티원 정보 수집 (실제로는 CharacterManager에서 조회 필요)
    const members = party.members.map(id => ({
      id,
      level: 50, // 실제 레벨 조회 필요
      isKiller: id === killerId
    }));

    // 경험치 공유 계산
    const sharedExpInfo = this.calculateSharedExp(
      baseExp,
      members.length,
      members.find(m => m.isKiller).level,
      monsterLevel
    );

    // 분배
    const distributionResult = this.distributeExpToMembers(sharedExpInfo, members);

    // 파티 퀘스트 진행 업데이트 (보스인 경우)
    if (params.isBoss) {
      const activeQuests = this.getActiveQuests(partyId);
      if (activeQuests.success) {
        activeQuests.quests.forEach(quest => {
          if (quest.type === 'boss' && !quest.completed) {
            this.updateQuestProgress(party.id, quest.id, killerId, 'kill', 1);
          }
        });
      }
    }

    return distributionResult;
  }

  /**
   * 시스템 통계 조회
   * @returns {Object} 통계 정보
   */
  getSystemStats() {
    return {
      parties: this.partyManager.getAllParties(),
      chatStats: this.partyChat.getStats(),
      questStats: this.partyQuests.getStats()
    };
  }
}

// 단일 인스턴스 생성
const partySystemInstance = new PartySystem();

export default partySystemInstance;
export { PartySystem };