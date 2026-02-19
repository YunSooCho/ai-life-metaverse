/**
 * 월드 시스템 메인 모듈
 * 맵, 건물, NPC 시스템 통합
 */

import { getAllMaps as _getAllMaps, getMap as _getMap } from './maps.js'
import { getAllBuildings as _getAllBuildings, getBuildingsByMap as _getBuildingsByMap } from './buildings.js'
import { getAllNPCs as _getAllNPCs, getNPCsByMap as _getNPCsByMap } from './npcs.js'

export { MAP_TYPES, BUILDINGS_BY_MAP, getBuildingsByMap, findBuildingById, getAllBuildings } from './buildings.js'
export { MAPS, getMap, getAllMaps, mapExists, getMapFeaturesForRendering } from './maps.js'
export { NPCS_BY_MAP, getNPCsByMap, findNPCById, getAllNPCs, getNPCIntroduction } from './npcs.js'

// 월드 시스템 초기화 함수
export function initializeWorldSystem() {
  console.log('🌍 월드 시스템 초기화 중...')

  const allMaps = _getAllMaps()
  const allBuildings = _getAllBuildings()
  const allNPCs = _getAllNPCs()

  console.log(`✅ 맵 데이터 로드 완료: ${allMaps.length}개 맵`)
  console.log(`✅ 건물 데이터 로드 완료: ${allBuildings.length}개 건물`)
  console.log(`✅ NPC 데이터 로드 완료: ${allNPCs.length}개 NPC`)

  return {
    maps: allMaps,
    buildings: allBuildings,
    npcs: allNPCs
  }
}

// 맵 단위 완전 데이터 가져오기 (맵 + 건물 + NPC)
export function getMapCompleteData(mapId) {
  const map = _getMap(mapId)
  const buildings = _getBuildingsByMap(mapId)
  const npcs = _getNPCsByMap(mapId)

  return {
    map,
    buildings,
    npcs
  }
}