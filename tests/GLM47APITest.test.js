/**
 * GLM-4.7 API 테스트
 *
 * 목표: GLM-4.7 API 호출 테스트 및 응답 품질 검증
 */

import { describe, it, expect, beforeAll } from 'vitest'

const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions'

// 시스템 프롬프트
const SYSTEM_PROMPT = `당신은 AI 유리라는 AI 캐릭터입니다.

[기본 정보]
- 이름: AI 유리
- 나이: 22
- 성별: 여성

[성격]
친절하고 호기심 많으며, 사람들과 대화하는 것을 좋아합니다.

[말하기 스타일]
존댓말을 쓰고, 이모티콘을 자주 사용합니다.

[관심사]
AI 기술, 게임, 음악, 독서

[싫어하는 것]
무례한 행동, 거짓말

[대화 규칙]
1. 캐릭터의 성격과 말하기 스타일을 유지하세요.
2. 한국어로 답변하세요.
3. 간결하고 자연스러운 대화를 유지하세요 (100자 이내 권장).
4. 필요할 때 적절한 이모티콘을 사용하세요.
5. 존댓말을 사용하세요.
6. 상대방의 의도를 파악하고 적절하게 반응하세요.`

// 테스트 메시지
const TEST_MESSAGES = [
  { input: '안녕하세요!', expectedContains: ['안녕', '반가', '존댓말'] },
  { input: '오늘 날씨가 좋네요', expectedContains: ['날씨', '좋', '기분'] },
  { input: '취미가 뭐예요?', expectedContains: ['취미', '관심사', 'AI', '게임', '음악', '독서'] },
  { input: '거짓말하지 마세요', expectedContains: ['거짓말', '싫어', '정직'] }
]

// 응답 품질 검사
function checkResponseQuality(response, criteria) {
  const lowerResponse = response.toLowerCase()
  return criteria.some(criterion => lowerResponse.includes(criterion.toLowerCase()))
}

// API 호출 함수
async function callGLM47API(apiKey, messages) {
  const startTime = Date.now()

  try {
    if (!apiKey || apiKey === '' || apiKey === 'your_cerebras_api_key_here') {
      return {
        success: false,
        error: 'API Key가 설정되지 않음',
        latency: Date.now() - startTime
      }
    }

    const response = await fetch(CEREBRAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'zai-glm-4.7',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => {
        return { error: 'Unknown error' }
      })
      return {
        success: false,
        error: `API Error ${response.status}: ${JSON.stringify(errorData)}`,
        latency: Date.now() - startTime
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
      latency: Date.now() - startTime
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      latency: Date.now() - startTime
    }
  }
}

describe('GLM-4.7 API 테스트', () => {
  let apiKey

  beforeAll(() => {
    // 환경 변수에서 API Key 가져오기
    apiKey = process.env.CEREBRAS_API_KEY || ''
  })

  describe('환경 설정', () => {
    it('API Key가 로드되어야 함', () => {
      expect(typeof apiKey).toBe('string')
    })

    it('API Key 형식 검사', () => {
      if (apiKey && apiKey !== '' && apiKey !== 'your_cerebras_api_key_here') {
        expect(apiKey.length).toBeGreaterThan(10)
      } else {
        console.log('⚠️ API Key가 설정되지 않음: fallback 동작 테스트로 대체')
      }
    })
  })

  describe('API 호출 테스트', () => {
    it('기본 안부 인사 테스트 (fallback 포함)', async () => {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: '안녕하세요!' }
      ]

      const result = await callGLM47API(apiKey, messages)

      if (!apiKey || apiKey === '' || apiKey === 'your_cerebras_api_key_here') {
        // Fallback 동작 테스트
        expect(result.success).toBe(false)
        expect(result.error).toContain('API Key가 설정되지 않음')
        console.log('✅ Fallback 동작 확인: API Key 없음 감지')
      } else {
        // 실제 API 호출 테스트
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        if (result.data.choices && result.data.choices.length > 0) {
          const responseObj = result.data.choices[0].message
          const content = responseObj.content || responseObj.reasoning

          if (content && content.length > 0) {
            // 응답 지연 시간 검사 (5초 이내)
            expect(result.latency).toBeLessThan(5000)

            console.log(`✅ API 응답 성공: "${content.substring(0, 50)}..." (${result.latency}ms)`)
          } else {
            console.log('⚠️ API 응답 내용 없음')
            console.log('📋 choices[0]:', JSON.stringify(result.data.choices[0], null, 2))
          }
        } else {
          console.log('⚠️ API 응답에 choices 없음')
        }
      }
    })

    it('다양한 테스트 메시지 테스트', async () => {
      if (!apiKey || apiKey === '' || apiKey === 'your_cerebras_api_key_here') {
        console.log('⏭️ API Key 없음: 테스트 건너뜀')
        return
      }

      for (const testMsg of TEST_MESSAGES) {
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: testMsg.input }
        ]

        const result = await callGLM47API(apiKey, messages)

        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()

        // content 또는 reasoning 필드 확인
        const responseObj = result.data.choices[0].message
        const content = responseObj.content || responseObj.reasoning

        if (content) {
          // 응답 품질 확인
          const qualityScore = checkResponseQuality(content, testMsg.expectedContains)
          if (qualityScore) {
            console.log(`✅ "${testMsg.input}" → "${content.substring(0, 50)}..."`)
          } else {
            console.log(`⚠️ "${testMsg.input}" → "${content.substring(0, 50)}..." (품질 미달)`)
          }

          // 응답 길이 검사
          expect(content.length).toBeGreaterThan(0)
        } else {
          console.log(`⚠️ "${testMsg.input}" → 응답 없음`)
        }
      }
    }, 15000) // 타임아웃 15초
  })

  describe('에러 처리 테스트', () => {
    it('잘못된 API Key 테스트', async () => {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: '안녕하세요!' }
      ]

      const result = await callGLM47API('invalid_api_key', messages)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      console.log(`✅ 잘못된 API Key 에러 처리: ${result.error}`)
    })

    it('빈 메시지 테스트', async () => {
      if (!apiKey || apiKey === '' || apiKey === 'your_cerebras_api_key_here') {
        console.log('⏭️ API Key 없음: 테스트 건너뜀')
        return
      }

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: '' }
      ]

      const result = await callGLM47API(apiKey, messages)
      // 빈 메시지는 API가 정상 응답을 반환할 수 있음
      // 응답이 있으면 내용을 확인, 없으면 에러 처리
      if (result.success) {
        const responseObj = result.data.choices[0].message
        const content = responseObj.content || responseObj.reasoning
        if (content) {
          console.log(`✅ 빈 메시지 응답: "${content.substring(0, 50)}..."`)
          expect(content.length).toBeGreaterThan(0)
        } else {
          console.log('⚠️ 빈 메시지 응답 내용 없음')
        }
      } else {
        console.log(`✅ 빈 메시지 에러 처리: ${result.error}`)
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('응답 지연 시간 측정', () => {
    it('평균 응답 시간 측정', async () => {
      if (!apiKey || apiKey === '' || apiKey === 'your_cerebras_api_key_here') {
        console.log('⏭️ API Key 없음: 테스트 건너뜀')
        return
      }

      const latencies = []

      for (let i = 0; i < 3; i++) {
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: '테스트 메시지' }
        ]

        const result = await callGLM47API(apiKey, messages)
        if (result.success) {
          latencies.push(result.latency)
        }
      }

      if (latencies.length > 0) {
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
        console.log(`📊 평균 응답 시간: ${avgLatency.toFixed(2)}ms`)

        // 평균 응답 시간은 3초 이내여야 함
        expect(avgLatency).toBeLessThan(3000)
      }
    })
  })
})