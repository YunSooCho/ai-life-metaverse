import express from 'express';

const router = express.Router();

interface GuildMessage {
  id: string;
  guildId: string;
  senderId: string;
  senderName: string;
  senderRole: 'leader' | 'officer' | 'member';
  content: string;
  timestamp: Date;
  type: 'normal' | 'system' | 'notice';
}

// 길드 채팅 메시지 저장 (길드 ID → 메시지 배열)
const guildChats: Map<string, GuildMessage[]> = new Map();
const MAX_MESSAGES = 100; // 길드당 최대 100개 메시지 저장

// 테스트용 초기화 함수
export function resetGuildChats() {
  guildChats.clear();
}

/**
 * GET /api/guild-chat/:guildId
 * 길드 채팅 메시지 조회
 */
router.get('/:guildId', (req, res) => {
  const { guildId } = req.params;

  if (!guildChats.has(guildId)) {
    return res.json([]);
  }

  const messages = guildChats.get(guildId) || [];
  res.json(messages);
});

/**
 * POST /api/guild-chat
 * 길드 채팅 메시지 전송
 */
router.post('/', (req, res) => {
  const { guildId, senderId, senderName, senderRole, content, type } = req.body;

  if (!guildId || !senderId || !senderName || !content) {
    return res.status(400).json({ error: 'guildId, senderId, senderName, and content are required' });
  }

  const messageType: GuildMessage['type'] = type || 'normal';

  if (!['normal', 'system', 'notice'].includes(messageType)) {
    return res.status(400).json({ error: 'Type must be one of: normal, system, notice' });
  }

  if (!guildChats.has(guildId)) {
    guildChats.set(guildId, []);
  }

  const newMessage: GuildMessage = {
    id: `${guildId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    guildId,
    senderId,
    senderName,
    senderRole: senderRole || 'member',
    content,
    timestamp: new Date(),
    type: messageType,
  };

  const messages = guildChats.get(guildId)!;
  messages.push(newMessage);

  // 메시지 제한
  if (messages.length > MAX_MESSAGES) {
    messages.shift();
  }

  res.status(201).json(newMessage);
});

/**
 * GET /api/guild-chat/:guildId/since/:timestamp
 * 특정 시간 이후의 메시지 조회
 */
router.get('/:guildId/since/:timestamp', (req, res) => {
  const { guildId, timestamp } = req.params;

  if (!guildChats.has(guildId)) {
    return res.json([]);
  }

  const since = new Date(timestamp);
  const messages = guildChats.get(guildId) || [];
  const filteredMessages = messages.filter(m => m.timestamp > since);

  res.json(filteredMessages);
});

/**
 * DELETE /api/guild-chat/:guildId
 * 길드 채팅 전체 삭제 (길드 해체 시)
 */
router.delete('/:guildId', (req, res) => {
  guildChats.delete(req.params.guildId);
  res.json({ message: 'Guild chat deleted' });
});

export default router;