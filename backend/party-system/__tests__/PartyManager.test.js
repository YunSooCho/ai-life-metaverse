/**
 * PartyManager 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PartyManager } from '../PartyManager.js';

describe('PartyManager', () => {
  let partyManager;

  beforeEach(() => {
    partyManager = new PartyManager();
  });

  describe('createParty', () => {
    it('파티를 생성해야 함', () => {
      const result = partyManager.createParty('player1');
      
      expect(result.success).toBe(true);
      expect(result.partyId).toBeDefined();
      expect(result.party.leaderId).toBe('player1');
      expect(result.party.members).toEqual(['player1']);
      expect(result.party.maxSize).toBe(5);
    });

    it('이미 파티에 있는 플레이어는 파티를 생성할 수 없음', () => {
      partyManager.createParty('player1');
      const result = partyManager.createParty('player1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_IN_PARTY');
    });
  });

  describe('inviteToParty', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
    });

    it('파티원을 초대해야 함', () => {
      const partyId = 'party_1';
      const result = partyManager.inviteToParty(partyId, 'player1', 'player2');
      
      expect(result.success).toBe(true);
      expect(result.invitee).toBe('player2');
    });

    it('파티장만 초대할 수 있음', () => {
      const partyId = 'party_1';
      const result = partyManager.inviteToParty(partyId, 'player2', 'player3');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_LEADER');
    });

    it('최대 파티 인원 초과 시 초대 불가', () => {
      const partyId = 'party_1';
      
      // 파티 꽉 채우기 (이미 player1 있음 -> 4명 더 초대)
      partyManager.inviteToParty(partyId, 'player1', 'player2');
      partyManager.acceptInvite(partyId, 'player2');
      partyManager.inviteToParty(partyId, 'player1', 'player3');
      partyManager.acceptInvite(partyId, 'player3');
      partyManager.inviteToParty(partyId, 'player1', 'player4');
      partyManager.acceptInvite(partyId, 'player4');
      partyManager.inviteToParty(partyId, 'player1', 'player5');
      partyManager.acceptInvite(partyId, 'player5');
      
      // 6번째 접근 시도
      const result = partyManager.inviteToParty(partyId, 'player1', 'player6');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('PARTY_FULL');
    });

    it('이미 파티에 있는 플레이어는 초대 불가', () => {
      const partyId = 'party_1';
      const result = partyManager.inviteToParty(partyId, 'player1', 'player1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_IN_PARTY');
    });

    it('이미 초대받은 플레이어는 다시 초대 불가', () => {
      const partyId = 'party_1';
      partyManager.inviteToParty(partyId, 'player1', 'player2');
      const result = partyManager.inviteToParty(partyId, 'player1', 'player2');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_INVITED');
    });
  });

  describe('acceptInvite', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
      partyManager.inviteToParty('party_1', 'player1', 'player2');
    });

    it('초대를 수락해야 함', () => {
      const result = partyManager.acceptInvite('party_1', 'player2');
      
      expect(result.success).toBe(true);
      expect(result.party.members).toContain('player2');
    });

    it('초대받지 않은 플레이어는 수락 불가', () => {
      const result = partyManager.acceptInvite('party_1', 'player3');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_INVITE');
    });

    it('존재하지 않는 파티는 수락 불가', () => {
      const result = partyManager.acceptInvite('party_999', 'player2');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('PARTY_NOT_FOUND');
    });
  });

  describe('declineInvite', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
      partyManager.inviteToParty('party_1', 'player1', 'player2');
    });

    it('초대를 거절해야 함', () => {
      const result = partyManager.declineInvite('party_1', 'player2');
      
      expect(result.success).toBe(true);
      expect(result.partyId).toBe('party_1');
    });
  });

  describe('leaveParty', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
      partyManager.inviteToParty('party_1', 'player1', 'player2');
      partyManager.acceptInvite('party_1', 'player2');
    });

    it('파티원이 탈퇴해야 함', () => {
      const result = partyManager.leaveParty('player2');
      
      expect(result.success).toBe(true);
      expect(result.leftParty.members).not.toContain('player2');
    });

    it('파티장이 탈퇴하고 파티원이 있으면 위임해야 함', () => {
      partyManager.inviteToParty('party_1', 'player1', 'player3');
      partyManager.acceptInvite('party_1', 'player3');
      
      const result = partyManager.leaveParty('player1');
      
      expect(result.success).toBe(true);
      expect(result.leftParty.leaderId).toBe('player2');
    });

    it('파티장이 탈퇴하고 파티원이 없으면 파티 해체해야 함', () => {
      partyManager.leaveParty('player2'); // player2 먼저 탈퇴
      
      const result = partyManager.leaveParty('player1');
      
      expect(result.success).toBe(true);
      expect(partyManager.parties.size).toBe(0);
    });

    it('파티에 없는 플레이어는 탈퇴 불가', () => {
      const result = partyManager.leaveParty('player999');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_IN_PARTY');
    });
  });

  describe('kickPlayer', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
      partyManager.inviteToParty('party_1', 'player1', 'player2');
      partyManager.acceptInvite('party_1', 'player2');
    });

    it('파티원을 추방해야 함', () => {
      const result = partyManager.kickPlayer('party_1', 'player1', 'player2');
      
      expect(result.success).toBe(true);
      expect(result.targetId).toBe('player2');
      expect(partyManager.parties.get('party_1').members).not.toContain('player2');
    });

    it('파티장만 추방할 수 있음', () => {
      const result = partyManager.kickPlayer('party_1', 'player2', 'player1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_LEADER');
    });

    it('파티장은 추방할 수 없음', () => {
      const result = partyManager.kickPlayer('party_1', 'player1', 'player1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('CANNOT_KICK_LEADER');
    });

    it('파티원이 아닌 플레이어는 추방 불가', () => {
      const result = partyManager.kickPlayer('party_1', 'player1', 'player999');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_MEMBER');
    });
  });

  describe('transferLeadership', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
      partyManager.inviteToParty('party_1', 'player1', 'player2');
      partyManager.acceptInvite('party_1', 'player2');
    });

    it('파티장을 위임해야 함', () => {
      const result = partyManager.transferLeadership('party_1', 'player1', 'player2');
      
      expect(result.success).toBe(true);
      expect(result.oldLeader).toBe('player1');
      expect(result.newLeader).toBe('player2');
      expect(partyManager.parties.get('party_1').leaderId).toBe('player2');
    });

    it('현재 파티장만 위임할 수 있음', () => {
      const result = partyManager.transferLeadership('party_1', 'player2', 'player3');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_LEADER');
    });

    it('파티원에게만 위임 가능', () => {
      const result = partyManager.transferLeadership('party_1', 'player1', 'player999');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_MEMBER');
    });

    it('같은 사람에게 위임 불가', () => {
      const result = partyManager.transferLeadership('party_1', 'player1', 'player1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('SAME_PLAYER');
    });
  });

  describe('disbandParty', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
      partyManager.inviteToParty('party_1', 'player1', 'player2');
      partyManager.acceptInvite('party_1', 'player2');
    });

    it('파티장만 파티를 해체할 수 있음', () => {
      const result = partyManager.disbandParty('party_1', 'player2');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_LEADER');
    });

    it('파티를 해체해야 함', () => {
      const result = partyManager.disbandParty('party_1', 'player1');
      
      expect(result.success).toBe(true);
      expect(partyManager.parties.size).toBe(0);
    });
  });

  describe('getPartyInfo', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
    });

    it('파티 정보를 조회해야 함', () => {
      const result = partyManager.getPartyInfo('party_1');
      
      expect(result.success).toBe(true);
      expect(result.party.id).toBe('party_1');
      expect(result.party.leaderId).toBe('player1');
      expect(result.party.memberCount).toBe(1);
    });

    it('존재하지 않는 파티는 조회 불가', () => {
      const result = partyManager.getPartyInfo('party_999');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('PARTY_NOT_FOUND');
    });
  });

  describe('getPlayerParty', () => {
    beforeEach(() => {
      partyManager.createParty('player1');
    });

    it('플레이어의 파티를 조회해야 함', () => {
      const result = partyManager.getPlayerParty('player1');
      
      expect(result.success).toBe(true);
      expect(result.party.id).toBe('party_1');
    });

    it('파티에 없는 플레이어는 조회 불가', () => {
      const result = partyManager.getPlayerParty('player999');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_IN_PARTY');
    });
  });

  describe('getAllParties', () => {
    it('모든 파티 목록을 조회해야 함', () => {
      partyManager.createParty('player1');
      partyManager.createParty('player2');
      
      const parties = partyManager.getAllParties();
      
      expect(parties.length).toBe(2);
      expect(parties[0].leaderId).toBe('player1');
      expect(parties[1].leaderId).toBe('player2');
    });
  });

  describe('handlePlayerDisconnect', () => {
    it('파티장 접속 종료 시 파티 해체해야 함', () => {
      partyManager.createParty('player1');
      
      partyManager.handlePlayerDisconnect('player1');
      
      expect(partyManager.parties.size).toBe(0);
    });

    it('일반 파티원 접속 종료 시 탈퇴 처리해야 함', () => {
      partyManager.createParty('player1');
      partyManager.inviteToParty('party_1', 'player1', 'player2');
      partyManager.acceptInvite('party_1', 'player2');
      
      partyManager.handlePlayerDisconnect('player2');
      
      expect(partyManager.parties.get('party_1').members).not.toContain('player2');
    });
  });
});