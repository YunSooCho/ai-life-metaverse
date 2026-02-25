import { getRedisClient, isRedisEnabled } from './utils/redis-client.js'
import { getInventory } from './inventory.js'
import { getPlayerQuests } from './quest.js'

// TTL 설정 (초 단위)
const TTL = {
  SHORT: 300,    // 5분
  MEDIUM: 3600,  // 1시간
  LONG: 86400,   // 1일
  WEEK: 604800   // 1주일
}

/**
 * Redis에 데이터 저장
 * @param {string} key - Redis Key
 * @param {any} value - 저장할 데이터 (JSON 직렬화)
 * @param {number} ttl - TTL (초 단위)
 * @returns {Promise<boolean>} 저장 성공 여부
 */
async function setRedis(key, value, ttl = TTL.MEDIUM) {
  if (!isRedisEnabled()) return false

  try {
    const client = getRedisClient()
    const serialized = JSON.stringify(value)
    
    if (ttl > 0) {
      await client.setEx(key, ttl, serialized)
    } else {
      await client.set(key, serialized)
    }
    
    return true
  } catch (error) {
    console.error(`❌ Redis 저장 실패 (${key}):`, error.message)
    return false
  }
}

/**
 * Redis에서 데이터 조회
 * @param {string} key - Redis Key
 * @returns {Promise<any|null>} 조회된 데이터
 */
async function getRedis(key) {
  if (!isRedisEnabled()) return null

  try {
    const client = getRedisClient()
    const serialized = await client.get(key)
    
    if (!serialized) return null
    
    return JSON.parse(serialized)
  } catch (error) {
    console.error(`❌ Redis 조회 실패 (${key}):`, error.message)
    return null
  }
}

/**
 * Redis에서 데이터 삭제
 * @param {string} key - Redis Key
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function deleteRedis(key) {
  if (!isRedisEnabled()) return false

  try {
    const client = getRedisClient()
    await client.del(key)
    return true
  } catch (error) {
    console.error(`❌ Redis 삭제 실패 (${key}):`, error.message)
    return false
  }
}

// ===== 캐릭터 데이터 영속화 =====

/**
 * 캐릭터 데이터 저장
 * @param {Object} character - 캐릭터 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveCharacter(character) {
  if (!character || !character.id) return false
  
  const key = `character:${character.id}`
  return await setRedis(key, character, TTL.LONG)
}

/**
 * 캐릭터 데이터 조회
 * @param {string} characterId - 캐릭터 ID
 * @returns {Promise<Object|null>} 캐릭터 데이터
 */
export async function loadCharacter(characterId) {
  const key = `character:${characterId}`
  return await getRedis(key)
}

// ===== 인벤토리 데이터 영속화 =====

/**
 * 인벤토리 데이터 저장
 * @param {string} characterId - 캐릭터 ID
 * @param {Object} inventory - 인벤토리 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveInventory(characterId, inventory) {
  if (!characterId) return false
  
  const key = `inventory:${characterId}`
  return await setRedis(key, inventory, TTL.LONG)
}

/**
 * 인벤토리 데이터 조회
 * @param {string} characterId - 캐릭터 ID
 * @returns {Promise<Object|null>} 인벤토리 데이터
 */
export async function loadInventory(characterId) {
  const key = `inventory:${characterId}`
  return await getRedis(key)
}

// ===== 호감도 데이터 영속화 =====

/**
 * 호감도 데이터 저장
 * @param {string} roomId - 방 ID
 * @param {Object} affinities - 호감도 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveAffinities(roomId, affinities) {
  if (!roomId) return false
  
  const key = `affinities:${roomId}`
  return await setRedis(key, affinities, TTL.LONG)
}

/**
 * 호감도 데이터 조회
 * @param {string} roomId - 방 ID
 * @returns {Promise<Object|null>} 호감도 데이터
 */
export async function loadAffinities(roomId) {
  const key = `affinities:${roomId}`
  return await getRedis(key)
}

// ===== 퀘스트 데이터 영속화 =====

/**
 * 퀘스트 데이터 저장
 * @param {string} characterId - 캐릭터 ID
 * @param {Object} quests - 퀘스트 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveQuests(characterId, quests) {
  if (!characterId) return false
  
  const key = `quests:${characterId}`
  return await setRedis(key, quests, TTL.LONG)
}

/**
 * 퀘스트 데이터 조회
 * @param {string} characterId - 캐릭터 ID
 * @returns {Promise<Object|null>} 퀘스트 데이터
 */
export async function loadQuests(characterId) {
  const key = `quests:${characterId}`
  return await getRedis(key)
}

// ===== 채팅 히스토리 영속화 =====

/**
 * 채팅 히스토리 저장
 * @param {string} roomId - 방 ID
 * @param {Array} chatHistory - 채팅 히스토리
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveChatHistory(roomId, chatHistory) {
  if (!roomId) return false
  
  const key = `chat:${roomId}`
  return await setRedis(key, chatHistory, TTL.WEEK)
}

/**
 * 채팅 히스토리 조회
 * @param {string} roomId - 방 ID
 * @returns {Promise<Array|null>} 채팅 히스토리
 */
export async function loadChatHistory(roomId) {
  const key = `chat:${roomId}`
  return await getRedis(key)
}

// ===== 방 데이터 영속화 =====

/**
 * 방 데이터 저장
 * @param {Object} room - 방 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveRoom(room) {
  if (!room || !room.id) return false
  
  const key = `room:${room.id}`
  return await setRedis(key, room, TTL.LONG)
}

/**
 * 방 데이터 조회
 * @param {string} roomId - 방 ID
 * @returns {Promise<Object|null>} 방 데이터
 */
export async function loadRoom(roomId) {
  const key = `room:${roomId}`
  return await getRedis(key)
}

// ===== 통합 저장/로드 =====

/**
 * 캐릭터 관련 모든 데이터 저장
 * @param {string} characterId - 캐릭터 ID
 * @param {string} roomId - 방 ID
 * @returns {Promise<Object>} 저장 결과
 */
export async function saveCharacterData(characterId, roomId) {
  const results = {
    character: false,
    inventory: false,
    quests: false
  }

  // 인벤토리 저장
  try {
    const inventory = getInventory(characterId)
    results.inventory = await saveInventory(characterId, inventory)
  } catch (error) {
    console.error('❌ 인벤토리 저장 실패:', error.message)
  }

  // 퀘스트 저장
  try {
    const quests = getPlayerQuests(characterId)
    results.quests = await saveQuests(characterId, quests)
  } catch (error) {
    console.error('❌ 퀘스트 저장 실패:', error.message)
  }

  return results
}

/**
 * 캐릭터 관련 모든 데이터 로드
 * @param {string} characterId - 캐릭터 ID
 * @returns {Promise<Object>} 로드된 데이터
 */
export async function loadCharacterData(characterId) {
  return {
    character: await loadCharacter(characterId),
    inventory: await loadInventory(characterId),
    quests: await loadQuests(characterId)
  }
}

/**
 * 방 관련 모든 데이터 저장
 * @param {string} roomId - 방 ID
 * @param {Object} roomData - 방 데이터
 * @returns {Promise<Object>} 저장 결과
 */
export async function saveRoomData(roomId, roomData) {
  const { characters, chatHistory, affinities } = roomData

  return {
    room: await saveRoom({ id: roomId, characters }),
    chatHistory: await saveChatHistory(roomId, chatHistory),
    affinities: await saveAffinities(roomId, affinities || {})
  }
}

/**
 * 방 관련 모든 데이터 로드
 * @param {string} roomId - 방 ID
 * @returns {Promise<Object>} 로드된 데이터
 */
export async function loadRoomData(roomId) {
  return {
    room: await loadRoom(roomId),
    chatHistory: await loadChatHistory(roomId) || [],
    affinities: await loadAffinities(roomId) || {}
  }
}

// ===== 데이터 초기화 =====

/**
 * 캐릭터 모든 데이터 삭제
 * @param {string} characterId - 캐릭터 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteCharacterData(characterId) {
  if (!isRedisEnabled()) return false

  try {
    const client = getRedisClient()
    
    // 캐릭터, 인벤토리, 퀘스트 삭제
    await Promise.all([
      client.del(`character:${characterId}`),
      client.del(`inventory:${characterId}`),
      client.del(`quests:${characterId}`)
    ])
    
    return true
  } catch (error) {
    console.error('❌ 캐릭터 데이터 삭제 실패:', error.message)
    return false
  }
}

/**
 * 방 모든 데이터 삭제
 * @param {string} roomId - 방 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function deleteRoomData(roomId) {
  if (!isRedisEnabled()) return false

  try {
    const client = getRedisClient()
    
    // 방, 채팅, 호감도 삭제
    await Promise.all([
      client.del(`room:${roomId}`),
      client.del(`chat:${roomId}`),
      client.del(`affinities:${roomId}`)
    ])
    
    return true
  } catch (error) {
    console.error('❌ 방 데이터 삭제 실패:', error.message)
    return false
  }
}