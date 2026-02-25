/**
 * RaidManager - 레이드 인스턴스 관리
 * 레이드 생성/진행/완료, 레이드 스케줄링
 */

import { v4 as uuidv4 } from 'uuid';

export default class RaidManager {
  constructor(redisClient, guildManager) {
    this.redis = redisClient;
    this.guildManager = guildManager;
    this.raids = new Map(); // In-memory cache
  }

  /**
   * 레이드 생성
   * @param {Object} config - 레이드 설정
   * @returns {Promise<Object>} 생성된 레이드 정보
   */
  async createRaid(config) {
    const {
      guildId,
      name,
      bossConfig,
      scheduledTime = null,
      maxParticipants = 10,
      levelRequirement = 0
    } = config;

    const raidId = uuidv4();
    const raid = {
      raidId,
      guildId,
      name,
      bossConfig,
      scheduledTime,
      maxParticipants,
      levelRequirement,
      status: scheduledTime ? 'scheduled' : 'waiting',
      participants: [],
      currentPhase: 0,
      combatLog: [],
      startTime: null,
      endTime: null,
      rewardsDistributed: false,
      createdAt: Date.now()
    };

    // 메모리 캐시에 저장
    this.raids.set(raidId, raid);

    // Redis에 저장
    if (this.redis) {
      await this.redis.hset('raids', raidId, JSON.stringify(raid));
      if (guildId) {
        await this.redis.sadd('guild:raids:' + guildId, raidId);
      }
    }

    return raid;
  }

  /**
   * 레이드 시작
   * @param {string} raidId - 레이드 ID
   * @param {string} characterId - 시작 요청 캐릭터 ID
   * @returns {Promise<Object|null>} 업데이트된 레이드 정보
   */
  async startRaid(raidId, characterId) {
    const raid = this.getRaid(raidId);
    if (!raid) return null;

    // 권한 확인 (길드장 또는 부길드장)
    const guild = this.guildManager.getGuild(raid.guildId);
    if (!guild) return null;

    // guild.members null check 추가
    if (!guild.members || guild.members.length === 0) return null;

    const member = guild.members.find(m => m.characterId === characterId);
    if (!member) return null;

    const role = guild.roles.find(r => r.roleId === member.roleId);
    if (!role || (!role.permissions.canManageRaids && guild.masterId !== characterId)) return null;

    // 참여자 수 확인
    if (raid.participants.length === 0) return null;

    raid.status = 'in_progress';
    raid.startTime = Date.now();
    raid.currentPhase = 1;

    // 저장
    this.raids.set(raidId, raid);
    if (this.redis) {
      await this.redis.hset('raids', raidId, JSON.stringify(raid));
    }

    return raid;
  }

  /**
   * 레이드 참여
   * @param {string} raidId - 레이드 ID
   * @param {string} characterId - 캐릭터 ID
   * @param {Object} characterData - 캐릭터 데이터 (레벨, 클래스 등)
   * @returns {Promise<Object|null>} 업데이트된 레이드 정보
   */
  async joinRaid(raidId, characterId, characterData = {}) {
    const raid = this.getRaid(raidId);
    if (!raid) return null;

    // 레벨 요구사항 확인
    if (raid.levelRequirement > 0 && (characterData.level || 1) < raid.levelRequirement) {
      return { error: 'level_requirement' };
    }

    // 이미 참여 중 확인
    if (raid.participants.find(p => p.characterId === characterId)) {
      return { error: 'already_participating' };
    }

    // 최대 참여자 수 확인
    if (raid.participants.length >= raid.maxParticipants) {
      return { error: 'full' };
    }

    // 참여자 추가
    raid.participants.push({
      characterId,
      name: characterData.name || 'Unknown',
      level: characterData.level || 1,
      damage: 0,
      deaths: 0,
      joinedAt: Date.now()
    });

    // 저장
    this.raids.set(raidId, raid);
    if (this.redis) {
      await this.redis.hset('raids', raidId, JSON.stringify(raid));
    }

    return raid;
  }

  /**
   * 레이드 참여 취소
   * @param {string} raidId - 레이드 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Object|null>} 업데이트된 레이드 정보
   */
  async leaveRaid(raidId, characterId) {
    const raid = this.getRaid(raidId);
    if (!raid) return null;

    // 진행 중에는 나갈 수 없음
    if (raid.status === 'in_progress') return null;

    const index = raid.participants.findIndex(p => p.characterId === characterId);
    if (index === -1) return null;

    raid.participants.splice(index, 1);

    // 저장
    this.raids.set(raidId, raid);
    if (this.redis) {
      await this.redis.hset('raids', raidId, JSON.stringify(raid));
    }

    return raid;
  }

  /**
   * 레이드 완료
   * @param {string} raidId - 레이드 ID
   * @param {boolean} success - 성공 여부
   * @returns {Promise<Object|null>} 업데이트된 레이드 정보
   */
  async completeRaid(raidId, success) {
    const raid = this.getRaid(raidId);
    if (!raid) return null;

    raid.status = success ? 'completed' : 'failed';
    raid.endTime = Date.now();

    // 저장
    this.raids.set(raidId, raid);
    if (this.redis) {
      await this.redis.hset('raids', raidId, JSON.stringify(raid));
    }

    return raid;
  }

  /**
   * 레이드 정보 조회
   * @param {string} raidId - 레이드 ID
   * @returns {Object|null} 레이드 정보
   */
  getRaid(raidId) {
    let raid = this.raids.get(raidId);
    if (!raid && this.redis) {
      const data = this.redis.hget('raids', raidId);
      if (data) {
        raid = JSON.parse(data);
        this.raids.set(raidId, raid);
      }
    }
    return raid || null;
  }

  /**
   * 길드의 레이드 목록 조회
   * @param {string} guildId - 길드 ID
   * @returns {Array<Object>} 레이드 목록
   */
  getGuildRaids(guildId) {
    const raids = Array.from(this.raids.values());
    return raids.filter(r => r.guildId === guildId);
  }

  /**
   * 참여 가능한 레이드 목록 조회
   * @returns {Array<Object>} 레이드 목록
   */
  getAvailableRaids() {
    const raids = Array.from(this.raids.values());
    return raids.filter(r => r.status === 'waiting' && r.participants.length < r.maxParticipants);
  }

  /**
   * 레이드 삭제
   * @param {string} raidId - 레이드 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async deleteRaid(raidId) {
    const raid = this.raids.get(raidId);
    if (!raid) return false;

    // 진행 중인 레이드는 삭제 불가
    if (raid.status === 'in_progress') return false;

    this.raids.delete(raidId);
    if (this.redis) {
      await this.redis.hdel('raids', raidId);
      if (raid.guildId) {
        await this.redis.srem('guild:raids:' + raid.guildId, raidId);
      }
    }

    return true;
  }

  /**
   * 대기 중인 스케줄된 레이드 시작
   * @returns {Promise<number>} 시작된 레이드 수
   */
  async startScheduledRaids() {
    const now = Date.now();
    let startedCount = 0;

    for (const [raidId, raid] of this.raids) {
      if (raid.status === 'scheduled' && raid.scheduledTime && raid.scheduledTime <= now) {
        if (raid.participants.length > 0) {
          await this.startRaid(raidId, raid.guildId); // 길드 ID로 권한 체크 (임시)
          startedCount++;
        }
      }
    }

    return startedCount;
  }
}