/**
 * Relationship Manager - 캐릭터 관계 시스템
 *
 * 기능:
 * - 캐릭터 간 친밀도 추적 (0~100)
 * - 관계 레벨 관리 (낯선, 지인, 친구, 좋은친구, 베프)
 * - 친밀도 변화 기록
 * - 관계 레벨별 대화 템플릿 제공
 */

// 관계 레벨 정의
const RELATIONSHIP_LEVELS = {
  STRANGER: { name: '낯선 사람', min: 0, max: 19, color: '#9E9E9E' },
  ACQUAINTANCE: { name: '지인', min: 20, max: 39, color: '#2196F3' },
  FRIEND: { name: '친구', min: 40, max: 59, color: '#4CAF50' },
  GOOD_FRIEND: { name: '좋은 친구', min: 60, max: 79, color: '#FFC107' },
  BEST_FRIEND: { name: '베프', min: 80, max: 100, color: '#F44336' }
}

// 관계 레벨별 대화 스타일 가이드
const CONVERSATION_STYLES = {
  STRANGER: '존댓말을 사용하고 정중하지만 약간 긴장감이 느껴지는 말투',
  ACQUAINTANCE: '상쾌하게 존댓말을 사용하고 가볍게 대화',
  FRIEND: '편안한 존댓말과 반말을 섞어서 사용하고 친근하게 대화',
  GOOD_FRIEND: '주로 반말을 사용하고 장난스러운 말투를 섞음',
  BEST_FRIEND: '자연스럽게 반말을 사용하고 마치 가족처럼 친밀하게 대화'
}

// 캐릭터 관계 데이터 관리
class RelationshipManager {
  constructor() {
    this.relationships = new Map() // key: 'charA-charB', value: { affinity, interactionCount, lastInteraction }
  }

  // 관계 ID 생성 (A-B 순서 보장)
  _getRelationshipId(charA, charB) {
    const sorted = [charA, charB].sort()
    return `${sorted[0]}-${sorted[1]}`
  }

  // 새 관계 초기화
  _initRelationship(charA, charB) {
    const relId = this._getRelationshipId(charA, charB)

    if (!this.relationships.has(relId)) {
      // 기본 친밀도: AI 캐릭터라면 30(지인), 플레이어는 0(낯선 사람)
      const isAi = charA.startsWith('ai') || charB.startsWith('ai')
      const initialAffinity = isAi ? 30 : 0

      this.relationships.set(relId, {
        affinity: initialAffinity,
        interactionCount: 0,
        lastInteraction: null,
        history: [] // 친밀도 변화 히스토리
      })
    }

    return this.relationships.get(relId)
  }

  // 친밀도 가져오기
  getAffinity(charA, charB) {
    const rel = this._initRelationship(charA, charB)
    return rel.affinity
  }

  // 친밀도 설정하기
  setAffinity(charA, charB, affinity) {
    const rel = this._initRelationship(charA, charB)
    const oldAffinity = rel.affinity

    // 친밀도 범위 제한 (0~100)
    rel.affinity = Math.max(0, Math.min(100, affinity))
    rel.lastInteraction = Date.now()

    // 히스토리에 기록
    if (oldAffinity !== rel.affinity) {
      rel.history.push({
        from: oldAffinity,
        to: rel.affinity,
        change: rel.affinity - oldAffinity,
        timestamp: Date.now()
      })

      // 최근 20개 히스토리만 유지
      if (rel.history.length > 20) {
        rel.history.shift()
      }
    }

    return rel
  }

  // 친밀도 증감
  changeAffinity(charA, charB, delta) {
    const rel = this._initRelationship(charA, charB)
    const newAffinity = rel.affinity + delta

    return this.setAffinity(charA, charB, newAffinity)
  }

  // 관계 레벨 가져오기
  getRelationshipLevel(charA, charB) {
    const affinity = this.getAffinity(charA, charB)

    for (const [key, level] of Object.entries(RELATIONSHIP_LEVELS)) {
      if (affinity >= level.min && affinity <= level.max) {
        return { key, ...level }
      }
    }

    return RELATIONSHIP_LEVELS.STRANGER
  }

  // 대화 스타일 가져오기
  getConversationStyle(charA, charB) {
    const level = this.getRelationshipLevel(charA, charB)
    return CONVERSATION_STYLES[level.key]
  }

  // 상호작용 횟수 증가
  incrementInteraction(charA, charB) {
    const rel = this._initRelationship(charA, charB)
    rel.interactionCount++
    rel.lastInteraction = Date.now()
    return rel
  }

  // 상호작용 횟수 가져오기
  getInteractionCount(charA, charB) {
    const rel = this._initRelationship(charA, charB)
    return rel.interactionCount
  }

  // 마지막 상호작용 시간
  getLastInteraction(charA, charB) {
    const rel = this._initRelationship(charA, charB)
    return rel.lastInteraction
  }

  // 관계 데이터 가져오기
  getRelationshipData(charA, charB) {
    return this._initRelationship(charA, charB)
  }

  // 모든 관계 데이터 가져오기
  getAllRelationships() {
    const result = []

    for (const [relId, data] of this.relationships.entries()) {
      const [charA, charB] = relId.split('-')
      result.push({
        charA,
        charB,
        ...data,
        level: this.getRelationshipLevel(charA, charB)
      })
    }

    return result
  }

  // 캐릭터의 모든 관계 가져오기
  getCharacterRelationships(characterId) {
    return this.getAllRelationships()
      .filter(rel => rel.charA === characterId || rel.charB === characterId)
      .map(rel => ({
        otherCharacter: rel.charA === characterId ? rel.charB : rel.charA,
        affinity: rel.affinity,
        level: rel.level
      }))
  }

  // 관계 초기화
  resetRelationship(charA, charB) {
    const relId = this._getRelationshipId(charA, charB)
    this.relationships.delete(relId)
  }

  // 모든 관계 초기화
  resetAll() {
    this.relationships.clear()
  }
}

// 싱글톤 인스턴스
const relationshipManager = new RelationshipManager()

export {
  RelationshipManager,
  relationshipManager,
  RELATIONSHIP_LEVELS,
  CONVERSATION_STYLES
}