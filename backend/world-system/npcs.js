/**
 * NPC (New AI Character) 시스템
 * 맵 유형별로 다른 NPC 배치
 */

import { MAP_TYPES } from './buildings.js'

// NPC 데이터 구조
const npcSchema = {
  id: '',
  name: '',
  x: 0,
  y: 0,
  color: '',
  emoji: '',
  isAi: true,
  mapType: MAP_TYPES.DEFAULT,
  description: '',
  personality: ''  // 추가: 개인성 타입 (나중에 AI 고급 대화 시스템에서 활용)
}

// 맵 유형별 NPC 데이터
export const NPCS_BY_MAP = {
  [MAP_TYPES.DEFAULT]: [
    {
      id: 'ai-agent-1',
      name: 'AI 유리',
      x: 500,
      y: 350,
      color: '#FF6B6B',
      emoji: '🧞',
      isAi: true,
      mapType: MAP_TYPES.DEFAULT,
      description: '메인 광장의 AI 가이드',
      personality: 'friendly'
    },
    {
      id: 'ai-agent-2',
      name: 'AI 히카리',
      x: 600,
      y: 300,
      color: '#FFB347',
      emoji: '✨',
      isAi: true,
      mapType: MAP_TYPES.DEFAULT,
      description: '밝고 활발한 AI 캐릭터',
      personality: 'energetic'
    }
  ],

  [MAP_TYPES.BEACH]: [
    {
      id: 'npc-beach-1',
      name: '수영 선생님',
      x: 300,
      y: 550,
      color: '#4FC3F7',
      emoji: '🏊',
      isAi: true,
      mapType: MAP_TYPES.BEACH,
      description: '해변에서 수영을 가르쳐요',
      personality: 'responsible'
    },
    {
      id: 'npc-beach-2',
      name: '서퍼',
      x: 700,
      y: 650,
      color: '#FFB74D',
      emoji: '🏄',
      isAi: true,
      mapType: MAP_TYPES.BEACH,
      description: '파도 타기를 즐기는 서퍼',
      personality: 'adventurous'
    },
    {
      id: 'npc-beach-3',
      name: '낚꾼',
      x: 900,
      y: 580,
      color: '#8D6E63',
      emoji: '🎣',
      isAi: true,
      mapType: MAP_TYPES.BEACH,
      description: '해변에서 낚시를 즐기는 낚꾼',
      personality: 'calm'
    }
  ],

  [MAP_TYPES.FOREST]: [
    {
      id: 'npc-forest-1',
      name: '숲길 안내인',
      x: 400,
      y: 450,
      color: '#AED581',
      emoji: '🌲',
      isAi: true,
      mapType: MAP_TYPES.FOREST,
      description: '숲길을 안내해주는 안내인',
      personality: 'knowledgeable'
    },
    {
      id: 'npc-forest-2',
      name: '야생 동물',
      x: 600,
      y: 350,
      color: '#8D6E63',
      emoji: '🦊',
      isAi: true,
      mapType: MAP_TYPES.FOREST,
      description: '숲속의 사나운 여우',
      personality: 'wild'
    },
    {
      id: 'npc-forest-3',
      name: '등산객',
      x: 500,
      y: 600,
      color: '#90CAF9',
      emoji: '🥾',
      isAi: true,
      mapType: MAP_TYPES.FOREST,
      description: '숲을 탐험하는 등산객',
      personality: 'adventurous'
    }
  ],

  [MAP_TYPES.MOUNTAIN]: [
    {
      id: 'npc-mountain-1',
      name: '스키 강사',
      x: 350,
      y: 680,
      color: '#42A5F5',
      emoji: '⛷️',
      isAi: true,
      mapType: MAP_TYPES.MOUNTAIN,
      description: '스키를 가르쳐주는 강사',
      personality: 'confident'
    },
    {
      id: 'npc-mountain-2',
      name: '산악 등반가',
      x: 800,
      y: 720,
      color: '#EF5350',
      emoji: '🧗',
      isAi: true,
      mapType: MAP_TYPES.MOUNTAIN,
      description: '산 정상을 다니는 등반가',
      personality: 'determined'
    },
    {
      id: 'npc-mountain-3',
      name: '산장 주인',
      x: 600,
      y: 750,
      color: '#8D6E63',
      emoji: '🏠',
      isAi: true,
      mapType: MAP_TYPES.MOUNTAIN,
      description: '산장을 관리하는 주인',
      personality: 'hospitable'
    }
  ]
}

// 맵 유형으로 NPC 목록 가져오기
export function getNPCsByMap(mapType = MAP_TYPES.DEFAULT) {
  return NPCS_BY_MAP[mapType] || NPCS_BY_MAP[MAP_TYPES.DEFAULT]
}

// NPC ID로 NPC 찾기
export function findNPCById(npcId) {
  for (const mapType of Object.values(MAP_TYPES)) {
    const npcs = NPCS_BY_MAP[mapType]
    const npc = npcs.find(n => n.id === npcId)
    if (npc) {
      return npc
    }
  }
  return null
}

// 모든 NPC 목록 가져오기
export function getAllNPCs() {
  const allNPCs = []
  for (const mapType of Object.values(MAP_TYPES)) {
    const npcs = NPCS_BY_MAP[mapType]
    allNPCs.push(...npcs)
  }
  return allNPCs
}

// NPC 소개 텍스트 생성
export function getNPCIntroduction(npc) {
  if (!npc) {
    return ''
  }
  return `${npc.emoji} ${npc.name} - ${npc.description} (개성: ${npc.personality || '일반'})`
}