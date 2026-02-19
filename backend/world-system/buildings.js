/**
 * 건물 데이터 시스템
 * 맵 유형별로 다른 건물 목록 제공
 */

// 맵 유형 상수
export const MAP_TYPES = {
  DEFAULT: 'default',      // 기본 맵 (현재 메인)
  BEACH: 'beach',          // 해변 맵
  FOREST: 'forest',        // 숲 맵
  MOUNTAIN: 'mountain'     // 산맥 맵
}

// 건물 기본 데이터 구조
const buildingSchema = {
  id: 0,
  name: '',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  type: '',
  color: '',
  mapType: MAP_TYPES.DEFAULT
}

// 맵 유형별 건물 데이터
export const BUILDINGS_BY_MAP = {
  [MAP_TYPES.DEFAULT]: [
    {
      id: 1,
      name: '상점',
      x: 150,
      y: 150,
      width: 120,
      height: 100,
      type: 'shop',
      color: '#4CAF50',
      mapType: MAP_TYPES.DEFAULT,
      description: '기본 아이템을 판매하는 상점'
    },
    {
      id: 2,
      name: '카페',
      x: 700,
      y: 150,
      width: 120,
      height: 100,
      type: 'cafe',
      color: '#FF9800',
      mapType: MAP_TYPES.DEFAULT,
      description: '편안한 분위기의 카페'
    },
    {
      id: 3,
      name: '공원',
      x: 400,
      y: 500,
      width: 200,
      height: 150,
      type: 'park',
      color: '#8BC34A',
      mapType: MAP_TYPES.DEFAULT,
      description: '휴식을 취할 수 있는 공원'
    },
    {
      id: 4,
      name: '도서관',
      x: 100,
      y: 450,
      width: 150,
      height: 120,
      type: 'library',
      color: '#2196F3',
      mapType: MAP_TYPES.DEFAULT,
      description: '책을 읽을 수 있는 도서관'
    },
    {
      id: 5,
      name: '체육관',
      x: 750,
      y: 450,
      width: 150,
      height: 120,
      type: 'gym',
      color: '#F44336',
      mapType: MAP_TYPES.DEFAULT,
      description: '운동을 위한 체육관'
    }
  ],

  [MAP_TYPES.BEACH]: [
    {
      id: 101,
      name: '해변 카페',
      x: 150,
      y: 150,
      width: 120,
      height: 100,
      type: 'cafe',
      color: '#FFB74D',
      mapType: MAP_TYPES.BEACH,
      description: '바다를 내려다보는 해변 카페'
    },
    {
      id: 102,
      name: '서핑 샵',
      x: 700,
      y: 150,
      width: 120,
      height: 100,
      type: 'shop',
      color: '#29B6F6',
      mapType: MAP_TYPES.BEACH,
      description: '서핑 용품을 판매하는 샵'
    },
    {
      id: 103,
      name: '낚시터',
      x: 400,
      y: 500,
      width: 200,
      height: 120,
      type: 'fishing',
      color: '#66BB6A',
      mapType: MAP_TYPES.BEACH,
      description: '낚시를 즐길 수 있는 낚시터'
    }
  ],

  [MAP_TYPES.FOREST]: [
    {
      id: 201,
      name: '숲길 카페',
      x: 150,
      y: 150,
      width: 120,
      height: 100,
      type: 'cafe',
      color: '#8BC34A',
      mapType: MAP_TYPES.FOREST,
      description: '숲길 옆의 아늑한 카페'
    },
    {
      id: 202,
      name: '오두막',
      x: 700,
      y: 150,
      width: 100,
      height: 100,
      type: 'cabin',
      color: '#795548',
      mapType: MAP_TYPES.FOREST,
      description: '숲속의 캠핑 오두막'
    },
    {
      id: 203,
      name: '야영장',
      x: 400,
      y: 500,
      width: 250,
      height: 150,
      type: 'campground',
      color: '#9E9E9E',
      mapType: MAP_TYPES.FOREST,
      description: '야영을 즐길 수 있는 야영장'
    }
  ],

  [MAP_TYPES.MOUNTAIN]: [
    {
      id: 301,
      name: '산장 스키장',
      x: 150,
      y: 150,
      width: 150,
      height: 120,
      type: 'ski-resort',
      color: '#42A5F5',
      mapType: MAP_TYPES.MOUNTAIN,
      description: '스키를 즐길 수 있는 산장 스키장'
    },
    {
      id: 302,
      name: '산악 훈련장',
      x: 700,
      y: 150,
      width: 120,
      height: 120,
      type: 'gym',
      color: '#EF5350',
      mapType: MAP_TYPES.MOUNTAIN,
      description: '산악 훈련을 위한 훈련장'
    },
    {
      id: 303,
      name: '꼭대기 전망대',
      x: 400,
      y: 450,
      width: 120,
      height: 100,
      type: 'viewpoint',
      color: '#FFA726',
      mapType: MAP_TYPES.MOUNTAIN,
      description: '산 정상에서의 전망대'
    }
  ]
}

// 맵 유형으로 건물 목록 가져오기
export function getBuildingsByMap(mapType = MAP_TYPES.DEFAULT) {
  return BUILDINGS_BY_MAP[mapType] || BUILDINGS_BY_MAP[MAP_TYPES.DEFAULT]
}

// 건물 ID로 건물 찾기
export function findBuildingById(buildingId) {
  for (const mapType of Object.values(MAP_TYPES)) {
    const buildings = BUILDINGS_BY_MAP[mapType]
    const building = buildings.find(b => b.id === buildingId)
    if (building) {
      return building
    }
  }
  return null
}

// 모든 건물 목록 가져오기
export function getAllBuildings() {
  const allBuildings = []
  for (const mapType of Object.values(MAP_TYPES)) {
    const buildings = BUILDINGS_BY_MAP[mapType]
    allBuildings.push(...buildings)
  }
  return allBuildings
}