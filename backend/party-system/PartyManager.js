/**
 * PartyManager - 파티 관리 시스템
 * 
 * 기능:
 * - 파티 생성 (최대 5인)
 * - 파티 초대 (플레이어 초대/수락/거절)
 * - 파티 탈퇴/추방
 * - 파티장 위임
 * - 파티 해체
 * - 파티 정보 조회
 */

import EventEmitter from 'events';

export class PartyManager extends EventEmitter {
  constructor() {
    super();
    this.parties = new Map(); // partyId => Party
    this.playerPartyMap = new Map(); // playerId => partyId
    this.nextPartyId = 1;
  }

  /**
   * 파티 생성
   * @param {string} leaderId - 파티장 아이디
   * @returns {Object} 생성된 파티 정보
   */
  createParty(leaderId) {
    // 이미 파티에 있는지 확인
    if (this.playerPartyMap.has(leaderId)) {
      return {
        success: false,
        error: 'ALREADY_IN_PARTY',
        message: '이미 파티에 속해 있습니다.'
      };
    }

    const partyId = `party_${this.nextPartyId++}`;
    const party = {
      id: partyId,
      leaderId,
      members: [leaderId],
      pendingInvites: [],
      createdAt: Date.now(),
      maxSize: 5
    };

    this.parties.set(partyId, party);
    this.playerPartyMap.set(leaderId, partyId);

    this.emit('party:created', { partyId, leaderId, party });

    return {
      success: true,
      partyId,
      party
    };
  }

  /**
   * 파티 초대
   * @param {string} partyId - 파티 아이디
   * @param {string} leaderId - 파티장 아이디
   * @param {string} playerId - 초대할 플레이어 아이디
   * @returns {Object} 초대 결과
   */
  inviteToParty(partyId, leaderId, playerId) {
    const party = this.parties.get(partyId);

    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    // 파티장 권한 확인
    if (party.leaderId !== leaderId) {
      return {
        success: false,
        error: 'NOT_LEADER',
        message: '파티장만 초대할 수 있습니다.'
      };
    }

    // 파티 인원 확인
    if (party.members.length >= party.maxSize) {
      return {
        success: false,
        error: 'PARTY_FULL',
        message: '파티가 꽉 찼습니다.'
      };
    }

    // 이미 파티에 있는지 확인
    if (party.members.includes(playerId)) {
      return {
        success: false,
        error: 'ALREADY_IN_PARTY',
        message: '이미 파티에 속해 있습니다.'
      };
    }

    // 이미 초대받았는지 확인
    if (party.pendingInvites.includes(playerId)) {
      return {
        success: false,
        error: 'ALREADY_INVITED',
        message: '이미 초대받은 플레이어입니다.'
      };
    }

    party.pendingInvites.push(playerId);

    this.emit('party:invited', { partyId, leaderId, playerId });

    return {
      success: true,
      partyId,
      invitee: playerId
    };
  }

  /**
   * 파티 초대 수락
   * @param {string} partyId - 파티 아이디
   * @param {string} playerId - 플레이어 아이디
   * @returns {Object} 수락 결과
   */
  acceptInvite(partyId, playerId) {
    const party = this.parties.get(partyId);

    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    // 초대받은 플레이어인지 확인
    if (!party.pendingInvites.includes(playerId)) {
      return {
        success: false,
        error: 'NO_INVITE',
        message: '초대받지 않은 플레이어입니다.'
      };
    }

    // 파티 인원 확인
    if (party.members.length >= party.maxSize) {
      return {
        success: false,
        error: 'PARTY_FULL',
        message: '파티가 꽉 찼습니다.'
      };
    }

    // 초대 목록에서 제거
    party.pendingInvites = party.pendingInvites.filter(id => id !== playerId);

    // 파티원 추가
    party.members.push(playerId);
    this.playerPartyMap.set(playerId, partyId);

    this.emit('party:joined', { partyId, playerId, party });

    return {
      success: true,
      partyId,
      party
    };
  }

  /**
   * 파티 초대 거절
   * @param {string} partyId - 파티 아이디
   * @param {string} playerId - 플레이어 아이디
   * @returns {Object} 거절 결과
   */
  declineInvite(partyId, playerId) {
    const party = this.parties.get(partyId);

    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    // 초대받은 플레이어인지 확인
    if (!party.pendingInvites.includes(playerId)) {
      return {
        success: false,
        error: 'NO_INVITE',
        message: '초대받지 않은 플레이어입니다.'
      };
    }

    // 초대 목록에서 제거
    party.pendingInvites = party.pendingInvites.filter(id => id !== playerId);

    this.emit('party:declined', { partyId, playerId });

    return {
      success: true,
      partyId
    };
  }

  /**
   * 파티 탈퇴
   * @param {string} playerId - 플레이어 아이디
   * @returns {Object} 탈퇴 결과
   */
  leaveParty(playerId) {
    const partyId = this.playerPartyMap.get(playerId);

    if (!partyId) {
      return {
        success: false,
        error: 'NOT_IN_PARTY',
        message: '파티에 속해 있지 않습니다.'
      };
    }

    const party = this.parties.get(partyId);
    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    // 파티장인 경우
    if (party.leaderId === playerId) {
      // 파티원이 1명인 경우: 파티 해체
      if (party.members.length === 1) {
        return this.disbandParty(partyId, playerId);
      }

      // 파티장 위임
      const nextLeader = party.members.find(id => id !== playerId);
      party.leaderId = nextLeader;

      this.emit('party:leaderChanged', { partyId, oldLeader: playerId, newLeader: nextLeader });
    }

    // 파티원 제거
    party.members = party.members.filter(id => id !== playerId);
    this.playerPartyMap.delete(playerId);

    const leftParty = { ...party };

    this.emit('party:left', { partyId, playerId, leftParty });

    return {
      success: true,
      partyId,
      leftParty
    };
  }

  /**
   * 파티원 추방
   * @param {string} partyId - 파티 아이디
   * @param {string} leaderId - 파티장 아이디
   * @param {string} targetId - 추방할 플레이어 아이디
   * @returns {Object} 추방 결과
   */
  kickPlayer(partyId, leaderId, targetId) {
    const party = this.parties.get(partyId);

    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    // 파티장 권한 확인
    if (party.leaderId !== leaderId) {
      return {
        success: false,
        error: 'NOT_LEADER',
        message: '파티장만 추방할 수 있습니다.'
      };
    }

    // 파티원인지 확인
    if (!party.members.includes(targetId)) {
      return {
        success: false,
        error: 'NOT_MEMBER',
        message: '해당 플레이어가 파티원이 아닙니다.'
      };
    }

    // 파티장은 추방 불가
    if (targetId === leaderId) {
      return {
        success: false,
        error: 'CANNOT_KICK_LEADER',
        message: '파티장은 추방할 수 없습니다.'
      };
    }

    // 파티원 제거
    party.members = party.members.filter(id => id !== targetId);
    this.playerPartyMap.delete(targetId);

    this.emit('party:kicked', { partyId, leaderId, targetId });

    return {
      success: true,
      partyId,
      targetId
    };
  }

  /**
   * 파티장 위임
   * @param {string} partyId - 파티 아이디
   * @param {string} currentLeaderId - 현재 파티장 아이디
   * @param {string} newLeaderId - 새 파티장 아이디
   * @returns {Object} 위임 결과
   */
  transferLeadership(partyId, currentLeaderId, newLeaderId) {
    const party = this.parties.get(partyId);

    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    // 현재 파티장 권한 확인
    if (party.leaderId !== currentLeaderId) {
      return {
        success: false,
        error: 'NOT_LEADER',
        message: '현재 파티장만 위임할 수 있습니다.'
      };
    }

    // 새 파티장이 파티원인지 확인
    if (!party.members.includes(newLeaderId)) {
      return {
        success: false,
        error: 'NOT_MEMBER',
        message: '해당 플레이어가 파티원이 아닙니다.'
      };
    }

    // 같은 사람에게 위임 불가
    if (currentLeaderId === newLeaderId) {
      return {
        success: false,
        error: 'SAME_PLAYER',
        message: '다른 플레이어에게 위임해야 합니다.'
      };
    }

    const oldLeaderId = party.leaderId;
    party.leaderId = newLeaderId;

    this.emit('party:leaderChanged', { partyId, oldLeader: oldLeaderId, newLeader: newLeaderId });

    return {
      success: true,
      partyId,
      oldLeader: oldLeaderId,
      newLeader: newLeaderId
    };
  }

  /**
   * 파티 해체
   * @param {string} partyId - 파티 아이디
   * @param {string} leaderId - 파티장 아이디
   * @returns {Object} 해체 결과
   */
  disbandParty(partyId, leaderId) {
    const party = this.parties.get(partyId);

    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    // 파티장 권한 확인
    if (party.leaderId !== leaderId) {
      return {
        success: false,
        error: 'NOT_LEADER',
        message: '파티장만 해체할 수 있습니다.'
      };
    }

    // 파티원 맵에서 제거
    party.members.forEach(memberId => {
      this.playerPartyMap.delete(memberId);
    });

    const disbandedParty = { ...party };
    this.parties.delete(partyId);

    this.emit('party:disbanded', { partyId, leaderId, disbandedParty });

    return {
      success: true,
      partyId,
      disbandedParty
    };
  }

  /**
   * 파티 정보 조회
   * @param {string} partyId - 파티 아이디
   * @returns {Object} 파티 정보
   */
  getPartyInfo(partyId) {
    const party = this.parties.get(partyId);

    if (!party) {
      return {
        success: false,
        error: 'PARTY_NOT_FOUND',
        message: '파티를 찾을 수 없습니다.'
      };
    }

    return {
      success: true,
      party: {
        id: party.id,
        leaderId: party.leaderId,
        members: party.members,
        memberCount: party.members.length,
        maxSize: party.maxSize,
        pendingInvites: party.pendingInvites,
        createdAt: party.createdAt
      }
    };
  }

  /**
   * 플레이어의 파티 조회
   * @param {string} playerId - 플레이어 아이디
   * @returns {Object} 파티 정보
   */
  getPlayerParty(playerId) {
    const partyId = this.playerPartyMap.get(playerId);

    if (!partyId) {
      return {
        success: false,
        error: 'NOT_IN_PARTY',
        message: '파티에 속해 있지 않습니다.'
      };
    }

    return this.getPartyInfo(partyId);
  }

  /**
   * 모든 파티 목록 조회 (디버깅용)
   * @returns {Array} 파티 목록
   */
  getAllParties() {
    const parties = [];
    this.parties.forEach((party) => {
      parties.push({
        id: party.id,
        leaderId: party.leaderId,
        members: party.members,
        memberCount: party.members.length,
        maxSize: party.maxSize,
        pendingInvites: party.pendingInvites,
        createdAt: party.createdAt
      });
    });
    return parties;
  }

  /**
   * 플레이어 접속 종료 시 정리
   * @param {string} playerId - 플레이어 아이디
   */
  handlePlayerDisconnect(playerId) {
    const partyId = this.playerPartyMap.get(playerId);
    if (!partyId) return;

    // 파티 장인지 확인
    const party = this.parties.get(partyId);
    if (party && party.leaderId === playerId) {
      // 파티장이 나가면 파티 해체
      this.disbandParty(partyId, playerId);
    } else {
      // 일반 파티원이 나가면 탈퇴 처리
      this.leaveParty(playerId);
    }
  }
}