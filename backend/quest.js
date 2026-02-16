const quests = {}
const playerQuests = {}

const QUEST_TEMPLATES = {
  welcome: {
    id: 'welcome',
    title: 'AI 세계에 오신 것을 환영합니다!',
    description: 'AI 유리에게 인사하고 채팅을 시작해보세요.',
    questType: 'main',
    objectives: [
      {
        id: 'greet_ai',
        description: 'AI 유리에게 인사하기',
        type: 'interact',
        targetId: 'ai-agent-1',
        requiredCount: 1,
        currentCount: 0
      }
    ],
    reward: {
      points: 100,
      experience: 50,
      items: [
        { id: 'healthPotion', quantity: 2 },
        { id: 'coin', quantity: 30 }
      ]
    },
    prerequisites: [],
    order: 1
  },
  explore_park: {
    id: 'explore_park',
    title: '공원 탐험',
    description: '공원을 방문하여 자연을 즐겨보세요.',
    questType: 'main',
    objectives: [
      {
        id: 'visit_park',
        description: '공원 방문하기',
        type: 'visit_building',
        targetId: 3,
        requiredCount: 1,
        currentCount: 0
      },
      {
        id: 'stay_park',
        description: '공원에서 30초 이상 체류하기',
        type: 'duration',
        targetId: 3,
        requiredCount: 30000,
        currentCount: 0,
        unit: 'ms'
      }
    ],
    reward: {
      points: 150,
      experience: 100,
      items: [
        { id: 'experiencePotion', quantity: 1 },
        { id: 'giftBox', quantity: 1 }
      ]
    },
    prerequisites: ['welcome'],
    order: 2
  },
  visit_cafe: {
    id: 'visit_cafe',
    title: '카페에서의 휴식',
    description: '카페를 방문하여 휴식을 취하세요.',
    questType: 'main',
    objectives: [
      {
        id: 'visit_cafe',
        description: '카페 방문하기',
        type: 'visit_building',
        targetId: 2,
        requiredCount: 1,
        currentCount: 0
      }
    ],
    reward: {
      points: 120,
      experience: 80,
      items: [
        { id: 'coin', quantity: 40 }
      ]
    },
    prerequisites: ['welcome'],
    order: 3
  },
  shop_mastery: {
    id: 'shop_mastery',
    title: '상점 마스터',
    description: '상점을 방문하고 물건을 구매하는 방법을 배우세요.',
    questType: 'main',
    objectives: [
      {
        id: 'visit_shop',
        description: '상점 방문하기',
        type: 'visit_building',
        targetId: 1,
        requiredCount: 1,
        currentCount: 0
      }
    ],
    reward: {
      points: 200,
      experience: 150,
      items: [
        { id: 'coin', quantity: 50 },
        { id: 'healthPotion', quantity: 5 }
      ]
    },
    prerequisites: ['visit_cafe'],
    order: 4
  },
  gym_training: {
    id: 'gym_training',
    title: '체육관 훈련',
    description: '체육관을 방문하여 운동하세요.',
    questType: 'side',
    objectives: [
      {
        id: 'visit_gym',
        description: '체육관 방문하기',
        type: 'visit_building',
        targetId: 5,
        requiredCount: 1,
        currentCount: 0
      }
    ],
    reward: {
      points: 180,
      experience: 120,
      items: [
        { id: 'healthPotion', quantity: 3 }
      ]
    },
    prerequisites: [],
    order: 1
  },
  library_visit: {
    id: 'library_visit',
    title: '도서관 탐색',
    description: '도서관을 방문하여 지식을 넓히세요.',
    questType: 'side',
    objectives: [
      {
        id: 'visit_library',
        description: '도서관 방문하기',
        type: 'visit_building',
        targetId: 4,
        requiredCount: 1,
        currentCount: 0
      }
    ],
    reward: {
      points: 160,
      experience: 100,
      items: [
        { id: 'experiencePotion', quantity: 2 }
      ]
    },
    prerequisites: [],
    order: 2
  }
}

export function createQuest(questTemplate) {
  const quest = {
    ...questTemplate,
    objectives: questTemplate.objectives.map(obj => ({ ...obj })),
    status: 'available',
    assignedAt: null,
    completedAt: null
  }
  
  quests[questTemplate.id] = quest
  return quest
}

export function getQuestTemplate(questId) {
  return QUEST_TEMPLATES[questId] || null
}

export function getAllQuestTemplates() {
  return { ...QUEST_TEMPLATES }
}

export function assignQuestToPlayer(characterId, questId) {
  const questTemplate = getQuestTemplate(questId)
  if (!questTemplate) {
    return { success: false, error: 'Quest template not found' }
  }

  if (!playerQuests[characterId]) {
    playerQuests[characterId] = {}
  }

  if (playerQuests[characterId][questId]) {
    return { success: false, error: 'Quest already assigned' }
  }

  const quest = createQuest(questTemplate)
  quest.status = 'progress'
  quest.assignedAt = Date.now()
  
  playerQuests[characterId][questId] = quest
  
  return { success: true, quest }
}

export function getPlayerQuests(characterId) {
  return playerQuests[characterId] ? { ...playerQuests[characterId] } : {}
}

export function getPlayerActiveQuests(characterId) {
  const allQuests = getPlayerQuests(characterId)
  return Object.fromEntries(
    Object.entries(allQuests).filter(([_, quest]) => quest.status === 'progress')
  )
}

export function getPlayerCompletedQuests(characterId) {
  const allQuests = getPlayerQuests(characterId)
  return Object.fromEntries(
    Object.entries(allQuests).filter(([_, quest]) => quest.status === 'completed')
  )
}

export function getPlayerAvailableQuests(characterId) {
  const allQuests = getPlayerQuests(characterId)
  const completedQuestIds = new Set(
    Object.values(allQuests)
      .filter(q => q.status === 'completed')
      .map(q => q.id)
  )

  const availableQuests = {}
  for (const [questId, questTemplate] of Object.entries(QUEST_TEMPLATES)) {
    if (allQuests[questId]) {
      continue
    }

    const prerequisitesMet = questTemplate.prerequisites.every(
      prereqId => completedQuestIds.has(prereqId)
    )

    if (prerequisitesMet) {
      availableQuests[questId] = createQuest(questTemplate)
    }
  }

  return availableQuests
}

export function updateQuestProgress(characterId, eventType, data) {
  const activeQuests = getPlayerActiveQuests(characterId)
  let updatedQuests = []

  for (const [questId, quest] of Object.entries(activeQuests)) {
    let questUpdated = false
    
    for (const objective of quest.objectives) {
      if (isObjectiveComplete(objective)) {
        continue
      }

      const progressMade = checkObjectiveProgress(objective, eventType, data)
      if (progressMade > 0) {
        objective.currentCount += progressMade
        questUpdated = true
        
        if (isObjectiveComplete(objective)) {
          console.log(`✅ 목표 달성: ${objective.description} (${questId})`)
        }
      }
    }

    if (questUpdated) {
      if (isQuestComplete(quest)) {
        quest.status = 'completed'
        quest.completedAt = Date.now()
        console.log(`🎉 퀘스트 완료: ${quest.title} (${characterId})`)
      }
      
      playerQuests[characterId][questId] = quest
      updatedQuests.push(quest)
    }
  }

  return updatedQuests
}

function checkObjectiveProgress(objective, eventType, data) {
  switch (objective.type) {
    case 'interact':
      if (eventType === 'interact' && data?.targetCharacterId === objective.targetId) {
        return 1
      }
      break
    
    case 'visit_building':
      if (eventType === 'enterBuilding' && data?.buildingId === objective.targetId) {
        return 1
      }
      break
    
    case 'duration':
      if (eventType === 'buildingStay' && data?.buildingId === objective.targetId) {
        return data.duration || 0
      }
      break
    
    case 'chat':
      if (eventType === 'chat' && data?.targetCharacterId === objective.targetId) {
        return 1
      }
      break
    
    case 'collect':
      if (eventType === 'collect' && data?.itemId === objective.targetId) {
        return data.quantity || 0
      }
      break
  }
  
  return 0
}

function isObjectiveComplete(objective) {
  return objective.currentCount >= objective.requiredCount
}

function isQuestComplete(quest) {
  return quest.objectives.every(obj => isObjectiveComplete(obj))
}

export function getQuestProgress(quest) {
  const completedObjectives = quest.objectives.filter(isObjectiveComplete).length
  const totalObjectives = quest.objectives.length
  
  return {
    completed: completedObjectives,
    total: totalObjectives,
    percentage: Math.round((completedObjectives / totalObjectives) * 100)
  }
}

export function completeQuest(characterId, questId) {
  if (!playerQuests[characterId]?.[questId]) {
    return { success: false, error: 'Quest not found' }
  }

  const quest = playerQuests[characterId][questId]
  
  if (!isQuestComplete(quest)) {
    return { success: false, error: 'Quest objectives not completed' }
  }

  quest.status = 'completed'
  quest.completedAt = Date.now()
  
  return { success: true, quest }
}

export function getQuestReward(questId) {
  const questTemplate = getQuestTemplate(questId)
  return questTemplate?.reward || null
}

export function initializePlayerQuests(characterId) {
  if (!playerQuests[characterId]) {
    playerQuests[characterId] = {}
    
    const welcomeQuest = assignQuestToPlayer(characterId, 'welcome')
    if (welcomeQuest.success) {
      console.log(`📋 초기 퀘스트 할당: ${welcomeQuest.quest.title} → ${characterId}`)
    }
  }
  
  return getPlayerQuests(characterId)
}

export function resetPlayerQuests(characterId) {
  delete playerQuests[characterId]
  return { success: true }
}

export function getAllPlayerQuests() {
  return playerQuests
}

// ==================== 일일 퀘스트 시스템 ====================

const DAILY_QUEST_TEMPLATES = {
  daily_coin_collector: {
    id: 'daily_coin_collector',
    title: '코인 수집가',
    description: '코인을 100개 수집하세요.',
    questType: 'daily',
    objectives: [
      {
        id: 'collect_coins',
        description: '100개 코인 수집',
        type: 'collect',
        targetId: 'coin',
        requiredCount: 100,
        currentCount: 0
      }
    ],
    reward: {
      points: 200,
      experience: 100,
      items: [
        { id: 'healthPotion', quantity: 2 },
        { id: 'experiencePotion', quantity: 1 }
      ]
    },
    prerequisites: [],
    order: 1
  },
  daily_social_butterfly: {
    id: 'daily_social_butterfly',
    title: '소셜 호랑나비',
    description: '다른 캐릭터와 5번 채팅하세요.',
    questType: 'daily',
    objectives: [
      {
        id: 'chat_count',
        description: '5번 채팅하기',
        type: 'chat',
        requiredCount: 5,
        currentCount: 0
      }
    ],
    reward: {
      points: 150,
      experience: 80,
      items: [
        { id: 'giftBox', quantity: 2 },
        { id: 'coin', quantity: 30 }
      ]
    },
    prerequisites: [],
    order: 2
  },
  daily_explorer: {
    id: 'daily_explorer',
    title: '탐험가',
    description: '3개의 다른 건물을 방문하세요.',
    questType: 'daily',
    objectives: [
      {
        id: 'visit_buildings',
        description: '3개 건물 방문',
        type: 'visit_building',
        requiredCount: 3,
        currentCount: 0
      }
    ],
    reward: {
      points: 180,
      experience: 120,
      items: [
        { id: 'coin', quantity: 50 },
        { id: 'healthPotion', quantity: 3 }
      ]
    },
    prerequisites: [],
    order: 3
  }
}

// 플레이어별 일일 퀘스트 상태
const dailyQuestState = {}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 플레이어의 오늘 일일 퀘스트 반환 (매일 0시 자동 리셋)
export function getDailyQuests(characterId) {
  // 플레이어 상태 초기화
  if (!dailyQuestState[characterId]) {
    dailyQuestState[characterId] = {
      lastResetDate: null,
      completedQuests: {},
      activeQuests: {}
    }
  }

  const state = dailyQuestState[characterId]
  const today = getTodayDate()

  // 마지막 리셋 날짜가 오늘과 다르면 리셋
  if (state.lastResetDate !== today) {
    resetDailyQuests(characterId)
  }

  // 활성 일일 퀘스트 반환
  const activeQuests = {}
  for (const [questId, questTemplate] of Object.entries(DAILY_QUEST_TEMPLATES)) {
    if (state.activeQuests[questId]) {
      activeQuests[questId] = state.activeQuests[questId]
    }
  }

  return activeQuests
}

// 자정에 일일 퀘스트 리셋
export function resetDailyQuests(characterId) {
  if (!dailyQuestState[characterId]) {
    dailyQuestState[characterId] = {
      lastResetDate: null,
      completedQuests: {},
      activeQuests: {}
    }
  }

  const state = dailyQuestState[characterId]
  const today = getTodayDate()

  // 오늘 날짜 업데이트
  state.lastResetDate = today

  // 완료된 퀘스트 기록 초기화
  state.completedQuests = {}

  // 모든 일일 퀘스트 생성
  state.activeQuests = {}
  for (const [questId, questTemplate] of Object.entries(DAILY_QUEST_TEMPLATES)) {
    const quest = createDailyQuest(questTemplate)
    state.activeQuests[questId] = quest
  }

  console.log(`🔄 일일 퀘스트 리셋: ${characterId} → ${today}`)
  return { success: true, date: today }
}

// 일일 퀘스트 생성
function createDailyQuest(questTemplate) {
  return {
    ...questTemplate,
    objectives: questTemplate.objectives.map(obj => ({ ...obj })),
    status: 'progress',
    assignedAt: Date.now(),
    completedAt: null
  }
}

// 일일 퀘스트 완료 처리
export function completeDailyQuest(characterId, questId) {
  if (!dailyQuestState[characterId]) {
    return { success: false, error: 'Player not initialized' }
  }

  const state = dailyQuestState[characterId]
  const quest = state.activeQuests[questId]

  if (!quest) {
    return { success: false, error: 'Quest not found' }
  }

  if (quest.status === 'completed') {
    return { success: false, error: 'Quest already completed' }
  }

  // 모든 목표 달성 확인
  const allComplete = quest.objectives.every(obj => obj.currentCount >= obj.requiredCount)

  if (!allComplete) {
    return { success: false, error: 'Quest objectives not completed' }
  }

  // 퀘스트 완료
  quest.status = 'completed'
  quest.completedAt = Date.now()
  state.completedQuests[questId] = quest

  console.log(`✅ 일일 퀘스트 완료: ${quest.title} → ${characterId}`)
  return { success: true, quest }
}

// 일일 퀘스트 보상
export function getDailyQuestReward(questId) {
  const questTemplate = DAILY_QUEST_TEMPLATES[questId]
  return questTemplate?.reward || null
}

// 일일 퀘스트 진행 업데이트
export function updateDailyQuestProgress(characterId, eventType, data) {
  if (!dailyQuestState[characterId]) {
    getDailyQuests(characterId) // 자동 초기화
    return []
  }

  const state = dailyQuestState[characterId]
  const today = getTodayDate()

  // 날짜가 바뀌었으면 리셋
  if (state.lastResetDate !== today) {
    resetDailyQuests(characterId)
  }

  let updatedQuests = []

  for (const [questId, quest] of Object.entries(state.activeQuests)) {
    if (quest.status === 'completed') {
      continue
    }

    let questUpdated = false

    for (const objective of quest.objectives) {
      if (objective.currentCount >= objective.requiredCount) {
        continue
      }

      const progressMade = checkDailyObjectiveProgress(objective, eventType, data)
      if (progressMade > 0) {
        objective.currentCount += progressMade
        questUpdated = true

        if (objective.currentCount >= objective.requiredCount) {
          console.log(`✅ 일일 퀘스트 목표 달성: ${objective.description} (${questId})`)
        }
      }
    }

    if (questUpdated) {
      // 모든 목표 달성 확인
      const allComplete = quest.objectives.every(obj => obj.currentCount >= obj.requiredCount)
      if (allComplete) {
        quest.status = 'completed'
        quest.completedAt = Date.now()
        state.completedQuests[questId] = quest
        console.log(`🎉 일일 퀘스트 완료: ${quest.title} → ${characterId}`)
      } else {
        state.activeQuests[questId] = quest
      }
      updatedQuests.push(quest)
    }
  }

  return updatedQuests
}

// 일일 퀘스트 목표 진행 확인
function checkDailyObjectiveProgress(objective, eventType, data) {
  switch (objective.type) {
    case 'collect':
      if (eventType === 'collect' && data?.itemId === objective.targetId) {
        return data.quantity || 0
      }
      break

    case 'chat':
      if (eventType === 'chat') {
        return 1
      }
      break

    case 'visit_building':
      if (eventType === 'enterBuilding') {
        // 이미 방문한 건물인지 확인
        const visitedBuildings = objective.visitedBuildings || []
        const buildingId = data?.buildingId

        if (buildingId && !visitedBuildings.includes(buildingId)) {
          objective.visitedBuildings = [...visitedBuildings, buildingId]
          return 1
        }
      }
      break
  }

  return 0
}

// 일일 퀘스트 템플릿 반환
export function getDailyQuestTemplate(questId) {
  return DAILY_QUEST_TEMPLATES[questId] || null
}

// 모든 일일 퀘스트 템플릿 반환
export function getAllDailyQuestTemplates() {
  return { ...DAILY_QUEST_TEMPLATES }
}