/**
 * PartyManager 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import PartyManager from '../party-manager';

describe('PartyManager', () => {
  let partyManager;

  beforeEach(() => {
    partyManager = new PartyManager(null); // Redis 없이 테스트
  });

  afterEach(() => {
    // 테스트 후 정리
    partyManager.parties.clear();
    partyManager.playerToParty.clear();
  });

  describe('createParty', () => {
    it('파티 생성 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      expect(party).toBeDefined();
      expect(party.id).toBeDefined();
      expect(party.leaderId).toBe('player1');
      expect(party.members).toHaveLength(1);
      expect(party.members[0].id).toBe('player1');
      expect(party.members[0].isLeader).toBe(true);
      expect(party.status).toBe('active');
    });

    it('이미 파티에 있는 플레이어는 파티 생성 불가', async () => {
      await partyManager.createParty('player1', 'Alice');
      await expect(
        partyManager.createParty('player1', 'Alice')
      ).rejects.toThrow('Already in a party');
    });

    it('최대 파티원 수 5명', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      expect(partyManager.maxPartySize).toBe(5);
    });
  });

  describe('invitePlayer', () => {
    it('파티장이 플레이어 초대 수 있어야 함', async () => {
      await partyManager.createParty('player1', 'Alice');

      const invite = await partyManager.invitePlayer(
        partyManager.parties.keys().next().value,
        'player1',
        'player2'
      );

      expect(invite).toBeDefined();
      expect(invite.partyId).toBeDefined();
      expect(invite.inviterId).toBe('player1');
      expect(invite.invitedId).toBe('player2');
      expect(invite.createdAt).toBeDefined();
    });

    it('파티장 없이 초대 불가', async () => {
      await partyManager.createParty('player1', 'Alice');
      const partyId = partyManager.parties.keys().next().value;

      await expect(
        partyManager.invitePlayer(partyId, 'player2', 'player3')
      ).rejects.toThrow('Only party leader can invite');
    });

    it('최대 파티원 초과 시 초대 불가', async () => {
      const party = await partyManager.createParty('player1', 'Alice');

      // 4명 추가 초대 (총 5명)
      for (let i = 2; i <= 5; i++) {
        await partyManager.acceptInvite(party.id, `player${i}`, `Player${i}`);
      }

      await expect(
        partyManager.invitePlayer(party.id, 'player1', 'player6')
      ).rejects.toThrow('Party is full');
    });
  });

  describe('acceptInvite', () => {
    it('초대 수락 시 파티원 추가', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.invitePlayer(party.id, 'player1', 'player2');

      const updatedParty = await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      expect(updatedParty.members).toHaveLength(2);
      expect(updatedParty.members[1].id).toBe('player2');
      expect(updatedParty.members[1].isLeader).toBe(false);
    });

    it('이미 파티에 있는 플레이어는 초대 수락 불가', async () => {
      const party = await partyManager.createParty('player1', 'Alice');

      await expect(
        partyManager.acceptInvite(party.id, 'player1', 'Alice')
      ).rejects.toThrow('Already in a party');
    });
  });

  describe('declineInvite', () => {
    it('초대 거절 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');

      const result = await partyManager.declineInvite(party.id, 'player2');

      expect(result.success).toBe(true);
    });
  });

  describe('leaveParty', () => {
    it('파티원 탈퇴 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      const result = await partyManager.leaveParty('player2');

      expect(result.success).toBe(true);
      expect(party.members).toHaveLength(1);
    });

    it('파티장 혼자 남으면 탈퇴 후 파티 해체', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      const partyId = party.id;

      const result = await partyManager.leaveParty('player1');

      expect(result.success).toBe(true);
      expect(() => partyManager.getParty(partyId)).toThrow();
    });

    it('모든 멤버 탈퇴 시 파티 해체', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      const partyId = party.id;

      // player2 입장
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      // 파티장 위임 (player1 → player2)
      await partyManager.transferLeadership(party.id, 'player1', 'player2');

      // player1 탈퇴
      await partyManager.leaveParty('player1');

      // player2 탈퇴 (마지막 멤버 → 파티장)
      const result = await partyManager.leaveParty('player2');

      expect(result.success).toBe(true);
      expect(() => partyManager.getParty(partyId)).toThrow();
    });
  });

  describe('kickPlayer', () => {
    it('파티장이 플레이어 추방 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      const result = await partyManager.kickPlayer(party.id, 'player1', 'player2');

      expect(result.success).toBe(true);
      expect(party.members).toHaveLength(1);
    });

    it('파티장은 추방 불가', async () => {
      const party = await partyManager.createParty('player1', 'Alice');

      await expect(
        partyManager.kickPlayer(party.id, 'player1', 'player1')
      ).rejects.toThrow('Cannot kick party leader');
    });

    it('파티장만 추방 가능', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      await expect(
        partyManager.kickPlayer(party.id, 'player2', 'player1')
      ).rejects.toThrow('Only party leader can kick');
    });
  });

  describe('transferLeadership', () => {
    it('파티장 위임 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      const updatedParty = await partyManager.transferLeadership(party.id, 'player1', 'player2');

      expect(updatedParty.leaderId).toBe('player2');
      expect(updatedParty.members[0].isLeader).toBe(false);
      expect(updatedParty.members[1].isLeader).toBe(true);
    });

    it('현재 파티장만 위임 가능', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      await expect(
        partyManager.transferLeadership(party.id, 'player2', 'player1')
      ).rejects.toThrow('Only current leader can transfer leadership');
    });

    it('파티원에게만 위임 가능', async () => {
      const party = await partyManager.createParty('player1', 'Alice');

      await expect(
        partyManager.transferLeadership(party.id, 'player1', 'player99')
      ).rejects.toThrow('Player not found in party');
    });
  });

  describe('disbandParty', () => {
    it('파티 해체 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      const partyId = party.id;
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      const result = await partyManager.disbandParty(partyId);

      expect(result.success).toBe(true);
      expect(() => partyManager.getParty(partyId)).toThrow();
    });

    it('해체 시 모든 파티원 맵 제거', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.acceptInvite(party.id, 'player2', 'Bob');

      await partyManager.disbandParty(party.id);

      expect(partyManager.playerToParty.get('player1')).toBeUndefined();
      expect(partyManager.playerToParty.get('player2')).toBeUndefined();
    });
  });

  describe('getParty', () => {
    it('파티 정보 조회 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');

      const fetchedParty = partyManager.getParty(party.id);

      expect(fetchedParty).toBeDefined();
      expect(fetchedParty.id).toBe(party.id);
    });

    it('없는 파티 조회 시 에러', () => {
      expect(() => partyManager.getParty('nonexist')).toThrow('Party not found');
    });
  });

  describe('getPlayerParty', () => {
    it('플레이어의 파티 조회 수 있어야 함', async () => {
      const party = await partyManager.createParty('player1', 'Alice');

      const playerParty = partyManager.getPlayerParty('player1');

      expect(playerParty).toBeDefined();
      expect(playerParty.id).toBe(party.id);
    });

    it('파티에 없는 플레이어는 null 반환', () => {
      const playerParty = partyManager.getPlayerParty('nonexist');
      expect(playerParty).toBeNull();
    });
  });

  describe('getAllParties', () => {
    it('모든 파티 목록 조회 수 있어야 함', async () => {
      await partyManager.createParty('player1', 'Alice');
      await partyManager.createParty('player2', 'Bob');

      const allParties = partyManager.getAllParties();

      expect(allParties).toHaveLength(2);
      expect(allParties[0]).toHaveProperty('id');
      expect(allParties[0]).toHaveProperty('memberCount');
      expect(allParties[0]).toHaveProperty('maxMembers');
    });

    it('해체된 파티는 목록에 포함 안 됨', async () => {
      const party = await partyManager.createParty('player1', 'Alice');
      await partyManager.disbandParty(party.id);

      const allParties = partyManager.getAllParties();

      expect(allParties).toHaveLength(0);
    });
  });
});