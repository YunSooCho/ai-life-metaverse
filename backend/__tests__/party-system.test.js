/**
 * Party System Tests
 */

import { describe, test, expect, beforeEach, jest } from 'vitest';
import PartySystem from '../party-system/index.js';
import PartyManager from '../party-system/party-manager.js';
import PartyChat from '../party-system/party-chat.js';
import ExpShare from '../party-system/exp-share.js';
import RewardDistribution from '../party-system/reward-distribution.js';

// Mock Redis
class MockRedis {
  constructor() {
    this.data = new Map();
    this.lists = new Map();
  }

  async setEx(key, seconds, value) {
    this.data.set(key, value);
    return 'OK';
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async del(key) {
    this.data.delete(key);
    this.lists.delete(key);
    return 1;
  }

  async rPush(key, ...values) {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    const list = this.lists.get(key);
    list.push(...values);
    return list.length;
  }

  async lRange(key, start, stop) {
    const list = this.lists.get(key) || [];
    if (stop === -1) {
      return list.slice(start);
    }
    return list.slice(start, stop + 1);
  }

  async lLen(key) {
    const list = this.lists.get(key) || [];
    return list.length;
  }

  async lTrim(key, start, stop) {
    if (!this.lists.has(key)) return;
    const list = this.lists.get(key);
    if (stop === -1) {
      this.lists.set(key, list.slice(start));
    } else {
      this.lists.set(key, list.slice(start, stop + 1));
    }
  }

  async expire(key, seconds) {
    return 1;
  }

  async scan(cursor, match, count) {
    const keys = Array.from(this.data.keys()).filter(k => k.includes(match.split('*')[1] || ''));
    return ['0', keys];
  }
}

// PartyManager Tests
describe('PartyManager', () => {
  let redis;
  let partyManager;

  beforeEach(() => {
    redis = new MockRedis();
    partyManager = new PartyManager(redis);
  });

  test('createParty - 새로운 파티 생성', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    expect(party).toBeDefined();
    expect(party.leaderId).toBe('player1');
    expect(party.leaderName).toBe('김플레이어');
    expect(party.members).toContain('player1');
    expect(party.memberNames).toContain('김플레이어');
    expect(party.maxMembers).toBe(5);
  });

  test('inviteMember - 파티에 멤버 초대', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    const result = await partyManager.inviteMember(party.partyId, 'player2', '이플레이어');

    expect(result.success).toBe(true);
    expect(result.party.members).toContain('player2');
    expect(result.party.memberNames).toContain('이플레이어');
  });

  test('inviteMember - 파티가 꽉 찬 경우', async () => {
    let party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    // 4명 추가 (총 5명)
    for (let i = 2; i <= 5; i++) {
      const result = await partyManager.inviteMember(party.partyId, `player${i}`, `플레이어${i}`);
      party = result.party;
    }

    const result = await partyManager.inviteMember(party.partyId, 'player6', '플레이어6');

    expect(result.success).toBe(false);
    expect(result.message).toBe('파티가 꽉 찼습니다');
  });

  test('inviteMember - 이미 파티에 있는 멤버', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    const result = await partyManager.inviteMember(party.partyId, 'player1', '김플레이어');

    expect(result.success).toBe(false);
    expect(result.message).toBe('이미 파티에 있습니다');
  });

  test('leaveParty - 멤버 탈퇴', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    await partyManager.inviteMember(party.partyId, 'player2', '이플레이어');

    const result = await partyManager.leaveParty(party.partyId, 'player2');

    expect(result.success).toBe(true);
    expect(result.party.members).not.toContain('player2');
  });

  test('leaveParty - 파티장 탈퇴 시 파티 해체', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    const result = await partyManager.leaveParty(party.partyId, 'player1');

    expect(result.success).toBe(true);
    expect(result.disbanded).toBe(true);
    expect(result.message).toContain('파티가 해체');
  });

  test('kickMember - 파티 멤버 추방', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    await partyManager.inviteMember(party.partyId, 'player2', '이플레이어');

    const result = await partyManager.kickMember(party.partyId, 'player1', 'player2');

    expect(result.success).toBe(true);
    expect(result.party.members).not.toContain('player2');
  });

  test('kickMember - 파티장만 추방 가능', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    await partyManager.inviteMember(party.partyId, 'player2', '이플레이어');

    const result = await partyManager.kickMember(party.partyId, 'player2', 'player1');

    expect(result.success).toBe(false);
    expect(result.message).toBe('파티장만 추방할 수 있습니다');
  });

  test('transferLeadership - 파티장 위임', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    await partyManager.inviteMember(party.partyId, 'player2', '이플레이어');

    const result = await partyManager.transferLeadership(party.partyId, 'player1', 'player2');

    expect(result.success).toBe(true);
    expect(result.party.leaderId).toBe('player2');
    expect(result.party.leaderName).toBe('이플레이어');
  });

  test('disbandParty - 파티 해체', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    const result = await partyManager.disbandParty(party.partyId);

    expect(result.success).toBe(true);
    expect(result.message).toBe('파티가 해체되었습니다');

    const retrievedParty = await partyManager.getParty(party.partyId);
    expect(retrievedParty).toBeNull();
  });

  test('getParty - 파티 정보 조회', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    const retrievedParty = await partyManager.getParty(party.partyId);

    expect(retrievedParty).toBeDefined();
    expect(retrievedParty.partyId).toBe(party.partyId);
    expect(retrievedParty.leaderId).toBe('player1');
  });

  test('getPartyByPlayer - 플레이어의 파티 조회', async () => {
    const party = await partyManager.createParty({
      leaderId: 'player1',
      leaderName: '김플레이어'
    });

    await partyManager.inviteMember(party.partyId, 'player2', '이플레이어');

    const retrievedParty = await partyManager.getPartyByPlayer('player2');

    expect(retrievedParty).toBeDefined();
    expect(retrievedParty.partyId).toBe(party.partyId);
  });
});

// PartyChat Tests
describe('PartyChat', () => {
  let redis;
  let partyChat;

  beforeEach(() => {
    redis = new MockRedis();
    partyChat = new PartyChat(redis);
  });

  test('sendMessage - 채팅 메시지 전송', async () => {
    const result = await partyChat.sendMessage('party1', {
      senderId: 'player1',
      senderName: '김플레이어',
      content: '안녕하세요!'
    });

    expect(result.success).toBe(true);
    expect(result.message.senderId).toBe('player1');
    expect(result.message.content).toBe('안녕하세요!');
  });

  test('sendSystemMessage - 시스템 메시지 전송', async () => {
    const result = await partyChat.sendSystemMessage('party1', '파티가 생성되었습니다');

    expect(result.success).toBe(true);
    expect(result.message.senderId).toBe('system');
    expect(result.message.type).toBe('system');
  });

  test('getChatHistory - 채팅 히스토리 조회', async () => {
    await partyChat.sendMessage('party1', {
      senderId: 'player1',
      senderName: '김플레이어',
      content: '메시지 1'
    });

    await partyChat.sendMessage('party1', {
      senderId: 'player2',
      senderName: '이플레이어',
      content: '메시지 2'
    });

    const history = await partyChat.getChatHistory('party1');

    expect(history).toHaveLength(2);
    expect(history[0].content).toBe('메시지 1');
    expect(history[1].content).toBe('메시지 2');
  });

  test('clearChatHistory - 채팅 히스토리 삭제', async () => {
    await partyChat.sendMessage('party1', {
      senderId: 'player1',
      senderName: '김플레이어',
      content: '메시지 1'
    });

    const result = await partyChat.clearChatHistory('party1');

    expect(result.success).toBe(true);
    expect(result.message).toBe('채팅 기록이 삭제되었습니다');

    const history = await partyChat.getChatHistory('party1');
    expect(history).toHaveLength(0);
  });
});

// ExpShare Tests
describe('ExpShare', () => {
  let redis;
  let partyManager;
  let expShare;

  beforeEach(() => {
    redis = new MockRedis();
    partyManager = new PartyManager(redis);
    expShare = new ExpShare(redis, partyManager);
  });

  test('calculatePartyBonus - 파티 보너스 계산', () => {
    expect(expShare.calculatePartyBonus(1)).toBe(0);
    expect(expShare.calculatePartyBonus(2)).toBe(0.1);
    expect(expShare.calculatePartyBonus(3)).toBe(0.2);
    expect(expShare.calculatePartyBonus(5)).toBe(0.4);
    expect(expShare.calculatePartyBonus(6)).toBe(0.5); // 최대 50%
  });

  test('calculateLevelDiffCorrection - 레벨 차이 보정 계수', () => {
    expect(expShare.calculateLevelDiffCorrection(10, 10)).toBe(1.0);
    expect(expShare.calculateLevelDiffCorrection(10, 15)).toBe(0.8);
    expect(expShare.calculateLevelDiffCorrection(10, 20)).toBe(0.4);
    expect(expShare.calculateLevelDiffCorrection(10, 30)).toBe(0.2);
  });

  test('calculateShareExp - 분당 경험치 계산', () => {
    expect(expShare.calculateShareExp(100, 2)).toBe(55); // 50 + 10%
    expect(expShare.calculateShareExp(100, 3)).toBe(40); // 33.3 + 20%
  });

  test('addExp - 경험치 추가', async () => {
    redis.setEx('character:player1', 3600, JSON.stringify({
      id: 'player1',
      name: '김플레이어',
      level: 1,
      exp: 50
    }));

    const result = await expShare.addExp('player1', 70);

    expect(result.success).toBe(true);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });
});

// RewardDistribution Tests
describe('RewardDistribution', () => {
  let rewardDistribution;

  beforeEach(() => {
    rewardDistribution = new RewardDistribution(null, null, null);
  });

  test('distributeAllRewards - 경험치 분배', () => {
    const expShare = new ExpShare(null, null);
    const partyMembers = [
      { id: 'player1', name: '김플레이어', level: 10 },
      { id: 'player2', name: '이플레이어', level: 12 }
    ];

    const rewards = {
      exp: 200,
      gold: 100,
      items: [{ id: 'item_1', name: '아이템' }]
    };

    const result = rewardDistribution.distributeAllRewards('party1', partyMembers, rewards, expShare);

    expect(result.partyId).toBe('party1');
    expect(result.total.exp).toBe(200);
  });

  test('createPartyQuest - 파티 퀘스트 생성', () => {
    const quest = rewardDistribution.createPartyQuest('party1', {
      title: '파티 보스 사냥',
      description: '보스를 처치하세요'
    });

    expect(quest.partyId).toBe('party1');
    expect(quest.title).toBe('파티 보스 사냥');
    expect(quest.status).toBe('active');
  });

  test('getPartyQuest - 파티 퀘스트 조회', () => {
    rewardDistribution.createPartyQuest('party1', { title: '퀘스트 1' });
    rewardDistribution.createPartyQuest('party1', { title: '퀘스트 2' });

    const quests = rewardDistribution.getPartyQuests('party1');

    expect(quests).toHaveLength(2);
  });

  test('updatePartyQuestProgress - 퀘스트 진행 업데이트', () => {
    const quest = rewardDistribution.createPartyQuest('party1', {
      title: '퀘스트',
      targetCount: 5
    });

    const updated = rewardDistribution.updatePartyQuestProgress('party1', quest.id, 3);

    expect(updated.progress).toBe(3);
    expect(updated.isCompleted).toBe(false);
  });

  test('updatePartyQuestProgress - 퀘스트 완료', () => {
    const quest = rewardDistribution.createPartyQuest('party1', {
      title: '퀘스트',
      targetCount: 5
    });

    const updated = rewardDistribution.updatePartyQuestProgress('party1', quest.id, 5);

    expect(updated.isCompleted).toBe(true);
    expect(updated.status).toBe('completed');

    // 완료된 퀘스트 제거 확인
    const quests = rewardDistribution.getPartyQuests('party1');
    expect(quests).toHaveLength(0);
  });
});

// Party System Integration Tests
describe('PartySystem', () => {
  let partySystem;

  beforeEach(() => {
    partySystem = new PartySystem(null);
  });

  test('constructor - PartySystem 인스턴스 생성', () => {
    expect(partySystem).toBeDefined();
    expect(partySystem.manager).toBeDefined();
    expect(partySystem.chat).toBeDefined();
    expect(partySystem.expShare).toBeDefined();
    expect(partySystem.rewards).toBeDefined();
  });

  test('initialize - 파티 시스템 초기화', () => {
    expect(() => partySystem.initialize()).not.toThrow();
  });
});