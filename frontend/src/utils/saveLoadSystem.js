/**
 * 세이브/로드 시스템
 * localStorage 기반 플레이어 데이터 저장 및 복구
 */

// 세이브 슬롯 키
const SAVE_SLOT_PREFIX = 'ai_life_save_'
const MAX_SLOTS = 3

/**
 * 세이브 데이터 구조
 */
export function createSaveData(playerData) {
  return {
    version: '1.0',
    timestamp: Date.now(),
    player: {
      id: playerData.character_id,
      name: playerData.name,
      x: playerData.x,
      y: playerData.y,
      color: playerData.color,
      emoji: playerData.emoji
    },
    inventory: playerData.inventory || [],
    quests: playerData.quests || [],
    friendshipLevels: playerData.friendshipLevels || {},
    completedQuests: playerData.completedQuests || [],
    currentRoom: playerData.currentRoom || 'main'
  }
}

/**
 * 세이브 데이터 저장
 * @param {number} slot - 슬롯 번호 (1~3)
 * @param {object} playerData - 플레이어 데이터
 * @returns {boolean} 저장 성공 여부
 */
export function saveGame(slot, playerData) {
  if (slot < 1 || slot > MAX_SLOTS) {
    console.error('Invalid save slot:', slot)
    return false
  }

  try {
    const saveData = createSaveData(playerData)
    const key = `${SAVE_SLOT_PREFIX}${slot}`
    localStorage.setItem(key, JSON.stringify(saveData))
    return true
  } catch (error) {
    console.error('Save failed:', error)
    return false
  }
}

/**
 * 세이브 데이터 로드
 * @param {number} slot - 슬롯 번호 (1~3)
 * @returns {object|null} 저장된 데이터 또는 null
 */
export function loadGame(slot) {
  if (slot < 1 || slot > MAX_SLOTS) {
    console.error('Invalid load slot:', slot)
    return null
  }

  try {
    const key = `${SAVE_SLOT_PREFIX}${slot}`
    const data = localStorage.getItem(key)

    if (!data) return null

    const saveData = JSON.parse(data)

    // 데이터 유효성 검사
    if (!validateSaveData(saveData)) {
      console.error('Invalid save data in slot', slot)
      return null
    }

    return saveData
  } catch (error) {
    console.error('Load failed:', error)
    return null
  }
}

/**
 * 세이브 데이터 유효성 검사
 * @param {object} saveData - 세이브 데이터
 * @returns {boolean} 유효 여부
 */
export function validateSaveData(saveData) {
  if (!saveData || typeof saveData !== 'object') return false
  if (!saveData.version || !saveData.timestamp) return false
  if (!saveData.player || !saveData.player.id) return false
  if (!saveData.inventory) return false
  if (!saveData.quests) return false
  if (!saveData.friendshipLevels) return false
  return true
}

/**
 * 세이브 슬롯 목록 조회
 * @returns {Array} 슬롯 정보 배열
 */
export function getSaveSlots() {
  const slots = []

  for (let i = 1; i <= MAX_SLOTS; i++) {
    const key = `${SAVE_SLOT_PREFIX}${i}`
    const data = localStorage.getItem(key)

    if (data) {
      try {
        const saveData = JSON.parse(data)
        slots.push({
          slot: i,
          exists: true,
          timestamp: saveData.timestamp,
          playerName: saveData.player?.name || 'Unknown'
        })
      } catch (error) {
        slots.push({ slot: i, exists: false })
      }
    } else {
      slots.push({ slot: i, exists: false })
    }
  }

  return slots
}

/**
 * 세이브 슬롯 삭제
 * @param {number} slot - 슬롯 번호 (1~3)
 * @returns {boolean} 삭제 성공 여부
 */
export function deleteSave(slot) {
  if (slot < 1 || slot > MAX_SLOTS) return false

  try {
    const key = `${SAVE_SLOT_PREFIX}${slot}`
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Delete save failed:', error)
    return false
  }
}

/**
 * 모든 세이브 데이터 삭제
 */
export function deleteAllSaves() {
  for (let i = 1; i <= MAX_SLOTS; i++) {
    deleteSave(i)
  }
}

/**
 * 타임스탬프를 포맷된 문자열로 변환
 * @param {number} timestamp - 타임스탬프
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatSaveTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}