/**
 * Database System - 통합
 */

export { initDatabase, getDB, closeDB } from './init.js'
export {
  saveChatLog,
  getChatLogsByRoom,
  getChatLogsByCharacter,
  getAIChatLogs,
  getChatLogStats,
  cleanupOldLogs
} from './chat-log-manager.js'
export {
  initAIRelationship,
  incrementConversation,
  updateAffinity,
  getRelationship,
  getAllRelationships,
  addCommonTopic,
  updateMood,
  getRelationshipStats
} from './ai-relationship-manager.js'
export {
  initCharacterTable,
  updateCharacterPosition,
  upsertCharacter,
  getCharacter,
  getAllCharacters,
  getCharactersByRoom,
  deleteCharacter
} from './character-manager.js'