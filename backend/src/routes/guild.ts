import express from 'express';

const router = express.Router();

// In-memory 길드 데이터 (실제 운영 시 DB로 대체)
interface GuildMember {
  id: string;
  name: string;
  role: 'leader' | 'officer' | 'member';
  joinedAt: Date;
}

interface Guild {
  id: string;
  name: string;
  description: string;
  level: number;
  experience: number;
  leaderId: string;
  members: GuildMember[];
  createdAt: Date;
}

const guilds: Map<string, Guild> = new Map();
let guildIdCounter = 1;

// 테스트용 초기화 함수
export function resetGuilds() {
  guilds.clear();
  guildIdCounter = 1;
}

/**
 * GET /api/guilds
 * 모든 길드 목록 조회
 */
router.get('/', (req, res) => {
  const guildList = Array.from(guilds.values()).map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    level: g.level,
    memberCount: g.members.length,
    createdAt: g.createdAt,
  }));
  res.json(guildList);
});

/**
 * GET /api/guilds/:id
 * 특정 길드 정보 조회
 */
router.get('/:id', (req, res) => {
  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  res.json(guild);
});

/**
 * POST /api/guilds
 * 길드 생성
 */
router.post('/', (req, res) => {
  const { name, description, leaderId, leaderName } = req.body;

  if (!name || !leaderId || !leaderName) {
    return res.status(400).json({ error: 'Name, leaderId, and leaderName are required' });
  }

  // 길드 이름 중복 체크
  const nameExists = Array.from(guilds.values()).some(g => g.name === name);
  if (nameExists) {
    return res.status(409).json({ error: 'Guild name already exists' });
  }

  const guildId = guildIdCounter++;
  const guild: Guild = {
    id: String(guildId),
    name,
    description: description || '',
    level: 1,
    experience: 0,
    leaderId,
    members: [
      {
        id: leaderId,
        name: leaderName,
        role: 'leader',
        joinedAt: new Date(),
      },
    ],
    createdAt: new Date(),
  };

  guilds.set(guildId.toString(), guild);

  res.status(201).json(guild);
});

/**
 *PUT /api/guilds/:id
 * 길드 정보 수정 (리더만 가능)
 */
router.put('/:id', (req, res) => {
  const { name, description, requesterId } = req.body;

  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  // 리더 권한 체크
  if (guild.leaderId !== requesterId) {
    return res.status(403).json({ error: 'Only guild leader can update guild info' });
  }

  // 이름 중복 체크 (수정 시)
  if (name && name !== guild.name) {
    const nameExists = Array.from(guilds.values()).some(g => g.name === name && g.id !== guild.id);
    if (nameExists) {
      return res.status(409).json({ error: 'Guild name already exists' });
    }
  }

  if (name) guild.name = name;
  if (description !== undefined) guild.description = description;

  res.json(guild);
});

/**
 * DELETE /api/guilds/:id
 * 길드 해체 (리더만 가능)
 */
router.delete('/:id', (req, res) => {
  const { requesterId } = req.body;

  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  // 리더 권한 체크
  if (guild.leaderId !== requesterId) {
    return res.status(403).json({ error: 'Only guild leader can disband guild' });
  }

  guilds.delete(req.params.id);
  res.json({ message: 'Guild disbanded successfully' });
});

/**
 * POST /api/guilds/:id/join
 * 길드 가입 신청
 */
router.post('/:id/join', (req, res) => {
  const { playerId, playerName } = req.body;

  if (!playerId || !playerName) {
    return res.status(400).json({ error: 'PlayerId and playerName are required' });
  }

  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  // 이미 길드에 있는지 체크
  const existingMember = guild.members.find(m => m.id === playerId);
  if (existingMember) {
    return res.status(409).json({ error: 'Player is already a member of this guild' });
  }

  const newMember: GuildMember = {
    id: playerId,
    name: playerName,
    role: 'member',
    joinedAt: new Date(),
  };

  guild.members.push(newMember);

  res.json(guild);
});

/**
 * DELETE /api/guilds/:id/leave
 * 길드 탈퇴
 */
router.delete('/:id/leave', (req, res) => {
  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'PlayerId is required' });
  }

  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  // 리더는 탈퇴 불가 (길드 해체 후 가능)
  if (guild.leaderId === playerId) {
    return res.status(403).json({ error: 'Guild leader cannot leave. Disband the guild instead' });
  }

  const memberIndex = guild.members.findIndex(m => m.id === playerId);

  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Player is not a member of this guild' });
  }

  guild.members.splice(memberIndex, 1);

  res.json(guild);
});

/**
 * PUT /api/guilds/:id/members/:memberId/role
 * 멤버 역할 변경 (리더만 가능)
 */
router.put('/:id/members/:memberId/role', (req, res) => {
  const { requesterId, role } = req.body;

  if (!requesterId || !role) {
    return res.status(400).json({ error: 'RequesterId and role are required' });
  }

  if (!['leader', 'officer', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Role must be one of: leader, officer, member' });
  }

  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  // 리더 권한 체크
  if (guild.leaderId !== requesterId) {
    return res.status(403).json({ error: 'Only guild leader can change member roles' });
  }

  const member = guild.members.find(m => m.id === req.params.memberId);

  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // 리더 역할을 다른 사람에게 넘길 때
  if (role === 'leader' && member.id !== guild.leaderId) {
    // 이전 리더를 officer로 변경
    const oldLeader = guild.members.find(m => m.id === guild.leaderId);
    if (oldLeader) {
      oldLeader.role = 'officer';
    }
    guild.leaderId = member.id;
  }

  member.role = role;

  res.json(guild);
});

/**
 * DELETE /api/guilds/:id/members/:memberId
 * 멤버 추방 (리더 & officer만 가능)
 */
router.delete('/:id/members/:memberId', (req, res) => {
  const { requesterId } = req.body;

  if (!requesterId) {
    return res.status(400).json({ error: 'RequesterId is required' });
  }

  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  // 권한 체크 (leader 또는 officer)
  const requester = guild.members.find(m => m.id === requesterId);
  if (!requester || (requester.role !== 'leader' && requester.role !== 'officer')) {
    return res.status(403).json({ error: 'Only guild leader or officer can kick members' });
  }

  // 리더는 추방 불가
  if (guild.leaderId === req.params.memberId) {
    return res.status(403).json({ error: 'Guild leader cannot be kicked' });
  }

  const memberIndex = guild.members.findIndex(m => m.id === req.params.memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // officer는 officer 추방 불가
  const targetMember = guild.members[memberIndex];
  if (requester.role === 'officer' && targetMember.role === 'officer') {
    return res.status(403).json({ error: 'Officer cannot kick another officer' });
  }

  guild.members.splice(memberIndex, 1);

  res.json(guild);
});

/**
 * POST /api/guilds/:id/experience
 * 길드 경험치 획득
 */
router.post('/:id/experience', (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  const guild = guilds.get(req.params.id);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }

  guild.experience += amount;

  // 레벨업: 각 레벨마다 100 * 레벨 경험치 필요
  const expRequired = guild.level * 100;
  if (guild.experience >= expRequired) {
    guild.experience -= expRequired;
    guild.level += 1;
  }

  res.json(guild);
});

export default router;