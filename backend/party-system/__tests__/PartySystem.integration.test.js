/**
 * PartySystem 통합 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import PartySystem from '../index.js';

describe('PartySystem Integration', () => {
  let partySystem;

  beforeEach(() => {
    partySystem = new PartySystem();
  });

  describe('Complete Party Workflow', () => {
    it('파티 생성부터 해체까지 전체 워크플로우를 수행해야 함', () => {
      // Step 1: 파티 생성
      const createResult = partySystem.createParty('player1');
      expect(createResult.success).toBe(true);
      expect(createResult.partyId).toBeDefined();

      const partyId = createResult.partyId;

      // Step 2: 파티원 초대 및 수락
      const invite1 = partySystem.inviteToParty(partyId, 'player1', 'player2');
      expect(invite1.success).toBe(true);

      const accept1 = partySystem.acceptInvite(partyId, 'player2');
      expect(accept1.success).toBe(true);
      expect(accept1.party.members).toContain('player2');

      const invite2 = partySystem.inviteToParty(partyId, 'player1', 'player3');
      expect(invite2.success).toBe(true);

      const accept2 = partySystem.acceptInvite(partyId, 'player3');
      expect(accept2.success).toBe(true);

      // Step 3: 파티 채팅
      chatResult1 = partySystem.sendMessage(partyId, 'player1', 'Alice', 'Welcome to the party!');
      expect(chatResult1.success).toBe(true);

      chatResult2 = partySystem.sendMessage(partyId, 'player2', 'Bob', 'Thanks for the invite!');
      expect(chatResult2.success).toBe(true);

      // 채팅 히스토리 확인
      const history = partySystem.getChatHistory(partyId);
      expect(history.success).toBe(true);
      expect(history.totalMessages).toBeGreaterThanOrEqual(2);

      // Step 4: 경험치 공유
      const sharedExp = partySystem.calculateSharedExp(100, 3, 10, 10);
      expect(sharedExp.sharedExp).toBeDefined();
      expect(sharedExp.partyBonusRate).toBe(1.2); // 3인 +20%

      // Step 5: 파티 퀘스트 생성
      const quest = partySystem.partyQuests.createBossQuest(10);
      partySystem.partyQuests.registerQuestDefinition(quest.id, quest);

      const startQuest = partySystem.partyQuests.startQuest(partyId, quest.id);
      expect(startQuest.success).toBe(true);

      // Step 6: 퀘스트 진행
      const questProgress = partySystem.partyQuests.updateQuestProgress(
        partyId,
        startQuest.activeQuest.id,
        'player1',
        'kill',
        1
      );
      expect(questProgress.completed).toBe(true);

      // Step 7: 퀘스트 보상 분배
      partySystem.registerQuestReward(quest.id, quest.reward);
      const rewardResult = partySystem.completePartyQuest(quest.id, [
        { id: 'player1', name: 'Alice' },
        { id: 'player2', name: 'Bob' },
        { id: 'player3', name: 'Charlie' }
      ]);
      expect(rewardResult.success).toBe(true);

      // Step 8: 파티장 위임
      const transfer = partySystem.transferLeadership(partyId, 'player1', 'player2');
      expect(transfer.success).toBe(true);
      expect(transfer.newLeader).toBe('player2');

      // Step 9: 파티원 탈퇴
      const leave = partySystem.leaveParty('player3');
      expect(leave.success).toBe(true);

      // Step 10: 파티 해체
      const disband = partySystem.disbandParty(partyId, 'player2');
      expect(disband.success).toBe(true);

      // 파티가 정리되었는지 확인
      const partyInfo = partySystem.getPartyInfo(partyId);
      expect(partyInfo.success).toBe(false);
    });

    it('몬스터 처치 후 경험치 분배 워크플로우를 수행해야 함', () => {
      // 파티 생성
      const createResult = partySystem.createParty('player1');
      const partyId = createResult.partyId;

      partySystem.inviteToParty(partyId, 'player1', 'player2');
      partySystem.acceptInvite(partyId, 'player2');
      partySystem.inviteToParty(partyId, 'player1', 'player3');
      partySystem.acceptInvite(partyId, 'player3');

      // 몬스터 처치 처리
      const killResult = partySystem.processMonsterKill({
        killerId: 'player1',
        baseExp: 150,
        monsterLevel: 12,
        partyId
      });

      expect(killResult.success).toBe(true);
      expect(killResult.distributions).toBeDefined();
      expect(killResult.distributions.length).toBe(3);

      // 킬러가 경험치를 받았는지 확인
      const killer = killResult.distributions.find(d => d.isKiller);
      expect(killer).toBeDefined();
      expect(killer.exp).toBeGreaterThan(0);

      // 모든 파티원이 경험치를 받았는지 확인
      killResult.distributions.forEach(dist => {
        expect(dist.exp).toBeGreaterThan(0);
      });
    });
  });

  describe('Event System Integration', () => {
    it('파티 생성 시 자동으로 채팅 초기화해야 함', () => {
      let chatInitialized = false;
      
      partySystem.partyManager.on('party:created', () => {
        chatInitialized = partySystem.partyChat.chatHistories.size > 0;
      });

      partySystem.createParty('player1');

      expect(chatInitialized).toBe(true);
    });

    it('파티원 입장 시 시스템 메시지가 전송되어야 함', () => {
      let systemMessageSent = false;

      partySystem.partyChat.on('party:systemMessage', () => {
        systemMessageSent = true;
      });

      const createResult = partySystem.createParty('player1');
      const partyId = createResult.partyId;

      partySystem.inviteToParty(partyId, 'player1', 'player2');
      partySystem.acceptInvite(partyId, 'player2');

      expect(systemMessageSent).toBe(true);
    });

    it('파티 해체 시 모든 리소스가 정리되어야 함', () => {
      const createResult = partySystem.createParty('player1');
      const partyId = createResult.partyId;

      partySystem.inviteToParty(partyId, 'player1', 'player2');
      partySystem.acceptInvite(partyId, 'player2');

      // 퀘스트 생성
      const quest = partySystem.partyQuests.createBossQuest(10);
      partySystem.partyQuests.registerQuestDefinition(quest.id, quest);
      partySystem.partyQuests.startQuest(partyId, quest.id);

      // 파티 해체
      partySystem.disbandParty(partyId, 'player1');

      // 모든 리소스 정리 확인
      expect(partySystem.partyChat.chatHistories.has(partyId)).toBe(false);
      expect(partySystem.partyQuests.partyQuests.has(partyId)).toBe(false);
    });
  });

  describe('Multi-Party Integration', () => {
    it('여러 파티를 동시에 관리할 수 있어야 함', () => {
      // 파티 1 생성
      const party1 = partySystem.createParty('player1');
      partySystem.inviteToParty(party1.partyId, 'player1', 'player2');
      partySystem.acceptInvite(party1.partyId, 'player2');

      // 파티 2 생성
      const party2 = partySystem.createParty('player3');
      partySystem.inviteToParty(party2.partyId, 'player3', 'player4');
      partySystem.acceptInvite(party2.partyId, 'player4');

      // 두 파티 독립성 확인
      const party1Info = partySystem.getPartyInfo(party1.partyId);
      const party2Info = partySystem.getPartyInfo(party2.partyId);

      expect(party1Info.success).toBe(true);
      expect(party2Info.success).toBe(true);
      expect(party1.partyId).not.toBe(party2.partyId);
    });

    it('각 파티에 독립적인 채팅이 있어야 함', () => {
      const party1 = partySystem.createParty('player1');
      const party2 = partySystem.createParty('player2');

      partySystem.sendMessage(party1.partyId, 'player1', 'Alice', 'Party 1 message');
      partySystem.sendMessage(party2.partyId, 'player2', 'Bob', 'Party 2 message');

      const history1 = partySystem.getChatHistory(party1.partyId);
      const history2 = partySystem.getChatHistory(party2.partyId);

      expect(history1.totalMessages).toBe(1);
      expect(history2.totalMessages).toBe(1);
      expect(history1.messages[0].message).toBe('Party 1 message');
      expect(history2.messages[0].message).toBe('Party 2 message');
    });
  });

  describe('Error Handling', () => {
    it('존재하지 않는 파티에 대한 요청은 실패해야 함', () => {
      const result = partySystem.getPlayerParty('player999');
      expect(result.success).toBe(false);
    });

    it('초대받지 않은 플레이어는 수락 불가', () => {
      const createResult = partySystem.createParty('player1');
      const partyId = createResult.partyId;

      const acceptResult = partySystem.acceptInvite(partyId, 'player999');
      expect(acceptResult.success).toBe(false);
    });

    it('파티장 권한 없는 작업은 실패해야 함', () => {
      const createResult = partySystem.createParty('player1');
      const partyId = createResult.partyId;

      partySystem.inviteToParty(partyId, 'player1', 'player2');
      partySystem.acceptInvite(partyId, 'player2');

      // player2가 파티장 아님
      const kickResult = partySystem.kickPlayer(partyId, 'player2', 'player1');
      expect(kickResult.success).toBe(false);
    });
  });

  describe('System Stats', () => {
    it('시스템 통계를 조회할 수 있어야 함', () => {
      partySystem.createParty('player1');
      partySystem.createParty('player2');

      const stats = partySystem.getSystemStats();

      expect(stats.parties).toBeDefined();
      expect(stats.chatStats).toBeDefined();
      expect(stats.questStats).toBeDefined();
      expect(stats.parties.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('빠른 연속 작업을 처리할 수 있어야 함', () => {
      const partyId = partySystem.createParty('player1').partyId;

      // 빠르게 초대 및 수락
      const invites = ['player2', 'player3', 'player4', 'player5'];
      const acceptResults = invites.map(id => {
        partySystem.inviteToParty(partyId, 'player1', id);
        return partySystem.acceptInvite(partyId, id);
      });

      acceptResults.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('연결 해제 처리가 정상 작동해야 함', () => {
      const createResult = partySystem.createParty('player1');
      const partyId = createResult.partyId;

      partySystem.inviteToParty(partyId, 'player1', 'player2');
      partySystem.acceptInvite(partyId, 'player2');

      // 플레이어 연결 해제
      partySystem.handlePlayerDisconnect('player2');

      const partyInfo = partySystem.getPartyInfo(partyId);
      expect(partyInfo.party.members).not.toContain('player2');
    });
  });
});