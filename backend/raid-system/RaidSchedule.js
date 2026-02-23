/**
 * RaidSchedule - 레이드 예약 시스템
 * 시간별 레이드 개설, 리마인더, 예약 관리
 */

class RaidSchedule {
  constructor(raidManager) {
    this.raidManager = raidManager;
    this.schedules = new Map(); // In-memory cache
  }

  /**
   * 레이드 예약 생성
   * @param {Object} config - 예약 설정
   * @returns {Promise<Object>} 생성된 예약 정보
   */
  async createSchedule(config) {
    const {
      guildId,
      name,
      bossConfig,
      scheduledTime,
      maxParticipants = 10,
      levelRequirement = 0,
      reminderTime = null // 예약 시간 몇 분 전 remind (null이면 알림 없음)
    } = config;

    const scheduleId = crypto.randomUUID ? crypto.randomUUID() : `schedule_${Date.now()}`;

    const schedule = {
      scheduleId,
      guildId,
      name,
      bossConfig,
      scheduledTime,
      maxParticipants,
      levelRequirement,
      reminderTime: reminderTime || (scheduledTime - (30 * 60 * 1000)), // 기본 30분 전
      status: 'upcoming', // upcoming, reminded, started, cancelled
      participants: [],
      createdAt: Date.now()
    };

    // 메모리 캐시에 저장
    this.schedules.set(scheduleId, schedule);

    // Redis에 저장
    if (this.raidManager.redis) {
      await this.raidManager.redis.hset('raid_schedules', scheduleId, JSON.stringify(schedule));
      if (guildId) {
        await this.raidManager.redis.sadd('guild:schedules:' + guildId, scheduleId);
      }
    }

    return schedule;
  }

  /**
   * 레이드 예약에 참여
   * @param {string} scheduleId - 예약 ID
   * @param {string} characterId - 캐릭터 ID
   * @param {Object} characterData - 캐릭터 데이터
   * @returns {Promise<Object|null>} 업데이트된 예약 정보
   */
  async joinSchedule(scheduleId, characterId, characterData = {}) {
    const schedule = this.getSchedule(scheduleId);
    if (!schedule) return null;

    // 레벨 요구사항 확인
    if (schedule.levelRequirement > 0 && (characterData.level || 1) < schedule.levelRequirement) {
      return { error: 'level_requirement' };
    }

    // 이미 참여 중 확인
    if (schedule.participants.find(p => p.characterId === characterId)) {
      return { error: 'already_participating' };
    }

    // 최대 참여자 수 확인
    if (schedule.participants.length >= schedule.maxParticipants) {
      return { error: 'full' };
    }

    // 참여자 추가
    schedule.participants.push({
      characterId,
      name: characterData.name || 'Unknown',
      level: characterData.level || 1,
      class: characterData.class || 'unknown',
      joinedAt: Date.now()
    });

    // 저장
    this.schedules.set(scheduleId, schedule);
    if (this.raidManager.redis) {
      await this.raidManager.redis.hset('raid_schedules', scheduleId, JSON.stringify(schedule));
    }

    return schedule;
  }

  /**
   * 레이드 예약 참여 취소
   * @param {string} scheduleId - 예약 ID
   * @param {string} characterId - 캐릭터 ID
   * @returns {Promise<Object|null>} 업데이트된 예약 정보
   */
  async leaveSchedule(scheduleId, characterId) {
    const schedule = this.getSchedule(scheduleId);
    if (!schedule) return null;

    const index = schedule.participants.findIndex(p => p.characterId === characterId);
    if (index === -1) return null;

    schedule.participants.splice(index, 1);

    // 저장
    this.schedules.set(scheduleId, schedule);
    if (this.raidManager.redis) {
      await this.raidManager.redis.hset('raid_schedules', scheduleId, JSON.stringify(schedule));
    }

    return schedule;
  }

  /**
   * 예약 정보 조회
   * @param {string} scheduleId - 예약 ID
   * @returns {Object|null} 예약 정보
   */
  getSchedule(scheduleId) {
    let schedule = this.schedules.get(scheduleId);
    if (!schedule && this.raidManager.redis) {
      const data = this.raidManager.redis.hget('raid_schedules', scheduleId);
      if (data) {
        schedule = JSON.parse(data);
        this.schedules.set(scheduleId, schedule);
      }
    }
    return schedule || null;
  }

  /**
   * 길드의 예약 목록 조회
   * @param {string} guildId - 길드 ID
   * @returns {Array<Object>} 예약 목록
   */
  getGuildSchedules(guildId) {
    const schedules = Array.from(this.schedules.values());
    return schedules.filter(s => s.guildId === guildId);
  }

  /**
   * 다가오는 예약 목록 조회 (현재 시간 이후)
   * @returns {Array<Object>} 예약 목록
   */
  getUpcomingSchedules() {
    const now = Date.now();
    const schedules = Array.from(this.schedules.values());
    return schedules
      .filter(s => s.status === 'upcoming' && s.scheduledTime > now)
      .sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  /**
   * 예약 확인 (예약 시간이 되면 레이드 생성)
   * @returns {Promise<Array<Object>>} 생성된 레이드 목록
   */
  async checkAndStartSchedules() {
    const now = Date.now();
    const startedRaids = [];

    for (const [scheduleId, schedule] of this.schedules) {
      if (schedule.status === 'upcoming' && schedule.scheduledTime <= now) {
        // 레이드 생성
        const raid = await this.raidManager.createRaid({
          guildId: schedule.guildId,
          name: schedule.name,
          bossConfig: schedule.bossConfig,
          scheduledTime: schedule.scheduledTime,
          maxParticipants: schedule.maxParticipants,
          levelRequirement: schedule.levelRequirement
        });

        // 참여자 이동
        for (const participant of schedule.participants) {
          await this.raidManager.joinRaid(
            raid.raidId,
            participant.characterId,
            participant
          );
        }

        // 예약 상태 변경
        schedule.status = 'started';
        schedule.raidId = raid.raidId;

        // 저장
        this.schedules.set(scheduleId, schedule);
        if (this.raidManager.redis) {
          await this.raidManager.redis.hset('raid_schedules', scheduleId, JSON.stringify(schedule));
        }

        startedRaids.push(raid);
      }
    }

    return startedRaids;
  }

  /**
   * 리마인더 확인 (리마인더 시간이 되면 알림)
   * @returns {Promise<Array<Object>>} 리마인더 대상 목록
   */
  async checkReminders() {
    const now = Date.now();
    const reminders = [];

    for (const [scheduleId, schedule] of this.schedules) {
      if (schedule.status === 'upcoming' &&
          schedule.reminderTime &&
          schedule.reminderTime <= now &&
          schedule.scheduledTime > now) {

        schedule.status = 'reminded';

        // 저장
        this.schedules.set(scheduleId, schedule);
        if (this.raidManager.redis) {
          await this.raidManager.redis.hset('raid_schedules', scheduleId, JSON.stringify(schedule));
        }

        reminders.push({
          scheduleId,
          name: schedule.name,
          scheduledTime: schedule.scheduledTime,
          participants: schedule.participants,
          timeToStart: schedule.scheduledTime - now
        });
      }
    }

    return reminders;
  }

  /**
   * 예약 취소
   * @param {string} scheduleId - 예약 ID
   * @param {string} operatorId - 운영자 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async cancelSchedule(scheduleId, operatorId) {
    const schedule = this.getSchedule(scheduleId);
    if (!schedule) return false;

    // 이미 시작된 예약은 취소 불가
    if (schedule.status === 'started' || schedule.status === 'cancelled') return false;

    // (선택사항) 권한 확인: 길드장 또는 예약 생성자만 취소 가능
    // if (schedule.creatorId !== operatorId) return false;

    schedule.status = 'cancelled';
    schedule.cancelledAt = Date.now();

    // 저장
    this.schedules.set(scheduleId, schedule);
    if (this.raidManager.redis) {
      await this.raidManager.redis.hset('raid_schedules', scheduleId, JSON.stringify(schedule));
    }

    return true;
  }

  /**
   * 예약 삭제
   * @param {string} scheduleId - 예약 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async deleteSchedule(scheduleId) {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    // 완료되지 않은 예약은 삭제 불가
    if (schedule.status === 'upcoming' || schedule.status === 'reminded') return false;

    this.schedules.delete(scheduleId);
    if (this.raidManager.redis) {
      await this.raidManager.redis.hdel('raid_schedules', scheduleId);
      if (schedule.guildId) {
        await this.raidManager.redis.srem('guild:schedules:' + schedule.guildId, scheduleId);
      }
    }

    return true;
  }
}

module.exports = RaidSchedule;