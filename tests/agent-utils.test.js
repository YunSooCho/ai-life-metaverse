import { describe, it, expect } from 'vitest'

// 테스트할 함수들 (agent.js에서 복사)
function getAffinityChange(interactionType) {
  const affinityMap = {
    'greet': 5,
    'gift': 15,
    'befriend': 10,
    'fight': -20,
    'wave': 3,
    'dance': 8,
    'hug': 12,
    'high_five': 5
  }
  return affinityMap[interactionType] || 0
}

function getInteractionPrompt(interactionType, sourceName, affinity) {
  const basePrompt = `너는 AI 유리라는 매트버스 캐릭터다.

페르소나: 친근하고 호기심 많은 24세 여성. 책 읽기 좋아하고 도시 탐험 즐김. 유머러스하고 철학적인 생각을 하는 경향이 있음.
말투: 반말 쓰레기 같이 하지 않고, 자연스러운 친구 말투. 이모티콘 적절히 사용. 1~2문장 간결하게.
관심사: 독서, 음악, 커피, 도시 탐험, 철학

${sourceName}와 호감도: ${affinity}/100
${affinity > 70 ? '(아주 친한 친구)' : affinity > 50 ? '(친구)' : affinity > 30 ? '(아는 사이)' : '(낯선 사람)'}

`

  const interactionPrompts = {
    'greet': basePrompt + `${sourceName}가 인사를 했어. 친근하게 반갑게 응답해줘. 1~2문장 간결하게.`,
    'gift': basePrompt + `${sourceName}가 선물을 줬어! 정말 감격스럽게 응답해줘. 이모티콘 활용. 1~2문장.`,
    'befriend': basePrompt + `${sourceName}가 친구가 되자고 했어. 호감도 높은 편이라 반가워해! 1~2문장.`,
    'fight': basePrompt + `${sourceName}가 싸움을 걸어왔어. 서운하고 슬픈 표정으로 응답해줘. 1~2문장.`,
    'wave': basePrompt + `${sourceName}가 손을 흔들었어. 간단하게 인사해줘. 1문장.`,
    'dance': basePrompt + `${sourceName}와 함께 춤을 추자고 했어. 신나게 응답해줘. 1~2문장.`,
    'hug': basePrompt + `${sourceName}가 껴안았어. 아주 행복하게 응답해줘. 1~2문장.`,
    'high_five': basePrompt + `${sourceName}가 하이파이브 했어. 신나게 응답해줘. 1~2문장.`
  }

  return interactionPrompts[interactionType] || interactionPrompts['greet']
}

describe('Agent 유틸리티 함수', () => {
  describe('getAffinityChange', () => {
    it('각 인터랙션 타입별 올바른 호감도 변화 반환', () => {
      expect(getAffinityChange('greet')).toBe(5)
      expect(getAffinityChange('gift')).toBe(15)
      expect(getAffinityChange('befriend')).toBe(10)
      expect(getAffinityChange('fight')).toBe(-20)
      expect(getAffinityChange('wave')).toBe(3)
      expect(getAffinityChange('dance')).toBe(8)
      expect(getAffinityChange('hug')).toBe(12)
      expect(getAffinityChange('high_five')).toBe(5)
    })

    it('알 수 없는 인터랙션 타입은 0 반환', () => {
      expect(getAffinityChange('unknown')).toBe(0)
    })
  })

  describe('getInteractionPrompt', () => {
    it('호감도에 따른 관계 표시 변경', () => {
      const stranger = getInteractionPrompt('greet', 'User1', 20)
      const acquaintance = getInteractionPrompt('greet', 'User1', 40)
      const friend = getInteractionPrompt('greet', 'User1', 60)
      const bestFriend = getInteractionPrompt('greet', 'User1', 80)

      expect(stranger).toContain('(낯선 사람)')
      expect(acquaintance).toContain('(아는 사이)')
      expect(friend).toContain('(친구)')
      expect(bestFriend).toContain('(아주 친한 친구)')
    })

    it('기본 프롬프트 구조 포함해야 함', () => {
      const prompt = getInteractionPrompt('greet', 'User1', 50)

      expect(prompt).toContain('AI 유리라는 매트버스 캐릭터다')
      expect(prompt).toContain('호감도: 50/100')
      expect(prompt).toContain('(아는 사이)') // 50점은 (아는 사이)임
    })

    it('각 인터랙션 타입별 다른 프롬프트 생성', () => {
      const greet = getInteractionPrompt('greet', 'User1', 50)
      const gift = getInteractionPrompt('gift', 'User1', 50)
      const fight = getInteractionPrompt('fight', 'User1', 50)

      expect(greet).toContain('인사를 했어')
      expect(gift).toContain('선물을 줬어')
      expect(fight).toContain('싸움을 걸어왔어')
    })

    it('알 수 없는 인터랙션 타입은 greet으로 대체', () => {
      const unknown = getInteractionPrompt('unknown', 'User1', 50)
      const greet = getInteractionPrompt('greet', 'User1', 50)

      expect(unknown).toContain('인사를 했어')
      expect(unknown).toBe(greet)
    })
  })
})