import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import guildRouter, { resetGuilds } from '../src/routes/guild.ts';
import guildChatRouter, { resetGuildChats } from '../src/routes/guildChat.ts';

// 테스트용 Express 앱 설정
const app = express();
app.use(express.json());
app.use('/api/guilds', guildRouter);
app.use('/api/guild-chat', guildChatRouter);

describe('Guild System API', () => {
  let createdGuildId;
  let leaderId = 'test-leader-1';
  let leaderName = '테스트장';
  let memberId = 'test-member-1';
  let memberName = '테스트멤버';

  beforeEach(() => {
    // 각 테스트 전에 길드 데이터 초기화
    createdGuildId = null;
    resetGuilds();
    resetGuildChats();
  });

  describe('길드 CRUD', () => {
    it('POST /api/guilds - 길드 생성', async () => {
      const response = await request(app)
        .post('/api/guilds')
        .send({
          name: '테스트길드',
          description: '테스트용 길드입니다',
          leaderId,
          leaderName,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('테스트길드');
      expect(response.body.description).toBe('테스트용 길드입니다');
      expect(response.body.leaderId).toBe(leaderId);
      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].id).toBe(leaderId);
      expect(response.body.members[0].role).toBe('leader');

      createdGuildId = response.body.id;
    });

    it('POST /api/guilds - 길드 이름 중복 시 409 반환', async () => {
      // 첫 번째 길드 생성
      await request(app)
        .post('/api/guilds')
        .send({
          name: '중복길드',
          leaderId: 'test-user-1',
          leaderName: '유저1',
        });

      // 동일 이름으로 길드 생성 시도
      const response = await request(app)
        .post('/api/guilds')
        .send({
          name: '중복길드',
          leaderId: 'test-user-2',
          leaderName: '유저2',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Guild name already exists');
    });

    it('GET /api/guilds - 길드 목록 조회', async () => {
      // 길드 생성
      await request(app)
        .post('/api/guilds')
        .send({
          name: '목록테스트길드',
          leaderId: 'test-list-user',
          leaderName: '리스트유저',
        });

      const response = await request(app).get('/api/guilds');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /api/guilds/:id - 특정 길드 조회', async () => {
      // 길드 생성
      const createResponse = await request(app)
        .post('/api/guilds')
        .send({
          name: '조회테스트길드',
          leaderId,
          leaderName,
        });

      const guildId = createResponse.body.id;

      const response = await request(app).get(`/api/guilds/${guildId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(guildId);
      expect(response.body.name).toBe('조회테스트길드');
    });

    it('GET /api/guilds/:id - 존재하지 않는 길드 조회 시 404 반환', async () => {
      const response = await request(app).get('/api/guilds/99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Guild not found');
    });

    it('PUT /api/guilds/:id - 길드 정보 수정 (리더만 가능)', async () => {
      // 길드 생성
      const createResponse = await request(app)
        .post('/api/guilds')
        .send({
          name: '수정테스트길드',
          description: '변경 전 설명',
          leaderId,
          leaderName,
        });

      const guildId = createResponse.body.id;

      // 리더로 수정
      const response = await request(app)
        .put(`/api/guilds/${guildId}`)
        .send({
          name: '수정된길드',
          description: '변경 후 설명',
          requesterId: leaderId,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('수정된길드');
      expect(response.body.description).toBe('변경 후 설명');
    });

    it('PUT /api/guilds/:id - 리더가 아닌 사람이 수정 시 403 반환', async () => {
      // 길드 생성
      const createResponse = await request(app)
        .post('/api/guilds')
        .send({
          name: '권한테스트길드',
          leaderId,
          leaderName,
        });

      const guildId = createResponse.body.id;

      // 멤버로 수정 시도
      const response = await request(app)
        .put(`/api/guilds/${guildId}`)
        .send({
          name: '무단수정',
          requesterId: 'other-user',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Only guild leader can update guild info');
    });

    it('DELETE /api/guilds/:id - 길드 해체 (리더만 가능)', async () => {
      // 길드 생성
      const createResponse = await request(app)
        .post('/api/guilds')
        .send({
          name: '해체테스트길드',
          leaderId,
          leaderName,
        });

      const guildId = createResponse.body.id;

      // 리더로 해체
      const response = await request(app)
        .delete(`/api/guilds/${guildId}`)
        .send({ requesterId: leaderId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Guild disbanded successfully');

      // 해체 후 조회 시 404 확인
      const getResponse = await request(app).get(`/api/guilds/${guildId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('길드 멤버 관리', () => {
    let guildId;

    beforeEach(async () => {
      // 길드 생성
      const createResponse = await request(app)
        .post('/api/guilds')
        .send({
          name: '멤버테스트길드',
          leaderId,
          leaderName,
        });
      guildId = createResponse.body.id;
    });

    it('POST /api/guilds/:id/join - 길드 가입', async () => {
      const response = await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: memberId,
          playerName: memberName,
        });

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(2);
      expect(response.body.members[1].id).toBe(memberId);
      expect(response.body.members[1].role).toBe('member');
    });

    it('POST /api/guilds/:id/join - 이미 멤버인 경우 409 반환', async () => {
      // 첫 번째 가입
      await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: memberId,
          playerName: memberName,
        });

      // 두 번째 가입 시도
      const response = await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: memberId,
          playerName: memberName,
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Player is already a member of this guild');
    });

    it('DELETE /api/guilds/:id/leave - 길드 탈퇴', async () => {
      // 멤버 가입
      await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: memberId,
          playerName: memberName,
        });

      // 탈퇴
      const response = await request(app)
        .delete(`/api/guilds/${guildId}/leave`)
        .send({ playerId: memberId });

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(1);
    });

    it('DELETE /api/guilds/:id/leave - 리더는 탈퇴 불가', async () => {
      const response = await request(app)
        .delete(`/api/guilds/${guildId}/leave`)
        .send({ playerId: leaderId });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Guild leader cannot leave');
    });

    it('PUT /api/guilds/:id/members/:memberId/role - 멤버 역할 변경', async () => {
      // 멤버 가입
      await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: memberId,
          playerName: memberName,
        });

      // 임원으로 승급
      const response = await request(app)
        .put(`/api/guilds/${guildId}/members/${memberId}/role`)
        .send({
          requesterId: leaderId,
          role: 'officer',
        });

      expect(response.status).toBe(200);
      const updatedMember = response.body.members.find(m => m.id === memberId);
      expect(updatedMember.role).toBe('officer');
    });

    it('DELETE /api/guilds/:id/members/:memberId - 멤버 추방', async () => {
      // 멤버 가입
      await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: memberId,
          playerName: memberName,
        });

      // 추방
      const response = await request(app)
        .delete(`/api/guilds/${guildId}/members/${memberId}`)
        .send({ requesterId: leaderId });

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(1);
    });

    it('DELETE /api/guilds/:id/members/:memberId - 일반 멤버는 추방 불가', async () => {
      // 멤버 가입
      await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: memberId,
          playerName: memberName,
        });

      // 추가 멤버 가입
      await request(app)
        .post(`/api/guilds/${guildId}/join`)
        .send({
          playerId: 'test-member-2',
          playerName: '멤버2',
        });

      // 일반 멤버가 추방 시도
      const response = await request(app)
        .delete(`/api/guilds/${guildId}/members/test-member-2`)
        .send({ requesterId: memberId });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Only guild leader or officer can kick members');
    });
  });

  describe('길드 경험치 & 레벨업', () => {
    let guildId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/guilds')
        .send({
          name: '경험치테스트길드',
          leaderId,
          leaderName,
        });
      guildId = createResponse.body.id;
    });

    it('POST /api/guilds/:id/experience - 경험치 획득', async () => {
      const response = await request(app)
        .post(`/api/guilds/${guildId}/experience`)
        .send({ amount: 50 });

      expect(response.status).toBe(200);
      expect(response.body.experience).toBe(50);
      expect(response.body.level).toBe(1); // 레벨 1 → 2는 100 경험치 필요
    });

    it('POST /api/guilds/:id/experience - 경험치 100 획득 시 레벨업', async () => {
      const response = await request(app)
        .post(`/api/guilds/${guildId}/experience`)
        .send({ amount: 100 });

      expect(response.status).toBe(200);
      expect(response.body.level).toBe(2); // 레벨 1 → 2
      expect(response.body.experience).toBe(0); // 사용된 경험치 초기화
    });

    it('POST /api/guilds/:id/experience - 경험치 200 획득 시 레벨 2, 경험치 100', async () => {
      const response = await request(app)
        .post(`/api/guilds/${guildId}/experience`)
        .send({ amount: 200 }); // 100 (Lv.1→2) + 100 남음

      expect(response.status).toBe(200);
      expect(response.body.level).toBe(2);
      expect(response.body.experience).toBe(100); // 200 - 100 = 100
    });

    it('POST /api/guilds/:id/experience - 경험치 0 또는 음수 시 400 반환', async () => {
      const response = await request(app)
        .post(`/api/guilds/${guildId}/experience`)
        .send({ amount: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Amount must be positive');
    });
  });

  describe('길드 채팅', () => {
    let guildId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/guilds')
        .send({
          name: '채팅테스트길드',
          leaderId,
          leaderName,
        });
      guildId = createResponse.body.id;
    });

    it('POST /api/guild-chat - 채팅 메시지 전송', async () => {
      const response = await request(app)
        .post('/api/guild-chat')
        .send({
          guildId,
          senderId: leaderId,
          senderName: leaderName,
          senderRole: 'leader',
          content: '안녕하세요!',
          type: 'normal',
        });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('안녕하세요!');
      expect(response.body.senderId).toBe(leaderId);
      expect(response.body.type).toBe('normal');
    });

    it('GET /api/guild-chat/:guildId - 길드 채팅 조회', async () => {
      // 메시지 전송
      await request(app)
        .post('/api/guild-chat')
        .send({
          guildId,
          senderId: leaderId,
          senderName: leaderName,
          content: '첫 번째 메시지',
        });

      const response = await request(app).get(`/api/guild-chat/${guildId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].content).toBe('첫 번째 메시지');
    });

    it('POST /api/guild-chat - 공지사항 전송', async () => {
      const response = await request(app)
        .post('/api/guild-chat')
        .send({
          guildId,
          senderId: leaderId,
          senderName: leaderName,
          content: '공지: 이번 주 길드 레이드 있습니다',
          type: 'notice',
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('notice');
    });

    it('DELETE /api/guild-chat/:guildId - 길드 채팅 전체 삭제', async () => {
      // 메시지 전송
      await request(app)
        .post('/api/guild-chat')
        .send({
          guildId,
          senderId: leaderId,
          senderName: leaderName,
          content: '삭제될 메시지',
        });

      // 전체 삭제
      const response = await request(app).delete(`/api/guild-chat/${guildId}`);

      expect(response.status).toBe(200);

      // 삭제 후 조회
      const getResponse = await request(app).get(`/api/guild-chat/${guildId}`);
      expect(getResponse.body).toHaveLength(0);
    });

    it('GET /api/guild-chat/:guildId/since/:timestamp - 특정 시간 이후 메시지 조회', async () => {
      // 메시지 전송
      await request(app)
        .post('/api/guild-chat')
        .send({
          guildId,
          senderId: leaderId,
          senderName: leaderName,
          content: '과거 메시지',
        });

      const timestamp = new Date().toISOString();

      // 새 메시지 전송
      await request(app)
        .post('/api/guild-chat')
        .send({
          guildId,
          senderId: leaderId,
          senderName: leaderName,
          content: '새 메시지',
        });

      const response = await request(app).get(`/api/guild-chat/${guildId}/since/${timestamp}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // timestamp 이후의 메시지만 포함
      response.body.forEach(msg => {
        expect(new Date(msg.timestamp).getTime()).toBeGreaterThan(new Date(timestamp).getTime());
      });
    });

    it('POST /api/guild-chat - 잘못된 타입 시 400 반환', async () => {
      const response = await request(app)
        .post('/api/guild-chat')
        .send({
          guildId,
          senderId: leaderId,
          senderName: leaderName,
          content: '테스트',
          type: 'invalid', // 잘못된 타입
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Type must be one of: normal, system, notice');
    });
  });
});