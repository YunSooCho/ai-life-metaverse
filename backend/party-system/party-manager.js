/**
 * PartyManager - 파티 관리 시스템
 * 파티 생성, 초대, 탈퇴, 해체, 파티장 위임 기능
 * Redis 기반 영속화 + 메모리 fallback
 */

import EventEmitter from 'events';

export default class PartyManager extends EventEmitter {
  constructor(redisClient = null) {
    super();
    this.redis = redisClient;
    this.parties = new Map();
    this.playerToParty = new Map();
    this.maxPartySize = 5;
    this.invites = new Map();
  }

  /**
   * 새로운 파티 생성
   * @param {string} leaderId - 파티장 ID
   * @param {string} leaderName - 파티장 이름
   * @returns {Promise<Object>} 생성된 파티 정보
   */
  async createParty(leaderId, leaderName) {
    // 이미 파티에 있는지 확인
    if (this.playerToParty.has(leaderId)) {
      throw new Error('Already in a party');
    }

    const partyId = `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const party = {
      id: partyId,
      leaderId,
      leaderName,
      members: [{
        id: leaderId,
        name: leaderName,
        joinedAt: Date.now(),
        isLeader: true
      }],
      status: 'active',
      createdAt: Date.now(),
      maxMembers: this.maxPartySize
    };

    this.parties.set(partyId, party);
    this.playerToParty.set(leaderId, partyId);

    // Redis에 저장
    if (this.redis) {
      await this.redis.setEx(
        `party:${partyId}`,
        3600,
        JSON.stringify(party)
      );
      await this.redis.setEx(
        `player:${leaderId}:party`,
        3600,
        partyId
      );
    }

    this.emit('partyCreated', { partyId, leaderId, leaderName });
    return party;
  }

  /**
   * 플레이어 초대
   * @param {string} partyId - 파티 ID
   * @param {string} inviterId - 초대자 ID
   * @param {string} invitedId - 초대받는 사람 ID
   * @returns {Promise<Object>} 초대 정보
   */
  async invitePlayer(partyId, inviterId, invitedId) {
    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 파티장만 초대 가능
    if (party.leaderId !== inviterId) {
      throw new Error('Only party leader can invite');
    }

    // 이미 파티에 있는지 확인
    if (this.playerToParty.has(invitedId)) {
      throw new Error('Already in a party');
    }

    // 파티가 가득 찼는지 확인
    if (party.members.length >= this.maxPartySize) {
      throw new Error('Party is full');
    }

    // 이미 초대받았는지 확인
    const inviteKey = `${partyId}_${invitedId}`;
    if (this.invites.has(inviteKey)) {
      throw new Error('Already invited');
    }

    const invite = {
      partyId,
      inviterId,
      invitedId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000 // 5분 유효
    };

    this.invites.set(inviteKey, invite);

    this.emit('playerInvited', { partyId, invitedId });

    return invite;
  }

  /**
   * 초대 수락
   * @param {string} partyId - 파티 ID
   * @param {string} playerId - 플레이어 ID
   * @param {string} playerName - 플레이어 이름
   * @returns {Promise<Object>} 업데이트된 파티 정보
   */
  async acceptInvite(partyId, playerId, playerName) {
    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 이미 다른 파티에 있는지 확인
    const existingPartyId = this.playerToParty.get(playerId);
    if (existingPartyId && existingPartyId !== partyId) {
      throw new Error('Already in another party');
    }

    // 이미 현재 파티에 있는지 확인
    if (existingPartyId === partyId) {
      throw new Error('Already in a party');
    }

    // 파티가 가득 찼는지 확인
    if (party.members.length >= this.maxPartySize) {
      throw new Error('Party is full');
    }

    // 파티원 추가
    party.members.push({
      id: playerId,
      name: playerName,
      joinedAt: Date.now(),
      isLeader: false
    });

    this.playerToParty.set(playerId, partyId);

    // 초대 삭제
    const inviteKey = `${partyId}_${playerId}`;
    this.invites.delete(inviteKey);

    // Redis에 저장
    if (this.redis) {
      await this.redis.setEx(
        `party:${partyId}`,
        3600,
        JSON.stringify(party)
      );
      await this.redis.setEx(
        `player:${playerId}:party`,
        3600,
        partyId
      );
    }

    this.emit('playerJoined', { partyId, playerId, playerName });
    return party;
  }

  /**
   * 초대 거절
   * @param {string} partyId - 파티 ID
   * @param {string} playerId - 거절하는 플레이어 ID
   * @returns {Promise<Object>} 거절 결과
   */
  async declineInvite(partyId, playerId) {
    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    const inviteKey = `${partyId}_${playerId}`;
    this.invites.delete(inviteKey);

    this.emit('partyInviteDeclined', { partyId, playerId });
    return { success: true };
  }

  /**
   * 파티 탈퇴
   * @param {string} playerId - 탈퇴할 플레이어 ID
   * @returns {Promise<Object>} 탈퇴 결과
   */
  async leaveParty(playerId) {
    const partyId = this.playerToParty.get(playerId);
    if (!partyId) {
      throw new Error('Not in a party');
    }

    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 파티장인지 확인
    if (party.leaderId === playerId) {
      // 마지막 멤버면 파티 해체
      if (party.members.length === 1) {
        return this.disbandParty(partyId);
      }
      throw new Error('Party leader cannot leave');
    }

    // 멤버 제거
    const memberIndex = party.members.findIndex(m => m.id === playerId);
    if (memberIndex === -1) {
      throw new Error('Player not found in party');
    }

    party.members.splice(memberIndex, 1);
    this.playerToParty.delete(playerId);

    // Redis에 저장
    if (this.redis) {
      await this.redis.setEx(
        `party:${partyId}`,
        3600,
        JSON.stringify(party)
      );
      await this.redis.del(`player:${playerId}:party`);
    }

    this.emit('playerLeft', { partyId, playerId });
    return { success: true, party };
  }

  /**
   * 파티원 추방
   * @param {string} partyId - 파티 ID
   * @param {string} leaderId - 파티장 ID
   * @param {string} playerId - 추방할 플레이어 ID
   * @returns {Promise<Object>} 추방 결과
   */
  async kickPlayer(partyId, leaderId, playerId) {
    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 파티장인지 확인
    if (party.leaderId !== leaderId) {
      throw new Error('Only party leader can kick');
    }

    // 추방할 파티장인지 확인
    if (party.leaderId === playerId) {
      throw new Error('Cannot kick party leader');
    }

    // 멤버인지 확인
    const memberIndex = party.members.findIndex(m => m.id === playerId);
    if (memberIndex === -1) {
      throw new Error('Player not found in party');
    }

    // 멤버 제거
    party.members.splice(memberIndex, 1);
    this.playerToParty.delete(playerId);

    // Redis에 저장
    if (this.redis) {
      await this.redis.setEx(
        `party:${partyId}`,
        3600,
        JSON.stringify(party)
      );
      await this.redis.del(`player:${playerId}:party`);
    }

    this.emit('playerKicked', { partyId, playerId });
    return { success: true, party };
  }

  /**
   * 파티장 위임
   * @param {string} partyId - 파티 ID
   * @param {string} currentLeaderId - 현재 파티장 ID
   * @param {string} newLeaderId - 새 파티장 ID
   * @returns {Promise<Object>} 업데이트된 파티 정보
   */
  async transferLeadership(partyId, currentLeaderId, newLeaderId) {
    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 현재 파티장인지 확인
    if (party.leaderId !== currentLeaderId) {
      throw new Error('Only current leader can transfer leadership');
    }

    // 새 파티장이 멤버인지 확인
    const newLeaderIndex = party.members.findIndex(m => m.id === newLeaderId);
    if (newLeaderIndex === -1) {
      throw new Error('Player not found in party');
    }

    // 리더 플래그 변경
    party.members.forEach(m => {
      if (m.id === currentLeaderId) {
        m.isLeader = false;
      } else if (m.id === newLeaderId) {
        m.isLeader = true;
      }
    });

    party.leaderId = newLeaderId;
    party.leaderName = party.members[newLeaderIndex].name;

    // Redis에 저장
    if (this.redis) {
      await this.redis.setEx(
        `party:${partyId}`,
        3600,
        JSON.stringify(party)
      );
    }

    this.emit('leadershipTransferred', { partyId, from: currentLeaderId, to: newLeaderId });
    return party;
  }

  /**
   * 파티 해체
   * @param {string} partyId - 파티 ID
   * @returns {Promise<Object>} 해체 결과
   */
  async disbandParty(partyId) {
    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 모든 멤버의 맵 제거
    party.members.forEach(member => {
      this.playerToParty.delete(member.id);
    });

    // 파티 삭제
    this.parties.delete(partyId);

    // Redis에서 삭제
    if (this.redis) {
      await this.redis.del(`party:${partyId}`);
      for (const member of party.members) {
        await this.redis.del(`player:${member.id}:party`);
      }
    }

    this.emit('partyDisbanded', { partyId });
    return { success: true };
  }

  /**
   * 파티 정보 조회
   * @param {string} partyId - 파티 ID
   * @returns {Object} 파티 정보
   */
  getParty(partyId) {
    const party = this.parties.get(partyId);
    if (!party) {
      throw new Error('Party not found');
    }
    return party;
  }

  /**
   * 플레이어의 파티 조회
   * @param {string} playerId - 플레이어 ID
   * @returns {Object|null} 파티 정보
   */
  getPlayerParty(playerId) {
    const partyId = this.playerToParty.get(playerId);
    if (!partyId) {
      return null;
    }
    return this.getParty(partyId);
  }

  /**
   * 모든 파티 목록
   * @returns {Array} 파티 정보 배열
   */
  getAllParties() {
    const parties = [];
    for (const [_, party] of this.parties) {
      if (party.status === 'active') {
        parties.push({
          id: party.id,
          leaderId: party.leaderId,
          memberCount: party.members.length,
          maxMembers: party.maxMembers,
          createdAt: party.createdAt
        });
      }
    }
    return parties;
  }
}