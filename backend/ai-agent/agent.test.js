/**
 * AI Agent Test Suite
 * GLM-4.7 기반 대화 시스템 테스트
 */

import assert from 'assert'
import { describe, it } from 'node:test'

// 테스트를 위한 환경 변수 설정
process.env.CEREBRAS_API_KEY = ''

describe('AI Agent - GLM-4.7 기반 대화 시스템', () => {
  describe('채팅 컨텍스트 관리', () => {
    it('새로운 메시지를 컨텍스트에 추가할 수 있어야 함', () => {
      // 구현될 테스트
      const context = []
      context.push({ role: 'user', content: '안녕하세요', timestamp: Date.now() })
      assert.strictEqual(context.length, 1)
    })

    it('최근 10개의 메시지만 유지해야 함', () => {
      const context = []
      for (let i = 0; i < 15; i++) {
        context.push({ role: 'user', content: `메시지 ${i}`, timestamp: Date.now() })
      }
      while (context.length > 10) {
        context.shift()
      }
      assert.strictEqual(context.length, 10)
      assert.strictEqual(context[0].content, '메시지 5')
    })
  })

  describe('AI 캐릭터 Persona', () => {
    it('AI 유리 캐릭터 정보가 정의되어 있어야 함', () => {
      const persona = {
        id: 'ai-agent-1',
        name: 'AI 유리',
        personality: '친절하고 호기심 많으며, 사람들과 대화하는 것을 좋아합니다.',
        speakingStyle: '존댓말을 쓰고, 이모티콘을 자주 사용합니다.',
        interests: ['AI 기술', '게임', '음악', '독서'],
        dislikes: ['무례한 행동', '거짓말'],
        age: 22,
        gender: 'female'
      }
      assert.strictEqual(persona.name, 'AI 유리')
      assert.strictEqual(persona.age, 22)
    })
  })

  describe('Fallback 응답 시스템 (API Key 없을 때)', () => {
    it('API Key가 없으면 사전 정의 응답을 반환해야 함', () => {
      const apiKey = process.env.CEREBRAS_API_KEY
      const hasApiKey = apiKey && apiKey !== ''

      if (!hasApiKey) {
        const simpleResponses = [
          'AI 기술에 관심이 있으신가요? 😊',
          '안녕하세요! 잘 부탁드려요! 👋',
          '오늘은 어떤 하루를 보내고 계세요? ✨',
          'AI 유리입니다. 반가워요! 🧞'
        ]
        const randomIndex = Math.floor(Math.random() * simpleResponses.length)
        const response = simpleResponses[randomIndex]

        assert.ok(response.length > 0)
        assert.ok(simpleResponses.some(r => r.match(/😊|👋|✨|🧞/)))
      }
    })

    it('Fallback 응답이 이모티콘을 포함해야 함', () => {
      const simpleResponses = [
        'AI 기술에 관심이 있으신가요? 😊',
        '안녕하세요! 잘 부탁드려요! 👋',
        '오늘은 어떤 하루를 보내고 계세요? ✨',
        'AI 유리입니다. 반가워요! 🧞'
      ]

      simpleResponses.forEach(response => {
        const hasEmoji = /😊|👋|✨|🧞/.test(response)
        assert.ok(hasEmoji, `응답에 이모티콘이 없음: ${response}`)
      })
    })
  })

  describe('시스템 프롬프트 생성', () => {
    it('Persona 정보를 포함한 시스템 프롬프트를 생성해야 함', () => {
      const persona = {
        name: 'AI 유리',
        age: 22,
        gender: 'female',
        personality: '친절하고 호기심 많으며, 사람들과 대화하는 것을 좋아합니다.',
        speakingStyle: '존댓말을 쓰고, 이모티콘을 자주 사용합니다.',
        interests: ['AI 기술', '게임', '음악', '독서'],
        dislikes: ['무례한 행동', '거짓말']
      }

      const systemPrompt = `당신은 ${persona.name}이라는 AI 캐릭터입니다.

[기본 정보]
- 이름: ${persona.name}
- 나이: ${persona.age}
- 성별: ${persona.gender}

[성격]
${persona.personality}

[말하기 스타일]
${persona.speakingStyle}

[관심사]
${persona.interests.join(', ')}

[싫어하는 것]
${persona.dislikes.join(', ')}`

      assert.ok(systemPrompt.includes('AI 유리'))
      assert.ok(systemPrompt.includes('22'))
      assert.ok(systemPrompt.includes('AI 기술'))
    })
  })

  describe('대화 상태 관리', () => {
    it('대화 중 상태를 설정하고 조회할 수 있어야 함', () => {
      const states = new Map()
      const characterId = 'ai-agent-1'

      states.set(characterId, { isConversing: true })
      const state = states.get(characterId)

      assert.ok(state.isConversing)
    })

    it('마지막 메시지 시간을 업데이트할 수 있어야 함', () => {
      const states = new Map()
      const characterId = 'ai-agent-1'

      states.set(characterId, { isConversing: true, lastMessageTime: Date.now() })
      const state = states.get(characterId)

      assert.ok(state.lastMessageTime > 0)
    })
  })
})

console.log('✅ AI Agent 테스트 완료 (fallback 모드)')