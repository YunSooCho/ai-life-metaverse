/**
 * 맵 시스템
 * 다양한 맵 유형과 크기, 배경 설정
 */

import { MAP_TYPES } from './buildings.js'

// 맵 데이터 구조
export const MAPS = {
  [MAP_TYPES.DEFAULT]: {
    id: MAP_TYPES.DEFAULT,
    name: '메인 광장',
    width: 1000,
    height: 700,
    backgroundColor: '#F5F5F5',
    groundColor: '#E0E0E0',
    description: 'AI Life Metaverse의 중심 광장',
    features: [
      { type: 'pavement', x: 300, y: 300, width: 400, height: 100, color: '#D5D5D5' },
      { type: 'decorative_tree', x: 200, y: 300, color: '#4CAF50' },
      { type: 'decorative_tree', x: 800, y: 300, color: '#4CAF50' },
      { type: 'fountain', x: 500, y: 350, radius: 30, color: '#2196F3' }
    ],
    weather: { type: 'sunny', temperature: 22 }
  },

  [MAP_TYPES.BEACH]: {
    id: MAP_TYPES.BEACH,
    name: '해변',
    width: 1200,
    height: 800,
    backgroundColor: '#E3F2FD',
    groundColor: '#F5F5F5',
    description: '푸른 바다와 모래사장이 펼쳐진 해변',
    features: [
      { type: 'sand', x: 0, y: 400, width: 1200, height: 400, color: '#F5F5DC' },
      { type: 'sea', x: 0, y: 0, width: 1200, height: 400, color: '#2196F3' },
      { type: 'wave', x: 0, y: 380, width: 1200, height: 20, color: '#64B5F6' },
      { type: 'umbrella', x: 200, y: 450, color: '#FF6B6B' },
      { type: 'umbrella', x: 600, y: 520, color: '#4ECDC4' },
      { type: 'palm_tree', x: 1000, y: 420, color: '#4CAF50' }
    ],
    weather: { type: 'sunny', temperature: 28 }
  },

  [MAP_TYPES.FOREST]: {
    id: MAP_TYPES.FOREST,
    name: '숲',
    width: 1100,
    height: 750,
    backgroundColor: '#C8E6C9',
    groundColor: '#A5D6A7',
    description: '용창한 나무들이 빽빽한 숲',
    features: [
      { type: 'tree_cluster', x: 100, y: 100, count: 5, color: '#388E3C' },
      { type: 'tree_cluster', x: 500, y: 150, count: 4, color: '#4CAF50' },
      { type: 'tree_cluster', x: 900, y: 100, count: 6, color: '#2E7D32' },
      { type: 'stream', x: 0, y: 350, width: 1100, height: 40, color: '#81D4FA' },
      { type: 'tree_cluster', x: 150, y: 500, count: 7, color: '#388E3C' },
      { type: 'tree_cluster', x: 800, y: 550, count: 5, color: '#4CAF50' },
      { type: 'fireflies', x: 550, y: 450, count: 10, color: '#FFEB3B' }
    ],
    weather: { type: 'cloudy', temperature: 20 }
  },

  [MAP_TYPES.MOUNTAIN]: {
    id: MAP_TYPES.MOUNTAIN,
    name: '산맥',
    width: 1300,
    height: 900,
    backgroundColor: '#B0BEC5',
    groundColor: '#90A4AE',
    description: '눈 덮인 산맥과 웅장한 풍경',
    features: [
      { type: 'mountain_peak', x: 650, y: 450, height: 400, width: 300, color: '#CFD8DC' },
      { type: 'snow', x: 650, y: 370, height: 200, width: 150, color: '#FFFFFF' },
      { type: 'mountain_base', x: 300, y: 650, height: 200, width: 700, color: '#B0BEC5' },
      { type: 'pine_tree', x: 100, y: 550, color: '#2E7D32' },
      { type: 'pine_tree', x: 1200, y: 520, color: '#388E3C' },
      { type: 'pine_tree', x: 450, y: 680, color: '#4CAF50' },
      { type: 'pine_tree', x: 850, y: 700, color: '#388E3C' },
      { type: 'cloud', x: 200, y: 100, color: '#FFFFFF' },
      { type: 'cloud', x: 1000, y: 150, color: '#FFFFFF' }
    ],
    weather: { type: 'snowy', temperature: -5 }
  }
}

// 맵 ID로 맵 가져오기
export function getMap(mapId = MAP_TYPES.DEFAULT) {
  return MAPS[mapId] || MAPS[MAP_TYPES.DEFAULT]
}

// 모든 맵 목록 가져오기
export function getAllMaps() {
  return Object.values(MAPS)
}

// 맵 존재 여부 확인
export function mapExists(mapId) {
  return MAPS[mapId] !== undefined
}

// 맵 기능 렌더링 데이터 생성
export function getMapFeaturesForRendering(mapId) {
  const map = getMap(mapId)
  if (!map || map.id === MAP_TYPES.DEFAULT && mapId !== MAP_TYPES.DEFAULT) {
    return []
  }
  return map.features || []
}